const express = require('express');
const router = express.Router();
const ModuleController = require('../controllers/ModuleController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para autenticación en todas las rutas
router.use(authenticateToken);

// === RUTAS PÚBLICAS (para usuarios autenticados) ===

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Obtener todos los módulos del sistema
 *     description: Lista todos los módulos disponibles con paginación y filtros
 *     tags: [📦 Gestión de Módulos]
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
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, displayName o descripción
 *     responses:
 *       200:
 *         description: Lista de módulos obtenida exitosamente
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
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
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
router.get('/', ModuleController.getModules);

/**
 * @swagger
 * /api/modules/category/{category}:
 *   get:
 *     summary: Obtener módulos por categoría
 *     description: Lista todos los módulos de una categoría específica
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CORE, APPOINTMENT, INVENTORY, SALES, REPORTING, COMMUNICATION, SECURITY]
 *         description: Categoría del módulo
 *         example: "APPOINTMENT"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DEPRECATED]
 *           default: ACTIVE
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Módulos de la categoría obtenidos exitosamente
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
 *                 category:
 *                   type: string
 *                   example: "APPOINTMENT"
 *       400:
 *         description: Categoría inválida
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
router.get('/category/:category', ModuleController.getModulesByCategory);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Obtener módulo por ID
 *     description: Obtiene la información detallada de un módulo específico
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Módulo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *       404:
 *         description: Módulo no encontrado
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
router.get('/:id', ModuleController.getModuleById);

/**
 * @swagger
 * /api/modules/{id}/dependencies:
 *   get:
 *     summary: Obtener dependencias del módulo
 *     description: Lista todas las dependencias requeridas por un módulo específico
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Dependencias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dependencies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'
 *                 moduleId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       404:
 *         description: Módulo no encontrado
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
router.get('/:id/dependencies', ModuleController.getModuleDependencies);

// === RUTAS ADMINISTRATIVAS (solo para OWNER) ===

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Crear nuevo módulo
 *     description: Crea un nuevo módulo en el sistema (solo OWNER)
 *     tags: [📦 Gestión de Módulos]
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
 *               - displayName
 *               - category
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre técnico del módulo
 *                 example: "appointment_management"
 *               displayName:
 *                 type: string
 *                 description: Nombre mostrado al usuario
 *                 example: "Gestión de Citas"
 *               category:
 *                 type: string
 *                 enum: [CORE, APPOINTMENT, INVENTORY, SALES, REPORTING, COMMUNICATION, SECURITY]
 *                 description: Categoría del módulo
 *                 example: "APPOINTMENT"
 *               price:
 *                 type: number
 *                 description: Precio del módulo en centavos
 *                 example: 5000
 *               description:
 *                 type: string
 *                 description: Descripción detallada del módulo
 *                 example: "Módulo para gestionar citas y horarios"
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de características del módulo
 *                 example: ["Creación de citas", "Calendario", "Notificaciones"]
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs de módulos requeridos
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DEPRECATED]
 *                 default: ACTIVE
 *                 description: Estado del módulo
 *     responses:
 *       201:
 *         description: Módulo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 module:
 *                   $ref: '#/components/schemas/Module'
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
router.post('/', ownerOnly, ModuleController.createModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Actualizar módulo existente
 *     description: Actualiza la información de un módulo existente (solo OWNER)
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Nombre mostrado al usuario
 *                 example: "Gestión de Citas Avanzada"
 *               price:
 *                 type: number
 *                 description: Precio del módulo en centavos
 *                 example: 7500
 *               description:
 *                 type: string
 *                 description: Descripción detallada del módulo
 *                 example: "Módulo avanzado para gestionar citas con IA"
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de características del módulo
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs de módulos requeridos
 *     responses:
 *       200:
 *         description: Módulo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Módulo no encontrado
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
router.put('/:id', ownerOnly, ModuleController.updateModule);

/**
 * @swagger
 * /api/modules/{id}/status:
 *   patch:
 *     summary: Cambiar estado del módulo
 *     description: Actualiza el estado de un módulo (ACTIVE, INACTIVE, DEPRECATED) - Solo OWNER
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
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
 *                 description: Nuevo estado del módulo
 *                 example: "INACTIVE"
 *     responses:
 *       200:
 *         description: Estado del módulo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *                 message:
 *                   type: string
 *                   example: "Estado del módulo actualizado a INACTIVE"
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Módulo no encontrado
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
router.patch('/:id/status', ownerOnly, ModuleController.updateModuleStatus);

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Eliminar módulo (deprecar)
 *     description: Marca un módulo como DEPRECATED (eliminación lógica) - Solo OWNER. Use query param ?permanent=true para eliminación permanente.
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: permanent
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Si es true, elimina permanentemente el módulo. Si es false, solo lo marca como DEPRECATED.
 *         example: false
 *     responses:
 *       200:
 *         description: Módulo eliminado o marcado como DEPRECATED exitosamente
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
 *                   example: "Módulo marcado como obsoleto exitosamente"
 *       400:
 *         description: Error - Módulo en uso por planes activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No se puede eliminar permanentemente el módulo porque está siendo usado en uno o más planes de suscripción"
 *       404:
 *         description: Módulo no encontrado
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
router.delete('/:id', ownerOnly, ModuleController.deleteModule);

/**
 * @swagger
 * /api/modules/{id}/permanent:
 *   delete:
 *     summary: Eliminar módulo permanentemente
 *     description: Elimina permanentemente un módulo de la base de datos (NO REVERSIBLE) - Solo OWNER
 *     tags: [📦 Gestión de Módulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del módulo
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Módulo eliminado permanentemente exitosamente
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
 *                   example: "Módulo \"Gestión de Citas\" eliminado permanentemente"
 *                 deletedModule:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "appointment_management"
 *                     displayName:
 *                       type: string
 *                       example: "Gestión de Citas"
 *                     version:
 *                       type: string
 *                       example: "1.2.0"
 *       400:
 *         description: Error - Módulo en uso por planes activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No se puede eliminar permanentemente el módulo porque está siendo usado en uno o más planes de suscripción"
 *                 affectedPlans:
 *                   type: integer
 *                   example: 3
 *                   description: Número de planes que usan este módulo
 *       404:
 *         description: Módulo no encontrado
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
router.delete('/:id/permanent', ownerOnly, ModuleController.deleteModulePermanently);

module.exports = router;