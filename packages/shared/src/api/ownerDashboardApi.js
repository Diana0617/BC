/**
 * API para funcionalidades del Dashboard del Owner
 * Comunicación con endpoints del backend para métricas y estadísticas
 */

import { api } from './client';

export const ownerDashboardApi = {
  /**
   * Obtener métricas principales del dashboard
   * @param {string} period - Período de tiempo (thisMonth, lastMonth, thisYear, etc.)
   * @returns {Promise} Métricas principales
   */
  getMainMetrics: async (period = 'thisMonth') => {
    const response = await api.get('/owner/dashboard/metrics', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Obtener datos para gráfico de ingresos por mes
   * @param {number} months - Número de meses hacia atrás
   * @returns {Promise} Datos del gráfico de ingresos
   */
  getRevenueChart: async (months = 6) => {
    const response = await api.get('/owner/dashboard/revenue-chart', {
      params: { months }
    });
    return response.data.data;
  },

  /**
   * Obtener distribución de planes para gráfico circular
   * @returns {Promise} Distribución de planes
   */
  getPlanDistribution: async () => {
    const response = await api.get('/owner/dashboard/plan-distribution');
    return response.data.data;
  },

  /**
   * Obtener top negocios más activos
   * @param {number} limit - Límite de negocios a retornar
   * @returns {Promise} Lista de top negocios
   */
  getTopBusinesses: async (limit = 10) => {
    const response = await api.get('/owner/dashboard/top-businesses', {
      params: { limit }
    });
    return response.data.data;
  },

  /**
   * Obtener estadísticas de crecimiento y conversión
   * @param {string} period - Período de tiempo
   * @returns {Promise} Estadísticas de crecimiento
   */
  getGrowthStats: async (period = 'thisMonth') => {
    const response = await api.get('/owner/dashboard/growth-stats', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Obtener resumen rápido para widgets
   * @returns {Promise} Resumen rápido con widgets
   */
  getQuickSummary: async () => {
    const response = await api.get('/owner/dashboard/quick-summary');
    return response.data.data;
  },

  /**
   * Exportar datos del dashboard
   * @param {string} format - Formato de exportación (json, csv)
   * @param {string} period - Período de tiempo
   * @returns {Promise} Datos exportados
   */
  exportData: async (format = 'json', period = 'thisMonth') => {
    const response = await api.get('/owner/dashboard/export', {
      params: { format, period }
    });
    return response.data.data;
  },

  /**
   * Obtener estadísticas de la plataforma (endpoint del OwnerController)
   * @returns {Promise} Estadísticas globales de la plataforma
   */
  getPlatformStats: async () => {
    const response = await api.get('/owner/stats/platform');
    return response.data.data;
  }
};