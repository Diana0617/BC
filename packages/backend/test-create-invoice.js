const { sequelize, SupplierInvoice, Supplier, Product, InventoryMovement } = require('./src/models');

async function testInvoiceCreation() {
  const transaction = await sequelize.transaction();
  
  try {
    const businessId = 'b1effc61-cd62-45fc-a942-8eb8c144a721';
    const userId = 'cd6660d5-8cf1-409f-acea-d54f5f073775'; // Del token JWT
    
    console.log('Ì∑™ Probando creaci√≥n de factura...');
    console.log('BusinessId:', businessId);
    console.log('UserId:', userId);
    
    // 1. Crear proveedor de prueba
    console.log('\nÌ≥¶ 1. Creando proveedor...');
    const supplier = await Supplier.create({
      businessId,
      name: 'Proveedor Test',
      email: 'test@test.com',
      phone: '1234567890',
      taxId: '123456789',
      status: 'ACTIVE'
    }, { transaction });
    console.log('‚úÖ Proveedor creado:', supplier.id);
    
    // 2. Crear producto de prueba
    console.log('\nÌ≥¶ 2. Creando producto...');
    const product = await Product.create({
      businessId,
      name: 'Producto Test',
      sku: 'TEST-SKU',
      category: 'Test',
      brand: 'Test',
      price: 19500,
      cost: 15000,
      unit: 'unidad',
      trackInventory: true,
      isActive: true,
      currentStock: 0,
      images: [{
        main: {
          url: 'https://example.com/image.jpg',
          width: 800,
          height: 800
        }
      }]
    }, { transaction });
    console.log('‚úÖ Producto creado:', product.id);
    
    // 3. Crear factura
    console.log('\nÌ≥¶ 3. Creando factura...');
    const invoice = await SupplierInvoice.create({
      businessId,
      supplierId: supplier.id,
      invoiceNumber: 'TEST-' + Date.now(),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [{
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 10,
        unitCost: 15000,
        total: 150000
      }],
      subtotal: 150000,
      tax: 0,
      total: 150000,
      currency: 'COP',
      status: 'PENDING',
      paidAmount: 0,
      remainingAmount: 150000
    }, { transaction });
    console.log('‚úÖ Factura creada:', invoice.id);
    
    // 4. Crear movimiento de inventario
    console.log('\nÌ≥¶ 4. Creando movimiento de inventario...');
    const movement = await InventoryMovement.create({
      businessId,
      productId: product.id,
      userId,
      movementType: 'PURCHASE',
      quantity: 10,
      unitCost: 15000,
      totalCost: 150000,
      previousStock: 0,
      newStock: 10,
      reason: 'Test',
      referenceId: invoice.id,
      referenceType: 'SUPPLIER_INVOICE'
    }, { transaction });
    console.log('‚úÖ Movimiento creado:', movement.id);
    
    // 5. Actualizar stock
    console.log('\nÌ≥¶ 5. Actualizando stock...');
    await product.update({ currentStock: 10 }, { transaction });
    console.log('‚úÖ Stock actualizado');
    
    await transaction.rollback(); // No guardar cambios
    console.log('\n‚úÖ PRUEBA EXITOSA - Todos los modelos funcionan correctamente');
    console.log('‚ùå El error 500 debe ser por otro motivo');
    
  } catch (error) {
    await transaction.rollback();
    console.error('\n‚ùå ERROR en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testInvoiceCreation();
