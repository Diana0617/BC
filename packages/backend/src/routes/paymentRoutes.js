const express = require('express');
const router = express.Router();
const PaymentConfigController = require('../controllers/PaymentConfigController');
const AppointmentPaymentControllerV2 = require('../controllers/AppointmentPaymentControllerV2');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { restrictFreePlan } = require('../middleware/planRestrictions');

/**
 * Rutas para configuración de métodos de pago del negocio
 * Todas las rutas requieren autenticación
 */

// ==================== CONFIGURACIÓN DE MÉTODOS DE PAGO ====================

/**
 * Obtener métodos de pago activos del negocio
 * GET /api/business/:businessId/payment-methods
 * Acceso: Todos los usuarios autenticados del negocio
 */
router.get(
  '/business/:businessId/payment-methods',
  authenticateToken,
  PaymentConfigController.getPaymentMethods
);

/**
 * Obtener todos los métodos de pago (incluidos inactivos)
 * GET /api/business/:businessId/payment-methods/all
 * Acceso: BUSINESS, OWNER
 */
router.get(
  '/business/:businessId/payment-methods/all',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.getPaymentMethods
);

/**
 * Crear nuevo método de pago
 * POST /api/business/:businessId/payment-methods
 * Body: { name, type, requiresProof?, icon?, bankInfo?, metadata? }
 * Acceso: BUSINESS, OWNER
 */
router.post(
  '/business/:businessId/payment-methods',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  restrictFreePlan('PAYMENT_METHODS'),
  PaymentConfigController.createPaymentMethod
);

/**
 * Actualizar método de pago
 * PUT /api/business/:businessId/payment-methods/:methodId
 * Body: { name?, type?, requiresProof?, icon?, bankInfo?, isActive?, metadata? }
 * Acceso: BUSINESS, OWNER
 */
router.put(
  '/business/:businessId/payment-methods/:methodId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.updatePaymentMethod
);

/**
 * Eliminar (desactivar) método de pago
 * DELETE /api/business/:businessId/payment-methods/:methodId
 * Query params: hardDelete (true para eliminar permanentemente)
 * Acceso: BUSINESS, OWNER
 */
router.delete(
  '/business/:businessId/payment-methods/:methodId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.deletePaymentMethod
);

/**
 * Activar/desactivar método de pago (toggle)
 * PATCH /api/business/:businessId/payment-methods/:methodId/toggle
 * Acceso: BUSINESS, OWNER
 */
router.patch(
  '/business/:businessId/payment-methods/:methodId/toggle',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.togglePaymentMethod
);

/**
 * Reordenar métodos de pago
 * PATCH /api/business/:businessId/payment-methods/reorder
 * Body: { methodIds: string[] }
 * Acceso: BUSINESS, OWNER
 */
router.patch(
  '/business/:businessId/payment-methods/reorder',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.reorderPaymentMethods
);

// ==================== PAGOS DE CITAS ====================

/**
 * Registrar pago de cita
 * POST /api/appointments/:appointmentId/payments
 * Body: { amount, paymentMethodId, reference?, notes?, proofUrl? }
 * Acceso: BUSINESS, SPECIALIST, RECEPTIONIST
 */
router.post(
  '/appointments/:appointmentId/payments',
  authenticateToken,
  authorizeRole(['BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST']),
  AppointmentPaymentControllerV2.registerPayment
);

/**
 * Obtener pagos de una cita
 * GET /api/appointments/:appointmentId/payments
 * Acceso: Todos los usuarios autenticados del negocio
 */
router.get(
  '/appointments/:appointmentId/payments',
  authenticateToken,
  AppointmentPaymentControllerV2.getAppointmentPayments
);

/**
 * Subir comprobante de pago
 * POST /api/appointments/:appointmentId/payments/:paymentId/proof
 * Body: FormData with 'proof' file
 * Acceso: BUSINESS, SPECIALIST, RECEPTIONIST
 */
const proofUpload = AppointmentPaymentControllerV2.getPaymentProofMulter();
router.post(
  '/appointments/:appointmentId/payments/:paymentId/proof',
  authenticateToken,
  authorizeRole(['BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST']),
  proofUpload.single('proof'),
  AppointmentPaymentControllerV2.uploadPaymentProof
);

/**
 * Anular/reembolsar pago
 * POST /api/appointments/:appointmentId/payments/:paymentId/refund
 * Body: { reason? }
 * Acceso: BUSINESS, OWNER
 */
router.post(
  '/appointments/:appointmentId/payments/:paymentId/refund',
  authenticateToken,
  authorizeRole(['BUSINESS', 'OWNER']),
  AppointmentPaymentControllerV2.refundPayment
);

module.exports = router;
