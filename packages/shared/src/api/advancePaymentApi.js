import { apiClient } from './client';

// ================================
// ADVANCE PAYMENT API
// ================================

/**
 * Verificar si se requiere pago adelantado para una cita
 */
export const checkAdvancePaymentRequired = async ({ businessId, serviceId, appointmentDate }) => {
  return await apiClient.post('/advance-payment/check-required', {
    businessId,
    serviceId,
    appointmentDate
  });
};

/**
 * Iniciar proceso de pago adelantado con Wompi
 */
export const initiateAdvancePayment = async (paymentData) => {
  return await apiClient.post('/advance-payment/initiate', paymentData);
};

/**
 * Confirmar pago adelantado (webhook o manual)
 */
export const confirmAdvancePayment = async ({ transactionId, wompiData }) => {
  return await apiClient.post('/advance-payment/confirm', {
    transactionId,
    wompiData
  });
};

/**
 * Verificar estado de transacción de pago adelantado
 */
export const checkAdvancePaymentStatus = async (transactionId) => {
  return await apiClient.get(`/advance-payment/status/${transactionId}`);
};

/**
 * Obtener historial de pagos adelantados
 */
export const getAdvancePaymentHistory = async (params = {}) => {
  return await apiClient.get('/advance-payment/history', { params });
};

/**
 * Procesar webhook de Wompi
 */
export const processWompiWebhook = async (webhookData) => {
  return await apiClient.post('/advance-payment/webhook/wompi', webhookData);
};

/**
 * Obtener configuración de Wompi para el negocio
 */
export const getWompiConfig = async (businessId) => {
  return await apiClient.get(`/advance-payment/wompi-config/${businessId}`);
};

/**
 * Obtener detalles de pago adelantado
 */
export const getAdvancePaymentDetails = async (paymentId) => {
  return await apiClient.get(`/advance-payment/details/${paymentId}`);
};

/**
 * Cancelar pago adelantado pendiente
 */
export const cancelAdvancePayment = async (transactionId) => {
  return await apiClient.post(`/advance-payment/cancel/${transactionId}`);
};

/**
 * Reembolsar pago adelantado
 */
export const refundAdvancePayment = async (transactionId, refundData) => {
  return await apiClient.post(`/advance-payment/refund/${transactionId}`, refundData);
};

// Default export como objeto
const advancePaymentApi = {
  checkAdvancePaymentRequired,
  initiateAdvancePayment,
  confirmAdvancePayment,
  checkAdvancePaymentStatus,
  getAdvancePaymentHistory,
  processWompiWebhook,
  getWompiConfig,
  getAdvancePaymentDetails,
  cancelAdvancePayment,
  refundAdvancePayment
};

export default advancePaymentApi;