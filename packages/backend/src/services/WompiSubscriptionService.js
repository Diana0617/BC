/**
 * Servicio de integración con Wompi para pagos de suscripciones
 * Los negocios pagan su suscripción a Beauty Control a través de Wompi
 */

const axios = require('axios');
const crypto = require('crypto');
const { Business, SubscriptionPlan, BusinessSubscription, SubscriptionPayment } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class WompiSubscriptionService {
  
  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.baseURL = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';
    this.eventSecret = process.env.WOMPI_EVENT_SECRET;
  }

  /**
   * Crear transacción de suscripción para un negocio
   */
  async createSubscriptionTransaction(businessId, planId, userEmail) {
    try {
      const business = await Business.findByPk(businessId);
      const plan = await SubscriptionPlan.findByPk(planId);

      if (!business || !plan) {
        throw new Error('Negocio o plan no encontrado');
      }

      // Generar referencia única compatible con Wompi
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const reference = `BC_${timestamp}_${randomSuffix}`;

      console.log('🔄 Creando transacción con referencia:', reference);

      const transactionData = {
        amount_in_cents: plan.price * 100, // Wompi maneja centavos
        currency: 'COP',
        customer_email: userEmail,
        payment_method: {
          type: 'CARD'
        },
        reference: reference,
        customer_data: {
          phone_number: business.phone || '',
          full_name: business.name
        },
        shipping_address: {
          address_line_1: business.address || '',
          city: business.city || '',
          country: 'CO'
        },
        redirect_url: `${process.env.FRONTEND_URL}/subscription/success?ref=${reference}`,
        payment_source_id: null // Se genera en el frontend
      };

      // Crear BusinessSubscription primero
      const businessSubscription = await BusinessSubscription.create({
        businessId: businessId,
        planId: planId,
        status: 'PENDING',
        startDate: new Date(),
        endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
        isAutoRenewal: false
      });

      // Crear registro de pago en BD antes de procesar
      const subscriptionPayment = await SubscriptionPayment.create({
        businessSubscriptionId: businessSubscription.id,
        amount: plan.price,
        paymentMethod: 'WOMPI_CARD',
        status: 'PENDING',
        externalReference: reference,
        description: `Pago de suscripción ${plan.name} para ${business.name}`,
        metadata: {
          planId: planId,
          businessId: businessId,
          userEmail: userEmail
        }
      });

      console.log('✅ Pago creado en BD:', {
        id: subscriptionPayment.id,
        reference: reference,
        businessSubscriptionId: businessSubscription.id
      });

      return {
        reference,
        amount: plan.price,
        publicKey: this.publicKey,
        redirectUrl: transactionData.redirect_url,
        subscriptionPaymentId: subscriptionPayment.id,
        businessSubscriptionId: businessSubscription.id,
        planName: plan.name
      };

    } catch (error) {
      console.error('Error creando transacción Wompi:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de Wompi cuando el pago es exitoso
   */
  async processWebhook(webhookData) {
    try {
      const { event, data, environment } = webhookData;

      console.log(`📨 Procesando evento Wompi: ${event} en ${environment}`);

      if (event !== 'transaction.updated') {
        console.log(`ℹ️ Evento ${event} no manejado`);
        return { success: true, message: 'Evento no manejado' };
      }

      const { transaction } = data;
      const { reference, status, amount_in_cents, id: transactionId } = transaction;

      console.log(`💳 Transacción ${transactionId}: ${status} - ${reference}`);

      // Buscar el pago en nuestra BD
      const payment = await SubscriptionPayment.findOne({
        where: { externalReference: reference },
        include: [{
          model: BusinessSubscription,
          as: 'subscription',
          include: [{
            model: Business,
            as: 'business'
          }]
        }]
      });

      if (!payment) {
        console.error(`❌ Pago no encontrado para referencia: ${reference}`);
        console.log('🔍 Buscando pagos existentes...');
        
        // Mostrar pagos existentes para debugging
        const existingPayments = await SubscriptionPayment.findAll({
          attributes: ['id', 'externalReference', 'status'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        });
        
        console.log('📋 Pagos recientes:', existingPayments.map(p => ({
          id: p.id,
          reference: p.externalReference,
          status: p.status
        })));
        
        throw new Error(`Pago no encontrado para referencia: ${reference}`);
      }

      console.log('✅ Pago encontrado:', {
        id: payment.id,
        status: payment.status,
        businessId: payment.subscription?.businessId
      });

      if (status === 'APPROVED') {
        // Pago exitoso - usar el nuevo método del modelo
        await payment.markAsSuccessful({
          transactionId: transactionId,
          amount: amount_in_cents / 100,
          provider: 'WOMPI',
          timestamp: new Date()
        });

        // Extender suscripción usando nuestro servicio existente
        const SubscriptionStatusService = require('./SubscriptionStatusService');
        await SubscriptionStatusService.processConfirmedPayment(payment.id);

        console.log(`✅ Suscripción activada para pago ${payment.id}`);
        return { success: true, message: 'Suscripción activada', newStatus: 'ACTIVE' };

      } else if (status === 'DECLINED' || status === 'VOIDED' || status === 'ERROR') {
        // Pago rechazado - usar el nuevo método de manejo de fallos
        const failureReason = `Pago ${status.toLowerCase()} por Wompi`;
        const errorDetails = {
          wompiStatus: status,
          transactionId: transactionId,
          timestamp: new Date(),
          provider: 'WOMPI'
        };

        await payment.markAttemptAsFailed(failureReason, errorDetails);

        console.log(`❌ Pago ${status.toLowerCase()} para referencia ${reference}`);
        console.log(`🔄 Intentos: ${payment.paymentAttempts}/${payment.maxAttempts}`);
        
        if (payment.canRetry()) {
          console.log(`🔁 Se pueden realizar más intentos de pago`);
          return { 
            success: false, 
            message: `Pago ${status.toLowerCase()} - Reintentos disponibles`, 
            newStatus: 'ATTEMPT_FAILED',
            canRetry: true,
            remainingAttempts: payment.getRemainingAttempts()
          };
        } else {
          console.log(`🚫 Máximo de intentos alcanzado - Pago marcado como FAILED`);
          return { 
            success: false, 
            message: `Pago ${status.toLowerCase()} - Máximo de intentos alcanzado`, 
            newStatus: 'FAILED',
            canRetry: false
          };
        }
      
      } else {
        // Estados intermedios como PENDING
        console.log(`⏳ Pago en estado ${status} para referencia ${reference}`);
        return { success: true, message: `Pago en estado ${status}`, newStatus: status };
      }

    } catch (error) {
      console.error('Error procesando webhook Wompi:', error);
      throw error;
    }
  }

  /**
   * Verificar firma del webhook según documentación de Wompi
   * Implementa el algoritmo SHA256 descrito en la documentación
   */
  verifyWebhookSignature(payload, receivedChecksum) {
    try {
      if (!this.eventSecret) {
        console.error('❌ WOMPI_EVENT_SECRET no configurado');
        return false;
      }

      const { signature, timestamp } = payload;
      
      if (!signature || !signature.properties || !signature.checksum) {
        console.error('❌ Estructura de firma inválida en el payload');
        return false;
      }

      // Paso 1: Concatenar los valores de las propiedades especificadas
      let concatenatedData = '';
      
      for (const property of signature.properties) {
        const value = this.getNestedProperty(payload.data, property);
        if (value !== undefined) {
          concatenatedData += value;
        }
      }

      // Paso 2: Concatenar el timestamp
      concatenatedData += timestamp;

      // Paso 3: Concatenar el secreto de eventos
      concatenatedData += this.eventSecret;

      // Paso 4: Generar checksum con SHA256
      const calculatedChecksum = crypto
        .createHash('sha256')
        .update(concatenatedData)
        .digest('hex')
        .toUpperCase();

      console.log('🔐 Verificación de firma:', {
        properties: signature.properties,
        timestamp,
        concatenatedData: concatenatedData.substring(0, 100) + '...',
        calculatedChecksum,
        receivedChecksum,
        payloadChecksum: signature.checksum,
        match: calculatedChecksum === signature.checksum.toUpperCase()
      });

      // Comparar con el checksum recibido (puede venir del header o del payload)
      const checksumToCompare = (receivedChecksum || signature.checksum).toUpperCase();
      
      return calculatedChecksum === checksumToCompare;

    } catch (error) {
      console.error('Error verificando firma webhook:', error);
      return false;
    }
  }

  /**
   * Obtener valor de propiedad anidada usando dot notation
   * Ejemplo: "transaction.id" -> payload.data.transaction.id
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Consultar estado de transacción en Wompi
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.get(`${this.baseURL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error consultando estado en Wompi:', error);
      throw error;
    }
  }

  /**
   * Reintentar un pago fallido
   * @param {string} subscriptionPaymentId - ID del pago fallido
   * @param {string} userEmail - Email del usuario para el reintento
   */
  async retryFailedPayment(subscriptionPaymentId, userEmail) {
    try {
      const payment = await SubscriptionPayment.findByPk(subscriptionPaymentId, {
        include: [{
          model: BusinessSubscription,
          as: 'subscription',
          include: [{
            model: Business,
            as: 'business'
          }, {
            model: SubscriptionPlan,
            as: 'plan'
          }]
        }]
      });

      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      if (!payment.canRetry()) {
        throw new Error(`No se pueden realizar más intentos. Intentos: ${payment.paymentAttempts}/${payment.maxAttempts}`);
      }

      // Preparar para reintento
      await payment.prepareForRetry();

      // Crear nueva transacción en Wompi
      const business = payment.subscription.business;
      const plan = payment.subscription.plan;

      const result = await this.createSubscriptionTransaction(
        business.id,
        plan.id,
        userEmail
      );

      console.log(`🔄 Reintento de pago creado para ${payment.id}. Intento ${payment.paymentAttempts}/${payment.maxAttempts}`);

      return {
        ...result,
        isRetry: true,
        attemptNumber: payment.paymentAttempts,
        maxAttempts: payment.maxAttempts
      };

    } catch (error) {
      console.error('Error en reintento de pago:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de pagos fallidos
   */
  async getFailedPaymentStatistics() {
    try {
      const stats = await SubscriptionPayment.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          status: ['ATTEMPT_FAILED', 'FAILED']
        },
        group: ['status']
      });

      const paymentsWithRetries = await SubscriptionPayment.findAll({
        where: {
          paymentAttempts: { [Op.gt]: 1 }
        },
        attributes: ['id', 'paymentAttempts', 'maxAttempts', 'status', 'lastAttemptAt']
      });

      return {
        failedPaymentsByStatus: stats,
        paymentsWithRetries: paymentsWithRetries,
        totalFailedPayments: stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0)
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos fallidos:', error);
      throw error;
    }
  }
}

module.exports = WompiSubscriptionService;