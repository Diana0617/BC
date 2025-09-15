/**
 * Servicio para verificación automática de estados de suscripción
 * 
 * Este servicio maneja:
 * - Verificación diaria de vencimientos
 * - Actualización automática de estados
 * - Cálculo de días de gracia
 * - Notificaciones de vencimiento
 */

const { BusinessSubscription, SubscriptionPayment, Business, SubscriptionPlan } = require('../models');
const { Op } = require('sequelize');

class SubscriptionStatusService {
  
  /**
   * Ejecuta verificación completa de todas las suscripciones
   * Se ejecuta diariamente vía cron job
   */
  static async runDailyStatusCheck() {
    try {
      console.log('🔄 Iniciando verificación diaria de suscripciones...');
      
      const subscriptions = await BusinessSubscription.findAll({
        where: {
          status: {
            [Op.in]: ['ACTIVE', 'PENDING', 'OVERDUE']
          }
        },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'email']
          },
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price']
          },
          {
            model: SubscriptionPayment,
            as: 'payments',
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      let statusChanges = {
        activeToPending: 0,
        pendingToOverdue: 0,
        overdueToSuspended: 0,
        maintained: 0
      };

      for (const subscription of subscriptions) {
        const newStatus = await this.calculateSubscriptionStatus(subscription);
        
        if (newStatus !== subscription.status) {
          const oldStatus = subscription.status;
          await subscription.update({ status: newStatus });
          
          // Contabilizar cambios
          if (oldStatus === 'ACTIVE' && newStatus === 'PENDING') {
            statusChanges.activeToPending++;
          } else if (oldStatus === 'PENDING' && newStatus === 'OVERDUE') {
            statusChanges.pendingToOverdue++;
          } else if (oldStatus === 'OVERDUE' && newStatus === 'SUSPENDED') {
            statusChanges.overdueToSuspended++;
          }

          console.log(`📊 Suscripción ${subscription.id} (${subscription.business.name}): ${oldStatus} → ${newStatus}`);
          
          // TODO: Enviar notificación al negocio
          await this.sendStatusChangeNotification(subscription, oldStatus, newStatus);
        } else {
          statusChanges.maintained++;
        }
      }

      console.log('✅ Verificación completada:', statusChanges);
      return statusChanges;

    } catch (error) {
      console.error('❌ Error en verificación diaria:', error);
      throw error;
    }
  }

  /**
   * Calcula el estado actual de una suscripción
   */
  static async calculateSubscriptionStatus(subscription) {
    const today = new Date();
    const nextPaymentDate = new Date(subscription.nextPaymentDate);
    const daysOverdue = Math.floor((today - nextPaymentDate) / (1000 * 60 * 60 * 24));

    // Verificar si hay un pago reciente pendiente de validación
    const pendingPayment = await SubscriptionPayment.findOne({
      where: {
        businessSubscriptionId: subscription.id,
        status: 'PENDING'
      },
      order: [['createdAt', 'DESC']]
    });

    if (pendingPayment) {
      return 'PENDING'; // Hay un pago pendiente de validación
    }

    // Lógica de estados basada en días vencidos
    if (daysOverdue <= 0) {
      return 'ACTIVE';
    } else if (daysOverdue <= 7) {
      return 'PENDING'; // Período de gracia 7 días
    } else if (daysOverdue <= 30) {
      return 'OVERDUE'; // Acceso limitado
    } else {
      return 'SUSPENDED'; // Sin acceso
    }
  }

  /**
   * Verifica el estado de una suscripción específica
   */
  static async checkBusinessSubscription(businessId) {
    try {
      const subscription = await BusinessSubscription.findOne({
        where: { businessId },
        include: [
          {
            model: SubscriptionPayment,
            as: 'payments',
            limit: 5,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!subscription) {
        return { status: 'NO_SUBSCRIPTION', access: false };
      }

      const currentStatus = await this.calculateSubscriptionStatus(subscription);
      
      // Actualizar si ha cambiado
      if (currentStatus !== subscription.status) {
        await subscription.update({ status: currentStatus });
      }

      const accessLevels = {
        'ACTIVE': { access: true, level: 'FULL' },
        'PENDING': { access: true, level: 'FULL' }, // Gracia completa
        'OVERDUE': { access: true, level: 'LIMITED' }, // Solo funciones básicas
        'SUSPENDED': { access: false, level: 'NONE' }
      };

      return {
        status: currentStatus,
        ...accessLevels[currentStatus],
        subscription,
        daysOverdue: Math.max(0, Math.floor((new Date() - new Date(subscription.nextPaymentDate)) / (1000 * 60 * 60 * 24)))
      };

    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return { status: 'ERROR', access: false };
    }
  }

  /**
   * Obtiene suscripciones que requieren atención
   */
  static async getSubscriptionsRequiringAttention() {
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [expiringSoon, overdue, pendingPayments] = await Promise.all([
      // Suscripciones que vencen en los próximos 7 días
      BusinessSubscription.findAll({
        where: {
          nextPaymentDate: {
            [Op.between]: [today, in7Days]
          },
          status: 'ACTIVE'
        },
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'email'] },
          { model: SubscriptionPlan, as: 'plan', attributes: ['name', 'price'] }
        ]
      }),
      
      // Suscripciones vencidas
      BusinessSubscription.findAll({
        where: {
          nextPaymentDate: {
            [Op.lt]: today
          },
          status: {
            [Op.in]: ['PENDING', 'OVERDUE']
          }
        },
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'email'] },
          { model: SubscriptionPlan, as: 'plan', attributes: ['name', 'price'] }
        ]
      }),

      // Pagos pendientes de validación
      SubscriptionPayment.findAll({
        where: {
          status: 'PENDING'
        },
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            include: [
              { model: Business, as: 'business', attributes: ['id', 'name', 'email'] }
            ]
          }
        ]
      })
    ]);

    return {
      expiringSoon: expiringSoon.length,
      overdue: overdue.length,
      pendingPayments: pendingPayments.length,
      details: {
        expiringSoon,
        overdue,
        pendingPayments
      }
    };
  }

  /**
   * Envía notificación de cambio de estado
   */
  static async sendStatusChangeNotification(subscription, oldStatus, newStatus) {
    // TODO: Implementar sistema de notificaciones
    // Por ahora solo log
    console.log(`📧 Notificación ${subscription.business.name}: ${oldStatus} → ${newStatus}`);
    
    const messages = {
      'ACTIVE_TO_PENDING': 'Su suscripción está próxima a vencer. Por favor, realice el pago.',
      'PENDING_TO_OVERDUE': 'Su suscripción ha vencido. Acceso limitado activado.',
      'OVERDUE_TO_SUSPENDED': 'Su suscripción ha sido suspendida por falta de pago.'
    };

    const messageKey = `${oldStatus}_TO_${newStatus}`;
    const message = messages[messageKey] || `Estado de suscripción actualizado: ${newStatus}`;
    
    // Aquí integrarías con servicio de email/SMS/push notifications
    return { sent: true, message };
  }

  /**
   * Procesa un pago recién confirmado
   */
  static async processConfirmedPayment(paymentId) {
    try {
      const payment = await SubscriptionPayment.findByPk(paymentId, {
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription'
          }
        ]
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar el pago como confirmado
      await payment.update({ status: 'COMPLETED' });

      // Extender la suscripción
      const subscription = payment.subscription;
      const plan = await SubscriptionPlan.findByPk(subscription.subscriptionPlanId);
      
      // Calcular nueva fecha de vencimiento (agregar período del plan)
      const currentDate = new Date(subscription.nextPaymentDate);
      const billingCycle = plan.billingCycle || 'MONTHLY';
      
      let newPaymentDate;
      switch (billingCycle) {
        case 'MONTHLY':
          newPaymentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
          break;
        case 'YEARLY':
          newPaymentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
          break;
        default:
          newPaymentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }

      // Actualizar suscripción
      await subscription.update({
        status: 'ACTIVE',
        nextPaymentDate: newPaymentDate,
        lastPaymentDate: new Date()
      });

      console.log(`✅ Pago procesado: Suscripción ${subscription.id} extendida hasta ${newPaymentDate}`);
      return { success: true, newPaymentDate };

    } catch (error) {
      console.error('Error procesando pago confirmado:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionStatusService;