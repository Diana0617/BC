import { apiClient } from './client.js';

// 🎯 ADVANCE PAYMENT API SERVICE

/**
 * Servicio para manejar todas las operaciones relacionadas con pagos adelantados
 * Integra con el sistema de Wompi para procesar depósitos de citas
 */
const advancePaymentApi = {
  
  /**
   * Verificar si una cita requiere pago adelantado
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio  
   * @returns {Promise} Respuesta con información de pago requerido
   */
  checkAdvancePaymentRequired: async (appointmentId, businessId) => {
    return await apiClient.get(`/api/appointments/${appointmentId}/advance-payment/check`, {
      params: { businessId }
    });
  },

  /**
   * Iniciar proceso de pago adelantado con Wompi
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @param {Object} customerData - Datos del cliente para Wompi
   * @param {string} customerData.email - Email del cliente
   * @param {string} customerData.phone - Teléfono del cliente
   * @param {string} customerData.fullName - Nombre completo del cliente
   * @returns {Promise} Respuesta con link de pago y datos de Wompi
   */
  initiateAdvancePayment: async (appointmentId, businessId, customerData) => {
    return await apiClient.post(`/api/appointments/${appointmentId}/advance-payment/initiate`, {
      businessId,
      customerData
    });
  },

  /**
   * Consultar estado actual del pago adelantado
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con estado actual del pago
   */
  checkAdvancePaymentStatus: async (appointmentId, businessId) => {
    return await apiClient.get(`/api/appointments/${appointmentId}/advance-payment/status`, {
      params: { businessId }
    });
  },

  /**
   * Obtener configuración de pagos adelantados del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con configuración de depósitos
   */
  getBusinessAdvancePaymentConfig: async (businessId) => {
    return await apiClient.get(`/api/business/${businessId}/advance-payment-config`);
  },

  /**
   * Actualizar configuración de pagos adelantados del negocio (solo para OWNER)
   * @param {string} businessId - ID del negocio
   * @param {Object} config - Nueva configuración
   * @param {boolean} config.requireDeposit - Si requiere depósito
   * @param {number} config.depositPercentage - Porcentaje del servicio
   * @param {number} config.depositMinAmount - Monto mínimo en centavos
   * @param {boolean} config.allowPartialPayments - Permitir pagos parciales
   * @param {boolean} config.autoRefundCancellations - Reembolso automático
   * @returns {Promise} Respuesta con configuración actualizada
   */
  updateBusinessAdvancePaymentConfig: async (businessId, config) => {
    return await apiClient.put(`/api/business/${businessId}/advance-payment-config`, {
      businessId,
      depositSettings: config
    });
  },

  /**
   * Obtener historial de pagos adelantados de una cita
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con historial de transacciones
   */
  getAdvancePaymentHistory: async (appointmentId, businessId) => {
    return await apiClient.get(`/api/appointments/${appointmentId}/advance-payment/history`, {
      params: { businessId }
    });
  },

  /**
   * Obtener todos los pagos adelantados pendientes del negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.status - Estado específico a filtrar
   * @param {string} filters.dateFrom - Fecha inicio (YYYY-MM-DD)
   * @param {string} filters.dateTo - Fecha fin (YYYY-MM-DD)
   * @param {number} filters.page - Página (default: 1)
   * @param {number} filters.limit - Límite por página (default: 20)
   * @returns {Promise} Respuesta con lista de pagos adelantados
   */
  getBusinessAdvancePayments: async (businessId, filters = {}) => {
    return await apiClient.get(`/api/business/${businessId}/advance-payments`, {
      params: {
        businessId,
        ...filters
      }
    });
  },

  /**
   * Procesar reembolso de pago adelantado (solo para casos especiales)
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @param {Object} refundData - Datos del reembolso
   * @param {string} refundData.reason - Razón del reembolso
   * @param {number} refundData.amount - Monto a reembolsar (opcional, default: total)
   * @returns {Promise} Respuesta con información del reembolso
   */
  processAdvancePaymentRefund: async (appointmentId, businessId, refundData) => {
    return await apiClient.post(`/api/appointments/${appointmentId}/advance-payment/refund`, {
      businessId,
      ...refundData
    });
  },

  /**
   * Verificar estado de conectividad con Wompi
   * @param {string} businessId - ID del negocio
   * @returns {Promise} Respuesta con estado de conexión
   */
  checkWompiConnection: async (businessId) => {
    return await apiClient.get(`/api/business/${businessId}/wompi-connection-status`, {
      params: { businessId }
    });
  },

  /**
   * Obtener estadísticas de pagos adelantados del negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} dateRange - Rango de fechas
   * @param {string} dateRange.from - Fecha inicio (YYYY-MM-DD)
   * @param {string} dateRange.to - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Respuesta con estadísticas
   */
  getAdvancePaymentStats: async (businessId, dateRange = {}) => {
    return await apiClient.get(`/api/business/${businessId}/advance-payment-stats`, {
      params: {
        businessId,
        ...dateRange
      }
    });
  }
};

export default advancePaymentApi;