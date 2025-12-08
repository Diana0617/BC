const { User, Business } = require('../models');

class TenancyService {
  /**
   * Agrega filtro de tenancy a una consulta
   * @param {Object} query - Consulta de Sequelize
   * @param {String} businessId - ID del negocio
   * @param {String} userRole - Rol del usuario
   * @returns {Object} Consulta modificada
   */
  static addTenancyFilter(query, businessId, userRole = null) {
    // Para Owner (BC), no aplicar filtro de tenancy
    if (userRole === 'OWNER') {
      return query;
    }

    // Para todos los demás roles, filtrar por businessId
    if (query.where) {
      query.where.businessId = businessId;
    } else {
      query.where = { businessId };
    }

    return query;
  }

  /**
   * Valida que un usuario tenga acceso a un negocio específico
   * @param {String} userId - ID del usuario
   * @param {String} businessId - ID del negocio
   * @returns {Boolean} True si tiene acceso
   */
  static async validateBusinessAccess(userId, businessId) {
    try {
      const user = await User.findOne({
        where: { 
          id: userId,
          businessId: businessId,
          status: 'ACTIVE'
        }
      });

      return !!user;
    } catch (error) {
      console.error('Error validando acceso al negocio:', error);
      return false;
    }
  }

  /**
   * Valida que un usuario sea Owner (BC)
   * @param {String} userId - ID del usuario
   * @returns {Boolean} True si es Owner
   */
  static async validateOwnerAccess(userId) {
    try {
      const user = await User.findOne({
        where: { 
          id: userId,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });

      return !!user;
    } catch (error) {
      console.error('Error validando acceso de Owner:', error);
      return false;
    }
  }

  /**
   * Obtiene todos los negocios accesibles para un usuario
   * @param {String} userId - ID del usuario
   * @param {String} userRole - Rol del usuario
   * @returns {Array} Lista de negocios
   */
  static async getAccessibleBusinesses(userId, userRole) {
    try {
      if (userRole === 'OWNER') {
        // Owner puede ver todos los negocios
        return await Business.findAll({
          where: { status: ['ACTIVE', 'TRIAL', 'INACTIVE'] }
        });
      }

      // Otros roles solo ven su negocio
      const user = await User.findOne({
        where: { id: userId },
        include: [{
          model: Business,
          as: 'business'
        }]
      });

      return user && user.business ? [user.business] : [];
    } catch (error) {
      console.error('Error obteniendo negocios accesibles:', error);
      return [];
    }
  }

  /**
   * Valida que un recurso pertenezca al negocio del usuario
   * @param {Object} resource - Recurso a validar
   * @param {String} businessId - ID del negocio del usuario
   * @param {String} userRole - Rol del usuario
   * @returns {Boolean} True si el acceso es válido
   */
  static validateResourceAccess(resource, businessId, userRole) {
    // Owner puede acceder a cualquier recurso
    if (userRole === 'OWNER') {
      return true;
    }

    // Para otros roles, el recurso debe pertenecer al mismo negocio
    return resource && resource.businessId === businessId;
  }

  /**
   * Filtra una lista de recursos por tenancy
   * @param {Array} resources - Lista de recursos
   * @param {String} businessId - ID del negocio
   * @param {String} userRole - Rol del usuario
   * @returns {Array} Recursos filtrados
   */
  static filterResourcesByTenancy(resources, businessId, userRole) {
    if (userRole === 'OWNER') {
      return resources;
    }

    return resources.filter(resource => 
      resource.businessId === businessId
    );
  }

  /**
   * Aplica filtros de paginación y tenancy
   * @param {Object} model - Modelo de Sequelize
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Resultado paginado
   */
  static async findWithTenancy(model, options = {}) {
    const { 
      businessId, 
      userRole, 
      page = 1, 
      limit = 10, 
      where = {}, 
      include = [], 
      order = [['createdAt', 'DESC']] 
    } = options;

    // Aplicar filtro de tenancy
    const filteredWhere = this.addTenancyFilter({ where }, businessId, userRole).where;

    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
      where: filteredWhere,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

module.exports = TenancyService;