/**
 * Controlador para pagos de suscripciones usando Wompi
 * Permite a los negocios pagar su suscripción a Beauty Control
 */

const WompiSubscriptionService = require('../services/WompiSubscriptionService');
const { BusinessSubscription, SubscriptionPlan, SubscriptionPayment } = require('../models');

class WompiPaymentController {

  /**
   * Iniciar proceso de pago de suscripción con Wompi
   */
  static async initiateSubscriptionPayment(req, res) {
    try {
      const businessId = req.user.businessId;
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'ID del plan es requerido'
        });
      }

      // Verificar que el negocio no tenga ya una suscripción activa
      const existingSubscription = await BusinessSubscription.findOne({
        where: { 
          businessId,
          status: ['ACTIVE', 'PENDING']
        }
      });

      if (existingSubscription) {
        return res.status(409).json({
          success: false,
          message: 'Ya tienes una suscripción activa. No puedes crear otra.'
        });
      }

      const wompiService = new WompiSubscriptionService();
      const paymentData = await wompiService.createSubscriptionTransaction(
        businessId, 
        planId, 
        req.user.email
      );

      res.json({
        success: true,
        data: {
          paymentReference: paymentData.reference,
          amount: paymentData.amount,
          publicKey: paymentData.publicKey,
          redirectUrl: paymentData.redirectUrl,
          planName: paymentData.planName
        },
        message: 'Transacción de pago creada. Proceda a completar el pago.'
      });

    } catch (error) {
      console.error('Error iniciando pago Wompi:', error);
      res.status(500).json({
        success: false,
        message: 'Error iniciando proceso de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Webhook para recibir notificaciones de Wompi
   */
  static async handleWompiWebhook(req, res) {
    try {
      const signature = req.headers['x-signature'] || req.headers['signature'];
      const webhookData = req.body;

      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Firma del webhook requerida'
        });
      }

      const wompiService = new WompiSubscriptionService();
      const result = await wompiService.processWebhook(webhookData, signature);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error procesando webhook Wompi:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verificar estado de un pago específico
   */
  static async checkPaymentStatus(req, res) {
    try {
      const { reference } = req.params;
      const businessId = req.user.businessId;

      const payment = await SubscriptionPayment.findOne({
        where: { 
          externalReference: reference
        },
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            where: { businessId }
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
      }

      // Si el pago está pendiente, consultar estado en Wompi
      if (payment.status === 'PENDING' && payment.externalTransactionId) {
        try {
          const wompiService = new WompiSubscriptionService();
          const wompiStatus = await wompiService.getTransactionStatus(payment.externalTransactionId);
          
          // Actualizar estado local si cambió en Wompi
          if (wompiStatus.data.status !== payment.status) {
            await wompiService.processWebhook({
              data: wompiStatus.data
            }, null); // Sin verificación de firma para consultas manuales
          }
        } catch (error) {
          console.error('Error consultando Wompi:', error);
          // Continuar con el estado local si falla la consulta
        }
      }

      res.json({
        success: true,
        data: {
          reference: payment.externalReference,
          status: payment.status,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod
        }
      });

    } catch (error) {
      console.error('Error verificando estado de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando estado de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener configuración pública de Wompi para el frontend
   */
  static async getWompiConfig(req, res) {
    try {
      res.json({
        success: true,
        data: {
          publicKey: process.env.WOMPI_PUBLIC_KEY,
          currency: 'COP',
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        }
      });
    } catch (error) {
      console.error('Error obteniendo configuración Wompi:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuración de pagos'
      });
    }
  }

  /**
   * Webhook de Wompi para notificaciones de pago
   */
  static async handleWebhook(req, res) {
    try {
      const webhookData = req.body;
      const signature = req.headers['x-wompi-signature'];

      console.log('📨 Webhook recibido de Wompi:', {
        event: webhookData.event,
        transaction_id: webhookData.data?.id,
        reference: webhookData.data?.reference
      });

      // Verificar firma del webhook
      const wompiService = new WompiSubscriptionService();
      if (signature && !wompiService.verifyWebhookSignature(webhookData, signature)) {
        console.error('❌ Firma de webhook inválida');
        return res.status(401).json({
          success: false,
          message: 'Firma inválida'
        });
      }

      // Procesar el webhook según el tipo de evento
      if (webhookData.event === 'transaction.updated') {
        const result = await wompiService.processWebhook(webhookData.data);
        
        res.json({
          success: true,
          message: 'Webhook procesado',
          data: result
        });
      } else {
        console.log('ℹ️ Evento de webhook no manejado:', webhookData.event);
        res.json({
          success: true,
          message: 'Evento no manejado'
        });
      }

    } catch (error) {
      console.error('Error procesando webhook Wompi:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = WompiPaymentController;