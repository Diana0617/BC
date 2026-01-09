import { apiClient } from './client.js';

/**
 * API para métricas del dashboard de Business
 */

/**
 * Obtener métricas principales del negocio
 * @param {string} period - 'today', 'week', 'month'
 */
export const getMainMetrics = async (period = 'today') => {
  const response = await apiClient.get(`/api/business/metrics?period=${period}`);
  return response.data;
};

/**
 * Obtener desglose de ventas
 * @param {string} period - 'today', 'week', 'month'
 */
export const getSalesBreakdown = async (period = 'today') => {
  const response = await apiClient.get(`/api/business/metrics/sales-breakdown?period=${period}`);
  return response.data;
};

/**
 * Obtener resumen de citas
 * @param {string} period - 'today', 'week', 'month'
 */
export const getAppointmentsSummary = async (period = 'today') => {
  const response = await apiClient.get(`/api/business/metrics/appointments-summary?period=${period}`);
  return response.data;
};

export default {
  getMainMetrics,
  getSalesBreakdown,
  getAppointmentsSummary
};
