const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const BranchController = require('../controllers/BranchController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ==================== SUCURSALES ====================

/**
 * @swagger
 * /api/business/{businessId}/branches:
 *   get:
 *     summary: Obtener todas las sucursales de un negocio
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sucursales obtenidas exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/branches', BranchController.getBranches);

/**
 * @swagger
 * /api/business/{businessId}/branches:
 *   post:
 *     summary: Crear una nueva sucursal
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código único de la sucursal
 *               name:
 *                 type: string
 *                 description: Nombre de la sucursal
 *               address:
 *                 type: string
 *                 description: Dirección de la sucursal
 *               city:
 *                 type: string
 *                 description: Ciudad
 *               state:
 *                 type: string
 *                 description: Estado/Provincia
 *               country:
 *                 type: string
 *                 description: País
 *               postalCode:
 *                 type: string
 *                 description: Código postal
 *               phone:
 *                 type: string
 *                 description: Teléfono de la sucursal
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de la sucursal
 *               businessHours:
 *                 type: object
 *                 description: Horarios de atención por día
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para crear sucursales
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/branches', BranchController.createBranch);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}:
 *   get:
 *     summary: Obtener una sucursal específica
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sucursal obtenida exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/branches/:branchId', BranchController.getBranch);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}:
 *   put:
 *     summary: Actualizar una sucursal
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código único de la sucursal
 *               name:
 *                 type: string
 *                 description: Nombre de la sucursal
 *               address:
 *                 type: string
 *                 description: Dirección de la sucursal
 *               city:
 *                 type: string
 *                 description: Ciudad
 *               state:
 *                 type: string
 *                 description: Estado/Provincia
 *               country:
 *                 type: string
 *                 description: País
 *               postalCode:
 *                 type: string
 *                 description: Código postal
 *               phone:
 *                 type: string
 *                 description: Teléfono de la sucursal
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de la sucursal
 *               businessHours:
 *                 type: object
 *                 description: Horarios de atención por día
 *               isActive:
 *                 type: boolean
 *                 description: Indica si la sucursal está activa
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para actualizar
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/branches/:branchId', BranchController.updateBranch);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}:
 *   delete:
 *     summary: Desactivar una sucursal
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sucursal desactivada exitosamente
 *       403:
 *         description: No tienes permisos para eliminar
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:businessId/branches/:branchId', BranchController.deleteBranch);

// ==================== ESPECIALISTAS DE SUCURSAL ====================

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/specialists:
 *   get:
 *     summary: Obtener especialistas asignados a una sucursal
 *     tags: [Branch Specialists]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Especialistas obtenidos exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       404:
 *         description: Sucursal no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/branches/:branchId/specialists', BranchController.getBranchSpecialists);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/specialists:
 *   post:
 *     summary: Asignar especialistas a una sucursal
 *     tags: [Branch Specialists]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialistIds
 *             properties:
 *               specialistIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: IDs de los especialistas a asignar
 *     responses:
 *       200:
 *         description: Especialistas asignados exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para asignar especialistas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/branches/:branchId/specialists', BranchController.assignSpecialists);

// ==================== HORARIOS DE ESPECIALISTAS ====================

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/schedules:
 *   get:
 *     summary: Obtener horarios de especialistas en una sucursal
 *     tags: [Branch Schedules]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Horarios obtenidos exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/branches/:branchId/schedules', BranchController.getBranchSchedules);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/schedules:
 *   post:
 *     summary: Crear horario de especialista en sucursal
 *     tags: [Branch Schedules]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialistId
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               specialistId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del especialista
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 *               startTime:
 *                 type: string
 *                 format: time
 *                 description: Hora de inicio
 *               endTime:
 *                 type: string
 *                 format: time
 *                 description: Hora de fin
 *               priority:
 *                 type: integer
 *                 default: 1
 *                 description: Prioridad del horario
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si el horario está activo
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 *       400:
 *         description: Datos inválidos o conflicto de horarios
 *       403:
 *         description: No tienes permisos para crear horarios
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/branches/:branchId/schedules', BranchController.createSpecialistSchedule);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/schedules/{scheduleId}:
 *   put:
 *     summary: Actualizar horario de especialista en sucursal
 *     tags: [Branch Schedules]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 *               startTime:
 *                 type: string
 *                 format: time
 *                 description: Hora de inicio
 *               endTime:
 *                 type: string
 *                 format: time
 *                 description: Hora de fin
 *               priority:
 *                 type: integer
 *                 description: Prioridad del horario
 *               isActive:
 *                 type: boolean
 *                 description: Indica si el horario está activo
 *     responses:
 *       200:
 *         description: Horario actualizado exitosamente
 *       400:
 *         description: Datos inválidos o conflicto de horarios
 *       403:
 *         description: No tienes permisos para actualizar horarios
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/branches/:branchId/schedules/:scheduleId', BranchController.updateSpecialistSchedule);

/**
 * @swagger
 * /api/business/{businessId}/branches/{branchId}/schedules/{scheduleId}:
 *   delete:
 *     summary: Eliminar horario de especialista en sucursal
 *     tags: [Branch Schedules]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Horario eliminado exitosamente
 *       403:
 *         description: No tienes permisos para eliminar horarios
 *       404:
 *         description: Horario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:businessId/branches/:branchId/schedules/:scheduleId', BranchController.deleteSpecialistSchedule);

module.exports = router;