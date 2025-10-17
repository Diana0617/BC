const jwt = require('jsonwebtoken');
const { User, Business, UserBranch, Branch } = require('../models');

/**
 * Middleware para validar businessId en query params o body
 * Asegura que el usuario no pueda acceder a datos de otros negocios
 */
const validateBusinessId = (req, res, next) => {
  try {
    // Obtener businessId de query params o body
    const businessId = req.query.businessId || req.body.businessId;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId es requerido'
      });
    }
    
    // Para usuarios que no son OWNER, validar que coincida con su businessId
    if (req.user.role !== 'OWNER' && req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este negocio'
      });
    }
    
    // Agregar businessId validado al request
    req.validatedBusinessId = businessId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error validating businessId'
    });
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('DEBUG authenticateToken: Token decoded successfully:', { userId: decoded.userId });
    
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        status: 'ACTIVE'
      },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'status', 'trialEndDate', 'phone', 'email', 'address', 'city', 'state', 'country']
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido o usuario no encontrado' 
      });
    }

    // Cargar branches asignados para especialistas y recepcionistas (incluyendo RECEPTIONIST_SPECIALIST)
    let branchIds = [];
    if (['SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(user.role)) {
      const userBranches = await UserBranch.findAll({
        where: { userId: user.id },
        include: [{
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name']
        }]
      });
      branchIds = userBranches.map(ub => ub.branchId);
    }

    // Verificar que el negocio esté activo o en período de prueba válido (excepto para OWNER)
    if (user.role !== 'OWNER' && user.business) {
      const business = user.business;
      
      // Si el negocio no está en estado activo o trial, denegar acceso
      if (!['ACTIVE', 'TRIAL'].includes(business.status)) {
        return res.status(403).json({ 
          success: false,
          error: 'El negocio asociado está inactivo' 
        });
      }
      
      // Si está en TRIAL, verificar que no haya expirado
      if (business.status === 'TRIAL' && business.trialEndDate) {
        const now = new Date();
        const trialEnd = new Date(business.trialEndDate);
        
        if (now > trialEnd) {
          return res.status(403).json({ 
            success: false,
            error: 'El período de prueba ha expirado. Contacte al administrador para renovar su suscripción.' 
          });
        }
      }
    }

    // Cargar todas las sucursales del negocio para OWNER y ADMIN
    let branches = [];
    if (['OWNER', 'ADMIN'].includes(user.role) && user.businessId) {
      branches = await Branch.findAll({
        where: { businessId: user.businessId },
        attributes: ['id', 'name', 'code', 'address', 'city', 'state', 'country', 'phone', 'email'],
        order: [['name', 'ASC']]
      });
      console.log('🏢 Auth Middleware - Branches cargadas:', branches.length);
    }

    console.log('🔐 Auth Middleware - Datos del usuario:');
    console.log('  business:', user.business?.toJSON());
    console.log('  branches:', branches.length > 0 ? branches.map(b => b.toJSON()) : 'Sin sucursales');

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      businessId: user.businessId,
      business: user.business,
      branchIds: branchIds, // Array de IDs de branches asignados (vacío para otros roles)
      branches: branches.map(b => b.toJSON()) // Todas las sucursales del negocio (solo para OWNER/ADMIN)
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado' 
      });
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Middleware para validar que el usuario sea SPECIALIST y esté asociado al businessId
 * Extrae specialistId del token de autenticación para evitar acceso cruzado
 */
const requireSpecialist = async (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    // Verificar que el rol sea SPECIALIST
    if (req.user.role !== 'SPECIALIST') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Rol SPECIALIST requerido'
      });
    }

    // Verificar que businessId esté presente en la petición
    const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId requerido en la petición'
      });
    }

    // Verificar que el especialista esté asociado al businessId
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. No autorizado para este negocio'
      });
    }

    // Agregar specialistId extraído del token a req.specialist
    req.specialist = {
      id: req.user.id,
      businessId: req.user.businessId
    };

    // Evitar que specialistId venga desde el body/params para prevenir acceso cruzado
    if (req.body.specialistId || req.params.specialistId) {
      delete req.body.specialistId;
      delete req.params.specialistId;
    }

    next();
  } catch (error) {
    console.error('Error en middleware requireSpecialist:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para validar que el usuario sea RECEPTIONIST y esté asociado al businessId
 * Los recepcionistas pueden ver agenda de todos los especialistas del negocio
 */
const requireReceptionist = async (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    // Verificar que el rol sea RECEPTIONIST
    if (req.user.role !== 'RECEPTIONIST') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Rol RECEPTIONIST requerido'
      });
    }

    // Verificar que businessId esté presente en la petición
    const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId requerido en la petición'
      });
    }

    // Verificar que el recepcionista esté asociado al businessId
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. No autorizado para este negocio'
      });
    }

    // Agregar información del recepcionista a req.receptionist
    req.receptionist = {
      id: req.user.id,
      businessId: req.user.businessId
    };

    next();
  } catch (error) {
    console.error('Error en middleware requireReceptionist:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware que permite acceso tanto a SPECIALIST como a RECEPTIONIST
 * Útil para endpoints que ambos roles pueden usar con diferentes permisos
 */
const requireSpecialistOrReceptionist = async (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    // Verificar que el rol sea SPECIALIST, RECEPTIONIST o RECEPTIONIST_SPECIALIST
    if (!['SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Rol SPECIALIST, RECEPTIONIST o RECEPTIONIST_SPECIALIST requerido'
      });
    }

    // Verificar que businessId esté presente en la petición
    const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'businessId requerido en la petición'
      });
    }

    // Verificar que el usuario esté asociado al businessId
    if (req.user.businessId !== businessId) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. No autorizado para este negocio'
      });
    }

    // Agregar información del usuario según su rol
    // RECEPTIONIST_SPECIALIST tiene ambos permisos
    if (req.user.role === 'SPECIALIST' || req.user.role === 'RECEPTIONIST_SPECIALIST') {
      req.specialist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds: req.user.branchIds || []
      };
      // Evitar acceso cruzado para especialistas puros
      if (req.user.role === 'SPECIALIST') {
        if (req.body.specialistId || req.params.specialistId) {
          delete req.body.specialistId;
          delete req.params.specialistId;
        }
      }
    }
    
    if (req.user.role === 'RECEPTIONIST' || req.user.role === 'RECEPTIONIST_SPECIALIST') {
      req.receptionist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds: req.user.branchIds || []
      };
    }

    next();
  } catch (error) {
    console.error('Error en middleware requireSpecialistOrReceptionist:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para autorizar roles específicos
 * @param {Array} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('Error en authorizeRole:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

module.exports = { 
  authenticateToken, 
  authorizeRole,
  validateBusinessId,
  requireSpecialist, 
  requireReceptionist, 
  requireSpecialistOrReceptionist 
};console.log('SIMPLE TEST LOG');
