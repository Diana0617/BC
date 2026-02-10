import { apiClient } from './auth';

/**
 * API para gestión de facturas de proveedores
 */
export const supplierInvoiceApi = {
  
  /**
   * Obtener todas las facturas del negocio
   * @param {string} businessId - ID del negocio
   * @param {object} params - Filtros (supplierId, status, startDate, endDate, page, limit)
   */
  getInvoices: async (businessId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/supplier-invoices`,
      { params }
    );
    return response.data;
  },

  /**
   * Obtener una factura específica
   * @param {string} businessId - ID del negocio
   * @param {string} invoiceId - ID de la factura
   */
  getInvoice: async (businessId, invoiceId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/supplier-invoices/${invoiceId}`
    );
    return response.data;
  },

  /**
   * Crear una nueva factura de proveedor
   * @param {string} businessId - ID del negocio
   * @param {object} invoiceData - Datos de la factura
   * @param {string} [invoiceData.supplierId] - ID del proveedor (opcional si se provee supplierData)
   * @param {object} [invoiceData.supplierData] - Datos para crear proveedor si no existe
   * @param {string} invoiceData.invoiceNumber - Número de factura
   * @param {string} invoiceData.issueDate - Fecha de emisión
   * @param {string} invoiceData.dueDate - Fecha de vencimiento
   * @param {array} invoiceData.items - Items de la factura [{ productId, productData, quantity, unitCost, total }]
   * @param {number} invoiceData.subtotal - Subtotal
   * @param {number} invoiceData.tax - Impuestos
   * @param {number} invoiceData.total - Total
   * @param {string} [invoiceData.currency] - Moneda (default: COP)
   * @param {string} [invoiceData.notes] - Notas
   * @param {array} [invoiceData.attachments] - URLs de archivos (Cloudinary)
   */
  createInvoice: async (businessId, invoiceData) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/supplier-invoices`,
      invoiceData
    );
    return response.data;
  },

  /**
   * Aprobar factura y actualizar inventario
   * @param {string} businessId - ID del negocio
   * @param {string} invoiceId - ID de la factura
   * @param {string} branchId - ID de la sucursal donde se recibirán los productos
   */
  approveInvoice: async (businessId, invoiceId, branchId) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/supplier-invoices/${invoiceId}/approve`,
      { branchId }
    );
    return response.data;
  },

  /**
   * Obtener resumen de cuenta de un proveedor
   * @param {string} businessId - ID del negocio
   * @param {string} supplierId - ID del proveedor
   */
  getSupplierAccountSummary: async (businessId, supplierId) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/suppliers/${supplierId}/account-summary`
    );
    return response.data;
  },

  /**
   * Obtener todos los proveedores del negocio
   * @param {string} businessId - ID del negocio
   * @param {object} params - Filtros (status, search, page, limit)
   */
  getSuppliers: async (businessId, params = {}) => {
    const response = await apiClient.get(
      `/api/business/${businessId}/suppliers`,
      { params }
    );
    return response.data;
  },

  /**
   * Registrar pago de factura de proveedor
   * @param {string} businessId - ID del negocio
   * @param {string} invoiceId - ID de la factura
   * @param {object} paymentData - Datos del pago
   * @param {number} paymentData.amount - Monto del pago
   * @param {string} paymentData.paymentDate - Fecha del pago
   * @param {string} paymentData.paymentMethod - Método de pago (CASH, TRANSFER, CHECK, etc.)
   * @param {string} [paymentData.reference] - Número de referencia/transacción
   * @param {string} [paymentData.receipt] - URL del comprobante (Cloudinary)
   * @param {string} [paymentData.notes] - Notas adicionales
   */
  registerPayment: async (businessId, invoiceId, paymentData) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/supplier-invoices/${invoiceId}/pay`,
      paymentData
    );
    return response.data;
  },

  /**
   * Recibir mercancía de una factura
   * @param {string} businessId - ID del negocio
   * @param {string} invoiceId - ID de la factura
   * @param {object} receiptData - Datos de recepción
   * @param {array} receiptData.itemsReceived - Items recibidos [{ productId, quantityReceived }]
   */
  receiveGoods: async (businessId, invoiceId, receiptData) => {
    const response = await apiClient.post(
      `/api/business/${businessId}/supplier-invoices/${invoiceId}/receive-goods`,
      receiptData
    );
    return response.data;
  }
};

export default supplierInvoiceApi;
