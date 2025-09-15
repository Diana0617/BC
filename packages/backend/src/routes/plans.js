const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para autenticación en todas las rutas
router.use(authenticateToken);

// === RUTAS PÚBLICAS (para usuarios autenticados) ===

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Obtener todos los planes de suscripción
 *     description: Lista todos los planes disponibles con paginación y filtros
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DEPRECATED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: includeModules
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir módulos en la respuesta
 *     responses:
 *       200:
 *         description: Lista de planes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPlan'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', SubscriptionPlanController.getPlans);

/**
 * @swagger
 * /api/plans/available-modules:
 *   get:
 *     summary: Obtener módulos disponibles para planes
 *     description: Lista módulos disponibles para crear/editar planes (solo OWNER)
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CORE, APPOINTMENT, INVENTORY, SALES, REPORTING, COMMUNICATION, SECURITY]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DEPRECATED]
 *           default: ACTIVE
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Módulos disponibles obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 modules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'
 *                 totalModules:
 *                   type: integer
 *                   example: 12
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/available-modules', ownerOnly, SubscriptionPlanController.getAvailableModules);

/**
 * @swagger
 * /api/plans/calculate-price:
 *   post:
 *     summary: Calcular precio de plan
 *     description: Calcula el precio total de un plan basado en módulos seleccionados (solo OWNER)
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modules
 *               - basePlanPrice
 *             properties:
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array de IDs de módulos seleccionados
 *                 example: ["123e4567-e89b-12d3-a456-426614174000", "789e4567-e89b-12d3-a456-426614174000"]
 *               basePlanPrice:
 *                 type: number
 *                 description: Precio base del plan en centavos
 *                 example: 50000
 *           example:
 *             modules: ["123e4567-e89b-12d3-a456-426614174000", "789e4567-e89b-12d3-a456-426614174000"]
 *             basePlanPrice: 50000
 *     responses:
 *       200:
 *         description: Precio calculado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pricing:
 *                   type: object
 *                   properties:
 *                     basePlanPrice:
 *                       type: number
 *                       example: 50000
 *                     modulesPrice:
 *                       type: number
 *                       example: 15000
 *                     totalPrice:
 *                       type: number
 *                       example: 65000
 *                     moduleBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           moduleId:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *       400:
 *         description: Error de validación o módulos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/calculate-price', ownerOnly, SubscriptionPlanController.calculatePlanPrice);

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Obtener plan por ID
 *     description: Obtiene la información detallada de un plan específico
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del plan
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: includeModules
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir módulos en la respuesta
 *     responses:
 *       200:
 *         description: Plan obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', SubscriptionPlanController.getPlanById);

// === RUTAS ADMINISTRATIVAS (solo para OWNER) ===

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Crear nuevo plan de suscripción
 *     description: Crea un nuevo plan de suscripción con módulos seleccionados (solo OWNER)
 *     tags: [💎 Planes de Suscripción]
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
 *               - price
 *               - duration
 *               - description
 *               - modules
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del plan
 *                 example: "Plan Premium"
 *               price:
 *                 type: number
 *                 description: Precio del plan en centavos
 *                 example: 99900
 *               duration:
 *                 type: integer
 *                 description: Duración del plan en días
 *                 example: 30
 *               description:
 *                 type: string
 *                 description: Descripción detallada del plan
 *                 example: "Plan completo con todas las funcionalidades"
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de características del plan
 *                 example: ["Citas ilimitadas", "Inventario completo", "Reportes avanzados"]
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs de módulos incluidos en el plan
 *                 example: ["123e4567-e89b-12d3-a456-426614174000", "789e4567-e89b-12d3-a456-426614174000"]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                 default: ACTIVE
 *                 description: Estado del plan
 *               isPopular:
 *                 type: boolean
 *                 default: false
 *                 description: Marcar como plan popular
 *               maxBusinesses:
 *                 type: integer
 *                 description: Número máximo de negocios permitidos
 *                 example: 1
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', ownerOnly, SubscriptionPlanController.createPlan);

/**
 * @swagger
 * /api/plans/{id}:
 *   put:
 *     summary: Actualizar plan de suscripción
 *     description: Actualiza la información de un plan existente (solo OWNER)
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del plan
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del plan
 *                 example: "Plan Premium Plus"
 *               price:
 *                 type: number
 *                 description: Precio del plan en centavos
 *                 example: 129900
 *               description:
 *                 type: string
 *                 description: Descripción detallada del plan
 *                 example: "Plan premium con características avanzadas"
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de características del plan
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs de módulos incluidos en el plan
 *               isPopular:
 *                 type: boolean
 *                 description: Marcar como plan popular
 *               maxBusinesses:
 *                 type: integer
 *                 description: Número máximo de negocios permitidos
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', ownerOnly, SubscriptionPlanController.updatePlan);

/**
 * @swagger
 * /api/plans/{id}/status:
 *   patch:
 *     summary: Cambiar estado del plan
 *     description: Actualiza el estado de un plan (ACTIVE, INACTIVE, DEPRECATED) - Solo OWNER
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del plan
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                 description: Nuevo estado del plan
 *                 example: "INACTIVE"
 *     responses:
 *       200:
 *         description: Estado del plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *                 message:
 *                   type: string
 *                   example: "Estado del plan actualizado a INACTIVE"
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/plans/{id}/toggle-status:
 *   patch:
 *     summary: Alternar estado del plan (ACTIVE <-> INACTIVE)
 *     description: Cambia el estado del plan entre ACTIVE e INACTIVE automáticamente
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan
 *     responses:
 *       200:
 *         description: Estado del plan alternado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *                 message:
 *                   type: string
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/toggle-status', ownerOnly, SubscriptionPlanController.togglePlanStatus);

router.patch('/:id/status', ownerOnly, SubscriptionPlanController.updatePlanStatus);

/**
 * @swagger
 * /api/plans/{id}:
 *   delete:
 *     summary: Eliminar plan (deprecar)
 *     description: Marca un plan como DEPRECATED (eliminación lógica) - Solo OWNER
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del plan
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Plan marcado como DEPRECATED exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Plan marcado como DEPRECATED exitosamente"
 *                 plan:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos de OWNER
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Plan en uso por suscripciones activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/plans/{id}/toggle-status:
 *   patch:
 *     summary: Alternar estado del plan (ACTIVE <-> INACTIVE)
 *     description: Cambia el estado del plan entre ACTIVE e INACTIVE automáticamente
 *     tags: [💎 Planes de Suscripción]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan
 *     responses:
 *       200:
 *         description: Estado del plan alternado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SubscriptionPlan'
 *                 message:
 *                   type: string
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', ownerOnly, SubscriptionPlanController.deletePlan);

module.exports = router;