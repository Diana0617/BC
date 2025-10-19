const PermissionService = require('../services/PermissionService');
const { Permission, RoleDefaultPermission, User } = require('../models');

class PermissionController {
  /**
   * Obtener todos los permisos disponibles
   * GET /api/permissions
   */
  static async getAllPermissions(req, res) {
    try {
      const { category } = req.query;

      const permissions = await PermissionService.getPermissionsByCategory(category);

      return res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Error en getAllPermissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener permisos'
      });
    }
  }

  /**
   * Obtener permisos por defecto de un rol
   * GET /api/permissions/role/:role/defaults
   */
  static async getRoleDefaults(req, res) {
    try {
      const { role } = req.params;

      const validRoles = ['BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol inválido'
        });
      }

      const defaults = await PermissionService.getRoleDefaultPermissions(role);

      return res.json({
        success: true,
        data: {
          role,
          permissions: defaults
        }
      });
    } catch (error) {
      console.error('Error en getRoleDefaults:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener permisos por defecto del rol'
      });
    }
  }

  /**
   * Obtener permisos efectivos de un usuario en un negocio
   * GET /api/permissions/user/:userId/business/:businessId
   */
  static async getUserPermissions(req, res) {
    try {
      const { userId, businessId } = req.params;

      // Verificar que el usuario autenticado pueda ver estos permisos
      const requestingUser = req.user;
      if (requestingUser.role !== 'OWNER' && 
          requestingUser.role !== 'BUSINESS' && 
          requestingUser.id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para ver los permisos de este usuario'
        });
      }

      // Para roles BUSINESS, validar que sea su propio negocio
      if (requestingUser.role === 'BUSINESS' && requestingUser.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes ver permisos de tu propio negocio'
        });
      }

      const effectivePermissions = await PermissionService.getUserEffectivePermissions(userId, businessId);
      const differences = await PermissionService.getUserPermissionDifferences(userId, businessId);
      
      // Obtener info del usuario
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      });

      return res.json({
        success: true,
        data: {
          user,
          permissions: effectivePermissions,
          customizations: differences
        }
      });
    } catch (error) {
      console.error('Error en getUserPermissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener permisos del usuario'
      });
    }
  }

  /**
   * Conceder un permiso a un usuario
   * POST /api/permissions/grant
   */
  static async grantPermission(req, res) {
    try {
      const { userId, businessId, permissionKey, notes } = req.body;
      const grantedBy = req.user.id;

      // Validar que solo BUSINESS u OWNER puedan conceder permisos
      if (req.user.role !== 'OWNER' && req.user.role !== 'BUSINESS') {
        return res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden conceder permisos'
        });
      }

      // Si es BUSINESS, validar que sea su propio negocio
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes conceder permisos en tu propio negocio'
        });
      }

      if (!userId || !businessId || !permissionKey) {
        return res.status(400).json({
          success: false,
          error: 'userId, businessId y permissionKey son requeridos'
        });
      }

      const result = await PermissionService.grantPermission(
        userId,
        businessId,
        permissionKey,
        grantedBy,
        notes
      );

      return res.json({
        success: true,
        message: 'Permiso concedido exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error en grantPermission:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error al conceder permiso'
      });
    }
  }

  /**
   * Revocar un permiso a un usuario
   * POST /api/permissions/revoke
   */
  static async revokePermission(req, res) {
    try {
      const { userId, businessId, permissionKey, notes } = req.body;
      const revokedBy = req.user.id;

      // Validar que solo BUSINESS u OWNER puedan revocar permisos
      if (req.user.role !== 'OWNER' && req.user.role !== 'BUSINESS') {
        return res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden revocar permisos'
        });
      }

      // Si es BUSINESS, validar que sea su propio negocio
      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes revocar permisos en tu propio negocio'
        });
      }

      if (!userId || !businessId || !permissionKey) {
        return res.status(400).json({
          success: false,
          error: 'userId, businessId y permissionKey son requeridos'
        });
      }

      const result = await PermissionService.revokePermission(
        userId,
        businessId,
        permissionKey,
        revokedBy,
        notes
      );

      return res.json({
        success: true,
        message: 'Permiso revocado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error en revokePermission:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error al revocar permiso'
      });
    }
  }

  /**
   * Conceder múltiples permisos de una vez
   * POST /api/permissions/grant-bulk
   */
  static async grantBulkPermissions(req, res) {
    try {
      const { userId, businessId, permissionKeys, notes } = req.body;
      const grantedBy = req.user.id;

      // Validaciones
      if (req.user.role !== 'OWNER' && req.user.role !== 'BUSINESS') {
        return res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden conceder permisos'
        });
      }

      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes conceder permisos en tu propio negocio'
        });
      }

      if (!userId || !businessId || !Array.isArray(permissionKeys) || permissionKeys.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'userId, businessId y permissionKeys (array) son requeridos'
        });
      }

      const results = await Promise.all(
        permissionKeys.map(key => 
          PermissionService.grantPermission(userId, businessId, key, grantedBy, notes)
        )
      );

      return res.json({
        success: true,
        message: `${results.length} permisos concedidos exitosamente`,
        data: results
      });
    } catch (error) {
      console.error('Error en grantBulkPermissions:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error al conceder permisos'
      });
    }
  }

  /**
   * Revocar múltiples permisos de una vez
   * POST /api/permissions/revoke-bulk
   */
  static async revokeBulkPermissions(req, res) {
    try {
      const { userId, businessId, permissionKeys, notes } = req.body;
      const revokedBy = req.user.id;

      // Validaciones
      if (req.user.role !== 'OWNER' && req.user.role !== 'BUSINESS') {
        return res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden revocar permisos'
        });
      }

      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes revocar permisos en tu propio negocio'
        });
      }

      if (!userId || !businessId || !Array.isArray(permissionKeys) || permissionKeys.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'userId, businessId y permissionKeys (array) son requeridos'
        });
      }

      const results = await Promise.all(
        permissionKeys.map(key => 
          PermissionService.revokePermission(userId, businessId, key, revokedBy, notes)
        )
      );

      return res.json({
        success: true,
        message: `${results.length} permisos revocados exitosamente`,
        data: results
      });
    } catch (error) {
      console.error('Error en revokeBulkPermissions:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error al revocar permisos'
      });
    }
  }

  /**
   * Resetear permisos de un usuario a los valores por defecto de su rol
   * POST /api/permissions/reset
   */
  static async resetToDefaults(req, res) {
    try {
      const { userId, businessId } = req.body;

      // Validaciones
      if (req.user.role !== 'OWNER' && req.user.role !== 'BUSINESS') {
        return res.status(403).json({
          success: false,
          error: 'Solo los administradores pueden resetear permisos'
        });
      }

      if (req.user.role === 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'Solo puedes resetear permisos en tu propio negocio'
        });
      }

      if (!userId || !businessId) {
        return res.status(400).json({
          success: false,
          error: 'userId y businessId son requeridos'
        });
      }

      // Eliminar todas las personalizaciones del usuario en este negocio
      const { UserBusinessPermission } = require('../models');
      await UserBusinessPermission.destroy({
        where: { userId, businessId }
      });

      return res.json({
        success: true,
        message: 'Permisos reseteados a los valores por defecto del rol'
      });
    } catch (error) {
      console.error('Error en resetToDefaults:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al resetear permisos'
      });
    }
  }
}

module.exports = PermissionController;
