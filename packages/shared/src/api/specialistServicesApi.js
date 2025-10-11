/**
 * API Frontend para Gestión de Servicios de Especialistas
 * 
 * Proporciona funcionalidades para:
 * - Asignar servicios a especialistas
 * - Configurar precios personalizados
 * - Gestionar nivel de habilidad
 * - Configurar comisiones específicas
 * - Control de reservas online
 */

import { apiClient } from './client.js';

// ================================
// CONSTANTES
// ================================

export const SPECIALIST_SERVICE_CONSTANTS = {
  SKILL_LEVELS: {
    BEGINNER: 'Principiante',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado',
    EXPERT: 'Experto'
  },
  SKILL_LEVEL_VALUES: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
};

// ================================
// SERVICIOS DE ESPECIALISTA - CRUD
// ================================

/**
 * Obtener servicios asignados a un especialista
 * @param {string} businessId - ID del negocio
 * @param {string} specialistId - ID del especialista
 * @param {Object} params - Parámetros de filtrado
 * @param {boolean} [params.isActive] - Filtrar por servicios activos
 * @returns {Promise<Array>} Lista de servicios del especialista
 */
export const getSpecialistServices = async (businessId, specialistId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (typeof params.isActive === 'boolean') {
      queryParams.append('isActive', params.isActive);
    }

    const url = `/api/business/${businessId}/specialists/${specialistId}/services${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching specialist services:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener servicios del especialista');
  }
};

/**
 * Asignar servicio a especialista
 * @param {string} businessId - ID del negocio
 * @param {string} specialistId - ID del especialista
 * @param {Object} serviceData - Datos del servicio a asignar
 * @param {string} serviceData.serviceId - ID del servicio (obligatorio)
 * @param {number} [serviceData.customPrice] - Precio personalizado (null = usa precio base)
 * @param {string} [serviceData.skillLevel] - Nivel de habilidad (BEGINNER | INTERMEDIATE | ADVANCED | EXPERT)
 * @param {number} [serviceData.averageDuration] - Duración promedio en minutos
 * @param {number} [serviceData.commissionPercentage] - Comisión específica (0-100)
 * @param {boolean} [serviceData.canBeBooked] - Si puede reservarse online
 * @param {boolean} [serviceData.requiresApproval] - Si requiere aprobación
 * @param {number} [serviceData.maxBookingsPerDay] - Máximo de reservas diarias
 * @param {string} [serviceData.notes] - Notas adicionales
 * @returns {Promise<Object>} Servicio asignado
 */
export const assignServiceToSpecialist = async (businessId, specialistId, serviceData) => {
  try {
    const response = await apiClient.post(`/api/business/${businessId}/specialists/${specialistId}/services`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error assigning service to specialist:', error);
    throw new Error(error.response?.data?.error || 'Error al asignar servicio al especialista');
  }
};

/**
 * Actualizar configuración de un servicio del especialista
 * @param {string} businessId - ID del negocio
 * @param {string} specialistId - ID del especialista
 * @param {string} serviceId - ID del servicio
 * @param {Object} updateData - Datos a actualizar
 * @param {number} [updateData.customPrice] - Precio personalizado
 * @param {boolean} [updateData.isActive] - Si está activo
 * @param {string} [updateData.skillLevel] - Nivel de habilidad
 * @param {number} [updateData.averageDuration] - Duración promedio
 * @param {number} [updateData.commissionPercentage] - Comisión
 * @param {boolean} [updateData.canBeBooked] - Puede reservarse
 * @param {boolean} [updateData.requiresApproval] - Requiere aprobación
 * @param {number} [updateData.maxBookingsPerDay] - Máximo diario
 * @param {string} [updateData.notes] - Notas
 * @returns {Promise<Object>} Servicio actualizado
 */
export const updateSpecialistService = async (businessId, specialistId, serviceId, updateData) => {
  try {
    const response = await apiClient.put(`/api/business/${businessId}/specialists/${specialistId}/services/${serviceId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating specialist service:', error);
    throw new Error(error.response?.data?.error || 'Error al actualizar servicio del especialista');
  }
};

/**
 * Remover un servicio de un especialista
 * @param {string} businessId - ID del negocio
 * @param {string} specialistId - ID del especialista
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const removeServiceFromSpecialist = async (businessId, specialistId, serviceId) => {
  try {
    const response = await apiClient.delete(`/api/business/${businessId}/specialists/${specialistId}/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing service from specialist:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar servicio del especialista');
  }
};

/**
 * Activar/Desactivar servicio del especialista
 * @param {string} businessId - ID del negocio
 * @param {string} specialistId - ID del especialista
 * @param {string} serviceId - ID del servicio
 * @param {boolean} isActive - Estado activo
 * @returns {Promise<Object>} Servicio actualizado
 */
export const toggleSpecialistServiceStatus = async (businessId, specialistId, serviceId, isActive) => {
  try {
    const response = await apiClient.patch(`/api/business/${businessId}/specialists/${specialistId}/services/${serviceId}/toggle-status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling specialist service status:', error);
    throw new Error(error.response?.data?.error || 'Error al cambiar estado del servicio');
  }
};

// ================================
// UTILIDADES Y VALIDACIONES
// ================================

/**
 * Validar datos de asignación de servicio
 * @param {Object} serviceData - Datos del servicio
 * @returns {Object} Resultado de validación
 */
export const validateSpecialistServiceData = (serviceData) => {
  const errors = {};

  // ServiceId obligatorio
  if (!serviceData.serviceId) {
    errors.serviceId = 'Debe seleccionar un servicio';
  }

  // Validar precio personalizado si está presente
  if (serviceData.customPrice !== undefined && serviceData.customPrice !== null) {
    if (serviceData.customPrice < 0) {
      errors.customPrice = 'El precio no puede ser negativo';
    }
  }

  // Validar nivel de habilidad si está presente
  if (serviceData.skillLevel && !SPECIALIST_SERVICE_CONSTANTS.SKILL_LEVEL_VALUES.includes(serviceData.skillLevel)) {
    errors.skillLevel = 'Nivel de habilidad inválido';
  }

  // Validar comisión si está presente
  if (serviceData.commissionPercentage !== undefined && serviceData.commissionPercentage !== null) {
    if (serviceData.commissionPercentage < 0 || serviceData.commissionPercentage > 100) {
      errors.commissionPercentage = 'La comisión debe estar entre 0 y 100%';
    }
  }

  // Validar duración si está presente
  if (serviceData.averageDuration !== undefined && serviceData.averageDuration !== null) {
    if (serviceData.averageDuration <= 0) {
      errors.averageDuration = 'La duración debe ser mayor a 0 minutos';
    }
  }

  // Validar máximo de reservas si está presente
  if (serviceData.maxBookingsPerDay !== undefined && serviceData.maxBookingsPerDay !== null) {
    if (serviceData.maxBookingsPerDay <= 0) {
      errors.maxBookingsPerDay = 'El máximo de reservas debe ser mayor a 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formatear datos de servicio de especialista para mostrar
 * @param {Object} specialistService - Datos del servicio del especialista
 * @returns {Object} Servicio formateado
 */
export const formatSpecialistServiceData = (specialistService) => {
  const finalPrice = specialistService.customPrice !== null && specialistService.customPrice !== undefined
    ? specialistService.customPrice
    : specialistService.service?.price || 0;

  return {
    ...specialistService,
    formattedPrice: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(finalPrice),
    formattedBasePrice: specialistService.service?.price ? new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(specialistService.service.price) : 'N/A',
    isPriceCustomized: specialistService.customPrice !== null && specialistService.customPrice !== undefined,
    skillLevelLabel: SPECIALIST_SERVICE_CONSTANTS.SKILL_LEVELS[specialistService.skillLevel] || 'No especificado',
    statusLabel: specialistService.isActive ? 'Activo' : 'Inactivo',
    bookingStatusLabel: specialistService.canBeBooked ? 'Reservable' : 'No reservable',
    formattedDuration: specialistService.averageDuration 
      ? `${specialistService.averageDuration} min`
      : (specialistService.service?.duration ? `${specialistService.service.duration} min` : 'N/A'),
    formattedCommission: specialistService.commissionPercentage !== null && specialistService.commissionPercentage !== undefined
      ? `${specialistService.commissionPercentage}%`
      : 'No especificada'
  };
};

/**
 * Calcular precio final (personalizado o base)
 * @param {Object} specialistService - Datos del servicio del especialista
 * @returns {number} Precio final
 */
export const getFinalPrice = (specialistService) => {
  return specialistService.customPrice !== null && specialistService.customPrice !== undefined
    ? specialistService.customPrice
    : specialistService.service?.price || 0;
};

/**
 * Verificar si el especialista puede ofrecer el servicio
 * @param {Object} specialistService - Datos del servicio del especialista
 * @returns {boolean} True si puede ofrecer el servicio
 */
export const canOfferService = (specialistService) => {
  return specialistService.isActive && specialistService.canBeBooked;
};

/**
 * Obtener color según nivel de habilidad
 * @param {string} skillLevel - Nivel de habilidad
 * @returns {string} Color hexadecimal
 */
export const getSkillLevelColor = (skillLevel) => {
  const colors = {
    BEGINNER: '#94a3b8',    // Gris
    INTERMEDIATE: '#3b82f6', // Azul
    ADVANCED: '#8b5cf6',     // Púrpura
    EXPERT: '#f59e0b'        // Ámbar/Dorado
  };
  return colors[skillLevel] || '#6b7280';
};

/**
 * Preparar datos para asignación
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos preparados para la API
 */
export const prepareServiceAssignmentData = (formData) => {
  const data = {
    serviceId: formData.serviceId
  };

  // Solo agregar campos si tienen valor
  if (formData.customPrice !== undefined && formData.customPrice !== null && formData.customPrice !== '') {
    data.customPrice = parseFloat(formData.customPrice);
  } else {
    data.customPrice = null; // Usar precio base
  }

  if (formData.skillLevel) {
    data.skillLevel = formData.skillLevel;
  }

  if (formData.averageDuration) {
    data.averageDuration = parseInt(formData.averageDuration);
  }

  if (formData.commissionPercentage !== undefined && formData.commissionPercentage !== null && formData.commissionPercentage !== '') {
    data.commissionPercentage = parseFloat(formData.commissionPercentage);
  }

  if (formData.canBeBooked !== undefined) {
    data.canBeBooked = formData.canBeBooked;
  }

  if (formData.requiresApproval !== undefined) {
    data.requiresApproval = formData.requiresApproval;
  }

  if (formData.maxBookingsPerDay) {
    data.maxBookingsPerDay = parseInt(formData.maxBookingsPerDay);
  }

  if (formData.notes) {
    data.notes = formData.notes;
  }

  return data;
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

export const specialistServicesCRUD = {
  getSpecialistServices,
  assignServiceToSpecialist,
  updateSpecialistService,
  removeServiceFromSpecialist,
  toggleSpecialistServiceStatus
};

export const specialistServicesUtils = {
  validateSpecialistServiceData,
  formatSpecialistServiceData,
  getFinalPrice,
  canOfferService,
  getSkillLevelColor,
  prepareServiceAssignmentData
};

// Exportación por defecto
export default {
  ...specialistServicesCRUD,
  ...specialistServicesUtils,
  SPECIALIST_SERVICE_CONSTANTS
};
