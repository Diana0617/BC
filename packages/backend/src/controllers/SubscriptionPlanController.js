const { SubscriptionPlan, Module, PlanModule, BusinessSubscription } = require('../models');
const PaginationService = require('../services/PaginationService');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class SubscriptionPlanController {
  
  /**
   * Obtener todos los planes de suscripción con paginación y filtros
   * GET /api/plans
   * Funciona tanto para rutas públicas como protegidas
   */
  static async getPlans(req, res) {
    try {
      // Para peticiones públicas, incluir módulos por defecto
      const defaultIncludeModules = !req.user ? 'true' : 'false';
      const { page = 1, limit = 10, status, search, includeModules = defaultIncludeModules } = req.query;
      
      // Construir filtros dinámicos
      const where = {};
      
      // Si la petición es pública (sin req.user), solo mostrar planes ACTIVOS
      if (!req.user) {
        where.status = 'ACTIVE';
      } else if (status) {
        // Si hay usuario autenticado, permitir filtrar por cualquier status
        where.status = status;
      }
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const options = {
        where,
        order: [['isPopular', 'DESC'], ['price', 'ASC']],
        include: []
      };
      
      // Incluir módulos si se solicita
      if (includeModules === 'true') {
        options.include.push({
          model: Module,
          as: 'modules',
          through: {
            model: PlanModule,
            attributes: ['isIncluded', 'limitQuantity', 'additionalPrice', 'configuration']
          },
          attributes: ['id', 'name', 'displayName', 'icon', 'category', 'status', 'pricing']
        });
      }
      
      const result = await PaginationService.paginate(SubscriptionPlan, {
        req,
        query: where,
        include: options.include,
        order: options.order
      });
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        filters: req.user ? {
          statuses: ['ACTIVE', 'INACTIVE', 'DEPRECATED']
        } : {
          statuses: ['ACTIVE'] // Solo ACTIVE para peticiones públicas
        }
      });
      
    } catch (error) {
      console.error('Error al obtener planes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtener un plan específico por ID
   * GET /api/plans/:id
   * Funciona tanto para rutas públicas como protegidas
   */
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      // Para peticiones públicas, incluir módulos por defecto
      const defaultIncludeModules = !req.user ? 'true' : 'true';
      const { includeModules = defaultIncludeModules } = req.query;
      
      const includeOptions = [];
      
      if (includeModules === 'true') {
        includeOptions.push({
          model: Module,
          as: 'modules',
          through: {
            model: PlanModule,
            attributes: ['isIncluded', 'limitQuantity', 'additionalPrice', 'configuration']
          }
        });
      }
      
      // DEBUGGING: Primero buscar el plan sin filtros para ver qué hay
      const planWithoutFilter = await SubscriptionPlan.findByPk(id);
      console.log(`🔍 [DEBUG] Plan sin filtros:`, planWithoutFilter ? {
        id: planWithoutFilter.id,
        name: planWithoutFilter.name,
        status: planWithoutFilter.status
      } : 'No encontrado');
      
      // Construir where clause basado en si es petición pública o no
      const whereClause = { id };
      
      // Si es petición pública (sin req.user), solo permitir planes ACTIVOS
      if (!req.user) {
        whereClause.status = 'ACTIVE';
        console.log(`🌐 [DEBUG] Petición pública - filtrando por status ACTIVE`);
      } else {
        console.log(`🔒 [DEBUG] Petición autenticada - sin filtro de status`);
      }
      
      const plan = await SubscriptionPlan.findOne({
        where: whereClause,
        include: includeOptions
      });
      
      if (!plan) {
        console.log(`❌ [DEBUG] Plan no encontrado con filtros:`, whereClause);
        return res.status(404).json({
          success: false,
          message: !req.user 
            ? 'Plan de suscripción no encontrado o no disponible públicamente'
            : 'Plan de suscripción no encontrado',
          debug: process.env.NODE_ENV === 'development' ? {
            searchCriteria: whereClause,
            planExistsWithoutFilter: !!planWithoutFilter,
            planStatusWithoutFilter: planWithoutFilter?.status
          } : undefined
        });
      }
      
      console.log(`✅ [DEBUG] Plan encontrado:`, {
        id: plan.id,
        name: plan.name,
        status: plan.status
      });
      
      res.status(200).json({
        success: true,
        data: plan
      });
      
    } catch (error) {
      console.error('Error al obtener el plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Crear un nuevo plan de suscripción
   * POST /api/plans
   */
  static async createPlan(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        name,
        description,
        price,
        currency = 'COP',
        duration,
        durationType = 'MONTHS',
        maxUsers,
        maxClients,
        maxAppointments,
        storageLimit,
        status = 'ACTIVE',
        isPopular = false,
        trialDays = 0,
        features = {},
        limitations = {},
        modules = [] // Array de { moduleId, isIncluded, limitQuantity, additionalPrice, configuration }
      } = req.body;
      
      // Validar que el nombre sea único
      const existingPlan = await SubscriptionPlan.findOne({ where: { name } });
      if (existingPlan) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Ya existe un plan con este nombre'
        });
      }
      
      // Validar módulos si se proporcionan
      if (modules.length > 0) {
        const moduleIds = modules.map(m => m.moduleId);
        const validModules = await Module.findAll({
          where: { id: { [Op.in]: moduleIds } }
        });
        
        if (validModules.length !== moduleIds.length) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Uno o más módulos no son válidos'
          });
        }
      }
      
      // Crear el plan
      const newPlan = await SubscriptionPlan.create({
        name,
        description,
        price,
        currency,
        duration,
        durationType,
        maxUsers,
        maxClients,
        maxAppointments,
        storageLimit,
        status,
        isPopular,
        trialDays,
        features,
        limitations
      }, { transaction });
      
      // Asociar módulos al plan
      if (modules.length > 0) {
        const planModuleData = modules.map(module => ({
          subscriptionPlanId: newPlan.id,
          moduleId: module.moduleId,
          isIncluded: module.isIncluded !== undefined ? module.isIncluded : true,
          limitQuantity: module.limitQuantity || null,
          additionalPrice: module.additionalPrice || 0,
          configuration: module.configuration || {}
        }));
        
        await PlanModule.bulkCreate(planModuleData, { transaction });
      }
      
      await transaction.commit();
      
      // Obtener el plan completo con módulos
      const planWithModules = await SubscriptionPlan.findByPk(newPlan.id, {
        include: [{
          model: Module,
          as: 'modules',
          through: {
            model: PlanModule,
            attributes: ['isIncluded', 'limitQuantity', 'additionalPrice', 'configuration']
          }
        }]
      });
      
      res.status(201).json({
        success: true,
        data: planWithModules,
        message: 'Plan de suscripción creado exitosamente'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear el plan:', error);
      
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
   * Actualizar un plan de suscripción existente
   * PUT /api/plans/:id
   */
  static async updatePlan(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updateData = req.body;
      const { modules } = updateData;
      
      const plan = await SubscriptionPlan.findByPk(id);
      if (!plan) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }
      
      // Si se está actualizando el nombre, verificar que sea único
      if (updateData.name && updateData.name !== plan.name) {
        const existingPlan = await SubscriptionPlan.findOne({ 
          where: { 
            name: updateData.name,
            id: { [Op.ne]: id }
          } 
        });
        
        if (existingPlan) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Ya existe un plan con este nombre'
          });
        }
      }
      
      // Actualizar el plan (excluir modules del updateData)
      const { modules: _, ...planUpdateData } = updateData;
      await plan.update(planUpdateData, { transaction });
      
      // Actualizar módulos si se proporcionan
      if (modules && Array.isArray(modules)) {
        // Eliminar asociaciones existentes
        await PlanModule.destroy({
          where: { subscriptionPlanId: id },
          transaction
        });
        
        // Validar módulos
        if (modules.length > 0) {
          const moduleIds = modules.map(m => m.moduleId);
          const validModules = await Module.findAll({
            where: { id: { [Op.in]: moduleIds } }
          });
          
          if (validModules.length !== moduleIds.length) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Uno o más módulos no son válidos'
            });
          }
          
          // Crear nuevas asociaciones
          const planModuleData = modules.map(module => ({
            subscriptionPlanId: id,
            moduleId: module.moduleId,
            isIncluded: module.isIncluded !== undefined ? module.isIncluded : true,
            limitQuantity: module.limitQuantity || null,
            additionalPrice: module.additionalPrice || 0,
            configuration: module.configuration || {}
          }));
          
          await PlanModule.bulkCreate(planModuleData, { transaction });
        }
      }
      
      await transaction.commit();
      
      // Obtener el plan actualizado con módulos
      const updatedPlan = await SubscriptionPlan.findByPk(id, {
        include: [{
          model: Module,
          as: 'modules',
          through: {
            model: PlanModule,
            attributes: ['isIncluded', 'limitQuantity', 'additionalPrice', 'configuration']
          }
        }]
      });
      
      res.status(200).json({
        success: true,
        data: updatedPlan,
        message: 'Plan de suscripción actualizado exitosamente'
      });
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar el plan:', error);
      
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
   * Eliminar un plan de suscripción (marcar como DEPRECATED)
   * DELETE /api/plans/:id
   */
  static async deletePlan(req, res) {
    try {
      const { id } = req.params;
      
      const plan = await SubscriptionPlan.findByPk(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }
      
      // Verificar si el plan está siendo usado por algún negocio
      const activeSubscriptions = await BusinessSubscription.count({
        where: { 
          subscriptionPlanId: id,
          status: { [Op.in]: ['ACTIVE', 'TRIAL'] }
        }
      });
      
      if (activeSubscriptions > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el plan porque tiene ${activeSubscriptions} suscripción(es) activa(s)`
        });
      }
      
      // Marcar como DEPRECATED en lugar de eliminar
      await plan.update({ status: 'DEPRECATED' });
      
      res.status(200).json({
        success: true,
        message: 'Plan marcado como obsoleto exitosamente'
      });
      
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Cambiar estado de un plan
   * PATCH /api/plans/:id/status
   */
  static async updatePlanStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DEPRECATED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
        });
      }
      
      const plan = await SubscriptionPlan.findByPk(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }
      
      await plan.update({ status });
      
      res.status(200).json({
        success: true,
        data: plan,
        message: `Estado del plan actualizado a ${status}`
      });
      
    } catch (error) {
      console.error('Error al actualizar estado del plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Toggle del estado del plan (ACTIVE <-> INACTIVE)
   * PATCH /api/plans/:id/toggle-status
   */
  static async togglePlanStatus(req, res) {
    try {
      const { id } = req.params;
      
      const plan = await SubscriptionPlan.findByPk(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de suscripción no encontrado'
        });
      }
      
      // Toggle entre ACTIVE e INACTIVE
      const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      
      await plan.update({ status: newStatus });
      
      res.status(200).json({
        success: true,
        data: plan,
        message: `Estado del plan cambiado de ${plan.status} a ${newStatus}`
      });
      
    } catch (error) {
      console.error('Error al cambiar estado del plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Obtener módulos disponibles para planes
   * GET /api/plans/available-modules
   */
  static async getAvailableModules(req, res) {
    try {
      const { category, status = 'ACTIVE' } = req.query;
      
      const where = { status };
      if (category) {
        where.category = category;
      }
      
      const modules = await Module.findAll({
        where,
        order: [['category', 'ASC'], ['name', 'ASC']],
        attributes: ['id', 'name', 'displayName', 'description', 'icon', 'category', 'pricing', 'requiresConfiguration']
      });
      
      // Agrupar por categoría
      const modulesByCategory = modules.reduce((acc, module) => {
        if (!acc[module.category]) {
          acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
      }, {});
      
      res.status(200).json({
        success: true,
        data: {
          modules: modulesByCategory,
          total: modules.length
        }
      });
      
    } catch (error) {
      console.error('Error al obtener módulos disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Calcular precio total de un plan basado en módulos seleccionados
   * POST /api/plans/calculate-price
   */
  static async calculatePlanPrice(req, res) {
    try {
      const { modules = [], basePlanPrice = 0 } = req.body;
      
      if (!Array.isArray(modules) || modules.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            basePrice: basePlanPrice,
            modulesPrice: 0,
            totalPrice: basePlanPrice,
            breakdown: []
          }
        });
      }
      
      const moduleIds = modules.map(m => m.moduleId);
      const moduleData = await Module.findAll({
        where: { id: { [Op.in]: moduleIds } },
        attributes: ['id', 'name', 'displayName', 'pricing']
      });
      
      let modulesPrice = 0;
      const breakdown = [];
      
      modules.forEach(selectedModule => {
        const moduleInfo = moduleData.find(m => m.id === selectedModule.moduleId);
        if (moduleInfo) {
          const modulePrice = selectedModule.additionalPrice || moduleInfo.pricing?.price || 0;
          modulesPrice += modulePrice;
          
          breakdown.push({
            moduleId: moduleInfo.id,
            name: moduleInfo.displayName,
            price: modulePrice,
            isIncluded: selectedModule.isIncluded
          });
        }
      });
      
      const totalPrice = basePlanPrice + modulesPrice;
      
      res.status(200).json({
        success: true,
        data: {
          basePrice: basePlanPrice,
          modulesPrice,
          totalPrice,
          breakdown
        }
      });
      
    } catch (error) {
      console.error('Error al calcular precio del plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = SubscriptionPlanController;