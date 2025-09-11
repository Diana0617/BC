const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const Business = require('../models/Business');
const SubscriptionPlan = require('../models/SubscriptionPlan');

/**
 * Controlador de Autenticación para Beauty Control
 * Maneja registro, login, logout y gestión de tokens
 */
class AuthController {
  
  /**
   * Registro de nuevos usuarios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async register(req, res) {
    try {
      // Debug: verificar qué datos están llegando
      console.log('📨 Datos recibidos en registro:', req.body);
      
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        role = 'CLIENT',
        businessId = null
      } = req.body;

      // Validaciones básicas
      if (!firstName || !lastName || !email || !password) {
        console.log('❌ Validación fallida:', {
          firstName: !!firstName,
          lastName: !!lastName,
          email: !!email,
          password: !!password
        });
        return res.status(400).json({
          success: false,
          error: 'Los campos firstName, lastName, email y password son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de email inválido'
        });
      }

      // Validar fortaleza de contraseña
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe una cuenta con este email'
        });
      }

      // Hashear contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const userData = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role,
        isActive: true,
        emailVerified: false // En desarrollo, cambiar según necesidades
      };

      // Si es un rol que requiere businessId, validarlo
      if (['BUSINESS', 'SPECIALIST', 'RECEPTIONIST'].includes(role)) {
        if (!businessId) {
          return res.status(400).json({
            success: false,
            error: 'BusinessId es requerido para este tipo de usuario'
          });
        }

        // Verificar que el business existe
        const business = await Business.findByPk(businessId);
        if (!business) {
          return res.status(404).json({
            success: false,
            error: 'Negocio no encontrado'
          });
        }

        userData.businessId = businessId;
      }

      const newUser = await User.create(userData);

      // Generar tokens
      const tokens = AuthController.generateTokens(newUser);

      // Preparar respuesta (sin contraseña)
      const userResponse = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        businessId: newUser.businessId,
        isActive: newUser.isActive,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor durante el registro'
      });
    }
  }

  /**
   * Login de usuarios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const user = await User.findOne({
        where: { 
          email: email.toLowerCase(),
          isActive: true 
        },
        include: [
          {
            model: Business,
            as: 'business',
            include: [
              {
                model: SubscriptionPlan,
                as: 'currentPlan'
              }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Verificar si el negocio está activo (para usuarios de negocio)
      if (user.businessId && user.business && !user.business.isActive) {
        return res.status(403).json({
          success: false,
          error: 'El negocio asociado está inactivo'
        });
      }

      // Generar tokens
      const tokens = AuthController.generateTokens(user);

      // Actualizar último login
      await user.update({ lastLogin: new Date() });

      // Preparar respuesta (sin contraseña)
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId: user.businessId,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        business: user.business ? {
          id: user.business.id,
          name: user.business.name,
          businessType: user.business.businessType,
          isActive: user.business.isActive,
          currentPlan: user.business.currentPlan
        } : null
      };

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: userResponse,
          tokens
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor durante el login'
      });
    }
  }

  /**
   * Logout de usuarios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async logout(req, res) {
    try {
      // En un sistema más avanzado, aquí invalidaríamos el token
      // Por ahora, simplemente confirmamos el logout
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor durante el logout'
      });
    }
  }

  /**
   * Refrescar token de acceso
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token es requerido'
        });
      }

      // Verificar refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token inválido'
        });
      }

      // Buscar usuario
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado o inactivo'
        });
      }

      // Generar nuevos tokens
      const tokens = AuthController.generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: { tokens }
      });

    } catch (error) {
      console.error('Error refrescando token:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Business,
            as: 'business',
            include: [
              {
                model: SubscriptionPlan,
                as: 'currentPlan'
              }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Preparar respuesta (sin contraseña)
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId: user.businessId,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        business: user.business ? {
          id: user.business.id,
          name: user.business.name,
          businessType: user.business.businessType,
          isActive: user.business.isActive,
          currentPlan: user.business.currentPlan
        } : null
      };

      res.status(200).json({
        success: true,
        data: { user: userResponse }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar tokens JWT
   * @param {Object} user - Usuario
   * @returns {Object} Tokens de acceso y refresh
   */
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  }

  /**
   * Generar subdominio sugerido para nuevo negocio (PREPARADO PARA PRODUCCIÓN)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async suggestSubdomain(req, res) {
    try {
      const { businessName } = req.body;

      if (!businessName) {
        return res.status(400).json({
          success: false,
          error: 'Nombre del negocio es requerido'
        });
      }

      const { generateSubdomain, isSubdomainAvailable } = require('../middleware/subdomain');
      
      let suggestedSubdomain = generateSubdomain(businessName);
      let counter = 1;
      
      // Si el subdominio sugerido no está disponible, agregar número
      while (!(await isSubdomainAvailable(suggestedSubdomain))) {
        suggestedSubdomain = `${generateSubdomain(businessName)}-${counter}`;
        counter++;
        
        // Evitar loop infinito
        if (counter > 99) {
          suggestedSubdomain = `${generateSubdomain(businessName)}-${Date.now()}`;
          break;
        }
      }

      res.json({
        success: true,
        data: {
          suggested: suggestedSubdomain,
          preview: `https://${suggestedSubdomain}.${process.env.DOMAIN_BASE || 'beautycontrol.com'}`,
          available: await isSubdomainAvailable(suggestedSubdomain)
        }
      });

    } catch (error) {
      console.error('Error sugiriendo subdominio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar disponibilidad de subdominio (PREPARADO PARA PRODUCCIÓN)
   * @param {Object} req - Request object  
   * @param {Object} res - Response object
   */
  static async checkSubdomainAvailability(req, res) {
    try {
      const { subdomain } = req.params;

      if (!subdomain) {
        return res.status(400).json({
          success: false,
          error: 'Subdominio es requerido'
        });
      }

      const { isSubdomainAvailable } = require('../middleware/subdomain');
      const available = await isSubdomainAvailable(subdomain);

      res.json({
        success: true,
        data: {
          subdomain,
          available,
          preview: available ? `https://${subdomain}.${process.env.DOMAIN_BASE || 'beautycontrol.com'}` : null
        }
      });

    } catch (error) {
      console.error('Error verificando subdominio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;