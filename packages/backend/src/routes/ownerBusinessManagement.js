/**
 * Rutas para gestión de negocios por parte del Owner
 */

const express = require('express');
const router = express.Router();
const OwnerBusinessManagementController = require('../controllers/OwnerBusinessManagementController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo owners autenticados
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @route POST /api/owner/business/invite
 * @desc Crear negocio e invitación de pago
 * @access Owner only
 */
router.post('/invite', OwnerBusinessManagementController.createBusinessInvitation);

/**
 * @route GET /api/owner/business/invitations
 * @desc Listar invitaciones enviadas por el owner
 * @access Owner only
 */
router.get('/invitations', OwnerBusinessManagementController.getMyInvitations);

/**
 * @route POST /api/owner/business/invitations/:invitationId/resend
 * @desc Reenviar invitación
 * @access Owner only
 */
router.post('/invitations/:invitationId/resend', OwnerBusinessManagementController.resendInvitation);

/**
 * @route DELETE /api/owner/business/invitations/:invitationId
 * @desc Cancelar invitación
 * @access Owner only
 */
router.delete('/invitations/:invitationId', OwnerBusinessManagementController.cancelInvitation);

/**
 * @route GET /api/owner/business/invitations/stats
 * @desc Obtener estadísticas de invitaciones
 * @access Owner only
 */
router.get('/invitations/stats', OwnerBusinessManagementController.getInvitationStats);

/**
 * @route GET /api/owner/business/plans
 * @desc Obtener planes disponibles para invitaciones
 * @access Owner only
 */
router.get('/plans', OwnerBusinessManagementController.getAvailablePlans);

module.exports = router;