import apiClient from './client';

/**
 * API para procesamiento público de invitaciones
 * No requiere autenticación - Para uso de negocios invitados
 */
export const publicInvitationApi = {
  
  /**
   * ✅ Validar token de invitación
   * @param {string} token - Token único de la invitación
   */
  validateInvitation: (token) => {
    return apiClient.get(`/public/invitation/${token}`);
  },

  /**
   * 💳 Procesar pago de invitación
   * @param {string} token - Token de la invitación
   * @param {Object} paymentData - Datos de pago
   * @param {string} paymentData.cardNumber - Número de tarjeta
   * @param {string} paymentData.cardHolderName - Nombre del titular
   * @param {number} paymentData.expiryMonth - Mes de expiración
   * @param {number} paymentData.expiryYear - Año de expiración
   * @param {string} paymentData.cvc - Código de seguridad
   * @param {boolean} paymentData.acceptTerms - Aceptación de términos
   */
  processPayment: (token, paymentData) => {
    return apiClient.post(`/public/invitation/${token}/payment`, paymentData);
  },

  /**
   * 📄 Obtener estado de invitación
   * @param {string} token - Token de la invitación
   */
  getInvitationStatus: (token) => {
    return apiClient.get(`/public/invitation/${token}/status`);
  },

  /**
   * 🎉 Obtener información de éxito después del pago
   * @param {string} token - Token de la invitación
   */
  getSuccessInfo: (token) => {
    return apiClient.get(`/public/invitation/${token}/success`);
  },

  /**
   * 📧 Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   */
  checkEmailAvailability: (email) => {
    return apiClient.get(`/public/invitation/check-email?email=${encodeURIComponent(email)}`);
  },

  /**
   * 📋 Obtener términos y condiciones
   */
  getTermsAndConditions: () => {
    return apiClient.get('/public/invitation/terms');
  },

  /**
   * 🔒 Obtener política de privacidad
   */
  getPrivacyPolicy: () => {
    return apiClient.get('/public/invitation/privacy');
  },

  /**
   * 💡 Obtener preguntas frecuentes sobre invitaciones
   */
  getFAQ: () => {
    return apiClient.get('/public/invitation/faq');
  },

  /**
   * 📞 Enviar consulta de soporte
   * @param {Object} contactData - Datos de contacto
   * @param {string} contactData.name - Nombre del contacto
   * @param {string} contactData.email - Email del contacto
   * @param {string} contactData.message - Mensaje
   * @param {string} contactData.token - Token de la invitación (opcional)
   */
  sendSupportQuery: (contactData) => {
    return apiClient.post('/public/invitation/support', contactData);
  },

  /**
   * 🔄 Solicitar reenvío de invitación
   * @param {string} email - Email al que reenviar
   */
  requestInvitationResend: (email) => {
    return apiClient.post('/public/invitation/resend', { email });
  },

  /**
   * 📊 Obtener información del plan (sin autenticación)
   * @param {string} planId - ID del plan
   */
  getPlanInfo: (planId) => {
    return apiClient.get(`/public/plans/${planId}/info`);
  },

  /**
   * 💰 Calcular precio total con impuestos
   * @param {string} planId - ID del plan
   * @param {string} country - País para cálculo de impuestos
   */
  calculateTotalPrice: (planId, country = 'CO') => {
    return apiClient.get(`/public/plans/${planId}/calculate-price?country=${country}`);
  },

  /**
   * 🏦 Obtener métodos de pago disponibles
   * @param {string} country - País para métodos de pago
   */
  getAvailablePaymentMethods: (country = 'CO') => {
    return apiClient.get(`/public/payment-methods?country=${country}`);
  },

  /**
   * 🌎 Obtener países disponibles para facturación
   */
  getAvailableCountries: () => {
    return apiClient.get('/public/countries');
  },

  /**
   * 💳 Validar datos de tarjeta (sin procesar pago)
   * @param {Object} cardData - Datos de tarjeta a validar
   */
  validateCardData: (cardData) => {
    return apiClient.post('/public/invitation/validate-card', cardData);
  },

  /**
   * 📱 Enviar código de verificación por SMS
   * @param {string} phone - Número de teléfono
   * @param {string} token - Token de la invitación
   */
  sendSMSVerification: (phone, token) => {
    return apiClient.post('/public/invitation/send-sms', { phone, token });
  },

  /**
   * ✅ Verificar código SMS
   * @param {string} phone - Número de teléfono
   * @param {string} code - Código de verificación
   * @param {string} token - Token de la invitación
   */
  verifySMSCode: (phone, code, token) => {
    return apiClient.post('/public/invitation/verify-sms', { phone, code, token });
  },

  /**
   * 🎯 Registrar evento de analytics
   * @param {string} token - Token de la invitación
   * @param {Object} eventData - Datos del evento
   */
  trackEvent: (token, eventData) => {
    return apiClient.post(`/public/invitation/${token}/track`, eventData);
  },

  /**
   * 🔗 Generar enlace de compartir
   * @param {string} token - Token de la invitación
   * @param {string} platform - Plataforma de compartir (whatsapp, email, etc.)
   */
  generateShareLink: (token, platform) => {
    return apiClient.post(`/public/invitation/${token}/share`, { platform });
  }
};