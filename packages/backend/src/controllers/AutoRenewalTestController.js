/**
 * Controlador para Testing y Administración de Auto-renovación
 * Solo para uso en desarrollo y testing
 */

const AutoRenewalService = require('../services/AutoRenewalService');
const CronJobManager = require('../utils/CronJobManager');
const { BusinessSubscription, Business, SubscriptionPlan, SavedPaymentMethod } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     AutoRenewalResult:
 *       type: object
 *       properties:
 *         processed:
 *           type: integer
 *           description: Cantidad de renovaciones procesadas
 *         successful:
 *           type: integer
 *           description: Renovaciones exitosas
 *         failed:
 *           type: integer
 *           description: Renovaciones fallidas
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *                 format: uuid
 *               businessName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *               error:
 *                 type: string
 *                 description: Mensaje de error si falló
 */

class AutoRenewalTestController {
  
  /**
   * @swagger
   * /api/test/auto-renewal/run:
   *   post:
   *     summary: 🔄 Ejecutar auto-renovación manual
   *     description: Ejecuta el proceso de auto-renovación manualmente para testing
   *     tags: [🔄 Auto-Renovación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Auto-renovación ejecutada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Auto-renovación ejecutada manualmente"
   *                 data:
   *                   $ref: '#/components/schemas/AutoRenewalResult'
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error ejecutando auto-renovación
   */
  static async runManualAutoRenewal(req, res) {
    try {
      const result = await AutoRenewalService.processAutoRenewals();
      
      res.json({
        success: true,
        message: 'Auto-renovación ejecutada manualmente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error en auto-renovación manual:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando auto-renovación',
        error: error.message
      });
    }
  }
  
  /**
   * Ejecutar reintentos de pagos manualmente
   */
  static async runManualPaymentRetries(req, res) {
    try {
      await AutoRenewalService.processPaymentRetries();
      
      res.json({
        success: true,
        message: 'Reintentos de pagos ejecutados manualmente'
      });
    } catch (error) {
      console.error('❌ Error en reintentos manuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando reintentos',
        error: error.message
      });
    }
  }
  
  /**
   * Ejecutar notificaciones manualmente
   */
  static async runManualNotifications(req, res) {
    try {
      await AutoRenewalService.notifyUpcomingExpirations();
      
      res.json({
        success: true,
        message: 'Notificaciones enviadas manualmente'
      });
    } catch (error) {
      console.error('❌ Error en notificaciones manuales:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificaciones',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener suscripciones próximas a vencer
   */
  static async getExpiringSubscriptions(req, res) {
    try {
      const subscriptions = await AutoRenewalService.getExpiringTrialSubscriptions();
      
      res.json({
        success: true,
        message: 'Suscripciones próximas a vencer obtenidas',
        data: {
          count: subscriptions.length,
          subscriptions: subscriptions.map(sub => ({
            id: sub.id,
            businessName: sub.business.name,
            businessEmail: sub.business.email,
            planName: sub.plan.name,
            status: sub.status,
            endDate: sub.endDate,
            daysRemaining: Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24))
          }))
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo suscripciones próximas a vencer:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo suscripciones',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener estadísticas de auto-renovación
   */
  static async getAutoRenewalStats(req, res) {
    try {
      const { Op } = require('sequelize');
      
      // Contar suscripciones por estado con validación
      const stats = {};
      
      try {
        stats.total = await BusinessSubscription.count() || 0;
      } catch (error) {
        console.error('Error counting total:', error);
        stats.total = 0;
      }
      
      try {
        stats.active = await BusinessSubscription.count({ where: { status: 'ACTIVE' } }) || 0;
      } catch (error) {
        console.error('Error counting active:', error);
        stats.active = 0;
      }
      
      try {
        stats.trial = await BusinessSubscription.count({ where: { status: 'TRIAL' } }) || 0;
      } catch (error) {
        console.error('Error counting trial:', error);
        stats.trial = 0;
      }
      
      try {
        stats.suspended = await BusinessSubscription.count({ where: { status: 'SUSPENDED' } }) || 0;
      } catch (error) {
        console.error('Error counting suspended:', error);
        stats.suspended = 0;
      }
      
      try {
        stats.cancelled = await BusinessSubscription.count({ where: { status: 'CANCELED' } }) || 0;
      } catch (error) {
        console.error('Error counting cancelled:', error);
        stats.cancelled = 0;
      }
      
      try {
        stats.overdue = await BusinessSubscription.count({ where: { status: 'OVERDUE' } }) || 0;
      } catch (error) {
        console.error('Error counting overdue:', error);
        stats.overdue = 0;
      }
      
      // Suscripciones próximas a vencer (próximos 7 días)
      try {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        stats.expiringNextWeek = await BusinessSubscription.count({
          where: {
            status: 'TRIAL',
            endDate: {
              [Op.lte]: nextWeek
            }
          }
        }) || 0;
      } catch (error) {
        console.error('Error counting expiring:', error);
        stats.expiringNextWeek = 0;
      }
      
      // Métodos de pago guardados (temporalmente deshabilitado hasta crear la tabla)
      // try {
      //   stats.savedPaymentMethods = await SavedPaymentMethod.count({
      //     where: { isActive: true }
      //   }) || 0;
      // } catch (error) {
      //   console.error('Error counting payment methods:', error);
      //   stats.savedPaymentMethods = 0;
      // }
      stats.savedPaymentMethods = 0; // Temporalmente hardcoded
      
      // Suscripciones con auto-renovación (simplificado)
      try {
        stats.autoRenewed = await BusinessSubscription.count({
          where: {
            status: 'ACTIVE'
          }
        }) || 0;
      } catch (error) {
        console.error('Error counting auto-renewed:', error);
        stats.autoRenewed = 0;
      }

      res.json({
        success: true,
        message: 'Estadísticas de auto-renovación obtenidas',
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
  
  /**
   * Simular creación de método de pago para testing
   */
  static async createTestPaymentMethod(req, res) {
    try {
      const { businessId, cardLastFour = '1234', cardBrand = 'VISA' } = req.body;
      
      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId es requerido'
        });
      }
      
      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }
      
      // Crear método de pago de prueba
      const paymentMethod = await SavedPaymentMethod.create({
        businessId,
        paymentProvider: 'WOMPI',
        providerToken: `test_token_${Date.now()}`,
        cardLastFour,
        cardBrand,
        cardExpiryMonth: 12,
        cardExpiryYear: new Date().getFullYear() + 2,
        isDefault: true,
        isActive: true,
        customerReference: `test_customer_${businessId}`,
        metadata: {
          test: true,
          created_for_testing: true
        }
      });
      
      res.json({
        success: true,
        message: 'Método de pago de prueba creado',
        data: paymentMethod
      });
      
    } catch (error) {
      console.error('❌ Error creando método de pago de prueba:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando método de pago',
        error: error.message
      });
    }
  }
  
  /**
   * Forzar una suscripción específica a estado TRIAL próximo a vencer (para testing)
   */
  static async forceSubscriptionToExpireSoon(req, res) {
    try {
      // Puede recibir subscriptionId por params (PUT) o por body (POST)
      const subscriptionId = req.params.subscriptionId || req.body.subscriptionId;
      
      if (!subscriptionId) {
        // Si no se proporciona ID específico, buscar la primera suscripción activa disponible
        const firstActiveSubscription = await BusinessSubscription.findOne({
          where: {
            status: ['ACTIVE', 'TRIAL']
          },
          order: [['createdAt', 'ASC']]
        });
        
        if (!firstActiveSubscription) {
          return res.status(404).json({
            success: false,
            message: 'No se encontraron suscripciones activas para modificar'
          });
        }
        
        const subscription = firstActiveSubscription;
        
        // Establecer fecha de vencimiento para mañana
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        await subscription.update({
          status: 'TRIAL',
          endDate: tomorrow,
          metadata: {
            ...subscription.metadata,
            forced_for_testing: true,
            original_end_date: subscription.endDate
          }
        });
        
        return res.json({
          success: true,
          message: 'Suscripción configurada para vencer pronto',
          data: {
            id: subscription.id,
            newEndDate: tomorrow,
            status: subscription.status
          }
        });
      }
      
      const subscription = await BusinessSubscription.findByPk(subscriptionId);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }
      
      // Establecer fecha de vencimiento para mañana
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await subscription.update({
        status: 'TRIAL',
        endDate: tomorrow,
        metadata: {
          ...subscription.metadata,
          forced_for_testing: true,
          original_end_date: subscription.endDate
        }
      });
      
      res.json({
        success: true,
        message: 'Suscripción configurada para vencer pronto',
        data: {
          id: subscription.id,
          newEndDate: tomorrow,
          status: subscription.status
        }
      });
      
    } catch (error) {
      console.error('❌ Error configurando suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error configurando suscripción',
        error: error.message
      });
    }
  }
  
  /**
   * Crear suscripción de prueba para testing
   */
  static async createTestSubscription(req, res) {
    try {
      const { businessId, planId, daysUntilExpiry = 30 } = req.body;
      
      // Crear o encontrar un business de prueba
      let business;
      if (businessId) {
        business = await Business.findByPk(businessId);
      } else {
        // Buscar cualquier business existente o crear uno de prueba
        business = await Business.findOne();
        if (!business) {
          business = await Business.create({
            name: 'Business de Prueba',
            email: 'test@example.com',
            phone: '1234567890',
            address: 'Dirección de prueba',
            ownerName: 'Owner de Prueba'
          });
        }
      }
      
      // Crear o encontrar un plan de prueba
      let plan;
      if (planId) {
        plan = await SubscriptionPlan.findByPk(planId);
      } else {
        plan = await SubscriptionPlan.findOne();
        if (!plan) {
          plan = await SubscriptionPlan.create({
            name: 'Plan de Prueba',
            description: 'Plan básico para testing',
            price: 50000,
            duration: 30,
            isActive: true,
            features: {
              maxUsers: 5,
              maxClients: 100,
              maxAppointments: 500
            }
          });
        }
      }
      
      // Crear fecha de vencimiento
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(daysUntilExpiry));
      
      // Crear suscripción de prueba
      const subscription = await BusinessSubscription.create({
        businessId: business.id,
        planId: plan.id,
        status: 'TRIAL',
        startDate: new Date(),
        endDate: endDate,
        price: plan.price,
        metadata: {
          created_for_testing: true,
          auto_renewal_enabled: true
        }
      });
      
      res.json({
        success: true,
        message: 'Suscripción de prueba creada exitosamente',
        data: {
          subscription: {
            id: subscription.id,
            businessId: subscription.businessId,
            planId: subscription.planId,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            price: subscription.price
          },
          business: {
            id: business.id,
            name: business.name,
            email: business.email
          },
          plan: {
            id: plan.id,
            name: plan.name,
            price: plan.price
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error creando suscripción de prueba:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando suscripción de prueba',
        error: error.message
      });
    }
  }
}

module.exports = AutoRenewalTestController;