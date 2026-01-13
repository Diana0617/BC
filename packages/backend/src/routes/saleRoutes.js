const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/SaleController');
const { authenticateToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

/**
 * Rutas de ventas
 * Todas requieren autenticación
 * Roles permitidos: BUSINESS, BUSINESS_SPECIALIST, RECEPTIONIST, SPECIALIST
 * NO permitido: OWNER
 */

// Crear venta
router.post(
  '/',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  SaleController.createSale
);

// Obtener resumen de ventas (debe ir antes de /:id para evitar conflictos)
router.get(
  '/summary',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  SaleController.getSalesSummary
);

// Listar ventas con filtros
router.get(
  '/',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  SaleController.getSales
);

// Obtener detalle de una venta
router.get(
  '/:id',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  SaleController.getSaleById
);

// Generar PDF del recibo de venta
router.get(
  '/:saleId/receipt-pdf',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  SaleController.generateReceiptPDF
);

// Cancelar venta
router.patch(
  '/:id/cancel',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST']),
  SaleController.cancelSale
);

module.exports = router;
