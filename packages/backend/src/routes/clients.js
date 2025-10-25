const express = require('express');
const router = express.Router({ mergeParams: true });
const ClientController = require('../controllers/ClientController');
const VoucherController = require('../controllers/VoucherController');
const { authenticateToken } = require('../middleware/auth');
const { businessAndOwner, allStaffRoles } = require('../middleware/roleCheck');

/**
 * Rutas de Clientes
 * Requieren autenticación y rol BUSINESS o OWNER
 * Base: /api/business/:businessId/clients
 */

// Buscar clientes (debe ir ANTES de '/:clientId')
router.get(
  '/search',
  authenticateToken,
  allStaffRoles, // Permite a todos los roles de staff (OWNER, BUSINESS, SPECIALIST, RECEPTIONIST)
  (req, res) => ClientController.searchClients(req, res)
);

// Listar clientes del negocio
router.get(
  '/',
  authenticateToken,
  allStaffRoles, // Permite ver clientes a todo el staff
  (req, res) => ClientController.listClients(req, res)
);

// Obtener detalles de un cliente
router.get(
  '/:clientId',
  authenticateToken,
  allStaffRoles, // Permite ver detalles a todo el staff
  (req, res) => ClientController.getClientDetails(req, res)
);

// Crear nuevo cliente
router.post(
  '/',
  authenticateToken,
  allStaffRoles, // Permite crear clientes a todo el staff
  (req, res) => ClientController.createClient(req, res)
);

// Actualizar cliente
router.put(
  '/:clientId',
  authenticateToken,
  businessAndOwner,
  (req, res) => ClientController.updateClient(req, res)
);

// Cambiar estado del cliente (bloquear/desbloquear)
router.patch(
  '/:clientId/status',
  authenticateToken,
  businessAndOwner,
  (req, res) => ClientController.toggleClientStatus(req, res)
);

// =====================================================
// RUTAS DE VOUCHERS PARA CLIENTES
// =====================================================

// Listar vouchers de un cliente específico
router.get(
  '/:clientId/vouchers',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.getCustomerVouchers(req, res)
);

// Crear voucher manual para un cliente
router.post(
  '/:clientId/vouchers',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.createManualVoucher(req, res)
);

// Cancelar un voucher específico
router.put(
  '/:clientId/vouchers/:voucherId/cancel',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.cancelVoucher(req, res)
);

// =====================================================
// RUTAS DE BLOQUEO PARA CLIENTES
// =====================================================

// Bloquear cliente manualmente
router.post(
  '/:clientId/block',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.blockCustomer(req, res)
);

// Desbloquear cliente
router.post(
  '/:clientId/unblock',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.liftBlock(req, res)
);

// Obtener estado de bloqueo del cliente
router.get(
  '/:clientId/block-status',
  authenticateToken,
  businessAndOwner,
  (req, res) => VoucherController.getCustomerBlockStatus(req, res)
);

// Obtener historial del cliente
router.get('/:id/history', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de historial del cliente aún no implementada'
  });
});

// Obtener planes de tratamiento del cliente
const TreatmentPlanController = require('../controllers/TreatmentPlanController');
router.get('/:clientId/treatment-plans', TreatmentPlanController.getByClient);

module.exports = router;