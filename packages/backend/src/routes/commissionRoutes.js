const express = require('express');
const router = express.Router({ mergeParams: true });
const commissionController = require('../controllers/commissionController');
// const { authenticate } = require('../middleware/auth'); // Descomentar cuando esté listo

/**
 * @route Commission Routes
 * @baseURL /api/business/:businessId
 */

// ================== CONFIGURACIÓN DE NEGOCIO ==================

/**
 * Obtener configuración de comisiones del negocio
 * GET /api/business/:businessId/commission-config
 */
router.get(
  '/commission-config',
  // authenticate, // Agregar cuando el middleware esté listo
  commissionController.getBusinessCommissionConfig
);

/**
 * Actualizar configuración de comisiones del negocio
 * PUT /api/business/:businessId/commission-config
 */
router.put(
  '/commission-config',
  // authenticate,
  commissionController.updateBusinessCommissionConfig
);

// ================== COMISIONES POR SERVICIO ==================

/**
 * Obtener comisión de un servicio específico
 * GET /api/business/:businessId/services/:serviceId/commission
 */
router.get(
  '/services/:serviceId/commission',
  // authenticate,
  commissionController.getServiceCommission
);

/**
 * Crear o actualizar comisión de un servicio
 * PUT /api/business/:businessId/services/:serviceId/commission
 */
router.put(
  '/services/:serviceId/commission',
  // authenticate,
  commissionController.upsertServiceCommission
);

/**
 * Eliminar comisión específica de un servicio
 * DELETE /api/business/:businessId/services/:serviceId/commission
 */
router.delete(
  '/services/:serviceId/commission',
  // authenticate,
  commissionController.deleteServiceCommission
);

/**
 * Calcular comisión para un monto específico
 * POST /api/business/:businessId/services/:serviceId/commission/calculate
 */
router.post(
  '/services/:serviceId/commission/calculate',
  // authenticate,
  commissionController.calculateCommission
);

module.exports = router;
