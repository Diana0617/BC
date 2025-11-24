const request = require('supertest');
const app = require('../../src/app'); // Adjust path as needed
const { User, Business, Product, sequelize } = require('../../src/models');
const AuthController = require('../../src/controllers/AuthController');
const { v4: uuidv4 } = require('uuid');

describe('Tenant Isolation Verification', () => {
  let businessA, businessB;
  let userA, userB;
  let tokenA, tokenB;
  let productA, productB;

  beforeAll(async () => {
    // Ensure DB is synced (be careful with this in prod/dev envs)
    // await sequelize.sync({ force: true }); 
    
    // Create Business A
    businessA = await Business.create({
      id: uuidv4(),
      name: 'Business A',
      email: 'businessA@test.com',
      status: 'ACTIVE'
    });

    // Create Business B
    businessB = await Business.create({
      id: uuidv4(),
      name: 'Business B',
      email: 'businessB@test.com',
      status: 'ACTIVE'
    });

    // Create User A (Owner of Business A)
    userA = await User.create({
      id: uuidv4(),
      email: 'userA@test.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'TestA',
      role: 'OWNER', // Or ADMIN depending on role logic
      businessId: businessA.id,
      status: 'ACTIVE'
    });

    // Create User B (Owner of Business B)
    userB = await User.create({
      id: uuidv4(),
      email: 'userB@test.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'TestB',
      role: 'OWNER',
      businessId: businessB.id,
      status: 'ACTIVE'
    });

    // Generate Tokens
    tokenA = AuthController.generateTokens(userA).accessToken;
    tokenB = AuthController.generateTokens(userB).accessToken;

    // Create Product for Business A
    productA = await Product.create({
      id: uuidv4(),
      name: 'Product A',
      price: 100,
      businessId: businessA.id,
      isActive: true
    });

    // Create Product for Business B
    productB = await Product.create({
      id: uuidv4(),
      name: 'Product B',
      price: 200,
      businessId: businessB.id,
      isActive: true
    });
  });

  afterAll(async () => {
    // Cleanup
    await Product.destroy({ where: { id: [productA.id, productB.id] } });
    await User.destroy({ where: { id: [userA.id, userB.id] } });
    await Business.destroy({ where: { id: [businessA.id, businessB.id] } });
    await sequelize.close();
  });

  test('User A should see Product A', async () => {
    const res = await request(app)
      .get(`/api/business/${businessA.id}/products`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toEqual(200);
    const productIds = res.body.data.map(p => p.id);
    expect(productIds).toContain(productA.id);
    expect(productIds).not.toContain(productB.id);
  });

  test('User B should see Product B', async () => {
    const res = await request(app)
      .get(`/api/business/${businessB.id}/products`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.statusCode).toEqual(200);
    const productIds = res.body.data.map(p => p.id);
    expect(productIds).toContain(productB.id);
    expect(productIds).not.toContain(productA.id);
  });

  test('User A should NOT be able to access Product B via their own endpoint', async () => {
    const res = await request(app)
      .get(`/api/business/${businessA.id}/products/${productB.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    // Should return 404 because Product B does not belong to Business A
    expect(res.statusCode).toEqual(404);
  });

  test('User A should NOT be able to access Product B via Business B endpoint', async () => {
    const res = await request(app)
      .get(`/api/business/${businessB.id}/products/${productB.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    // Should return 403 (Forbidden) because User A does not have access to Business B
    // Or 404 if the middleware hides existence
    expect([403, 404, 401]).toContain(res.statusCode);
  });
});
