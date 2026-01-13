import { apiClient } from './client.js';

export const procedureSupplyApi = {
  // Crear registro de consumo
  createSupply: (supplyData) => {
    return apiClient.post('/api/procedure-supplies', supplyData);
  },

  // Listar consumos con filtros
  getSupplies: (params = {}) => {
    return apiClient.get('/api/procedure-supplies', { params });
  },

  // Obtener detalle de un consumo
  getSupplyById: (supplyId) => {
    return apiClient.get(`/api/procedure-supplies/${supplyId}`);
  },

  // Obtener consumos por turno
  getSuppliesByAppointment: (appointmentId) => {
    return apiClient.get(`/api/procedure-supplies/appointment/${appointmentId}`);
  },

  // Obtener estadísticas de consumo
  getSupplyStats: (params = {}) => {
    return apiClient.get('/api/procedure-supplies/stats', { params });
  }
};
