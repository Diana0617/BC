/**
 * Servicio para gestión de invitaciones de negocios
 * Maneja el flujo completo desde la creación hasta la activación
 */

const crypto = require('crypto');
const { Business, BusinessInvitation, SubscriptionPlan, BusinessSubscription } = require('../models');
const EmailService = require('./EmailService');

class BusinessInvitationService {

  /**
   * Crear negocio e invitación de pago
   */
  static async createBusinessInvitation(data) {
    const { 
      businessName, 
      email, 
      phone, 
      address, 
      ownerName, 
      planId, 
      invitedBy,
      expirationDays = 7 
    } = data;

    try {
      // Verificar que el plan existe
      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan) {
        throw new Error('Plan de suscripción no encontrado');
      }

      // Verificar si ya existe un negocio con ese email
      const existingBusiness = await Business.findOne({ where: { email } });
      if (existingBusiness) {
        throw new Error('Ya existe un negocio registrado con este email');
      }

      // Verificar si hay una invitación pendiente
      const pendingInvitation = await BusinessInvitation.findOne({
        where: { 
          email,
          status: ['SENT', 'VIEWED', 'PAYMENT_STARTED']
        }
      });

      if (pendingInvitation) {
        throw new Error('Ya existe una invitación pendiente para este email');
      }

      // Crear el negocio en estado PENDING_PAYMENT
      const business = await Business.create({
        name: businessName,
        email,
        phone,
        address,
        ownerName,
        status: 'PENDING_PAYMENT',
        metadata: {
          created_by_owner: true,
          invited_by: invitedBy,
          pending_plan_id: planId
        }
      });

      // Generar token de invitación único
      const invitationToken = crypto.randomBytes(32).toString('hex');

      // Crear fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // Crear invitación
      const invitation = await BusinessInvitation.create({
        businessId: business.id,
        invitationToken,
        email,
        planId,
        status: 'SENT',
        expiresAt,
        sentAt: new Date(),
        invitedBy,
        metadata: {
          business_name: businessName,
          plan_name: plan.name,
          plan_price: plan.price
        }
      });

      // Enviar email de invitación
      await this.sendInvitationEmail(invitation, business, plan);

      return {
        business,
        invitation,
        plan
      };

    } catch (error) {
      console.error('Error creating business invitation:', error);
      throw error;
    }
  }

  /**
   * Enviar email de invitación
   */
  static async sendInvitationEmail(invitation, business, plan) {
    try {
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitation/${invitation.invitationToken}`;

      const emailData = {
        to: invitation.email,
        subject: `🎉 ¡Bienvenido a Beauty Control! - Activa tu cuenta`,
        template: 'business_invitation',
        data: {
          businessName: business.name,
          ownerName: business.ownerName,
          planName: plan.name,
          planPrice: plan.price,
          invitationUrl,
          expiresAt: invitation.expiresAt,
          invitedBy: invitation.invitedBy
        }
      };

      await EmailService.sendEmail(emailData);

      // Actualizar fecha de envío
      await invitation.update({ sentAt: new Date() });

      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw error;
    }
  }

  /**
   * Validar token de invitación
   */
  static async validateInvitationToken(token) {
    try {
      const invitation = await BusinessInvitation.findOne({
        where: { invitationToken: token },
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
        throw new Error('Token de invitación no válido');
      }

      if (invitation.status === 'COMPLETED') {
        throw new Error('Esta invitación ya ha sido completada');
      }

      if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
        await invitation.update({ status: 'EXPIRED' });
        throw new Error('Esta invitación ha expirado');
      }

      if (invitation.status === 'CANCELLED') {
        throw new Error('Esta invitación ha sido cancelada');
      }

      // Marcar como vista si es la primera vez
      if (invitation.status === 'SENT') {
        await invitation.update({ 
          status: 'VIEWED',
          viewedAt: new Date()
        });
      }

      return invitation;

    } catch (error) {
      console.error('Error validating invitation token:', error);
      throw error;
    }
  }

  /**
   * Completar activación después del pago
   */
  static async completeInvitation(invitationToken, paymentData) {
    try {
      const invitation = await this.validateInvitationToken(invitationToken);
      
      const { business, plan } = invitation;

      // Activar el negocio
      await business.update({
        status: 'ACTIVE',
        metadata: {
          ...business.metadata,
          activated_at: new Date(),
          payment_completed: true,
          first_payment: paymentData
        }
      });

      // Crear suscripción inicial
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);

      const subscription = await BusinessSubscription.create({
        businessId: business.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        price: plan.price,
        metadata: {
          created_from_invitation: true,
          invitation_id: invitation.id,
          first_payment: paymentData
        }
      });

      // Marcar invitación como completada
      await invitation.update({
        status: 'COMPLETED',
        completedAt: new Date(),
        metadata: {
          ...invitation.metadata,
          payment_data: paymentData,
          subscription_id: subscription.id
        }
      });

      // Enviar emails de confirmación
      await this.sendActivationConfirmationEmails(invitation, business, subscription, plan);

      return {
        business,
        subscription,
        invitation
      };

    } catch (error) {
      console.error('Error completing invitation:', error);
      throw error;
    }
  }

  /**
   * Enviar emails de confirmación de activación
   */
  static async sendActivationConfirmationEmails(invitation, business, subscription, plan) {
    try {
      // Email al negocio
      await EmailService.sendEmail({
        to: business.email,
        subject: '✅ ¡Tu cuenta de Beauty Control está activa!',
        template: 'business_activation_confirmation',
        data: {
          businessName: business.name,
          ownerName: business.ownerName,
          planName: plan.name,
          subscriptionEndDate: subscription.endDate,
          loginUrl: `${process.env.FRONTEND_URL}/login`
        }
      });

      // Email al owner que envió la invitación
      if (invitation.invitedBy) {
        await EmailService.sendEmail({
          to: invitation.invitedBy,
          subject: `✅ Negocio "${business.name}" activado exitosamente`,
          template: 'owner_business_activated',
          data: {
            businessName: business.name,
            ownerName: business.ownerName,
            planName: plan.name,
            activatedAt: new Date()
          }
        });
      }

    } catch (error) {
      console.error('Error sending activation confirmation emails:', error);
      // No fallar si el email falla, solo loggear
    }
  }

  /**
   * Listar invitaciones del owner
   */
  static async getOwnerInvitations(ownerEmail, filters = {}) {
    try {
      const where = { invitedBy: ownerEmail };
      
      if (filters.status) {
        where.status = filters.status;
      }

      const invitations = await BusinessInvitation.findAll({
        where,
        include: [
          {
            model: Business,
            as: 'business'
          },
          {
            model: SubscriptionPlan,
            as: 'plan'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return invitations;

    } catch (error) {
      console.error('Error getting owner invitations:', error);
      throw error;
    }
  }

  /**
   * Cancelar invitación
   */
  static async cancelInvitation(invitationId, ownerEmail) {
    try {
      const invitation = await BusinessInvitation.findOne({
        where: { 
          id: invitationId,
          invitedBy: ownerEmail 
        }
      });

      if (!invitation) {
        throw new Error('Invitación no encontrada');
      }

      if (invitation.status === 'COMPLETED') {
        throw new Error('No se puede cancelar una invitación completada');
      }

      await invitation.update({ status: 'CANCELLED' });

      return invitation;

    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  }

  /**
   * Reenviar invitación
   */
  static async resendInvitation(invitationId, ownerEmail) {
    try {
      const invitation = await BusinessInvitation.findOne({
        where: { 
          id: invitationId,
          invitedBy: ownerEmail 
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
        throw new Error('Invitación no encontrada');
      }

      if (invitation.status === 'COMPLETED') {
        throw new Error('No se puede reenviar una invitación completada');
      }

      // Extender fecha de expiración
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await invitation.update({
        status: 'SENT',
        expiresAt: newExpiresAt,
        sentAt: new Date()
      });

      // Reenviar email
      await this.sendInvitationEmail(invitation, invitation.business, invitation.plan);

      return invitation;

    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }
}

module.exports = BusinessInvitationService;