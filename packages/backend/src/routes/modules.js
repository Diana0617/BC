const express = require('express');
const router = express.Router();
const ModuleController = require('../controllers/ModuleController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para autenticación en todas las rutas
router.use(authenticateToken);

// === RUTAS PÚBLICAS (para usuarios autenticados) ===

/**
 * @route GET /api/modules
 * @desc Obtener todos los módulos con paginación y filtros
 * @access Private (cualquier usuario autenticado)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} category - Filtrar por categoría
 * @query {string} status - Filtrar por estado
 * @query {string} search - Búsqueda por nombre, displayName o descripción
 */
router.get('/', ModuleController.getModules);

/**
 * @route GET /api/modules/category/:category
 * @desc Obtener módulos por categoría específica
 * @access Private (cualquier usuario autenticado)
 * @param {string} category - Categoría del módulo
 * @query {string} status - Filtrar por estado (default: ACTIVE)
 */
router.get('/category/:category', ModuleController.getModulesByCategory);

/**
 * @route GET /api/modules/:id
 * @desc Obtener un módulo específico por ID
 * @access Private (cualquier usuario autenticado)
 * @param {string} id - ID del módulo
 */
router.get('/:id', ModuleController.getModuleById);

/**
 * @route GET /api/modules/:id/dependencies
 * @desc Obtener dependencias de un módulo específico
 * @access Private (cualquier usuario autenticado)
 * @param {string} id - ID del módulo
 */
router.get('/:id/dependencies', ModuleController.getModuleDependencies);

// === RUTAS ADMINISTRATIVAS (solo para OWNER) ===

/**
 * @route POST /api/modules
 * @desc Crear un nuevo módulo
 * @access Private (solo OWNER)
 * @body {object} moduleData - Datos del módulo a crear
 */
router.post('/', ownerOnly, ModuleController.createModule);

/**
 * @route PUT /api/modules/:id
 * @desc Actualizar un módulo existente
 * @access Private (solo OWNER)
 * @param {string} id - ID del módulo
 * @body {object} moduleData - Datos del módulo a actualizar
 */
router.put('/:id', ownerOnly, ModuleController.updateModule);

/**
 * @route PATCH /api/modules/:id/status
 * @desc Cambiar estado de un módulo
 * @access Private (solo OWNER)
 * @param {string} id - ID del módulo
 * @body {string} status - Nuevo estado del módulo
 */
router.patch('/:id/status', ownerOnly, ModuleController.updateModuleStatus);

/**
 * @route DELETE /api/modules/:id
 * @desc Eliminar un módulo (marcar como DEPRECATED)
 * @access Private (solo OWNER)
 * @param {string} id - ID del módulo
 */
router.delete('/:id', ownerOnly, ModuleController.deleteModule);

module.exports = router;