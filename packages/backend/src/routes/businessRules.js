const express = require('express');
const router = express.Router();
const BusinessRulesController = require('../controllers/BusinessRulesController');
const { authenticateToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { validateSubdomain } = require('../middleware/subdomain');
const tenancy = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Business Rules
 *     description: Gestión simplificada de reglas de negocio
 *   - name: Rule Templates
 *     description: Templates globales de reglas disponibles
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RuleTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         key:
 *           type: string
 *           example: "allow_close_without_payment"
 *         type:
 *           type: string
 *           enum: [BOOLEAN, STRING, NUMBER, JSON]
 *         defaultValue:
 *           type: object
 *           description: Valor por defecto de la regla
 *         description:
 *           type: string
 *           description: Descripción de la regla
 *         category:
 *           type: string
 *           enum: ["PAYMENT_POLICY", "CANCELLATION_POLICY", "BOOKING_POLICY", "WORKING_HOURS", "NOTIFICATION_POLICY", "REFUND_POLICY", "SERVICE_POLICY", "GENERAL"]
 *         allowCustomization:
 *           type: boolean
 *         version:
 *           type: string
 *         isActive:
 *           type: boolean
 *     BusinessRule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         businessId:
 *           type: string
 *           format: uuid
 *         ruleTemplateId:
 *           type: string
 *           format: uuid
 *         customValue:
 *           type: object
 *           description: Valor personalizado o null para usar el default
 *         isActive:
 *           type: boolean
 *         notes:
 *           type: string
 *     EffectiveRule:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         effective_value:
 *           type: object
 *           description: Valor efectivo (custom o default)
 *         is_customized:
 *           type: boolean
 *         category:
 *           type: string
 *         description:
 *           type: string
 *           description: Descripción de la regla
 */

// ================================
// RUTAS PARA NEGOCIOS - Gestión de sus propias reglas
// ================================

/**
 * @swagger
 * /api/business/rules:
 *   get:
 *     tags: [Business Rules]
 *     summary: Obtener todas las reglas efectivas del negocio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *           description: Filtrar por categorías
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Lista de reglas efectivas
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
 *                     $ref: '#/components/schemas/EffectiveRule'
 */
router.get('/business/rules', 
  authenticateToken, 
  roleCheck(['business_admin', 'owner']),
  validateSubdomain,
  tenancy,
  BusinessRulesController.getBusinessRules
);

/**
 * @swagger
 * /api/business/rules/{ruleKey}:
 *   get:
 *     tags: [Business Rules]
 *     summary: Obtener valor específico de una regla
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleKey
 *         required: true
 *         schema:
 *           type: string
 *         example: allow_close_without_payment
 *     responses:
 *       200:
 *         description: Valor de la regla
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
 *                     key:
 *                       type: string
 *                     value:
 *                       type: object
 *       404:
 *         description: Regla no encontrada
 */
router.get('/business/rules/:ruleKey', 
  authenticateToken, 
  roleCheck(['business_admin', 'owner']),
  validateSubdomain,
  tenancy,
  BusinessRulesController.getRuleValue
);

/**
 * @swagger
 * /api/business/rules/{ruleKey}:
 *   put:
 *     tags: [Business Rules]
 *     summary: Establecer valor personalizado para una regla
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleKey
 *         required: true
 *         schema:
 *           type: string
 *         example: cancellation_time_limit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 description: Valor personalizado para la regla
 *                 oneOf:
 *                   - type: boolean
 *                   - type: string
 *                   - type: number
 *                   - type: object
 *                 example: 48
 *               notes:
 *                 type: string
 *                 example: "Cambiado para dar más flexibilidad a los clientes"
 *     responses:
 *       200:
 *         description: Regla actualizada exitosamente
 *       400:
 *         description: Valor inválido o regla no personalizable
 */
router.put('/business/rules/:ruleKey', 
  authenticateToken, 
  roleCheck(['business_admin', 'owner']),
  validateSubdomain,
  tenancy,
  BusinessRulesController.setRuleValue
);

/**
 * @swagger
 * /api/business/rules/{ruleKey}:
 *   delete:
 *     tags: [Business Rules]
 *     summary: Restablecer regla a valor por defecto
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
 *         description: Regla restablecida a valor por defecto
 *       404:
 *         description: No existe personalización para esta regla
 */
router.delete('/business/rules/:ruleKey', 
  authenticateToken, 
  roleCheck(['business_admin', 'owner']),
  validateSubdomain,
  tenancy,
  BusinessRulesController.resetRuleToDefault
);

/**
 * @swagger
 * /api/business/rules/setup:
 *   post:
 *     tags: [Business Rules]
 *     summary: Aplicar todas las reglas por defecto al negocio
 *     description: Útil para configuración inicial de un negocio nuevo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reglas por defecto aplicadas exitosamente
 */
router.post('/business/rules/setup', 
  authenticateToken, 
  roleCheck(['business_admin', 'owner']),
  validateSubdomain,
  tenancy,
  BusinessRulesController.setupBusinessRules
);

// ================================
// RUTAS PÚBLICAS - Templates disponibles
// ================================

/**
 * @swagger
 * /api/rule-templates:
 *   get:
 *     tags: [Rule Templates]
 *     summary: Obtener templates de reglas disponibles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ["PAYMENT_POLICY", "CANCELLATION_POLICY", "BOOKING_POLICY", "WORKING_HOURS", "NOTIFICATION_POLICY", "REFUND_POLICY", "SERVICE_POLICY", "GENERAL"]
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de templates disponibles
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
 *                     $ref: '#/components/schemas/RuleTemplate'
 */
router.get('/rule-templates', 
  authenticateToken,
  BusinessRulesController.getRuleTemplates
);

// ================================
// RUTAS PARA OWNERS - Gestión avanzada (futuro)
// ================================

/**
 * Nota: Las rutas de Owner para crear/editar templates pueden agregarse aquí
 * cuando sea necesario. Por ahora, los templates se gestionan a nivel de base de datos.
 */

module.exports = router;