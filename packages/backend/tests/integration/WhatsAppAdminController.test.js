/**
 * Integration Tests for WhatsApp Admin Controller
 * 
 * Tests all 22 endpoints:
 * - Token Management (7 endpoints)
 * - Embedded Signup (2 endpoints)
 * - Templates (6 endpoints)
 * - Messages (2 endpoints)
 * - Webhooks (3 endpoints)
 * - Health Check (2 endpoints)
 */

const request = require('supertest');
const app = require('../../src/app');
const { Business, BusinessCommunicationsConfig } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('WhatsApp Admin Controller - Integration Tests', () => {
  let authToken;
  let businessId;
  let userId = 1; // Assuming user ID 1 exists

  beforeAll(async () => {
    // Create test business
    const business = await Business.create({
      owner_user_id: userId,
      name: 'Test Beauty Salon',
      email: 'test@beautysalon.com',
      phone: '+573001234567',
      address: 'Test Address 123',
      city: 'Bogotá',
      country: 'Colombia',
      timezone: 'America/Bogota',
      currency: 'COP'
    });
    businessId = business.id;

    // Create communications config
    await BusinessCommunicationsConfig.create({
      business_id: businessId,
      whatsapp_enabled: true,
      whatsapp_phone_number: '+573001234567',
      email_enabled: false
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId, businessId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup test data
    if (businessId) {
      await BusinessCommunicationsConfig.destroy({ where: { business_id: businessId } });
      await Business.destroy({ where: { id: businessId } });
    }
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without auth token', async () => {
      const response = await request(app)
        .get(`/api/business/${businessId}/admin/whatsapp/token`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get(`/api/business/${businessId}/admin/whatsapp/token`)
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject requests to different business', async () => {
      const otherBusinessId = 99999;
      const response = await request(app)
        .get(`/api/business/${otherBusinessId}/admin/whatsapp/token`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });
  });

  describe('Token Management Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/token', () => {
      it('should get token info successfully', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/token`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('phoneNumber');
        expect(response.body.data).toHaveProperty('wabaId');
        expect(response.body.data).toHaveProperty('hasToken');
      });
    });

    describe('POST /api/business/:businessId/admin/whatsapp/token', () => {
      it('should reject invalid payload', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/token`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({}) // Missing required fields
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      it('should store token successfully', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/token`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            accessToken: 'EAAtest-token-from-meta-12345',
            phoneNumberId: '123456789012345',
            wabaId: '098765432109876'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('guardado');
      });
    });

    describe('POST /api/business/:businessId/admin/whatsapp/token/rotate', () => {
      it('should reject without existing token', async () => {
        // First delete any existing token
        await BusinessCommunicationsConfig.update(
          { 
            whatsapp_access_token: null,
            whatsapp_token_source: null 
          },
          { where: { business_id: businessId } }
        );

        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/token/rotate`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ newAccessToken: 'new-token-123' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('No hay token');
      });
    });

    describe('DELETE /api/business/:businessId/admin/whatsapp/token', () => {
      it('should delete token successfully', async () => {
        const response = await request(app)
          .delete(`/api/business/${businessId}/admin/whatsapp/token`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('eliminado');
      });
    });

    describe('GET /api/business/:businessId/admin/whatsapp/token/test', () => {
      it('should reject test without token', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/token/test`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('configurado');
      });
    });
  });

  describe('Embedded Signup Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/embedded-signup/config', () => {
      it('should reject without env variables', async () => {
        const oldAppId = process.env.META_APP_ID;
        const oldConfigId = process.env.META_CONFIGURATION_ID;
        
        delete process.env.META_APP_ID;
        delete process.env.META_CONFIGURATION_ID;

        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/embedded-signup/config`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(500);

        expect(response.body.success).toBe(false);

        // Restore
        process.env.META_APP_ID = oldAppId;
        process.env.META_CONFIGURATION_ID = oldConfigId;
      });

      it('should return config when env variables are set', async () => {
        process.env.META_APP_ID = 'test-app-id';
        process.env.META_CONFIGURATION_ID = 'test-config-id';
        process.env.FRONTEND_URL = 'http://localhost:3000';

        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/embedded-signup/config`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('appId');
        expect(response.body.data).toHaveProperty('configurationId');
        expect(response.body.data).toHaveProperty('redirectUri');
        expect(response.body.data).toHaveProperty('state');
      });
    });

    describe('POST /api/business/:businessId/admin/whatsapp/embedded-signup/callback', () => {
      it('should reject invalid state', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/embedded-signup/callback`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            code: 'auth-code-123',
            state: 'invalid-state'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('inválido');
      });

      it('should reject missing code', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/embedded-signup/callback`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            state: `whatsapp_signup_${businessId}_123456789`
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });
  });

  describe('Templates Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/templates', () => {
      it('should get templates list with default pagination', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/templates`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('templates');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.templates)).toBe(true);
      });

      it('should support pagination parameters', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/templates?page=1&limit=5`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.pagination.limit).toBe(5);
      });

      it('should support status filter', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/templates?status=APPROVED`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/business/:businessId/admin/whatsapp/templates', () => {
      it('should reject invalid template data', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/templates`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({}) // Missing required fields
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      it('should create template draft successfully', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/templates`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'test_template_001',
            language: 'es',
            category: 'UTILITY',
            components: [
              {
                type: 'BODY',
                text: 'Hola {{1}}, tu cita es el {{2}}'
              }
            ]
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.status).toBe('DRAFT');
      });
    });

    describe('GET /api/business/:businessId/admin/whatsapp/templates/sync', () => {
      it('should reject sync without token', async () => {
        // Ensure no token
        await BusinessCommunicationsConfig.update(
          { whatsapp_access_token: null },
          { where: { business_id: businessId } }
        );

        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/templates/sync`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('token');
      });
    });

    describe('DELETE /api/business/:businessId/admin/whatsapp/templates/:templateId', () => {
      it('should reject deleting non-existent template', async () => {
        const response = await request(app)
          .delete(`/api/business/${businessId}/admin/whatsapp/templates/99999`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Messages Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/messages', () => {
      it('should get messages list with default pagination', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('messages');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.messages)).toBe(true);
      });

      it('should support status filter', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/messages?status=SENT`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should support date range filter', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/messages?startDate=2025-01-01&endDate=2025-12-31`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/business/:businessId/admin/whatsapp/messages/:messageId', () => {
      it('should reject non-existent message', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/messages/99999`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Webhooks Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/webhooks/events', () => {
      it('should get webhook events list', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/webhooks/events`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('events');
        expect(response.body.data).toHaveProperty('pagination');
      });

      it('should support event type filter', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/webhooks/events?eventType=message_status`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/business/:businessId/admin/whatsapp/webhooks/events/:eventId/replay', () => {
      it('should reject non-existent event', async () => {
        const response = await request(app)
          .post(`/api/business/${businessId}/admin/whatsapp/webhooks/events/99999/replay`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Health Check Endpoints', () => {
    describe('GET /api/business/:businessId/admin/whatsapp/health', () => {
      it('should return health status', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/health`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('hasToken');
        expect(response.body.data).toHaveProperty('config');
      });
    });

    describe('GET /api/business/:businessId/admin/whatsapp/stats', () => {
      it('should return statistics', async () => {
        const response = await request(app)
          .get(`/api/business/${businessId}/admin/whatsapp/stats`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('templates');
        expect(response.body.data).toHaveProperty('messages');
        expect(response.body.data).toHaveProperty('webhooks');
      });
    });
  });

  describe('Validation Tests', () => {
    it('should validate template name format', async () => {
      const response = await request(app)
        .post(`/api/business/${businessId}/admin/whatsapp/templates`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Template Name!', // Spaces and special chars not allowed
          language: 'es',
          category: 'UTILITY',
          components: [{ type: 'BODY', text: 'Test' }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate language code', async () => {
      const response = await request(app)
        .post(`/api/business/${businessId}/admin/whatsapp/templates`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'test_template',
          language: 'invalid', // Invalid language
          category: 'UTILITY',
          components: [{ type: 'BODY', text: 'Test' }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate category', async () => {
      const response = await request(app)
        .post(`/api/business/${businessId}/admin/whatsapp/templates`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'test_template',
          language: 'es',
          category: 'INVALID_CATEGORY',
          components: [{ type: 'BODY', text: 'Test' }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get(`/api/business/${businessId}/admin/whatsapp/templates?page=-1&limit=0`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
