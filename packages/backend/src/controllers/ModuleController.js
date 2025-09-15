const { Module, PlanModule, SubscriptionPlan } = require('../models');
const PaginationService = require('../services/PaginationService');
const { Op } = require('sequelize');

class ModuleController {
  
  /**
   * Obtener todos los módulos con paginación y filtros
   * GET /api/modules
   */
  static async getModules(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      
      // Construir filtros dinámicos
      const where = {};
      
      if (category) {
        where.category = category;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { displayName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const paginationOptions = {
        req,
        query: {
          where,
          attributes: {
            exclude: ['configurationSchema'] // Excluir esquemas de configuración por defecto
          }
        },
        include: [],
        order: [['name', 'ASC']]
      };
      
      const result = await PaginationService.paginate(Module, paginationOptions);
      
      res.status(200).json({
        success: true,
        data: result.data, // Los módulos van en result.data
        pagination: result.pagination,
        filters: {
          categories: await ModuleController._getAvailableCategories(),
          statuses: ['ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'DEPRECATED']
        }
      });
      
    } catch (error) {
      console.error('Error al obtener módulos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtener un módulo específico por ID
   * GET /api/modules/:id
   */
  static async getModuleById(req, res) {
    try {
      const { id } = req.params;
      
      const module = await Module.findByPk(id, {
        include: [
          {
            model: SubscriptionPlan,
            as: 'plans', // Usar el alias correcto definido en las asociaciones
            through: { 
              attributes: ['isIncluded', 'limitQuantity', 'additionalPrice'] 
            }
          }
        ]
      });
      
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: module
      });
      
    } catch (error) {
      console.error('Error al obtener el módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Crear un nuevo módulo
   * POST /api/modules
   */
  static async createModule(req, res) {
    try {
      const {
        name,
        displayName,
        description,
        icon,
        category,
        status = 'DEVELOPMENT',
        version = '1.0.0',
        requiresConfiguration = false,
        configurationSchema,
        permissions = [],
        dependencies = [],
        pricing = { type: 'FREE', price: 0, currency: 'COP' }
      } = req.body;
      
      // Validar que el nombre sea único
      const existingModule = await Module.findOne({ where: { name } });
      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un módulo con este nombre'
        });
      }
      
      // Validar dependencias si existen
      if (dependencies.length > 0) {
        const dependencyModules = await Module.findAll({
          where: { id: { [Op.in]: dependencies } }
        });
        
        if (dependencyModules.length !== dependencies.length) {
          return res.status(400).json({
            success: false,
            message: 'Una o más dependencias no son válidas'
          });
        }
      }
      
      const newModule = await Module.create({
        name,
        displayName,
        description,
        icon,
        category,
        status,
        version,
        requiresConfiguration,
        configurationSchema,
        permissions,
        dependencies,
        pricing
      });
      
      res.status(201).json({
        success: true,
        data: newModule,
        message: 'Módulo creado exitosamente'
      });
      
    } catch (error) {
      console.error('Error al crear el módulo:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Actualizar un módulo existente
   * PUT /api/modules/:id
   */
  static async updateModule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const module = await Module.findByPk(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      // Si se está actualizando el nombre, verificar que sea único
      if (updateData.name && updateData.name !== module.name) {
        const existingModule = await Module.findOne({ 
          where: { 
            name: updateData.name,
            id: { [Op.ne]: id }
          } 
        });
        
        if (existingModule) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un módulo con este nombre'
          });
        }
      }
      
      // Validar dependencias si se están actualizando
      if (updateData.dependencies && updateData.dependencies.length > 0) {
        const dependencyModules = await Module.findAll({
          where: { id: { [Op.in]: updateData.dependencies } }
        });
        
        if (dependencyModules.length !== updateData.dependencies.length) {
          return res.status(400).json({
            success: false,
            message: 'Una o más dependencias no son válidas'
          });
        }
      }
      
      // Auto-incrementar versión cuando se actualiza el módulo
      // (excepto si se está actualizando explícitamente la versión)
      if (!updateData.version) {
        const currentVersion = module.version || '1.0.0';
        const versionParts = currentVersion.split('.').map(Number);
        
        // Incrementar versión patch (tercer número)
        versionParts[2] = (versionParts[2] || 0) + 1;
        updateData.version = versionParts.join('.');
        
        console.log(`📦 Auto-incrementando versión de ${currentVersion} a ${updateData.version}`);
      }
      
      await module.update(updateData);
      
      res.status(200).json({
        success: true,
        data: module,
        message: 'Módulo actualizado exitosamente'
      });
      
    } catch (error) {
      console.error('Error al actualizar el módulo:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Eliminar un módulo (soft delete - marca como DEPRECATED)
   * DELETE /api/modules/:id
   */
  static async deleteModule(req, res) {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query; // Query param para eliminación permanente
      
      const module = await Module.findByPk(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      // Si es eliminación permanente
      if (permanent === 'true' || permanent === true) {
        // Verificar si el módulo está siendo usado en algún plan
        const planModules = await PlanModule.findAll({ where: { moduleId: id } });
        if (planModules.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'No se puede eliminar permanentemente el módulo porque está siendo usado en uno o más planes de suscripción'
          });
        }
        
        // Eliminar permanentemente
        await module.destroy();
        
        return res.status(200).json({
          success: true,
          message: 'Módulo eliminado permanentemente'
        });
      }
      
      // Eliminación suave (soft delete) - marcar como DEPRECATED
      await module.update({ status: 'DEPRECATED' });
      
      res.status(200).json({
        success: true,
        message: 'Módulo marcado como obsoleto exitosamente'
      });
      
    } catch (error) {
      console.error('Error al eliminar el módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Eliminar permanentemente un módulo
   * DELETE /api/modules/:id/permanent
   */
  static async deleteModulePermanently(req, res) {
    try {
      const { id } = req.params;
      
      const module = await Module.findByPk(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      // Verificar si el módulo está siendo usado en algún plan
      const planModules = await PlanModule.findAll({ where: { moduleId: id } });
      if (planModules.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar permanentemente el módulo porque está siendo usado en uno o más planes de suscripción',
          affectedPlans: planModules.length
        });
      }
      
      // Guardar información del módulo antes de eliminarlo
      const moduleInfo = {
        name: module.name,
        displayName: module.displayName,
        version: module.version
      };
      
      // Eliminar permanentemente
      await module.destroy();
      
      console.log(`🗑️ Módulo eliminado permanentemente: ${moduleInfo.displayName} (${moduleInfo.name}) v${moduleInfo.version}`);
      
      res.status(200).json({
        success: true,
        message: `Módulo "${moduleInfo.displayName}" eliminado permanentemente`,
        deletedModule: moduleInfo
      });
      
    } catch (error) {
      console.error('Error al eliminar permanentemente el módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cambiar estado de un módulo
   * PATCH /api/modules/:id/status
   */
  static async updateModuleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'DEPRECATED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
        });
      }
      
      const module = await Module.findByPk(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      await module.update({ status });
      
      res.status(200).json({
        success: true,
        data: module,
        message: `Estado del módulo actualizado a ${status}`
      });
      
    } catch (error) {
      console.error('Error al actualizar estado del módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtener módulos por categoría
   * GET /api/modules/category/:category
   */
  static async getModulesByCategory(req, res) {
    try {
      const { category } = req.params;
      const { status = 'ACTIVE' } = req.query;
      
      const modules = await Module.findAll({
        where: { 
          category,
          status
        },
        order: [['name', 'ASC']],
        attributes: {
          exclude: ['configurationSchema']
        }
      });
      
      res.status(200).json({
        success: true,
        data: modules,
        category,
        count: modules.length
      });
      
    } catch (error) {
      console.error('Error al obtener módulos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtener dependencias de un módulo
   * GET /api/modules/:id/dependencies
   */
  static async getModuleDependencies(req, res) {
    try {
      const { id } = req.params;
      
      const module = await Module.findByPk(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Módulo no encontrado'
        });
      }
      
      if (!module.dependencies || module.dependencies.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'Este módulo no tiene dependencias'
        });
      }
      
      const dependencies = await Module.findAll({
        where: { id: { [Op.in]: module.dependencies } },
        attributes: ['id', 'name', 'displayName', 'status']
      });
      
      res.status(200).json({
        success: true,
        data: dependencies
      });
      
    } catch (error) {
      console.error('Error al obtener dependencias del módulo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Método auxiliar para obtener categorías disponibles
   */
  static async _getAvailableCategories() {
    return [
      'CORE', 
      'APPOINTMENTS', 
      'PAYMENTS', 
      'INVENTORY', 
      'REPORTS', 
      'INTEGRATIONS',
      'COMMUNICATIONS',
      'ANALYTICS'
    ];
  }
}

module.exports = ModuleController;