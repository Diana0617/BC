const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante para recibir branchId de la ruta padre
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const BranchInventoryController = require('../controllers/BranchInventoryController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ================================
// CONSULTAS DE INVENTARIO
// ================================

/**
 * GET /api/branches/:branchId/inventory/products
 * Obtener todos los productos con su stock en la sucursal
 * Query params: search, category, productType, stockStatus, page, limit
 */
router.get(
  '/products',
  requireBasicAccess,
  BranchInventoryController.getBranchProducts
);

/**
 * GET /api/branches/:branchId/inventory/products/:productId
 * Obtener stock de un producto específico
 */
router.get(
  '/products/:productId',
  requireBasicAccess,
  BranchInventoryController.getBranchProductStock
);

/**
 * GET /api/branches/:branchId/inventory/low-stock
 * Obtener productos con stock bajo
 */
router.get(
  '/low-stock',
  requireBasicAccess,
  BranchInventoryController.getLowStockProducts
);

/**
 * GET /api/branches/:branchId/inventory/products/:productId/movements
 * Obtener historial de movimientos de un producto
 * Query params: startDate, endDate, movementType, page, limit
 */
router.get(
  '/products/:productId/movements',
  requireBasicAccess,
  BranchInventoryController.getProductMovements
);

// ================================
// OPERACIONES DE INVENTARIO
// ================================

/**
 * POST /api/branches/:branchId/inventory/initial-stock
 * Cargar stock inicial de múltiples productos
 * Body: { products: [{ productId, quantity, unitCost }] }
 */
router.post(
  '/initial-stock',
  requireFullAccess,
  BranchInventoryController.loadInitialStock
);

/**
 * POST /api/branches/:branchId/inventory/adjust-stock
 * Ajustar stock de un producto (incremento o decremento)
 * Body: { productId, quantity, reason, notes, unitCost }
 */
router.post(
  '/adjust-stock',
  requireFullAccess,
  BranchInventoryController.adjustBranchStock
);

/**
 * PUT /api/branches/:branchId/inventory/products/:productId/config
 * Actualizar configuración de stock (min/max)
 * Body: { minStock, maxStock, notes }
 */
router.put(
  '/products/:productId/config',
  requireFullAccess,
  BranchInventoryController.updateStockConfig
);

module.exports = router;
