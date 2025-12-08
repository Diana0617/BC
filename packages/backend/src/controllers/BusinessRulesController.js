const BusinessRulesService = require('../services/BusinessRulesService');

/**
 * Business Rules Controller - Simplified version for the new rule structure
 * 
 * This controller demonstrates how to use the new BusinessRulesService
 * with the simplified RuleTemplate + BusinessRule structure.
 */
class BusinessRulesController {

  /**
   * @swagger
   * /api/business/rules:
   *   get:
   *     tags: [Business Rules]
   *     summary: Get all effective rules for the business
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: categories
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *         description: Filter by rule categories
   *       - in: query
   *         name: activeOnly
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Only return active rules
   *     responses:
   *       200:
   *         description: List of effective rules for the business
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       key:
   *                         type: string
   *                       effective_value:
   *                         type: object
   *                       is_customized:
   *                         type: boolean
   */
  static async getBusinessRules(req, res) {
    try {
      console.log('🔍 Debug - req.user:', req.user);
      console.log('🔍 Debug - req.user.business:', req.user.business);
      
      // Try different ways to get businessId
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;
      
      console.log('🔍 Debug - extracted businessId:', businessId);
      
      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'Business ID not found in user context'
        });
      }

      const { categories, activeOnly } = req.query;

      const rules = await BusinessRulesService.getBusinessEffectiveRules(businessId, {
        categories: categories ? categories.split(',') : undefined,
        activeOnly: activeOnly !== 'false'
      });

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Error getting business rules:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving business rules',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rules/{ruleKey}:
   *   get:
   *     tags: [Business Rules]
   *     summary: Get specific rule value for business
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: ruleKey
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Rule value
   */
  static async getRuleValue(req, res) {
    try {
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;
      const { ruleKey } = req.params;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId is required and could not be determined from user data'
        });
      }

      const value = await BusinessRulesService.getBusinessRuleValue(businessId, ruleKey);

      if (value === null) {
        return res.status(404).json({
          success: false,
          message: 'Rule not found or inactive'
        });
      }

      res.json({
        success: true,
        data: {
          key: ruleKey,
          value
        }
      });
    } catch (error) {
      console.error('Error getting rule value:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving rule value',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rules/{ruleKey}:
   *   put:
   *     tags: [Business Rules]
   *     summary: Set custom value for a business rule
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: ruleKey
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               value:
   *                 description: Custom value for the rule
   *             required:
   *               - value
   *     responses:
   *       200:
   *         description: Rule value updated successfully
   */
  static async setRuleValue(req, res) {
    try {
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId is required and could not be determined from user data'
        });
      }
      const { ruleKey } = req.params;
      const { value, customValue, notes } = req.body;
      const userId = req.user.id;

      // Support both 'value' (legacy) and 'customValue' (new API format)
      const ruleValue = customValue !== undefined ? customValue : value;

      if (ruleValue === undefined) {
        return res.status(400).json({
          success: false,
          message: 'value or customValue is required'
        });
      }

      console.log(`🔄 Setting rule value for ${ruleKey}:`, ruleValue);
      if (notes) {
        console.log(`📝 Notes: ${notes}`);
      }

      const businessRule = await BusinessRulesService.setBusinessRuleValue(
        businessId, 
        ruleKey, 
        ruleValue, 
        userId
      );

      res.json({
        success: true,
        message: 'Rule value updated successfully',
        data: businessRule
      });
    } catch (error) {
      console.error('Error setting rule value:', error);
      res.status(400).json({
        success: false,
        message: 'Error updating rule value',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rules/{ruleKey}:
   *   delete:
   *     tags: [Business Rules]
   *     summary: Reset rule to default value
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: ruleKey
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Rule reset to default successfully
   */
  static async resetRuleToDefault(req, res) {
    try {
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;
      const { ruleKey } = req.params;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId is required and could not be determined from user data'
        });
      }

      const reset = await BusinessRulesService.resetBusinessRuleToDefault(businessId, ruleKey);

      if (!reset) {
        return res.status(404).json({
          success: false,
          message: 'Rule customization not found'
        });
      }

      res.json({
        success: true,
        message: 'Rule reset to default value successfully'
      });
    } catch (error) {
      console.error('Error resetting rule:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting rule',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/rule-templates:
   *   get:
   *     tags: [Rule Templates]
   *     summary: Get available rule templates
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *     responses:
   *       200:
   *         description: List of available rule templates
   */
  static async getRuleTemplates(req, res) {
    try {
      const { category } = req.query;
      
      // Obtener businessId si está disponible (para filtrar por módulos)
      const businessId = req.user?.business?.businessId || req.user?.business?.id || req.user?.businessId || req.business?.id;

      const templates = await BusinessRulesService.getAvailableRuleTemplates({ 
        category,
        businessId // Pasar businessId para filtrar por módulos del plan
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting rule templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving rule templates',
        error: error.message
      });
    }
  }

  /**
   * Example usage in business setup
   */
  static async setupBusinessRules(req, res) {
    try {
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId is required and could not be determined from user data'
        });
      }
      const userId = req.user.id;

      // Apply all default rules to new business
      const appliedRules = await BusinessRulesService.applyDefaultRulesToBusiness(
        businessId, 
        userId
      );

      res.json({
        success: true,
        message: `Applied ${appliedRules.length} default rules to business`,
        data: appliedRules
      });
    } catch (error) {
      console.error('Error setting up business rules:', error);
      res.status(500).json({
        success: false,
        message: 'Error setting up business rules',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rules/assign:
   *   post:
   *     tags: [Business Rules]  
   *     summary: Assign a specific rule template to business
   */
  static async assignRuleTemplate(req, res) {
    try {
      // Use safe businessId extraction like in getBusinessRules method
      let businessId = req.user.business?.businessId || req.user.business?.id || req.user.businessId;
      const userId = req.user.id;
      const { templateId, customValue } = req.body;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: 'businessId is required and could not be determined from user data'
        });
      }

      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: 'templateId is required'
        });
      }

      console.log(`🔄 Assigning template ${templateId} to business ${businessId}`);

      // Assign the specific template
      const assignedRule = await BusinessRulesService.assignRuleToBusinessFromTemplate(
        businessId, 
        templateId,
        userId,
        customValue
      );

      console.log(`✅ Template assigned successfully:`, assignedRule);

      res.json({
        success: true,
        message: `Template assigned successfully`,
        data: assignedRule
      });
    } catch (error) {
      console.error('❌ Error assigning rule template:', error);
      res.status(500).json({
        success: false,
        message: 'Error assigning rule template',
        error: error.message
      });
    }
  }
}

module.exports = BusinessRulesController;