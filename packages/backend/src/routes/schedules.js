/**
 * ��� ROUTES: SCHEDULES
 * 
 * Rutas para gestión de horarios y agenda
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const ScheduleController = require('../controllers/ScheduleController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - specialistId
 *         - weeklySchedule
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del horario
 *         name:
 *           type: string
 *           description: Nombre del horario
 *         type:
 *           type: string
 *           enum: [REGULAR, SPECIAL, TEMPORARY]
 *           description: Tipo de horario
 *         specialistId:
 *           type: integer
 *           description: ID del especialista
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DRAFT]
 *           description: Estado del horario
 *         weeklySchedule:
 *           type: object
 *           description: Configuración semanal del horario
 *         startDate:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del horario
 *         endDate:
 *           type: string
 *           format: date
 *           description: Fecha de fin del horario
 *         slotDuration:
 *           type: integer
 *           description: Duración de cada slot en minutos
 *         bufferTime:
 *           type: integer
 *           description: Tiempo de buffer entre citas
 *         maxAdvanceBooking:
 *           type: integer
 *           description: Días máximos de reserva anticipada
 */

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Crear nuevo horario
 *     tags: [Schedules]
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
 *               - type
 *               - specialistId
 *               - weeklySchedule
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Horario Regular Dr. García"
 *               type:
 *                 type: string
 *                 enum: [REGULAR, SPECIAL, TEMPORARY]
 *                 example: "REGULAR"
 *               specialistId:
 *                 type: integer
 *                 example: 123
 *               weeklySchedule:
 *                 type: object
 *                 example: {
 *                   "monday": {
 *                     "isActive": true,
 *                     "shifts": [
 *                       {
 *                         "startTime": "09:00",
 *                         "endTime": "13:00",
 *                         "type": "WORK"
 *                       },
 *                       {
 *                         "startTime": "14:00",
 *                         "endTime": "18:00",
 *                         "type": "WORK"
 *                       }
 *                     ]
 *                   }
 *                 }
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               slotDuration:
 *                 type: integer
 *                 example: 30
 *               bufferTime:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post('/',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    body('name')
      .notEmpty()
      .withMessage('Nombre del horario requerido')
      .isLength({ min: 3, max: 100 })
      .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
    
    body('type')
      .isIn(['REGULAR', 'SPECIAL', 'TEMPORARY'])
      .withMessage('Tipo de horario inválido'),
    
    body('specialistId')
      .isInt({ min: 1 })
      .withMessage('ID del especialista requerido'),
    
    body('weeklySchedule')
      .isObject()
      .withMessage('Configuración semanal requerida'),
    
    body('slotDuration')
      .optional()
      .isInt({ min: 15, max: 240 })
      .withMessage('Duración de slot debe estar entre 15 y 240 minutos'),
    
    body('bufferTime')
      .optional()
      .isInt({ min: 0, max: 60 })
      .withMessage('Tiempo de buffer debe estar entre 0 y 60 minutos')
  ],
  ScheduleController.createSchedule
);

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Obtener horarios del negocio
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: integer
 *         description: Filtrar por especialista
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [REGULAR, SPECIAL, TEMPORARY]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, DRAFT]
 *         description: Filtrar por estado
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
 *           default: 20
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de horarios
 *       401:
 *         description: No autorizado
 */
router.get('/',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('specialistId').optional().isInt({ min: 1 }),
    query('type').optional().isIn(['REGULAR', 'SPECIAL', 'TEMPORARY']),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DRAFT']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  ScheduleController.getSchedules
);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   get:
 *     summary: Obtener detalle de un horario
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del horario
 *     responses:
 *       200:
 *         description: Detalle del horario
 *       404:
 *         description: Horario no encontrado
 */
router.get('/:scheduleId',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    param('scheduleId').isInt({ min: 1 }).withMessage('ID de horario inválido')
  ],
  ScheduleController.getScheduleDetail
);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   put:
 *     summary: Actualizar horario
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, DRAFT]
 *               weeklySchedule:
 *                 type: object
 *               slotDuration:
 *                 type: integer
 *               bufferTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Horario actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Horario no encontrado
 */
router.put('/:scheduleId',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    param('scheduleId').isInt({ min: 1 }).withMessage('ID de horario inválido'),
    body('name').optional().isLength({ min: 3, max: 100 }),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DRAFT']),
    body('weeklySchedule').optional().isObject(),
    body('slotDuration').optional().isInt({ min: 15, max: 240 }),
    body('bufferTime').optional().isInt({ min: 0, max: 60 })
  ],
  ScheduleController.updateSchedule
);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   delete:
 *     summary: Eliminar horario
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horario eliminado exitosamente
 *       404:
 *         description: Horario no encontrado
 */
router.delete('/:scheduleId',
  authorizeRole(['OWNER', 'BUSINESS']),
  [
    param('scheduleId').isInt({ min: 1 }).withMessage('ID de horario inválido')
  ],
  ScheduleController.deleteSchedule
);

/**
 * @swagger
 * /api/schedules/{scheduleId}/generate-slots:
 *   post:
 *     summary: Generar slots para un horario
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-31"
 *               generateBreaks:
 *                 type: boolean
 *                 default: true
 *               overwriteExisting:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Slots generados exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/:scheduleId/generate-slots',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    param('scheduleId').isInt({ min: 1 }).withMessage('ID de horario inválido'),
    body('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    body('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    body('generateBreaks').optional().isBoolean(),
    body('overwriteExisting').optional().isBoolean()
  ],
  ScheduleController.generateSlots
);

/**
 * @swagger
 * /api/schedules/bulk-generate:
 *   post:
 *     summary: Generar slots para múltiples horarios
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleIds
 *               - startDate
 *               - endDate
 *             properties:
 *               scheduleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               generateBreaks:
 *                 type: boolean
 *                 default: true
 *               overwriteExisting:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Generación masiva completada
 *       400:
 *         description: Error de validación
 */
router.post('/bulk-generate',
  authorizeRole(['OWNER', 'BUSINESS']),
  [
    body('scheduleIds').isArray({ min: 1 }).withMessage('Lista de horarios requerida'),
    body('scheduleIds.*').isInt({ min: 1 }).withMessage('IDs de horarios inválidos'),
    body('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    body('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    body('generateBreaks').optional().isBoolean(),
    body('overwriteExisting').optional().isBoolean()
  ],
  ScheduleController.bulkGenerateSlots
);

/**
 * @swagger
 * /api/schedules/agenda/weekly:
 *   get:
 *     summary: Obtener agenda semanal
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio de la semana
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: integer
 *         description: Filtrar por especialista
 *     responses:
 *       200:
 *         description: Agenda semanal
 *       400:
 *         description: Fecha de inicio requerida
 */
router.get('/agenda/weekly',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('specialistId').optional().isInt({ min: 1 })
  ],
  ScheduleController.getWeeklyAgenda
);

/**
 * @swagger
 * /api/schedules/agenda/monthly:
 *   get:
 *     summary: Obtener agenda mensual
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes (1-12)
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: integer
 *         description: Filtrar por especialista
 *     responses:
 *       200:
 *         description: Agenda mensual
 *       400:
 *         description: Año y mes requeridos
 */
router.get('/agenda/monthly',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('year').isInt({ min: 2020, max: 2030 }).withMessage('Año inválido'),
    query('month').isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
    query('specialistId').optional().isInt({ min: 1 })
  ],
  ScheduleController.getMonthlyAgenda
);

/**
 * @swagger
 * /api/schedules/validate-weekly:
 *   post:
 *     summary: Validar configuración de horario semanal
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialistId
 *               - weeklySchedule
 *             properties:
 *               specialistId:
 *                 type: integer
 *               weeklySchedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Validación completada
 *       400:
 *         description: Error de validación
 */
router.post('/validate-weekly',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    body('specialistId').isInt({ min: 1 }).withMessage('ID del especialista requerido'),
    body('weeklySchedule').isObject().withMessage('Configuración semanal requerida')
  ],
  ScheduleController.validateWeeklySchedule
);

/**
 * @swagger
 * /api/schedules/{scheduleId}/clone:
 *   post:
 *     summary: Clonar horario existente
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               specialistId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Horario clonado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Horario original no encontrado
 */
router.post('/:scheduleId/clone',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    param('scheduleId').isInt({ min: 1 }).withMessage('ID de horario inválido'),
    body('name').notEmpty().withMessage('Nombre del nuevo horario requerido'),
    body('specialistId').optional().isInt({ min: 1 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  ScheduleController.cloneSchedule
);

/**
 * @swagger
 * /api/schedules/templates:
 *   get:
 *     summary: Obtener plantillas de horarios
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de plantillas disponibles
 */
router.get('/templates',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  ScheduleController.getScheduleTemplates
);

/**
 * @swagger
 * /api/schedules/from-template:
 *   post:
 *     summary: Crear horario desde plantilla
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - name
 *               - specialistId
 *             properties:
 *               templateId:
 *                 type: string
 *               name:
 *                 type: string
 *               specialistId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               customizations:
 *                 type: object
 *     responses:
 *       201:
 *         description: Horario creado desde plantilla
 *       400:
 *         description: Error de validación
 */
router.post('/from-template',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    body('templateId').notEmpty().withMessage('ID de plantilla requerido'),
    body('name').notEmpty().withMessage('Nombre del horario requerido'),
    body('specialistId').isInt({ min: 1 }).withMessage('ID del especialista requerido'),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('customizations').optional().isObject()
  ],
  ScheduleController.createFromTemplate
);

module.exports = router;
