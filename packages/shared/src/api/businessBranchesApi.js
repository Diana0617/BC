import { apiClient } from './client.js';

// ================================
// BUSINESS BRANCHES MANAGEMENT API
// ================================

/**
 * API para gestión de sucursales del negocio
 * Incluye CRUD completo, asignación de especialistas y gestión de horarios
 */
class BusinessBranchesAPI {

  // ================================
  // CRUD DE SUCURSALES
  // ================================

  /**
   * Obtener lista de sucursales del negocio
   */
  static async getBranches(businessId, filters = {}) {
    try {
      const {
        isActive,
        city,
        state,
        country,
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'ASC'
      } = filters;

      const queryParams = new URLSearchParams({
        ...(isActive !== undefined && { isActive: isActive.toString() }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      const response = await apiClient.get(`/api/business/${businessId}/branches?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una sucursal específica
   */
  static async getBranch(businessId, branchId) {
    try {
      const response = await apiClient.get(`/api/business/${businessId}/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo sucursal:', error);
      throw error;
    }
  }

  /**
   * Crear nueva sucursal
   */
  static async createBranch(businessId, branchData) {
    try {
      // Validar datos obligatorios
      if (!branchData.code || !branchData.name) {
        throw new Error('Código y nombre son obligatorios');
      }

      const response = await apiClient.post(`/api/business/${businessId}/branches`, {
        ...branchData,
        businessId
      });
      return response.data;
    } catch (error) {
      console.error('Error creando sucursal:', error);
      throw error;
    }
  }

  /**
   * Actualizar sucursal existente
   */
  static async updateBranch(businessId, branchId, branchData) {
    try {
      const response = await apiClient.put(
        `/api/business/${businessId}/branches/${branchId}`, 
        branchData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando sucursal:', error);
      throw error;
    }
  }

  /**
   * Eliminar/Desactivar sucursal
   */
  static async deleteBranch(businessId, branchId) {
    try {
      const response = await apiClient.delete(`/api/business/${businessId}/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando sucursal:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar sucursal
   */
  static async toggleBranchStatus(businessId, branchId, isActive) {
    try {
      const response = await apiClient.put(
        `/api/business/${businessId}/branches/${branchId}`,
        { isActive }
      );
      return response.data;
    } catch (error) {
      console.error('Error cambiando estado de la sucursal:', error);
      throw error;
    }
  }

  // ================================
  // GESTIÓN DE ESPECIALISTAS EN SUCURSALES
  // ================================

  /**
   * Obtener especialistas asignados a una sucursal
   */
  static async getBranchSpecialists(businessId, branchId) {
    try {
      const response = await apiClient.get(
        `/api/business/${businessId}/branches/${branchId}/specialists`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo especialistas de sucursal:', error);
      throw error;
    }
  }

  /**
   * Asignar especialistas a una sucursal
   */
  static async assignSpecialists(businessId, branchId, specialistIds) {
    try {
      if (!Array.isArray(specialistIds) || specialistIds.length === 0) {
        throw new Error('Debes proporcionar al menos un especialista');
      }

      const response = await apiClient.post(
        `/api/business/${businessId}/branches/${branchId}/specialists`,
        { specialistIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error asignando especialistas a sucursal:', error);
      throw error;
    }
  }

  // ================================
  // GESTIÓN DE HORARIOS
  // ================================

  /**
   * Obtener horarios de especialistas en una sucursal
   */
  static async getBranchSchedules(businessId, branchId, filters = {}) {
    try {
      const { specialistId, dayOfWeek, isActive } = filters;

      const queryParams = new URLSearchParams({
        ...(specialistId && { specialistId }),
        ...(dayOfWeek !== undefined && { dayOfWeek: dayOfWeek.toString() }),
        ...(isActive !== undefined && { isActive: isActive.toString() })
      });

      const response = await apiClient.get(
        `/api/business/${businessId}/branches/${branchId}/schedules?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      throw error;
    }
  }

  /**
   * Crear horario de especialista en sucursal
   */
  static async createSpecialistSchedule(businessId, branchId, scheduleData) {
    try {
      const { specialistId, dayOfWeek, startTime, endTime } = scheduleData;

      if (!specialistId || dayOfWeek === undefined || !startTime || !endTime) {
        throw new Error('Especialista, día, hora de inicio y fin son obligatorios');
      }

      const response = await apiClient.post(
        `/api/business/${businessId}/branches/${branchId}/schedules`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error('Error creando horario:', error);
      throw error;
    }
  }

  /**
   * Actualizar horario de especialista en sucursal
   */
  static async updateSpecialistSchedule(businessId, branchId, scheduleId, scheduleData) {
    try {
      const response = await apiClient.put(
        `/api/business/${businessId}/branches/${branchId}/schedules/${scheduleId}`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando horario:', error);
      throw error;
    }
  }

  /**
   * Eliminar horario de especialista en sucursal
   */
  static async deleteSpecialistSchedule(businessId, branchId, scheduleId) {
    try {
      const response = await apiClient.delete(
        `/api/business/${businessId}/branches/${branchId}/schedules/${scheduleId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando horario:', error);
      throw error;
    }
  }
}

// ================================
// UTILITY METHODS
// ================================

/**
 * Validar datos de sucursal antes de crear/actualizar
 */
export const validateBranchData = (branchData) => {
  const errors = [];

  // Validar datos obligatorios
  if (!branchData.code || branchData.code.trim().length < 2) {
    errors.push('Código debe tener al menos 2 caracteres');
  }

  if (!branchData.name || branchData.name.trim().length < 3) {
    errors.push('Nombre debe tener al menos 3 caracteres');
  }

  // Validación de email
  if (branchData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(branchData.email)) {
    errors.push('Email debe tener un formato válido');
  }

  // Validación de teléfono
  if (branchData.phone && !/^\+?[\d\s\-\(\)]+$/.test(branchData.phone)) {
    errors.push('Teléfono debe tener un formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatear datos de sucursal para mostrar en UI
 */
export const formatBranchData = (branch) => {
  if (!branch) return null;

  return {
    ...branch,
    fullAddress: formatAddress(branch),
    displayName: branch.name || 'Sin nombre',
    isActiveDisplay: branch.isActive ? 'Activa' : 'Inactiva',
    statusColor: branch.isActive ? 'green' : 'gray',
    isMainDisplay: branch.isMainBranch ? 'Principal' : 'Secundaria',
    specialistsCount: branch.specialists?.length || 0,
    createdDate: branch.createdAt ? 
      new Date(branch.createdAt).toLocaleDateString('es-CO') : 'No disponible'
  };
};

/**
 * Formatear dirección completa
 */
export const formatAddress = (branch) => {
  if (!branch) return '';
  
  const parts = [
    branch.address,
    branch.city,
    branch.state,
    branch.country,
    branch.postalCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Generar código de sucursal automáticamente
 */
export const generateBranchCode = (businessName, branchName) => {
  const businessPrefix = businessName.substring(0, 3).toUpperCase();
  const branchPrefix = branchName.substring(0, 3).toUpperCase();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${businessPrefix}-${branchPrefix}-${randomSuffix}`;
};

/**
 * Validar horarios de negocio
 */
export const validateBusinessHours = (businessHours) => {
  const errors = [];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  daysOfWeek.forEach(day => {
    if (businessHours[day]) {
      const { open, close } = businessHours[day];
      
      if (open && close) {
        const openTime = new Date(`2000-01-01 ${open}`);
        const closeTime = new Date(`2000-01-01 ${close}`);
        
        if (closeTime <= openTime) {
          errors.push(`${day}: Hora de cierre debe ser posterior a hora de apertura`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos de horario de especialista
 */
export const validateScheduleData = (scheduleData) => {
  const errors = [];

  if (!scheduleData.specialistId) {
    errors.push('Especialista es obligatorio');
  }

  if (scheduleData.dayOfWeek === undefined || scheduleData.dayOfWeek < 0 || scheduleData.dayOfWeek > 6) {
    errors.push('Día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)');
  }

  if (!scheduleData.startTime) {
    errors.push('Hora de inicio es obligatoria');
  }

  if (!scheduleData.endTime) {
    errors.push('Hora de fin es obligatoria');
  }

  if (scheduleData.startTime && scheduleData.endTime) {
    const start = new Date(`2000-01-01 ${scheduleData.startTime}`);
    const end = new Date(`2000-01-01 ${scheduleData.endTime}`);
    
    if (end <= start) {
      errors.push('Hora de fin debe ser posterior a hora de inicio');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Días de la semana para uso en UI
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

/**
 * Obtener nombre del día por índice
 */
export const getDayName = (dayIndex) => {
  const day = DAYS_OF_WEEK.find(d => d.value === dayIndex);
  return day ? day.label : 'Desconocido';
};

/**
 * Horario por defecto para nueva sucursal
 */
export const DEFAULT_BUSINESS_HOURS = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '14:00', closed: false },
  sunday: { closed: true }
};

export default BusinessBranchesAPI;
