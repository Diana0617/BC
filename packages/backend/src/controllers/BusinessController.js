const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");
const Business = require("../models/Business");
// const BusinessRules = require('../models/BusinessRules'); // Deprecated - usar RuleTemplate + BusinessRule
const User = require("../models/User");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const BusinessSubscription = require("../models/BusinessSubscription");
const SubscriptionPayment = require("../models/SubscriptionPayment");
const Module = require("../models/Module");
const AuthController = require("./AuthController");

// Cache temporal para prevenir creaciones duplicadas
const pendingCreations = new Map();

/**
 * Controlador de Negocios para Beauty Control
 * Maneja creación, actualización y gestión de negocios
 */
class BusinessController {
  static async createBusiness(req, res) {
    const transaction = await sequelize.transaction();
    const requestId = Math.random().toString(36).substr(2, 9);

    try {
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
        paymentConfirmation,
      } = req.body;

      // Crear una clave única para identificar esta creación
      const creationKey = `${userEmail}-${email}-${name}`.toLowerCase();

      // Verificar si ya hay una creación en progreso para estos datos
      if (pendingCreations.has(creationKey)) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: "Ya hay una creación de negocio en progreso con estos datos",
        });
      }

      // Marcar esta creación como en progreso
      pendingCreations.set(creationKey, requestId);

      // Limpiar la marca después de 30 segundos (timeout de seguridad)
      setTimeout(() => {
        pendingCreations.delete(creationKey);
      }, 30000);

      // Validaciones básicas
      if (
        !name ||
        !email ||
        !subscriptionPlanId ||
        !userEmail ||
        !userPassword ||
        !firstName ||
        !lastName
      ) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error:
            "Los campos name, email, subscriptionPlanId, userEmail, userPassword, firstName y lastName son requeridos",
        });
      }

      // Verificar que el email del usuario no esté registrado
      const existingUser = await User.findOne({
        where: { email: userEmail },
      });

      if (existingUser) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: "El email del usuario ya está registrado",
        });
      }

      // Verificar que el email del negocio no esté registrado
      const existingBusiness = await Business.findOne({
        where: { email: email },
      });

      if (existingBusiness) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: "El email del negocio ya está registrado",
        });
      }

      // Verificar que el plan de suscripción existe
      const plan = await SubscriptionPlan.findByPk(subscriptionPlanId);
      if (!plan) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: "Plan de suscripción no encontrado",
        });
      }

      // Verificar disponibilidad del subdominio si se proporciona
      const finalSubdomain =
        subdomain || name.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Verificar que el subdominio no exista en la base de datos
      const existingSubdomain = await Business.findOne({
        where: { subdomain: finalSubdomain },
      });

      if (existingSubdomain) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: `El subdominio '${finalSubdomain}' ya está en uso`,
        });
      }

      const { isSubdomainAvailable } = require("../middleware/subdomain");
      const available = await isSubdomainAvailable(finalSubdomain);

      if (!available) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: "El subdominio no está disponible",
        });
      }

      // TODO: Aquí validar el pago antes de continuar
      // if (!paymentConfirmation || !validatePayment(paymentConfirmation)) {
      //   return res.status(402).json({
      //     success: false,
      //     error: 'Pago no confirmado o inválido'
      //   });
      // }

      // Crear el negocio
      const business = await Business.create(
        {
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
          subdomain: finalSubdomain,
          currentPlanId: subscriptionPlanId,
          status: "TRIAL", // Inicia en trial
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
        { transaction }
      );

      // Encriptar contraseña del usuario
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      // Crear el usuario administrador del negocio
      const user = await User.create(
        {
          firstName,
          lastName,
          email: userEmail.toLowerCase(), // Normalizar email a minúsculas
          password: hashedPassword,
          role: "BUSINESS",
          businessId: business.id,
          isActive: true,
        },
        { transaction }
      );

      // Crear reglas predeterminadas del negocio (opcional - se pueden crear después)
      // await BusinessRules.create({
      //   businessId: business.id,
      //   ruleKey: 'DEFAULT_SETUP',
      //   ruleValue: { configured: false },
      //   description: 'Configuración inicial del negocio',
      //   category: 'GENERAL'
      // }, { transaction });

      // Crear la suscripción del negocio
      const endDate = new Date();
      endDate.setMonth(
        endDate.getMonth() +
          (plan.durationType === "MONTHS" ? plan.duration : 1)
      );

      const subscription = await BusinessSubscription.create(
        {
          businessId: business.id,
          subscriptionPlanId: subscriptionPlanId,
          status: "TRIAL",
          startDate: new Date(),
          endDate: endDate,
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: plan.price,
          currency: plan.currency,
        },
        { transaction }
      );

      // Registrar el pago si hay datos de confirmación de pago
      if (paymentConfirmation && paymentConfirmation.transactionId) {
        const subscriptionPayment = await SubscriptionPayment.create(
          {
            businessSubscriptionId: subscription.id,
            amount: paymentConfirmation.amount || plan.price,
            currency: paymentConfirmation.currency || plan.currency || "COP",
            status: "COMPLETED", // Cambiado de 'APPROVED' a 'COMPLETED'
            paymentMethod: paymentConfirmation.method || "CREDIT_CARD", // Cambiado de 'WOMPI_CARD' a 'CREDIT_CARD'
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
              paymentType: "INITIAL_SUBSCRIPTION",
            },
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Generar tokens para el usuario creado
      const tokens = AuthController.generateTokens(user);

      res.status(201).json({
        success: true,
        message: "Negocio y usuario creados exitosamente",
        data: {
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
            subdomain: business.subdomain,
            status: business.status,
            trialEndDate: business.trialEndDate,
          },
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            businessId: user.businessId,
          },
          tokens,
        },
      });

      // Limpiar la marca de creación en progreso
      pendingCreations.delete(creationKey);
    } catch (error) {
      await transaction.rollback();

      // Limpiar la marca de creación en progreso
      const creationKey =
        `${req.body.userEmail}-${req.body.email}-${req.body.name}`.toLowerCase();
      pendingCreations.delete(creationKey);

      console.error("Error creando negocio:", error);

      // Manejar errores específicos de unicidad
      if (error.name === "SequelizeUniqueConstraintError") {
        if (error.errors && error.errors.length > 0) {
          const constraintError = error.errors[0];
          let message = "Ya existe un registro con los mismos datos";

          if (constraintError.path === "subdomain") {
            message = `El subdominio '${constraintError.value}' ya está en uso. Elige otro nombre para tu negocio.`;
          } else if (constraintError.path === "email") {
            message = `El email '${constraintError.value}' ya está registrado.`;
          }

          return res.status(409).json({
            success: false,
            error: message,
          });
        }
      }

      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
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

      if (role === "CLIENT") {
        return res.status(403).json({
          success: false,
          error: "Los clientes no tienen acceso a información del negocio",
        });
      }

      const business = await Business.findByPk(businessId, {
        include: [
          // Commented out until BusinessRules system is fully integrated
          // {
          //   model: BusinessRule, // Updated to use new BusinessRule model
          //   as: 'businessRules'
          // },
          {
            model: SubscriptionPlan,
            as: "currentPlan",
            include: [
              {
                model: Module,
                as: "modules",
                attributes: [
                  "id",
                  "name",
                  "displayName",
                  "description",
                  "icon",
                  "category",
                ],
                through: {
                  where: { isIncluded: true }, // Solo módulos incluidos en el plan
                  attributes: [
                    "isIncluded",
                    "limitQuantity",
                    "additionalPrice",
                    "configuration",
                  ],
                },
                where: { status: "ACTIVE" }, // Solo módulos activos
              },
            ],
          },
          {
            model: BusinessSubscription,
            as: "subscriptions",
            include: [
              {
                model: SubscriptionPlan,
                as: "plan",
                attributes: ["id", "name", "price", "duration", "durationType"],
                include: [
                  {
                    model: Module,
                    as: "modules",
                    attributes: [
                      "id",
                      "name",
                      "displayName",
                      "description",
                      "icon",
                      "category",
                    ],
                    through: {
                      where: { isIncluded: true }, // Solo módulos incluidos en el plan
                      attributes: [
                        "isIncluded",
                        "limitQuantity",
                        "additionalPrice",
                        "configuration",
                      ],
                    },
                    where: { status: "ACTIVE" }, // Solo módulos activos
                  },
                ],
              },
            ],
          },
        ],
      });

      // Obtener TODOS los módulos disponibles en el sistema
      const allModules = await Module.findAll({
        where: { status: "ACTIVE" },
        attributes: [
          "id",
          "name",
          "displayName",
          "description",
          "icon",
          "category",
        ],
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Negocio no encontrado",
        });
      }

      // Obtener módulos incluidos en el plan actual
      const currentSubscription =
        business.subscriptions?.find(
          (sub) => sub.status === "ACTIVE" || sub.status === "TRIAL"
        ) || business.subscriptions?.[0];
      const currentPlan = business.currentPlan || currentSubscription?.plan;
      const includedModuleNames =
        currentPlan?.modules?.map((module) => module.name) || [];

      // Marcar módulos disponibles vs no disponibles
      const modulesWithAvailability = allModules.map((module) => ({
        ...module.toJSON(),
        isAvailable: includedModuleNames.includes(module.name),
      }));

      res.json({
        success: true,
        data: {
          ...business.toJSON(),
          allModules: modulesWithAvailability,
        },
      });
    } catch (error) {
      console.error("Error obteniendo negocio:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
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
      if (!["BUSINESS", "OWNER"].includes(role)) {
        return res.status(403).json({
          success: false,
          error: "No tienes permisos para actualizar el negocio",
        });
      }

      const {
        name,
        description,
        phone,
        email,
        address,
        city,
        state,
        country,
        zipCode,
        website,
        type,
        subdomain, // Este campo NO se permite modificar
      } = req.body;

      // SEGURIDAD: Bloquear modificación del subdominio
      if (subdomain !== undefined) {
        return res.status(400).json({
          success: false,
          error: "No se puede modificar el subdominio por razones de seguridad",
        });
      }

      // Validar que el email no esté en uso por otro negocio (si se está cambiando)
      if (email) {
        const existingBusiness = await Business.findOne({
          where: {
            email,
            id: { [Op.ne]: businessId }, // Excluir el negocio actual
          },
        });

        if (existingBusiness) {
          return res.status(409).json({
            success: false,
            error: "El email ya está registrado por otro negocio",
          });
        }
      }

      // Preparar datos a actualizar (todos los campos editables)
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (country !== undefined) updateData.country = country;
      if (zipCode !== undefined) updateData.zipCode = zipCode;
      if (website !== undefined) updateData.website = website;
      if (type !== undefined) updateData.type = type;

      // Actualizar negocio
      await Business.update(updateData, {
        where: { id: businessId },
      });

      // Obtener negocio actualizado con toda su información
      const updatedBusiness = await Business.findByPk(businessId);

      res.json({
        success: true,
        message: "Negocio actualizado exitosamente",
        data: updatedBusiness,
      });
    } catch (error) {
      console.error("Error actualizando negocio:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
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
      if (!["BUSINESS", "OWNER"].includes(role)) {
        return res.status(403).json({
          success: false,
          error: "No tienes permisos para invitar empleados",
        });
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        role: employeeRole = "SPECIALIST",
      } = req.body;

      // Validar rol del empleado
      if (
        !["SPECIALIST", "RECEPTIONIST", "RECEPTIONIST_SPECIALIST"].includes(
          employeeRole
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Rol de empleado inválido",
        });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "Ya existe un usuario con este email",
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
        emailVerified: false,
      });

      // TODO: Enviar email con contraseña temporal
      // sendWelcomeEmail(employee.email, tempPassword);

      res.status(201).json({
        success: true,
        message: "Empleado invitado exitosamente",
        data: {
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role,
          },
          tempPassword, // TODO: Remover en producción, enviar por email
        },
      });
    } catch (error) {
      console.error("Error invitando empleado:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  /**
   * Obtener módulos disponibles para el negocio actual
   * GET /api/business/modules
   */
  static async getAvailableModules(req, res) {
    try {
      const businessId = req.user.businessId;

      // Obtener el negocio con su plan actual
      const business = await Business.findByPk(businessId, {
        include: [
          {
            model: SubscriptionPlan,
            as: "currentPlan",
            include: [
              {
                model: Module,
                as: "modules",
                through: {
                  model: PlanModule,
                  where: { isIncluded: true }, // Solo módulos incluidos en el plan
                  attributes: [
                    "isIncluded",
                    "limitQuantity",
                    "additionalPrice",
                  ],
                },
                where: { status: "ACTIVE" }, // Solo módulos activos
                attributes: [
                  "id",
                  "name",
                  "displayName",
                  "description",
                  "icon",
                  "category",
                  "version",
                  "requiresConfiguration",
                ],
              },
            ],
          },
        ],
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Negocio no encontrado",
        });
      }

      if (!business.currentPlan) {
        return res.status(200).json({
          success: true,
          data: {
            modules: [],
            message: "El negocio no tiene un plan activo",
          },
        });
      }

      // Agrupar módulos por categoría para mejor organización
      const modulesByCategory = business.currentPlan.modules.reduce(
        (acc, module) => {
          if (!acc[module.category]) {
            acc[module.category] = [];
          }
          acc[module.category].push({
            id: module.id,
            name: module.name,
            displayName: module.displayName,
            description: module.description,
            icon: module.icon,
            category: module.category,
            version: module.version,
            requiresConfiguration: module.requiresConfiguration,
            planModule: module.PlanModule, // Información específica del plan
          });
          return acc;
        },
        {}
      );

      res.status(200).json({
        success: true,
        data: {
          modules: modulesByCategory,
          plan: {
            id: business.currentPlan.id,
            name: business.currentPlan.name,
            description: business.currentPlan.description,
          },
          totalModules: business.currentPlan.modules.length,
        },
      });
    } catch (error) {
      console.error("Error obteniendo módulos disponibles:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

module.exports = BusinessController;
