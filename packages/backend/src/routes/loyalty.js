const express = require('express');
const router = express.Router();
const LoyaltyController = require('../controllers/LoyaltyController');
const { authenticateToken } = require('../middleware/auth');
const { businessAndOwner, allStaffRoles } = require('../middleware/roleCheck');

/**
 * Rutas de Fidelización y Puntos
 * Base: /api/loyalty
 * 
 * IMPORTANTE: Los clientes NO tienen acceso a la web/app.
 * Estas rutas son para el personal del negocio (staff) cuando consultan
 * información de sus clientes o realizan operaciones en nombre de ellos.
 * Los "clientes" son personas físicas que solo reciben tarjetas físicas.
 */

// =====================================================
// RUTAS PÚBLICAS (sin autenticación)
// =====================================================

/**
 * @route GET /api/loyalty/public/check/:referralCode
 * @desc Consultar puntos de un cliente por su código de referido (QR)
 * @access Public (sin autenticación - para escaneo de QR)
 */
router.get('/public/check/:referralCode', LoyaltyController.checkPointsByReferralCode);

// =====================================================
// RUTAS PARA CLIENTES (COMENTADAS)
// Los clientes NO tienen acceso web/app. Estas rutas están
// comentadas pero podrían habilitarse en el futuro si se
// desarrolla una app móvil para clientes.
// =====================================================

// /**
//  * @route GET /api/loyalty/balance
//  * @desc Obtener balance de puntos del cliente autenticado
//  * @access Private (CLIENT)
//  */
// router.get('/balance', authenticateToken, LoyaltyController.getBalance);

// /**
//  * @route GET /api/loyalty/transactions
//  * @desc Obtener historial de transacciones de puntos
//  * @access Private
//  * @query { limit?: number, offset?: number, type?: string }
//  */
// router.get('/transactions', authenticateToken, LoyaltyController.getTransactions);

// /**
//  * @route GET /api/loyalty/referral-code
//  * @desc Obtener código de referido del cliente
//  * @access Private
//  */
// router.get('/referral-code', authenticateToken, LoyaltyController.getReferralCode);

// /**
//  * @route GET /api/loyalty/my-referrals
//  * @desc Obtener lista de clientes referidos por el cliente autenticado
//  * @access Private
//  */
// router.get('/my-referrals', authenticateToken, LoyaltyController.getMyReferrals);

// /**
//  * @route POST /api/loyalty/redeem
//  * @desc Canjear puntos por recompensa
//  * @access Private
//  * @body { pointsToRedeem: number, rewardType: string, value: number, description?: string, conditions?: object }
//  */
// router.post('/redeem', authenticateToken, LoyaltyController.redeemPoints);

// /**
//  * @route GET /api/loyalty/rewards
//  * @desc Obtener recompensas del cliente
//  * @access Private
//  * @query { status?: string, includeExpired?: boolean }
//  */
// router.get('/rewards', authenticateToken, LoyaltyController.getRewards);

// /**
//  * @route POST /api/loyalty/apply-reward
//  * @desc Aplicar una recompensa a una compra
//  * @access Private
//  * @body { rewardCode: string, referenceType: string, referenceId: uuid }
//  */
// router.post('/apply-reward', authenticateToken, LoyaltyController.applyReward);

// /**
//  * @route GET /api/loyalty/card/pdf
//  * @desc Generar tarjeta de fidelización en PDF del cliente autenticado
//  * @access Private
//  */
// router.get('/card/pdf', authenticateToken, LoyaltyController.generateCardPDF);

// =====================================================
// RUTAS PARA BUSINESS/OWNER
// =====================================================

/**
 * @route GET /api/loyalty/business/client/:clientId/balance
 * @desc Obtener balance de puntos de un cliente específico
 * @access Private (BUSINESS, OWNER)
 */
router.get(
  '/business/client/:clientId/balance',
  authenticateToken,
  allStaffRoles,
  LoyaltyController.getClientBalance
);

/**
 * @route GET /api/loyalty/business/client/:clientId/transactions
 * @desc Obtener transacciones de un cliente específico
 * @access Private (BUSINESS, OWNER)
 * @query { limit?: number, offset?: number, type?: string }
 */
router.get(
  '/business/client/:clientId/transactions',
  authenticateToken,
  allStaffRoles,
  LoyaltyController.getClientTransactions
);

/**
 * @route GET /api/loyalty/business/client/:clientId/referrals
 * @desc Obtener referidos de un cliente
 * @access Private (BUSINESS, OWNER)
 */
router.get(
  '/business/client/:clientId/referrals',
  authenticateToken,
  allStaffRoles,
  LoyaltyController.getClientReferrals
);

/**
 * @route POST /api/loyalty/business/credit-points
 * @desc Acreditar puntos manualmente a un cliente
 * @access Private (BUSINESS, OWNER)
 * @body { clientId: uuid, points: number, description?: string, branchId?: uuid }
 */
router.post(
  '/business/credit-points',
  authenticateToken,
  businessAndOwner,
  LoyaltyController.creditPointsManually
);

/**
 * @route GET /api/loyalty/business/find-by-referral-code/:code
 * @desc Buscar cliente por código de referido
 * @access Private (BUSINESS, OWNER)
 */
router.get(
  '/business/find-by-referral-code/:code',
  authenticateToken,
  allStaffRoles,
  LoyaltyController.findClientByReferralCode
);

/**
 * @route GET /api/loyalty/business/client/:clientId/card/pdf
 * @desc Generar tarjeta de fidelización en PDF para un cliente específico
 * @access Private (BUSINESS, OWNER)
 */
router.get(
  '/business/client/:clientId/card/pdf',
  authenticateToken,
  allStaffRoles,
  LoyaltyController.generateClientCardPDF
);

/**
 * @route POST /api/loyalty/business/cards/bulk-pdf
 * @desc Generar múltiples tarjetas en un solo PDF (para imprimir varias a la vez)
 * @access Private (BUSINESS, OWNER)
 * @body { clients: [{ clientId: uuid, points: number }] }
 */
router.post(
  '/business/cards/bulk-pdf',
  authenticateToken,
  businessAndOwner,
  LoyaltyController.generateBulkCardsPDF
);

/**
 * @route POST /api/loyalty/cleanup
 * @desc Limpiar puntos y recompensas expirados (CRON job)
 * @access Private (OWNER, ADMIN)
 */
router.post(
  '/cleanup',
  authenticateToken,
  businessAndOwner,
  LoyaltyController.cleanup
);

module.exports = router;
