/**
 * @file consentApi.js
 * @description API client para sistema de consentimientos (FM-26)
 */

import apiClient from './client';

const consentApi = {
  // ==================== TEMPLATES ====================
  
  /**
   * Listar plantillas de consentimiento
   * GET /api/business/:businessId/consent-templates
   */
  getTemplates: async (businessId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/business/${businessId}/consent-templates${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching consent templates:', error);
      throw error;
    }
  },

  /**
   * Obtener una plantilla específica
   * GET /api/business/:businessId/consent-templates/:templateId
   */
  getTemplate: async (businessId, templateId) => {
    try {
      const response = await apiClient.get(`/business/${businessId}/consent-templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consent template:', error);
      throw error;
    }
  },

  /**
   * Crear plantilla de consentimiento
   * POST /api/business/:businessId/consent-templates
   */
  createTemplate: async (businessId, data) => {
    try {
      const response = await apiClient.post(`/business/${businessId}/consent-templates`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating consent template:', error);
      throw error;
    }
  },

  /**
   * Actualizar plantilla de consentimiento
   * PUT /api/business/:businessId/consent-templates/:templateId
   */
  updateTemplate: async (businessId, templateId, data) => {
    try {
      const response = await apiClient.put(`/business/${businessId}/consent-templates/${templateId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating consent template:', error);
      throw error;
    }
  },

  /**
   * Eliminar (desactivar) plantilla de consentimiento
   * DELETE /api/business/:businessId/consent-templates/:templateId
   */
  deleteTemplate: async (businessId, templateId, hardDelete = false) => {
    try {
      const url = `/business/${businessId}/consent-templates/${templateId}${hardDelete ? '?hardDelete=true' : ''}`;
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      console.error('Error deleting consent template:', error);
      throw error;
    }
  },

  // ==================== SIGNATURES ====================

  /**
   * Firmar consentimiento
   * POST /api/business/:businessId/consent-signatures
   */
  signConsent: async (businessId, data) => {
    try {
      const response = await apiClient.post(`/business/${businessId}/consent-signatures`, data);
      return response.data;
    } catch (error) {
      console.error('Error signing consent:', error);
      throw error;
    }
  },

  /**
   * Obtener firmas de un cliente
   * GET /api/business/:businessId/consent-signatures/customer/:customerId
   */
  getCustomerSignatures: async (businessId, customerId, status = null) => {
    try {
      const url = `/business/${businessId}/consent-signatures/customer/${customerId}${status ? `?status=${status}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer signatures:', error);
      throw error;
    }
  },

  /**
   * Obtener una firma específica
   * GET /api/business/:businessId/consent-signatures/:signatureId
   */
  getSignature: async (businessId, signatureId) => {
    try {
      const response = await apiClient.get(`/business/${businessId}/consent-signatures/${signatureId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consent signature:', error);
      throw error;
    }
  },

  /**
   * Revocar una firma
   * POST /api/business/:businessId/consent-signatures/:signatureId/revoke
   */
  revokeSignature: async (businessId, signatureId, reason, revokedBy) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/consent-signatures/${signatureId}/revoke`,
        { reason, revokedBy }
      );
      return response.data;
    } catch (error) {
      console.error('Error revoking consent signature:', error);
      throw error;
    }
  },

  /**
   * Descargar PDF de firma
   * GET /api/business/:businessId/consent-signatures/:signatureId/pdf
   */
  downloadSignaturePDF: async (businessId, signatureId) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/consent-signatures/${signatureId}/pdf`,
        { responseType: 'blob' }
      );
      
      // Crear URL para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consentimiento_${signatureId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading signature PDF:', error);
      throw error;
    }
  }
};

export default consentApi;
