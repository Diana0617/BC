const express = require('express');
const router = express.Router();
const CashRegisterController = require('../controllers/CashRegisterController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rutas para gestión de caja (turnos)
 * Base: /api/cash-register
 */

// Verificar si el usuario debe usar gestión de caja
router.get(
  '/should-use',
  authenticateToken,
  CashRegisterController.shouldUseCashRegister
);

// Obtener turno activo
router.get(
  '/active-shift',
  authenticateToken,
  CashRegisterController.getActiveShift
);

// Abrir nuevo turno
router.post(
  '/open-shift',
  authenticateToken,
  CashRegisterController.openShift
);

// Cerrar turno actual
router.post(
  '/close-shift',
  authenticateToken,
  CashRegisterController.closeShift
);

// Obtener resumen del turno actual
router.get(
  '/shift-summary',
  authenticateToken,
  CashRegisterController.getShiftSummary
);

// Generar PDF del turno antes de cerrar
router.get(
  '/generate-closing-pdf',
  authenticateToken,
  CashRegisterController.generateClosingPDF
);

// Obtener historial de turnos
router.get(
  '/shifts-history',
  authenticateToken,
  CashRegisterController.getShiftsHistory
);

// Obtener último turno cerrado (para balance inicial)
router.get(
  '/last-closed-shift',
  authenticateToken,
  CashRegisterController.getLastClosedShift
);

// ==================== RECIBOS ====================

// Generar PDF de recibo para una cita
router.get(
  '/generate-receipt-pdf/:appointmentId',
  authenticateToken,
  CashRegisterController.generateReceiptPDF
);

// Obtener datos del recibo para envío por WhatsApp
router.get(
  '/receipt-data/:appointmentId',
  authenticateToken,
  CashRegisterController.getReceiptData
);

// Marcar recibo como enviado
router.post(
  '/mark-receipt-sent/:receiptId',
  authenticateToken,
  CashRegisterController.markReceiptSent
);

module.exports = router;
