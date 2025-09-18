const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const Business = require('../models/Business');
const BusinessRules = require('../models/BusinessRules');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BusinessSubscription = require('../models/BusinessSubscription');
const SubscriptionPayment = require('../models/SubscriptionPayment');
const AuthController = require('./AuthController');

/**
 * Controlador de Negocios para Beauty Control
 * Maneja creación, actualización y gestión de negocios
 */
class BusinessController {
  
  static async createBusiness(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🔄 Iniciando creación de negocio...');
      const {
        // Datos del negocio
        name,
        description,
        email,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        website,
        subdomain,
        subscriptionPlanId,
        // Datos del usuario administrador
        userEmail,
        userPassword,
        firstName,
        lastName,
        // TODO: Agregar validación de pago aquí
        paymentConfirmation
      } = req.body;

      console.log('📝 Datos recibidos:', { name, email, userEmail, subscriptionPlanId });

      // Validaciones básicas
      if (!name || !email || !subscriptionPlanId || !userEmail || !userPassword || !firstName || !lastName) {
        await transaction.rollback();
        console.log('❌ Faltan campos requeridos');
        return res.status(400).json({
          success: false,
          error: 'Los campos name, email, subscriptionPlanId, userEmail, userPassword, firstName y lastName son requeridos'
        });
      }

      // Verificar que el email del usuario no esté registrado
      console.log('🔍 Verificando email del usuario...');
      const existingUser = await User.findOne({
        where: { email: userEmail }
      });

      if (existingUser) {
        await transaction.rollback();
        console.log('❌ Email del usuario ya existe');
        return res.status(409).json({
          success: false,
          error: 'El email del usuario ya está registrado'
        });
      }

      // Verificar que el email del negocio no esté registrado
      console.log('🔍 Verificando email del negocio...');
      const existingBusiness = await Business.findOne({
        where: { email: email }
      });

      if (existingBusiness) {
        await transaction.rollback();
        console.log('❌ Email del negocio ya existe');
        return res.status(409).json({
          success: false,
          error: 'El email del negocio ya está registrado'
        });
      }

      // Verificar que el plan de suscripción existe
      console.log('🔍 Verificando plan de suscripción...');
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        await transaction.rollback();
        console.log('❌ Plan no encontrado');
        return res.status(404).json({
          success: false,
          error: 'Plan de suscripción no encontrado'
        });
      }
      console.log('✅ Plan encontrado:', plan.name);

      // Verificar disponibilidad del subdominio si se proporciona
      if (subdomain) {
        console.log('🔍 Verificando subdominio...');
        const { isSubdomainAvailable } = require('../middleware/subdomain');
        const available = await isSubdomainAvailable(subdomain);
        
        if (!available) {
          await transaction.rollback();
          console.log('❌ Subdominio no disponible');
          return res.status(409).json({
            success: false,
            error: 'El subdominio no está disponible'
          });
        }
        console.log('✅ Subdominio disponible');
      }

      // TODO: Aquí validar el pago antes de continuar
      // if (!paymentConfirmation || !validatePayment(paymentConfirmation)) {
      //   return res.status(402).json({
      //     success: false,
      //     error: 'Pago no confirmado o inválido'
      //   });
      // }

      // Crear el negocio
      console.log('🏢 Creando negocio...');
      const business = await Business.create({
        name,
        description,
        email,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        website,
        subdomain,
        currentPlanId: subscriptionPlanId,
        status: 'TRIAL', // Inicia en trial
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }, { transaction });
      console.log('✅ Negocio creado con ID:', business.id);

      // Encriptar contraseña del usuario
      console.log('🔐 Encriptando contraseña...');
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      // Crear el usuario administrador del negocio
      console.log('👤 Creando usuario...');
      const user = await User.create({
        firstName,
        lastName,
        email: userEmail,
        password: hashedPassword,
        role: 'BUSINESS',
        businessId: business.id,
        isActive: true
      }, { transaction });
      console.log('✅ Usuario creado con ID:', user.id);

      // Crear reglas predeterminadas del negocio (opcional - se pueden crear después)
      // await BusinessRules.create({
      //   businessId: business.id,
      //   ruleKey: 'DEFAULT_SETUP',
      //   ruleValue: { configured: false },
      //   description: 'Configuración inicial del negocio',
      //   category: 'GENERAL'
      // }, { transaction });

      // Crear la suscripción del negocio
      console.log('📋 Creando suscripción...');
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.durationType === 'MONTHS' ? plan.duration : 1));
      
      const subscription = await BusinessSubscription.create({
        businessId: business.id,
        subscriptionPlanId: subscriptionPlanId,
        status: 'TRIAL',
        startDate: new Date(),
        endDate: endDate,
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: plan.price,
        currency: plan.currency
      }, { transaction });
      console.log('✅ Suscripción creada con ID:', subscription.id);

      // Registrar el pago si hay datos de confirmación de pago
      if (paymentConfirmation && paymentConfirmation.transactionId) {
        console.log('💳 Registrando pago en SubscriptionPayment...');
        
        const subscriptionPayment = await SubscriptionPayment.create({
          businessSubscriptionId: subscription.id,
          amount: paymentConfirmation.amount || plan.price,
          currency: paymentConfirmation.currency || plan.currency || 'COP',
          status: 'COMPLETED', // Cambiado de 'APPROVED' a 'COMPLETED'
          paymentMethod: paymentConfirmation.method || 'CREDIT_CARD', // Cambiado de 'WOMPI_CARD' a 'CREDIT_CARD'
          externalReference: paymentConfirmation.transactionId,
          wompiTransactionId: paymentConfirmation.transactionId,
          wompiReference: paymentConfirmation.reference,
          dueDate: new Date(), // Campo obligatorio agregado
          netAmount: (paymentConfirmation.amount || plan.price) * 0.97, // Campo obligatorio - Descontando comisión aprox. del 3%
          description: `Pago inicial para suscripción ${plan.name} - Business: ${business.name}`,
          paidAt: new Date(),
          metadata: {
            planId: subscriptionPlanId,
            businessId: business.id,
            userEmail: userEmail,
            businessEmail: email,
            paymentType: 'INITIAL_SUBSCRIPTION'
          }
        }, { transaction });
        
        console.log('✅ Pago registrado con ID:', subscriptionPayment.id);
      } else {
        console.log('ℹ️ No hay datos de pago para registrar (registro sin pago previo)');
      }

      console.log('💾 Haciendo commit de la transacción...');
      await transaction.commit();
      console.log('✅ Transacción completada exitosamente');

      // Generar tokens para el usuario creado
      console.log('🔑 Generando tokens...');
      const tokens = AuthController.generateTokens(user);

      console.log('🎉 Proceso completado exitosamente');
      res.status(201).json({
        success: true,
        message: 'Negocio y usuario creados exitosamente',
        data: {
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
            subdomain: business.subdomain,
            status: business.status,
            trialEndDate: business.trialEndDate
          },
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            businessId: user.businessId
          },
          tokens
        }
      });

    } catch (error) {
      console.log('❌ Error en createBusiness, haciendo rollback...');
      await transaction.rollback();
      console.error('Error creando negocio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener información del negocio actual
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getBusiness(req, res) {
    try {
      const { businessId, role } = req.user;

      // console.log('🔍 getBusiness - businessId:', businessId);
      // console.log('🔍 getBusiness - role:', role);

      if (role === 'CLIENT') {
        return res.status(403).json({
          success: false,
          error: 'Los clientes no tienen acceso a información del negocio'
        });
      }

      const business = await Business.findByPk(businessId, {
        include: [
          {
            model: BusinessRules,
            as: 'rules'
          },
          {
            model: SubscriptionPlan,
            as: 'currentPlan'
          },
          {
            model: BusinessSubscription,
            as: 'subscriptions',
            include: [
              {
                model: SubscriptionPlan,
                as: 'plan',
                attributes: ['id', 'name', 'price', 'duration', 'durationType']
              }
            ]
          }
        ]
      });

      // console.log('🔍 Business found:', !!business);
      if (business) {
        // console.log('🔍 Business subscriptions:', business.subscriptions?.length || 0);
        // console.log('🔍 Business currentPlan:', !!business.currentPlan);
        // console.log('🔍 Business rules:', !!business.rules);
      }

      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      res.json({
        success: true,
        data: business
      });

    } catch (error) {
      console.error('Error obteniendo negocio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar información del negocio
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateBusiness(req, res) {
    try {
      const { businessId, role } = req.user;

      // Solo BUSINESS y OWNER pueden actualizar
      if (!['BUSINESS', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar el negocio'
        });
      }

      const {
        name,
        description,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        website,
        subdomain
      } = req.body;

      // Verificar subdominio si se está cambiando
      if (subdomain) {
        const business = await Business.findByPk(businessId);
        if (business.subdomain !== subdomain) {
          const { isSubdomainAvailable } = require('../middleware/subdomain');
          const available = await isSubdomainAvailable(subdomain);
          
          if (!available) {
            return res.status(409).json({
              success: false,
              error: 'El subdominio no está disponible'
            });
          }
        }
      }

      const updatedBusiness = await Business.update({
        name,
        description,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        website,
        subdomain
      }, {
        where: { id: businessId },
        returning: true
      });

      res.json({
        success: true,
        message: 'Negocio actualizado exitosamente',
        data: updatedBusiness[1][0]
      });

    } catch (error) {
      console.error('Error actualizando negocio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Invitar empleado al negocio
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async inviteEmployee(req, res) {
    try {
      const { businessId, role } = req.user;

      // Solo BUSINESS y OWNER pueden invitar
      if (!['BUSINESS', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para invitar empleados'
        });
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        role: employeeRole = 'SPECIALIST'
      } = req.body;

      // Validar rol del empleado
      if (!['SPECIALIST', 'RECEPTIONIST'].includes(employeeRole)) {
        return res.status(400).json({
          success: false,
          error: 'Rol de empleado inválido'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe un usuario con este email'
        });
      }

      // Generar contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Crear usuario empleado
      const employee = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: employeeRole,
        businessId,
        emailVerified: false
      });

      // TODO: Enviar email con contraseña temporal
      // sendWelcomeEmail(employee.email, tempPassword);

      res.status(201).json({
        success: true,
        message: 'Empleado invitado exitosamente',
        data: {
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role
          },
          tempPassword // TODO: Remover en producción, enviar por email
        }
      });

    } catch (error) {
      console.error('Error invitando empleado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = BusinessController;