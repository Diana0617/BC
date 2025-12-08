const RuleTemplateService = require('../services/RuleTemplateService');

class RuleTemplateController {
  
  // ================================
  // OWNER ENDPOINTS - Gestión de Plantillas
  // ================================

  /**
   * Crear nueva plantilla de regla (solo Owner)
   */
  static async createRuleTemplate(req, res) {
    try {
      const ownerId = req.user.id;
      const templateData = req.body;

      // Validar datos requeridos
      const requiredFields = ['key', 'name', 'description', 'type', 'category', 'defaultValue'];
      for (const field of requiredFields) {
        if (!templateData[field]) {
          return res.status(400).json({
            error: 'Datos incompletos',
            message: `El campo '${field}' es requerido`
          });
        }
      }

      const template = await RuleTemplateService.createRuleTemplate(ownerId, templateData);

      res.status(201).json({
        success: true,
        message: 'Plantilla de regla creada exitosamente',
        data: template
      });
    } catch (error) {
      console.error('Error en createRuleTemplate:', error);
      res.status(400).json({
        error: 'Error al crear plantilla',
        message: error.message
      });
    }
  }

  /**
   * Obtener todas las plantillas (para Owner)
   */
  static async getOwnerRuleTemplates(req, res) {
    try {
      const ownerId = req.user.id;
      const { page, limit, category, isActive, search } = req.query;

      const options = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        category,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search
      };

      const templates = await RuleTemplateService.getOwnerRuleTemplates(ownerId, options);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error en getOwnerRuleTemplates:', error);
      res.status(400).json({
        error: 'Error al obtener plantillas',
        message: error.message
      });
    }
  }

  /**
   * Obtener plantilla por ID
   */
  static async getRuleTemplateById(req, res) {
    try {
      const { templateId } = req.params;
      const userId = req.user?.id;

      const template = await RuleTemplateService.getRuleTemplateById(templateId, userId);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error en getRuleTemplateById:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        error: 'Error al obtener plantilla',
        message: error.message
      });
    }
  }

  /**
   * Actualizar plantilla existente
   */
  static async updateRuleTemplate(req, res) {
    try {
      const ownerId = req.user.id;
      const { templateId } = req.params;
      const updateData = req.body;

      const template = await RuleTemplateService.updateRuleTemplate(ownerId, templateId, updateData);

      res.json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: template
      });
    } catch (error) {
      console.error('Error en updateRuleTemplate:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        error: 'Error al actualizar plantilla',
        message: error.message
      });
    }
  }

  /**
   * Eliminar plantilla
   */
  static async deleteRuleTemplate(req, res) {
    try {
      const ownerId = req.user.id;
      const { templateId } = req.params;

      const result = await RuleTemplateService.deleteRuleTemplate(ownerId, templateId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteRuleTemplate:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        error: 'Error al eliminar plantilla',
        message: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de plantillas
   */
  static async getTemplateStats(req, res) {
    try {
      const ownerId = req.user.id;

      const stats = await RuleTemplateService.getTemplateStats(ownerId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error en getTemplateStats:', error);
      res.status(400).json({
        error: 'Error al obtener estadísticas',
        message: error.message
      });
    }
  }

  // ================================
  // PUBLIC ENDPOINTS - Consultar plantillas disponibles
  // ================================

  /**
   * Obtener todas las plantillas activas (público)
   */
  static async getRuleTemplates(req, res) {
    try {
      const { page, limit, category, search } = req.query;

      const options = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        category,
        search
      };

      const result = await RuleTemplateService.getRuleTemplates(options);

      res.json({
        success: true,
        data: result.templates,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: options.limit
        }
      });
    } catch (error) {
      console.error('Error en getRuleTemplates:', error);
      res.status(400).json({
        error: 'Error al obtener plantillas',
        message: error.message
      });
    }
  }

  // ================================
  // BUSINESS ENDPOINTS - Para uso de negocios
  // ================================

  /**
   * Obtener plantillas disponibles para un negocio
   */
  static async getBusinessAvailableTemplates(req, res) {
    try {
      const businessId = req.business?.id;
      if (!businessId) {
        return res.status(400).json({
          error: 'Negocio no identificado',
          message: 'No se pudo determinar el negocio para esta solicitud'
        });
      }

      const { category, search } = req.query;

      const options = {
        category,
        search
      };

      const templates = await RuleTemplateService.getBusinessAvailableTemplates(businessId, options);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error en getBusinessAvailableTemplates:', error);
      res.status(400).json({
        error: 'Error al obtener plantillas disponibles',
        message: error.message
      });
    }
  }

  /**
   * Obtener reglas efectivas de un negocio
   */
  static async getBusinessEffectiveRules(req, res) {
    try {
      const businessId = req.business?.id;
      if (!businessId) {
        return res.status(400).json({
          error: 'Negocio no identificado',
          message: 'No se pudo determinar el negocio para esta solicitud'
        });
      }

      const { category } = req.query;

      const options = {
        category
      };

      const rules = await RuleTemplateService.getBusinessEffectiveRules(businessId, options);

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Error en getBusinessEffectiveRules:', error);
      res.status(400).json({
        error: 'Error al obtener reglas efectivas',
        message: error.message
      });
    }
  }
}

module.exports = RuleTemplateController;
