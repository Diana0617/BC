/**
 * API Frontend para Gestión de Planes de Tratamiento Multi-Sesión
 * 
 * Proporciona funcionalidades completas para:
 * - CRUD de planes de tratamiento
 * - Gestión de sesiones individuales
 * - Vinculación con turnos/appointments
 * - Seguimiento de progreso
 * - Gestión de pagos por plan y por sesión
 * - Manejo de fotos de progreso
 */

import { apiClient } from './client.js';

// ================================
// CONSTANTES
// ================================

export const TREATMENT_CONSTANTS = {
  PLAN_TYPES: {
    MULTI_SESSION: 'MULTI_SESSION',
    WITH_MAINTENANCE: 'WITH_MAINTENANCE'
  },
  PLAN_STATUS: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    PAUSED: 'PAUSED'
  },
  SESSION_STATUS: {
    PENDING: 'PENDING',
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW'
  },
  PAYMENT_PLANS: {
    FULL_UPFRONT: 'FULL_UPFRONT',
    PER_SESSION: 'PER_SESSION',
    INSTALLMENTS: 'INSTALLMENTS'
  },
  PHOTO_TYPES: {
    BEFORE: 'before',
    AFTER: 'after',
    PROGRESS: 'progress'
  }
};

// ================================
// TREATMENT PLANS - CRUD
// ================================

/**
 * Crear nuevo plan de tratamiento
 * @param {Object} planData - Datos del plan
 * @param {string} planData.clientId - ID del cliente
 * @param {string} planData.serviceId - ID del servicio (debe ser paquete)
 * @param {string} [planData.specialistId] - ID del especialista asignado
 * @param {string} planData.startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} [planData.expectedEndDate] - Fecha esperada de finalización
 * @param {string} planData.paymentPlan - Plan de pago (FULL_UPFRONT, PER_SESSION, INSTALLMENTS)
 * @param {string} [planData.notes] - Notas adicionales
 * @returns {Promise<Object>} Plan creado con sesiones iniciales
 */
export const createTreatmentPlan = async (planData) => {
  try {
    const response = await apiClient.post('/api/treatment-plans', planData);
    return response.data;
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    throw new Error(error.response?.data?.error || 'Error al crear plan de tratamiento');
  }
};

/**
 * Obtener plan de tratamiento por ID
 * @param {string} planId - ID del plan
 * @returns {Promise<Object>} Plan con sesiones y progreso
 */
export const getTreatmentPlan = async (planId) => {
  try {
    const response = await apiClient.get(`/api/treatment-plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener plan de tratamiento');
  }
};

/**
 * Obtener todos los planes de tratamiento
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.status] - Filtrar por estado
 * @param {string} [params.clientId] - Filtrar por cliente
 * @param {number} [params.page] - Página
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Object>} Lista de planes con paginación
 */
export const getTreatmentPlans = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.clientId) queryParams.append('clientId', params.clientId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiClient.get(`/api/treatment-plans?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener planes de tratamiento');
  }
};

/**
 * Obtener planes de tratamiento de un cliente
 * @param {string} clientId - ID del cliente
 * @param {boolean} [includeCompleted] - Incluir planes completados
 * @returns {Promise<Array>} Lista de planes del cliente
 */
export const getClientTreatmentPlans = async (clientId, includeCompleted = false) => {
  try {
    const queryParams = new URLSearchParams();
    if (includeCompleted) queryParams.append('includeCompleted', 'true');
    
    const response = await apiClient.get(`/api/clients/${clientId}/treatment-plans?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client treatment plans:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener planes del cliente');
  }
};

/**
 * Actualizar plan de tratamiento
 * @param {string} planId - ID del plan
 * @param {Object} updateData - Datos a actualizar
 * @param {string} [updateData.status] - Nuevo estado
 * @param {string} [updateData.specialistId] - Nuevo especialista
 * @param {string} [updateData.expectedEndDate] - Nueva fecha esperada
 * @param {string} [updateData.notes] - Nuevas notas
 * @returns {Promise<Object>} Plan actualizado
 */
export const updateTreatmentPlan = async (planId, updateData) => {
  try {
    const response = await apiClient.patch(`/api/treatment-plans/${planId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    throw new Error(error.response?.data?.error || 'Error al actualizar plan de tratamiento');
  }
};

/**
 * Cancelar plan de tratamiento
 * @param {string} planId - ID del plan
 * @param {string} [reason] - Razón de cancelación
 * @returns {Promise<Object>} Plan cancelado
 */
export const cancelTreatmentPlan = async (planId, reason = '') => {
  try {
    const response = await apiClient.delete(`/api/treatment-plans/${planId}`, {
      data: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling treatment plan:', error);
    throw new Error(error.response?.data?.error || 'Error al cancelar plan de tratamiento');
  }
};

/**
 * Registrar pago en plan de tratamiento
 * @param {string} planId - ID del plan
 * @param {Object} paymentData - Datos del pago
 * @param {number} paymentData.amount - Monto del pago
 * @param {string} [paymentData.sessionId] - ID de la sesión asociada
 * @returns {Promise<Object>} Plan actualizado con nuevo pago
 */
export const addPlanPayment = async (planId, paymentData) => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/${planId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error adding plan payment:', error);
    throw new Error(error.response?.data?.error || 'Error al registrar pago');
  }
};

// ================================
// TREATMENT SESSIONS - GESTIÓN
// ================================

/**
 * Obtener sesión por ID
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} Datos de la sesión
 */
export const getSession = async (sessionId) => {
  try {
    const response = await apiClient.get(`/api/treatment-plans/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener sesión');
  }
};

/**
 * Agendar sesión (vincular con turno)
 * @param {string} sessionId - ID de la sesión
 * @param {Object} scheduleData - Datos de agendamiento
 * @param {string} scheduleData.appointmentId - ID del turno
 * @param {string} [scheduleData.specialistId] - ID del especialista
 * @returns {Promise<Object>} Sesión agendada
 */
export const scheduleSession = async (sessionId, scheduleData) => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling session:', error);
    throw new Error(error.response?.data?.error || 'Error al agendar sesión');
  }
};

/**
 * Completar sesión
 * @param {string} sessionId - ID de la sesión
 * @param {Object} completionData - Datos de completitud
 * @param {string} [completionData.notes] - Notas de la sesión
 * @param {Array} [completionData.photosUrls] - URLs de fotos
 * @param {Object} [completionData.metadata] - Metadata adicional
 * @returns {Promise<Object>} Sesión completada y plan actualizado
 */
export const completeSession = async (sessionId, completionData = {}) => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error completing session:', error);
    throw new Error(error.response?.data?.error || 'Error al completar sesión');
  }
};

/**
 * Cancelar sesión
 * @param {string} sessionId - ID de la sesión
 * @param {string} [reason] - Razón de cancelación
 * @returns {Promise<Object>} Sesión cancelada
 */
export const cancelSession = async (sessionId, reason = '') => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error canceling session:', error);
    throw new Error(error.response?.data?.error || 'Error al cancelar sesión');
  }
};

/**
 * Reagendar sesión (cambiar de turno)
 * @param {string} sessionId - ID de la sesión
 * @param {string} newAppointmentId - ID del nuevo turno
 * @returns {Promise<Object>} Sesión reagendada
 */
export const rescheduleSession = async (sessionId, newAppointmentId) => {
  try {
    const response = await apiClient.patch(`/api/treatment-plans/sessions/${sessionId}/reschedule`, {
      newAppointmentId
    });
    return response.data;
  } catch (error) {
    console.error('Error rescheduling session:', error);
    throw new Error(error.response?.data?.error || 'Error al reagendar sesión');
  }
};

/**
 * Marcar sesión como no show
 * @param {string} sessionId - ID de la sesión
 * @param {string} [notes] - Notas adicionales
 * @returns {Promise<Object>} Sesión marcada como no show
 */
export const markSessionNoShow = async (sessionId, notes = '') => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/no-show`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error marking session as no show:', error);
    throw new Error(error.response?.data?.error || 'Error al marcar no show');
  }
};

// ================================
// PHOTOS - GESTIÓN
// ================================

/**
 * Agregar foto a sesión
 * @param {string} sessionId - ID de la sesión
 * @param {Object} photoData - Datos de la foto
 * @param {string} photoData.photoUrl - URL de la foto
 * @param {string} photoData.type - Tipo (before, after, progress)
 * @param {string} [photoData.description] - Descripción
 * @returns {Promise<Object>} Sesión con foto agregada
 */
export const addSessionPhoto = async (sessionId, photoData) => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/photos`, photoData);
    return response.data;
  } catch (error) {
    console.error('Error adding session photo:', error);
    throw new Error(error.response?.data?.error || 'Error al agregar foto');
  }
};

/**
 * Eliminar foto de sesión
 * @param {string} sessionId - ID de la sesión
 * @param {number} photoIndex - Índice de la foto a eliminar
 * @returns {Promise<Object>} Sesión con foto eliminada
 */
export const deleteSessionPhoto = async (sessionId, photoIndex) => {
  try {
    const response = await apiClient.delete(`/api/treatment-plans/sessions/${sessionId}/photos/${photoIndex}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting session photo:', error);
    throw new Error(error.response?.data?.error || 'Error al eliminar foto');
  }
};

// ================================
// PAYMENTS - GESTIÓN POR SESIÓN
// ================================

/**
 * Registrar pago de sesión
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object>} Sesión y plan actualizados
 */
export const registerSessionPayment = async (sessionId) => {
  try {
    const response = await apiClient.post(`/api/treatment-plans/sessions/${sessionId}/payment`);
    return response.data;
  } catch (error) {
    console.error('Error registering session payment:', error);
    throw new Error(error.response?.data?.error || 'Error al registrar pago de sesión');
  }
};

// ================================
// UTILIDADES Y VALIDACIONES
// ================================

/**
 * Validar datos de plan de tratamiento
 * @param {Object} planData - Datos del plan
 * @returns {Object} Resultado de validación
 */
export const validateTreatmentPlanData = (planData) => {
  const errors = {};
  
  if (!planData.clientId) {
    errors.clientId = 'El cliente es obligatorio';
  }
  
  if (!planData.serviceId) {
    errors.serviceId = 'El servicio es obligatorio';
  }
  
  if (!planData.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria';
  }
  
  if (!planData.paymentPlan) {
    errors.paymentPlan = 'El plan de pago es obligatorio';
  } else if (!Object.values(TREATMENT_CONSTANTS.PAYMENT_PLANS).includes(planData.paymentPlan)) {
    errors.paymentPlan = 'Plan de pago inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calcular progreso del plan
 * @param {Object} plan - Plan de tratamiento
 * @returns {Object} Información de progreso
 */
export const calculatePlanProgress = (plan) => {
  if (!plan) return { percentage: 0, completed: 0, total: 0 };
  
  const total = plan.totalSessions || 0;
  const completed = plan.completedSessions || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    percentage,
    completed,
    total,
    remaining: total - completed
  };
};

/**
 * Calcular progreso de pagos
 * @param {Object} plan - Plan de tratamiento
 * @returns {Object} Información de pagos
 */
export const calculatePaymentProgress = (plan) => {
  if (!plan) return { percentage: 0, paid: 0, total: 0, remaining: 0 };
  
  const total = plan.totalPrice || 0;
  const paid = plan.paidAmount || 0;
  const remaining = total - paid;
  const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
  
  return {
    percentage,
    paid,
    total,
    remaining,
    isFullyPaid: remaining <= 0
  };
};

/**
 * Formatear plan de tratamiento para UI
 * @param {Object} plan - Plan de tratamiento
 * @returns {Object} Plan formateado
 */
export const formatTreatmentPlan = (plan) => {
  const progress = calculatePlanProgress(plan);
  const payment = calculatePaymentProgress(plan);
  
  return {
    ...plan,
    progress,
    payment,
    statusLabel: TREATMENT_CONSTANTS.PLAN_STATUS[plan.status] || plan.status,
    paymentPlanLabel: TREATMENT_CONSTANTS.PAYMENT_PLANS[plan.paymentPlan] || plan.paymentPlan,
    formattedTotalPrice: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(plan.totalPrice || 0),
    formattedPaidAmount: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(plan.paidAmount || 0),
    formattedRemainingAmount: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(payment.remaining)
  };
};

/**
 * Formatear sesión para UI
 * @param {Object} session - Sesión
 * @returns {Object} Sesión formateada
 */
export const formatSession = (session) => {
  return {
    ...session,
    statusLabel: TREATMENT_CONSTANTS.SESSION_STATUS[session.status] || session.status,
    isScheduled: session.status === TREATMENT_CONSTANTS.SESSION_STATUS.SCHEDULED,
    isPending: session.status === TREATMENT_CONSTANTS.SESSION_STATUS.PENDING,
    isCompleted: session.status === TREATMENT_CONSTANTS.SESSION_STATUS.COMPLETED,
    isCancelled: session.status === TREATMENT_CONSTANTS.SESSION_STATUS.CANCELLED,
    isNoShow: session.status === TREATMENT_CONSTANTS.SESSION_STATUS.NO_SHOW,
    formattedPrice: session.price ? new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(session.price) : 'N/A',
    hasPhotos: session.photosUrls && session.photosUrls.length > 0,
    photoCount: session.photosUrls ? session.photosUrls.length : 0
  };
};

/**
 * Obtener siguiente sesión pendiente
 * @param {Object} plan - Plan de tratamiento
 * @returns {Object|null} Siguiente sesión pendiente o null
 */
export const getNextPendingSession = (plan) => {
  if (!plan || !plan.sessions) return null;
  
  return plan.sessions.find(session => 
    session.status === TREATMENT_CONSTANTS.SESSION_STATUS.PENDING
  ) || null;
};

/**
 * Verificar si se puede agendar siguiente sesión
 * @param {Object} plan - Plan de tratamiento
 * @returns {boolean} true si se puede agendar
 */
export const canScheduleNextSession = (plan) => {
  if (!plan) return false;
  if (plan.status !== TREATMENT_CONSTANTS.PLAN_STATUS.ACTIVE) return false;
  
  return !!getNextPendingSession(plan);
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

// CRUD de planes
export const treatmentPlansCRUD = {
  createTreatmentPlan,
  getTreatmentPlan,
  getTreatmentPlans,
  getClientTreatmentPlans,
  updateTreatmentPlan,
  cancelTreatmentPlan,
  addPlanPayment
};

// Gestión de sesiones
export const treatmentSessions = {
  getSession,
  scheduleSession,
  completeSession,
  cancelSession,
  rescheduleSession,
  markSessionNoShow
};

// Gestión de fotos
export const sessionPhotos = {
  addSessionPhoto,
  deleteSessionPhoto
};

// Gestión de pagos
export const sessionPayments = {
  registerSessionPayment
};

// Utilidades
export const treatmentUtils = {
  validateTreatmentPlanData,
  calculatePlanProgress,
  calculatePaymentProgress,
  formatTreatmentPlan,
  formatSession,
  getNextPendingSession,
  canScheduleNextSession
};

// Exportación por defecto
export default {
  // CRUD operations
  ...treatmentPlansCRUD,
  
  // Session management
  ...treatmentSessions,
  
  // Photo management
  ...sessionPhotos,
  
  // Payment management
  ...sessionPayments,
  
  // Utilities
  ...treatmentUtils,
  
  // Constants
  TREATMENT_CONSTANTS
};
