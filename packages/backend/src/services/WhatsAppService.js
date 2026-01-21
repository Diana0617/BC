/**
 * WhatsApp Business Cloud API Service
 * Servicio para enviar mensajes a través de la API de WhatsApp Business de Meta
 * 
 * Versión 2.0 - Multi-tenant con soporte para tokens encriptados
 * 
 * Features:
 * - Backward compatibility con business.settings.communications.whatsapp
 * - Soporte para tokens encriptados vía WhatsAppTokenManager
 * - Message tracking en whatsapp_messages table
 * - Feature flag para gradual rollout
 */

const axios = require('axios');
const { Business } = require('../models');
const WhatsAppMessage = require('../models/WhatsAppMessage');
const whatsappTokenManager = require('./WhatsAppTokenManager');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    // Feature flag para nuevo sistema (se puede controlar por negocio)
    this.useNewTokenSystem = process.env.WHATSAPP_USE_NEW_TOKEN_SYSTEM === 'true';
  }

  /**
   * Obtener configuración de WhatsApp de un negocio
   * 
   * Versión 2.0: Intenta primero obtener token del nuevo sistema (encriptado),
   * si no existe hace fallback al sistema legacy (business.settings)
   */
  async getBusinessConfig(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // NUEVO SISTEMA: Intentar obtener token del WhatsAppTokenManager
      if (this.useNewTokenSystem || business.whatsappEnabled) {
        try {
          const tokenData = await whatsappTokenManager.getToken(businessId);
          
          if (tokenData && business.whatsappPhoneNumberId) {
            logger.info(`Using new token system for business ${businessId}`);
            
            return {
              phoneNumberId: business.whatsappPhoneNumberId,
              accessToken: tokenData.token,
              phoneNumber: business.whatsappPhoneNumber || '',
              sendReminders: true,  // TODO: leer de settings o DB
              sendAppointments: true,
              sendReceipts: true,
              usingNewSystem: true,
              metadata: tokenData.metadata
            };
          }
        } catch (error) {
          logger.warn(`Failed to get token from new system for business ${businessId}:`, error.message);
          // Fallback to legacy system below
        }
      }

      // LEGACY SYSTEM: Leer configuración desde business.settings.communications.whatsapp
      const settings = business.settings || {};
      const communications = settings.communications || {};
      const whatsapp = communications.whatsapp || {};

      if (!whatsapp.enabled) {
        throw new Error('WhatsApp no está habilitado para este negocio');
      }

      if (!whatsapp.access_token) {
        throw new Error('Token de acceso de WhatsApp no configurado');
      }

      if (!whatsapp.phone_number) {
        throw new Error('Número de WhatsApp no configurado');
      }

      logger.info(`Using legacy token system for business ${businessId}`);

      return {
        phoneNumberId: whatsapp.phone_number_id || whatsapp.business_account_id,
        accessToken: whatsapp.access_token,
        phoneNumber: whatsapp.phone_number,
        sendReminders: whatsapp.send_reminders !== false,
        sendAppointments: whatsapp.send_appointments !== false,
        sendReceipts: whatsapp.send_receipts !== false,
        usingNewSystem: false
      };
    } catch (error) {
      logger.error('Error obteniendo configuración de WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Registrar mensaje en la base de datos para tracking
   * 
   * @private
   */
  async _trackMessage(businessId, payload, result, options = {}) {
    try {
      const config = await this.getBusinessConfig(businessId);
      
      const messageData = {
        businessId,
        clientId: options.clientId || null,
        appointmentId: options.appointmentId || null,
        to: payload.to,
        phoneNumberId: config.phoneNumberId,
        messageType: payload.type,
        payload,
        providerMessageId: result.success ? result.messageId : null,
        status: result.success ? 'SENT' : 'FAILED',
        errorCode: result.success ? null : result.errorCode,
        errorMessage: result.success ? null : result.error,
        sentAt: result.success ? new Date() : null
      };

      const message = await WhatsAppMessage.create(messageData);
      logger.info(`Message tracked: ${message.id}`);
      
      return message.id;
    } catch (error) {
      // No fallar el envío si falla el tracking
      logger.error('Error tracking message:', error);
      return null;
    }
  }

  /**
   * Enviar mensaje de texto simple
   */
  async sendTextMessage(businessId, recipientPhone, message, options = {}) {
    try {
      const config = await this.getBusinessConfig(businessId);

      // Limpiar número de teléfono (remover espacios, guiones, etc.)
      const cleanPhone = recipientPhone.replace(/[^\d+]/g, '');

      logger.info(`Enviando WhatsApp a ${cleanPhone}...`);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Mensaje WhatsApp enviado:', response.data);

      const result = {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };

      // Track message en DB (solo si el nuevo sistema está activo)
      if (config.usingNewSystem) {
        await this._trackMessage(businessId, payload, result, options);
      }

      return result;
    } catch (error) {
      logger.error('Error enviando mensaje WhatsApp:', error.response?.data || error.message);
      
      const result = {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        errorCode: error.response?.data?.error?.code || 'UNKNOWN'
      };

      // Track failed message también
      try {
        const config = await this.getBusinessConfig(businessId);
        if (config.usingNewSystem) {
          await this._trackMessage(businessId, payload, result, options);
        }
      } catch (trackError) {
        logger.error('Error tracking failed message:', trackError);
      }

      return result;
    }
  }

  /**
   * Enviar mensaje usando template (para recordatorios formales)
   */
  async sendTemplateMessage(businessId, recipientPhone, templateName, components = []) {
    try {
      const config = await this.getBusinessConfig(businessId);
      const cleanPhone = recipientPhone.replace(/[^\d+]/g, '');

      console.log(`📱 Enviando template WhatsApp "${templateName}" a ${cleanPhone}...`);

      const response = await axios.post(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'es' // Español
            },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Template WhatsApp enviado:', response.data);

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error enviando template WhatsApp:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Enviar recordatorio de cita
   */
  async sendAppointmentReminder(businessId, appointment) {
    try {
      const config = await this.getBusinessConfig(businessId);

      if (!config.sendReminders) {
        logger.info('Recordatorios de WhatsApp deshabilitados');
        return { success: false, error: 'Recordatorios deshabilitados' };
      }

      const clientPhone = appointment.client?.phone;
      if (!clientPhone) {
        logger.warn('Cliente sin número de teléfono');
        return { success: false, error: 'Cliente sin teléfono' };
      }

      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = `🔔 *Recordatorio de Cita*

Hola ${appointment.client.firstName}! 👋

Te recordamos que tienes una cita programada para:

📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}
💆 *Servicio:* ${appointment.service?.name}
${appointment.specialist ? `👤 *Especialista:* ${appointment.specialist.firstName} ${appointment.specialist.lastName}` : ''}

${appointment.business?.name ? `📍 ${appointment.business.name}` : ''}
${appointment.business?.address ? `Dirección: ${appointment.business.address}` : ''}

¡Te esperamos! 😊

_Para cancelar o reprogramar, por favor contáctanos con anticipación._`;

      return await this.sendTextMessage(businessId, clientPhone, message, {
        clientId: appointment.clientId,
        appointmentId: appointment.id
      });
    } catch (error) {
      logger.error('Error enviando recordatorio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar confirmación de cita agendada
   */
  async sendAppointmentConfirmation(businessId, appointment) {
    try {
      const config = await this.getBusinessConfig(businessId);

      if (!config.sendAppointments) {
        logger.info('Confirmaciones de WhatsApp deshabilitadas');
        return { success: false, error: 'Confirmaciones deshabilitadas' };
      }

      const clientPhone = appointment.client?.phone;
      if (!clientPhone) {
        return { success: false, error: 'Cliente sin teléfono' };
      }

      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = `✅ *Cita Confirmada*

¡Hola ${appointment.client.firstName}! 

Tu cita ha sido agendada exitosamente:

📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${formattedTime}
💆 *Servicio:* ${appointment.service?.name}
${appointment.specialist ? `👤 *Especialista:* ${appointment.specialist.firstName} ${appointment.specialist.lastName}` : ''}
💰 *Precio:* $${appointment.totalAmount?.toLocaleString('es-CO') || 'Por confirmar'}

${appointment.business?.name ? `📍 ${appointment.business.name}` : ''}

¡Nos vemos pronto! 😊`;

      return await this.sendTextMessage(businessId, clientPhone, message, {
        clientId: appointment.clientId,
        appointmentId: appointment.id
      });
    } catch (error) {
      logger.error('Error enviando confirmación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificación de cancelación
   */
  async sendAppointmentCancellation(businessId, appointment, reason = '') {
    try {
      const config = await this.getBusinessConfig(businessId);

      if (!config.sendAppointments) {
        return { success: false, error: 'Notificaciones deshabilitadas' };
      }

      const clientPhone = appointment.client?.phone;
      if (!clientPhone) {
        return { success: false, error: 'Cliente sin teléfono' };
      }

      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const message = `❌ *Cita Cancelada*

Hola ${appointment.client.firstName},

Tu cita del *${formattedDate}* a las *${formattedTime}* ha sido cancelada.

💆 *Servicio:* ${appointment.service?.name}
${reason ? `\n📝 *Motivo:* ${reason}` : ''}

Si deseas agendar una nueva cita, por favor contáctanos.

¡Gracias! 🙏`;

      return await this.sendTextMessage(businessId, clientPhone, message, {
        clientId: appointment.clientId,
        appointmentId: appointment.id
      });
    } catch (error) {
      logger.error('Error enviando cancelación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar recibo de pago
   */
  async sendPaymentReceipt(businessId, receipt) {
    try {
      const config = await this.getBusinessConfig(businessId);

      if (!config.sendReceipts) {
        logger.info('Recibos de WhatsApp deshabilitados');
        return { success: false, error: 'Recibos deshabilitados' };
      }

      const clientPhone = receipt.client?.phone;
      if (!clientPhone) {
        return { success: false, error: 'Cliente sin teléfono' };
      }

      const receiptDate = new Date(receipt.createdAt);
      const formattedDate = receiptDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const message = `🧾 *Recibo de Pago*

Hola ${receipt.client.firstName}! 

Gracias por tu pago. Aquí está tu recibo:

📅 *Fecha:* ${formattedDate}
💰 *Monto:* $${receipt.totalAmount?.toLocaleString('es-CO')}
💳 *Método:* ${receipt.paymentMethod || 'Efectivo'}
${receipt.appointment?.service ? `💆 *Servicio:* ${receipt.appointment.service.name}` : ''}

🧾 *Recibo #:* ${receipt.receiptNumber || receipt.id}

${receipt.business?.name ? `\n📍 ${receipt.business.name}` : ''}

¡Gracias por tu preferencia! 😊`;

      return await this.sendTextMessage(businessId, clientPhone, message, {
        clientId: receipt.clientId
      });
    } catch (error) {
      logger.error('Error enviando recibo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Probar conexión con la API de WhatsApp
   */
  async testConnection(businessId) {
    try {
      const config = await this.getBusinessConfig(businessId);

      // Intentar obtener información del número de teléfono
      const response = await axios.get(
        `${this.baseUrl}/${config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`
          }
        }
      );

      logger.info('Conexión con WhatsApp exitosa:', response.data);

      return {
        success: true,
        data: response.data,
        message: 'Conexión exitosa con WhatsApp Business API',
        usingNewSystem: config.usingNewSystem
      };
    } catch (error) {
      logger.error('Error probando conexión:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Actualizar estado de mensaje desde webhook
   * 
   * @param {string} providerMessageId - WhatsApp message ID
   * @param {string} status - New status (DELIVERED, READ, FAILED)
   * @param {Object} metadata - Additional metadata from webhook
   */
  async updateMessageStatus(providerMessageId, status, metadata = {}) {
    try {
      const message = await WhatsAppMessage.findOne({
        where: { providerMessageId }
      });

      if (!message) {
        logger.warn(`Message not found for update: ${providerMessageId}`);
        return null;
      }

      const updates = { status };

      if (status === 'DELIVERED') {
        updates.deliveredAt = new Date();
      } else if (status === 'READ') {
        updates.readAt = new Date();
      } else if (status === 'FAILED') {
        updates.errorCode = metadata.errorCode;
        updates.errorMessage = metadata.errorMessage;
      }

      await message.update(updates);
      logger.info(`Message ${providerMessageId} updated to status: ${status}`);

      return message;
    } catch (error) {
      logger.error('Error updating message status:', error);
      throw error;
    }
  }

  /**
   * Generic method to make Graph API requests
   * 
   * @param {string} endpoint - API endpoint (e.g., '/123456789')
   * @param {string} method - HTTP method (GET, POST, DELETE)
   * @param {Object} data - Request body (for POST)
   * @param {string} accessToken - WhatsApp access token
   * @returns {Promise<Object>} API response data
   */
  async _makeGraphApiRequest(endpoint, method = 'GET', data = null, accessToken = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error(`Graph API request failed: ${method} ${endpoint}`, error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
