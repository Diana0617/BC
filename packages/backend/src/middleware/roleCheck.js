const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        userRole
      });
    }
    
    next();
  };
};

// Combinaciones específicas de roles
const ownerOnly = roleCheck(['OWNER']);

const businessAndOwner = roleCheck(['OWNER', 'BUSINESS']);

const staffRoles = roleCheck(['SPECIALIST', 'RECEPTIONIST', 'BUSINESS']);

const allStaffRoles = roleCheck(['OWNER', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST']);

const clientOnly = roleCheck(['CLIENT']);

const allRoles = roleCheck(['OWNER', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'CLIENT']);

// Middleware para verificar acceso específico a recursos
const resourceOwnerCheck = (req, res, next) => {
  const { role, id: userId } = req.user;
  const resourceUserId = req.params.userId || req.body.userId;
  
  // OWNER puede acceder a todo
  if (role === 'OWNER') {
    return next();
  }
  
  // BUSINESS puede acceder a recursos de su negocio
  if (role === 'BUSINESS') {
    return next();
  }
  
  // SPECIALIST y RECEPTIONIST solo pueden acceder a sus propios recursos
  if (['SPECIALIST', 'RECEPTIONIST'].includes(role)) {
    if (resourceUserId && resourceUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Solo puedes acceder a tus propios recursos'
      });
    }
  }
  
  next();
};

// Middleware para validar módulos activos
const moduleAccessCheck = (requiredModule) => {
  return async (req, res, next) => {
    try {
      const { business, role } = req.user;
      
      // OWNER siempre tiene acceso
      if (role === 'OWNER') {
        return next();
      }
      
      // Verificar si el negocio tiene acceso al módulo
      // Esta lógica se puede expandir consultando BusinessSubscription y PlanModule
      if (!business) {
        return res.status(403).json({
          success: false,
          error: 'No se puede verificar acceso al módulo'
        });
      }
      
      // TODO: Implementar verificación real de módulos cuando esté la lógica de suscripciones
      next();
    } catch (error) {
      console.error('Error verificando módulo:', error);
      res.status(500).json({
        success: false,
        error: 'Error verificando acceso al módulo'
      });
    }
  };
};

module.exports = {
  roleCheck,
  ownerOnly,
  businessAndOwner,
  staffRoles,
  allStaffRoles,
  clientOnly,
  allRoles,
  resourceOwnerCheck,
  moduleAccessCheck
};