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
        where: { externalReference: reference }
      });

      if (!payment) {
        console.error(`❌ Pago no encontrado para referencia: ${reference}`);
        throw new Error(`Pago no encontrado para referencia: ${reference}`);
      }

      if (status === 'APPROVED') {
        // Pago exitoso - activar suscripción
        await payment.update({
          status: 'COMPLETED',
          paidAt: new Date(),
          externalTransactionId: transactionId
        });

        // Extender suscripción usando nuestro servicio existente
        const SubscriptionStatusService = require('./SubscriptionStatusService');
        await SubscriptionStatusService.processConfirmedPayment(payment.id);

        console.log(`✅ Suscripción activada para pago ${payment.id}`);
        return { success: true, message: 'Suscripción activada', newStatus: 'ACTIVE' };

      } else if (status === 'DECLINED' || status === 'VOIDED' || status === 'ERROR') {
        // Pago rechazado, anulado o con error
        await payment.update({
          status: 'REJECTED',
          verificationNotes: `Pago ${status.toLowerCase()} por Wompi`
        });

        console.log(`❌ Pago ${status.toLowerCase()} para referencia ${reference}`);
        return { success: false, message: `Pago ${status.toLowerCase()}`, newStatus: 'REJECTED' };
      
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
}

module.exports = WompiSubscriptionService;