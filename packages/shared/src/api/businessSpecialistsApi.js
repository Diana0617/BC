
import { apiClient } from './client.js';
// ================================
// BUSINESS SPECIALISTS MANAGEMENT API
// ================================

/**
 * API para gestión de especialistas del negocio
 * Incluye CRUD completo, gestión de horarios, documentos y comisiones
 */
class BusinessSpecialistsAPI {

  /**
   * Obtener lista de especialistas del negocio
   */
  static async getSpecialists(businessId, filters = {}) {
    try {
      const {
        isActive,
        status,
        specialization,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = filters;

      const queryParams = new URLSearchParams({
        ...(isActive !== undefined && { isActive: isActive.toString() }),
        ...(status && { status }),
        ...(specialization && { specialization }),
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      const response = await apiClient.get(`/business/${businessId}/config/specialists?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo especialistas:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de un especialista específico
   */
  static async getSpecialistById(businessId, specialistId) {
    try {
      const response = await apiClient.get(`/business/${businessId}/config/specialists/${specialistId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo especialista:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo especialista
   */
  static async createSpecialist(businessId, specialistData) {
    try {
      const { userData, profileData } = specialistData;

      // Validar datos obligatorios
      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new Error('Email, nombre y apellido son obligatorios');
      }

      const response = await apiClient.post(`/business/${businessId}/config/specialists`, {
        userData: {
          ...userData,
          role: 'SPECIALIST',
          businessId
        },
        profileData: {
          ...profileData,
          businessId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creando especialista:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de especialista
   */
  static async updateSpecialistProfile(businessId, profileId, profileData) {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/config/specialists/${profileId}`, 
        profileData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando especialista:', error);
      throw error;
    }
  }

  /**
   * Actualizar datos básicos del usuario especialista
   */
  static async updateSpecialistUser(businessId, userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar/Desactivar especialista
   */
  static async deleteSpecialist(businessId, profileId, force = false) {
    try {
      const queryParams = force ? '?force=true' : '';
      const response = await apiClient.delete(
        `/business/${businessId}/config/specialists/${profileId}${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando especialista:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar especialista
   */
  static async toggleSpecialistStatus(businessId, profileId, isActive) {
    try {
      const response = await apiClient.patch(
        `/business/${businessId}/config/specialists/${profileId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error) {
      console.error('Error cambiando estado del especialista:', error);
      throw error;
    }
  }

  // ================================
  // GESTIÓN DE HORARIOS
  // ================================

  /**
   * Obtener horarios de un especialista
   */
  static async getSpecialistSchedule(businessId, specialistId) {
    try {
      const response = await apiClient.get(`/business/${businessId}/config/specialists/${specialistId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      throw error;
    }
  }

  /**
   * Actualizar horarios de especialista
   */
  static async updateSpecialistSchedule(businessId, specialistId, scheduleData) {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/config/specialists/${specialistId}/schedule`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando horarios:', error);
      throw error;
    }
  }

  /**
   * Obtener disponibilidad de especialista por rango de fechas
   */
  static async getSpecialistAvailability(businessId, specialistId, startDate, endDate) {
    try {
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await apiClient.get(
        `/business/${businessId}/config/specialists/${specialistId}/availability?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo disponibilidad:', error);
      throw error;
    }
  }

  // ================================
  // GESTIÓN DE DOCUMENTOS
  // ================================

  /**
   * Obtener documentos de un especialista
   */
  static async getSpecialistDocuments(businessId, specialistId) {
    try {
      const response = await apiClient.get(`/business/${businessId}/config/specialists/${specialistId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      throw error;
    }
  }

  /**
   * Subir documento para especialista
   */
  static async uploadSpecialistDocument(businessId, specialistId, documentData) {
    try {
      const formData = new FormData();
      
      if (documentData.file) {
        formData.append('document', documentData.file);
      }
      
      formData.append('documentType', documentData.documentType);
      formData.append('description', documentData.description || '');
      formData.append('expirationDate', documentData.expirationDate || '');

      const response = await apiClient.post(
        `/business/${businessId}/config/specialists/${specialistId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error subiendo documento:', error);
      throw error;
    }
  }

  /**
   * Actualizar documento de especialista
   */
  static async updateSpecialistDocument(businessId, specialistId, documentId, documentData) {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/config/specialists/${specialistId}/documents/${documentId}`,
        documentData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando documento:', error);
      throw error;
    }
  }

  /**
   * Eliminar documento de especialista
   */
  static async deleteSpecialistDocument(businessId, specialistId, documentId) {
    try {
      const response = await apiClient.delete(
        `/business/${businessId}/config/specialists/${specialistId}/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando documento:', error);
      throw error;
    }
  }

  // ================================
  // GESTIÓN DE COMISIONES
  // ================================

  /**
   * Obtener configuración de comisiones de especialista
   */
  static async getSpecialistCommissions(businessId, specialistId, period = 'current') {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/config/specialists/${specialistId}/commissions?period=${period}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo comisiones:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de comisiones
   */
  static async updateSpecialistCommissions(businessId, specialistId, commissionsData) {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/config/specialists/${specialistId}/commissions`,
        commissionsData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando comisiones:', error);
      throw error;
    }
  }

  /**
   * Calcular comisiones pendientes de pago
   */
  static async calculatePendingCommissions(businessId, specialistId, filters = {}) {
    try {
      const { startDate, endDate, includeDetails = true } = filters;
      
      const queryParams = new URLSearchParams({
        includeDetails: includeDetails.toString(),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() })
      });

      const response = await apiClient.get(
        `/business/${businessId}/config/specialists/${specialistId}/commissions/pending?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error calculando comisiones:', error);
      throw error;
    }
  }

  /**
   * Procesar pago de comisiones
   */
  static async processCommissionPayment(businessId, specialistId, paymentData) {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/config/specialists/${specialistId}/commissions/pay`,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error('Error procesando pago de comisiones:', error);
      throw error;
    }
  }

  // ================================
  // ESTADÍSTICAS Y REPORTES
  // ================================

  /**
   * Obtener estadísticas de rendimiento de especialista
   */
  static async getSpecialistStats(businessId, specialistId, period = 'month') {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/config/specialists/${specialistId}/stats?period=${period}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de todos los especialistas
   */
  static async getSpecialistsSummary(businessId, period = 'month') {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/config/specialists/summary?period=${period}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      throw error;
    }
  }
}

// ================================
// UTILITY METHODS
// ================================

/**
 * Validar datos de especialista antes de crear/actualizar
 */
export const validateSpecialistData = (userData, profileData) => {
  const errors = [];

  // Validar userData
  if (!userData.email) {
    errors.push('Email es obligatorio');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Email debe tener un formato válido');
  }

  if (!userData.firstName || userData.firstName.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  }

  if (!userData.lastName || userData.lastName.trim().length < 2) {
    errors.push('Apellido debe tener al menos 2 caracteres');
  }

  if (userData.phone && !/^\+?[\d\s\-\(\)]+$/.test(userData.phone)) {
    errors.push('Teléfono debe tener un formato válido');
  }

  // Validar profileData
  if (profileData.specialization && profileData.specialization.trim().length === 0) {
    errors.push('Especialización no puede estar vacía');
  }

  if (profileData.hourlyRate && (isNaN(profileData.hourlyRate) || profileData.hourlyRate < 0)) {
    errors.push('Tarifa por hora debe ser un número positivo');
  }

  if (profileData.commissionPercentage && 
      (isNaN(profileData.commissionPercentage) || 
       profileData.commissionPercentage < 0 || 
       profileData.commissionPercentage > 100)) {
    errors.push('Porcentaje de comisión debe estar entre 0 y 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatear datos de especialista para mostrar en UI
 */
export const formatSpecialistData = (specialist) => {
  if (!specialist) return null;

  return {
    ...specialist,
    fullName: `${specialist.user?.firstName} ${specialist.user?.lastName}`.trim(),
    displayName: specialist.user?.firstName || 'Sin nombre',
    email: specialist.user?.email,
    phone: specialist.user?.phone,
    isActiveDisplay: specialist.isActive ? 'Activo' : 'Inactivo',
    statusColor: specialist.isActive ? 'green' : 'red',
    commissionDisplay: specialist.commissionPercentage ? 
      `${specialist.commissionPercentage}%` : 'No configurado',
    hourlyRateDisplay: specialist.hourlyRate ? 
      `$${specialist.hourlyRate.toLocaleString()}` : 'No configurado',
    specializationDisplay: specialist.specialization || 'Sin especialización',
    joinedDate: specialist.createdAt ? 
      new Date(specialist.createdAt).toLocaleDateString() : 'No disponible'
  };
};

/**
 * Generar horarios por defecto para especialista
 */
export const generateDefaultSchedule = () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const schedule = {};

  days.forEach(day => {
    schedule[day] = {
      isWorkingDay: true,
      shifts: [
        {
          startTime: '09:00',
          endTime: '12:00'
        },
        {
          startTime: '14:00',
          endTime: '18:00'
        }
      ]
    };
  });

  // Fines de semana como no laborables por defecto
  schedule.saturday = {
    isWorkingDay: false,
    shifts: []
  };
  schedule.sunday = {
    isWorkingDay: false,
    shifts: []
  };

  return schedule;
};

/**
 * Calcular horas de trabajo por semana
 */
export const calculateWeeklyHours = (schedule) => {
  if (!schedule) return 0;

  let totalHours = 0;

  Object.values(schedule).forEach(daySchedule => {
    if (daySchedule.isWorkingDay && daySchedule.shifts) {
      daySchedule.shifts.forEach(shift => {
        const start = new Date(`2000-01-01 ${shift.startTime}`);
        const end = new Date(`2000-01-01 ${shift.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        totalHours += hours;
      });
    }
  });

  return totalHours;
};

/**
 * Tipos de documentos válidos para especialistas
 */
export const DOCUMENT_TYPES = {
  ID_CARD: {
    value: 'ID_CARD',
    label: 'Cédula de Identidad',
    required: true
  },
  PROFESSIONAL_LICENSE: {
    value: 'PROFESSIONAL_LICENSE',
    label: 'Licencia Profesional',
    required: false
  },
  CERTIFICATE: {
    value: 'CERTIFICATE',
    label: 'Certificado',
    required: false
  },
  DIPLOMA: {
    value: 'DIPLOMA',
    label: 'Diploma',
    required: false
  },
  INSURANCE: {
    value: 'INSURANCE',
    label: 'Seguro',
    required: false
  },
  CONTRACT: {
    value: 'CONTRACT',
    label: 'Contrato',
    required: false
  },
  OTHER: {
    value: 'OTHER',
    label: 'Otro',
    required: false
  }
};

/**
 * Estados disponibles para especialistas
 */
export const SPECIALIST_STATUS = {
  ACTIVE: {
    value: 'ACTIVE',
    label: 'Activo',
    color: 'green'
  },
  INACTIVE: {
    value: 'INACTIVE',
    label: 'Inactivo',
    color: 'red'
  },
  VACATION: {
    value: 'VACATION',
    label: 'De vacaciones',
    color: 'orange'
  },
  SICK_LEAVE: {
    value: 'SICK_LEAVE',
    label: 'Incapacitado',
    color: 'yellow'
  }
};

export default BusinessSpecialistsAPI;