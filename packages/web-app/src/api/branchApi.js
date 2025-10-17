import apiClient from './client'

/**
 * API client para gestión de sucursales
 */
const branchApi = {
  /**
   * Obtener todas las sucursales de un negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Array>} Lista de sucursales
   */
  getBranches: async (businessId) => {
    const response = await apiClient.get(`/${businessId}/branches`)
    return response.data
  },

  /**
   * Obtener una sucursal específica
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @returns {Promise<Object>} Datos de la sucursal
   */
  getBranch: async (businessId, branchId) => {
    const response = await apiClient.get(`/${businessId}/branches/${branchId}`)
    return response.data
  },

  /**
   * Crear una nueva sucursal
   * @param {string} businessId - ID del negocio
   * @param {Object} branchData - Datos de la sucursal
   * @returns {Promise<Object>} Sucursal creada
   */
  createBranch: async (businessId, branchData) => {
    const response = await apiClient.post(`/${businessId}/branches`, branchData)
    return response.data
  },

  /**
   * Actualizar una sucursal existente
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {Object} branchData - Datos a actualizar
   * @returns {Promise<Object>} Sucursal actualizada
   */
  updateBranch: async (businessId, branchId, branchData) => {
    const response = await apiClient.put(`/${businessId}/branches/${branchId}`, branchData)
    return response.data
  },

  /**
   * Actualizar los horarios de atención de una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {Object} businessHours - Horarios por día de la semana
   * @example
   * {
   *   monday: { open: '09:00', close: '18:00', closed: false },
   *   tuesday: { open: '09:00', close: '18:00', closed: false },
   *   ...
   * }
   * @returns {Promise<Object>} Sucursal actualizada
   */
  updateBusinessHours: async (businessId, branchId, businessHours) => {
    const response = await apiClient.put(`/${businessId}/branches/${branchId}`, {
      businessHours
    })
    return response.data
  },

  /**
   * Obtener especialistas de una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @returns {Promise<Array>} Lista de especialistas
   */
  getBranchSpecialists: async (businessId, branchId) => {
    const response = await apiClient.get(`/${businessId}/branches/${branchId}/specialists`)
    return response.data
  },

  /**
   * Asignar especialistas a una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {Array<string>} specialistIds - IDs de especialistas a asignar
   * @returns {Promise<Object>} Resultado de la asignación
   */
  assignSpecialists: async (businessId, branchId, specialistIds) => {
    const response = await apiClient.post(`/${businessId}/branches/${branchId}/specialists`, {
      specialistIds
    })
    return response.data
  },

  /**
   * Obtener horarios de especialistas en una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @returns {Promise<Array>} Lista de horarios
   */
  getBranchSchedules: async (businessId, branchId) => {
    const response = await apiClient.get(`/${businessId}/branches/${branchId}/schedules`)
    return response.data
  },

  /**
   * Crear horario para un especialista en una sucursal
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {Object} scheduleData - Datos del horario
   * @returns {Promise<Object>} Horario creado
   */
  createSpecialistSchedule: async (businessId, branchId, scheduleData) => {
    const response = await apiClient.post(`/${businessId}/branches/${branchId}/schedules`, scheduleData)
    return response.data
  },

  /**
   * Actualizar horario de un especialista
   * @param {string} businessId - ID del negocio
   * @param {string} branchId - ID de la sucursal
   * @param {string} scheduleId - ID del horario
   * @param {Object} scheduleData - Datos a actualizar
   * @returns {Promise<Object>} Horario actualizado
   */
  updateSpecialistSchedule: async (businessId, branchId, scheduleId, scheduleData) => {
    const response = await apiClient.put(
      `/${businessId}/branches/${branchId}/schedules/${scheduleId}`,
      scheduleData
    )
    return response.data
  }
}

export default branchApi
