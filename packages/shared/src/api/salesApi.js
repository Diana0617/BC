import { apiClient } from './client.js';

export const salesApi = {
  // Crear venta
  createSale: (saleData) => {
    return apiClient.post('/api/sales', saleData);
  },

  // Listar ventas con filtros
  getSales: (params = {}) => {
    return apiClient.get('/api/sales', { params });
  },

  // Obtener detalle de una venta
  getSaleById: (saleId) => {
    return apiClient.get(`/api/sales/${saleId}`);
  },

  // Cancelar venta
  cancelSale: (saleId, reason) => {
    return apiClient.patch(`/api/sales/${saleId}/cancel`, { reason });
  },

  // Obtener resumen de ventas
  getSalesSummary: (params = {}) => {
    return apiClient.get('/api/sales/summary', { params });
  },

  // Descargar PDF del recibo de venta
  downloadSaleReceiptPDF: (saleId) => {
    return apiClient.get(`/api/sales/${saleId}/receipt-pdf`, {
      responseType: 'blob'
    });
  }
};
