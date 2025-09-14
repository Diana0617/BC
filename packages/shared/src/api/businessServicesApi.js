/**
 * API Frontend para Gestión de Servicios del Negocio
 * 
 * Proporciona funcionalidades completas para:
 * - CRUD de servicios/procedimientos
 * - Gestión de categorías y precios
 * - Configuración de comisiones
 * - Subida de imágenes
 * - Gestión de disponibilidad y configuraciones
 * - Estadísticas y reportes
 */

import { apiClient } from './apiClient';

// ================================
// CONSTANTES Y CONFIGURACIONES
// ================================

export const SERVICE_CONSTANTS = {
  COMMISSION_TYPES: {
    PERCENTAGE: 'PERCENTAGE',
    FIXED: 'FIXED'
  },
  CATEGORIES: {
    FACIAL: 'Tratamientos Faciales',
    CORPORAL: 'Tratamientos Corporales',
    CABELLO: 'Cabello',
    UNAS: 'Uñas',
    ESTETICA: 'Estética',
    MASAJES: 'Masajes',
    DEPILACION: 'Depilación',
    MAQUILLAJE: 'Maquillaje',
    OTROS: 'Otros'
  },
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    DRAFT: 'DRAFT'
  },
  BOOKING_SETTINGS: {
    ONLINE_ENABLED: 'onlineBookingEnabled',
    ADVANCE_DAYS: 'advanceBookingDays',
    REQUIRES_APPROVAL: 'requiresApproval',
    ALLOW_WAITLIST: 'allowWaitlist'
  }
};

// ================================
// SERVICIOS CRUD
// ================================

/**
 * Obtener lista de servicios del negocio
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.category] - Filtrar por categoría
 * @param {boolean} [params.isActive] - Filtrar por estado activo
 * @param {string} [params.search] - Búsqueda por nombre o descripción
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados por página
 * @param {string} [params.sortBy] - Campo para ordenar (name, price, duration, category)
 * @param {string} [params.sortOrder] - Orden (asc, desc)
 * @returns {Promise<Object>} Lista de servicios con metadatos de paginación
 */
export const getServices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (typeof params.isActive === 'boolean') queryParams.append('isActive', params.isActive);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/business/config/services?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener servicios');
  }
};

/**
 * Obtener servicio específico por ID
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Object>} Datos del servicio
 */
export const getService = async (serviceId) => {
  try {
    const response = await apiClient.get(`/business/config/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener servicio');
  }
};

/**
 * Crear nuevo servicio
 * @param {Object} serviceData - Datos del servicio
 * @param {string} serviceData.name - Nombre del servicio (obligatorio)
 * @param {string} [serviceData.description] - Descripción del servicio
 * @param {string} [serviceData.category] - Categoría del servicio
 * @param {number} serviceData.price - Precio del servicio (obligatorio)
 * @param {number} serviceData.duration - Duración en minutos (obligatorio)
 * @param {boolean} [serviceData.requiresConsent] - Si requiere consentimiento
 * @param {string} [serviceData.consentTemplate] - Plantilla de consentimiento
 * @param {string} [serviceData.color] - Color para identificación visual
 * @param {number} [serviceData.preparationTime] - Tiempo de preparación en minutos
 * @param {number} [serviceData.cleanupTime] - Tiempo de limpieza en minutos
 * @param {number} [serviceData.maxConcurrent] - Máximo de servicios concurrentes
 * @param {Array} [serviceData.requiresEquipment] - Equipamiento requerido
 * @param {Array} [serviceData.skillsRequired] - Habilidades requeridas
 * @param {Array} [serviceData.tags] - Etiquetas del servicio
 * @param {Object} [serviceData.commission] - Configuración de comisiones
 * @param {Object} [serviceData.bookingSettings] - Configuración de reservas
 * @returns {Promise<Object>} Servicio creado
 */
export const createService = async (serviceData) => {
  try {
    const response = await apiClient.post('/business/config/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw new Error(error.response?.data?.message || 'Error al crear servicio');
  }
};

/**
 * Actualizar servicio existente
 * @param {string} serviceId - ID del servicio
 * @param {Object} serviceData - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 */
export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await apiClient.put(`/business/config/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar servicio');
  }
};

/**
 * Eliminar servicio
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteService = async (serviceId) => {
  try {
    const response = await apiClient.delete(`/business/config/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar servicio');
  }
};

/**
 * Activar/Desactivar servicio
 * @param {string} serviceId - ID del servicio
 * @param {boolean} isActive - Estado activo
 * @returns {Promise<Object>} Servicio actualizado
 */
export const toggleServiceStatus = async (serviceId, isActive) => {
  try {
    const response = await apiClient.patch(`/business/config/services/${serviceId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling service status:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado del servicio');
  }
};

// ================================
// GESTIÓN DE IMÁGENES
// ================================

/**
 * Subir imagen del servicio
 * @param {string} serviceId - ID del servicio
 * @param {File} imageFile - Archivo de imagen
 * @param {string} [description] - Descripción de la imagen
 * @returns {Promise<Object>} URL de la imagen subida
 */
export const uploadServiceImage = async (serviceId, imageFile, description = '') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (description) formData.append('description', description);

    const response = await apiClient.post(
      `/business/config/services/${serviceId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading service image:', error);
    throw new Error(error.response?.data?.message || 'Error al subir imagen del servicio');
  }
};

/**
 * Eliminar imagen del servicio
 * @param {string} serviceId - ID del servicio
 * @param {string} imageId - ID de la imagen
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteServiceImage = async (serviceId, imageId) => {
  try {
    const response = await apiClient.delete(`/business/config/services/${serviceId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service image:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar imagen del servicio');
  }
};

/**
 * Reordenar imágenes del servicio
 * @param {string} serviceId - ID del servicio
 * @param {Array<string>} imageIds - Array de IDs en el orden deseado
 * @returns {Promise<Object>} Confirmación de reordenación
 */
export const reorderServiceImages = async (serviceId, imageIds) => {
  try {
    const response = await apiClient.patch(`/business/config/services/${serviceId}/images/reorder`, { imageIds });
    return response.data;
  } catch (error) {
    console.error('Error reordering service images:', error);
    throw new Error(error.response?.data?.message || 'Error al reordenar imágenes del servicio');
  }
};

// ================================
// GESTIÓN DE CATEGORÍAS
// ================================

/**
 * Obtener categorías de servicios del negocio
 * @returns {Promise<Array>} Lista de categorías con conteos
 */
export const getServiceCategories = async () => {
  try {
    const response = await apiClient.get('/business/config/services/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener categorías');
  }
};

/**
 * Crear nueva categoría personalizada
 * @param {Object} categoryData - Datos de la categoría
 * @param {string} categoryData.name - Nombre de la categoría
 * @param {string} [categoryData.description] - Descripción
 * @param {string} [categoryData.color] - Color de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
export const createServiceCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/business/config/services/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating service category:', error);
    throw new Error(error.response?.data?.message || 'Error al crear categoría');
  }
};

/**
 * Actualizar categoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} categoryData - Datos a actualizar
 * @returns {Promise<Object>} Categoría actualizada
 */
export const updateServiceCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.put(`/business/config/services/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating service category:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar categoría');
  }
};

/**
 * Eliminar categoría
 * @param {string} categoryId - ID de la categoría
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteServiceCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/business/config/services/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar categoría');
  }
};

// ================================
// CONFIGURACIÓN DE COMISIONES
// ================================

/**
 * Obtener configuración de comisiones por servicio
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Object>} Configuración de comisiones
 */
export const getServiceCommissions = async (serviceId) => {
  try {
    const response = await apiClient.get(`/business/config/services/${serviceId}/commissions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service commissions:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración de comisiones');
  }
};

/**
 * Configurar comisiones de servicio
 * @param {string} serviceId - ID del servicio
 * @param {Object} commissionData - Configuración de comisiones
 * @param {string} commissionData.type - Tipo de comisión (PERCENTAGE, FIXED)
 * @param {number} commissionData.value - Valor de la comisión
 * @param {number} commissionData.specialistPercentage - Porcentaje para especialista
 * @param {number} commissionData.businessPercentage - Porcentaje para negocio
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateServiceCommissions = async (serviceId, commissionData) => {
  try {
    const response = await apiClient.put(`/business/config/services/${serviceId}/commissions`, commissionData);
    return response.data;
  } catch (error) {
    console.error('Error updating service commissions:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar configuración de comisiones');
  }
};

/**
 * Configurar comisiones personalizadas por especialista
 * @param {string} serviceId - ID del servicio
 * @param {string} specialistId - ID del especialista
 * @param {Object} commissionData - Configuración personalizada
 * @returns {Promise<Object>} Configuración personalizada creada
 */
export const setSpecialistServiceCommission = async (serviceId, specialistId, commissionData) => {
  try {
    const response = await apiClient.post(
      `/business/config/services/${serviceId}/commissions/specialist/${specialistId}`,
      commissionData
    );
    return response.data;
  } catch (error) {
    console.error('Error setting specialist service commission:', error);
    throw new Error(error.response?.data?.message || 'Error al configurar comisión personalizada');
  }
};

// ================================
// CONFIGURACIÓN DE RESERVAS
// ================================

/**
 * Obtener configuración de reservas del servicio
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Object>} Configuración de reservas
 */
export const getServiceBookingSettings = async (serviceId) => {
  try {
    const response = await apiClient.get(`/business/config/services/${serviceId}/booking-settings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service booking settings:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración de reservas');
  }
};

/**
 * Actualizar configuración de reservas
 * @param {string} serviceId - ID del servicio
 * @param {Object} bookingSettings - Configuración de reservas
 * @param {boolean} bookingSettings.onlineBookingEnabled - Habilitar reservas online
 * @param {number} bookingSettings.advanceBookingDays - Días de anticipación máxima
 * @param {boolean} bookingSettings.requiresApproval - Requiere aprobación manual
 * @param {boolean} bookingSettings.allowWaitlist - Permitir lista de espera
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateServiceBookingSettings = async (serviceId, bookingSettings) => {
  try {
    const response = await apiClient.put(`/business/config/services/${serviceId}/booking-settings`, bookingSettings);
    return response.data;
  } catch (error) {
    console.error('Error updating service booking settings:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar configuración de reservas');
  }
};

// ================================
// DISPONIBILIDAD Y ESPECIALISTAS
// ================================

/**
 * Obtener especialistas disponibles para un servicio
 * @param {string} serviceId - ID del servicio
 * @returns {Promise<Array>} Lista de especialistas disponibles
 */
export const getServiceSpecialists = async (serviceId) => {
  try {
    const response = await apiClient.get(`/business/config/services/${serviceId}/specialists`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service specialists:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener especialistas del servicio');
  }
};

/**
 * Asignar especialista a servicio
 * @param {string} serviceId - ID del servicio
 * @param {string} specialistId - ID del especialista
 * @returns {Promise<Object>} Confirmación de asignación
 */
export const assignSpecialistToService = async (serviceId, specialistId) => {
  try {
    const response = await apiClient.post(`/business/config/services/${serviceId}/specialists/${specialistId}`);
    return response.data;
  } catch (error) {
    console.error('Error assigning specialist to service:', error);
    throw new Error(error.response?.data?.message || 'Error al asignar especialista al servicio');
  }
};

/**
 * Desasignar especialista de servicio
 * @param {string} serviceId - ID del servicio
 * @param {string} specialistId - ID del especialista
 * @returns {Promise<Object>} Confirmación de desasignación
 */
export const unassignSpecialistFromService = async (serviceId, specialistId) => {
  try {
    const response = await apiClient.delete(`/business/config/services/${serviceId}/specialists/${specialistId}`);
    return response.data;
  } catch (error) {
    console.error('Error unassigning specialist from service:', error);
    throw new Error(error.response?.data?.message || 'Error al desasignar especialista del servicio');
  }
};

/**
 * Obtener horarios disponibles para un servicio en una fecha específica
 * @param {string} serviceId - ID del servicio
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} [specialistId] - ID del especialista específico
 * @returns {Promise<Array>} Lista de horarios disponibles
 */
export const getServiceAvailableSlots = async (serviceId, date, specialistId = null) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('serviceId', serviceId);
    queryParams.append('date', date);
    if (specialistId) queryParams.append('specialistId', specialistId);

    const response = await apiClient.get(`/business/config/available-slots?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service available slots:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener horarios disponibles');
  }
};

// ================================
// ESTADÍSTICAS Y REPORTES
// ================================

/**
 * Obtener estadísticas de servicios
 * @param {Object} params - Parámetros para las estadísticas
 * @param {string} [params.period] - Período (week, month, quarter, year)
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @param {string} [params.serviceId] - ID de servicio específico
 * @returns {Promise<Object>} Estadísticas de servicios
 */
export const getServicesStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.serviceId) queryParams.append('serviceId', params.serviceId);

    const response = await apiClient.get(`/business/config/services/stats?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services stats:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de servicios');
  }
};

/**
 * Obtener reporte de rendimiento de servicios
 * @param {Object} params - Parámetros para el reporte
 * @param {string} params.startDate - Fecha de inicio
 * @param {string} params.endDate - Fecha de fin
 * @param {string} [params.groupBy] - Agrupar por (service, category, specialist)
 * @returns {Promise<Object>} Reporte de rendimiento
 */
export const getServicesPerformanceReport = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const response = await apiClient.get(`/business/config/services/performance-report?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services performance report:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener reporte de rendimiento');
  }
};

/**
 * Obtener análisis de popularidad de servicios
 * @param {Object} params - Parámetros para el análisis
 * @param {string} [params.period] - Período de análisis
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Array>} Análisis de popularidad
 */
export const getServicesPopularityAnalysis = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiClient.get(`/business/config/services/popularity-analysis?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching services popularity analysis:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener análisis de popularidad');
  }
};

// ================================
// UTILIDADES Y VALIDACIONES
// ================================

/**
 * Validar datos de servicio antes de enviar
 * @param {Object} serviceData - Datos del servicio
 * @returns {Object} Resultado de validación
 */
export const validateServiceData = (serviceData) => {
  const errors = {};
  
  // Validaciones obligatorias
  if (!serviceData.name || serviceData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!serviceData.price || serviceData.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }
  
  if (!serviceData.duration || serviceData.duration <= 0) {
    errors.duration = 'La duración debe ser mayor a 0 minutos';
  }

  // Validación de color si está presente
  if (serviceData.color && !/^#[0-9A-F]{6}$/i.test(serviceData.color)) {
    errors.color = 'El color debe estar en formato hexadecimal (#RRGGBB)';
  }

  // Validación de comisiones si están presentes
  if (serviceData.commission) {
    const { specialistPercentage, businessPercentage } = serviceData.commission;
    if (specialistPercentage + businessPercentage !== 100) {
      errors.commission = 'Los porcentajes de comisión deben sumar 100%';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formatear datos de servicio para mostrar
 * @param {Object} service - Datos del servicio
 * @returns {Object} Servicio formateado
 */
export const formatServiceData = (service) => {
  return {
    ...service,
    formattedPrice: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(service.price),
    formattedDuration: `${service.duration} min`,
    formattedPreparationTime: service.preparationTime ? `${service.preparationTime} min` : 'No requerido',
    formattedCleanupTime: service.cleanupTime ? `${service.cleanupTime} min` : 'No requerido',
    categoryLabel: SERVICE_CONSTANTS.CATEGORIES[service.category] || service.category || 'Sin categoría',
    statusLabel: service.isActive ? 'Activo' : 'Inactivo'
  };
};

/**
 * Calcular precio total con comisiones
 * @param {number} basePrice - Precio base del servicio
 * @param {Object} commission - Configuración de comisiones
 * @returns {Object} Desglose de precios
 */
export const calculateServicePricing = (basePrice, commission) => {
  if (!commission || commission.type === 'PERCENTAGE') {
    const specialistAmount = (basePrice * (commission?.specialistPercentage || 50)) / 100;
    const businessAmount = basePrice - specialistAmount;
    
    return {
      basePrice,
      specialistAmount,
      businessAmount,
      totalPrice: basePrice,
      commission: commission || { type: 'PERCENTAGE', specialistPercentage: 50, businessPercentage: 50 }
    };
  } else if (commission.type === 'FIXED') {
    const specialistAmount = commission.value || 0;
    const businessAmount = basePrice - specialistAmount;
    
    return {
      basePrice,
      specialistAmount,
      businessAmount,
      totalPrice: basePrice,
      commission
    };
  }
};

/**
 * Obtener tiempo total estimado del servicio (incluyendo preparación y limpieza)
 * @param {Object} service - Datos del servicio
 * @returns {number} Tiempo total en minutos
 */
export const getTotalServiceTime = (service) => {
  return (service.preparationTime || 0) + service.duration + (service.cleanupTime || 0);
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

// Operaciones CRUD principales
export const servicesCRUD = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
};

// Gestión de imágenes
export const servicesImages = {
  uploadServiceImage,
  deleteServiceImage,
  reorderServiceImages
};

// Gestión de categorías
export const servicesCategories = {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory
};

// Configuración de comisiones
export const servicesCommissions = {
  getServiceCommissions,
  updateServiceCommissions,
  setSpecialistServiceCommission
};

// Configuración de reservas
export const servicesBooking = {
  getServiceBookingSettings,
  updateServiceBookingSettings,
  getServiceAvailableSlots
};

// Gestión de especialistas
export const servicesSpecialists = {
  getServiceSpecialists,
  assignSpecialistToService,
  unassignSpecialistFromService
};

// Estadísticas y reportes
export const servicesAnalytics = {
  getServicesStats,
  getServicesPerformanceReport,
  getServicesPopularityAnalysis
};

// Utilidades
export const servicesUtils = {
  validateServiceData,
  formatServiceData,
  calculateServicePricing,
  getTotalServiceTime
};

// Exportación por defecto con todas las funciones agrupadas
export default {
  // CRUD operations
  ...servicesCRUD,
  
  // Image management
  ...servicesImages,
  
  // Category management
  ...servicesCategories,
  
  // Commission management
  ...servicesCommissions,
  
  // Booking configuration
  ...servicesBooking,
  
  // Specialist management
  ...servicesSpecialists,
  
  // Analytics and reports
  ...servicesAnalytics,
  
  // Utilities
  ...servicesUtils,
  
  // Constants
  SERVICE_CONSTANTS
};