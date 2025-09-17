/**
 * Controlador específico para el rol OWNER
 * 
 * Contiene todas las funciones que solo puede ejecutar el administrador de la plataforma.
 * Estas funciones están basadas en la matriz de permisos del sistema.
 */

const { Op, Sequelize } = require('sequelize');
const Business = require('../models/Business');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BusinessSubscription = require('../models/BusinessSubscription');
const Module = require('../models/Module');
const PaginationService = require('../services/PaginationService');

class OwnerController {
  /**
   * 📊 ESTADÍSTICAS GLOBALES DE LA PLATAFORMA
   */
  static async getPlatformStats(req, res) {
    try {
      // Estadísticas de usuarios por rol
      const userStats = await User.findAll({
        attributes: [
          'role',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['role']
      });

      // Estadísticas de negocios
      const businessStats = await Business.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Estadísticas de suscripciones
      const subscriptionStats = await BusinessSubscription.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Total de ingresos (simplificado por ahora)
      const activeSubscriptionsCount = await BusinessSubscription.count({
        where: { status: 'ACTIVE' }
      });

      // Planes disponibles
      const totalPlans = await SubscriptionPlan.count({
        where: { status: 'ACTIVE' }
      });

      // Módulos disponibles
      const totalModules = await Module.count({
        where: { status: 'ACTIVE' }
      });

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          users: {
            byRole: userStats.map(stat => ({
              role: stat.role,
              count: parseInt(stat.dataValues.count)
            })),
            total: userStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0)
          },
          businesses: {
            byStatus: businessStats.map(stat => ({
              status: stat.status,
              count: parseInt(stat.dataValues.count)
            })),
            total: businessStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0)
          },
          subscriptions: {
            byStatus: subscriptionStats.map(stat => ({
              status: stat.status,
              count: parseInt(stat.dataValues.count)
            })),
            total: subscriptionStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0),
            activeCount: activeSubscriptionsCount
          },
          plans: {
            total: totalPlans
          },
          modules: {
            total: totalModules
          },
          platform: {
            lastUpdated: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de la plataforma:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de la plataforma',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * 🏢 GESTIÓN DE NEGOCIOS
   */
  
  // Listar todos los negocios con información de suscripción
  static async getAllBusinesses(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Business.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
            where: { role: 'BUSINESS' }, // Solo traer el propietario del negocio
            required: false
          },
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            attributes: ['id', 'status', 'startDate', 'endDate'],
            include: [{
              model: SubscriptionPlan,
              as: 'plan',
              attributes: ['id', 'name', 'price']
            }],
            where: { status: 'ACTIVE' },
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          businesses: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error al listar negocios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar negocios',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Crear negocio manualmente (registro administrativo)
  static async createBusinessManually(req, res) {
    try {
      const {
        businessName,
        businessEmail,
        businessPhone,
        address,
        city,
        country,
        ownerEmail,
        ownerFirstName,
        ownerLastName,
        ownerPhone,
        subscriptionPlanId
      } = req.body;

      // Verificar si el plan existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }

      // Verificar si ya existe un usuario con ese email
      let owner = await User.findOne({ where: { email: ownerEmail } });
      
      if (owner) {
        // Si existe, verificar que no tenga ya un negocio
        if (owner.businessId) {
          return res.status(400).json({
            success: false,
            message: 'El usuario ya tiene un negocio asociado'
          });
        }
        
        // Actualizar rol a BUSINESS
        await owner.update({ role: 'BUSINESS' });
      } else {
        // Crear nuevo usuario BUSINESS
        owner = await User.create({
          email: ownerEmail,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          phone: ownerPhone,
          role: 'BUSINESS',
          password: 'TempPassword123!', // Password temporal que debe cambiar
          emailVerified: false
        });
      }

      // Crear el negocio
      const business = await Business.create({
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address,
        city,
        country: country || 'Colombia',
        ownerId: owner.id,
        status: 'ACTIVE'
      });

      // Actualizar el usuario con el businessId
      await owner.update({ businessId: business.id });

      // Crear la suscripción
      const subscription = await BusinessSubscription.create({
        businessId: business.id,
        subscriptionPlanId: subscriptionPlanId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      });

      res.status(201).json({
        success: true,
        message: 'Negocio creado exitosamente',
        data: {
          business,
          owner: {
            id: owner.id,
            email: owner.email,
            firstName: owner.firstName,
            lastName: owner.lastName,
            role: owner.role
          },
          subscription
        }
      });
    } catch (error) {
      console.error('Error al crear negocio manualmente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el negocio',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Activar/Desactivar negocio
  static async toggleBusinessStatus(req, res) {
    try {
      const { businessId } = req.params;
      const { status, reason } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser ACTIVE, INACTIVE o SUSPENDED'
        });
      }

      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      await business.update({ 
        status,
        statusChangeReason: reason || null,
        statusChangedBy: req.user.id,
        statusChangedAt: new Date()
      });

      // Si se desactiva o suspende, también desactivar suscripciones
      if (status !== 'ACTIVE') {
        await BusinessSubscription.update(
          { status: 'SUSPENDED' },
          { where: { businessId: businessId, status: 'ACTIVE' } }
        );
      }

      res.json({
        success: true,
        message: `Negocio ${status.toLowerCase()} exitosamente`,
        data: business
      });
    } catch (error) {
      console.error('Error al cambiar estado del negocio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del negocio',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * 💳 GESTIÓN DE SUSCRIPCIONES
   */
  
  // Crear suscripción para un negocio
  static async createSubscription(req, res) {
    try {
      const { businessId, subscriptionPlanId, duration = 1 } = req.body;

      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que el plan existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }

      // Cancelar suscripciones activas existentes
      await BusinessSubscription.update(
        { status: 'CANCELLED', endDate: new Date() },
        { where: { businessId: businessId, status: 'ACTIVE' } }
      );

      // Crear nueva suscripción
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);

      const subscription = await BusinessSubscription.create({
        businessId,
        subscriptionPlanId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        paymentMethod: 'ADMIN_CREATED',
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Suscripción creada exitosamente',
        data: subscription
      });
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la suscripción',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Cancelar suscripción
  static async cancelSubscription(req, res) {
    try {
      const { subscriptionId } = req.params;
      const { reason } = req.body;

      const subscription = await BusinessSubscription.findByPk(subscriptionId);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada'
        });
      }

      await subscription.update({
        status: 'CANCELLED',
        endDate: new Date(),
        cancellationReason: reason || 'Cancelado por administrador',
        cancelledBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Suscripción cancelada exitosamente',
        data: subscription
      });
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la suscripción',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  /**
   * 💰 CREAR SUSCRIPCIÓN CON PAGO EFECTIVO (SOLO OWNER EN DESARROLLO)
   */
  static async createCashSubscription(req, res) {
    try {
      const { businessId, planId, months = 1, notes } = req.body;

      // Validar que el usuario sea Owner
      if (req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Solo el Owner puede crear suscripciones con pago efectivo'
        });
      }

      // Validar en desarrollo (opcional para flexibilidad)
      if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_CASH_PAYMENTS) {
        return res.status(403).json({
          success: false,
          message: 'Método de pago efectivo no disponible en producción'
        });
      }

      // Validar business
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Validar plan
      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan || plan.status !== 'ACTIVE') {
        return res.status(404).json({
          success: false,
          message: 'Plan no encontrado o inactivo'
        });
      }

      // Verificar si ya tiene una suscripción activa
      const existingSubscription = await BusinessSubscription.findOne({
        where: {
          businessId: businessId,
          status: 'ACTIVE'
        }
      });

      if (existingSubscription) {
        return res.status(409).json({
          success: false,
          message: 'El negocio ya tiene una suscripción activa. Cancele la existente primero.'
        });
      }

      // Calcular fechas
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      // Crear BusinessSubscription
      const subscription = await BusinessSubscription.create({
        businessId: businessId,
        planId: planId,
        status: 'ACTIVE',
        startDate: startDate,
        endDate: endDate,
        autoRenewal: false, // No auto-renovar pagos efectivos
        createdBy: req.user.id
      });

      // Crear SubscriptionPayment
      const totalAmount = plan.price * months;
      const { SubscriptionPayment } = require('../models');
      
      const payment = await SubscriptionPayment.create({
        subscriptionId: subscription.id,
        businessId: businessId,
        amount: totalAmount,
        currency: plan.currency || 'COP',
        status: 'APPROVED',
        paymentMethod: 'CASH',
        wompiTransactionId: `CASH-${Date.now()}-${businessId.slice(-8)}`,
        wompiReference: `CASH_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        paidAt: new Date(),
        description: `Pago efectivo - ${months} mes(es) - Plan ${plan.name}`,
        notes: notes || 'Pago efectivo creado por Owner para desarrollo'
      });

      // Obtener datos completos para respuesta
      const fullSubscription = await BusinessSubscription.findByPk(subscription.id, {
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price', 'currency', 'features', 'limits']
          }
        ]
      });

      console.log(`💰 Suscripción efectivo creada: ${subscription.id} para ${business.businessName}`);

      return res.status(201).json({
        success: true,
        message: 'Suscripción con pago efectivo creada exitosamente',
        data: {
          subscription: {
            id: subscription.id,
            businessId: business.id,
            businessName: business.businessName,
            planId: plan.id,
            planName: plan.name,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            months: months,
            autoRenewal: subscription.autoRenewal,
            createdBy: req.user.id
          },
          payment: {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.paymentMethod,
            status: payment.status,
            transactionId: payment.wompiTransactionId,
            reference: payment.wompiReference,
            paidAt: payment.paidAt
          },
          development: {
            environment: process.env.NODE_ENV || 'development',
            ownerCreated: true,
            note: 'Funcionalidad disponible para Owner en desarrollo'
          }
        }
      });

    } catch (error) {
      console.error('Error creando suscripción efectivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = OwnerController;