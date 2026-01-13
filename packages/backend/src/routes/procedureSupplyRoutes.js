const express = require('express');
const router = express.Router();
const ProcedureSupplyController = require('../controllers/ProcedureSupplyController');
const { authenticateToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

/**
 * Rutas de consumo de productos en procedimientos
 * Todas requieren autenticación
 * Roles permitidos: BUSINESS, BUSINESS_SPECIALIST, RECEPTIONIST, SPECIALIST
 */

// Crear registro de consumo
router.post(
  '/',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  ProcedureSupplyController.createSupply
);

// Obtener estadísticas (debe ir antes de /:id)
router.get(
  '/stats',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST']),
  ProcedureSupplyController.getSupplyStats
);

// Obtener consumos por turno (debe ir antes de /:id)
router.get(
  '/appointment/:appointmentId',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  ProcedureSupplyController.getSuppliesByAppointment
);

// Listar consumos con filtros
router.get(
  '/',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  ProcedureSupplyController.getSupplies
);

// Obtener detalle de un consumo
router.get(
  '/:id',
  authenticateToken,
  roleCheck(['BUSINESS', 'BUSINESS_SPECIALIST', 'RECEPTIONIST', 'SPECIALIST']),
  ProcedureSupplyController.getSupplyById
);

module.exports = router;
