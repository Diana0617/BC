/**
 * Controlador para gestión manual de negocios por parte del Owner
 */

const BusinessInvitationService = require('../services/BusinessInvitationService');
const { BusinessInvitation, SubscriptionPlan } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBusinessInvitationRequest:
 *       type: object
 *       required:
 *         - businessName
 *         - email
 *         - ownerName
 *         - planId
 *       properties:
 *         businessName:
 *           type: string
 *           description: Nombre del negocio
 *           example: "Salón de Belleza María"
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contacto del negocio
 *           example: "maria@salon.com"
 *         phone:
 *           type: string
 *           description: Teléfono de contacto
 *           example: "3001234567"
 *         address:
 *           type: string
 *           description: Dirección física
 *           example: "Calle 123 #45-67, Bogotá"
 *         ownerName:
 *           type: string
 *           description: Nombre del propietario
 *           example: "María García"
 *         planId:
 *           type: string
 *           format: uuid
 *           description: ID del plan de suscripción
 *         expirationDays:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *           description: Días hasta que expire la invitación
 */

class OwnerBusinessManagementController {

  /**
   * @swagger
   * /api/owner/business/invite:
   *   post:
   *     summary: 📧 Crear invitación de negocio
   *     description: Crea un nuevo negocio y envía invitación de pago por email
   *     tags: [🏢 Owner - Negocios]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateBusinessInvitationRequest'
   *     responses:
   *       201:
   *         description: Invitación creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     invitationId:
   *                       type: string
   *                       format: uuid
   *                     businessId:
   *                       type: string
   *                       format: uuid
   *                     token:
   *                       type: string
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *                   example: "Invitación creada y enviada exitosamente"
   *       400:
   *         description: Datos inválidos o faltantes
   *       401:
   *         description: No autorizado
   *       403:
   *         description: No es Owner
   *       409:
   *         description: Email ya registrado
   *       500:
   *         description: Error interno del servidor
   */
  static async createBusinessInvitation(req, res) {
    try {
      const {
        businessName,
        email,
        phone,
        address,
        ownerName,
        planId,
        expirationDays
      } = req.body;

      // Validaciones básicas
      if (!businessName || !email || !ownerName || !planId) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: businessName, email, ownerName, planId'
        });
      }

      // El email del owner que crea la invitación viene del token JWT
      const invitedBy = req.user.email;

      const result = await BusinessInvitationService.createBusinessInvitation({
        businessName,
        email,
        phone,
        address,
        ownerName,
        planId,
        invitedBy,
        expirationDays
      });

      res.json({
        success: true,
        message: 'Invitación de negocio creada y enviada exitosamente',
        data: {
          business: {
            id: result.business.id,
            name: result.business.name,
            email: result.business.email,
            status: result.business.status
          },
          invitation: {
            id: result.invitation.id,
            token: result.invitation.invitationToken,
            status: result.invitation.status,
            expiresAt: result.invitation.expiresAt
          },
          plan: {
            id: result.plan.id,
            name: result.plan.name,
            price: result.plan.price
          }
        }
      });

    } catch (error) {
      console.error('❌ Error creating business invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error creando invitación de negocio'
      });
    }
  }

  /**
   * Listar invitaciones enviadas por el owner
   */
  static async getMyInvitations(req, res) {
    try {
      const ownerEmail = req.user.email;
      const { status } = req.query;

      const invitations = await BusinessInvitationService.getOwnerInvitations(
        ownerEmail,
        { status }
      );

      const formattedInvitations = invitations.map(inv => ({
        id: inv.id,
        businessName: inv.business.name,
        email: inv.email,
        status: inv.status,
        planName: inv.plan.name,
        planPrice: inv.plan.price,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        sentAt: inv.sentAt,
        viewedAt: inv.viewedAt,
        completedAt: inv.completedAt
      }));

      res.json({
        success: true,
        message: 'Invitaciones obtenidas exitosamente',
        data: {
          total: formattedInvitations.length,
          invitations: formattedInvitations
        }
      });

    } catch (error) {
      console.error('❌ Error getting owner invitations:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo invitaciones'
      });
    }
  }

  /**
   * Reenviar invitación
   */
  static async resendInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const ownerEmail = req.user.email;

      const invitation = await BusinessInvitationService.resendInvitation(
        invitationId,
        ownerEmail
      );

      res.json({
        success: true,
        message: 'Invitación reenviada exitosamente',
        data: {
          id: invitation.id,
          status: invitation.status,
          newExpiresAt: invitation.expiresAt,
          sentAt: invitation.sentAt
        }
      });

    } catch (error) {
      console.error('❌ Error resending invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error reenviando invitación'
      });
    }
  }

  /**
   * Cancelar invitación
   */
  static async cancelInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const ownerEmail = req.user.email;

      const invitation = await BusinessInvitationService.cancelInvitation(
        invitationId,
        ownerEmail
      );

      res.json({
        success: true,
        message: 'Invitación cancelada exitosamente',
        data: {
          id: invitation.id,
          status: invitation.status
        }
      });

    } catch (error) {
      console.error('❌ Error cancelling invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error cancelando invitación'
      });
    }
  }

  /**
   * Obtener estadísticas de invitaciones
   */
  static async getInvitationStats(req, res) {
    try {
      const ownerEmail = req.user.email;

      const allInvitations = await BusinessInvitationService.getOwnerInvitations(ownerEmail);

      const stats = {
        total: allInvitations.length,
        sent: allInvitations.filter(inv => inv.status === 'SENT').length,
        viewed: allInvitations.filter(inv => inv.status === 'VIEWED').length,
        paymentStarted: allInvitations.filter(inv => inv.status === 'PAYMENT_STARTED').length,
        completed: allInvitations.filter(inv => inv.status === 'COMPLETED').length,
        expired: allInvitations.filter(inv => inv.status === 'EXPIRED').length,
        cancelled: allInvitations.filter(inv => inv.status === 'CANCELLED').length
      };

      // Estadísticas adicionales
      const completedInvitations = allInvitations.filter(inv => inv.status === 'COMPLETED');
      const totalRevenue = completedInvitations.reduce((sum, inv) => sum + (inv.plan.price || 0), 0);

      res.json({
        success: true,
        message: 'Estadísticas de invitaciones obtenidas',
        data: {
          stats,
          metrics: {
            conversionRate: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(2) : 0,
            totalRevenue,
            averageRevenuePerCompletion: stats.completed > 0 ? (totalRevenue / stats.completed).toFixed(2) : 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting invitation stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }

  /**
   * Obtener planes disponibles para invitaciones
   */
  static async getAvailablePlans(req, res) {
    try {
      const plans = await SubscriptionPlan.findAll({
        where: { isActive: true },
        order: [['price', 'ASC']]
      });

      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration: plan.duration,
        features: plan.features
      }));

      res.json({
        success: true,
        message: 'Planes disponibles obtenidos',
        data: formattedPlans
      });

    } catch (error) {
      console.error('❌ Error getting available plans:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo planes disponibles'
      });
    }
  }
}

module.exports = OwnerBusinessManagementController;