const { 
  BusinessRuleTemplate, 
  BusinessRuleAssignment, 
  BusinessRules, 
  Business, 
  User 
} = require('../models');
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

      // Validar dependencias y conflictos
      await this.validateTemplateDependencies(templateData);

      const template = await BusinessRuleTemplate.create({
        ...templateData,
        createdBy: ownerId,
        version: '1.0.0',
        usageCount: 0
      });

      return template;
    } catch (error) {
      console.error('Error creating rule template:', error);
      throw error;
    }
  }

  /**
   * Actualizar plantilla de regla existente
   */
  static async updateRuleTemplate(ownerId, templateId, updateData) {
    try {
      const template = await BusinessRuleTemplate.findOne({
        where: { id: templateId, createdBy: ownerId }
      });

      if (!template) {
        throw new Error('Plantilla no encontrada o no autorizada');
      }

      // Incrementar versión
      const versionParts = template.version.split('.');
      const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;

      await template.update({
        ...updateData,
        version: newVersion,
        lastModified: new Date()
      });

      // Si hay cambios significativos, marcar actualizaciones pendientes
      if (this.hasSignificantChanges(template.ruleValue, updateData.ruleValue)) {
        await this.markPendingUpdates(templateId);
      }

      return template;
    } catch (error) {
      console.error('Error updating rule template:', error);
      throw error;
    }
  }

  /**
   * Eliminar plantilla de regla
   */
  static async deleteRuleTemplate(ownerId, templateId) {
    try {
      const template = await BusinessRuleTemplate.findOne({
        where: { id: templateId, createdBy: ownerId }
      });

      if (!template) {
        throw new Error('Plantilla no encontrada o no autorizada');
      }

      // Verificar si hay asignaciones activas
      const activeAssignments = await BusinessRuleAssignment.count({
        where: { ruleTemplateId: templateId, isActive: true }
      });

      if (activeAssignments > 0) {
        throw new Error('No se puede eliminar una plantilla con asignaciones activas');
      }

      await template.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting rule template:', error);
      throw error;
    }
  }

  /**
   * Alternar estado de regla asignada
   */
  static async toggleRuleAssignment(businessId, assignmentId, isActive) {
    try {
      const assignment = await BusinessRuleAssignment.findOne({
        where: { id: assignmentId, businessId }
      });

      if (!assignment) {
        throw new Error('Asignación de regla no encontrada');
      }

      await assignment.update({ isActive });

      // Actualizar regla efectiva
      await BusinessRules.update({
        isActive
      }, {
        where: { ruleAssignmentId: assignmentId }
      });

      return assignment;
    } catch (error) {
      console.error('Error toggling rule assignment:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de plantillas de regla
   */
  static async getRuleTemplateStats() {
    try {
      const totalTemplates = await BusinessRuleTemplate.count();
      const activeTemplates = await BusinessRuleTemplate.count({
        where: { isActive: true }
      });
      
      const totalUsage = await BusinessRuleAssignment.count({
        where: { isActive: true }
      });

      const categoriesStats = await BusinessRuleTemplate.findAll({
        attributes: [
          'category',
          [dbSequelize.fn('COUNT', dbSequelize.col('id')), 'count'],
          [dbSequelize.fn('SUM', dbSequelize.col('usageCount')), 'usage']
        ],
        group: ['category'],
        raw: true
      });

      const businessTypesStats = await BusinessRuleTemplate.findAll({
        attributes: [
          'businessTypes',
          [dbSequelize.fn('COUNT', dbSequelize.col('id')), 'count']
        ],
        group: ['businessTypes'],
        raw: true
      });

      return {
        totalTemplates,
        activeTemplates,
        totalUsage,
        categoriesStats,
        businessTypesStats
      };
    } catch (error) {
      console.error('Error getting rule template stats:', error);
      throw error;
    }
  }
  static async getOwnerRuleTemplates(ownerId, filters = {}) {
    try {
      const whereClause = { createdBy: ownerId };
      
      if (filters.category) {
        whereClause.category = filters.category;
      }
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      if (filters.businessType) {
        whereClause.businessTypes = {
          [Op.contains]: [filters.businessType]
        };
      }

      const templates = await BusinessRuleTemplate.findAll({
        where: whereClause,
        order: [['category', 'ASC'], ['name', 'ASC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return templates;
    } catch (error) {
      console.error('Error getting owner rule templates:', error);
      throw error;
    }
  }

  // ================================
  // BUSINESS FUNCTIONS - Asignación y Uso de Reglas
  // ================================

  /**
   * Obtener plantillas disponibles para un negocio
   */
  static async getAvailableTemplatesForBusiness(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // Obtener plantillas activas que coincidan con el tipo y plan del negocio
      const templates = await BusinessRuleTemplate.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { businessTypes: { [Op.contains]: [business.businessType] } },
            { businessTypes: { [Op.eq]: [] } } // Plantillas universales
          ],
          [Op.or]: [
            { planTypes: { [Op.contains]: [business.planType] } },
            { planTypes: { [Op.eq]: [] } } // Plantillas para todos los planes
          ]
        },
        order: [['category', 'ASC'], ['priority', 'DESC'], ['name', 'ASC']]
      });

      // Excluir plantillas ya asignadas
      const assignedTemplateIds = await BusinessRuleAssignment.findAll({
        where: { businessId },
        attributes: ['ruleTemplateId']
      }).then(assignments => assignments.map(a => a.ruleTemplateId));

      return templates.filter(t => !assignedTemplateIds.includes(t.id));
    } catch (error) {
      console.error('Error getting available templates:', error);
      throw error;
    }
  }

  /**
   * Asignar plantilla de regla a un negocio
   */
  static async assignRuleToBusiness(businessId, templateId, assignedBy, options = {}) {
    try {
      // Validar que la plantilla existe y está activa
      const template = await BusinessRuleTemplate.findOne({
        where: { id: templateId, isActive: true }
      });

      if (!template) {
        throw new Error('Plantilla de regla no encontrada o inactiva');
      }

      // Validar que no haya conflictos
      await this.validateRuleConflicts(businessId, template);

      // Crear asignación
      const assignment = await BusinessRuleAssignment.create({
        businessId,
        ruleTemplateId: templateId,
        assignedBy,
        originalValue: template.ruleValue,
        priority: options.priority || template.priority,
        notes: options.notes,
        effectiveFrom: options.effectiveFrom,
        effectiveTo: options.effectiveTo,
        lastTemplateVersion: template.version
      });

      // Crear regla efectiva en BusinessRules
      await this.createEffectiveRule(assignment, template);

      // Incrementar contador de uso
      await template.increment('usageCount');

      return assignment;
    } catch (error) {
      console.error('Error assigning rule to business:', error);
      throw error;
    }
  }

  /**
   * Personalizar regla asignada
   */
  static async customizeAssignedRule(businessId, assignmentId, customValue, modifiedBy, notes) {
    try {
      const assignment = await BusinessRuleAssignment.findOne({
        where: { id: assignmentId, businessId },
        include: [{ model: BusinessRuleTemplate }]
      });

      if (!assignment) {
        throw new Error('Asignación de regla no encontrada');
      }

      if (!assignment.BusinessRuleTemplate.allowCustomization) {
        throw new Error('Esta regla no permite personalización');
      }

      // Validar el valor personalizado
      await this.validateCustomValue(assignment.BusinessRuleTemplate, customValue);

      // Actualizar asignación
      await assignment.update({
        customValue,
        isCustomized: true,
        lastModified: new Date(),
        modifiedBy,
        notes: notes || assignment.notes,
        autoUpdate: false // Desactivar actualizaciones automáticas al personalizar
      });

      // Actualizar regla efectiva
      await this.updateEffectiveRule(assignment);

      return assignment;
    } catch (error) {
      console.error('Error customizing assigned rule:', error);
      throw error;
    }
  }

  /**
   * Obtener reglas asignadas a un negocio
   */
  static async getBusinessAssignedRules(businessId, includeInactive = false) {
    try {
      const whereClause = { businessId };
      if (!includeInactive) {
        whereClause.isActive = true;
      }

      const assignments = await BusinessRuleAssignment.findAll({
        where: whereClause,
        include: [
          {
            model: BusinessRuleTemplate,
            attributes: ['id', 'name', 'description', 'category', 'ruleKey', 'allowCustomization']
          },
          {
            model: User,
            as: 'assignedByUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['priority', 'DESC'], [BusinessRuleTemplate, 'category', 'ASC']]
      });

      return assignments;
    } catch (error) {
      console.error('Error getting business assigned rules:', error);
      throw error;
    }
  }

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  /**
   * Validar dependencias y conflictos de plantilla
   */
  static async validateTemplateDependencies(templateData) {
    if (templateData.dependencies && templateData.dependencies.length > 0) {
      for (const depKey of templateData.dependencies) {
        const depTemplate = await BusinessRuleTemplate.findOne({
          where: { ruleKey: depKey, isActive: true }
        });
        
        if (!depTemplate) {
          throw new Error(`Dependencia requerida no encontrada: ${depKey}`);
        }
      }
    }
  }

  /**
   * Validar conflictos de regla para un negocio
   */
  static async validateRuleConflicts(businessId, template) {
    if (template.conflicts && template.conflicts.length > 0) {
      const conflictingRules = await BusinessRules.findAll({
        where: {
          businessId,
          ruleKey: { [Op.in]: template.conflicts },
          isActive: true
        }
      });

      if (conflictingRules.length > 0) {
        const conflictKeys = conflictingRules.map(r => r.ruleKey).join(', ');
        throw new Error(`Esta regla entra en conflicto con reglas existentes: ${conflictKeys}`);
      }
    }
  }

  /**
   * Crear regla efectiva en BusinessRules
   */
  static async createEffectiveRule(assignment, template) {
    const effectiveValue = assignment.isCustomized ? assignment.customValue : template.ruleValue;

    await BusinessRules.create({
      businessId: assignment.businessId,
      ruleKey: template.ruleKey,
      ruleValue: effectiveValue,
      description: template.description,
      category: template.category,
      priority: assignment.priority,
      ruleTemplateId: template.id,
      ruleAssignmentId: assignment.id,
      isFromTemplate: true,
      isCustomized: assignment.isCustomized,
      originalTemplateValue: template.ruleValue,
      lastSyncedAt: new Date(),
      templateVersion: template.version
    });
  }

  /**
   * Actualizar regla efectiva
   */
  static async updateEffectiveRule(assignment) {
    const template = assignment.BusinessRuleTemplate;
    const effectiveValue = assignment.isCustomized ? assignment.customValue : template.ruleValue;

    await BusinessRules.update({
      ruleValue: effectiveValue,
      isCustomized: assignment.isCustomized,
      lastSyncedAt: new Date(),
      templateVersion: template.version
    }, {
      where: { ruleAssignmentId: assignment.id }
    });
  }

  /**
   * Verificar si hay cambios significativos
   */
  static hasSignificantChanges(oldValue, newValue) {
    // Implementar lógica para determinar si los cambios son significativos
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  }

  /**
   * Marcar actualizaciones pendientes
   */
  static async markPendingUpdates(templateId) {
    await BusinessRuleAssignment.update({
      updatesPending: true
    }, {
      where: {
        ruleTemplateId: templateId,
        autoUpdate: true,
        isActive: true
      }
    });
  }

  /**
   * Validar valor personalizado
   */
  static async validateCustomValue(template, customValue) {
    // Implementar validaciones específicas según el tipo de regla
    if (template.customizationRules) {
      // Aplicar reglas de personalización
      // Por ejemplo, rangos permitidos, tipos de datos, etc.
    }
    return true;
  }

  /**
   * Sincronizar reglas con plantillas actualizadas
   */
  static async syncRulesWithTemplates(businessId = null) {
    try {
      const whereClause = {
        updatesPending: true,
        autoUpdate: true,
        isActive: true
      };

      if (businessId) {
        whereClause.businessId = businessId;
      }

      const pendingAssignments = await BusinessRuleAssignment.findAll({
        where: whereClause,
        include: [{ model: BusinessRuleTemplate }]
      });

      for (const assignment of pendingAssignments) {
        if (!assignment.isCustomized) {
          await this.updateEffectiveRule(assignment);
          await assignment.update({
            updatesPending: false,
            lastTemplateVersion: assignment.BusinessRuleTemplate.version
          });
        }
      }

      return pendingAssignments.length;
    } catch (error) {
      console.error('Error syncing rules with templates:', error);
      throw error;
    }
  }
}

module.exports = RuleTemplateService;