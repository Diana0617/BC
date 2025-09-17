/**
 * Controlador para pagos de suscripciones usando Wompi
 * Permite a los negocios pagar su suscripción a Beauty Control
 */

const WompiSubscriptionService = require('../services/WompiSubscriptionService');
const { BusinessSubscription, SubscriptionPlan, SubscriptionPayment } = require('../models');

class WompiPaymentController {

  /**
   * Helper para hacer peticiones seguras a la API de Wompi
   */
  static async fetchWompiAPI(url, options = {}) {
    // En desarrollo, configurar proceso para ignorar certificados SSL inválidos
    if (process.env.NODE_ENV === 'development') {
      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    }

    const fetchOptions = {
      headers: {
        'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...options
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      // Restaurar configuración SSL después de la petición
      if (process.env.NODE_ENV === 'development') {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
      }
      
      return response;
    } catch (error) {
      // Restaurar configuración SSL en caso de error
      if (process.env.NODE_ENV === 'development') {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
      }
      throw error;
    }
  }

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
  static async handleWebhook(req, res) {
    try {
      // Extraer firma del header correcto según documentación Wompi
      const signature = req.headers['x-event-checksum'];
      const webhookData = req.body;

      console.log('📨 Webhook recibido de Wompi:', {
        event: webhookData.event,
        signature: signature ? 'presente' : 'ausente',
        timestamp: webhookData.timestamp
      });

      if (!signature) {
        console.error('❌ Firma del webhook ausente');
        return res.status(400).json({
          success: false,
          message: 'Firma del webhook requerida'
        });
      }

      const wompiService = new WompiSubscriptionService();
      
      // Verificar la autenticidad del webhook
      if (!wompiService.verifyWebhookSignature(webhookData, signature)) {
        console.error('❌ Firma del webhook inválida');
        return res.status(401).json({
          success: false,
          message: 'Firma del webhook inválida'
        });
      }

      const result = await wompiService.processWebhook(webhookData);

      // Responder con 200 para que Wompi no reintente
      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error procesando webhook Wompi:', error);
      
      // Aún responder con 200 si es un error de nuestro lado
      // Para evitar reintentos innecesarios
      res.status(200).json({
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
   * Generar firma de integridad para Wompi Widget
   */
  static async generateSignature(req, res) {
    try {
      const { reference, amountInCents, currency } = req.body;

      if (!reference || !amountInCents || !currency) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros requeridos: reference, amountInCents, currency'
        });
      }

      // Obtener el secreto de integridad desde variables de entorno
      const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
      
      if (!integritySecret) {
        console.error('WOMPI_INTEGRITY_SECRET no configurado');
        return res.status(500).json({
          success: false,
          message: 'Configuración de pagos incompleta'
        });
      }

      // Generar hash SHA256 según documentación de Wompi
      // Formato: "<Referencia><Monto><Moneda><SecretoIntegridad>"
      const crypto = require('crypto');
      const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;
      
      console.log('🔐 Generando firma para:', { reference, amountInCents, currency });
      
      const signature = crypto
        .createHash('sha256')
        .update(concatenatedString)
        .digest('hex');

      res.json({
        success: true,
        signature: signature
      });
    } catch (error) {
      console.error('Error generando firma Wompi:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno al generar firma'
      });
    }
  }

  /**
   * Obtener configuración pública de Wompi para el frontend
   */
  static async getWompiConfig(req, res) {
    try {
      console.log('🔧 GET /api/wompi/config - IP:', req.ip, 'Time:', new Date().toISOString())
      
      const publicKey = process.env.WOMPI_PUBLIC_KEY;
      // Extraer merchant ID de la public key (formato: pub_test_merchantId)
      const merchantId = publicKey ? publicKey.split('_').pop() : null;
      
      res.json({
        success: true,
        data: {
          publicKey: publicKey,
          merchantId: merchantId,
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

  /**
   * Consultar estado de una transacción específica
   */
  static async getTransactionStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'ID de transacción requerido'
        });
      }

      // Construir URL del API de Wompi
      const apiUrl = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
      const transactionUrl = `${apiUrl}/transactions/${transactionId}`;

      console.log('🔍 Consultando transacción:', transactionId);
      console.log('📡 URL:', transactionUrl);
      console.log('🔑 Headers a enviar:', {
        'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY ? 'PRESENT' : 'MISSING'}`,
        'Content-Type': 'application/json'
      });

      // Hacer petición al API de Wompi usando el helper seguro
      const response = await WompiPaymentController.fetchWompiAPI(transactionUrl, {
        method: 'GET'
      });

      console.log('📊 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.error('❌ Error en API de Wompi:', response.status, response.statusText);
        // Intentar leer el contenido de error para más información
        try {
          const errorText = await response.text();
          console.error('❌ Contenido de error:', errorText.substring(0, 500));
        } catch (readError) {
          console.error('❌ No se pudo leer el contenido de error');
        }
        
        return res.status(response.status).json({
          success: false,
          message: `Error consultando transacción: ${response.statusText}`
        });
      }

      // Verificar el tipo de contenido antes de parsear como JSON
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type recibido:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Respuesta no es JSON:', responseText.substring(0, 500));
        return res.status(500).json({
          success: false,
          message: 'La API de Wompi devolvió una respuesta no válida'
        });
      }

      const transactionData = await response.json();
      console.log('✅ Datos de transacción recibidos:', transactionData);

      res.json({
        success: true,
        data: transactionData.data
      });

    } catch (error) {
      console.error('Error consultando transacción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Confirmar pago manualmente consultando estado en Wompi
   * Útil cuando el webhook falla o no llega
   * Fuerza activación automática si el pago está aprobado
   */
  static async confirmPayment(req, res) {
    try {
      const { transactionId } = req.params;

      console.log('🔄 Confirmación manual de pago:', transactionId);

      // Obtener datos de la transacción desde Wompi
      const apiUrl = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
      const transactionUrl = `${apiUrl}/transactions/${transactionId}`;

      const response = await WompiPaymentController.fetchWompiAPI(transactionUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message: `Error consultando transacción: ${response.statusText}`
        });
      }

      const transactionData = await response.json();
      const transaction = transactionData.data;

      console.log('📊 Estado de transacción:', {
        id: transaction.id,
        status: transaction.status,
        reference: transaction.reference,
        amount: transaction.amount_in_cents
      });

      // Si el pago está aprobado, forzar creación de suscripción
      if (transaction.status === 'APPROVED') {
        try {
          // Intentar procesar con webhook primero
          const wompiService = new WompiSubscriptionService();
          const webhookData = {
            event: 'transaction.updated',
            data: { transaction },
            timestamp: Date.now(),
            environment: 'test'
          };

          const result = await wompiService.processWebhook(webhookData);
          
          return res.json({
            success: true,
            message: 'Pago confirmado y suscripción activada exitosamente',
            data: {
              transactionId,
              status: transaction.status,
              reference: transaction.reference,
              subscriptionActivated: true,
              method: 'webhook_processing',
              result: result
            }
          });

        } catch (webhookError) {
          console.log('🔄 Error en webhook, intentando activación directa:', webhookError.message);
          
          try {
            // Si webhook falla, crear suscripción directamente
            const subscriptionResult = await WompiPaymentController.createSubscriptionFromPayment(transaction);
            
            return res.json({
              success: true,
              message: 'Pago confirmado y suscripción creada manualmente',
              data: {
                transactionId,
                status: transaction.status,
                reference: transaction.reference,
                subscription: subscriptionResult,
                method: 'direct_creation'
              }
            });
          } catch (directError) {
            console.error('❌ Error en creación directa:', directError.message);
            return res.status(500).json({
              success: false,
              message: 'Pago aprobado pero falló creación de suscripción',
              data: {
                transactionId,
                status: transaction.status,
                reference: transaction.reference,
                error: directError.message
              }
            });
          }
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `El pago no está aprobado. Estado actual: ${transaction.status}`,
          data: {
            transactionId,
            status: transaction.status,
            reference: transaction.reference
          }
        });
      }

    } catch (error) {
      console.error('Error confirmando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear suscripción directamente desde datos de pago Wompi
   * Usado cuando el webhook falla pero el pago está aprobado
   */
  static async createSubscriptionFromPayment(transactionData) {
    const { Business, SubscriptionPlan, BusinessSubscription, SubscriptionPayment } = require('../models');
    const { Op } = require('sequelize');
    
    try {
      console.log('🔧 Creando suscripción desde pago:', transactionData.reference);
      
      // Extraer businessId de la referencia o metadata
      const businessId = await WompiPaymentController.extractBusinessIdFromReference(transactionData.reference);
      
      if (!businessId) {
        throw new Error(`No se pudo extraer businessId de la referencia: ${transactionData.reference}`);
      }

      // Buscar el business
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error(`Business no encontrado: ${businessId}`);
      }

      // Buscar plan por defecto (básico o el primero activo)
      const defaultPlan = await SubscriptionPlan.findOne({
        where: { 
          status: 'ACTIVE'
        },
        order: [['price', 'ASC']] // El más barato primero
      });

      if (!defaultPlan) {
        throw new Error('No se encontró un plan activo para la suscripción');
      }

      console.log('📋 Usando plan:', defaultPlan.name, 'para business:', business.businessName);

      // Crear BusinessSubscription
      const subscription = await BusinessSubscription.create({
        businessId: businessId,
        planId: defaultPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
        autoRenewal: true,
        createdBy: 'SYSTEM_WOMPI_AUTO'
      });

      // Crear SubscriptionPayment
      const payment = await SubscriptionPayment.create({
        subscriptionId: subscription.id,
        businessId: businessId,
        amount: transactionData.amount_in_cents / 100,
        currency: transactionData.currency || 'COP',
        status: 'APPROVED',
        paymentMethod: 'WOMPI_CARD',
        wompiTransactionId: transactionData.id,
        wompiReference: transactionData.reference,
        paidAt: new Date(transactionData.finalized_at || Date.now()),
        description: `Pago Wompi automático - ${transactionData.id}`
      });

      console.log('✅ Suscripción creada automáticamente:', subscription.id);
      
      return {
        subscription: subscription,
        payment: payment,
        business: business,
        plan: defaultPlan
      };

    } catch (error) {
      console.error('❌ Error creando suscripción desde pago:', error);
      throw error;
    }
  }

  /**
   * Extraer businessId de la referencia de pago
   * Por ahora usa un businessId de prueba, en producción se obtendría de metadata
   */
  static async extractBusinessIdFromReference(reference) {
    // TODO: En producción, esto debería venir de la metadata del pago
    // Por ahora, usar el primer business disponible para testing
    const { Business } = require('../models');
    
    try {
      const business = await Business.findOne({
        where: { status: 'ACTIVE' },
        order: [['createdAt', 'ASC']]
      });
      
      return business ? business.id : null;
    } catch (error) {
      console.error('Error extrayendo businessId:', error);
      return null;
    }
  }
}

module.exports = WompiPaymentController;