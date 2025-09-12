const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para autenticación en todas las rutas
router.use(authenticateToken);

// === RUTAS PÚBLICAS (para usuarios autenticados) ===

/**
 * @route GET /api/plans
 * @desc Obtener todos los planes de suscripción con paginación y filtros
 * @access Private (cualquier usuario autenticado)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} status - Filtrar por estado
 * @query {string} search - Búsqueda por nombre o descripción
 * @query {boolean} includeModules - Incluir módulos en la respuesta
 */
router.get('/', SubscriptionPlanController.getPlans);

/**
 * @route GET /api/plans/available-modules
 * @desc Obtener módulos disponibles para crear planes
 * @access Private (solo OWNER)
 * @query {string} category - Filtrar por categoría
 * @query {string} status - Filtrar por estado (default: ACTIVE)
 */
router.get('/available-modules', ownerOnly, SubscriptionPlanController.getAvailableModules);

/**
 * @route POST /api/plans/calculate-price
 * @desc Calcular precio total de un plan basado en módulos seleccionados
 * @access Private (solo OWNER)
 * @body {array} modules - Array de módulos seleccionados
 * @body {number} basePlanPrice - Precio base del plan
 */
router.post('/calculate-price', ownerOnly, SubscriptionPlanController.calculatePlanPrice);

/**
 * @route GET /api/plans/:id
 * @desc Obtener un plan específico por ID
 * @access Private (cualquier usuario autenticado)
 * @param {string} id - ID del plan
 * @query {boolean} includeModules - Incluir módulos en la respuesta (default: true)
 */
router.get('/:id', SubscriptionPlanController.getPlanById);

// === RUTAS ADMINISTRATIVAS (solo para OWNER) ===

/**
 * @route POST /api/plans
 * @desc Crear un nuevo plan de suscripción
 * @access Private (solo OWNER)
 * @body {object} planData - Datos del plan a crear
 */
router.post('/', ownerOnly, SubscriptionPlanController.createPlan);

/**
 * @route PUT /api/plans/:id
 * @desc Actualizar un plan de suscripción existente
 * @access Private (solo OWNER)
 * @param {string} id - ID del plan
 * @body {object} planData - Datos del plan a actualizar
 */
router.put('/:id', ownerOnly, SubscriptionPlanController.updatePlan);

/**
 * @route PATCH /api/plans/:id/status
 * @desc Cambiar estado de un plan
 * @access Private (solo OWNER)
 * @param {string} id - ID del plan
 * @body {string} status - Nuevo estado del plan
 */
router.patch('/:id/status', ownerOnly, SubscriptionPlanController.updatePlanStatus);

/**
 * @route DELETE /api/plans/:id
 * @desc Eliminar un plan (marcar como DEPRECATED)
 * @access Private (solo OWNER)
 * @param {string} id - ID del plan
 */
router.delete('/:id', ownerOnly, SubscriptionPlanController.deletePlan);

module.exports = router;