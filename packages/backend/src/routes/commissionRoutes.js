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

// ================== GESTIÓN DE PAGOS DE COMISIONES ==================

/**
 * Obtener resumen de comisiones por especialista
 * GET /api/business/:businessId/commissions/specialists-summary
 */
router.get(
  '/commissions/specialists-summary',
  // authenticate,
  commissionController.getSpecialistsSummary
);

/**
 * Obtener detalle de comisiones de un especialista
 * GET /api/business/:businessId/commissions/specialist/:specialistId/details
 */
router.get(
  '/commissions/specialist/:specialistId/details',
  // authenticate,
  commissionController.getSpecialistDetails
);

/**
 * Registrar pago de comisión a un especialista
 * POST /api/business/:businessId/commissions/pay
 */
const { uploadImageMiddleware } = require('../config/cloudinary');

router.post(
  '/commissions/pay',
  uploadImageMiddleware.single('paymentProof'),
  // authenticate,
  commissionController.payCommission
);

/**
 * Obtener solicitudes de pago de comisiones
 * GET /api/business/:businessId/commissions/payment-requests
 */
router.get(
  '/commissions/payment-requests',
  // authenticate,
  commissionController.getPaymentRequests
);

/**
 * Actualizar estado de solicitud de pago (aprobar/rechazar)
 * PATCH /api/business/:businessId/commissions/payment-requests/:requestId
 */
router.patch(
  '/commissions/payment-requests/:requestId',
  // authenticate,
  commissionController.updatePaymentRequestStatus
);

module.exports = router;
