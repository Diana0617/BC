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

  /**
   * Crear pago 3DS v2 público para registro (sin autenticación)
   * POST /api/subscriptions/3ds/create
   */
  static async createPublic3DSPayment(req, res) {
    try {
      const { 
        businessCode, // Para registro nuevo
        subscriptionPlanId,
        customerEmail,
        amount,
        currency = 'COP',
        description,
        cardToken, // Token de la tarjeta
        acceptanceToken, // Token de aceptación de términos
        browserInfo,
        threeDsAuthType = 'challenge_v2', // Para testing - valor correcto según documentación Wompi
        registrationData // Datos completos del negocio y usuario para crear después del pago
      } = req.body;

      // Validaciones
      if (!businessCode || !subscriptionPlanId || !customerEmail || !amount || !cardToken || !acceptanceToken || !browserInfo || !registrationData) {
        return res.status(400).json({
          success: false,
          error: 'businessCode, subscriptionPlanId, customerEmail, amount, cardToken, acceptanceToken, browserInfo y registrationData son requeridos'
        });
      }

      // Verificar que el plan existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Plan de suscripción no encontrado'
        });
      }

      // Verificar que el businessCode no existe
      const existingBusiness = await Business.findOne({
        where: { subdomain: businessCode }
      });
      if (existingBusiness) {
        return res.status(409).json({
          success: false,
          error: 'El código de negocio ya existe'
        });
      }

      console.log('🔐 Creando transacción 3DS v2 pública para registro:', {
        businessCode,
        customerEmail,
        amount,
        planId: subscriptionPlanId,
        hasCardToken: !!cardToken,
        hasAcceptanceToken: !!acceptanceToken,
        hasBrowserInfo: !!browserInfo,
        threeDsAuthTypeReceived: threeDsAuthType,
        threeDsAuthTypeFromBody: req.body.threeDsAuthType
      });

      // DEBUG: Verificar browserInfo detalladamente
      console.log('🌐 DEBUG - browserInfo recibido:', {
        browserInfo: browserInfo,
        keys: browserInfo ? Object.keys(browserInfo) : 'NULL',
        values: browserInfo ? browserInfo : 'NULL'
      });

      const wompiService = new Wompi3DSService();

      // Generar referencia única para la transacción
      const reference = `BC_REGISTER_${businessCode}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Preparar datos para Wompi 3DS
      const transactionData = {
        token: cardToken, // Token de la tarjeta
        acceptanceToken: acceptanceToken, // Token de aceptación
        amountInCents: parseInt(amount),
        currency: currency,
        customerEmail: customerEmail,
        customerName: registrationData?.userData?.firstName && registrationData?.userData?.lastName 
          ? `${registrationData.userData.firstName} ${registrationData.userData.lastName}`
          : registrationData?.userData?.firstName 
          ? registrationData.userData.firstName
          : customerEmail.split('@')[0] || 'Usuario BC',
        reference: reference,
        browserInfo: browserInfo,
        threeDsAuthType: 'challenge_v2' // Forzar valor correcto independiente del frontend
      };

      const result = await wompiService.create3DSTransaction(transactionData);

      console.log('✅ Transacción 3DS creada exitosamente en Wompi:', {
        transactionId: result.id,
        reference: reference,
        status: result.status,
        payment_link_id: result.payment_link_id
      });

      // Crear SubscriptionPayment para el flujo público (sin BusinessSubscription aún)
      const subscriptionPayment = await SubscriptionPayment.create({
        businessSubscriptionId: null, // Se asignará después al crear el negocio
        transactionId: result.id,
        reference: reference,
        amount: amount,
        currency: currency,
        paymentMethod: 'WOMPI_3DS',
        netAmount: amount,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        method: '3DS_V2',
        status: 'PENDING',
        wompiData: result,
        metadata: {
          type: 'PUBLIC_REGISTRATION',
          businessCode: businessCode,
          subscriptionPlanId: subscriptionPlanId,
          registrationData: registrationData,
          browserInfo: browserInfo,
          threeDsAuthType: 'challenge_v2',
          isTemporary: true,
          wompiReference: reference
        }
      });

      console.log('✅ SubscriptionPayment creado para registro público:', {
        id: subscriptionPayment.id,
        transactionId: subscriptionPayment.transactionId,
        amount: subscriptionPayment.amount,
        status: subscriptionPayment.status
      });

      // Respuesta para el frontend
      res.json({
        success: true,
        data: {
          transaction: {
            id: result.id,
            reference: reference,
            status: result.status,
            amount: amount,
            currency: currency
          },
          threeds: {
            challenge_required: result.payment_link_id ? true : false,
            challenge_url: result.payment_link_id ? `${process.env.WOMPI_BASE_URL}/payment_links/${result.payment_link_id}` : null,
            iframe_required: result.three_ds_auth?.iframe_challenge_url ? true : false,
            iframe_url: result.three_ds_auth?.iframe_challenge_url || null
          },
          next_steps: {
            action: result.payment_link_id ? 'redirect' : 'wait',
            url: result.payment_link_id ? `${process.env.WOMPI_BASE_URL}/payment_links/${result.payment_link_id}` : null,
            message: result.payment_link_id ? 
              'Redirigir al usuario a la URL de challenge 3DS' : 
              'Polling del estado de la transacción'
          }
        }
      });

      // 🤖 Auto-simulación en ambiente de test/sandbox (opcional)
      console.log('🔍 DEBUG Auto-simulación:', {
        NODE_ENV: process.env.NODE_ENV,
        WOMPI_ENVIRONMENT: process.env.WOMPI_ENVIRONMENT,
        AUTO_SIMULATE_PAYMENTS: process.env.AUTO_SIMULATE_PAYMENTS,
        shouldAutoSimulate: process.env.WOMPI_ENVIRONMENT !== 'production' && process.env.AUTO_SIMULATE_PAYMENTS === 'true'
      });
      
      if (process.env.WOMPI_ENVIRONMENT !== 'production' && process.env.AUTO_SIMULATE_PAYMENTS === 'true') {
        console.log('🤖 Programando auto-simulación para ambiente de test/sandbox...');
        setTimeout(async () => {
          try {
            const TestingController = require('./TestingController');
            const mockReq = {
              params: { transactionId: result.id },
              body: { amount, currency, status: 'APPROVED' }
            };
            const mockRes = {
              status: () => ({ json: (data) => console.log('🤖 Auto-simulado:', data) }),
              json: (data) => console.log('🤖 Auto-simulación exitosa:', data)
            };
            await TestingController.simulateApprovedPayment(mockReq, mockRes);
          } catch (err) {
            console.log('🤖 Error en auto-simulación:', err.message);
          }
        }, 15000); // 15 segundos después
      }

    } catch (error) {
      console.error('Error creando pago 3DS v2 público:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Consultar estado de transacción 3DS v2 pública
   * GET /api/subscriptions/3ds/status/:transactionId
   */
  static async getPublic3DSTransactionStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'transactionId es requerido'
        });
      }

      console.log('📊 Consultando estado 3DS v2 público:', transactionId);

      // Buscar el pago temporal con metadata type correcto
      const payment = await SubscriptionPayment.findOne({
        where: { 
          transactionId: transactionId
        }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada'
        });
      }

      console.log('💾 Pago encontrado en BD:', {
        id: payment.id,
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        metadataType: payment.metadata?.type
      });

      // Si el pago ya está aprobado en BD, no consultar Wompi (auto-simulación completada)
      if (payment.status === 'APPROVED') {
        console.log('✅ Pago ya aprobado en BD - devolviendo estado exitoso');
        
        // Recargar el pago para obtener metadata actualizado
        await payment.reload();
        
        console.log('🔍 Metadata al devolver estado:', {
          businessCreated: payment.metadata?.businessCreated,
          metadata: payment.metadata
        });
        
        return res.json({
          success: true,
          data: {
            transaction: {
              id: transactionId,
              reference: payment.reference,
              status: payment.status,
              amount: payment.amount,
              currency: payment.currency
            },
            wompi: {
              status: 'APPROVED',
              status_message: 'Pago simulado y aprobado',
              created_at: payment.createdAt,
              finalized_at: payment.updatedAt
            },
            business_creation: {
              required: true,
              completed: payment.metadata?.businessCreated || false,
              // Incluir datos de autenticación si el negocio fue creado
              business: payment.metadata?.businessCreated ? payment.metadata?.business : null,
              user: payment.metadata?.businessCreated ? payment.metadata?.user : null,
              token: payment.metadata?.businessCreated ? payment.metadata?.token : null
            }
          }
        });
      }

      // Consultar estado en Wompi solo si está pendiente
      const wompiService = new Wompi3DSService();
      const wompiTransaction = await wompiService.get3DSTransactionStatus(transactionId);
      
      console.log('🌐 Estado actual en Wompi:', {
        transactionId: wompiTransaction.id,
        status: wompiTransaction.status,
        currentStep: wompiTransaction.current_step,
        stepStatus: wompiTransaction.step_status
      });

      // Actualizar estado del pago local
      await payment.update({
        status: wompiTransaction.status === 'APPROVED' ? 'APPROVED' : 
                wompiTransaction.status === 'DECLINED' ? 'DECLINED' : 
                wompiTransaction.status === 'VOIDED' ? 'VOIDED' : 'PENDING',
        wompiData: wompiTransaction,
        updatedAt: new Date()
      });

      console.log('✅ Estado actualizado en BD:', payment.status);

      // Si el pago fue aprobado, crear el negocio y suscripción
      if (wompiTransaction.status === 'APPROVED' && payment.metadata?.businessData) {
        console.log('✅ Pago aprobado - iniciando creación de negocio');
        
        try {
          // Usar el SubscriptionController para crear el negocio completo
          const businessData = payment.metadata.businessData;
          const paymentData = {
            transactionId: transactionId,
            amount: payment.amount,
            currency: payment.currency,
            method: 'WOMPI_3DS', // Corregir: usar valor válido del enum
            status: 'APPROVED'
          };

          // Crear el negocio usando el método createCompleteSubscription
          const SubscriptionController = require('./SubscriptionController');
          const creationResult = await SubscriptionController.createCompleteSubscription({
            businessData: businessData,
            paymentData: paymentData,
            invitationToken: payment.metadata.invitationToken || 'auto-generated',
            acceptedTerms: payment.metadata.acceptedTerms || true
          });
          
          console.log('✅ Negocio creado exitosamente después del pago 3DS');
          
          // Actualizar el pago con el resultado
          await payment.update({
            businessSubscriptionId: creationResult.subscription?.id,
            metadata: {
              ...payment.metadata,
              businessCreated: true,
              businessId: creationResult.business?.id
            }
          });
          
        } catch (creationError) {
          console.error('❌ Error creando negocio después del pago:', creationError);
          // No fallar la respuesta, el pago fue exitoso
        }
      }

      res.json({
        success: true,
        data: {
          transaction: {
            id: transactionId,
            reference: payment.reference,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency
          },
          wompi: {
            status: wompiTransaction.status,
            status_message: wompiTransaction.status_message,
            created_at: wompiTransaction.created_at,
            finalized_at: wompiTransaction.finalized_at
          },
          business_creation: {
            required: wompiTransaction.status === 'APPROVED',
            completed: payment.metadata?.businessCreated || false
          }
        }
      });

    } catch (error) {
      console.error('Error consultando estado 3DS v2 público:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

module.exports = Payment3DSController;