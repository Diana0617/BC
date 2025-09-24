const RuleTemplateService = require('../services/RuleTemplateService');

class RuleTemplateController {

  // ================================
  // OWNER ENDPOINTS - Gestión de Plantillas
  // ================================

  /**
   * @swagger
   * /api/owner/rule-templates:
   *   post:
   *     tags: [Owner Rule Templates]
   *     summary: Crear nueva plantilla de regla
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Permitir cierre sin pago"
   *               description:
   *                 type: string
   *                 example: "Permite cerrar turnos sin confirmación de pago"
   *               category:
   *                 type: string
   *                 enum: [PAYMENT_POLICY, CANCELLATION_POLICY, APPOINTMENT_RULES, NOTIFICATION_SETTINGS, BUSINESS_HOURS, SPECIALIST_RULES, GENERAL]
   *                 example: "PAYMENT_POLICY"
   *               ruleKey:
   *                 type: string
   *                 example: "allow_close_without_payment"
   *               ruleValue:
   *                 type: object
   *                 example: { "enabled": true, "requireConfirmation": false }
   *               businessTypes:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["BEAUTY_SALON", "BARBERSHOP"]
   *               planTypes:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["PREMIUM", "ENTERPRISE"]
   *               allowCustomization:
   *                 type: boolean
   *                 example: true
   *               priority:
   *                 type: integer
   *                 example: 5
   *     responses:
   *       201:
   *         description: Plantilla creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       403:
   *         description: No autorizado (solo Owners)
   */
  static async createRuleTemplate(req, res) {
    try {
      const ownerId = req.user.id;
      const template = await RuleTemplateService.createRuleTemplate(ownerId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Plantilla de regla creada exitosamente',
        data: template
      });
    } catch (error) {
      console.error('Error in createRuleTemplate:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/owner/rule-templates/{templateId}:
   *   put:
   *     tags: [Owner Rule Templates]
   *     summary: Actualizar plantilla de regla
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: templateId
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
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               ruleValue:
   *                 type: object
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Plantilla actualizada exitosamente
   *       404:
   *         description: Plantilla no encontrada
   */
  static async updateRuleTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const ownerId = req.user.id;
      
      const template = await RuleTemplateService.updateRuleTemplate(ownerId, templateId, req.body);
      
      res.json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: template
      });
    } catch (error) {
      console.error('Error in updateRuleTemplate:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/owner/rule-templates:
   *   get:
   *     tags: [Owner Rule Templates]
   *     summary: Listar plantillas de regla del Owner
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filtrar por categoría
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado activo
   *       - in: query
   *         name: businessType
   *         schema:
   *           type: string
   *         description: Filtrar por tipo de negocio
   *     responses:
   *       200:
   *         description: Lista de plantillas
   */
  static async getOwnerRuleTemplates(req, res) {
    try {
      const ownerId = req.user.id;
      const filters = req.query;
      
      const templates = await RuleTemplateService.getOwnerRuleTemplates(ownerId, filters);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error in getOwnerRuleTemplates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/owner/rule-templates/{templateId}:
   *   get:
   *     tags: [Owner Rule Templates]
   *     summary: Obtener detalles completos de una plantilla de regla
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: templateId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la plantilla
   *     responses:
   *       200:
   *         description: Detalles de la plantilla con estadísticas
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     template:
   *                       type: object
   *                     stats:
   *                       type: object
   *                       properties:
   *                         totalAssignments:
   *                           type: integer
   *                         activeAssignments:
   *                           type: integer
   *                         businessesUsingTemplate:
   *                           type: integer
   *                         lastUsed:
   *                           type: string
   *                           format: date-time
   *       404:
   *         description: Plantilla no encontrada
   */
  static async getRuleTemplateById(req, res) {
    try {
      const { templateId } = req.params;
      const ownerId = req.user.id;
      
      const result = await RuleTemplateService.getRuleTemplateById(ownerId, templateId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in getRuleTemplateById:', error);
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/owner/rule-templates/{templateId}:
   *   delete:
   *     tags: [Owner Rule Templates]
   *     summary: Eliminar plantilla de regla
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: templateId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Plantilla eliminada exitosamente
   *       404:
   *         description: Plantilla no encontrada
   */
  static async deleteRuleTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const ownerId = req.user.id;
      
      await RuleTemplateService.deleteRuleTemplate(ownerId, templateId);
      
      res.json({
        success: true,
        message: 'Plantilla eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error in deleteRuleTemplate:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ================================
  // BUSINESS ENDPOINTS - Uso de Plantillas
  // ================================

  /**
   * @swagger
   * /api/business/rule-templates/available:
   *   get:
   *     tags: [Business Rule Templates]
   *     summary: Obtener plantillas disponibles para el negocio
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de plantillas disponibles
   */
  static async getAvailableTemplates(req, res) {
    try {
      // Para OWNERS, businessId puede ser null, pero pueden acceder a todas las plantillas
      // Para otros roles, usar el businessId del tenancy
      const businessId = req.tenancy.businessId;
      
      const templates = await RuleTemplateService.getAvailableTemplatesForBusiness(businessId);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error in getAvailableTemplates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rule-templates/{templateId}/assign:
   *   post:
   *     tags: [Business Rule Templates]
   *     summary: Asignar plantilla de regla al negocio
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: templateId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               priority:
   *                 type: integer
   *                 example: 5
   *               notes:
   *                 type: string
   *                 example: "Asignado para mejorar flexibilidad de pagos"
   *               effectiveFrom:
   *                 type: string
   *                 format: date-time
   *               effectiveTo:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Regla asignada exitosamente
   *       400:
   *         description: Error en la asignación
   */
  static async assignRuleTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const businessId = req.tenancy.businessId;
      const assignedBy = req.user.id;
      
      const assignment = await RuleTemplateService.assignRuleToBusiness(
        businessId, 
        templateId, 
        assignedBy, 
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Regla asignada exitosamente',
        data: assignment
      });
    } catch (error) {
      console.error('Error in assignRuleTemplate:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rule-assignments:
   *   get:
   *     tags: [Business Rule Templates]
   *     summary: Obtener reglas asignadas al negocio
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *         description: Incluir reglas inactivas
   *     responses:
   *       200:
   *         description: Lista de reglas asignadas
   */
  static async getBusinessAssignedRules(req, res) {
    try {
      const businessId = req.tenancy.businessId || req.user.businessId;
      const includeInactive = req.query.includeInactive === 'true';
      
      const assignments = await RuleTemplateService.getBusinessAssignedRules(businessId, includeInactive);
      
      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error in getBusinessAssignedRules:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rule-assignments/{assignmentId}/customize:
   *   put:
   *     tags: [Business Rule Templates]
   *     summary: Personalizar regla asignada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: assignmentId
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
   *               customValue:
   *                 type: object
   *                 example: { "enabled": true, "requireConfirmation": true }
   *               notes:
   *                 type: string
   *                 example: "Personalizado para requerir confirmación adicional"
   *     responses:
   *       200:
   *         description: Regla personalizada exitosamente
   *       400:
   *         description: Error en la personalización
   */
  static async customizeAssignedRule(req, res) {
    try {
      const { assignmentId } = req.params;
      const businessId = req.tenancy.businessId;
      const modifiedBy = req.user.id;
      const { customValue, notes } = req.body;
      
      const assignment = await RuleTemplateService.customizeAssignedRule(
        businessId,
        assignmentId,
        customValue,
        modifiedBy,
        notes
      );
      
      res.json({
        success: true,
        message: 'Regla personalizada exitosamente',
        data: assignment
      });
    } catch (error) {
      console.error('Error in customizeAssignedRule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/business/rule-assignments/{assignmentId}/toggle:
   *   patch:
   *     tags: [Business Rule Templates]
   *     summary: Activar/desactivar regla asignada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: assignmentId
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
   *               isActive:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       200:
   *         description: Estado de regla actualizado
   */
  static async toggleRuleAssignment(req, res) {
    try {
      const { assignmentId } = req.params;
      const businessId = req.tenancy.businessId;
      const { isActive } = req.body;
      
      const assignment = await RuleTemplateService.toggleRuleAssignment(
        businessId,
        assignmentId,
        isActive
      );
      
      res.json({
        success: true,
        message: `Regla ${isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: assignment
      });
    } catch (error) {
      console.error('Error in toggleRuleAssignment:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ================================
  // ADMIN ENDPOINTS - Sincronización
  // ================================

  /**
   * @swagger
   * /api/admin/rule-templates/sync:
   *   post:
   *     tags: [Admin Rule Templates]
   *     summary: Sincronizar reglas con plantillas actualizadas
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               businessId:
   *                 type: string
   *                 description: ID del negocio específico (opcional)
   *     responses:
   *       200:
   *         description: Sincronización completada
   */
  static async syncRulesWithTemplates(req, res) {
    try {
      const { businessId } = req.body;
      
      const syncCount = await RuleTemplateService.syncRulesWithTemplates(businessId);
      
      res.json({
        success: true,
        message: `Sincronización completada. ${syncCount} reglas actualizadas`,
        data: { syncCount }
      });
    } catch (error) {
      console.error('Error in syncRulesWithTemplates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/admin/rule-templates/stats:
   *   get:
   *     tags: [Admin Rule Templates]
   *     summary: Obtener estadísticas de uso de plantillas
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas de plantillas
   */
  static async getRuleTemplateStats(req, res) {
    try {
      const stats = await RuleTemplateService.getRuleTemplateStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getRuleTemplateStats:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RuleTemplateController;