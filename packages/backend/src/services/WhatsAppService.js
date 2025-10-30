/**
 * WhatsApp Business Cloud API Service
 * Servicio para enviar mensajes a través de la API de WhatsApp Business de Meta
 */

const axios = require('axios');
const { Business } = require('../models');

class WhatsAppService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Obtener configuración de WhatsApp de un negocio
   */
  async getBusinessConfig(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

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

      return {
        phoneNumberId: whatsapp.phone_number_id || whatsapp.business_account_id,
        accessToken: whatsapp.access_token,
        phoneNumber: whatsapp.phone_number,
        sendReminders: whatsapp.send_reminders !== false,
        sendAppointments: whatsapp.send_appointments !== false,
        sendReceipts: whatsapp.send_receipts !== false
      };
    } catch (error) {
      console.error('❌ Error obteniendo configuración de WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje de texto simple
   */
  async sendTextMessage(businessId, recipientPhone, message) {
    try {
      const config = await this.getBusinessConfig(businessId);

      // Limpiar número de teléfono (remover espacios, guiones, etc.)
      const cleanPhone = recipientPhone.replace(/[^\d+]/g, '');

      console.log(`📱 Enviando WhatsApp a ${cleanPhone}...`);

      const response = await axios.post(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Mensaje WhatsApp enviado:', response.data);

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error enviando mensaje WhatsApp:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
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
        console.log('⏭️  Recordatorios de WhatsApp deshabilitados');
        return { success: false, error: 'Recordatorios deshabilitados' };
      }

      const clientPhone = appointment.client?.phone;
      if (!clientPhone) {
        console.log('⚠️  Cliente sin número de teléfono');
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

      return await this.sendTextMessage(businessId, clientPhone, message);
    } catch (error) {
      console.error('❌ Error enviando recordatorio:', error);
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
        console.log('⏭️  Confirmaciones de WhatsApp deshabilitadas');
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

      return await this.sendTextMessage(businessId, clientPhone, message);
    } catch (error) {
      console.error('❌ Error enviando confirmación:', error);
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

      return await this.sendTextMessage(businessId, clientPhone, message);
    } catch (error) {
      console.error('❌ Error enviando cancelación:', error);
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
        console.log('⏭️  Recibos de WhatsApp deshabilitados');
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

      return await this.sendTextMessage(businessId, clientPhone, message);
    } catch (error) {
      console.error('❌ Error enviando recibo:', error);
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

      console.log('✅ Conexión con WhatsApp exitosa:', response.data);

      return {
        success: true,
        data: response.data,
        message: 'Conexión exitosa con WhatsApp Business API'
      };
    } catch (error) {
      console.error('❌ Error probando conexión:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }
}

module.exports = new WhatsAppService();
