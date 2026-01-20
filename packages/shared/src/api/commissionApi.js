/**
 * @file commissionApi.js
 * @description API client para sistema de comisiones (FM-26)
 */

import apiClient from './client';

const commissionApi = {
  /**
   * Obtener resumen de comisiones del especialista (para dashboard)
   * GET /api/commissions/summary?specialistId=xxx&businessId=xxx
   */
  getSpecialistSummary: async (specialistId, businessId) => {
    try {
      console.log('📡 API - getSpecialistSummary:', { specialistId, businessId });
      const params = new URLSearchParams({ specialistId });
      if (businessId) params.append('businessId', businessId);
      
      const response = await apiClient.get(`/api/commissions/summary?${params}`);
      console.log('✅ API - getSpecialistSummary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error fetching specialist commission summary:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de comisiones paginado
   * GET /api/commissions/history?specialistId=xxx&businessId=xxx&page=1&limit=20
   */
  getCommissionHistory: async (specialistId, businessId, options = {}) => {
    try {
      const { page = 1, limit = 20, status, startDate, endDate, search } = options;
      console.log('📡 API - getCommissionHistory:', { specialistId, businessId, options });
      
      const params = new URLSearchParams({ 
        specialistId, 
        page: page.toString(), 
        limit: limit.toString() 
      });
      if (businessId) params.append('businessId', businessId);
      if (status && status !== 'all') params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      const response = await apiClient.get(`/api/commissions/history?${params}`);
      console.log('✅ API - getCommissionHistory response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error fetching commission history:', error);
      throw error;
    }
  },

  /**
   * Obtener comisiones del especialista desde su endpoint
   * GET /api/specialists/me/commissions?businessId=xxx
   */
  getMyCommissions: async (businessId, options = {}) => {
    try {
      const { month, year, startDate, endDate } = options;
      console.log('📡 API - getMyCommissions:', { businessId, options });
      
      const params = new URLSearchParams();
      if (businessId) params.append('businessId', businessId);
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/api/specialists/me/commissions?${params}`);
      console.log('✅ API - getMyCommissions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error fetching my commissions:', error);
      throw error;
    }
  },

  /**
   * Obtener configuración de comisiones del negocio
   * GET /api/business/:businessId/commission-config
   */
  getBusinessConfig: async (businessId) => {
    try {
      const response = await apiClient.get(`/api/business/${businessId}/commission-config`);
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
      const response = await apiClient.put(`/api/business/${businessId}/commission-config`, data);
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
      const response = await apiClient.get(`/api/business/${businessId}/services/${serviceId}/commission`);
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
      const response = await apiClient.put(`/api/business/${businessId}/services/${serviceId}/commission`, data);
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
      const response = await apiClient.delete(`/api/business/${businessId}/services/${serviceId}/commission`);
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
        `/api/business/${businessId}/services/${serviceId}/commission/calculate`,
        { amount }
      );
      return response.data;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes de pago de comisiones
   * GET /api/business/:businessId/commissions/payment-requests
   */
  getPaymentRequests: async (businessId, options = {}) => {
    try {
      const { status, specialistId, startDate, endDate, page = 1, limit = 20 } = options;
      console.log('📡 API - getPaymentRequests:', { businessId, options });
      
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status && status !== 'all') params.append('status', status);
      if (specialistId) params.append('specialistId', specialistId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(
        `/api/business/${businessId}/commissions/payment-requests?${params.toString()}`
      );
      console.log('✅ API - getPaymentRequests response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error fetching payment requests:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de solicitud de pago
   * PATCH /api/business/:businessId/commissions/payment-requests/:requestId
   */
  updatePaymentRequestStatus: async (businessId, requestId, data, token = null) => {
    try {
      console.log('📡 API - updatePaymentRequestStatus:', { businessId, requestId, data });

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.patch(
        `/api/business/${businessId}/commissions/payment-requests/${requestId}`,
        data,
        { headers }
      );
      console.log('✅ API - updatePaymentRequestStatus response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API - Error updating payment request:', error);
      throw error;
    }
  },

  /**
   * Registrar pago de comisión con comprobante
   * POST /api/business/:businessId/commissions/pay
   */
  registerPayment: async (businessId, data, paymentProofFile = null, token = null) => {
    try {
      console.log('📡 API - registerPayment:', { businessId, data, hasFile: !!paymentProofFile, hasToken: !!token });
      
      const formData = new FormData();
      
      // Agregar datos
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => formData.append(`${key}[]`, item));
          } else if (typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Agregar archivo si existe
      if (paymentProofFile) {
        formData.append('paymentProof', paymentProofFile);
      }

      // Usar fetch directamente para evitar problemas con apiClient y FormData
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // NO establecer Content-Type - el navegador lo maneja automáticamente con FormData

      const url = `${apiClient.baseURL}/api/business/${businessId}/commissions/pay`;
      console.log('📡 Sending FormData to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ API - registerPayment response:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ API - Error registering payment:', error);
      throw error;
    }
  }
};

export default commissionApi;
