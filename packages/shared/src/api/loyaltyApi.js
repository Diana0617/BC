/**
 * API para el sistema de fidelización/loyalty
 * Incluye endpoints para clientes, negocios y tarjetas PDF
 */

import apiClient from './client';

/**
 * ========================================
 * ENDPOINTS PARA CLIENTES
 * ========================================
 */

/**
 * Obtener balance de puntos del cliente autenticado
 * @returns {Promise} Balance de puntos y puntos por expirar
 */
export const getMyBalance = () => {
  return apiClient.get('/loyalty/balance');
};

/**
 * Obtener historial de transacciones de puntos
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.limit - Límite por página (default: 50)
 * @param {number} params.offset - Offset para paginación
 * @param {string} params.type - Filtrar por tipo de transacción
 * @returns {Promise} Lista de transacciones con paginación
 */
export const getMyTransactions = (params = {}) => {
  return apiClient.get('/loyalty/transactions', { params });
};

/**
 * Obtener código de referido del cliente autenticado
 * @returns {Promise} Código de referido y estadísticas
 */
export const getMyReferralCode = () => {
  return apiClient.get('/loyalty/referral-code');
};

/**
 * Obtener lista de clientes referidos por el cliente autenticado
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Límite por página
 * @returns {Promise} Lista paginada de referidos
 */
export const getMyReferrals = (params = {}) => {
  return apiClient.get('/loyalty/my-referrals', { params });
};

/**
 * Canjear puntos por recompensa
 * @param {Object} data - Datos del canje
 * @param {number} data.points - Puntos a canjear
 * @param {string} data.rewardType - Tipo de recompensa (DISCOUNT_PERCENTAGE, DISCOUNT_FIXED, FREE_SERVICE, etc.)
 * @param {number} data.value - Valor de la recompensa
 * @param {string} data.description - Descripción (opcional)
 * @param {Object} data.conditions - Condiciones de uso (opcional)
 * @returns {Promise} Recompensa creada con código
 */
export const redeemPoints = (data) => {
  return apiClient.post('/loyalty/redeem', data);
};

/**
 * Obtener recompensas del cliente
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.status - Filtrar por estado (ACTIVE, USED, EXPIRED, CANCELLED)
 * @param {boolean} params.includeExpired - Incluir recompensas expiradas
 * @returns {Promise} Lista de recompensas
 */
export const getMyRewards = (params = {}) => {
  return apiClient.get('/loyalty/rewards', { params });
};

/**
 * Aplicar una recompensa a una compra/cita
 * @param {Object} data - Datos de aplicación
 * @param {string} data.rewardCode - Código de la recompensa (ej: RWD-ABC-123-XYZ)
 * @param {string} data.referenceType - Tipo de referencia (Appointment, Sale, etc.)
 * @param {string} data.referenceId - ID de la referencia
 * @returns {Promise} Recompensa aplicada
 */
export const applyReward = (data) => {
  return apiClient.post('/loyalty/apply-reward', data);
};

/**
 * Descargar tarjeta de fidelización en PDF del cliente autenticado
 * @returns {Promise} Blob del PDF
 */
export const downloadMyCard = () => {
  return apiClient.get('/loyalty/card/pdf', {
    responseType: 'blob'
  });
};

/**
 * ========================================
 * ENDPOINTS PARA NEGOCIOS
 * ========================================
 */

/**
 * Obtener balance de puntos de un cliente específico
 * @param {string} clientId - ID del cliente
 * @returns {Promise} Balance de puntos del cliente
 */
export const getClientBalance = (clientId) => {
  return apiClient.get(`/api/loyalty/business/client/${clientId}/balance`);
};

/**
 * Obtener transacciones de un cliente específico
 * @param {string} clientId - ID del cliente
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise} Lista de transacciones
 */
export const getClientTransactions = (clientId, params = {}) => {
  return apiClient.get(`/loyalty/business/client/${clientId}/transactions`, { params });
};

/**
 * Obtener referidos de un cliente específico
 * @param {string} clientId - ID del cliente
 * @returns {Promise} Lista de referidos
 */
export const getClientReferrals = (clientId) => {
  return apiClient.get(`/loyalty/business/client/${clientId}/referrals`);
};

/**
 * Acreditar puntos manualmente a un cliente
 * @param {Object} data - Datos de acreditación
 * @param {string} data.clientId - ID del cliente
 * @param {number} data.points - Puntos a acreditar (puede ser negativo para débito)
 * @param {string} data.description - Descripción/motivo
 * @param {string} data.type - Tipo de transacción (MANUAL_ADJUSTMENT, BONUS, etc.)
 * @param {string} data.branchId - ID de sucursal (opcional)
 * @returns {Promise} Transacción creada
 */
export const creditPointsManually = (data) => {
  return apiClient.post('/loyalty/business/credit-points', data);
};

/**
 * Buscar cliente por código de referido
 * @param {string} code - Código de referido (ej: REF-ABC123)
 * @returns {Promise} Información del cliente
 */
export const findClientByReferralCode = (code) => {
  return apiClient.get(`/loyalty/business/find-by-referral-code/${code}`);
};

/**
 * Descargar tarjeta de fidelización en PDF de un cliente específico
 * @param {string} clientId - ID del cliente
 * @returns {Promise} Blob del PDF
 */
export const downloadClientCard = (clientId) => {
  return apiClient.get(`/loyalty/business/client/${clientId}/card/pdf`, {
    responseType: 'blob'
  });
};

/**
 * Generar múltiples tarjetas en un solo PDF (bulk)
 * @param {Object} data - Datos de clientes
 * @param {Array} data.clients - Array de { clientId, points }
 * @returns {Promise} Blob del PDF con múltiples tarjetas
 */
export const downloadBulkCards = (data) => {
  return apiClient.post('/loyalty/business/cards/bulk-pdf', data, {
    responseType: 'blob'
  });
};

/**
 * Ejecutar limpieza de puntos y recompensas expirados (CRON/ADMIN)
 * @param {Object} data - Opciones de limpieza
 * @param {boolean} data.expirePoints - Expirar puntos antiguos
 * @param {boolean} data.expireRewards - Expirar recompensas no usadas
 * @returns {Promise} Resultado de la limpieza
 */
export const runCleanup = (data = {}) => {
  return apiClient.post('/loyalty/cleanup', data);
};

/**
 * ========================================
 * HELPERS
 * ========================================
 */

/**
 * Descargar un blob como archivo
 * @param {Blob} blob - Blob del archivo
 * @param {string} filename - Nombre del archivo
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const loyaltyApi = {
  // Cliente
  getMyBalance,
  getMyTransactions,
  getMyReferralCode,
  getMyReferrals,
  redeemPoints,
  getMyRewards,
  applyReward,
  downloadMyCard,
  
  // Negocio
  getClientBalance,
  getClientTransactions,
  getClientReferrals,
  creditPointsManually,
  findClientByReferralCode,
  downloadClientCard,
  downloadBulkCards,
  runCleanup,
  
  // Helpers
  downloadBlob
};

export default loyaltyApi;
