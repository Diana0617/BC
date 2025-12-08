const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { authenticateToken } = require('../middleware/auth');
const { businessAndOwner, businessOnly } = require('../middleware/roleCheck');

/**
 * Rutas de Vouchers
 * 
 * Gestión completa de vouchers, cancelaciones y bloqueos
 */

// =====================================================
// RUTAS PARA CLIENTES
// =====================================================

/**
 * @route GET /api/vouchers/my-vouchers
 * @desc Obtener vouchers activos del cliente autenticado
 * @access Private (CLIENT, SPECIALIST, BUSINESS)
 */
router.get('/my-vouchers', authenticateToken, VoucherController.getMyVouchers);

/**
 * @route GET /api/vouchers/validate/:code
 * @desc Validar un código de voucher
 * @access Private
 */
router.get('/validate/:code', authenticateToken, VoucherController.validateVoucher);

/**
 * @route POST /api/vouchers/apply
 * @desc Aplicar voucher a una cita
 * @access Private
 * @body { voucherCode: string, bookingId: uuid }
 */
router.post('/apply', authenticateToken, VoucherController.applyVoucher);

/**
 * @route GET /api/vouchers/check-block-status
 * @desc Verificar si el cliente está bloqueado
 * @access Private
 */
router.get('/check-block-status', authenticateToken, VoucherController.checkBlockStatus);

/**
 * @route GET /api/vouchers/cancellation-history
 * @desc Obtener historial de cancelaciones del cliente
 * @access Private
 * @query { days?: number }
 */
router.get('/cancellation-history', authenticateToken, VoucherController.getCancellationHistory);

// =====================================================
// RUTAS PARA BUSINESS/OWNER
// =====================================================

/**
 * @route GET /api/vouchers/business/list
 * @desc Listar todos los vouchers del negocio
 * @access Private (BUSINESS, OWNER)
 * @query { status?: string, customerId?: uuid, page?: number, limit?: number }
 */
router.get('/business/list', authenticateToken, businessAndOwner, VoucherController.listBusinessVouchers);

/**
 * @route POST /api/vouchers/business/cancel/:voucherId
 * @desc Cancelar un voucher manualmente
 * @access Private (BUSINESS, OWNER)
 * @body { reason?: string }
 */
router.post('/business/cancel/:voucherId', authenticateToken, businessAndOwner, VoucherController.cancelVoucher);

/**
 * @route POST /api/vouchers/business/create-manual
 * @desc Crear voucher manualmente
 * @access Private (BUSINESS, OWNER)
 * @body { customerId: uuid, amount: number, validityDays?: number, reason?: string }
 */
router.post('/business/create-manual', authenticateToken, businessAndOwner, VoucherController.createManualVoucher);

/**
 * @route GET /api/vouchers/business/blocks
 * @desc Listar clientes bloqueados
 * @access Private (BUSINESS, OWNER)
 * @query { status?: string }
 */
router.get('/business/blocks', authenticateToken, businessAndOwner, VoucherController.listBlockedCustomers);

/**
 * @route POST /api/vouchers/business/lift-block/:blockId
 * @desc Levantar bloqueo de cliente
 * @access Private (BUSINESS, OWNER)
 * @body { notes?: string }
 */
router.post('/business/lift-block/:blockId', authenticateToken, businessAndOwner, VoucherController.liftBlock);

/**
 * @route GET /api/vouchers/business/customer-stats/:customerId
 * @desc Obtener estadísticas de cancelaciones de un cliente
 * @access Private (BUSINESS, OWNER)
 * @query { days?: number }
 */
router.get('/business/customer-stats/:customerId', authenticateToken, businessAndOwner, VoucherController.getCustomerStats);

// =====================================================
// RUTAS ADMINISTRATIVAS/CRON
// =====================================================

/**
 * @route POST /api/vouchers/cleanup
 * @desc Limpiar vouchers y bloqueos expirados (para CRON jobs)
 * @access Private (OWNER, ADMIN)
 */
router.post('/cleanup', authenticateToken, VoucherController.cleanup);

module.exports = router;
