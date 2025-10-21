const PermissionService = require('../services/PermissionService');

/**
 * Middleware para verificar si un usuario tiene un permiso específico
 * Debe usarse después de authenticateToken
 */
const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const { id: userId, role, businessId } = req.user;

      // OWNER siempre tiene todos los permisos
      if (role === 'OWNER') {
        return next();
      }

      // Para otros roles, verificar el permiso
      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId requerido para verificar permisos'
        });
      }

      const hasPermission = await PermissionService.hasPermission(
        userId,
        businessId,
        permissionKey
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para realizar esta acción',
          requiredPermission: permissionKey,
          userRole: role
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkPermission:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (requiere TODOS)
 */
const checkAllPermissions = (permissionKeys) => {
  return async (req, res, next) => {
    try {
      const { id: userId, role, businessId } = req.user;

      if (role === 'OWNER') {
        return next();
      }

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId requerido para verificar permisos'
        });
      }

      const hasAllPermissions = await Promise.all(
        permissionKeys.map(key => 
          PermissionService.hasPermission(userId, businessId, key)
        )
      );

      if (!hasAllPermissions.every(has => has)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes todos los permisos necesarios para realizar esta acción',
          requiredPermissions: permissionKeys,
          userRole: role
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkAllPermissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (requiere AL MENOS UNO)
 */
const checkAnyPermission = (permissionKeys) => {
  return async (req, res, next) => {
    try {
      const { id: userId, role, businessId } = req.user;

      if (role === 'OWNER') {
        return next();
      }

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId requerido para verificar permisos'
        });
      }

      const hasAnyPermission = await Promise.all(
        permissionKeys.map(key => 
          PermissionService.hasPermission(userId, businessId, key)
        )
      );

      if (!hasAnyPermission.some(has => has)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes ninguno de los permisos necesarios para realizar esta acción',
          requiredPermissions: permissionKeys,
          userRole: role
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkAnyPermission:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para inyectar permisos del usuario en la request
 * Útil para verificaciones condicionales en controladores
 */
const injectUserPermissions = async (req, res, next) => {
  try {
    const { id: userId, role, businessId } = req.user;

    if (role === 'OWNER') {
      // OWNER tiene todos los permisos
      req.userPermissions = { all: true, permissions: [] };
      return next();
    }

    if (!businessId) {
      req.userPermissions = { all: false, permissions: [] };
      return next();
    }

    const permissions = await PermissionService.getUserEffectivePermissions(
      userId,
      businessId
    );

    req.userPermissions = {
      all: false,
      permissions: permissions.map(p => p.permission.key)
    };

    next();
  } catch (error) {
    console.error('Error en injectUserPermissions:', error);
    req.userPermissions = { all: false, permissions: [] };
    next();
  }
};

module.exports = {
  checkPermission,
  checkAllPermissions,
  checkAnyPermission,
  injectUserPermissions
};
