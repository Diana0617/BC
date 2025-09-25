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
      const { businessId } = req.user.business;
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
      const { businessId } = req.user.business;
      const { ruleKey } = req.params;

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
      const { businessId } = req.user.business;
      const { ruleKey } = req.params;
      const { value } = req.body;
      const userId = req.user.id;

      const businessRule = await BusinessRulesService.setBusinessRuleValue(
        businessId, 
        ruleKey, 
        value, 
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
      const { businessId } = req.user.business;
      const { ruleKey } = req.params;

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

      const templates = await BusinessRulesService.getAvailableRuleTemplates({ category });

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
      const { businessId } = req.user.business;
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
}

module.exports = BusinessRulesController;