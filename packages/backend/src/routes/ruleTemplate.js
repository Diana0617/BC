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
 * components:
 *   schemas:
 *     RuleTemplate:
 *       type: object
 *       required:
 *         - key
 *         - name
 *         - description
 *         - type
 *         - category
 *         - defaultValue
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la plantilla
 *         key:
 *           type: string
 *           description: Clave única de la regla (UPPER_SNAKE_CASE)
 *           example: "MAX_APPOINTMENTS_PER_DAY"
 *         name:
 *           type: string
 *           description: Nombre descriptivo de la regla
 *           example: "Máximo de citas por día"
 *         description:
 *           type: string
 *           description: Descripción detallada de la regla
 *           example: "Limita el número máximo de citas que se pueden agendar por día"
 *         type:
 *           type: string
 *           enum: [NUMERIC, BOOLEAN, TEXT, JSON, ARRAY]
 *           description: Tipo de valor de la regla
 *           example: "NUMERIC"
 *         category:
 *           type: string
 *           enum: [APPOINTMENTS, PAYMENTS, NOTIFICATIONS, BUSINESS_HOURS, LIMITS, CUSTOMIZATION]
 *           description: Categoría de la regla
 *           example: "APPOINTMENTS"
 *         defaultValue:
 *           description: Valor por defecto de la regla
 *           example: 10
 *         validationRules:
 *           type: object
 *           description: Reglas de validación específicas
 *           example: {"min": 1, "max": 50}
 *         isActive:
 *           type: boolean
 *           description: Si la plantilla está activa
 *           default: true
 *         createdBy:
 *           type: string
 *           format: uuid
 *           description: ID del usuario que creó la plantilla
 *         updatedBy:
 *           type: string
 *           format: uuid
 *           description: ID del último usuario que actualizó la plantilla
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Owner Rule Templates
 *     description: Gestión de plantillas de reglas por parte del Owner
 *   - name: Rule Templates
 *     description: Consulta de plantillas de reglas disponibles
 *   - name: Business Rule Templates
 *     description: Uso de plantillas por parte de los negocios
 */

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
 *             required:
 *               - key
 *               - name
 *               - description
 *               - type
 *               - category
 *               - defaultValue
 *             properties:
 *               key:
 *                 type: string
 *                 example: "MAX_APPOINTMENTS_PER_DAY"
 *               name:
 *                 type: string
 *                 example: "Máximo de citas por día"
 *               description:
 *                 type: string
 *                 example: "Limita el número máximo de citas que se pueden agendar por día"
 *               type:
 *                 type: string
 *                 enum: [NUMERIC, BOOLEAN, TEXT, JSON, ARRAY]
 *                 example: "NUMERIC"
 *               category:
 *                 type: string
 *                 enum: [APPOINTMENTS, PAYMENTS, NOTIFICATIONS, BUSINESS_HOURS, LIMITS, CUSTOMIZATION]
 *                 example: "APPOINTMENTS"
 *               defaultValue:
 *                 example: 10
 *               validationRules:
 *                 type: object
 *                 example: {"min": 1, "max": 50}
 *               isActive:
 *                 type: boolean
 *                 default: true
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RuleTemplate'
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: No autorizado - solo Owners
 */
router.post('/owner/templates', 
  authenticateToken, 
  ownerOnly, 
  RuleTemplateController.createRuleTemplate
);

/**
 * @swagger
 * /api/owner/rule-templates:
 *   get:
 *     tags: [Owner Rule Templates]
 *     summary: Obtener todas las plantillas de reglas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página de resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en key, name o description
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
  ownerOnly, 
  RuleTemplateController.getOwnerRuleTemplates
);

/**
 * @swagger
 * /api/owner/rule-templates/{templateId}:
 *   get:
 *     tags: [Owner Rule Templates]
 *     summary: Obtener plantilla por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la plantilla
 *     responses:
 *       200:
 *         description: Plantilla encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RuleTemplate'
 *       404:
 *         description: Plantilla no encontrada
 */
router.get('/owner/templates/:templateId', 
  authenticateToken, 
  ownerOnly, 
  RuleTemplateController.getRuleTemplateById
);

/**
 * @swagger
 * /api/owner/rule-templates/{templateId}:
 *   put:
 *     tags: [Owner Rule Templates]
 *     summary: Actualizar plantilla existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la plantilla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               defaultValue:
 *                 description: Nuevo valor por defecto
 *               validationRules:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plantilla actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RuleTemplate'
 *       404:
 *         description: Plantilla no encontrada
 */
router.put('/owner/templates/:templateId', 
  authenticateToken, 
  ownerOnly, 
  RuleTemplateController.updateRuleTemplate
);

/**
 * @swagger
 * /api/owner/rule-templates/{templateId}:
 *   delete:
 *     tags: [Owner Rule Templates]
 *     summary: Eliminar plantilla
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la plantilla
 *     responses:
 *       200:
 *         description: Plantilla eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error al eliminar (plantilla en uso)
 *       404:
 *         description: Plantilla no encontrada
 */
router.delete('/owner/templates/:templateId', 
  authenticateToken, 
  ownerOnly, 
  RuleTemplateController.deleteRuleTemplate
);

/**
 * @swagger
 * /api/owner/rule-templates/stats:
 *   get:
 *     tags: [Owner Rule Templates]
 *     summary: Obtener estadísticas de plantillas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de plantillas
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
 *                     totalTemplates:
 *                       type: integer
 *                     activeTemplates:
 *                       type: integer
 *                     inactiveTemplates:
 *                       type: integer
 *                     categoriesStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/owner/templates/stats', 
  authenticateToken, 
  ownerOnly, 
  RuleTemplateController.getTemplateStats
);

// ================================
// PUBLIC ENDPOINTS - Consultar plantillas disponibles
// ================================

/**
 * @swagger
 * /api/rule-templates:
 *   get:
 *     tags: [Rule Templates]
 *     summary: Obtener todas las plantillas activas
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página de resultados
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Elementos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en key, name o description
 *     responses:
 *       200:
 *         description: Lista de plantillas activas
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', RuleTemplateController.getRuleTemplates);

/**
 * @swagger
 * /api/rule-templates/{templateId}:
 *   get:
 *     tags: [Rule Templates]
 *     summary: Obtener plantilla por ID (público)
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la plantilla
 *     responses:
 *       200:
 *         description: Plantilla encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RuleTemplate'
 *       404:
 *         description: Plantilla no encontrada
 */
router.get('/:templateId', RuleTemplateController.getRuleTemplateById);

// ================================
// BUSINESS ENDPOINTS - Para uso de negocios
// ================================

/**
 * @swagger
 * /api/business/rule-templates/available:
 *   get:
 *     tags: [Business Rule Templates]
 *     summary: Obtener plantillas disponibles para el negocio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en key, name o description
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
router.get('/business/templates/available', 
  authenticateToken, 
  validateSubdomain, 
  tenancy, 
  RuleTemplateController.getBusinessAvailableTemplates
);

/**
 * @swagger
 * /api/business/rule-templates/effective:
 *   get:
 *     tags: [Business Rule Templates]
 *     summary: Obtener reglas efectivas del negocio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
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
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       effectiveValue:
 *                         description: Valor efectivo (personalizado o por defecto)
 *                       customValue:
 *                         description: Valor personalizado (null si usa el por defecto)
 *                       customizedAt:
 *                         type: string
 *                         format: date-time
 *                       customizedBy:
 *                         type: string
 *                         format: uuid
 */
router.get('/business/templates/effective', 
  authenticateToken, 
  validateSubdomain, 
  tenancy, 
  RuleTemplateController.getBusinessEffectiveRules
);

module.exports = router;
