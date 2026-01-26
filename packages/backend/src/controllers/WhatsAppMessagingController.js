const WhatsAppMessage = require('../models/WhatsAppMessage');
const WhatsAppMessageTemplate = require('../models/WhatsAppMessageTemplate');
const { Business, Appointment, Client, Receipt } = require('../models');
const whatsappService = require('../services/WhatsAppService');
const whatsappTokenManager = require('../services/WhatsAppTokenManager');
const logger = require('../utils/logger');

/**
 * WhatsAppMessagingController
 * 
 * Handles sending WhatsApp messages to clients
 * 
 * Available operations:
 * - Send template-based messages
 * - Send simple text messages
 * - Send appointment reminders/confirmations
 * - Send payment receipts
 * - Get message status
 */
class WhatsAppMessagingController {
  constructor() {
    this.sendTemplateMessage = this.sendTemplateMessage.bind(this);
    this.sendTextMessage = this.sendTextMessage.bind(this);
    this.getMessageStatus = this.getMessageStatus.bind(this);
    this.sendAppointmentReminder = this.sendAppointmentReminder.bind(this);
    this.sendAppointmentConfirmation = this.sendAppointmentConfirmation.bind(this);
    this.sendPaymentReceipt = this.sendPaymentReceipt.bind(this);
  }

  /**
   * Send WhatsApp message using an approved template
   * POST /api/business/:businessId/whatsapp/send-template-message
   */
  async sendTemplateMessage(req, res) {
    try {
      const { businessId } = req.params;
      const { recipientPhone, templateName, variables = {}, clientId, appointmentId } = req.body;

      // Validate business exists
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Validate tenant access
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a este negocio'
        });
      }

      // Validate required fields
      if (!recipientPhone) {
        return res.status(400).json({
          success: false,
          error: 'El número de teléfono del cliente es requerido'
        });
      }

      if (!templateName) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de la plantilla es requerido'
        });
      }

      // Check if template exists and is approved
      const template = await WhatsAppMessageTemplate.findOne({
        where: {
          businessId,
          templateName,
          status: 'APPROVED'
        }
      });

      if (!template) {
        return res.status(400).json({
          success: false,
          error: `Plantilla "${templateName}" no encontrada o no aprobada`
        });
      }

      // Check if business has a valid WhatsApp token
      const hasValidToken = await whatsappTokenManager.hasValidToken(businessId);
      if (!hasValidToken) {
        return res.status(400).json({
          success: false,
          error: 'Este negocio no tiene WhatsApp conectado. Configura el token primero.'
        });
      }

      logger.info(`📱 Enviando template "${templateName}" a ${recipientPhone}...`);

      // Prepare components from template
      const components = this._buildTemplateComponents(template, variables);

      // Send message via service
      const result = await whatsappService.sendTemplateMessage(
        businessId,
        recipientPhone,
        templateName,
        components
      );

      if (!result.success) {
        logger.error('Error sending template message:', result.error);
        return res.status(400).json({
          success: false,
          error: result.error || 'Error al enviar mensaje'
        });
      }

      // Track message in database
      try {
        const messageRecord = await WhatsAppMessage.create({
          businessId,
          clientId: clientId || null,
          appointmentId: appointmentId || null,
          to: recipientPhone,
          messageType: 'template',
          payload: {
            templateName,
            variables
          },
          providerMessageId: result.messageId,
          status: 'SENT',
          sentAt: new Date()
        });

        logger.info(`✅ Mensaje registrado: ${messageRecord.id}`);
      } catch (trackingError) {
        logger.error('Error tracking message:', trackingError);
        // Don't fail the response, just log the tracking error
      }

      return res.json({
        success: true,
        message: 'Mensaje enviado correctamente',
        data: {
          messageId: result.messageId,
          status: 'SENT',
          to: recipientPhone,
          template: templateName
        }
      });
    } catch (error) {
      logger.error('Error in sendTemplateMessage:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar mensaje',
        details: error.message
      });
    }
  }

  /**
   * Send simple text message (not template-based)
   * POST /api/business/:businessId/whatsapp/send-text-message
   */
  async sendTextMessage(req, res) {
    try {
      const { businessId } = req.params;
      const { recipientPhone, message, clientId } = req.body;

      // Validate business exists
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Validate fields
      if (!recipientPhone) {
        return res.status(400).json({
          success: false,
          error: 'El número de teléfono es requerido'
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje es requerido'
        });
      }

      // Check token
      const hasValidToken = await whatsappTokenManager.hasValidToken(businessId);
      if (!hasValidToken) {
        return res.status(400).json({
          success: false,
          error: 'Este negocio no tiene WhatsApp conectado'
        });
      }

      logger.info(`📝 Enviando mensaje de texto a ${recipientPhone}...`);

      // Send message
      const result = await whatsappService.sendTextMessage(
        businessId,
        recipientPhone,
        message
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      // Track message
      try {
        await WhatsAppMessage.create({
          businessId,
          clientId: clientId || null,
          to: recipientPhone,
          messageType: 'text',
          payload: { text: message },
          providerMessageId: result.messageId,
          status: 'SENT',
          sentAt: new Date()
        });
      } catch (trackingError) {
        logger.error('Error tracking text message:', trackingError);
      }

      return res.json({
        success: true,
        message: 'Mensaje enviado correctamente',
        data: {
          messageId: result.messageId,
          status: 'SENT',
          to: recipientPhone
        }
      });
    } catch (error) {
      logger.error('Error in sendTextMessage:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar mensaje'
      });
    }
  }

  /**
   * Get status of a sent message
   * GET /api/business/:businessId/whatsapp/message-status/:messageId
   */
  async getMessageStatus(req, res) {
    try {
      const { businessId, messageId } = req.params;

      const message = await WhatsAppMessage.findOne({
        where: {
          id: messageId,
          businessId
        }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Mensaje no encontrado'
        });
      }

      return res.json({
        success: true,
        data: {
          id: message.id,
          to: message.to,
          status: message.status,
          sentAt: message.sentAt,
          messageType: message.messageType,
          errorMessage: message.errorMessage
        }
      });
    } catch (error) {
      logger.error('Error in getMessageStatus:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estado del mensaje'
      });
    }
  }

  /**
   * Send appointment reminder
   * POST /api/business/:businessId/whatsapp/send-appointment-reminder
   */
  async sendAppointmentReminder(req, res) {
    try {
      const { businessId } = req.params;
      const { appointmentId } = req.body;

      // Get appointment with relations
      const appointment = await Appointment.findOne({
        where: { id: appointmentId, businessId },
        include: [
          { model: Client, attributes: ['id', 'name', 'phone'] }
        ]
      });

      if (!appointment || !appointment.Client) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Check token
      const hasValidToken = await whatsappTokenManager.hasValidToken(businessId);
      if (!hasValidToken) {
        return res.status(400).json({
          success: false,
          error: 'Este negocio no tiene WhatsApp conectado'
        });
      }

      logger.info(`🔔 Enviando recordatorio de cita a ${appointment.Client.phone}...`);

      // Send via service
      const result = await whatsappService.sendAppointmentReminder(
        businessId,
        appointment
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: 'Recordatorio enviado correctamente',
        data: result.data
      });
    } catch (error) {
      logger.error('Error in sendAppointmentReminder:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar recordatorio'
      });
    }
  }

  /**
   * Send appointment confirmation
   * POST /api/business/:businessId/whatsapp/send-appointment-confirmation
   */
  async sendAppointmentConfirmation(req, res) {
    try {
      const { businessId } = req.params;
      const { appointmentId } = req.body;

      const appointment = await Appointment.findOne({
        where: { id: appointmentId, businessId },
        include: [
          { model: Client, attributes: ['id', 'name', 'phone'] }
        ]
      });

      if (!appointment || !appointment.Client) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const hasValidToken = await whatsappTokenManager.hasValidToken(businessId);
      if (!hasValidToken) {
        return res.status(400).json({
          success: false,
          error: 'Este negocio no tiene WhatsApp conectado'
        });
      }

      logger.info(`✅ Enviando confirmación de cita a ${appointment.Client.phone}...`);

      const result = await whatsappService.sendAppointmentConfirmation(
        businessId,
        appointment
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: 'Confirmación enviada correctamente',
        data: result.data
      });
    } catch (error) {
      logger.error('Error in sendAppointmentConfirmation:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar confirmación'
      });
    }
  }

  /**
   * Send payment receipt
   * POST /api/business/:businessId/whatsapp/send-payment-receipt
   */
  async sendPaymentReceipt(req, res) {
    try {
      const { businessId } = req.params;
      const { receiptId } = req.body;

      const receipt = await Receipt.findOne({
        where: { id: receiptId, businessId },
        include: [
          { model: Client, attributes: ['id', 'name', 'phone'] }
        ]
      });

      if (!receipt || !receipt.Client) {
        return res.status(404).json({
          success: false,
          error: 'Recibo no encontrado'
        });
      }

      const hasValidToken = await whatsappTokenManager.hasValidToken(businessId);
      if (!hasValidToken) {
        return res.status(400).json({
          success: false,
          error: 'Este negocio no tiene WhatsApp conectado'
        });
      }

      logger.info(`💰 Enviando recibo de pago a ${receipt.Client.phone}...`);

      const result = await whatsappService.sendPaymentReceipt(
        businessId,
        receipt
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: 'Recibo enviado correctamente',
        data: result.data
      });
    } catch (error) {
      logger.error('Error in sendPaymentReceipt:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar recibo'
      });
    }
  }

  // =====================================================================
  // PRIVATE HELPERS
  // =====================================================================

  /**
   * Build template components from template and variables
   * @private
   */
  _buildTemplateComponents(template, variables) {
    const components = [];

    // Header component (if exists)
    if (template.header) {
      components.push({
        type: 'HEADER',
        parameters: [{ type: 'text', text: template.header }]
      });
    }

    // Body component (required)
    if (template.body) {
      const bodyText = this._interpolateVariables(template.body, variables);
      components.push({
        type: 'BODY',
        parameters: Object.values(variables).map(value => ({ type: 'text', text: String(value) }))
      });
    }

    // Footer component (if exists)
    if (template.footer) {
      components.push({
        type: 'FOOTER',
        parameters: [{ type: 'text', text: template.footer }]
      });
    }

    // Buttons component (if exists)
    if (template.buttons && Array.isArray(template.buttons)) {
      components.push({
        type: 'BUTTONS',
        buttons: template.buttons
      });
    }

    return components;
  }

  /**
   * Replace variables in template
   * Replaces {{1}}, {{2}}, etc. with values from variables object
   * @private
   */
  _interpolateVariables(text, variables) {
    let result = text;
    
    // Replace {{1}}, {{2}}, etc. with variable values
    const variableArray = Object.values(variables);
    for (let i = 0; i < variableArray.length; i++) {
      const placeholder = `{{${i + 1}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(variableArray[i] || ''));
    }

    return result;
  }
}

module.exports = new WhatsAppMessagingController();
