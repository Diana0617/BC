/**
 * Controlador para manejar pagos con 3D Secure v2 y pagos recurrentes
 */

const Wompi3DSService = require('../services/Wompi3DSService');
const { SubscriptionPayment, BusinessSubscription, Business, SubscriptionPlan } = require('../models');
const { Sequelize, Op } = require('sequelize');

class Payment3DSController {

  /**
   * Iniciar proceso de pago 3DS v2 (durante TRIAL o renovación)
   * POST /api/payments/3ds/create
   */
  static async create3DSPayment(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        cardToken, 
        customerEmail, 
        acceptanceToken, 
        businessSubscriptionId,
        browserInfo,
        threeDsAuthType, // Solo para testing/sandbox
        autoRenewalEnabled = false
      } = req.body;

      // Validaciones
      if (!cardToken || !customerEmail || !acceptanceToken || !browserInfo) {
        return res.status(400).json({
          success: false,
          error: 'cardToken, customerEmail, acceptanceToken y browserInfo son requeridos'
        });
      }

      // Verificar estructura de browserInfo
      const requiredBrowserFields = [
        'browser_color_depth',
        'browser_screen_height', 
        'browser_screen_width',
        'browser_language',
        'browser_user_agent',
        'browser_tz'
      ];

      for (const field of requiredBrowserFields) {
        if (!browserInfo[field]) {
          return res.status(400).json({
            success: false,
            error: `Campo requerido faltante en browserInfo: ${field}`
          });
        }
      }

      // Obtener información del negocio y suscripción
      const whereClause = {
        id: businessSubscriptionId || undefined
      };
      
      // Si no es OWNER, filtrar por businessId
      if (req.user.role !== 'OWNER') {
        whereClause.businessId = businessId;
      }
      
      const businessSubscription = await BusinessSubscription.findOne({
        where: whereClause,
        include: [
          { model: Business, as: 'business' },
          { model: SubscriptionPlan, as: 'plan' }
        ]
      });

      if (!businessSubscription) {
        return res.status(404).json({
          success: false,
          error: 'Suscripción no encontrada'
        });
      }

      const wompiService = new Wompi3DSService();
      
      // Preparar datos para el pago
      const paymentRequest = {
        cardToken,
        customerEmail,
        acceptanceToken,
        businessSubscriptionId: businessSubscription.id,
        amountInCents: Math.round(businessSubscription.plan.price * 100), // Convertir a centavos
        currency: 'COP',
        reference: `BC-${businessSubscription.id}-${Date.now()}`,
        browserInfo,
        threeDsAuthType: threeDsAuthType, // Solo para sandbox
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        autoRenewalEnabled
      };

      const result = await wompiService.processComplete3DSPayment(paymentRequest);

      res.json({
        success: true,
        data: {
          paymentId: result.payment.id,
          transactionId: result.wompiTransaction.id,
          status: result.wompiTransaction.status,
          scenario: result.processedResponse.scenario,
          requiresAction: result.processedResponse.requiresAction,
          nextAction: result.nextAction,
          
          // Datos específicos según el escenario
          ...(result.processedResponse.requiresAction && {
            challengeData: {
              htmlContent: result.processedResponse.challengeData,
              decodedIframe: result.processedResponse.decodedIframe,
              currentStep: result.processedResponse.currentStep,
              stepStatus: result.processedResponse.stepStatus
            }
          }),

          // Información del estado 3DS
          threeDSInfo: {
            authType: result.wompiTransaction.payment_method?.extra?.three_ds_auth_type,
            currentStep: result.processedResponse.currentStep,
            stepStatus: result.processedResponse.stepStatus,
            message: result.processedResponse.message
          }
        }
      });

    } catch (error) {
      console.error('Error creando pago 3DS v2:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Consultar el estado de una transacción 3DS v2
   * GET /api/payments/3ds/status/:transactionId
   */
  static async get3DSTransactionStatus(req, res) {
    try {
      const { transactionId } = req.params;
      const { businessId } = req.user;

      // Verificar que la transacción pertenece al negocio
      const payment = await SubscriptionPayment.findOne({
        where: {
          transactionId: transactionId
        },
        include: [{
          model: BusinessSubscription,
          as: 'subscription',
          where: { businessId }
        }]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada'
        });
      }

      const wompiService = new Wompi3DSService();
      const wompiTransaction = await wompiService.get3DSTransactionStatus(transactionId);
      const processedResponse = wompiService.process3DSTransactionResponse(wompiTransaction);

      // Actualizar estado en nuestra BD si ha cambiado
      if (wompiTransaction.status !== payment.status) {
        await wompiService.updatePayment3DSStatus(payment.id, wompiTransaction);
      }

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          transactionId: wompiTransaction.id,
          status: wompiTransaction.status,
          scenario: processedResponse.scenario,
          requiresAction: processedResponse.requiresAction,
          message: processedResponse.message,

          // Challenge data si está disponible
          ...(processedResponse.requiresAction && {
            challengeData: {
              htmlContent: processedResponse.challengeData,
              decodedIframe: processedResponse.decodedIframe
            }
          }),

          // Información detallada 3DS
          threeDSInfo: {
            authType: wompiTransaction.payment_method?.extra?.three_ds_auth_type,
            currentStep: processedResponse.currentStep,
            stepStatus: processedResponse.stepStatus,
            hasChallenge: !!wompiTransaction.payment_method?.extra?.three_ds_auth?.three_ds_method_data
          }
        }
      });

    } catch (error) {
      console.error('Error consultando estado 3DS:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de pagos 3DS para el dashboard
   * GET /api/payments/3ds/stats
   */
  static async getPaymentStats(req, res) {
    try {
      const { businessId } = req.user;

      const whereClause = {
        isThreeDsEnabled: true
      };
      
      const includeClause = [{
        model: BusinessSubscription,
        as: 'subscription'
      }];
      
      // Si no es OWNER, filtrar por businessId
      if (req.user.role !== 'OWNER') {
        includeClause[0].where = { businessId };
      }

      const stats = await SubscriptionPayment.findAll({
        where: whereClause,
        include: includeClause,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('SubscriptionPayment.id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const formattedStats = {
        total3DSPayments: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        completedPayments: stats.find(s => s.status === 'COMPLETED')?.count || 0,
        pendingPayments: stats.find(s => s.status === 'THREEDS_PENDING')?.count || 0,
        failedPayments: stats.find(s => ['FAILED', 'DECLINED', 'ERROR'].includes(s.status))?.count || 0
      };

      res.json({
        success: true,
        data: formattedStats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Finalizar proceso 3DS después del challenge
   */
  static async complete3DSProcess(req, res) {
    try {
      const { transactionId } = req.params;
      const ownerId = req.user.ownerId;
      const businessId = req.user.businessId;
      const wompiService = new Wompi3DSService();

      // Buscar el pago por transaction ID
      const payment = await SubscriptionPayment.findOne({
        where: {
          wompiTransactionId: transactionId,
          business_id: businessId
        }
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Transacción no encontrada'
        });
      }

      // Consultar estado final en Wompi
      const response = await wompiService.get3DSTransactionStatus(transactionId);

      if (response.success) {
        // Actualizar el pago con el estado final
        await payment.update({
          status: response.data.status,
          currentStep: response.data.step || 'completed',
          currentStepStatus: response.data.step_status || 'success',
          wompiTransactionReference: response.data.reference || payment.wompiTransactionReference,
          updatedAt: new Date()
        });

        res.json({
          success: true,
          data: {
            transactionId,
            status: response.data.status,
            step: response.data.step,
            reference: response.data.reference
          }
        });
      } else {
        res.status(400).json({
          error: 'Error al consultar estado de transacción',
          details: response.error
        });
      }
    } catch (error) {
      console.error('Error al completar proceso 3DS:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Procesar pago de renovación usando 3RI (3DS Requestor Initiated)
   */
  static async processRenewalPayment(req, res) {
    try {
      const { businessSubscriptionId } = req.params;
      const ownerId = req.user.ownerId;
      const businessId = req.user.businessId;
      const wompiService = new Wompi3DSService();

      // Buscar la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: {
          id: businessSubscriptionId,
          ownerId,
          businessId
        },
        include: [
          {
            model: SubscriptionPlan,
            as: 'plan'
          }
        ]
      });

      if (!subscription) {
        return res.status(404).json({
          error: 'Suscripción no encontrada'
        });
      }

      // Buscar el último pago exitoso para obtener el token de tarjeta
      const lastPayment = await SubscriptionPayment.findOne({
        where: {
          businessSubscriptionId,
          status: 'APPROVED',
          wompiPaymentMethod: { [Op.ne]: null }
        },
        order: [['createdAt', 'DESC']]
      });

      if (!lastPayment || !lastPayment.wompiPaymentMethod) {
        return res.status(400).json({
          error: 'No se encontró método de pago previo para renovación'
        });
      }

      // Crear transacción de renovación con 3RI
      const response = await wompiService.createRenewalTransaction({
        amount: subscription.plan.price,
        currency: 'COP',
        paymentMethod: lastPayment.wompiPaymentMethod,
        reference: `renewal_${businessSubscriptionId}_${Date.now()}`,
        subscriptionId: businessSubscriptionId
      });

      if (response.success) {
        // Crear registro de pago
        const payment = await SubscriptionPayment.create({
          businessSubscriptionId,
          business_id: businessId,
          amount: subscription.plan.price,
          currency: 'COP',
          status: 'PENDING',
          paymentType: 'renewal',
          wompiTransactionId: response.data.transactionId,
          wompiTransactionReference: response.data.reference,
          wompiPaymentMethod: lastPayment.wompiPaymentMethod,
          threeDsAuthType: '3RI',
          currentStep: 'processing',
          currentStepStatus: 'pending'
        });

        res.json({
          success: true,
          data: {
            paymentId: payment.id,
            transactionId: response.data.transactionId,
            reference: response.data.reference,
            status: 'processing'
          }
        });
      } else {
        res.status(400).json({
          error: 'Error al procesar renovación',
          details: response.error
        });
      }
    } catch (error) {
      console.error('Error al procesar renovación:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Listar métodos de pago guardados para el negocio
   */
  static async getPaymentMethods(req, res) {
    try {
      const ownerId = req.user.ownerId;
      const businessId = req.user.businessId;

      // Buscar pagos exitosos con métodos de pago únicos
      const payments = await SubscriptionPayment.findAll({
        where: {
          business_id: businessId,
          status: 'APPROVED',
          wompiPaymentMethod: { [Op.ne]: null }
        },
        attributes: [
          'wompiPaymentMethod',
          'createdAt',
          [Sequelize.fn('MAX', Sequelize.col('createdAt')), 'lastUsed']
        ],
        group: ['wompiPaymentMethod'],
        order: [[Sequelize.fn('MAX', Sequelize.col('createdAt')), 'DESC']]
      });

      const paymentMethods = payments.map(payment => ({
        token: payment.wompiPaymentMethod,
        lastUsed: payment.lastUsed,
        isActive: true // TODO: Implementar verificación de validez
      }));

      res.json({
        success: true,
        data: {
          paymentMethods,
          total: paymentMethods.length
        }
      });
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Deshabilitar auto-renovación
   */
  static async disableAutoRenewal(req, res) {
    try {
      const { paymentId } = req.params;
      const ownerId = req.user.ownerId;
      const businessId = req.user.businessId;

      // Buscar el pago
      const payment = await SubscriptionPayment.findOne({
        where: {
          id: paymentId,
          business_id: businessId
        }
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Pago no encontrado'
        });
      }

      // Buscar la suscripción asociada
      const subscription = await BusinessSubscription.findOne({
        where: {
          id: payment.businessSubscriptionId,
          ownerId,
          businessId
        }
      });

      if (!subscription) {
        return res.status(404).json({
          error: 'Suscripción no encontrada'
        });
      }

      // Deshabilitar auto-renovación
      await subscription.update({
        autoRenewal: false,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Auto-renovación deshabilitada correctamente',
        data: {
          subscriptionId: subscription.id,
          autoRenewal: false
        }
      });
    } catch (error) {
      console.error('Error al deshabilitar auto-renovación:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = Payment3DSController;