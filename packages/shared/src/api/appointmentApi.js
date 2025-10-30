import { api } from './client';

/**
 * 📆 APPOINTMENT API
 * Gestión de citas - CRUD + Validaciones de cierre
 * 
 * Funcionalidades:
 * - CRUD básico de citas
 * - Gestión de estados (confirmar, iniciar, cancelar)
 * - Validaciones de cierre con reglas de negocio
 * - Upload de evidencia (fotos antes/después)
 * - Reprogramación con validaciones
 */

const appointmentApi = {
  // ==================== CRUD BÁSICO ====================

  /**
   * Obtener lista de citas con filtros
   * @param {Object} filters - Filtros opcionales (businessId, specialistId, status, date, etc.)
   * @returns {Promise} { success, data: { appointments, pagination } }
   */
  getAppointments: async (filters = {}) => {
    const response = await api.get('/api/appointments', { params: filters });
    return response.data;
  },

  /**
   * Obtener cita por ID
   * @param {string} appointmentId - ID de la cita
   * @returns {Promise} { success, data: appointment }
   */
  getAppointmentById: async (appointmentId) => {
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return response.data;
  },

  /**
   * Crear nueva cita
   * @param {Object} appointmentData - Datos de la cita (businessId, clientId, specialistId, serviceId, date, startTime, endTime, notes)
   * @returns {Promise} { success, data: appointment, message }
   */
  createAppointment: async (appointmentData) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },

  /**
   * Actualizar cita existente
   * @param {string} appointmentId - ID de la cita
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise} { success, data: appointment, message }
   */
  updateAppointment: async (appointmentId, updateData) => {
    const response = await api.put(`/api/appointments/${appointmentId}`, updateData);
    return response.data;
  },

  /**
   * Actualizar estado de cita
   * @param {string} appointmentId - ID de la cita
   * @param {Object} statusData - { status, businessId, notes? }
   * @returns {Promise} { success, data: appointment, message }
   */
  updateAppointmentStatus: async (appointmentId, statusData) => {
    const response = await api.patch(`/api/appointments/${appointmentId}/status`, statusData);
    return response.data;
  },

  /**
   * Cancelar cita
   * @param {string} appointmentId - ID de la cita
   * @param {Object} cancelData - { reason, businessId }
   * @returns {Promise} { success, data: appointment, message }
   */
  cancelAppointment: async (appointmentId, cancelData) => {
    const response = await api.patch(`/api/appointments/${appointmentId}/cancel`, cancelData);
    return response.data;
  },

  /**
   * Obtener citas por rango de fechas (para vista de calendario)
   * @param {Object} filters - { businessId, startDate, endDate, specialistId? }
   * @returns {Promise} { success, data: { appointments } }
   */
  getAppointmentsByDateRange: async (filters) => {
    const response = await api.get('/api/appointments/date-range', { params: filters });
    return response.data;
  },

  // ==================== VALIDACIONES Y CIERRE DE CITAS ====================

  /**
   * ✅ Completar cita con validaciones de reglas de negocio
   * 
   * Validaciones que se ejecutan en backend:
   * - REQUIRE_CONSENT_FOR_COMPLETION: Verifica consentimiento firmado
   * - REQUIRE_BEFORE_PHOTO: Verifica foto de antes
   * - REQUIRE_AFTER_PHOTO: Verifica foto de después
   * - REQUIRE_BOTH_PHOTOS: Verifica ambas fotos
   * - REQUIRE_FULL_PAYMENT: Verifica pago del 100%
   * - REQUIRE_MINIMUM_PAYMENT: Verifica pago mínimo (%)
   * - MINIMUM_DURATION: Advierte si duración < mínimo
   * - MAXIMUM_DURATION: Advierte si duración > máximo
   * - REQUIRE_CLIENT_SIGNATURE: Verifica firma del cliente
   * - REQUIRE_CLIENT_FEEDBACK: Verifica feedback del cliente
   * 
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @param {Object} completionData - { rating?, feedback?, finalAmount? }
   * @returns {Promise} { 
   *   success: boolean, 
   *   data: appointment, 
   *   message: string,
   *   warnings?: string[],
   *   validationErrors?: string[] 
   * }
   * 
   * @throws {Error} Si falta consentimiento, fotos, pago, etc.
   */
  completeAppointment: async (appointmentId, businessId, completionData) => {
    const response = await api.patch(
      `/api/appointments/${appointmentId}/complete?businessId=${businessId}`,
      completionData
    );
    return response.data;
  },

  /**
   * 🔄 Reprogramar cita con validaciones
   * 
   * Validaciones que se ejecutan:
   * - No permitir reprogramar a fecha pasada
   * - Verificar disponibilidad del especialista
   * - Validar límite de reprogramaciones (si aplica regla de negocio)
   * - Verificar si requiere aprobación del negocio
   * 
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @param {Object} rescheduleData - { newStartTime, newEndTime, reason }
   * @returns {Promise} { 
   *   success: boolean, 
   *   data: appointment, 
   *   message: string,
   *   warnings?: string[],
   *   validationErrors?: string[] 
   * }
   */
  rescheduleAppointment: async (appointmentId, businessId, rescheduleData) => {
    const response = await api.post(
      `/api/appointments/${appointmentId}/reschedule?businessId=${businessId}`,
      rescheduleData
    );
    return response.data;
  },

  /**
   * 📸 Subir evidencia (fotos/documentos) de procedimiento
   * 
   * Tipos de evidencia soportados:
   * - 'before': Foto de antes del procedimiento
   * - 'after': Foto de después del procedimiento
   * - 'both': Ambas fotos (antes y después)
   * - 'documents': Documentos adicionales (PDF, imágenes)
   * 
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @param {FormData} formData - FormData con:
   *   - files: Array de archivos (imágenes/PDFs)
   *   - type: 'before' | 'after' | 'both' | 'documents'
   * @returns {Promise} { 
   *   success: boolean, 
   *   data: { appointmentId, evidence: { before?, after?, documents? } },
   *   message: string 
   * }
   */
  uploadEvidence: async (appointmentId, businessId, formData) => {
    const response = await api.post(
      `/api/appointments/${appointmentId}/evidence?businessId=${businessId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Validar si una cita puede ser completada (sin completarla)
   * Útil para mostrar alertas previas antes de intentar completar
   * 
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { 
   *   canComplete: boolean, 
   *   errors: string[], 
   *   warnings: string[] 
   * }
   */
  validateCompletion: async (appointmentId, businessId) => {
    const response = await api.get(
      `/api/appointments/${appointmentId}/validate-completion?businessId=${businessId}`
    );
    return response.data;
  },

  /**
   * Obtener historial de una cita (cambios de estado, evidencias, etc.)
   * 
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, data: { history: [], evidence: {} } }
   */
  getAppointmentHistory: async (appointmentId, businessId) => {
    const response = await api.get(
      `/api/appointments/${appointmentId}/history?businessId=${businessId}`
    );
    return response.data;
  },

  // ==================== PAYMENT MANAGEMENT ====================

  /**
   * Obtener historial de pagos de una cita
   * @param {string} appointmentId - ID de la cita
   * @param {string} businessId - ID del negocio
   * @returns {Promise} { success, data: { payments } }
   */
  getAppointmentPayments: async (appointmentId, businessId) => {
    const response = await api.get(`/api/appointments/${appointmentId}/payments`, {
      params: { businessId }
    });
    return response.data;
  },

  /**
   * Registrar un pago de cita
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise} { success, data: payment, message }
   */
  registerPayment: async (paymentData) => {
    const response = await api.post(`/api/appointments/${paymentData.appointmentId}/payments`, paymentData);
    return response.data;
  },

  /**
   * Subir comprobante de pago
   * @param {string} appointmentId - ID de la cita
   * @param {string} paymentId - ID del pago
   * @param {FormData} formData - Datos del archivo
   * @returns {Promise} { success, data: payment, message }
   */
  uploadPaymentProof: async (appointmentId, paymentId, formData) => {
    const response = await api.post(
      `/api/appointments/${appointmentId}/payments/${paymentId}/proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};

export default appointmentApi;
