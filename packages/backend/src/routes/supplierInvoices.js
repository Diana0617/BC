const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { requireFullAccess } = require('../middleware/subscription');
const SupplierInvoiceController = require('../controllers/SupplierInvoiceController');

// Configurar multer para manejar archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

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
 * GET /api/business/:businessId/suppliers
 * Obtener todos los proveedores del negocio
 * Query params: status, search, page, limit
 */
router.get(
  '/../suppliers',
  SupplierInvoiceController.getSuppliers
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
 * POST /api/business/:businessId/supplier-invoices/:invoiceId/distribute-stock
 * Distribuir el stock de una factura pendiente entre sucursales
 * Body: { distribution: [{ branchId, items: [{ productId, quantity }] }] }
 */
router.post(
  '/:invoiceId/distribute-stock',
  SupplierInvoiceController.distributeStock
);

/**
 * POST /api/business/:businessId/supplier-invoices/:invoiceId/approve
 * Aprobar factura (requiere distribución previa de stock)
 */
router.post(
  '/:invoiceId/approve',
  SupplierInvoiceController.approveInvoice
);

/**
 * POST /api/business/:businessId/supplier-invoices/:invoiceId/pay
 * Registrar un pago de factura
 * Body (multipart/form-data): { amount, paymentDate, paymentMethod, reference?, receipt (file)?, notes? }
 */
router.post(
  '/:invoiceId/pay',
  upload.single('receipt'),
  SupplierInvoiceController.registerPayment
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
