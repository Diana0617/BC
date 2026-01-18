/**
 * API Frontend para Gestión de Inventario del Negocio
 * 
 * Proporciona funcionalidades completas para:
 * - CRUD de productos e inventario
 * - Control de stock y movimientos
 * - Gestión de categorías y proveedores
 * - Seguimiento de lotes y vencimientos
 * - Alertas de stock bajo
 * - Reportes y estadísticas de inventario
 * - Valorización de inventario
 */


import { apiClient } from './client.js';


// ================================
// CONSTANTES Y CONFIGURACIONES
// ================================

export const INVENTORY_CONSTANTS = {
  MOVEMENT_TYPES: {
    PURCHASE: 'PURCHASE',
    SALE: 'SALE',
    ADJUSTMENT: 'ADJUSTMENT',
    TRANSFER: 'TRANSFER',
    RETURN: 'RETURN',
    DAMAGE: 'DAMAGE',
    EXPIRED: 'EXPIRED',
    INITIAL_STOCK: 'INITIAL_STOCK'
  },
  MOVEMENT_LABELS: {
    PURCHASE: 'Compra',
    SALE: 'Venta',
    ADJUSTMENT: 'Ajuste',
    TRANSFER: 'Transferencia',
    RETURN: 'Devolución',
    DAMAGE: 'Daño',
    EXPIRED: 'Vencido',
    INITIAL_STOCK: 'Stock Inicial'
  },
  CATEGORIES: {
    CONSUMIBLES: 'Consumibles',
    PRODUCTOS_CABELLO: 'Productos para Cabello',
    PRODUCTOS_PIEL: 'Productos para Piel',
    COSMETICOS: 'Cosméticos',
    HERRAMIENTAS: 'Herramientas',
    EQUIPOS: 'Equipos',
    SUMINISTROS: 'Suministros',
    OTROS: 'Otros'
  },
  UNITS: {
    UNIT: 'unidad',
    ML: 'ml',
    L: 'litro',
    G: 'gramo',
    KG: 'kilogramo',
    OZ: 'onza',
    PACKAGE: 'paquete'
  },
  STOCK_STATUS: {
    IN_STOCK: 'EN_STOCK',
    LOW_STOCK: 'STOCK_BAJO',
    OUT_OF_STOCK: 'SIN_STOCK',
    OVERSTOCK: 'SOBRESTOCK'
  }
};

// ================================
// PRODUCTOS - CRUD
// ================================

/**
 * Obtener lista de productos del inventario
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.category] - Filtrar por categoría
 * @param {boolean} [params.isActive] - Filtrar por estado activo
 * @param {boolean} [params.trackInventory] - Filtrar productos con seguimiento de inventario
 * @param {string} [params.stockStatus] - Filtrar por estado de stock
 * @param {string} [params.search] - Búsqueda por nombre, SKU o código de barras
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados por página
 * @param {string} [params.sortBy] - Campo para ordenar
 * @param {string} [params.sortOrder] - Orden (asc, desc)
 * @returns {Promise<Object>} Lista de productos con metadatos
 */
export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (typeof params.isActive === 'boolean') queryParams.append('isActive', params.isActive);
    if (typeof params.trackInventory === 'boolean') queryParams.append('trackInventory', params.trackInventory);
    if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/business/config/inventory/products?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener productos');
  }
};

/**
 * Obtener producto específico por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const getProduct = async (productId) => {
  try {
    const response = await apiClient.get(`/business/config/inventory/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener producto');
  }
};

/**
 * Crear nuevo producto
 * @param {Object} productData - Datos del producto
 * @param {string} productData.name - Nombre del producto (obligatorio)
 * @param {string} [productData.description] - Descripción del producto
 * @param {string} [productData.sku] - Código SKU
 * @param {string} [productData.barcode] - Código de barras
 * @param {string} [productData.category] - Categoría del producto
 * @param {string} [productData.brand] - Marca del producto
 * @param {number} productData.price - Precio de venta (obligatorio)
 * @param {number} [productData.cost] - Costo de compra
 * @param {boolean} [productData.trackInventory] - Si se rastrea inventario
 * @param {number} [productData.currentStock] - Stock actual
 * @param {number} [productData.minStock] - Stock mínimo
 * @param {number} [productData.maxStock] - Stock máximo
 * @param {string} [productData.unit] - Unidad de medida
 * @param {number} [productData.weight] - Peso del producto
 * @param {Object} [productData.dimensions] - Dimensiones del producto
 * @param {boolean} [productData.taxable] - Si aplican impuestos
 * @param {number} [productData.taxRate] - Tasa de impuesto
 * @param {Object} [productData.supplier] - Información del proveedor
 * @param {Array} [productData.tags] - Etiquetas del producto
 * @param {boolean} [productData.expirationTracking] - Seguimiento de vencimiento
 * @param {boolean} [productData.batchTracking] - Seguimiento de lotes
 * @param {boolean} [productData.serialTracking] - Seguimiento de números de serie
 * @returns {Promise<Object>} Producto creado
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/business/config/inventory/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || 'Error al crear producto');
  }
};

/**
 * Actualizar producto existente
 * @param {string} productId - ID del producto
 * @param {Object} productData - Datos a actualizar
 * @returns {Promise<Object>} Producto actualizado
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/business/config/inventory/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar producto');
  }
};

/**
 * Eliminar producto
 * @param {string} businessId - ID del negocio
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteProduct = async (businessId, productId) => {
  try {
    const response = await apiClient.delete(`/business/${businessId}/config/inventory/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar producto');
  }
};

/**
 * Activar/Desactivar producto
 * @param {string} productId - ID del producto
 * @param {boolean} isActive - Estado activo
 * @returns {Promise<Object>} Producto actualizado
 */
export const toggleProductStatus = async (productId, isActive) => {
  try {
    const response = await apiClient.patch(`/business/config/inventory/products/${productId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado del producto');
  }
};

// ================================
// GESTIÓN DE STOCK
// ================================

/**
 * Obtener stock actual de productos
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.category] - Filtrar por categoría
 * @param {string} [params.stockStatus] - Filtrar por estado de stock
 * @param {boolean} [params.lowStock] - Solo productos con stock bajo
 * @returns {Promise<Array>} Lista de productos con información de stock
 */
export const getStockLevels = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
    if (params.lowStock) queryParams.append('lowStock', params.lowStock);

    const response = await apiClient.get(`/business/config/inventory/stock-levels?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener niveles de stock');
  }
};

/**
 * Ajustar stock de un producto
 * @param {string} productId - ID del producto
 * @param {Object} adjustmentData - Datos del ajuste
 * @param {number} adjustmentData.quantity - Cantidad a ajustar (positiva o negativa)
 * @param {string} adjustmentData.reason - Razón del ajuste
 * @param {string} [adjustmentData.notes] - Notas adicionales
 * @param {number} [adjustmentData.unitCost] - Costo unitario
 * @returns {Promise<Object>} Movimiento de inventario creado
 */
export const adjustStock = async (productId, adjustmentData) => {
  try {
    const response = await apiClient.post(`/business/config/inventory/products/${productId}/adjust-stock`, adjustmentData);
    return response.data;
  } catch (error) {
    console.error('Error adjusting stock:', error);
    throw new Error(error.response?.data?.message || 'Error al ajustar stock');
  }
};

/**
 * Establecer stock inicial de un producto
 * @param {string} productId - ID del producto
 * @param {Object} initialStockData - Datos del stock inicial
 * @param {number} initialStockData.quantity - Cantidad inicial
 * @param {number} [initialStockData.unitCost] - Costo unitario
 * @param {string} [initialStockData.notes] - Notas
 * @returns {Promise<Object>} Movimiento de inventario creado
 */
export const setInitialStock = async (productId, initialStockData) => {
  try {
    const response = await apiClient.post(`/business/config/inventory/products/${productId}/initial-stock`, initialStockData);
    return response.data;
  } catch (error) {
    console.error('Error setting initial stock:', error);
    throw new Error(error.response?.data?.message || 'Error al establecer stock inicial');
  }
};

/**
 * Transferir stock entre productos o ubicaciones
 * @param {Object} transferData - Datos de la transferencia
 * @param {string} transferData.fromProductId - ID del producto origen
 * @param {string} [transferData.toProductId] - ID del producto destino
 * @param {number} transferData.quantity - Cantidad a transferir
 * @param {string} transferData.reason - Razón de la transferencia
 * @param {string} [transferData.notes] - Notas adicionales
 * @returns {Promise<Object>} Transferencia creada
 */
export const transferStock = async (transferData) => {
  try {
    const response = await apiClient.post('/business/config/inventory/transfer-stock', transferData);
    return response.data;
  } catch (error) {
    console.error('Error transferring stock:', error);
    throw new Error(error.response?.data?.message || 'Error al transferir stock');
  }
};

// ================================
// MOVIMIENTOS DE INVENTARIO
// ================================

/**
 * Obtener historial de movimientos de inventario
 * @param {Object} params - Parámetros de filtrado
 * @param {string} [params.productId] - Filtrar por producto específico
 * @param {string} [params.movementType] - Filtrar por tipo de movimiento
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @param {number} [params.page] - Página para paginación
 * @param {number} [params.limit] - Límite de resultados
 * @returns {Promise<Object>} Lista de movimientos con metadatos
 */
export const getInventoryMovements = async (businessId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.productId) queryParams.append('productId', params.productId);
    if (params.branchId) queryParams.append('branchId', params.branchId);
    if (params.movementType) queryParams.append('movementType', params.movementType);
    if (params.reason) queryParams.append('reason', params.reason);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `/business/${businessId}/config/inventory/movements${queryString ? '?' + queryString : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener movimientos de inventario');
  }
};

/**
 * Obtener movimiento específico por ID
 * @param {string} movementId - ID del movimiento
 * @returns {Promise<Object>} Datos del movimiento
 */
export const getInventoryMovement = async (movementId) => {
  try {
    const response = await apiClient.get(`/business/config/inventory/movements/${movementId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory movement:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener movimiento de inventario');
  }
};

/**
 * Crear movimiento de inventario manual
 * @param {Object} movementData - Datos del movimiento
 * @param {string} movementData.productId - ID del producto
 * @param {string} movementData.movementType - Tipo de movimiento
 * @param {number} movementData.quantity - Cantidad del movimiento
 * @param {string} [movementData.reason] - Razón del movimiento
 * @param {string} [movementData.notes] - Notas adicionales
 * @param {number} [movementData.unitCost] - Costo unitario
 * @param {string} [movementData.batchNumber] - Número de lote
 * @param {string} [movementData.expirationDate] - Fecha de vencimiento
 * @param {Object} [movementData.supplierInfo] - Información del proveedor
 * @returns {Promise<Object>} Movimiento creado
 */
export const createInventoryMovement = async (movementData) => {
  try {
    const response = await apiClient.post('/business/config/inventory/movements', movementData);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    throw new Error(error.response?.data?.message || 'Error al crear movimiento de inventario');
  }
};

// ================================
// CATEGORÍAS Y ORGANIZACIÓN
// ================================

/**
 * Obtener categorías de productos
 * @returns {Promise<Array>} Lista de categorías con conteos
 */
export const getProductCategories = async () => {
  try {
    const response = await apiClient.get('/business/config/inventory/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener categorías');
  }
};

/**
 * Crear nueva categoría personalizada
 * @param {Object} categoryData - Datos de la categoría
 * @param {string} categoryData.name - Nombre de la categoría
 * @param {string} [categoryData.description] - Descripción
 * @returns {Promise<Object>} Categoría creada
 */
export const createProductCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/business/config/inventory/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating product category:', error);
    throw new Error(error.response?.data?.message || 'Error al crear categoría');
  }
};

/**
 * Obtener productos con stock bajo
 * @returns {Promise<Array>} Lista de productos con stock bajo
 */
export const getLowStockProducts = async () => {
  try {
    const response = await apiClient.get('/business/config/inventory/low-stock');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener productos con stock bajo');
  }
};

/**
 * Obtener productos próximos a vencer
 * @param {number} [days=30] - Días de anticipación
 * @returns {Promise<Array>} Lista de productos próximos a vencer
 */
export const getExpiringProducts = async (days = 30) => {
  try {
    const response = await apiClient.get(`/business/config/inventory/expiring?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener productos próximos a vencer');
  }
};

// ================================
// GESTIÓN DE IMÁGENES
// ================================

/**
 * Subir imagen del producto
 * @param {string} productId - ID del producto
 * @param {File} imageFile - Archivo de imagen
 * @param {string} [description] - Descripción de la imagen
 * @returns {Promise<Object>} URL de la imagen subida
 */
export const uploadProductImage = async (productId, imageFile, description = '') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (description) formData.append('description', description);

    // NO establecer Content-Type manualmente - axios lo hace automáticamente con el boundary correcto
    const response = await apiClient.post(
      `/business/config/inventory/products/${productId}/images`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw new Error(error.response?.data?.message || 'Error al subir imagen del producto');
  }
};

/**
 * Eliminar imagen del producto
 * @param {string} businessId - ID del negocio
 * @param {string} productId - ID del producto
 * @param {string} imageId - ID de la imagen (índice)
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteProductImage = async (businessId, productId, imageId) => {
  try {
    const response = await apiClient.delete(`/business/${businessId}/config/inventory/products/${productId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar imagen del producto');
  }
};

// ================================
// REPORTES Y ESTADÍSTICAS
// ================================

/**
 * Obtener resumen de inventario
 * @returns {Promise<Object>} Resumen con métricas principales
 */
export const getInventorySummary = async () => {
  try {
    const response = await apiClient.get('/business/config/inventory/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener resumen de inventario');
  }
};

/**
 * Obtener valorización de inventario
 * @param {Object} params - Parámetros del reporte
 * @param {string} [params.method] - Método de valorización (FIFO, LIFO, AVERAGE)
 * @param {string} [params.date] - Fecha de valorización
 * @returns {Promise<Object>} Reporte de valorización
 */
export const getInventoryValuation = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.method) queryParams.append('method', params.method);
    if (params.date) queryParams.append('date', params.date);

    const response = await apiClient.get(`/business/config/inventory/valuation?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory valuation:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener valorización de inventario');
  }
};

/**
 * Obtener estadísticas de movimientos
 * @param {Object} params - Parámetros del reporte
 * @param {string} [params.period] - Período (week, month, quarter, year)
 * @param {string} [params.startDate] - Fecha de inicio
 * @param {string} [params.endDate] - Fecha de fin
 * @returns {Promise<Object>} Estadísticas de movimientos
 */
export const getMovementStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/business/config/inventory/movement-stats?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movement stats:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de movimientos');
  }
};

/**
 * Obtener análisis ABC de productos
 * @returns {Promise<Object>} Análisis ABC de productos por valor
 */
export const getABCAnalysis = async () => {
  try {
    const response = await apiClient.get('/business/config/inventory/abc-analysis');
    return response.data;
  } catch (error) {
    console.error('Error fetching ABC analysis:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener análisis ABC');
  }
};

// ================================
// ALERTAS Y NOTIFICACIONES
// ================================

/**
 * Configurar alertas de inventario
 * @param {Object} alertConfig - Configuración de alertas
 * @param {boolean} [alertConfig.lowStockEnabled] - Habilitar alertas de stock bajo
 * @param {boolean} [alertConfig.expirationEnabled] - Habilitar alertas de vencimiento
 * @param {number} [alertConfig.expirationDays] - Días de anticipación para vencimientos
 * @param {Array} [alertConfig.emailRecipients] - Destinatarios de email
 * @returns {Promise<Object>} Configuración actualizada
 */
export const configureInventoryAlerts = async (alertConfig) => {
  try {
    const response = await apiClient.put('/business/config/inventory/alerts', alertConfig);
    return response.data;
  } catch (error) {
    console.error('Error configuring inventory alerts:', error);
    throw new Error(error.response?.data?.message || 'Error al configurar alertas de inventario');
  }
};

/**
 * Obtener configuración actual de alertas
 * @returns {Promise<Object>} Configuración de alertas
 */
export const getInventoryAlertsConfig = async () => {
  try {
    const response = await apiClient.get('/business/config/inventory/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory alerts config:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración de alertas');
  }
};

// ================================
// UTILIDADES Y VALIDACIONES
// ================================

/**
 * Validar datos de producto antes de enviar
 * @param {Object} productData - Datos del producto
 * @returns {Object} Resultado de validación
 */
export const validateProductData = (productData) => {
  const errors = {};
  
  // Validaciones obligatorias
  if (!productData.name || productData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!productData.price || productData.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  // Validación de stock
  if (productData.trackInventory && productData.minStock < 0) {
    errors.minStock = 'El stock mínimo no puede ser negativo';
  }

  if (productData.trackInventory && productData.maxStock && productData.maxStock < productData.minStock) {
    errors.maxStock = 'El stock máximo debe ser mayor al mínimo';
  }

  // Validación de costos
  if (productData.cost && productData.cost < 0) {
    errors.cost = 'El costo no puede ser negativo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formatear datos de producto para mostrar
 * @param {Object} product - Datos del producto
 * @returns {Object} Producto formateado
 */
export const formatProductData = (product) => {
  const stockStatus = getStockStatus(product);
  const marginPercentage = product.cost > 0 ? ((product.price - product.cost) / product.cost * 100).toFixed(2) : 0;

  return {
    ...product,
    formattedPrice: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(product.price),
    formattedCost: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(product.cost || 0),
    stockStatus: stockStatus.status,
    stockStatusLabel: stockStatus.label,
    stockStatusColor: stockStatus.color,
    marginPercentage: `${marginPercentage}%`,
    categoryLabel: INVENTORY_CONSTANTS.CATEGORIES[product.category] || product.category || 'Sin categoría',
    unitLabel: INVENTORY_CONSTANTS.UNITS[product.unit] || product.unit || 'unidad'
  };
};

/**
 * Determinar estado del stock de un producto
 * @param {Object} product - Producto
 * @returns {Object} Estado del stock con etiqueta y color
 */
export const getStockStatus = (product) => {
  if (!product.trackInventory) {
    return {
      status: 'NO_TRACKED',
      label: 'No rastreado',
      color: 'gray'
    };
  }

  const { currentStock, minStock, maxStock } = product;

  if (currentStock === 0) {
    return {
      status: INVENTORY_CONSTANTS.STOCK_STATUS.OUT_OF_STOCK,
      label: 'Sin stock',
      color: 'red'
    };
  }

  if (currentStock <= minStock) {
    return {
      status: INVENTORY_CONSTANTS.STOCK_STATUS.LOW_STOCK,
      label: 'Stock bajo',
      color: 'orange'
    };
  }

  if (maxStock && currentStock >= maxStock) {
    return {
      status: INVENTORY_CONSTANTS.STOCK_STATUS.OVERSTOCK,
      label: 'Sobrestock',
      color: 'purple'
    };
  }

  return {
    status: INVENTORY_CONSTANTS.STOCK_STATUS.IN_STOCK,
    label: 'En stock',
    color: 'green'
  };
};

/**
 * Calcular valor total de inventario
 * @param {Array} products - Lista de productos
 * @returns {Object} Valores calculados
 */
export const calculateInventoryValue = (products) => {
  const totals = products.reduce((acc, product) => {
    if (product.trackInventory) {
      const stockValue = product.currentStock * (product.cost || 0);
      const retailValue = product.currentStock * product.price;
      
      acc.totalCost += stockValue;
      acc.totalRetail += retailValue;
      acc.totalUnits += product.currentStock;
      acc.totalProducts += 1;
    }
    return acc;
  }, {
    totalCost: 0,
    totalRetail: 0,
    totalUnits: 0,
    totalProducts: 0
  });

  return {
    ...totals,
    formattedTotalCost: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(totals.totalCost),
    formattedTotalRetail: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(totals.totalRetail),
    potentialProfit: totals.totalRetail - totals.totalCost
  };
};

// ================================
// EXPORTACIONES AGRUPADAS
// ================================

// Operaciones CRUD principales
export const productsCRUD = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};

// Gestión de stock
export const stockManagement = {
  getStockLevels,
  adjustStock,
  setInitialStock,
  transferStock,
  getLowStockProducts,
  getExpiringProducts
};

// Movimientos de inventario
export const inventoryMovements = {
  getInventoryMovements,
  getInventoryMovement,
  createInventoryMovement
};

// Categorías y organización
export const categoryManagement = {
  getProductCategories,
  createProductCategory
};

// Gestión de imágenes
export const imageManagement = {
  uploadProductImage,
  deleteProductImage
};

// Reportes y análisis
export const reportsAndAnalytics = {
  getInventorySummary,
  getInventoryValuation,
  getMovementStats,
  getABCAnalysis
};

// Alertas y configuraciones
export const alertsManagement = {
  configureInventoryAlerts,
  getInventoryAlertsConfig
};

// Utilidades
export const inventoryUtils = {
  validateProductData,
  formatProductData,
  getStockStatus,
  calculateInventoryValue
};

// Exportación por defecto con todas las funciones agrupadas
export default {
  // CRUD operations
  ...productsCRUD,
  
  // Stock management
  ...stockManagement,
  
  // Inventory movements
  ...inventoryMovements,
  
  // Category management
  ...categoryManagement,
  
  // Image management
  ...imageManagement,
  
  // Reports and analytics
  ...reportsAndAnalytics,
  
  // Alerts management
  ...alertsManagement,
  
  // Utilities
  ...inventoryUtils,
  
  // Constants
  INVENTORY_CONSTANTS
};