const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { requireFullAccess } = require('../middleware/subscription');
const SupplierInvoiceController = require('../controllers/SupplierInvoiceController');

// Todas las rutas requieren autenticación y acceso completo
router.use(authenticateToken);
router.use(requireFullAccess);

/**
 * GET /api/business/:businessId/suppliers
 * Obtener todos los proveedores del negocio
 * Query params: status, search, page, limit
 */
router.get(
  '/',
  SupplierInvoiceController.getSuppliers
);

/**
 * GET /api/business/:businessId/suppliers/:supplierId/account-summary
 * Obtener resumen de cuenta de un proveedor
 */
router.get(
  '/:supplierId/account-summary',
  SupplierInvoiceController.getSupplierAccountSummary
);

module.exports = router;
