const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

/**
 * @swagger
 * tags:
 *   - name: 💎 Planes de Suscripción
 *     description: |
 *       **Gestión completa de planes de suscripción con acceso público y privado**
 *       
 *       ## 🔓 **Rutas Públicas** (Sin autenticación)
 *       - `GET /api/plans` - Lista planes activos con módulos incluidos
 *       - `GET /api/plans/:id` - Obtiene plan específico activo con módulos
 *       
 *       ## 🔒 **Rutas Privadas** (Requieren autenticación OWNER)
 *       - `POST /api/plans` - Crear nuevo plan
 *       - `PUT /api/plans/:id` - Actualizar plan existente
 *       - `DELETE /api/plans/:id` - Eliminar plan
 *       - Gestión de módulos y configuraciones avanzadas
 *       
 *       ## ✨ **Características Especiales**
 *       - **📦 Módulos Automáticos**: Las rutas públicas incluyen módulos por defecto
 *       - **🎯 Filtrado Inteligente**: Solo planes ACTIVE visibles públicamente
 *       - **📄 Paginación Completa**: Información detallada de navegación
 *       - **🔍 Búsqueda Avanzada**: Por nombre y descripción
 */

// === DEBUG ROUTE - Ruta de prueba sin middleware ===
router.get('/test-public', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta pública funcionando correctamente',
    timestamp: new Date().toISOString(),
    hasUser: !!req.user
  });
});

// === RUTAS PÚBLICAS (sin autenticación) ===
// IMPORTANTE: Estas deben ir ANTES del middleware de autenticación

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Obtener plan por ID (PÚBLICO)
 *     description: |
 *       Obtiene la información detallada de un plan específico de forma pública.
 *       
 *       **🔓 Acceso Público**: Esta ruta no requiere autenticación.
 *       
 *       **📦 Módulos Incluidos**: Los módulos se incluyen automáticamente por defecto en peticiones públicas.
 *       
 *       **🎯 Filtrado**: Solo se muestran planes con status ACTIVE para peticiones públicas.
 *     tags: [💎 Planes de Suscripción]
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
 *         description: Incluir módulos en la respuesta (true por defecto en peticiones públicas)
 *     responses:
 *       200:
 *         description: Plan obtenido exitosamente con módulos incluidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/SubscriptionPlan'
 *                     - type: object
 *                       properties:
 *                         modules:
 *                           type: array
 *                           description: Módulos incluidos en el plan
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               displayName:
 *                                 type: string
 *                               icon:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                               PlanModule:
 *                                 type: object
 *                                 properties:
 *                                   isIncluded:
 *                                     type: boolean
 *                                   limitQuantity:
 *                                     type: integer
 *                                     nullable: true
 *                                   additionalPrice:
 *                                     type: number
 *                                   configuration:
 *                                     type: object
 *       404:
 *         description: Plan no encontrado o no disponible públicamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', SubscriptionPlanController.getPlanById);

/**
 * @swagger
 * /api/plans:
 *   get:
 *     summary: Obtener todos los planes de suscripción (PÚBLICO)
 *     description: |
 *       Lista todos los planes disponibles públicamente con paginación y filtros.
 *       
 *       **🔓 Acceso Público**: Esta ruta no requiere autenticación.
 *       
 *       **📦 Módulos Incluidos**: Los módulos se incluyen automáticamente por defecto en peticiones públicas.
 *       
 *       **🎯 Filtrado**: Solo se muestran planes con status ACTIVE para peticiones públicas.
 *       
 *       **📄 Paginación**: Incluye información completa de paginación y filtros aplicados.
 *     tags: [💎 Planes de Suscripción]
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
 *           enum: [ACTIVE]
 *           default: ACTIVE
 *         description: Solo planes activos disponibles en rutas públicas (filtro automático)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción del plan
 *       - in: query
 *         name: includeModules
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir módulos en la respuesta (true por defecto en peticiones públicas)
 *     responses:
 *       200:
 *         description: Lista de planes obtenida exitosamente con módulos incluidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Lista de planes con módulos incluidos
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/SubscriptionPlan'
 *                       - type: object
 *                         properties:
 *                           modules:
 *                             type: array
 *                             description: Módulos incluidos en el plan
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 name:
 *                                   type: string
 *                                 displayName:
 *                                   type: string
 *                                 icon:
 *                                   type: string
 *                                 category:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                                   enum: [ACTIVE, INACTIVE]
 *                                 pricing:
 *                                   type: object
 *                                 PlanModule:
 *                                   type: object
 *                                   properties:
 *                                     isIncluded:
 *                                       type: boolean
 *                                       description: Si el módulo está incluido en el plan
 *                                     limitQuantity:
 *                                       type: integer
 *                                       nullable: true
 *                                       description: Cantidad límite del módulo
 *                                     additionalPrice:
 *                                       type: number
 *                                       description: Precio adicional del módulo
 *                                     configuration:
 *                                       type: object
 *                                       description: Configuración específica del módulo
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     totalItems:
 *                       type: integer
 *                       example: 4
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: false
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                 filters:
 *                   type: object
 *                   properties:
 *                     statuses:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["ACTIVE"]
 *                       description: Estados de planes aplicados como filtro
 *       400:
 *         description: Error de validación en parámetros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', SubscriptionPlanController.getPlans);

// === MIDDLEWARE DE AUTENTICACIÓN PARA RUTAS PROTEGIDAS ===
// Todas las rutas debajo de esta línea requieren autenticación
router.use(authenticateToken);

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