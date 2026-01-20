const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route Public Commission Routes
 * @baseURL /api/commissions
 * @description Rutas públicas de comisiones para especialistas
 */

/**
 * Obtener resumen de comisiones del especialista
 * GET /api/commissions/summary?specialistId=xxx&businessId=xxx
 */
router.get(
  '/summary',
  authenticateToken,
  commissionController.getSpecialistCommissionSummary
);

/**
 * Obtener historial de comisiones paginado
 * GET /api/commissions/history?specialistId=xxx&businessId=xxx&page=1&limit=20
 */
router.get(
  '/history',
  authenticateToken,
  commissionController.getCommissionHistory
);

/**
 * Exportar historial de comisiones
 * GET /api/commissions/export?specialistId=xxx&format=excel
 */
router.get(
  '/export',
  authenticateToken,
  commissionController.exportCommissionHistory
);

/**
 * Crear solicitud de pago de comisiones
 * POST /api/commissions/request
 */
router.post(
  '/request',
  authenticateToken,
  commissionController.createCommissionRequest
);

module.exports = router;
