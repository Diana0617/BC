/**
 * API Frontend para Gestión de Proveedores del Negocio
 * 
 * Proporciona funcionalidades completas para:
 * - CRUD de proveedores y contactos
 * - Gestión de órdenes de compra
 * - Procesamiento de facturas
 * - Historial de compras y pagos
 * - Evaluación de proveedores
 * - Catálogo de productos por proveedor
 * - Términos de pago y crédito
 * - Reportes de compras y rendimiento
 */

import { apiClient } from './client.js';

// ================================
// CONSTANTES Y CONFIGURACIONES
// ================================

export const SUPPLIER_CONSTANTS = {
  TYPES: {
    DISTRIBUTOR: 'DISTRIBUTOR',
    MANUFACTURER: 'MANUFACTURER',
    WHOLESALER: 'WHOLESALER',
    RETAILER: 'RETAILER',
    SERVICE_PROVIDER: 'SERVICE_PROVIDER',
    FREELANCER: 'FREELANCER'
  },
  TYPE_LABELS: {
    DISTRIBUTOR: 'Distribuidor',
    MANUFACTURER: 'Fabricante',
    WHOLESALER: 'Mayorista',
    RETAILER: 'Minorista',
    SERVICE_PROVIDER: 'Proveedor de Servicios',
    FREELANCER: 'Freelancer'
  },
  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    BLOCKED: 'BLOCKED',
    UNDER_REVIEW: 'UNDER_REVIEW'
  },
  STATUS_LABELS: {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    PENDING: 'Pendiente',
    BLOCKED: 'Bloqueado',
    UNDER_REVIEW: 'En Revisión'
  },
  PAYMENT_TERMS: {
    IMMEDIATE: 'IMMEDIATE',
    NET_15: 'NET_15',
    NET_30: 'NET_30',
    NET_45: 'NET_45',
    NET_60: 'NET_60',
    NET_90: 'NET_90',
    COD: 'COD'
  },
  PAYMENT_TERMS_LABELS: {
    IMMEDIATE: 'Inmediato',
    NET_15: '15 días',
    NET_30: '30 días',
    NET_45: '45 días',
    NET_60: '60 días',
    NET_90: '90 días',
    COD: 'Contra entrega'
  },
  PURCHASE_ORDER_STATUS: {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    CONFIRMED: 'CONFIRMED',
    PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED'
  },
  PURCHASE_ORDER_STATUS_LABELS: {
    DRAFT: 'Borrador',
    SENT: 'Enviada',
    CONFIRMED: 'Confirmada',
    PARTIALLY_RECEIVED: 'Parcialmente Recibida',
    RECEIVED: 'Recibida',
    CANCELLED: 'Cancelada'
  },
  INVOICE_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    DISPUTED: 'DISPUTED',
    CANCELLED: 'CANCELLED'
  },
  INVOICE_STATUS_LABELS: {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    PAID: 'Pagada',
    OVERDUE: 'Vencida',
    DISPUTED: 'Disputada',
    CANCELLED: 'Cancelada'
  },
  CATEGORIES: {
    CONSUMIBLES: 'Consumibles de Belleza',
    PRODUCTOS_CABELLO: 'Productos para Cabello',
    PRODUCTOS_PIEL: 'Productos para Piel',
    COSMETICOS: 'Cosméticos',
    HERRAMIENTAS: 'Herramientas y Equipos',
    MOBILIARIO: 'Mobiliario',
    TECNOLOGIA: 'Tecnología',
    SERVICIOS: 'Servicios',
    SUMINISTROS_OFICINA: 'Suministros de Oficina',
    OTROS: 'Otros'
  }
};

// ================================
// PROVEEDORES - CRUD
// ================================

/**
 * Obtener lista de proveedores
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.type] - Filtrar por tipo de proveedor
 * @param {string} [params.status] - Filtrar por estado
 * @param {string} [params.category] - Filtrar por categoría principal
 * @param {string} [params.search] - Búsqueda por nombre, código o email
 * @param {string} [params.country] - Filtrar por país
 * @param {string} [params.city] - Filtrar por ciudad
 * @param {boolean} [params.hasActiveOrders] - Filtrar proveedores con órdenes activas
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados por página
 * @param {string} [params.sortBy] - Campo para ordenar
 * @param {string} [params.sortOrder] - Orden (asc, desc)
 * @returns {Promise<Object>} Lista de proveedores con metadatos
 */
export const getSuppliers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.country) queryParams.append('country', params.country);
    if (params.city) queryParams.append('city', params.city);
    if (typeof params.hasActiveOrders === 'boolean') queryParams.append('hasActiveOrders', params.hasActiveOrders);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/business/config/suppliers?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener proveedores');
  }
};

/**
 * Obtener proveedor específico por ID
 * @param {string} supplierId - ID del proveedor
 * @returns {Promise<Object>} Datos del proveedor
 */
export const getSupplier = async (supplierId) => {
  try {
    const response = await apiClient.get(`/business/config/suppliers/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener proveedor');
  }
};

/**
 * Crear nuevo proveedor
 * @param {Object} supplierData - Datos del proveedor
 * @param {string} supplierData.name - Nombre de la empresa (obligatorio)
 * @param {string} supplierData.type - Tipo de proveedor (obligatorio)
 * @param {string} [supplierData.code] - Código del proveedor (se genera automáticamente si no se proporciona)
 * @param {string} [supplierData.taxId] - NIT o identificación fiscal
 * @param {string} [supplierData.email] - Email principal
 * @param {string} [supplierData.phone] - Teléfono principal
 * @param {string} [supplierData.website] - Sitio web
 * @param {Object} [supplierData.address] - Dirección completa
 * @param {Object} [supplierData.contactPerson] - Persona de contacto principal
 * @param {Array} [supplierData.categories] - Categorías de productos que maneja
 * @param {Object} [supplierData.paymentTerms] - Términos de pago
 * @param {Object} [supplierData.bankInfo] - Información bancaria
 * @param {Array} [supplierData.certifications] - Certificaciones y acreditaciones
 * @param {string} [supplierData.notes] - Notas adicionales
 * @returns {Promise<Object>} Proveedor creado
 */
export const createSupplier = async (supplierData) => {
  try {
    const response = await apiClient.post('/business/config/suppliers', supplierData);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw new Error(error.response?.data?.message || 'Error al crear proveedor');
  }
};

/**
 * Actualizar proveedor existente
 * @param {string} supplierId - ID del proveedor
 * @param {Object} supplierData - Datos a actualizar
 * @returns {Promise<Object>} Proveedor actualizado
 */
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const response = await apiClient.put(`/business/config/suppliers/${supplierId}`, supplierData);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar proveedor');
  }
};

/**
 * Eliminar proveedor
 * @param {string} supplierId - ID del proveedor
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteSupplier = async (supplierId) => {
  try {
    const response = await apiClient.delete(`/business/config/suppliers/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar proveedor');
  }
};

/**
 * Cambiar estado del proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {string} status - Nuevo estado
 * @returns {Promise<Object>} Proveedor actualizado
 */
export const updateSupplierStatus = async (supplierId, status) => {
  try {
    const response = await apiClient.patch(`/business/config/suppliers/${supplierId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating supplier status:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado del proveedor');
  }
};

// ================================
// GESTIÓN DE CONTACTOS
// ================================

/**
 * Obtener contactos de un proveedor
 * @param {string} supplierId - ID del proveedor
 * @returns {Promise<Array>} Lista de contactos
 */
export const getSupplierContacts = async (supplierId) => {
  try {
    const response = await apiClient.get(`/business/config/suppliers/${supplierId}/contacts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier contacts:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener contactos del proveedor');
  }
};

/**
 * Agregar contacto a un proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {Object} contactData - Datos del contacto
 * @param {string} contactData.name - Nombre del contacto
 * @param {string} contactData.position - Cargo o posición
 * @param {string} [contactData.email] - Email del contacto
 * @param {string} [contactData.phone] - Teléfono del contacto
 * @param {string} [contactData.department] - Departamento
 * @param {boolean} [contactData.isPrimary] - Si es el contacto principal
 * @returns {Promise<Object>} Contacto creado
 */
export const addSupplierContact = async (supplierId, contactData) => {
  try {
    const response = await apiClient.post(`/business/config/suppliers/${supplierId}/contacts`, contactData);
    return response.data;
  } catch (error) {
    console.error('Error adding supplier contact:', error);
    throw new Error(error.response?.data?.message || 'Error al agregar contacto');
  }
};

/**
 * Actualizar contacto de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {string} contactId - ID del contacto
 * @param {Object} contactData - Datos a actualizar
 * @returns {Promise<Object>} Contacto actualizado
 */
export const updateSupplierContact = async (supplierId, contactId, contactData) => {
  try {
    const response = await apiClient.put(`/business/config/suppliers/${supplierId}/contacts/${contactId}`, contactData);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier contact:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar contacto');
  }
};

/**
 * Eliminar contacto de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {string} contactId - ID del contacto
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteSupplierContact = async (supplierId, contactId) => {
  try {
    const response = await apiClient.delete(`/business/config/suppliers/${supplierId}/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting supplier contact:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar contacto');
  }
};

// ================================
// ÓRDENES DE COMPRA
// ================================

/**
 * Obtener órdenes de compra
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.supplierId] - Filtrar por proveedor
 * @param {string} [params.status] - Filtrar por estado
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Object>} Lista de órdenes con metadatos
 */
export const getPurchaseOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiClient.get(`/business/config/suppliers/purchase-orders?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener órdenes de compra');
  }
};

/**
 * Obtener orden de compra específica
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Datos de la orden
 */
export const getPurchaseOrder = async (orderId) => {
  try {
    const response = await apiClient.get(`/business/config/suppliers/purchase-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener orden de compra');
  }
};

/**
 * Crear nueva orden de compra
 * @param {Object} orderData - Datos de la orden
 * @param {string} orderData.supplierId - ID del proveedor
 * @param {Array} orderData.items - Items de la orden
 * @param {string} [orderData.notes] - Notas adicionales
 * @param {string} [orderData.deliveryDate] - Fecha de entrega esperada
 * @param {Object} [orderData.deliveryAddress] - Dirección de entrega
 * @returns {Promise<Object>} Orden creada
 */
export const createPurchaseOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/business/config/suppliers/purchase-orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw new Error(error.response?.data?.message || 'Error al crear orden de compra');
  }
};

/**
 * Actualizar orden de compra
 * @param {string} orderId - ID de la orden
 * @param {Object} orderData - Datos a actualizar
 * @returns {Promise<Object>} Orden actualizada
 */
export const updatePurchaseOrder = async (orderId, orderData) => {
  try {
    const response = await apiClient.put(`/business/config/suppliers/purchase-orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar orden de compra');
  }
};

/**
 * Cambiar estado de orden de compra
 * @param {string} orderId - ID de la orden
 * @param {string} status - Nuevo estado
 * @param {Object} [metadata] - Datos adicionales del cambio de estado
 * @returns {Promise<Object>} Orden actualizada
 */
export const updatePurchaseOrderStatus = async (orderId, status, metadata = {}) => {
  try {
    const response = await apiClient.patch(`/business/config/suppliers/purchase-orders/${orderId}/status`, {
      status,
      ...metadata
    });
    return response.data;
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado de la orden');
  }
};

/**
 * Marcar orden como recibida (parcial o completa)
 * @param {string} orderId - ID de la orden
 * @param {Array} receivedItems - Items recibidos con cantidades
 * @param {Object} [receiptData] - Datos del recibo
 * @returns {Promise<Object>} Orden actualizada con recibo
 */
export const receiveOrderItems = async (orderId, receivedItems, receiptData = {}) => {
  try {
    const response = await apiClient.post(`/business/config/suppliers/purchase-orders/${orderId}/receive`, {
      receivedItems,
      ...receiptData
    });
    return response.data;
  } catch (error) {
    console.error('Error receiving order items:', error);
    throw new Error(error.response?.data?.message || 'Error al recibir items de la orden');
  }
};

// ================================
// GESTIÓN DE FACTURAS
// ================================

/**
 * Obtener facturas de proveedores
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.supplierId] - Filtrar por proveedor
 * @param {string} [params.status] - Filtrar por estado
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @param {boolean} [params.overdue] - Solo facturas vencidas
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Object>} Lista de facturas con metadatos
 */
export const getSupplierInvoices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.overdue) queryParams.append('overdue', params.overdue);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiClient.get(`/business/config/suppliers/invoices?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier invoices:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener facturas de proveedores');
  }
};

/**
 * Obtener factura específica
 * @param {string} invoiceId - ID de la factura
 * @returns {Promise<Object>} Datos de la factura
 */
export const getSupplierInvoice = async (invoiceId) => {
  try {
    const response = await apiClient.get(`/business/config/suppliers/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier invoice:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener factura');
  }
};

/**
 * Crear nueva factura de proveedor
 * @param {Object} invoiceData - Datos de la factura
 * @param {string} invoiceData.supplierId - ID del proveedor
 * @param {string} invoiceData.invoiceNumber - Número de factura
 * @param {string} invoiceData.issueDate - Fecha de emisión
 * @param {string} invoiceData.dueDate - Fecha de vencimiento
 * @param {Array} invoiceData.items - Items de la factura
 * @param {number} invoiceData.subtotal - Subtotal
 * @param {number} invoiceData.tax - Impuestos
 * @param {number} invoiceData.total - Total
 * @param {string} [invoiceData.purchaseOrderId] - ID de orden de compra relacionada
 * @param {string} [invoiceData.notes] - Notas adicionales
 * @returns {Promise<Object>} Factura creada
 */
export const createSupplierInvoice = async (invoiceData) => {
  try {
    const response = await apiClient.post('/business/config/suppliers/invoices', invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier invoice:', error);
    throw new Error(error.response?.data?.message || 'Error al crear factura');
  }
};

/**
 * Actualizar factura de proveedor
 * @param {string} invoiceId - ID de la factura
 * @param {Object} invoiceData - Datos a actualizar
 * @returns {Promise<Object>} Factura actualizada
 */
export const updateSupplierInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await apiClient.put(`/business/config/suppliers/invoices/${invoiceId}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier invoice:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar factura');
  }
};

/**
 * Cambiar estado de factura
 * @param {string} invoiceId - ID de la factura
 * @param {string} status - Nuevo estado
 * @param {Object} [metadata] - Datos adicionales
 * @returns {Promise<Object>} Factura actualizada
 */
export const updateInvoiceStatus = async (invoiceId, status, metadata = {}) => {
  try {
    const response = await apiClient.patch(`/business/config/suppliers/invoices/${invoiceId}/status`, {
      status,
      ...metadata
    });
    return response.data;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado de la factura');
  }
};

/**
 * Registrar pago de factura
 * @param {string} invoiceId - ID de la factura
 * @param {Object} paymentData - Datos del pago
 * @param {number} paymentData.amount - Monto pagado
 * @param {string} paymentData.paymentDate - Fecha de pago
 * @param {string} paymentData.paymentMethod - Método de pago
 * @param {string} [paymentData.reference] - Referencia del pago
 * @param {string} [paymentData.notes] - Notas del pago
 * @returns {Promise<Object>} Pago registrado
 */
export const recordInvoicePayment = async (invoiceId, paymentData) => {
  try {
    const response = await apiClient.post(`/business/config/suppliers/invoices/${invoiceId}/payments`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error recording invoice payment:', error);
    throw new Error(error.response?.data?.message || 'Error al registrar pago');
  }
};

// ================================
// CATÁLOGO DE PRODUCTOS
// ================================

/**
 * Obtener catálogo de productos de un proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.category] - Filtrar por categoría
 * @param {string} [params.search] - Búsqueda por nombre o código
 * @param {boolean} [params.available] - Solo productos disponibles
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Object>} Catálogo de productos
 */
export const getSupplierCatalog = async (supplierId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (typeof params.available === 'boolean') queryParams.append('available', params.available);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiClient.get(`/business/config/suppliers/${supplierId}/catalog?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier catalog:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener catálogo del proveedor');
  }
};

/**
 * Agregar producto al catálogo de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {Object} productData - Datos del producto
 * @param {string} productData.supplierSku - SKU del proveedor
 * @param {string} productData.name - Nombre del producto
 * @param {string} [productData.description] - Descripción
 * @param {string} [productData.category] - Categoría
 * @param {number} productData.price - Precio del proveedor
 * @param {string} [productData.unit] - Unidad de medida
 * @param {number} [productData.minimumOrder] - Cantidad mínima de pedido
 * @param {number} [productData.leadTime] - Tiempo de entrega en días
 * @param {boolean} [productData.available] - Si está disponible
 * @returns {Promise<Object>} Producto agregado al catálogo
 */
export const addProductToCatalog = async (supplierId, productData) => {
  try {
    const response = await apiClient.post(`/business/config/suppliers/${supplierId}/catalog`, productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product to catalog:', error);
    throw new Error(error.response?.data?.message || 'Error al agregar producto al catálogo');
  }
};

/**
 * Actualizar producto en catálogo
 * @param {string} supplierId - ID del proveedor
 * @param {string} catalogItemId - ID del item en catálogo
 * @param {Object} productData - Datos a actualizar
 * @returns {Promise<Object>} Producto actualizado
 */
export const updateCatalogProduct = async (supplierId, catalogItemId, productData) => {
  try {
    const response = await apiClient.put(`/business/config/suppliers/${supplierId}/catalog/${catalogItemId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating catalog product:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar producto del catálogo');
  }
};

/**
 * Eliminar producto del catálogo
 * @param {string} supplierId - ID del proveedor
 * @param {string} catalogItemId - ID del item en catálogo
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const removeCatalogProduct = async (supplierId, catalogItemId) => {
  try {
    const response = await apiClient.delete(`/business/config/suppliers/${supplierId}/catalog/${catalogItemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing catalog product:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar producto del catálogo');
  }
};

// ================================
// EVALUACIÓN DE PROVEEDORES
// ================================

/**
 * Obtener evaluaciones de un proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @returns {Promise<Array>} Lista de evaluaciones
 */
export const getSupplierEvaluations = async (supplierId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/business/config/suppliers/${supplierId}/evaluations?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier evaluations:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener evaluaciones del proveedor');
  }
};

/**
 * Crear evaluación de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {Object} evaluationData - Datos de la evaluación
 * @param {number} evaluationData.qualityScore - Puntuación de calidad (1-5)
 * @param {number} evaluationData.deliveryScore - Puntuación de entrega (1-5)
 * @param {number} evaluationData.serviceScore - Puntuación de servicio (1-5)
 * @param {number} evaluationData.priceScore - Puntuación de precio (1-5)
 * @param {string} [evaluationData.comments] - Comentarios
 * @param {string} [evaluationData.period] - Período evaluado
 * @returns {Promise<Object>} Evaluación creada
 */
export const createSupplierEvaluation = async (supplierId, evaluationData) => {
  try {
    const response = await apiClient.post(`/business/config/suppliers/${supplierId}/evaluations`, evaluationData);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier evaluation:', error);
    throw new Error(error.response?.data?.message || 'Error al crear evaluación');
  }
};

// ================================
// REPORTES Y ESTADÍSTICAS
// ================================

/**
 * Obtener resumen de proveedores
 * @returns {Promise<Object>} Resumen con métricas principales
 */
export const getSuppliersStats = async () => {
  try {
    const response = await apiClient.get('/business/config/suppliers/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers stats:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de proveedores');
  }
};

/**
 * Obtener reporte de compras por proveedor
 * @param {Object} params - Parámetros del reporte
 * @param {string} [params.period] - Período (week, month, quarter, year)
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @param {string} [params.supplierId] - Proveedor específico
 * @returns {Promise<Object>} Reporte de compras
 */
export const getPurchaseReport = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);

    const response = await apiClient.get(`/business/config/suppliers/purchase-report?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase report:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener reporte de compras');
  }
};

/**
 * Obtener análisis de rendimiento de proveedores
 * @param {Object} params - Parámetros del análisis
 * @param {string} [params.period] - Período de análisis
 * @param {number} [params.minOrders] - Mínimo de órdenes para incluir
 * @returns {Promise<Object>} Análisis de rendimiento
 */
export const getSupplierPerformanceAnalysis = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.minOrders) queryParams.append('minOrders', params.minOrders);

    const response = await apiClient.get(`/business/config/suppliers/performance-analysis?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier performance analysis:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener análisis de rendimiento');
  }
};

/**
 * Obtener facturas vencidas
 * @param {number} [days] - Días de vencimiento
 * @returns {Promise<Array>} Lista de facturas vencidas
 */
export const getOverdueInvoices = async (days = 0) => {
  try {
    const response = await apiClient.get(`/business/config/suppliers/overdue-invoices?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener facturas vencidas');
  }
};

// ================================
// GESTIÓN DE DOCUMENTOS
// ================================

/**
 * Subir documento de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {File} file - Archivo a subir
 * @param {string} documentType - Tipo de documento
 * @param {string} [description] - Descripción del documento
 * @returns {Promise<Object>} Documento subido
 */
export const uploadSupplierDocument = async (supplierId, file, documentType, description = '') => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (description) formData.append('description', description);

    const response = await apiClient.post(
      `/business/config/suppliers/${supplierId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading supplier document:', error);
    throw new Error(error.response?.data?.message || 'Error al subir documento');
  }
};

/**
 * Obtener documentos de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {string} [documentType] - Filtrar por tipo de documento
 * @returns {Promise<Array>} Lista de documentos
 */
export const getSupplierDocuments = async (supplierId, documentType = null) => {
  try {
    const queryParams = documentType ? `?documentType=${documentType}` : '';
    const response = await apiClient.get(`/business/config/suppliers/${supplierId}/documents${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier documents:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener documentos');
  }
};

/**
 * Eliminar documento de proveedor
 * @param {string} supplierId - ID del proveedor
 * @param {string} documentId - ID del documento
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteSupplierDocument = async (supplierId, documentId) => {
  try {
    const response = await apiClient.delete(`/business/config/suppliers/${supplierId}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting supplier document:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar documento');
  }
};

// ================================
// UTILIDADES Y VALIDACIONES
// ================================

/**
 * Validar datos de proveedor antes de enviar
 * @param {Object} supplierData - Datos del proveedor
 * @returns {Object} Resultado de validación
 */
export const validateSupplierData = (supplierData) => {
  const errors = {};
  
  // Validaciones obligatorias
  if (!supplierData.name || supplierData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!supplierData.type || !SUPPLIER_CONSTANTS.TYPES[supplierData.type]) {
    errors.type = 'El tipo de proveedor es obligatorio';
  }

  // Validación de email
  if (supplierData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
    errors.email = 'El email no tiene un formato válido';
  }

  // Validación de teléfono
  if (supplierData.phone && supplierData.phone.length < 7) {
    errors.phone = 'El teléfono debe tener al menos 7 dígitos';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formatear datos de proveedor para mostrar
 * @param {Object} supplier - Datos del proveedor
 * @returns {Object} Proveedor formateado
 */
export const formatSupplierData = (supplier) => {
  return {
    ...supplier,
    typeLabel: SUPPLIER_CONSTANTS.TYPE_LABELS[supplier.type] || supplier.type,
    statusLabel: SUPPLIER_CONSTANTS.STATUS_LABELS[supplier.status] || supplier.status,
    statusColor: getStatusColor(supplier.status),
    paymentTermsLabel: SUPPLIER_CONSTANTS.PAYMENT_TERMS_LABELS[supplier.paymentTerms?.type] || 'No definido',
    fullAddress: formatAddress(supplier.address),
    primaryContact: supplier.contacts?.find(contact => contact.isPrimary) || null,
    categoriesLabels: supplier.categories?.map(cat => SUPPLIER_CONSTANTS.CATEGORIES[cat] || cat) || []
  };
};

/**
 * Obtener color del estado del proveedor
 * @param {string} status - Estado del proveedor
 * @returns {string} Color correspondiente
 */
export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    PENDING: 'yellow',
    BLOCKED: 'red',
    UNDER_REVIEW: 'orange'
  };
  return colors[status] || 'gray';
};

/**
 * Formatear dirección completa
 * @param {Object} address - Objeto de dirección
 * @returns {string} Dirección formateada
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Calcular días de vencimiento de factura
 * @param {string} dueDate - Fecha de vencimiento
 * @returns {number} Días hasta vencimiento (negativo si ya venció)
 */
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calcular totales de orden de compra
 * @param {Array} items - Items de la orden
 * @returns {Object} Totales calculados
 */
export const calculateOrderTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.19; // IVA 19%
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total,
    formattedSubtotal: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(subtotal),
    formattedTax: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(tax),
    formattedTotal: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(total)
  };
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

// Operaciones CRUD principales
export const suppliersCRUD = {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  updateSupplierStatus
};

// Gestión de contactos
export const contactsManagement = {
  getSupplierContacts,
  addSupplierContact,
  updateSupplierContact,
  deleteSupplierContact
};

// Órdenes de compra
export const purchaseOrdersManagement = {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  receiveOrderItems
};

// Gestión de facturas
export const invoicesManagement = {
  getSupplierInvoices,
  getSupplierInvoice,
  createSupplierInvoice,
  updateSupplierInvoice,
  updateInvoiceStatus,
  recordInvoicePayment
};

// Catálogo de productos
export const catalogManagement = {
  getSupplierCatalog,
  addProductToCatalog,
  updateCatalogProduct,
  removeCatalogProduct
};

// Evaluaciones
export const evaluationsManagement = {
  getSupplierEvaluations,
  createSupplierEvaluation
};

// Reportes y análisis
export const reportsAndAnalytics = {
  getSuppliersStats,
  getPurchaseReport,
  getSupplierPerformanceAnalysis,
  getOverdueInvoices
};

// Gestión de documentos
export const documentsManagement = {
  uploadSupplierDocument,
  getSupplierDocuments,
  deleteSupplierDocument
};

// Utilidades
export const supplierUtils = {
  validateSupplierData,
  formatSupplierData,
  getStatusColor,
  formatAddress,
  getDaysUntilDue,
  calculateOrderTotals
};

// Exportación por defecto con todas las funciones agrupadas
export default {
  // CRUD operations
  ...suppliersCRUD,
  
  // Contacts management
  ...contactsManagement,
  
  // Purchase orders
  ...purchaseOrdersManagement,
  
  // Invoices management
  ...invoicesManagement,
  
  // Catalog management
  ...catalogManagement,
  
  // Evaluations
  ...evaluationsManagement,
  
  // Reports and analytics
  ...reportsAndAnalytics,
  
  // Documents management
  ...documentsManagement,
  
  // Utilities
  ...supplierUtils,
  
  // Constants
  SUPPLIER_CONSTANTS
};