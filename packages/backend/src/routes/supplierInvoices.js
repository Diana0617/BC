const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { requireFullAccess } = require('../middleware/subscription');
const SupplierInvoiceController = require('../controllers/SupplierInvoiceController');

// Todas las rutas requieren autenticación y acceso completo
router.use(authenticateToken);
router.use(requireFullAccess);

/**
 * GET /api/business/:businessId/supplier-invoices
 * Obtener todas las facturas de proveedores del negocio
 * Query params: supplierId, status, startDate, endDate, page, limit
 */
router.get(
  '/',
  SupplierInvoiceController.getInvoices
);

/**
 * GET /api/business/:businessId/supplier-invoices/:invoiceId
 * Obtener una factura específica
 */
router.get(
  '/:invoiceId',
  SupplierInvoiceController.getInvoice
);

/**
 * POST /api/business/:businessId/supplier-invoices
 * Crear una nueva factura de proveedor
 * Body: { supplierId, supplierData, invoiceNumber, issueDate, dueDate, items, subtotal, tax, total, notes, attachments }
 */
router.post(
  '/',
  SupplierInvoiceController.createInvoice
);

/**
 * POST /api/business/:businessId/supplier-invoices/:invoiceId/approve
 * Aprobar factura y actualizar inventario
 * Body: { branchId }
 */
router.post(
  '/:invoiceId/approve',
  SupplierInvoiceController.approveInvoice
);

/**
 * GET /api/business/:businessId/suppliers/:supplierId/account-summary
 * Obtener resumen de cuenta de un proveedor
 */
router.get(
  '/../suppliers/:supplierId/account-summary',
  SupplierInvoiceController.getSupplierAccountSummary
);

module.exports = router;
