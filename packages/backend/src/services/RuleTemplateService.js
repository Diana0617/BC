const RuleTemplate = require('../models/RuleTemplate');
const BusinessRule = require('../models/BusinessRule');
const Business = require('../models/Business');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sequelize: dbSequelize } = require('../config/database');

class RuleTemplateService {
  
  // ================================
  // OWNER FUNCTIONS - Gestión de Plantillas
  // ================================

  /**
   * Crear nueva plantilla de regla (solo Owner)
   */
  static async createRuleTemplate(ownerId, templateData) {
    try {
      // Validar que el usuario sea Owner
      const owner = await User.findOne({
        where: { id: ownerId, role: 'OWNER' }
      });
      
      if (!owner) {
        throw new Error('Solo los Owners pueden crear plantillas de reglas');
      }

      // Validar clave única y formato
      await this.validateUniqueKey(templateData.key);
      this.validateKeyFormat(templateData.key);
      this.validateValueType(templateData.type, templateData.defaultValue);

      // Crear la nueva plantilla
      const template = await RuleTemplate.create({
        key: templateData.key,
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        category: templateData.category,
        defaultValue: templateData.defaultValue,
        validationRules: templateData.validationRules,
        isActive: templateData.isActive !== false,
        createdBy: ownerId,
        updatedBy: ownerId
      });

      return template;
    } catch (error) {
      throw new Error(`Error al crear plantilla de regla: ${error.message}`);
    }
  }

  /**
   * Actualizar plantilla existente
   */
  static async updateRuleTemplate(ownerId, templateId, updateData) {
    try {
      const owner = await User.findOne({
        where: { id: ownerId, role: 'OWNER' }
      });
      
      if (!owner) {
        throw new Error('Solo los Owners pueden actualizar plantillas de reglas');
      }

      const template = await RuleTemplate.findOne({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Plantilla de regla no encontrada');
      }

      // Validar clave si se está actualizando
      if (updateData.key && updateData.key !== template.key) {
        await this.validateUniqueKey(updateData.key, templateId);
        this.validateKeyFormat(updateData.key);
      }

      // Validar tipo de valor si se está actualizando
      if (updateData.defaultValue !== undefined) {
        const ruleType = updateData.type || template.type;
        this.validateValueType(ruleType, updateData.defaultValue);
      }

      // Actualizar campos permitidos
      const allowedFields = ['key', 'name', 'description', 'defaultValue', 'validationRules', 'isActive'];
      const updateFields = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      }
      
      updateFields.updatedBy = ownerId;

      await template.update(updateFields);
      return await template.reload();
    } catch (error) {
      throw new Error(`Error al actualizar plantilla: ${error.message}`);
    }
  }

  /**
   * Eliminar plantilla
   */
  static async deleteRuleTemplate(ownerId, templateId) {
    try {
      const owner = await User.findOne({
        where: { id: ownerId, role: 'OWNER' }
      });
      
      if (!owner) {
        throw new Error('Solo los Owners pueden eliminar plantillas de reglas');
      }

      // Verificar que no haya reglas de negocio usando esta plantilla
      const businessRulesCount = await BusinessRule.count({
        where: { ruleTemplateId: templateId }
      });

      if (businessRulesCount > 0) {
        throw new Error('No se puede eliminar la plantilla porque está siendo utilizada por reglas de negocio');
      }

      const template = await RuleTemplate.findOne({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Plantilla de regla no encontrada');
      }

      await template.destroy();
      return { success: true, message: 'Plantilla eliminada correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar plantilla: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de plantillas
   */
  static async getTemplateStats(ownerId) {
    try {
      const owner = await User.findOne({
        where: { id: ownerId, role: 'OWNER' }
      });
      
      if (!owner) {
        throw new Error('Solo los Owners pueden ver estadísticas');
      }

      const totalTemplates = await RuleTemplate.count();
      const activeTemplates = await RuleTemplate.count({
        where: { isActive: true }
      });

      // Estadísticas por categoría
      const categoriesStats = await RuleTemplate.findAll({
        attributes: [
          'category',
          [dbSequelize.fn('COUNT', dbSequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      return {
        totalTemplates,
        activeTemplates,
        inactiveTemplates: totalTemplates - activeTemplates,
        categoriesStats
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Listar todas las plantillas (para Owner)
   */
  static async getOwnerRuleTemplates(ownerId, options = {}) {
    try {
      const owner = await User.findOne({
        where: { id: ownerId, role: 'OWNER' }
      });
      
      if (!owner) {
        throw new Error('Solo los Owners pueden ver todas las plantillas');
      }

      const { page = 1, limit = 20, category, isActive, search } = options;
      
      const whereClause = {};
      
      if (category) {
        whereClause.category = category;
      }
      
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { key: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const templates = await RuleTemplate.findAll({
        where: whereClause,
        order: [['category', 'ASC'], ['key', 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
        // Temporalmente removemos el include hasta que las asociaciones estén configuradas
        // include: [
        //   {
        //     model: User,
        //     as: 'creator',
        //     attributes: ['id', 'firstName', 'lastName', 'email']
        //   }
        // ]
      });

      return templates;
    } catch (error) {
      throw new Error(`Error al obtener plantillas: ${error.message}`);
    }
  }

  /**
   * Obtener plantilla por ID
   */
  static async getRuleTemplateById(templateId, userId = null) {
    try {
      const template = await RuleTemplate.findOne({
        where: { id: templateId }
        // Temporalmente removemos el include hasta que las asociaciones estén configuradas
        // include: [
        //   {
        //     model: User,
        //     as: 'creator',
        //     attributes: ['id', 'firstName', 'lastName', 'email']
        //   }
        // ]
      });

      if (!template) {
        throw new Error('Plantilla de regla no encontrada');
      }

      return template;
    } catch (error) {
      throw new Error(`Error al obtener plantilla: ${error.message}`);
    }
  }

  /**
   * Obtener todas las plantillas activas (públicas)
   */
  static async getRuleTemplates(options = {}) {
    try {
      const { category, search, page = 1, limit = 50 } = options;
      
      const whereClause = {
        isActive: true
      };
      
      if (category) {
        whereClause.category = category;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { key: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const templates = await RuleTemplate.findAndCountAll({
        where: whereClause,
        order: [['category', 'ASC'], ['key', 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      });

      return {
        templates: templates.rows,
        total: templates.count,
        page,
        totalPages: Math.ceil(templates.count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener plantillas: ${error.message}`);
    }
  }

  // ================================
  // BUSINESS FUNCTIONS - Usar plantillas
  // ================================

  /**
   * Obtener plantillas disponibles para un negocio
   */
  static async getBusinessAvailableTemplates(businessId, options = {}) {
    try {
      const business = await Business.findOne({
        where: { id: businessId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      const { category, search } = options;
      
      const whereClause = {
        isActive: true
      };
      
      if (category) {
        whereClause.category = category;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { key: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const templates = await RuleTemplate.findAll({
        where: whereClause,
        order: [['category', 'ASC'], ['key', 'ASC']]
      });

      return templates;
    } catch (error) {
      throw new Error(`Error al obtener plantillas disponibles: ${error.message}`);
    }
  }

  /**
   * Obtener reglas efectivas de un negocio (con valores personalizados)
   */
  static async getBusinessEffectiveRules(businessId, options = {}) {
    try {
      const business = await Business.findOne({
        where: { id: businessId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      const { category } = options;
      
      const whereClause = {
        isActive: true
      };
      
      if (category) {
        whereClause.category = category;
      }

      // Query usando COALESCE para obtener valor efectivo (personalizado o por defecto)
      const query = `
        SELECT 
          rt.*,
          COALESCE(br."customValue", rt."defaultValue") as "effectiveValue",
          br."customValue",
          br."createdAt" as "customizedAt",
          br."updatedBy" as "customizedBy"
        FROM "RuleTemplates" rt
        LEFT JOIN "BusinessRules" br ON rt.id = br."ruleTemplateId" AND br."businessId" = :businessId
        WHERE rt."isActive" = true
        ${category ? 'AND rt.category = :category' : ''}
        ORDER BY rt.category, rt.key
      `;

      const rules = await dbSequelize.query(query, {
        replacements: { businessId, ...(category && { category }) },
        type: dbSequelize.QueryTypes.SELECT
      });

      return rules;
    } catch (error) {
      throw new Error(`Error al obtener reglas efectivas: ${error.message}`);
    }
  }

  // ================================
  // VALIDATION HELPERS
  // ================================

  /**
   * Validar que la clave de la plantilla sea única
   */
  static async validateUniqueKey(key, excludeId = null) {
    const whereClause = { key };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingTemplate = await RuleTemplate.findOne({
      where: whereClause
    });

    if (existingTemplate) {
      throw new Error(`Ya existe una plantilla con la clave '${key}'`);
    }

    return true;
  }

  /**
   * Validar formato de clave de plantilla
   */
  static validateKeyFormat(key) {
    const keyRegex = /^[A-Z_][A-Z0-9_]*$/;
    if (!keyRegex.test(key)) {
      throw new Error('La clave debe estar en formato UPPER_SNAKE_CASE (ej: MAX_APPOINTMENTS_PER_DAY)');
    }
    return true;
  }

  /**
   * Validar tipo de valor según el tipo de regla
   */
  static validateValueType(ruleType, value) {
    switch (ruleType) {
      case 'NUMBER':
      case 'NUMERIC': // backwards compatibility
        if (typeof value !== 'number' && !Number.isFinite(Number(value))) {
          throw new Error('El valor debe ser numérico');
        }
        break;
      case 'BOOLEAN':
        if (typeof value !== 'boolean') {
          throw new Error('El valor debe ser booleano (true/false)');
        }
        break;
      case 'STRING':
      case 'TEXT': // backwards compatibility
        if (typeof value !== 'string') {
          throw new Error('El valor debe ser texto');
        }
        break;
      case 'JSON':
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          } else if (typeof value !== 'object') {
            throw new Error('Invalid JSON');
          }
        } catch {
          throw new Error('El valor debe ser un JSON válido');
        }
        break;
      case 'ARRAY':
        if (!Array.isArray(value)) {
          throw new Error('El valor debe ser un array');
        }
        break;
      case 'CONFIGURATION':
        // CONFIGURATION permite cualquier objeto JSON válido
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error('El valor debe ser un objeto de configuración válido');
        }
        break;
      default:
        throw new Error('Tipo de regla no válido');
    }
    return true;
  }
}

module.exports = RuleTemplateService;
