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

// Obtener detalle de un turno específico con totales
router.get(
  '/shift/:shiftId',
  authenticateToken,
  CashRegisterController.getShiftDetail
);

// Obtener movimientos del turno (recibos y gastos)
router.get(
  '/shift/:shiftId/movements',
  authenticateToken,
  CashRegisterController.getShiftMovements
);

// ==================== LEGACY - Mantener por compatibilidad ====================

// Obtener movimientos financieros (DEPRECATED - usar /shift/:shiftId/movements)
router.get(
  '/movements',
  authenticateToken,
  async (req, res) => {
    try {
      const { businessId, shiftId, page = 1, limit = 20, type, search } = req.query;
      
      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      const FinancialMovement = require('../models/FinancialMovement');
      const { Op } = require('sequelize');

      const offset = (page - 1) * limit;
      const where = { businessId };

      // Filtrar por tipo si se especifica
      if (type && type !== 'all') {
        where.type = type;
      }

      // Búsqueda por descripción o referencia
      if (search) {
        where[Op.or] = [
          { description: { [Op.iLike]: `%${search}%` } },
          { reference: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Si hay shiftId, filtrar por fecha del turno
      if (shiftId) {
        const CashRegisterShift = require('../models/CashRegisterShift');
        const shift = await CashRegisterShift.findByPk(shiftId);
        
        if (shift) {
          where.createdAt = {
            [Op.gte]: shift.openedAt
          };
          
          if (shift.closedAt) {
            where.createdAt[Op.lte] = shift.closedAt;
          }
        }
      }

      const { count, rows: movements } = await FinancialMovement.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return res.json({
        success: true,
        movements,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      });

    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener movimientos'
      });
    }
  }
);

module.exports = router;
