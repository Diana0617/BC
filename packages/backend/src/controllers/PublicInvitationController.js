/**
 * Controlador público para procesamiento de invitaciones y pagos
 * No requiere autenticación - Para uso de negocios invitados
 */

const BusinessInvitationService = require('../services/BusinessInvitationService');
const WompiPaymentService = require('../services/WompiPaymentService');

class PublicInvitationController {

  /**
   * @swagger
   * /api/public/invitation/{token}:
   *   get:
   *     summary: ✅ Validar token de invitación
   *     description: Valida un token de invitación y retorna información del negocio y plan
   *     tags: [📧 Invitaciones Públicas]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Token único de la invitación
   *         example: "abc123-def456-ghi789"
   *     responses:
   *       200:
   *         description: Token válido - Información de la invitación
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Token de invitación válido"
   *                 data:
   *                   type: object
   *                   properties:
   *                     business:
   *                       type: object
   *                       properties:
   *                         name:
   *                           type: string
   *                           example: "Salón de Belleza María"
   *                         ownerName:
   *                           type: string
   *                           example: "María García"
   *                         email:
   *                           type: string
   *                           example: "maria@salon.com"
   *                     plan:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           format: uuid
   *                         name:
   *                           type: string
   *                           example: "Plan Básico"
   *                         price:
   *                           type: number
   *                           example: 50000
   *                         duration:
   *                           type: integer
   *                           example: 30
   *                     invitation:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           example: "SENT"
   *                         expiresAt:
   *                           type: string
   *                           format: date-time
   *       400:
   *         description: Token inválido o malformado
   *       404:
   *         description: Invitación no encontrada
   *       410:
   *         description: Invitación expirada
   *       500:
   *         description: Error interno del servidor
   */
  static async validateInvitation(req, res) {
    try {
      const { token } = req.params;

      const invitation = await BusinessInvitationService.validateInvitationToken(token);

      res.json({
        success: true,
        message: 'Token de invitación válido',
        data: {
          business: {
            name: invitation.business.name,
            ownerName: invitation.business.ownerName,
            email: invitation.business.email
          },
          plan: {
            id: invitation.plan.id,
            name: invitation.plan.name,
            description: invitation.plan.description,
            price: invitation.plan.price,
            duration: invitation.plan.duration,
            features: invitation.plan.features
          },
          invitation: {
            id: invitation.id,
            status: invitation.status,
            expiresAt: invitation.expiresAt
          }
        }
      });

    } catch (error) {
      console.error('❌ Error validating invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Token de invitación no válido'
      });
    }
  }

  /**
   * Procesar pago de invitación
   */
  static async processInvitationPayment(req, res) {
    try {
      const { token } = req.params;
      const { 
        cardNumber, 
        cardHolderName, 
        expiryMonth, 
        expiryYear, 
        cvc,
        acceptTerms 
      } = req.body;

      // Validaciones básicas
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvc) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos de la tarjeta'
        });
      }

      if (!acceptTerms) {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar los términos y condiciones'
        });
      }

      // Validar invitación
      const invitation = await BusinessInvitationService.validateInvitationToken(token);

      // Marcar invitación como pago iniciado
      await invitation.update({ status: 'PAYMENT_STARTED' });

      // Procesar pago con Wompi
      const paymentData = {
        amount: invitation.plan.price,
        currency: 'COP',
        reference: `invitation-${invitation.id}`,
        description: `Activación ${invitation.plan.name} - ${invitation.business.name}`,
        customer: {
          email: invitation.business.email,
          fullName: invitation.business.ownerName,
          phoneNumber: invitation.business.phone
        },
        card: {
          number: cardNumber,
          holderName: cardHolderName,
          expiryMonth: expiryMonth.toString().padStart(2, '0'),
          expiryYear: expiryYear.toString(),
          cvc
        }
      };

      const paymentResult = await WompiPaymentService.processPayment(paymentData);

      if (paymentResult.success) {
        // Completar activación
        const result = await BusinessInvitationService.completeInvitation(
          token,
          paymentResult.data
        );

        res.json({
          success: true,
          message: '¡Pago procesado exitosamente! Tu cuenta ha sido activada',
          data: {
            business: {
              id: result.business.id,
              name: result.business.name,
              status: result.business.status
            },
            subscription: {
              id: result.subscription.id,
              status: result.subscription.status,
              startDate: result.subscription.startDate,
              endDate: result.subscription.endDate
            },
            payment: {
              transactionId: paymentResult.data.id,
              amount: paymentResult.data.amount,
              status: paymentResult.data.status
            }
          }
        });

      } else {
        // Revertir estado de invitación en caso de fallo
        await invitation.update({ status: 'VIEWED' });

        res.status(400).json({
          success: false,
          message: 'Error procesando el pago',
          error: paymentResult.error
        });
      }

    } catch (error) {
      console.error('❌ Error processing invitation payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error procesando el pago'
      });
    }
  }

  /**
   * Webhook de confirmación de pago desde Wompi
   */
  static async paymentWebhook(req, res) {
    try {
      const { data, timestamp, signature } = req.body;

      // Verificar signature del webhook (implementar según docs de Wompi)
      // const isValidSignature = WompiPaymentService.verifyWebhookSignature(
      //   JSON.stringify(data), 
      //   timestamp, 
      //   signature
      // );

      // if (!isValidSignature) {
      //   return res.status(401).json({ success: false, message: 'Invalid signature' });
      // }

      if (data.transaction && data.transaction.reference.startsWith('invitation-')) {
        const invitationId = data.transaction.reference.replace('invitation-', '');
        
        // Buscar invitación por ID
        const invitation = await BusinessInvitation.findByPk(invitationId);
        
        if (invitation && data.transaction.status === 'APPROVED') {
          // Si el pago fue aprobado, completar la invitación
          await BusinessInvitationService.completeInvitation(
            invitation.invitationToken,
            data.transaction
          );
        }
      }

      res.json({ success: true });

    } catch (error) {
      console.error('❌ Error processing payment webhook:', error);
      res.status(500).json({ success: false });
    }
  }

  /**
   * Obtener estado de la invitación (polling)
   */
  static async getInvitationStatus(req, res) {
    try {
      const { token } = req.params;

      const invitation = await BusinessInvitation.findOne({
        where: { invitationToken: token },
        include: [
          {
            model: Business,
            as: 'business'
          }
        ]
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitación no encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          status: invitation.status,
          businessStatus: invitation.business?.status,
          completedAt: invitation.completedAt
        }
      });

    } catch (error) {
      console.error('❌ Error getting invitation status:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estado de invitación'
      });
    }
  }

  /**
   * Página de éxito después del pago
   */
  static async paymentSuccess(req, res) {
    try {
      const { token } = req.params;

      const invitation = await BusinessInvitation.findOne({
        where: { 
          invitationToken: token,
          status: 'COMPLETED'
        },
        include: [
          {
            model: Business,
            as: 'business'
          },
          {
            model: SubscriptionPlan,
            as: 'plan'
          }
        ]
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invitación no encontrada o no completada'
        });
      }

      res.json({
        success: true,
        message: '¡Bienvenido a Beauty Control!',
        data: {
          business: {
            name: invitation.business.name,
            email: invitation.business.email,
            status: invitation.business.status
          },
          plan: {
            name: invitation.plan.name,
            duration: invitation.plan.duration
          },
          completedAt: invitation.completedAt,
          loginUrl: `${process.env.FRONTEND_URL}/login`
        }
      });

    } catch (error) {
      console.error('❌ Error getting payment success:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de éxito'
      });
    }
  }
}

module.exports = PublicInvitationController;