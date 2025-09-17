const express = require('express');
const router = express.Router();
const RuleTemplateController = require('../controllers/RuleTemplateController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const { roleCheck } = require('../middleware/roleCheck');
const { validateSubdomain } = require('../middleware/subdomain');
const tenancy = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Owner Rule Templates
 *     description: Gestión de plantillas de reglas por parte del Owner
 *   - name: Business Rule Templates
 *     description: Uso de plantillas de reglas por parte de los negocios
 *   - name: Admin Rule Templates
 *     description: Administración y estadísticas de plantillas de reglas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RuleTemplate:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - ruleKey
 *         - ruleValue
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la plantilla
 *         name:
 *           type: string
 *           description: Nombre descriptivo de la regla
 *           example: "Cierre sin comprobante de pago"
 *         description:
 *           type: string
 *           description: Descripción detallada de qué hace esta regla
 *         category:
 *           type: string
 *           enum: [PAYMENT_POLICY, CANCELLATION_POLICY, BOOKING_POLICY, WORKING_HOURS, NOTIFICATION_POLICY, REFUND_POLICY, SERVICE_POLICY, GENERAL]
 *           description: Categoría de la regla para organización
 *         ruleKey:
 *           type: string
 *           description: Clave única que identifica qué campo/regla afecta
 *           example: "allowCloseWithoutPayment"
 *         ruleValue:
 *           type: object
 *           description: Valor por defecto de la regla en formato JSON
 *         businessTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de negocio compatibles con esta regla
 *         planTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de plan de suscripción que incluyen esta regla
 *         isActive:
 *           type: boolean
 *           description: Si la plantilla está activa
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RuleAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la asignación
 *         businessId:
 *           type: string
 *           format: uuid
 *           description: ID del negocio al que se asigna la regla
 *         ruleTemplateId:
 *           type: string
 *           format: uuid
 *           description: ID de la plantilla de regla
 *         customValue:
 *           type: object
 *           description: Valor personalizado por el negocio
 *         isActive:
 *           type: boolean
 *           description: Si la regla está activa en el negocio
 *         assignedAt:
 *           type: string
 *           format: date-time
 *         lastModified:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *           description: Notas sobre la personalización
 */

// ================================
// OWNER ROUTES - Gestión de Plantillas de Reglas
// ================================

/**
 * @swagger
 * /api/rule-templates/owner/templates:
 *   post:
 *     summary: Crear nueva plantilla de regla
 *     description: Permite al Owner crear una nueva plantilla de regla que podrá ser usada por sus negocios
 *     tags: [Owner Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - ruleKey
 *               - ruleValue
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre descriptivo de la regla
 *                 example: "Cierre sin comprobante de pago"
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la regla
 *               category:
 *                 type: string
 *                 enum: [PAYMENT_POLICY, CANCELLATION_POLICY, BOOKING_POLICY, WORKING_HOURS, NOTIFICATION_POLICY, REFUND_POLICY, SERVICE_POLICY, GENERAL]
 *               ruleKey:
 *                 type: string
 *                 description: Clave única de la regla
 *                 example: "allowCloseWithoutPayment"
 *               ruleValue:
 *                 type: object
 *                 description: Valor por defecto de la regla
 *                 example: {"enabled": true, "requiresManagerApproval": false}
 *               businessTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tipos de negocio compatibles
 *               planTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Planes de suscripción que incluyen esta regla
 *     responses:
 *       201:
 *         description: Plantilla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RuleTemplate'
 *       400:
 *         description: Error de validación
 *       403:
 *         description: Solo OWNER puede crear plantillas
 */
router.post('/owner/templates', 
  authenticateToken, 
  roleCheck(['OWNER']),
  RuleTemplateController.createRuleTemplate
);

/**
 * @swagger
 * /api/rule-templates/owner/templates:
 *   get:
 *     summary: Listar plantillas del Owner
 *     description: Obtiene todas las plantillas de reglas creadas por el Owner
 *     tags: [Owner Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de plantillas
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
router.get('/owner/templates', 
  authenticateToken, 
  roleCheck(['OWNER']),
  RuleTemplateController.getOwnerRuleTemplates
);

// ================================
// BUSINESS RULE ASSIGNMENTS ROUTES
// ================================

/**
 * @swagger
 * /api/rule-templates/business/rule-templates/available:
 *   get:
 *     summary: Obtener plantillas disponibles para el negocio
 *     description: Obtiene todas las plantillas que el negocio puede asignar
 *     tags: [Business Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [PAYMENT_POLICY, CANCELLATION_POLICY, BOOKING_POLICY, WORKING_HOURS, NOTIFICATION_POLICY, REFUND_POLICY, SERVICE_POLICY, GENERAL]
 *         description: Filtrar por categoría de regla
 *     responses:
 *       200:
 *         description: Lista de plantillas disponibles
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
router.get('/business/rule-templates/available', 
  authenticateToken, 
  validateSubdomain,
  tenancy,
  RuleTemplateController.getAvailableTemplates
);

/**
 * @swagger
 * /api/rule-templates/business/rule-templates/{templateId}/assign:
 *   post:
 *     summary: Asignar plantilla de regla al negocio
 *     description: Asigna una plantilla de regla al negocio actual
 *     tags: [Business Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la plantilla a asignar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customValue:
 *                 type: string
 *                 description: Valor personalizado para la regla (opcional)
 *               priority:
 *                 type: integer
 *                 description: Prioridad de la regla (opcional)
 *     responses:
 *       201:
 *         description: Regla asignada exitosamente
 *       409:
 *         description: La regla ya está asignada al negocio
 */
router.post('/business/rule-templates/:templateId/assign', 
  authenticateToken, 
  validateSubdomain,
  tenancy,
  RuleTemplateController.assignRuleTemplate
);

/**
 * @swagger
 * /api/rule-templates/business/rule-assignments:
 *   get:
 *     summary: Obtener reglas asignadas al negocio
 *     description: Obtiene todas las reglas asignadas al negocio actual
 *     tags: [Business Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir reglas inactivas
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [PAYMENT_POLICY, CANCELLATION_POLICY, BOOKING_POLICY, WORKING_HOURS, NOTIFICATION_POLICY, REFUND_POLICY, SERVICE_POLICY, GENERAL]
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de reglas asignadas
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
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       businessId:
 *                         type: string
 *                         format: uuid
 *                       templateId:
 *                         type: string
 *                         format: uuid
 *                       customValue:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       effectiveRule:
 *                         $ref: '#/components/schemas/RuleTemplate'
 */
router.get('/business/rule-assignments', 
  authenticateToken, 
  validateSubdomain,
  tenancy,
  RuleTemplateController.getBusinessAssignedRules
);

/**
 * @swagger
 * /api/rule-templates/business/rule-assignments/{assignmentId}/customize:
 *   put:
 *     summary: Personalizar regla asignada
 *     description: Personaliza el valor de una regla ya asignada al negocio
 *     tags: [Business Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la asignación de regla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customValue:
 *                 type: string
 *                 description: Nuevo valor personalizado
 *               priority:
 *                 type: integer
 *                 description: Nueva prioridad (opcional)
 *     responses:
 *       200:
 *         description: Regla personalizada exitosamente
 *       404:
 *         description: Asignación no encontrada
 */
router.put('/business/rule-assignments/:assignmentId/customize', 
  authenticateToken, 
  validateSubdomain,
  tenancy,
  RuleTemplateController.customizeAssignedRule
);

/**
 * @swagger
 * /api/rule-templates/business/rule-assignments/{assignmentId}/toggle:
 *   patch:
 *     summary: Activar/Desactivar regla asignada
 *     description: Cambia el estado activo/inactivo de una regla asignada
 *     tags: [Business Rule Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la asignación de regla
 *     responses:
 *       200:
 *         description: Estado de la regla cambiado exitosamente
 *       404:
 *         description: Asignación no encontrada
 */
router.patch('/business/rule-assignments/:assignmentId/toggle', 
  authenticateToken, 
  validateSubdomain,
  tenancy,
  RuleTemplateController.toggleRuleAssignment
);

module.exports = router;