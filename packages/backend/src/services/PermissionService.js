const { Permission, RoleDefaultPermission, UserBusinessPermission, User } = require('../models');
const { Op } = require('sequelize');

class PermissionService {
  /**
   * Obtener todos los permisos efectivos de un usuario en un negocio
   * Combina permisos por defecto del rol + permisos personalizados
   */
  static async getUserEffectivePermissions(userId, businessId) {
    console.log('🔍 Buscando usuario:', userId, 'en negocio:', businessId);
    
    // Buscar usuario - puede tener businessId directo o estar asociado vía SpecialistProfile
    let user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'role', 'businessId']
    });

    console.log('👤 Usuario encontrado:', user ? { id: user.id, role: user.role, businessId: user.businessId } : 'NULL');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que el usuario pertenece a este negocio
    // (puede tener businessId directo, o estar asociado vía SpecialistProfile)
    if (user.businessId && user.businessId !== businessId) {
      throw new Error('El usuario no pertenece a este negocio');
    }

    // Si no tiene businessId directo, verificar via SpecialistProfile
    if (!user.businessId) {
      const { SpecialistProfile } = require('../models');
      const profile = await SpecialistProfile.findOne({
        where: { userId, businessId }
      });
      
      if (!profile) {
        throw new Error('Usuario no encontrado en este negocio');
      }
    }

    // 1. Obtener permisos por defecto del rol
    const defaultPermissions = await RoleDefaultPermission.findAll({
      where: { role: user.role, isGranted: true },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key', 'name', 'category', 'description']
      }]
    });

    // 2. Obtener permisos personalizados del usuario
    const customPermissions = await UserBusinessPermission.findAll({
      where: { userId, businessId },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key', 'name', 'category', 'description']
      }]
    });

    // 3. Combinar: personalizados sobrescriben defaults
    const permissionsMap = new Map();

    // Agregar defaults
    defaultPermissions.forEach(rp => {
      permissionsMap.set(rp.permission.key, {
        key: rp.permission.key,
        name: rp.permission.name,
        category: rp.permission.category,
        description: rp.permission.description,
        isGranted: true,
        source: 'role_default'
      });
    });

    // Sobrescribir con personalizados
    customPermissions.forEach(up => {
      permissionsMap.set(up.permission.key, {
        key: up.permission.key,
        name: up.permission.name,
        category: up.permission.category,
        description: up.permission.description,
        isGranted: up.isGranted,
        source: 'custom',
        grantedBy: up.grantedBy,
        grantedAt: up.grantedAt,
        notes: up.notes
      });
    });

    return Array.from(permissionsMap.values()).filter(p => p.isGranted);
  }

  /**
   * Verificar si un usuario tiene un permiso específico
   */
  static async hasPermission(userId, businessId, permissionKey) {
    const permissions = await this.getUserEffectivePermissions(userId, businessId);
    return permissions.some(p => p.key === permissionKey && p.isGranted);
  }

  /**
   * Conceder un permiso personalizado a un usuario
   */
  static async grantPermission(userId, businessId, permissionKey, grantedBy, notes = null) {
    const permission = await Permission.findOne({ where: { key: permissionKey } });
    
    if (!permission) {
      throw new Error(`Permiso '${permissionKey}' no existe`);
    }

    const [userPermission, created] = await UserBusinessPermission.findOrCreate({
      where: { userId, businessId, permissionId: permission.id },
      defaults: {
        isGranted: true,
        grantedBy,
        grantedAt: new Date(),
        notes
      }
    });

    if (!created) {
      userPermission.isGranted = true;
      userPermission.grantedBy = grantedBy;
      userPermission.grantedAt = new Date();
      userPermission.revokedAt = null;
      userPermission.notes = notes;
      await userPermission.save();
    }

    return userPermission;
  }

  /**
   * Revocar un permiso personalizado de un usuario
   */
  static async revokePermission(userId, businessId, permissionKey, revokedBy, notes = null) {
    const permission = await Permission.findOne({ where: { key: permissionKey } });
    
    if (!permission) {
      throw new Error(`Permiso '${permissionKey}' no existe`);
    }

    const userPermission = await UserBusinessPermission.findOne({
      where: { userId, businessId, permissionId: permission.id }
    });

    if (!userPermission) {
      // Crear entrada de revocación explícita
      return await UserBusinessPermission.create({
        userId,
        businessId,
        permissionId: permission.id,
        isGranted: false,
        grantedBy: revokedBy,
        revokedAt: new Date(),
        notes
      });
    }

    userPermission.isGranted = false;
    userPermission.revokedAt = new Date();
    userPermission.notes = notes;
    await userPermission.save();

    return userPermission;
  }

  /**
   * Obtener permisos por categoría
   */
  static async getPermissionsByCategory(category = null) {
    const where = category ? { category } : {};
    return await Permission.findAll({
      where,
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  }

  /**
   * Obtener diferencias entre permisos de un usuario y los defaults de su rol
   */
  static async getUserPermissionDifferences(userId, businessId) {
    // Buscar usuario (puede tener businessId directo o no)
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'role', 'businessId']
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si tiene businessId, verificar que coincida
    if (user.businessId && user.businessId !== businessId) {
      throw new Error('El usuario no pertenece a este negocio');
    }

    const defaultPermissions = await this.getRoleDefaultPermissions(user.role);
    const effectivePermissions = await this.getUserEffectivePermissions(userId, businessId);

    const granted = effectivePermissions.filter(p => 
      p.source === 'custom' && !defaultPermissions.some(d => d.key === p.key)
    );

    const revoked = defaultPermissions.filter(d => 
      !effectivePermissions.some(e => e.key === d.key)
    );

    return { granted, revoked };
  }

  /**
   * Obtener permisos por defecto de un rol
   */
  static async getRoleDefaultPermissions(role) {
    const rolePermissions = await RoleDefaultPermission.findAll({
      where: { role, isGranted: true },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['key', 'name', 'category', 'description']
      }]
    });

    return rolePermissions.map(rp => ({
      key: rp.permission.key,
      name: rp.permission.name,
      category: rp.permission.category,
      description: rp.permission.description
    }));
  }
}

module.exports = PermissionService;
