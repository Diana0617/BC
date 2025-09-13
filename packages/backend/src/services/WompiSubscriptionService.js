/**
 * Servicio de integración con Wompi para pagos de suscripciones
 * Los negocios pagan su suscripción a Beauty Control a través de Wompi
 */

const axios = require('axios');
const crypto = require('crypto');
const { Business, SubscriptionPlan, BusinessSubscription, SubscriptionPayment } = require('../models');

class WompiSubscriptionService {
  
  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.baseURL = process.env.WOMPI_BASE_URL || 'https://production.wompi.co/v1';
    this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
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

      // Generar referencia única
      const reference = `BC-SUB-${businessId}-${Date.now()}`;

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

      // Crear registro en BD antes de procesar
      const subscriptionPayment = await SubscriptionPayment.create({
        businessSubscriptionId: business.id,
        amount: plan.price,
        paymentMethod: 'WOMPI_CARD',
        status: 'PENDING',
        externalReference: reference,
        paymentProvider: 'WOMPI'
      });

      return {
        reference,
        amount: plan.price,
        publicKey: this.publicKey,
        redirectUrl: transactionData.redirect_url,
        subscriptionPaymentId: subscriptionPayment.id,
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
  async processWebhook(webhookData, signature) {
    try {
      // Verificar integridad del webhook
      if (!this.verifyWebhookSignature(webhookData, signature)) {
        throw new Error('Webhook signature inválida');
      }

      const { data } = webhookData;
      const { reference, status, amount_in_cents } = data;

      // Buscar el pago en nuestra BD
      const payment = await SubscriptionPayment.findOne({
        where: { externalReference: reference }
      });

      if (!payment) {
        throw new Error(`Pago no encontrado para referencia: ${reference}`);
      }

      if (status === 'APPROVED') {
        // Pago exitoso - activar suscripción
        await payment.update({
          status: 'CONFIRMED',
          paymentDate: new Date(),
          externalTransactionId: data.id
        });

        // Extender suscripción usando nuestro servicio existente
        const SubscriptionStatusService = require('./SubscriptionStatusService');
        await SubscriptionStatusService.processConfirmedPayment(payment.id);

        console.log(`✅ Suscripción activada para pago ${payment.id}`);
        return { success: true, message: 'Suscripción activada' };

      } else if (status === 'DECLINED') {
        // Pago rechazado
        await payment.update({
          status: 'REJECTED',
          verificationNotes: 'Pago rechazado por Wompi'
        });

        console.log(`❌ Pago rechazado para referencia ${reference}`);
        return { success: false, message: 'Pago rechazado' };
      }

    } catch (error) {
      console.error('Error procesando webhook Wompi:', error);
      throw error;
    }
  }

  /**
   * Verificar firma del webhook para seguridad
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.integritySecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verificando firma webhook:', error);
      return false;
    }
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
}

module.exports = WompiSubscriptionService;