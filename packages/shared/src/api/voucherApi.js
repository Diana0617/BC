/**
 * API para el sistema de vouchers
 * Incluye endpoints para clientes, negocios y administración
 */

import apiClient from './client';

/**
 * ========================================
 * ENDPOINTS PARA CLIENTES
 * ========================================
 */

/**
 * Obtener todos los vouchers activos del cliente autenticado
 * @returns {Promise} Lista de vouchers activos
 */
export const getMyVouchers = () => {
  return apiClient.get('/vouchers/my-vouchers');
};

/**
 * Validar un código de voucher antes de aplicarlo
 * @param {string} voucherCode - Código del voucher (ej: VCH-ABC-123)
 * @returns {Promise} Información del voucher si es válido
 */
export const validateVoucher = (voucherCode) => {
  return apiClient.get(`/vouchers/validate/${voucherCode}`);
};

/**
 * Aplicar un voucher a una cita
 * @param {Object} data - Datos de aplicación
 * @param {string} data.voucherCode - Código del voucher
 * @param {string} data.bookingId - ID de la cita
 * @returns {Promise} Resultado de la aplicación
 */
export const applyVoucher = (data) => {
  return apiClient.post('/vouchers/apply', data);
};

/**
 * Verificar si el cliente está bloqueado para agendar citas
 * @returns {Promise} Estado del bloqueo
 */
export const checkBlockStatus = () => {
  return apiClient.get('/vouchers/check-block-status');
};

/**
 * Obtener historial de cancelaciones del cliente
 * @param {number} days - Días hacia atrás (default: 30)
 * @returns {Promise} Historial de cancelaciones
 */
export const getCancellationHistory = (days = 30) => {
  return apiClient.get('/vouchers/cancellation-history', {
    params: { days }
  });
};

/**
 * ========================================
 * ENDPOINTS PARA NEGOCIOS
 * ========================================
 */

/**
 * Listar todos los vouchers del negocio con paginación y filtros
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Límite por página
 * @param {string} params.status - Filtrar por estado (ACTIVE, USED, EXPIRED, CANCELLED)
 * @param {string} params.customerId - Filtrar por cliente
 * @returns {Promise} Lista paginada de vouchers
 */
export const listBusinessVouchers = (params = {}) => {
  return apiClient.get('/vouchers/business/list', { params });
};

/**
 * Cancelar un voucher manualmente
 * @param {string} voucherId - ID del voucher
 * @param {Object} data - Datos de cancelación
 * @param {string} data.reason - Motivo de la cancelación
 * @returns {Promise} Voucher cancelado
 */
export const cancelVoucher = (voucherId, data) => {
  return apiClient.post(`/vouchers/business/cancel/${voucherId}`, data);
};

/**
 * Crear un voucher manual (cortesía/compensación)
 * @param {Object} data - Datos del voucher
 * @param {string} data.customerId - ID del cliente
 * @param {number} data.amount - Monto del voucher
 * @param {number} data.validityDays - Días de validez
 * @param {string} data.reason - Motivo de creación
 * @returns {Promise} Voucher creado
 */
export const createManualVoucher = (data) => {
  return apiClient.post('/vouchers/business/create-manual', data);
};

/**
 * Listar clientes bloqueados
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.status - Estado (ACTIVE, LIFTED, EXPIRED)
 * @returns {Promise} Lista de bloqueos
 */
export const listBlockedCustomers = (params = {}) => {
  return apiClient.get('/vouchers/business/blocks', { params });
};

/**
 * Levantar bloqueo de un cliente
 * @param {string} blockId - ID del bloqueo
 * @param {Object} data - Datos
 * @param {string} data.notes - Notas sobre el levantamiento
 * @returns {Promise} Bloqueo actualizado
 */
export const liftBlock = (blockId, data) => {
  return apiClient.post(`/vouchers/business/lift-block/${blockId}`, data);
};

/**
 * Obtener estadísticas de cancelaciones de un cliente
 * @param {string} customerId - ID del cliente
 * @param {number} days - Período en días
 * @returns {Promise} Estadísticas del cliente
 */
export const getCustomerStats = (customerId, days = 30) => {
  return apiClient.get(`/vouchers/business/customer-stats/${customerId}`, {
    params: { days }
  });
};

/**
 * ========================================
 * ENDPOINTS ADMINISTRATIVOS
 * ========================================
 */

/**
 * Ejecutar limpieza de vouchers y bloqueos expirados
 * (Para ejecutar en CRON diariamente)
 * @returns {Promise} Resultado de la limpieza
 */
export const cleanupExpired = () => {
  return apiClient.post('/vouchers/cleanup');
};

/**
 * API completa de vouchers
 */
export const voucherApi = {
  // Cliente
  getMyVouchers,
  validateVoucher,
  applyVoucher,
  checkBlockStatus,
  getCancellationHistory,
  
  // Negocio
  listBusinessVouchers,
  cancelVoucher,
  createManualVoucher,
  listBlockedCustomers,
  liftBlock,
  getCustomerStats,
  
  // Admin
  cleanupExpired
};

export default voucherApi;
