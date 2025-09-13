/**
 * Servicio de Auto-renovación de Suscripciones
 * Maneja la renovación automática de suscripciones al finalizar el período de prueba
 */

const { BusinessSubscription, SavedPaymentMethod, Business, SubscriptionPlan, 
        FinancialMovement, OwnerFinancialReport } = require('../models');
const WompiPaymentService = require('./WompiPaymentService');
const EmailService = require('./EmailService');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const axios = require('axios');

class AutoRenewalService {
  
  /**
   * Verificar suscripciones próximas a vencer y procesar auto-renovación
   */
  static async processAutoRenewals() {
    console.log('🔄 Iniciando proceso de auto-renovación...');
    
    try {
      // Buscar suscripciones TRIAL que vencen en 1 día o menos
      const expiringSubscriptions = await this.getExpiringTrialSubscriptions();
      
      console.log(`📊 Encontradas ${expiringSubscriptions.length} suscripciones próximas a vencer`);
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const subscription of expiringSubscriptions) {
        try {
          const result = await this.processSubscriptionRenewal(subscription);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          console.error(`❌ Error procesando suscripción ${subscription.id}:`, error);
          failureCount++;
        }
      }
      
      console.log(`✅ Auto-renovación completada: ${successCount} exitosas, ${failureCount} fallos`);
      
      return {
        success: true,
        processed: expiringSubscriptions.length,
        successful: successCount,
        failed: failureCount
      };
      
    } catch (error) {
      console.error('❌ Error en proceso de auto-renovación:', error);
      throw error;
    }
  }
  
  /**
   * Obtener suscripciones TRIAL que vencen en 1 día o menos
   */
  static async getExpiringTrialSubscriptions() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    return await BusinessSubscription.findAll({
      where: {
        status: 'TRIAL',
        endDate: {
          [Op.lte]: tomorrow
        }
      },
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'price', 'currency', 'duration', 'durationType']
        }
      ]
    });
  }
  
  /**
   * Procesar renovación de una suscripción específica
   */
  static async processSubscriptionRenewal(subscription) {
    console.log(`🔄 Procesando renovación para suscripción ${subscription.id}`);
    
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Verificar si el negocio quiere cancelar
      if (subscription.cancelAtPeriodEnd) {
        await this.handleTrialCancellation(subscription, transaction);
        await transaction.commit();
        return { success: true, action: 'cancelled' };
      }
      
      // 2. Buscar método de pago guardado
      const paymentMethod = await SavedPaymentMethod.findOne({
        where: {
          businessId: subscription.businessId,
          isDefault: true,
          isActive: true
        }
      });
      
      if (!paymentMethod) {
        await this.handleMissingPaymentMethod(subscription, transaction);
        await transaction.commit();
        return { success: false, reason: 'no_payment_method' };
      }
      
      // 3. Verificar que la tarjeta no esté expirada
      if (this.isPaymentMethodExpired(paymentMethod)) {
        await this.handleExpiredPaymentMethod(subscription, paymentMethod, transaction);
        await transaction.commit();
        return { success: false, reason: 'expired_payment_method' };
      }
      
      // 4. Procesar pago de renovación
      const paymentResult = await this.processRenewalPayment(subscription, paymentMethod);
      
      if (paymentResult.success) {
        // 5. Renovar suscripción
        await this.renewSubscription(subscription, paymentResult.transactionId, transaction);
        
        // 6. Registrar movimiento financiero
        await this.recordFinancialMovement(subscription, paymentResult, transaction);
        
        // 7. Enviar confirmación
        await this.sendRenewalConfirmation(subscription);
        
        await transaction.commit();
        console.log(`✅ Suscripción ${subscription.id} renovada exitosamente`);
        return { success: true, action: 'renewed', transactionId: paymentResult.transactionId };
        
      } else {
        // Pago falló
        await this.handleFailedPayment(subscription, paymentResult, transaction);
        await transaction.commit();
        return { success: false, reason: 'payment_failed', error: paymentResult.error };
      }
      
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error renovando suscripción ${subscription.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Procesar pago de renovación usando Wompi
   */
  static async processRenewalPayment(subscription, paymentMethod) {
    try {
      const paymentData = {
        amount: subscription.plan.price * 100, // Convertir a centavos
        currency: subscription.plan.currency,
        customer_email: subscription.business.email,
        payment_method: {
          token: paymentMethod.providerToken
        },
        reference: `renewal_${subscription.id}_${Date.now()}`,
        description: `Renovación ${subscription.plan.name} - ${subscription.business.name}`,
        metadata: {
          subscription_id: subscription.id,
          business_id: subscription.businessId,
          renewal_type: 'auto_renewal'
        }
      };
      
      const result = await WompiPaymentService.processPayment(paymentData);
      
      return {
        success: result.status === 'APPROVED',
        transactionId: result.transaction_id,
        reference: result.reference,
        error: result.status !== 'APPROVED' ? result.status_message : null
      };
      
    } catch (error) {
      console.error('❌ Error procesando pago de renovación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesar pago de renovación usando Wompi con token guardado
   */
  static async processWompiPayment(subscription, paymentMethod) {
    try {
      const WompiSubscriptionService = require('./WompiSubscriptionService');
      const wompiService = new WompiSubscriptionService();
      
      // Crear transacción de renovación con método de pago guardado
      const paymentData = {
        amount_in_cents: subscription.plan.price * 100,
        currency: 'COP',
        customer_email: subscription.business.email,
        payment_method: {
          type: 'CARD',
          token: paymentMethod.providerToken, // Token de la tarjeta guardada
          installments: 1
        },
        reference: `auto-renewal-${subscription.id}-${Date.now()}`,
        customer_data: {
          phone_number: subscription.business.phone || '',
          full_name: subscription.business.name
        },
        metadata: {
          subscription_id: subscription.id,
          business_id: subscription.businessId,
          renewal_type: 'auto_renewal',
          plan_name: subscription.plan.name
        }
      };

      // Llamar a Wompi para procesar el pago
      const response = await axios.post(`${wompiService.baseURL}/transactions`, paymentData, {
        headers: {
          'Authorization': `Bearer ${wompiService.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data.data;
      
      return {
        success: transaction.status === 'APPROVED',
        reference: transaction.reference,
        transactionId: transaction.id,
        error: transaction.status !== 'APPROVED' ? transaction.status_message : null
      };
      
    } catch (error) {
      console.error('❌ Error procesando pago Wompi para auto-renovación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Renovar suscripción después de pago exitoso
   */
  static async renewSubscription(subscription, transactionId, transaction) {
    const plan = subscription.plan;
    const now = new Date();
    
    // Calcular nueva fecha de finalización
    let newEndDate = new Date(now);
    if (plan.durationType === 'MONTHLY') {
      newEndDate.setMonth(newEndDate.getMonth() + plan.duration);
    } else if (plan.durationType === 'YEARLY') {
      newEndDate.setFullYear(newEndDate.getFullYear() + plan.duration);
    } else if (plan.durationType === 'WEEKLY') {
      newEndDate.setDate(newEndDate.getDate() + (plan.duration * 7));
    }
    
    // Actualizar suscripción
    await subscription.update({
      status: 'ACTIVE',
      startDate: now,
      endDate: newEndDate,
      lastPaymentDate: now,
      lastPaymentAmount: plan.price,
      lastTransactionId: transactionId,
      cancelAtPeriodEnd: false,
      metadata: {
        ...subscription.metadata,
        auto_renewed: true,
        renewal_date: now.toISOString(),
        transaction_id: transactionId
      }
    }, { transaction });
    
    console.log(`✅ Suscripción ${subscription.id} renovada hasta ${newEndDate.toISOString()}`);
  }
  
  /**
   * Registrar movimiento financiero de la renovación
   */
  static async recordFinancialMovement(subscription, paymentResult, transaction) {
    await FinancialMovement.create({
      businessId: subscription.businessId,
      type: 'SUBSCRIPTION_RENEWAL',
      amount: subscription.plan.price,
      currency: subscription.plan.currency,
      status: 'COMPLETED',
      description: `Auto-renovación ${subscription.plan.name}`,
      transactionId: paymentResult.transactionId,
      reference: paymentResult.reference,
      metadata: {
        subscription_id: subscription.id,
        plan_id: subscription.planId,
        renewal_type: 'automatic'
      }
    }, { transaction });
  }
  
  /**
   * Manejar cancelación al final del período de prueba
   */
  static async handleTrialCancellation(subscription, transaction) {
    await subscription.update({
      status: 'CANCELED',
      cancelledAt: new Date(),
      metadata: {
        ...subscription.metadata,
        cancellation_reason: 'trial_ended',
        cancelled_automatically: true
      }
    }, { transaction });
    
    // Enviar email de confirmación de cancelación
    await this.sendCancellationConfirmation(subscription);
    
    console.log(`✅ Suscripción ${subscription.id} cancelada al final del trial`);
  }
  
  /**
   * Manejar suscripción sin método de pago
   */
  static async handleMissingPaymentMethod(subscription, transaction) {
    // Suspender temporalmente y enviar notificación
    await subscription.update({
      status: 'SUSPENDED',
      metadata: {
        ...subscription.metadata,
        suspension_reason: 'missing_payment_method',
        suspended_at: new Date().toISOString()
      }
    }, { transaction });
    
    // Enviar email solicitando método de pago
    await this.sendPaymentMethodRequired(subscription);
    
    console.log(`⚠️ Suscripción ${subscription.id} suspendida - falta método de pago`);
  }
  
  /**
   * Manejar método de pago expirado
   */
  static async handleExpiredPaymentMethod(subscription, paymentMethod, transaction) {
    // Marcar método de pago como inactivo
    await paymentMethod.update({ isActive: false }, { transaction });
    
    // Suspender suscripción
    await subscription.update({
      status: 'SUSPENDED',
      metadata: {
        ...subscription.metadata,
        suspension_reason: 'expired_payment_method',
        suspended_at: new Date().toISOString()
      }
    }, { transaction });
    
    // Enviar email sobre tarjeta expirada
    await this.sendExpiredCardNotification(subscription, paymentMethod);
    
    console.log(`⚠️ Suscripción ${subscription.id} suspendida - tarjeta expirada`);
  }
  
  /**
   * Manejar pago fallido
   */
  static async handleFailedPayment(subscription, paymentResult, transaction) {
    // Incrementar contador de intentos fallidos
    const failedAttempts = (subscription.metadata?.failed_payment_attempts || 0) + 1;
    const maxAttempts = 3;
    
    if (failedAttempts >= maxAttempts) {
      // Suspender después de 3 intentos fallidos
      await subscription.update({
        status: 'SUSPENDED',
        metadata: {
          ...subscription.metadata,
          failed_payment_attempts: failedAttempts,
          last_payment_failure: paymentResult.error,
          suspended_at: new Date().toISOString(),
          suspension_reason: 'payment_failed_max_attempts'
        }
      }, { transaction });
      
      await this.sendPaymentFailedSuspension(subscription);
      
    } else {
      // Marcar como pendiente y programar reintento
      await subscription.update({
        status: 'OVERDUE',
        metadata: {
          ...subscription.metadata,
          failed_payment_attempts: failedAttempts,
          last_payment_failure: paymentResult.error,
          next_retry_date: this.calculateNextRetryDate(failedAttempts)
        }
      }, { transaction });
      
      await this.sendPaymentFailedRetry(subscription, failedAttempts, maxAttempts);
    }
    
    console.log(`❌ Pago fallido para suscripción ${subscription.id} - Intento ${failedAttempts}/${maxAttempts}`);
  }
  
  /**
   * Verificar si el método de pago está expirado
   */
  static isPaymentMethodExpired(paymentMethod) {
    if (!paymentMethod.cardExpiryMonth || !paymentMethod.cardExpiryYear) {
      return false; // No podemos verificar, asumimos que está válido
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (paymentMethod.cardExpiryYear < currentYear) {
      return true;
    }
    
    if (paymentMethod.cardExpiryYear === currentYear && paymentMethod.cardExpiryMonth < currentMonth) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calcular fecha del próximo reintento de pago
   */
  static calculateNextRetryDate(attempt) {
    const now = new Date();
    const daysToAdd = Math.pow(2, attempt); // Backoff exponencial: 2, 4, 8 días
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }
  
  /**
   * Procesar reintentos de pagos fallidos
   */
  static async processPaymentRetries() {
    console.log('🔄 Procesando reintentos de pagos...');
    
    const now = new Date();
    const subscriptionsToRetry = await BusinessSubscription.findAll({
      where: {
        status: 'OVERDUE',
        [Op.and]: [
          sequelize.literal(`metadata->>'next_retry_date' IS NOT NULL`),
          sequelize.literal(`(metadata->>'next_retry_date')::timestamp <= '${now.toISOString()}'`)
        ]
      },
      include: [
        { model: Business, as: 'business' },
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });
    
    console.log(`📊 Encontradas ${subscriptionsToRetry.length} suscripciones para reintento`);
    
    for (const subscription of subscriptionsToRetry) {
      try {
        await this.processSubscriptionRenewal(subscription);
      } catch (error) {
        console.error(`❌ Error en reintento para suscripción ${subscription.id}:`, error);
      }
    }
  }
  
  /**
   * Notificar sobre próximos vencimientos (2 días antes)
   */
  static async notifyUpcomingExpirations() {
    console.log('📧 Enviando notificaciones de próximos vencimientos...');
    
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingExpirations = await BusinessSubscription.findAll({
      where: {
        status: 'TRIAL',
        endDate: {
          [Op.between]: [twoDaysFromNow, threeDaysFromNow]
        }
      },
      include: [
        { model: Business, as: 'business' },
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });
    
    for (const subscription of upcomingExpirations) {
      try {
        await this.sendTrialExpiringNotification(subscription);
      } catch (error) {
        console.error(`❌ Error enviando notificación a ${subscription.business.email}:`, error);
      }
    }
    
    console.log(`📧 Enviadas ${upcomingExpirations.length} notificaciones de vencimiento`);
  }
  
  // ====== MÉTODOS DE EMAIL ======
  
  static async sendRenewalConfirmation(subscription) {
    // TODO: Implementar cuando tengas EmailService
    console.log(`📧 [EMAIL] Confirmación de renovación enviada a ${subscription.business.email}`);
  }
  
  static async sendCancellationConfirmation(subscription) {
    console.log(`📧 [EMAIL] Confirmación de cancelación enviada a ${subscription.business.email}`);
  }
  
  static async sendPaymentMethodRequired(subscription) {
    console.log(`📧 [EMAIL] Solicitud de método de pago enviada a ${subscription.business.email}`);
  }
  
  static async sendExpiredCardNotification(subscription, paymentMethod) {
    console.log(`📧 [EMAIL] Notificación de tarjeta expirada enviada a ${subscription.business.email}`);
  }
  
  static async sendPaymentFailedSuspension(subscription) {
    console.log(`📧 [EMAIL] Notificación de suspensión por pago fallido enviada a ${subscription.business.email}`);
  }
  
  static async sendPaymentFailedRetry(subscription, attempt, maxAttempts) {
    console.log(`📧 [EMAIL] Notificación de pago fallido (intento ${attempt}/${maxAttempts}) enviada a ${subscription.business.email}`);
  }
  
  static async sendTrialExpiringNotification(subscription) {
    console.log(`📧 [EMAIL] Notificación de trial próximo a vencer enviada a ${subscription.business.email}`);
  }
}

module.exports = AutoRenewalService;