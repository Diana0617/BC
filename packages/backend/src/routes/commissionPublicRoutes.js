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

module.exports = router;
