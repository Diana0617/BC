const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const Business = require('../models/Business');
const BusinessRules = require('../models/BusinessRules');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const BusinessSubscription = require('../models/BusinessSubscription');

/**
 * Controlador de Negocios para Beauty Control
 * Maneja creación, actualización y gestión de negocios
 */
class BusinessController {
  
  /**
   * Crear un nuevo negocio (solo para usuarios CLIENT que pagaron)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async createBusiness(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { userId, role } = req.user;
      
      // Solo usuarios CLIENT pueden crear negocios
      if (role !== 'CLIENT') {
        return res.status(403).json({
          success: false,
          error: 'Solo usuarios CLIENT pueden crear negocios'
        });
      }

      const {
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
        // TODO: Agregar validación de pago aquí
        paymentConfirmation
      } = req.body;

      // Validaciones básicas
      if (!name || !email || !subscriptionPlanId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Los campos name, email y subscriptionPlanId son requeridos'
        });
      }

      // Verificar que el usuario no tenga ya un negocio
      const existingBusiness = await Business.findOne({
        include: [{
          model: User,
          where: { id: userId, role: 'BUSINESS' }
        }]
      });

      if (existingBusiness) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: 'Ya tienes un negocio creado'
        });
      }

      // Verificar que el plan de suscripción existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Plan de suscripción no encontrado'
        });
      }

      // Verificar disponibilidad del subdominio si se proporciona
      if (subdomain) {
        const { isSubdomainAvailable } = require('../middleware/subdomain');
        const available = await isSubdomainAvailable(subdomain);
        
        if (!available) {
          await transaction.rollback();
          return res.status(409).json({
            success: false,
            error: 'El subdominio no está disponible'
          });
        }
      }

      // TODO: Aquí validar el pago antes de continuar
      // if (!paymentConfirmation || !validatePayment(paymentConfirmation)) {
      //   return res.status(402).json({
      //     success: false,
      //     error: 'Pago no confirmado o inválido'
      //   });
      // }

      // Crear el negocio
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

      // Crear reglas predeterminadas del negocio
      await BusinessRules.create({
        businessId: business.id,
        // Usar valores predeterminados del modelo
      }, { transaction });

      // Crear la suscripción del negocio
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.durationType === 'MONTHS' ? plan.duration : 1));
      
      await BusinessSubscription.create({
        businessId: business.id,
        subscriptionPlanId: subscriptionPlanId,
        status: 'TRIAL',
        startDate: new Date(),
        endDate: endDate,
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: plan.price,
        currency: plan.currency
      }, { transaction });

      // Actualizar el usuario: cambiar rol a BUSINESS y asignar businessId
      await User.update({
        role: 'BUSINESS',
        businessId: business.id
      }, {
        where: { id: userId },
        transaction
      });

      await transaction.commit();

      // Generar nuevo token con el nuevo rol y businessId
      const updatedUser = await User.findByPk(userId);
      const tokens = AuthController.generateTokens(updatedUser);

      res.status(201).json({
        success: true,
        message: 'Negocio creado exitosamente',
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
            id: updatedUser.id,
            role: updatedUser.role,
            businessId: updatedUser.businessId
          },
          tokens
        }
      });

    } catch (error) {
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

// Importar AuthController para generar tokens
const AuthController = require('./AuthController');

module.exports = BusinessController;