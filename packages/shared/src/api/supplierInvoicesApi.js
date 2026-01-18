import { apiClient } from './client.js';

/**
 * API para gestión de facturas de proveedores (compras)
 */
class SupplierInvoicesApi {
  /**
   * Obtener lista de facturas de proveedores
   */
  static async getInvoices(businessId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      if (filters.supplierId) {
        queryParams.append('supplierId', filters.supplierId);
      }
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }
      if (filters.page) {
        queryParams.append('page', filters.page);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }

      const queryString = queryParams.toString();
      const url = `/api/business/${businessId}/supplier-invoices${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Obtener una factura por ID
   */
  static async getInvoiceById(businessId, invoiceId) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/${invoiceId}`;
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva factura
   */
  static async createInvoice(businessId, invoiceData) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices`;
      const response = await apiClient.post(url, invoiceData);
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Actualizar una factura
   */
  static async updateInvoice(businessId, invoiceId, invoiceData) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/${invoiceId}`;
      const response = await apiClient.put(url, invoiceData);
      return response;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Eliminar una factura
   */
  static async deleteInvoice(businessId, invoiceId) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/${invoiceId}`;
      const response = await apiClient.delete(url);
      return response;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Aprobar una factura (aplicar stock)
   */
  static async approveInvoice(businessId, invoiceId) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/${invoiceId}/approve`;
      const response = await apiClient.post(url);
      return response;
    } catch (error) {
      console.error('Error approving invoice:', error);
      throw error;
    }
  }

  /**
   * Distribuir stock de factura entre sucursales
   */
  static async distributeStock(businessId, invoiceId, distribution) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/${invoiceId}/distribute-stock`;
      const response = await apiClient.post(url, { distribution });
      return response;
    } catch (error) {
      console.error('Error distributing stock:', error);
      throw error;
    }
  }

  /**
   * Importar factura desde XML (DIAN Colombia)
   */
  static async importFromXml(businessId, xmlData) {
    try {
      const url = `/api/business/${businessId}/supplier-invoices/import-xml`;
      const response = await apiClient.post(url, xmlData);
      return response;
    } catch (error) {
      console.error('Error importing invoice from XML:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen/estadísticas de compras
   */
  static async getStatistics(businessId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }

      const queryString = queryParams.toString();
      const url = `/api/business/${businessId}/supplier-invoices/statistics${queryString ? '?' + queryString : ''}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export default SupplierInvoicesApi;
