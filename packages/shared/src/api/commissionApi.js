/**
 * @file commissionApi.js
 * @description API client para sistema de comisiones (FM-26)
 */

import apiClient from './client';

const commissionApi = {
  /**
   * Obtener configuración de comisiones del negocio
   * GET /api/business/:businessId/commission-config
   */
  getBusinessConfig: async (businessId) => {
    try {
      const response = await apiClient.get(`/business/${businessId}/commission-config`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business commission config:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuración de comisiones del negocio
   * PUT /api/business/:businessId/commission-config
   */
  updateBusinessConfig: async (businessId, data) => {
    try {
      const response = await apiClient.put(`/business/${businessId}/commission-config`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating business commission config:', error);
      throw error;
    }
  },

  /**
   * Obtener comisión de un servicio específico
   * GET /api/business/:businessId/services/:serviceId/commission
   */
  getServiceCommission: async (businessId, serviceId) => {
    try {
      const response = await apiClient.get(`/business/${businessId}/services/${serviceId}/commission`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service commission:', error);
      throw error;
    }
  },

  /**
   * Crear o actualizar comisión de un servicio
   * PUT /api/business/:businessId/services/:serviceId/commission
   */
  upsertServiceCommission: async (businessId, serviceId, data) => {
    try {
      const response = await apiClient.put(`/business/${businessId}/services/${serviceId}/commission`, data);
      return response.data;
    } catch (error) {
      console.error('Error upserting service commission:', error);
      throw error;
    }
  },

  /**
   * Eliminar comisión personalizada de un servicio
   * DELETE /api/business/:businessId/services/:serviceId/commission
   */
  deleteServiceCommission: async (businessId, serviceId) => {
    try {
      const response = await apiClient.delete(`/business/${businessId}/services/${serviceId}/commission`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service commission:', error);
      throw error;
    }
  },

  /**
   * Calcular comisión para un monto específico
   * POST /api/business/:businessId/services/:serviceId/commission/calculate
   */
  calculateCommission: async (businessId, serviceId, amount) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/services/${serviceId}/commission/calculate`,
        { amount }
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  }
};

export default commissionApi;
