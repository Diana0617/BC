const express = require('express');
const router = express.Router({ mergeParams: true });
const ClientController = require('../controllers/ClientController');
const VoucherController = require('../controllers/VoucherController');
const { authenticateToken } = require('../middleware/auth');
const { businessAndOwner } = require('../middleware/roleCheck');

/**
 * Rutas de Clientes
 * Requieren autenticación y rol BUSINESS o OWNER
 * Base: /api/business/:businessId/clients
 */

// Listar clientes del negocio
router.get(
  '/',
  authenticateToken,
  businessAndOwner,
  (req, res) => ClientController.listClients(req, res)
);

// Obtener detalles de un cliente
router.get(
  '/:clientId',
  authenticateToken,
  businessAndOwner,
  (req, res) => ClientController.getClientDetails(req, res)
);

// Crear nuevo cliente
router.post(
  '/',
  authenticateToken,
  businessAndOwner,
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

module.exports = router;

// Obtener historial del cliente
router.get('/:id/history', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de historial del cliente aún no implementada'
  });
});

module.exports = router;