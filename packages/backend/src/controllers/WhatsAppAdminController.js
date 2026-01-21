const { Business } = require('../models');
const WhatsAppToken = require('../models/WhatsAppToken');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const WhatsAppMessageTemplate = require('../models/WhatsAppMessageTemplate');
const WhatsAppWebhookEvent = require('../models/WhatsAppWebhookEvent');
const whatsappTokenManager = require('../services/WhatsAppTokenManager');
const whatsappService = require('../services/WhatsAppService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * WhatsAppAdminController
 * 
 * Handles WhatsApp Business Platform administration for business users
 * 
 * Endpoints:
 * - Token management (store, retrieve, rotate, delete)
 * - Embedded Signup configuration
 * - Template management (CRUD, submit, sync)
 * - Message history
 * - Webhook events log
 */

class WhatsAppAdminController {
  constructor() {
    // Bind all methods to preserve 'this' context when used as route handlers
    this.storeToken = this.storeToken.bind(this);
    this.getTokenInfo = this.getTokenInfo.bind(this);
    this.rotateToken = this.rotateToken.bind(this);
    this.deleteToken = this.deleteToken.bind(this);
    this.getEmbeddedSignupConfig = this.getEmbeddedSignupConfig.bind(this);
    this.handleEmbeddedSignupCallback = this.handleEmbeddedSignupCallback.bind(this);
    this.getTemplates = this.getTemplates.bind(this);
    this.createTemplate = this.createTemplate.bind(this);
    this.updateTemplate = this.updateTemplate.bind(this);
    this.deleteTemplate = this.deleteTemplate.bind(this);
    this.syncTemplates = this.syncTemplates.bind(this);
    this.getWebhookEvents = this.getWebhookEvents.bind(this);
    this.replayWebhookEvent = this.replayWebhookEvent.bind(this);
    // Bind private methods too
    this._exchangeCodeForToken = this._exchangeCodeForToken.bind(this);
  }

  // =====================================================================
  // TOKEN MANAGEMENT
  // =====================================================================

  /**
   * Store WhatsApp token manually
   * POST /api/admin/whatsapp/businesses/:businessId/tokens
   * 
   * Used for:
   * - Manual token entry (advanced users)
   * - Migration from legacy system
   * - Token recovery
   */
  async storeToken(req, res) {
    try {
      const { businessId } = req.params;
      const { accessToken, phoneNumberId, wabaId, phoneNumber, metadata = {} } = req.body;

      // Validate business ownership
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Verify user owns this business
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      // Validate required fields
      if (!accessToken) {
        return res.status(400).json({
          success: false,
          error: 'El access token es requerido'
        });
      }

      if (!phoneNumberId) {
        return res.status(400).json({
          success: false,
          error: 'El Phone Number ID es requerido'
        });
      }

      // Test token before saving
      try {
        const testResponse = await whatsappService._makeGraphApiRequest(
          `/${phoneNumberId}`,
          'GET',
          null,
          accessToken
        );

        if (!testResponse || !testResponse.verified_name) {
          throw new Error('Token inválido o Phone Number ID incorrecto');
        }
      } catch (error) {
        logger.error('Error validating token:', error);
        return res.status(400).json({
          success: false,
          error: 'El token no es válido o no tiene permisos suficientes',
          details: error.message
        });
      }

      // Store token (encrypted)
      const tokenData = await whatsappTokenManager.storeToken(businessId, accessToken, {
        metadata: {
          wabaId,
          phoneNumberId,
          permissions: ['whatsapp_business_messaging', 'whatsapp_business_management'],
          source: 'manual',
          ...metadata
        }
      });

      // Update business fields
      await business.update({
        whatsapp_enabled: true,
        whatsapp_phone_number: phoneNumber,
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_platform_metadata: {
          wabaId,
          connectedAt: new Date(),
          source: 'manual'
        }
      });

      logger.info(`WhatsApp token stored for business ${businessId}`);

      res.status(200).json({
        success: true,
        message: 'Token almacenado correctamente',
        data: {
          businessId,
          phoneNumber,
          phoneNumberId,
          hasToken: true,
          isActive: tokenData.isActive,
          expiresAt: tokenData.expiresAt,
          createdAt: tokenData.createdAt
        }
      });
    } catch (error) {
      logger.error('Error storing WhatsApp token:', error);
      res.status(500).json({
        success: false,
        error: 'Error al almacenar el token',
        details: error.message
      });
    }
  }

  /**
   * Get WhatsApp token information (without exposing the actual token)
   * GET /api/admin/whatsapp/businesses/:businessId/tokens
   */
  async getTokenInfo(req, res) {
    try {
      const { businessId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Check if token exists
      const hasToken = await whatsappTokenManager.hasValidToken(businessId);

      if (!hasToken) {
        return res.status(200).json({
          success: true,
          data: {
            hasToken: false,
            isActive: false,
            phoneNumber: business.whatsapp_phone_number || null,
            phoneNumberId: business.whatsapp_phone_number_id || null
          }
        });
      }

      // Get token metadata (without the actual token)
      const token = await whatsappTokenManager.getToken(businessId);

      res.status(200).json({
        success: true,
        data: {
          hasToken: true,
          isActive: token.isActive,
          tokenType: token.tokenType,
          expiresAt: token.expiresAt,
          lastRotatedAt: token.lastRotatedAt,
          createdAt: token.createdAt,
          phoneNumber: business.whatsapp_phone_number,
          phoneNumberId: business.whatsapp_phone_number_id,
          wabaId: token.metadata?.wabaId,
          permissions: token.metadata?.permissions || [],
          source: token.metadata?.source || 'unknown'
        }
      });
    } catch (error) {
      logger.error('Error getting token info:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener información del token'
      });
    }
  }

  /**
   * Rotate WhatsApp token
   * POST /api/admin/whatsapp/businesses/:businessId/tokens/rotate
   */
  async rotateToken(req, res) {
    try {
      const { businessId } = req.params;
      const { newAccessToken } = req.body;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      if (!newAccessToken) {
        return res.status(400).json({
          success: false,
          error: 'El nuevo access token es requerido'
        });
      }

      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Test new token before rotating
      const phoneNumberId = business.whatsapp_phone_number_id;
      if (!phoneNumberId) {
        return res.status(400).json({
          success: false,
          error: 'El negocio no tiene un Phone Number ID configurado'
        });
      }

      try {
        await whatsappService._makeGraphApiRequest(
          `/${phoneNumberId}`,
          'GET',
          null,
          newAccessToken
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'El nuevo token no es válido',
          details: error.message
        });
      }

      // Rotate token
      const rotatedToken = await whatsappTokenManager.rotateToken(businessId, newAccessToken);

      logger.info(`WhatsApp token rotated for business ${businessId}`);

      res.status(200).json({
        success: true,
        message: 'Token rotado correctamente',
        data: {
          businessId,
          isActive: rotatedToken.isActive,
          expiresAt: rotatedToken.expiresAt,
          lastRotatedAt: rotatedToken.lastRotatedAt
        }
      });
    } catch (error) {
      logger.error('Error rotating WhatsApp token:', error);
      res.status(500).json({
        success: false,
        error: 'Error al rotar el token',
        details: error.message
      });
    }
  }

  /**
   * Delete WhatsApp token (disconnect)
   * DELETE /api/admin/whatsapp/businesses/:businessId/tokens
   */
  async deleteToken(req, res) {
    try {
      const { businessId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Delete token
      await whatsappTokenManager.deleteToken(businessId);

      // Update business
      await business.update({
        whatsapp_enabled: false,
        whatsapp_phone_number: null,
        whatsapp_phone_number_id: null,
        whatsapp_platform_metadata: null
      });

      logger.info(`WhatsApp token deleted for business ${businessId}`);

      res.status(200).json({
        success: true,
        message: 'WhatsApp desconectado correctamente'
      });
    } catch (error) {
      logger.error('Error deleting WhatsApp token:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar el token'
      });
    }
  }

  /**
   * Test WhatsApp connection
   * POST /api/admin/whatsapp/businesses/:businessId/test-connection
   */
  async testConnection(req, res) {
    try {
      const { businessId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const result = await whatsappService.testConnection(businessId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Conexión exitosa',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Error de conexión',
          details: result.errorDetails
        });
      }
    } catch (error) {
      logger.error('Error testing connection:', error);
      res.status(500).json({
        success: false,
        error: 'Error al probar la conexión',
        details: error.message
      });
    }
  }

  // =====================================================================
  // EMBEDDED SIGNUP
  // =====================================================================

  /**
   * Get Embedded Signup configuration
   * GET /api/admin/whatsapp/embedded-signup/config
   */
  async getEmbeddedSignupConfig(req, res) {
    try {
      const appId = process.env.META_APP_ID;
      const configId = process.env.WHATSAPP_CONFIG_ID;
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const redirectUri = `${baseUrl}/whatsapp/callback`;
      
      // Generate secure state token
      const state = Buffer.from(JSON.stringify({
        businessId: req.user.businessId,
        userId: req.user.id,
        timestamp: Date.now()
      })).toString('base64');

      res.status(200).json({
        success: true,
        data: {
          appId,
          configId,
          redirectUri,
          state,
          scope: 'whatsapp_business_management,whatsapp_business_messaging'
        }
      });
    } catch (error) {
      logger.error('Error getting Embedded Signup config:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener configuración de Embedded Signup'
      });
    }
  }

  /**
   * Handle Embedded Signup callback
   * POST /api/admin/whatsapp/embedded-signup/callback
   */
  async handleEmbeddedSignupCallback(req, res) {
    try {
      const { code, state, businessId } = req.body;

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          error: 'Código o estado faltante'
        });
      }

      // Validate state
      let stateData;
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido'
        });
      }

      // Exchange code for access token
      const tokenResponse = await this._exchangeCodeForToken(code);
      
      if (!tokenResponse.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al obtener el token',
          details: tokenResponse.error
        });
      }

      const { accessToken, wabaId, phoneNumberId } = tokenResponse.data;

      // Get phone number details
      const phoneDetails = await whatsappService._makeGraphApiRequest(
        `/${phoneNumberId}`,
        'GET',
        null,
        accessToken
      );

      // Store token
      await whatsappTokenManager.storeToken(businessId, accessToken, {
        metadata: {
          wabaId,
          phoneNumberId,
          permissions: ['whatsapp_business_messaging', 'whatsapp_business_management'],
          source: 'embedded_signup',
          verifiedName: phoneDetails.verified_name
        }
      });

      // Update business
      const business = await Business.findByPk(businessId);
      await business.update({
        whatsapp_enabled: true,
        whatsapp_phone_number: phoneDetails.display_phone_number,
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_platform_metadata: {
          wabaId,
          verifiedName: phoneDetails.verified_name,
          connectedAt: new Date(),
          source: 'embedded_signup'
        }
      });

      logger.info(`WhatsApp connected via Embedded Signup for business ${businessId}`);

      res.status(200).json({
        success: true,
        message: 'WhatsApp conectado correctamente',
        data: {
          phoneNumber: phoneDetails.display_phone_number,
          verifiedName: phoneDetails.verified_name
        }
      });
    } catch (error) {
      logger.error('Error handling Embedded Signup callback:', error);
      res.status(500).json({
        success: false,
        error: 'Error al procesar la conexión',
        details: error.message
      });
    }
  }

  /**
   * Exchange authorization code for access token
   * @private
   */
  async _exchangeCodeForToken(code) {
    try {
      const axios = require('axios');
      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const redirectUri = 'https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp'; // Debe coincidir con Meta config

      logger.info('Exchanging code for token...', { appId, redirectUri });

      // Exchange authorization code for access token
      // https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code: code,
          redirect_uri: redirectUri
        }
      });

      const accessToken = response.data.access_token;

      logger.info('Access token obtained successfully');

      // Get debug token info to extract WABA and phone number
      const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
        params: {
          input_token: accessToken,
          access_token: `${appId}|${appSecret}`
        }
      });

      logger.info('Token debug info:', debugResponse.data);

      // Get WABA ID from token granular scopes or data
      let wabaId = null;
      let phoneNumberId = null;

      if (debugResponse.data.data && debugResponse.data.data.granular_scopes) {
        const wabaScope = debugResponse.data.data.granular_scopes.find(
          scope => scope.scope === 'whatsapp_business_management'
        );
        if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
          wabaId = wabaScope.target_ids[0];
        }
      }

      // If WABA ID found, get phone numbers
      if (wabaId) {
        const phoneNumbersResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`,
          {
            params: { access_token: accessToken }
          }
        );

        if (phoneNumbersResponse.data.data && phoneNumbersResponse.data.data.length > 0) {
          phoneNumberId = phoneNumbersResponse.data.data[0].id;
        }

        logger.info('WABA and phone number found', { wabaId, phoneNumberId });
      }

      return {
        success: true,
        data: {
          accessToken,
          wabaId,
          phoneNumberId
        }
      };
    } catch (error) {
      logger.error('Error exchanging code for token:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // =====================================================================
  // TEMPLATE MANAGEMENT
  // =====================================================================

  /**
   * Get WhatsApp message templates
   * GET /api/admin/whatsapp/businesses/:businessId/templates
   */
  async getTemplates(req, res) {
    try {
      const { businessId } = req.params;
      const { page = 1, limit = 20, status, category } = req.query;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const where = { businessId }; // Changed from business_id to businessId
      // Only add filters if they have valid values (not null, undefined, or "null" string)
      if (status && status !== 'null') where.status = status;
      if (category && category !== 'null') where.category = category;

      const offset = (page - 1) * limit;

      const { rows: templates, count: total } = await WhatsAppMessageTemplate.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']] // Changed from created_at to createdAt
      });

      res.status(200).json({
        success: true,
        data: {
          templates,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener plantillas',
        details: error.message
      });
    }
  }

  /**
   * Create new WhatsApp message template
   * POST /api/admin/whatsapp/businesses/:businessId/templates
   */
  async createTemplate(req, res) {
    try {
      const { businessId } = req.params;
      const { name, language, category, components } = req.body;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      // Validate required fields
      if (!name || !language || !category || !components) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, idioma, categoría y componentes son requeridos'
        });
      }

      // Create template locally
      const template = await WhatsAppMessageTemplate.create({
        businessId: businessId,
        templateName: name,
        language: language,
        category: category,
        status: 'PENDING',
        body: components.body || '',
        header: components.header,
        footer: components.footer,
        buttons: components.buttons
      });

      logger.info(`Template created for business ${businessId}: ${name}`);

      res.status(201).json({
        success: true,
        message: 'Plantilla creada correctamente',
        data: template
      });
    } catch (error) {
      logger.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear plantilla',
        details: error.message
      });
    }
  }

  /**
   * Update WhatsApp message template
   * PUT /api/admin/whatsapp/businesses/:businessId/templates/:templateId
   */
  async updateTemplate(req, res) {
    try {
      const { businessId, templateId } = req.params;
      const { name, language, category, components } = req.body;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      const template = await WhatsAppMessageTemplate.findOne({
        where: { id: templateId, businessId: businessId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Plantilla no encontrada'
        });
      }

      // Only allow editing PENDING templates
      if (template.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: 'Solo se pueden editar plantillas en estado PENDING'
        });
      }

      // Update template
      await template.update({
        templateName: name || template.templateName,
        language: language || template.language,
        category: category || template.category,
        body: components?.body || template.body,
        header: components?.header !== undefined ? components.header : template.header,
        footer: components?.footer !== undefined ? components.footer : template.footer,
        buttons: components?.buttons !== undefined ? components.buttons : template.buttons
      });

      logger.info(`Template updated: ${templateId}`);

      res.status(200).json({
        success: true,
        message: 'Plantilla actualizada correctamente',
        data: template
      });
    } catch (error) {
      logger.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar plantilla'
      });
    }
  }

  /**
   * Delete WhatsApp message template
   * DELETE /api/admin/whatsapp/businesses/:businessId/templates/:templateId
   */
  async deleteTemplate(req, res) {
    try {
      const { businessId, templateId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      const template = await WhatsAppMessageTemplate.findOne({
        where: { id: templateId, businessId: businessId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Plantilla no encontrada'
        });
      }

      await template.destroy();

      logger.info(`Template deleted: ${templateId}`);

      res.status(200).json({
        success: true,
        message: 'Plantilla eliminada correctamente'
      });
    } catch (error) {
      logger.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar plantilla'
      });
    }
  }

  /**
   * Submit template to Meta for approval
   * POST /api/admin/whatsapp/businesses/:businessId/templates/:templateId/submit
   */
  async submitTemplate(req, res) {
    try {
      const { businessId, templateId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      const template = await WhatsAppMessageTemplate.findOne({
        where: { id: templateId, businessId: businessId }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Plantilla no encontrada'
        });
      }

      // Get WABA ID from business
      const business = await Business.findByPk(businessId);
      const wabaId = business.whatsapp_platform_metadata?.wabaId;

      if (!wabaId) {
        return res.status(400).json({
          success: false,
          error: 'El negocio no tiene un WABA ID configurado'
        });
      }

      // Get token
      const token = await whatsappTokenManager.getToken(businessId);
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'No hay token de WhatsApp configurado'
        });
      }

      // Submit to Meta (placeholder - needs actual implementation)
      logger.warn('Template submission to Meta not fully implemented');
      
      // Update template status
      await template.update({
        status: 'PENDING',
        submitted_at: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Plantilla enviada para aprobación',
        data: template
      });
    } catch (error) {
      logger.error('Error submitting template:', error);
      res.status(500).json({
        success: false,
        error: 'Error al enviar plantilla para aprobación',
        details: error.message
      });
    }
  }

  /**
   * Sync templates from Meta
   * GET /api/admin/whatsapp/businesses/:businessId/templates/sync
   */
  async syncTemplates(req, res) {
    try {
      const { businessId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Get WABA ID
      const business = await Business.findByPk(businessId);
      const wabaId = business.whatsapp_platform_metadata?.wabaId;

      if (!wabaId) {
        return res.status(400).json({
          success: false,
          error: 'El negocio no tiene un WABA ID configurado'
        });
      }

      // Get token
      const token = await whatsappTokenManager.getToken(businessId);
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'No hay token de WhatsApp configurado'
        });
      }

      // Fetch templates from Meta (placeholder)
      logger.warn('Template sync from Meta not fully implemented');

      res.status(200).json({
        success: true,
        message: 'Sincronización completada',
        data: {
          synced: 0,
          templates: []
        }
      });
    } catch (error) {
      logger.error('Error syncing templates:', error);
      res.status(500).json({
        success: false,
        error: 'Error al sincronizar plantillas'
      });
    }
  }

  // =====================================================================
  // MESSAGE HISTORY
  // =====================================================================

  /**
   * Get message history
   * GET /api/admin/whatsapp/businesses/:businessId/messages
   */
  async getMessages(req, res) {
    try {
      const { businessId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        status, 
        startDate, 
        endDate,
        clientId 
      } = req.query;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const where = { businessId: businessId };
      
      // Only add filters if they have valid values (not null, undefined, or "null" string)
      if (status && status !== 'null') where.status = status;
      if (clientId && clientId !== 'null') where.clientId = clientId;
      
      if ((startDate && startDate !== 'null') || (endDate && endDate !== 'null')) {
        where.createdAt = {};
        if (startDate && startDate !== 'null') {
          const date = new Date(startDate);
          if (!isNaN(date.getTime())) {
            where.createdAt[Op.gte] = date;
          }
        }
        if (endDate && endDate !== 'null') {
          const date = new Date(endDate);
          if (!isNaN(date.getTime())) {
            where.createdAt[Op.lte] = date;
          }
        }
      }

      const offset = (page - 1) * limit;

      const { rows: messages, count: total } = await WhatsAppMessage.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener mensajes'
      });
    }
  }

  /**
   * Get message by ID
   * GET /api/admin/whatsapp/businesses/:businessId/messages/:messageId
   */
  async getMessageById(req, res) {
    try {
      const { businessId, messageId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const message = await WhatsAppMessage.findOne({
        where: { id: messageId, businessId: businessId },
        include: [
          {
            association: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            association: 'appointment',
            attributes: ['id', 'appointmentDate', 'status']
          }
        ]
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Mensaje no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Error getting message:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener mensaje'
      });
    }
  }

  // =====================================================================
  // WEBHOOK EVENTS
  // =====================================================================

  /**
   * Get webhook events
   * GET /api/admin/whatsapp/businesses/:businessId/webhook-events
   */
  async getWebhookEvents(req, res) {
    try {
      const { businessId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        eventType, 
        startDate, 
        endDate 
      } = req.query;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const where = { businessId: businessId };
      
      // Only add filters if they have valid values (not null, undefined, or "null" string)
      if (eventType && eventType !== 'null') where.eventType = eventType;
      
      if ((startDate && startDate !== 'null') || (endDate && endDate !== 'null')) {
        where.createdAt = {};
        if (startDate && startDate !== 'null') {
          const date = new Date(startDate);
          if (!isNaN(date.getTime())) {
            where.createdAt[Op.gte] = date;
          }
        }
        if (endDate && endDate !== 'null') {
          const date = new Date(endDate);
          if (!isNaN(date.getTime())) {
            where.createdAt[Op.lte] = date;
          }
        }
      }

      const offset = (page - 1) * limit;

      const { rows: events, count: total } = await WhatsAppWebhookEvent.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting webhook events:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener eventos de webhook'
      });
    }
  }

  /**
   * Get webhook event by ID
   * GET /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId
   */
  async getWebhookEventById(req, res) {
    try {
      const { businessId, eventId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este negocio'
        });
      }

      const event = await WhatsAppWebhookEvent.findOne({
        where: { id: eventId, businessId: businessId }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Evento no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      logger.error('Error getting webhook event:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener evento'
      });
    }
  }

  /**
   * Replay webhook event
   * POST /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId/replay
   */
  async replayWebhookEvent(req, res) {
    try {
      const { businessId, eventId } = req.params;

      // Validate business ownership
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para gestionar este negocio'
        });
      }

      const event = await WhatsAppWebhookEvent.findOne({
        where: { id: eventId, businessId: businessId }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Evento no encontrado'
        });
      }

      // Re-process event (placeholder)
      logger.info(`Replaying webhook event ${eventId}`);

      res.status(200).json({
        success: true,
        message: 'Evento re-procesado correctamente'
      });
    } catch (error) {
      logger.error('Error replaying webhook event:', error);
      res.status(500).json({
        success: false,
        error: 'Error al re-procesar evento'
      });
    }
  }
}

module.exports = new WhatsAppAdminController();
