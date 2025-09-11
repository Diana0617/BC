const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const Business = require('../models/Business');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PasswordResetToken = require('../models/PasswordResetToken');
const emailService = require('../services/EmailService');

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

  /**
   * Solicitar recuperación de contraseña
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      // Validación básica
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email es requerido'
        });
      }

      // Buscar usuario por email
      const user = await User.findOne({ where: { email: email.toLowerCase() } });

      // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
      // Esto evita que atacantes puedan determinar si un email está registrado
      if (!user) {
        return res.json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
        });
      }

      // Invalidar tokens anteriores del usuario
      await PasswordResetToken.invalidateUserTokens(user.id);

      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Crear registro de token en base de datos
      const tokenRecord = await PasswordResetToken.create({
        userId: user.id,
        token: resetToken,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
      });

      // Construir URL de reset
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Enviar email
      const emailResult = await emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
        resetUrl
      );

      if (!emailResult.success) {
        console.error('❌ Error enviando email de recuperación:', emailResult.error);
        
        // Eliminar token si no se pudo enviar el email
        await tokenRecord.destroy();
        
        return res.status(500).json({
          success: false,
          error: 'Error enviando email de recuperación. Intenta nuevamente'
        });
      }

      console.log(`📧 Email de recuperación enviado a ${user.email}`);

      res.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
        data: {
          emailSent: true,
          expiresIn: '1 hora'
        }
      });

    } catch (error) {
      console.error('Error en solicitud de reset:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Verificar token de recuperación
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token es requerido'
        });
      }

      // Buscar token válido
      const tokenRecord = await PasswordResetToken.scope('valid').findOne({
        where: { token },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'isActive']
        }]
      });

      if (!tokenRecord) {
        return res.status(400).json({
          success: false,
          error: 'Token inválido o expirado'
        });
      }

      // Verificar que el usuario sigue activo
      if (!tokenRecord.user.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Usuario inactivo'
        });
      }

      res.json({
        success: true,
        message: 'Token válido',
        data: {
          userId: tokenRecord.user.id,
          userEmail: tokenRecord.user.email,
          userName: `${tokenRecord.user.firstName} ${tokenRecord.user.lastName}`,
          expiresAt: tokenRecord.expiresAt
        }
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Restablecer contraseña con token
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      // Validaciones básicas
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token, nueva contraseña y confirmación son requeridos'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Las contraseñas no coinciden'
        });
      }

      // Validar fortaleza de contraseña
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
        });
      }

      // Buscar y validar token
      const tokenRecord = await PasswordResetToken.scope('valid').findOne({
        where: { token },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'password']
        }]
      });

      if (!tokenRecord) {
        return res.status(400).json({
          success: false,
          error: 'Token inválido o expirado'
        });
      }

      // Verificar que el usuario sigue activo
      if (!tokenRecord.user.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Usuario inactivo'
        });
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(newPassword, tokenRecord.user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe ser diferente a la actual'
        });
      }

      // Hashear nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña del usuario
      await tokenRecord.user.update({
        password: hashedPassword,
        lastPasswordChange: new Date()
      });

      // Marcar token como usado
      await tokenRecord.markAsUsed();

      // Invalidar todos los demás tokens del usuario
      await PasswordResetToken.invalidateUserTokens(tokenRecord.userId);

      // Enviar email de confirmación
      const confirmationEmailResult = await emailService.sendPasswordChangedConfirmation(
        tokenRecord.user.email,
        tokenRecord.user.firstName
      );

      if (!confirmationEmailResult.success) {
        console.error('❌ Error enviando email de confirmación:', confirmationEmailResult.error);
        // No fallar la operación por esto, solo loggear
      }

      console.log(`🔐 Contraseña restablecida para usuario ${tokenRecord.user.email}`);

      res.json({
        success: true,
        message: 'Contraseña restablecida exitosamente',
        data: {
          userId: tokenRecord.user.id,
          emailSent: confirmationEmailResult.success
        }
      });

    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      // Validaciones básicas
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual, nueva contraseña y confirmación son requeridas'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Las contraseñas no coinciden'
        });
      }

      // Validar fortaleza de contraseña
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
        });
      }

      // Buscar usuario
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual incorrecta'
        });
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe ser diferente a la actual'
        });
      }

      // Hashear nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await user.update({
        password: hashedPassword,
        lastPasswordChange: new Date()
      });

      // Invalidar todos los tokens de reset del usuario
      await PasswordResetToken.invalidateUserTokens(userId);

      // Enviar email de confirmación
      const confirmationEmailResult = await emailService.sendPasswordChangedConfirmation(
        user.email,
        user.firstName
      );

      if (!confirmationEmailResult.success) {
        console.error('❌ Error enviando email de confirmación:', confirmationEmailResult.error);
        // No fallar la operación por esto, solo loggear
      }

      console.log(`🔐 Contraseña cambiada para usuario ${user.email}`);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: {
          userId: user.id,
          emailSent: confirmationEmailResult.success,
          changedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;