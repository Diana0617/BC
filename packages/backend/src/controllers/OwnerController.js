/**
 * Controlador específico para el rol OWNER
 * 
 * Contiene todas las funciones que solo puede ejecutar el administrador de la plataforma.
 * Estas funciones están basadas en la matriz de permisos del sistema.
 */

const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const Business = require('../models/Business');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BusinessSubscription = require('../models/BusinessSubscription');
const SubscriptionPayment = require('../models/SubscriptionPayment');
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
        businessCode,
        address,
        city,
        country,
        ownerEmail,
        ownerFirstName,
        ownerLastName,
        ownerPhone,
        ownerPassword,
        subscriptionPlanId,
        billingCycle = 'MONTHLY' // MONTHLY o ANNUAL - default MONTHLY
      } = req.body;

      console.log('📋 Datos recibidos para crear negocio:', {
        businessName,
        businessCode,
        ownerEmail,
        ownerPassword: ownerPassword ? '***PROVIDED***' : 'NOT_PROVIDED',
        subscriptionPlanId,
        billingCycle
      });

      // Verificar si el plan existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }

      // Validar billingCycle
      if (!['MONTHLY', 'ANNUAL'].includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          message: 'billingCycle debe ser MONTHLY o ANNUAL'
        });
      }

      // Calcular precio según el ciclo de facturación
      let finalPrice;
      let finalDuration;
      let finalDurationType;

      if (billingCycle === 'ANNUAL') {
        finalPrice = plan.annualPrice || (plan.monthlyPrice || plan.price);
        finalDuration = 1;
        finalDurationType = 'YEARS';
      } else {
        // MONTHLY
        finalPrice = plan.monthlyPrice || plan.price;
        finalDuration = plan.duration;
        finalDurationType = plan.durationType;
      }

      console.log('📋 Plan encontrado:', {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        billingCycle,
        finalPrice,
        finalDuration,
        finalDurationType
      });

      // Validar y preparar el subdomain (businessCode)
      if (!businessCode) {
        return res.status(400).json({
          success: false,
          message: 'El código del negocio (subdomain) es requerido'
        });
      }

      // Normalizar el businessCode: solo letras minúsculas y números
      const normalizedSubdomain = businessCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (normalizedSubdomain !== businessCode) {
        return res.status(400).json({
          success: false,
          message: 'El código del negocio solo puede contener letras minúsculas y números, sin espacios ni caracteres especiales'
        });
      }

      // Verificar que el subdomain no exista
      const existingSubdomain = await Business.findOne({
        where: { subdomain: normalizedSubdomain }
      });

      if (existingSubdomain) {
        return res.status(409).json({
          success: false,
          message: `El código '${normalizedSubdomain}' ya está en uso. Por favor elige otro.`
        });
      }

      // Verificar si ya existe un usuario con ese email
      let owner = await User.findOne({ 
        where: { email: ownerEmail },
        include: [{ model: Business, as: 'business' }]
      });
      
      if (owner) {
        console.log('👤 Usuario existente encontrado:', {
          id: owner.id,
          email: owner.email,
          businessId: owner.businessId,
          hasBusiness: !!owner.business
        });
        
        // Si tiene negocio, permitir recreación (caso de testing/desarrollo)
        if (owner.businessId && owner.business) {
          console.log('⚠️ Usuario ya tiene negocio. En desarrollo, se permite recreación.');
          // En desarrollo, limpiar la relación para permitir recreación
          await owner.update({ businessId: null });
        }
        
        // Actualizar contraseña si se proporciona
        if (ownerPassword) {
          console.log('🔐 Actualizando contraseña del usuario existente...');
          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(ownerPassword, salt);
          await owner.update({ password: hashedPassword });
          console.log('✅ Contraseña actualizada');
        }
        
        // Actualizar rol a BUSINESS
        await owner.update({ role: 'BUSINESS' });
      } else {
        console.log('👤 Creando nuevo usuario...');
        // Usar la contraseña del formulario o una temporal si no se proporciona
        const passwordToUse = ownerPassword || 'TempPassword123!';
        
        // Hashear la contraseña antes de crear el usuario
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(passwordToUse, salt);
        
        // Crear nuevo usuario BUSINESS
        owner = await User.create({
          email: ownerEmail.toLowerCase(), // Normalizar email a minúsculas
          firstName: ownerFirstName,
          lastName: ownerLastName,
          phone: ownerPhone,
          role: 'BUSINESS',
          password: hashedPassword,
          emailVerified: false
        });
        console.log('👤 Usuario creado:', owner.id);
      }

      // Crear el negocio
      console.log('🏢 Creando negocio...');
      const business = await Business.create({
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address,
        city,
        country: country || 'Colombia',
        businessCode: normalizedSubdomain,
        subdomain: normalizedSubdomain,
        ownerId: owner.id,
        status: 'ACTIVE'
      });
      console.log('🏢 Negocio creado:', business.id);

      // Actualizar el usuario con el businessId
      await owner.update({ businessId: business.id });
      console.log('👤 Usuario actualizado con businessId');

      // Crear la suscripción
      console.log('📝 Creando suscripción con datos:', {
        businessId: business.id,
        subscriptionPlanId: subscriptionPlanId,
        amount: finalPrice,
        currency: plan.currency,
        paymentMethod: 'CASH',
        trialDays: plan.trialDays,
        billingCycle
      });

      // Calcular trialEndDate si el plan tiene días de prueba
      const trialEndDate = plan.trialDays > 0 
        ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
        : null;

      // Calcular endDate según la duración calculada (finalDuration/finalDurationType)
      const endDate = new Date();
      switch (finalDurationType) {
        case 'MONTHS':
          endDate.setMonth(endDate.getMonth() + finalDuration);
          break;
        case 'YEARS':
          endDate.setFullYear(endDate.getFullYear() + finalDuration);
          break;
        case 'WEEKS':
          endDate.setDate(endDate.getDate() + (finalDuration * 7));
          break;
        case 'DAYS':
          endDate.setDate(endDate.getDate() + finalDuration);
          break;
        default:
          // Fallback: 30 días
          endDate.setDate(endDate.getDate() + 30);
      }
      
      // Si tiene trial, crear como TRIAL, sino como ACTIVE (pago efectivo ya confirmado)
      const subscriptionStatus = plan.trialDays > 0 ? 'TRIAL' : 'ACTIVE';
      
      const subscription = await BusinessSubscription.create({
        businessId: business.id,
        subscriptionPlanId: subscriptionPlanId,
        amount: finalPrice,
        currency: plan.currency,
        status: subscriptionStatus,
        startDate: new Date(),
        endDate: endDate,
        trialEndDate: trialEndDate,
        paymentMethod: 'CASH',
        billingCycle: billingCycle
      });
      
      console.log(`📝 Suscripción creada: ${subscription.id} - Status: ${subscriptionStatus}, Ciclo: ${billingCycle}, Trial hasta: ${trialEndDate ? trialEndDate.toISOString() : 'N/A'}, Duración: ${finalDuration} ${finalDurationType}`);

      // Crear el registro de pago para el pago efectivo
      console.log('💰 Creando registro de pago...');
      const payment = await SubscriptionPayment.create({
        businessSubscriptionId: subscription.id,
        amount: finalPrice,
        currency: plan.currency,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        paidAt: new Date(),
        dueDate: new Date(),
        netAmount: finalPrice,
        commissionFee: 0,
        description: `Pago efectivo para suscripción al plan ${plan.name} - Ciclo: ${billingCycle}`,
        notes: 'Pago creado manualmente por Owner desde panel administrativo',
        paymentAttempts: 1,
        lastAttemptAt: new Date(),
        maxAttempts: 1
      });
      console.log('💰 Pago creado:', payment.id);

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
          subscription,
          payment
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