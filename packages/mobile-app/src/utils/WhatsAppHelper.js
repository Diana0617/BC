import { Linking, Alert } from 'react-native';

/**
 * Utilidades para integración WhatsApp básica
 * Genera links de WhatsApp Web para envío de mensajes
 */
class WhatsAppHelper {
  
  /**
   * Formatear número de teléfono para WhatsApp
   * @param {string} phone - Número de teléfono
   * @returns {string} - Número formateado para WhatsApp
   */
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remover caracteres no numéricos
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Si no tiene código de país, asumir Colombia (+57)
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('57')) {
      cleanPhone = '57' + cleanPhone;
    }
    
    // Si no tiene el + al inicio, agregarlo
    if (!cleanPhone.startsWith('57')) {
      cleanPhone = '57' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Generar mensaje de recibo de pago
   * @param {Object} receiptData - Datos del recibo completo
   * @returns {string} - Mensaje formateado
   */
  static generateReceiptMessage(receiptData) {
    // Nueva estructura con modelo Receipt
    if (receiptData.receipt) {
      const { receipt, appointment, business } = receiptData;
      
      const businessName = business?.name || 'Beauty Control';
      const receiptNumber = receipt?.receiptNumber || 'N/A';
      const specialistName = receipt?.specialistName || appointment?.specialist?.name || 'N/A';
      const serviceName = receipt?.serviceName || appointment?.service?.name || 'Servicio';
      const serviceDate = receipt?.serviceDate || appointment?.date || 'N/A';
      const serviceTime = receipt?.serviceTime || appointment?.time || 'N/A';
      const totalAmount = receipt?.totalAmount || appointment?.finalAmount || 0;
      const paymentMethod = receipt?.paymentMethod || 'Wompi';
      const clientName = receipt?.clientName || appointment?.user?.name || 'Cliente';
      
      const formattedAmount = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalAmount);
      
      let message = `¡Hola ${clientName}! 😊\n\n`;
      message += `Gracias por visitarnos en *${businessName}*.\n\n`;
      message += `🧾 *RECIBO DE PAGO*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📄 Recibo: *${receiptNumber}*\n`;
      message += `👤 Especialista: ${specialistName}\n`;
      message += `💅 Servicio: ${serviceName}\n`;
      message += `📅 Fecha: ${serviceDate}\n`;
      message += `🕐 Hora: ${serviceTime}\n`;
      message += `💰 Total: ${formattedAmount}\n`;
      message += `💳 Método: ${paymentMethod}\n\n`;
      message += `✅ *Pago Confirmado*\n\n`;
      
      if (business?.address) {
        message += `📍 ${business.address}\n`;
      }
      if (business?.phone) {
        message += `📞 ${business.phone}\n`;
      }
      
      message += `\n¡Gracias por confiar en nosotros! 💖`;
      
      return message;
    }
    
    // Estructura anterior para compatibilidad
    const {
      businessName,
      serviceName,
      clientName,
      amount,
      date,
      receiptNumber,
      receiptUrl
    } = receiptData;

    const formattedAmount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    const formattedDate = new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `¡Hola ${clientName}! 😊\n\n`;
    message += `Gracias por visitarnos en *${businessName}*.\n\n`;
    message += `✅ *RECIBO DE PAGO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 Servicio: ${serviceName}\n`;
    message += `💰 Monto: ${formattedAmount}\n`;
    message += `📅 Fecha: ${formattedDate}\n`;
    
    if (receiptNumber) {
      message += `🧾 Recibo: #${receiptNumber}\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    if (receiptUrl) {
      message += `📄 Descarga tu recibo: ${receiptUrl}\n\n`;
    }
    
    message += `¡Esperamos verte pronto! 💖\n\n`;
    message += `_Mensaje enviado desde Beauty Control_`;

    return message;
  }

  /**
   * Generar mensaje de confirmación de cita
   * @param {Object} appointmentData - Datos de la cita
   * @returns {string} - Mensaje formateado
   */
  static generateAppointmentConfirmationMessage(appointmentData) {
    const {
      businessName,
      serviceName,
      clientName,
      date,
      time,
      specialistName,
      address
    } = appointmentData;

    const formattedDate = new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let message = `¡Hola ${clientName}! 😊\n\n`;
    message += `Tu cita ha sido *confirmada* en *${businessName}*\n\n`;
    message += `📅 *DETALLES DE TU CITA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💅 Servicio: ${serviceName}\n`;
    message += `📅 Fecha: ${formattedDate}\n`;
    message += `🕐 Hora: ${time}\n`;
    
    if (specialistName) {
      message += `👩‍💼 Especialista: ${specialistName}\n`;
    }
    
    if (address) {
      message += `📍 Dirección: ${address}\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `⏰ *Recuerda llegar 10 minutos antes*\n\n`;
    message += `Si necesitas reagendar o cancelar, contáctanos lo antes posible.\n\n`;
    message += `¡Te esperamos! 💖\n\n`;
    message += `_Mensaje enviado desde Beauty Control_`;

    return message;
  }

  /**
   * Generar URL de WhatsApp con mensaje
   * @param {string} phone - Número de teléfono del destinatario
   * @param {string} message - Mensaje a enviar
   * @returns {string} - URL de WhatsApp
   */
  static generateWhatsAppURL(phone, message) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  /**
   * Abrir WhatsApp con mensaje de recibo
   * @param {string} clientPhone - Teléfono del cliente
   * @param {Object} receiptData - Datos del recibo
   */
  static async sendReceiptMessage(clientPhone, receiptData) {
    try {
      if (!clientPhone) {
        Alert.alert('Error', 'No se encontró el número de teléfono del cliente');
        return false;
      }

      const message = this.generateReceiptMessage(receiptData);
      const whatsappURL = this.generateWhatsAppURL(clientPhone, message);

      const canOpen = await Linking.canOpenURL(whatsappURL);
      
      if (canOpen) {
        await Linking.openURL(whatsappURL);
        return true;
      } else {
        Alert.alert(
          'WhatsApp no disponible',
          'No se pudo abrir WhatsApp. Asegúrate de tener WhatsApp instalado.',
          [
            { text: 'Copiar mensaje', onPress: () => this.copyToClipboard(message) },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
      return false;
    }
  }

  /**
   * Abrir WhatsApp con mensaje de confirmación de cita
   * @param {string} clientPhone - Teléfono del cliente
   * @param {Object} appointmentData - Datos de la cita
   */
  static async sendAppointmentConfirmation(clientPhone, appointmentData) {
    try {
      if (!clientPhone) {
        Alert.alert('Error', 'No se encontró el número de teléfono del cliente');
        return false;
      }

      const message = this.generateAppointmentConfirmationMessage(appointmentData);
      const whatsappURL = this.generateWhatsAppURL(clientPhone, message);

      const canOpen = await Linking.canOpenURL(whatsappURL);
      
      if (canOpen) {
        await Linking.openURL(whatsappURL);
        return true;
      } else {
        Alert.alert(
          'WhatsApp no disponible',
          'No se pudo abrir WhatsApp. Asegúrate de tener WhatsApp instalado.',
          [
            { text: 'Copiar mensaje', onPress: () => this.copyToClipboard(message) },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
      return false;
    }
  }

  /**
   * Copiar texto al portapapeles (requiere react-native-clipboard)
   * @param {string} text - Texto a copiar
   */
  static copyToClipboard(text) {
    // Implementar con react-native-clipboard o expo-clipboard
    // Por ahora solo mostrar el mensaje
    Alert.alert(
      'Mensaje para WhatsApp',
      text,
      [{ text: 'Cerrar' }]
    );
  }

  /**
   * Validar configuración de WhatsApp del negocio
   * @param {Object} businessSettings - Configuración del negocio
   * @returns {boolean} - Si WhatsApp está configurado
   */
  static isWhatsAppConfigured(businessSettings) {
    return !!(
      businessSettings?.notifications?.whatsapp?.enabled &&
      businessSettings?.notifications?.whatsapp?.businessPhone
    );
  }

  /**
   * Obtener configuración de WhatsApp del negocio
   * @param {Object} businessSettings - Configuración del negocio
   * @returns {Object|null} - Configuración de WhatsApp o null
   */
  static getWhatsAppConfig(businessSettings) {
    if (!this.isWhatsAppConfigured(businessSettings)) {
      return null;
    }

    return businessSettings.notifications.whatsapp;
  }

  /**
   * Generar mensaje personalizado
   * @param {string} template - Plantilla del mensaje
   * @param {Object} variables - Variables para reemplazar
   * @returns {string} - Mensaje personalizado
   */
  static generateCustomMessage(template, variables) {
    let message = template;
    
    // Reemplazar variables en formato {{variable}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, variables[key] || '');
    });
    
    return message;
  }
}

export default WhatsAppHelper;