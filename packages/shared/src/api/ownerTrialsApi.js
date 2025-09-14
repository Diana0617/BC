import { apiClient } from './client.js';

// ================================
// OWNER TRIAL MANAGEMENT API
// ================================

/**
 * API para gestión de trials por parte del Owner
 */
class OwnerTrialsAPI {

  /**
   * Obtener lista de trials activos y próximos a expirar
   */
  static async getActiveTrials(params = {}) {
    try {
      const {
        status = 'TRIAL',
        expiresIn = 30,
        page = 1,
        limit = 20,
        sortBy = 'trialEndDate',
        sortOrder = 'ASC'
      } = params;

      const queryParams = new URLSearchParams({
        status,
        expiresIn: expiresIn.toString(),
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      const response = await apiClient.get(`/owner/trials?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo trials:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas detalladas de trials
   */
  static async getTrialStats(period = 'last30days') {
    try {
      const response = await apiClient.get(`/owner/trials/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de trials:', error);
      throw error;
    }
  }

  /**
   * Crear trial manual para un negocio específico
   */
  static async createManualTrial(businessId, trialDays = 30, reason = '') {
    try {
      const response = await apiClient.post('/owner/trials/create', {
        businessId,
        trialDays,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error creando trial manual:', error);
      throw error;
    }
  }

  /**
   * Extender duración de un trial existente
   */
  static async extendTrial(businessId, additionalDays, reason = '') {
    try {
      const response = await apiClient.put(`/owner/trials/${businessId}/extend`, {
        additionalDays,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error extendiendo trial:', error);
      throw error;
    }
  }

  /**
   * Convertir trial a suscripción activa manualmente
   */
  static async convertTrialToActive(businessId, planId = null, reason = '') {
    try {
      const payload = { reason };
      if (planId) {
        payload.planId = planId;
      }

      const response = await apiClient.put(`/owner/trials/${businessId}/convert`, payload);
      return response.data;
    } catch (error) {
      console.error('Error convirtiendo trial:', error);
      throw error;
    }
  }

  /**
   * Cancelar trial antes de tiempo
   */
  static async cancelTrial(businessId, reason) {
    try {
      if (!reason) {
        throw new Error('La razón de cancelación es obligatoria');
      }

      const response = await apiClient.put(`/owner/trials/${businessId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelando trial:', error);
      throw error;
    }
  }
}

// ================================
// UTILITY METHODS
// ================================

/**
 * Formatear información de trial para mostrar en UI
 */
export const formatTrialInfo = (trial) => {
  if (!trial) return null;

  const now = new Date();
  const endDate = new Date(trial.trialEndDate);
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  return {
    ...trial,
    daysLeft: Math.max(0, daysLeft),
    isExpired: daysLeft <= 0,
    isExpiringSoon: daysLeft <= 3 && daysLeft > 0,
    formattedEndDate: endDate.toLocaleDateString(),
    statusColor: trial.isExpired 
      ? 'red' 
      : trial.isExpiringSoon 
      ? 'orange' 
      : 'green'
  };
};

/**
 * Validar datos para crear trial manual
 */
export const validateTrialCreation = (businessId, trialDays) => {
  const errors = [];

  if (!businessId || !Number.isInteger(businessId) || businessId <= 0) {
    errors.push('ID de negocio debe ser un número entero positivo');
  }

  if (!trialDays || !Number.isInteger(trialDays) || trialDays <= 0 || trialDays > 365) {
    errors.push('Días de trial debe ser un número entre 1 y 365');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar datos para extender trial
 */
export const validateTrialExtension = (additionalDays) => {
  const errors = [];

  if (!additionalDays || !Number.isInteger(additionalDays) || additionalDays <= 0 || additionalDays > 180) {
    errors.push('Días adicionales debe ser un número entre 1 y 180');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calcular métricas de health basadas en estadísticas
 */
export const calculateTrialHealth = (stats) => {
  if (!stats || !stats.rates) return null;

  const { conversion, cancellation } = stats.rates;
  
  let status = 'good';
  let message = 'Excelente gestión de trials';
  let recommendations = [];

  if (conversion < 10) {
    status = 'needs_attention';
    message = 'Tasa de conversión muy baja';
    recommendations.push('Revisar onboarding de usuarios en trial');
    recommendations.push('Implementar seguimiento proactivo');
  } else if (conversion < 20) {
    status = 'warning';
    message = 'Tasa de conversión moderada';
    recommendations.push('Optimizar experiencia durante trial');
  }

  if (cancellation > 50) {
    status = 'needs_attention';
    recommendations.push('Investigar razones de cancelación');
  }

  return {
    status,
    message,
    recommendations,
    score: Math.round((conversion - cancellation) * 2)
  };
};

/**
 * Filtros predefinidos para la lista de trials
 */
export const TRIAL_FILTERS = {
  ACTIVE_TRIALS: {
    status: 'TRIAL',
    expiresIn: 'all',
    label: 'Todos los trials activos'
  },
  EXPIRING_SOON: {
    status: 'TRIAL',
    expiresIn: 3,
    label: 'Expiran en 3 días'
  },
  EXPIRING_THIS_WEEK: {
    status: 'TRIAL',
    expiresIn: 7,
    label: 'Expiran esta semana'
  },
  EXPIRING_THIS_MONTH: {
    status: 'TRIAL',
    expiresIn: 30,
    label: 'Expiran este mes'
  },
  ALL_BUSINESSES: {
    status: 'all',
    expiresIn: 'all',
    label: 'Todos los negocios'
  }
};

/**
 * Períodos disponibles para estadísticas
 */
export const STATS_PERIODS = {
  LAST_7_DAYS: {
    value: 'last7days',
    label: 'Últimos 7 días'
  },
  LAST_30_DAYS: {
    value: 'last30days',
    label: 'Últimos 30 días'
  },
  LAST_90_DAYS: {
    value: 'last90days',
    label: 'Últimos 90 días'
  },
  ALL_TIME: {
    value: 'all',
    label: 'Todo el tiempo'
  }
};

export default OwnerTrialsAPI;