const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const RuleTemplate = require('../models/RuleTemplate');
const BusinessRule = require('../models/BusinessRule');

/**
 * Business Rules Service - Simplified version using new RuleTemplate + BusinessRule structure
 * 
 * This service replaces the complex RuleTemplateService and provides simplified methods
 * to work with the new two-model structure.
 */
class BusinessRulesService {

  /**
   * Get all effective rules for a business with their values
   * This returns all available rule templates with either custom values or default values
   * 
   * @param {string} businessId - UUID of the business
   * @param {object} options - Query options
   * @param {string[]} options.categories - Filter by rule categories
   * @param {boolean} options.activeOnly - Only return active rules (default: true)
   * @returns {Promise<Array>} Array of rules with effective values
   */
  static async getBusinessEffectiveRules(businessId, options = {}) {
    const { categories, activeOnly = true } = options;

    try {
      // SQL query that returns all rules with effective values
      let whereClause = 'WHERE rt."isActive" = true';
      const replacements = { businessId };

      if (categories && categories.length > 0) {
        whereClause += ' AND rt.category = ANY(:categories)';
        replacements.categories = categories;
      }

      if (activeOnly) {
        whereClause += ' AND (br."isActive" IS NULL OR br."isActive" = true)';
      }

      const query = `
        SELECT 
          rt.id as template_id,
          rt.key,
          rt.type,
          rt.category,
          rt.description,
          rt."allowCustomization",
          rt."defaultValue",
          br.id as business_rule_id,
          br."customValue",
          br."isActive" as rule_is_active,
          br."updatedBy",
          br.notes,
          br."appliedAt",
          -- Effective value: custom value if exists, otherwise default value
          COALESCE(br."customValue", rt."defaultValue") AS effective_value,
          -- Indicates if the business has customized this rule
          CASE 
            WHEN br."customValue" IS NOT NULL THEN true 
            ELSE false 
          END AS is_customized,
          br."updatedAt" as last_modified
        FROM rule_templates rt
        LEFT JOIN business_rules br 
          ON br."ruleTemplateId" = rt.id 
          AND br."businessId" = :businessId
        ${whereClause}
        ORDER BY rt.category, rt.key;
      `;

      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements
      });

      return results;
    } catch (error) {
      console.error('Error getting business effective rules:', error);
      throw error;
    }
  }

  /**
   * Get a specific rule value for a business
   * 
   * @param {string} businessId - UUID of the business
   * @param {string} ruleKey - Key of the rule to get
   * @returns {Promise<any>} The effective value of the rule
   */
  static async getBusinessRuleValue(businessId, ruleKey) {
    try {
      const query = `
        SELECT 
          COALESCE(br."customValue", rt."defaultValue") AS effective_value,
          rt.type
        FROM rule_templates rt
        LEFT JOIN business_rules br 
          ON br."ruleTemplateId" = rt.id 
          AND br."businessId" = :businessId
        WHERE rt.key = :ruleKey 
          AND rt."isActive" = true
          AND (br."isActive" IS NULL OR br."isActive" = true);
      `;

      const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { businessId, ruleKey }
      });

      return result[0]?.effective_value || null;
    } catch (error) {
      console.error('Error getting business rule value:', error);
      throw error;
    }
  }

  /**
   * Set a custom value for a business rule
   * 
   * @param {string} businessId - UUID of the business
   * @param {string} ruleKey - Key of the rule to customize
   * @param {any} customValue - Custom value to set
   * @param {string} updatedBy - UUID of the user making the change
   * @returns {Promise<object>} The created/updated business rule
   */
  static async setBusinessRuleValue(businessId, ruleKey, customValue, updatedBy) {
    try {
      // First get the rule template
      const template = await RuleTemplate.findOne({
        where: { key: ruleKey, isActive: true }
      });

      if (!template) {
        throw new Error(`Rule template with key '${ruleKey}' not found or inactive`);
      }

      if (!template.allowCustomization) {
        throw new Error(`Rule '${ruleKey}' does not allow customization`);
      }

      // Create or update the business rule
      const [businessRule, created] = await BusinessRule.upsert({
        businessId,
        ruleTemplateId: template.id,
        customValue,
        isActive: true,
        updatedBy,
        appliedAt: new Date() // Always set appliedAt to current timestamp
      }, {
        returning: true
      });

      return businessRule;
    } catch (error) {
      console.error('Error setting business rule value:', error);
      throw error;
    }
  }

  /**
   * Remove customization for a business rule (revert to default)
   * 
   * @param {string} businessId - UUID of the business
   * @param {string} ruleKey - Key of the rule to reset
   * @returns {Promise<boolean>} True if rule was reset, false if not found
   */
  static async resetBusinessRuleToDefault(businessId, ruleKey) {
    try {
      const template = await RuleTemplate.findOne({
        where: { key: ruleKey, isActive: true }
      });

      if (!template) {
        throw new Error(`Rule template with key '${ruleKey}' not found`);
      }

      const deleted = await BusinessRule.destroy({
        where: {
          businessId,
          ruleTemplateId: template.id
        }
      });

      return deleted > 0;
    } catch (error) {
      console.error('Error resetting business rule:', error);
      throw error;
    }
  }

  /**
   * Get all available rule templates
   * 
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of rule templates
   */
  static async getAvailableRuleTemplates(options = {}) {
    const { category, activeOnly = true } = options;

    const where = {};
    if (activeOnly) where.isActive = true;
    if (category) where.category = category;

    try {
      const templates = await RuleTemplate.findAll({
        where,
        order: [['category', 'ASC'], ['key', 'ASC']]
      });

      return templates;
    } catch (error) {
      console.error('Error getting rule templates:', error);
      throw error;
    }
  }

  /**
   * Bulk apply default rules to a business
   * Useful for new business setup
   * 
   * @param {string} businessId - UUID of the business
   * @param {string} updatedBy - UUID of the user making the change
   * @param {string[]} categories - Categories to apply (optional)
   * @returns {Promise<Array>} Array of created business rules
   */
  static async applyDefaultRulesToBusiness(businessId, updatedBy, categories = null) {
    try {
      const where = { isActive: true };
      if (categories) where.category = categories;

      const templates = await RuleTemplate.findAll({ where });
      
      const businessRules = [];
      for (const template of templates) {
        // Only create if not already exists
        const [businessRule, created] = await BusinessRule.findOrCreate({
          where: {
            businessId,
            ruleTemplateId: template.id
          },
          defaults: {
            customValue: null, // Use template default
            isActive: true,
            updatedBy,
            appliedAt: new Date()
          }
        });

        if (created) {
          businessRules.push(businessRule);
        }
      }

      return businessRules;
    } catch (error) {
      console.error('Error applying default rules:', error);
      throw error;
    }
  }

  /**
   * Assign a specific rule template to business
   */
  static async assignRuleToBusinessFromTemplate(businessId, templateId, updatedBy, customValue = null) {
    try {
      console.log(`🔄 Assigning template ${templateId} to business ${businessId}`);
      
      // First, get the template to ensure it exists
      const template = await RuleTemplate.findByPk(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      console.log(`📋 Found template: ${template.key}`);

      // Check if already assigned
      const existingRule = await BusinessRule.findOne({
        where: {
          businessId,
          ruleTemplateId: templateId
        }
      });

      if (existingRule) {
        console.log(`⚠️ Rule already exists for business ${businessId}, template ${templateId}`);
        throw new Error(`Rule "${template.key}" is already assigned to this business`);
      }

      // Create the business rule
      const businessRule = await BusinessRule.create({
        businessId,
        ruleTemplateId: templateId,
        customValue: customValue,
        isActive: true,
        updatedBy,
        appliedAt: new Date()
      });

      console.log(`✅ Business rule created:`, businessRule.id);

      // Return the rule with template data
      const fullRule = await BusinessRule.findByPk(businessRule.id, {
        include: [
          {
            model: RuleTemplate,
            as: 'template'
          }
        ]
      });

      return fullRule;
    } catch (error) {
      console.error('❌ Error assigning rule template:', error);
      throw error;
    }
  }
}

module.exports = BusinessRulesService;