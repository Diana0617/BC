class PaginationService {
  /**
   * Obtiene parámetros de paginación desde request
   * @param {Object} req - Request object
   * @returns {Object} Parámetros de paginación
   */
  static getPaginationParams(req) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Máximo 100
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Ejecuta paginación en un modelo
   * @param {Object} model - Modelo de Sequelize
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Resultado paginado
   */
  static async paginate(model, options = {}) {
    const { req, page: directPage, limit: directLimit, where = {}, include = [], order = [['createdAt', 'DESC']], attributes } = options;
    
    // Si se pasa page y limit directamente, usarlos; si no, obtenerlos de req
    let page, limit, offset;
    if (directPage && directLimit) {
      page = Math.max(1, parseInt(directPage) || 1);
      limit = Math.min(parseInt(directLimit) || 10, 100);
      offset = (page - 1) * limit;
    } else {
      const params = this.getPaginationParams(req || {});
      page = params.page;
      limit = params.limit;
      offset = params.offset;
    }
    
    const searchQuery = {
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    };
    
    // Agregar attributes si se proporciona
    if (attributes) {
      searchQuery.attributes = attributes;
    }

    const { count, rows } = await model.findAndCountAll(searchQuery);
    
    const totalPages = Math.ceil(count / limit);
    
    return {
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  }

  /**
   * Aplica filtros de búsqueda y ordenamiento
   * @param {Object} req - Request object
   * @param {Object} baseWhere - Condiciones base
   * @param {Array} searchFields - Campos permitidos para búsqueda
   * @returns {Object} Filtros aplicados
   */
  static applyFilters(req, baseWhere = {}, searchFields = []) {
    const { search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    let where = { ...baseWhere };
    let order = [[sortBy, sortOrder.toUpperCase()]];

    // Aplicar búsqueda si se proporciona
    if (search && searchFields.length > 0) {
      const { Op } = require('sequelize');
      const searchConditions = searchFields.map(field => ({
        [field]: {
          [Op.iLike]: `%${search}%`
        }
      }));

      where = {
        ...where,
        [Op.or]: searchConditions
      };
    }

    // Aplicar filtros adicionales desde query params
    const allowedFilters = ['status', 'category', 'type', 'isActive'];
    allowedFilters.forEach(filter => {
      if (req.query[filter]) {
        where[filter] = req.query[filter];
      }
    });

    return { where, order };
  }

  /**
   * Paginación con filtros y búsqueda
   * @param {Object} model - Modelo de Sequelize
   * @param {Object} options - Opciones completas
   * @returns {Object} Resultado paginado con filtros
   */
  static async paginateWithFilters(model, options = {}) {
    const { 
      req, 
      baseWhere = {}, 
      searchFields = [], 
      include = [],
      defaultSort = 'createdAt'
    } = options;

    const { page, limit, offset } = this.getPaginationParams(req);
    const { where, order } = this.applyFilters(req, baseWhere, searchFields);

    // Si no se especifica orden, usar el por defecto
    if (!req.query.sortBy) {
      order[0] = [defaultSort, 'DESC'];
    }

    const searchQuery = {
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    };

    const { count, rows } = await model.findAndCountAll(searchQuery);
    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      filters: {
        search: req.query.search,
        sortBy: req.query.sortBy || defaultSort,
        sortOrder: req.query.sortOrder || 'DESC'
      }
    };
  }

  /**
   * Validar parámetros de paginación
   * @param {Object} params - Parámetros a validar
   * @returns {Object} Parámetros validados
   */
  static validatePaginationParams(params) {
    const { page = 1, limit = 10, sortBy, sortOrder = 'DESC' } = params;
    
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const validatedSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return {
      page: validatedPage,
      limit: validatedLimit,
      sortBy: sortBy || 'createdAt',
      sortOrder: validatedSortOrder,
      offset: (validatedPage - 1) * validatedLimit
    };
  }

  /**
   * Generar metadata de paginación
   * @param {Number} count - Total de elementos
   * @param {Object} params - Parámetros de paginación
   * @returns {Object} Metadata de paginación
   */
  static generatePaginationMeta(count, params) {
    const { page, limit } = params;
    const totalPages = Math.ceil(count / limit);

    return {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      startItem: ((page - 1) * limit) + 1,
      endItem: Math.min(page * limit, count)
    };
  }
}

module.exports = PaginationService;