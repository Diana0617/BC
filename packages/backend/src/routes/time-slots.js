/**
 * ⏰ ROUTES: TIME SLOTS
 * Rutas para gestión de slots de tiempo y disponibilidad
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const TimeSlotController = require('../controllers/TimeSlotController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/time-slots/availability:
 *   get:
 *     summary: Consultar disponibilidad de slots
 *     tags: [TimeSlots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 30
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, BOOKED, BLOCKED, BREAK]
 *     responses:
 *       200:
 *         description: Disponibilidad consultada exitosamente
 *       400:
 *         description: Fechas requeridas
 */
router.get('/availability',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    query('specialistId').optional().isInt({ min: 1 }),
    query('duration').optional().isInt({ min: 15, max: 480 }),
    query('status').optional().isIn(['AVAILABLE', 'BOOKED', 'BLOCKED', 'BREAK'])
  ],
  TimeSlotController.getAvailability
);

/**
 * @swagger
 * /api/time-slots/next-available:
 *   get:
 *     summary: Encontrar próximo slot disponible
 *     tags: [TimeSlots]
 */
router.get('/next-available',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('specialistId').optional().isInt({ min: 1 }),
    query('duration').optional().isInt({ min: 15, max: 480 }),
    query('fromDate').optional().isISO8601(),
    query('maxDays').optional().isInt({ min: 1, max: 365 })
  ],
  TimeSlotController.getNextAvailable
);

/**
 * @swagger
 * /api/time-slots/business-availability:
 *   get:
 *     summary: Disponibilidad del negocio para una fecha
 *     tags: [TimeSlots]
 */
router.get('/business-availability',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    query('date').isISO8601().withMessage('Fecha inválida'),
    query('duration').optional().isInt({ min: 15, max: 480 })
  ],
  TimeSlotController.getBusinessAvailability
);

/**
 * @swagger
 * /api/time-slots/{slotId}:
 *   get:
 *     summary: Obtener detalle de un slot
 *     tags: [TimeSlots]
 */
router.get('/:slotId',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    param('slotId').isInt({ min: 1 }).withMessage('ID de slot inválido')
  ],
  TimeSlotController.getSlotDetail
);

/**
 * @swagger
 * /api/time-slots/{slotId}/block:
 *   post:
 *     summary: Bloquear un slot específico
 *     tags: [TimeSlots]
 */
router.post('/:slotId/block',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    param('slotId').isInt({ min: 1 }).withMessage('ID de slot inválido'),
    body('reason').notEmpty().withMessage('Razón del bloqueo requerida'),
    body('notes').optional().isString()
  ],
  TimeSlotController.blockSlot
);

/**
 * @swagger
 * /api/time-slots/{slotId}/unblock:
 *   post:
 *     summary: Desbloquear un slot específico
 *     tags: [TimeSlots]
 */
router.post('/:slotId/unblock',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    param('slotId').isInt({ min: 1 }).withMessage('ID de slot inválido'),
    body('notes').optional().isString()
  ],
  TimeSlotController.unblockSlot
);

/**
 * @swagger
 * /api/time-slots/bulk-block:
 *   post:
 *     summary: Bloquear múltiples slots
 *     tags: [TimeSlots]
 */
router.post('/bulk-block',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    body('slotIds').isArray({ min: 1 }).withMessage('Lista de IDs requerida'),
    body('slotIds.*').isInt({ min: 1 }).withMessage('IDs inválidos'),
    body('reason').notEmpty().withMessage('Razón del bloqueo requerida'),
    body('notes').optional().isString()
  ],
  TimeSlotController.bulkBlockSlots
);

/**
 * @swagger
 * /api/time-slots/block-time-range:
 *   post:
 *     summary: Bloquear rango de tiempo
 *     tags: [TimeSlots]
 */
router.post('/block-time-range',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    body('specialistId').isInt({ min: 1 }).withMessage('ID del especialista requerido'),
    body('startDateTime').isISO8601().withMessage('Fecha/hora de inicio inválida'),
    body('endDateTime').isISO8601().withMessage('Fecha/hora de fin inválida'),
    body('reason').notEmpty().withMessage('Razón del bloqueo requerida'),
    body('notes').optional().isString()
  ],
  TimeSlotController.blockTimeRange
);

/**
 * @swagger
 * /api/time-slots/utilization-stats:
 *   get:
 *     summary: Estadísticas de utilización
 *     tags: [TimeSlots]
 */
router.get('/utilization-stats',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    query('specialistId').optional().isInt({ min: 1 }),
    query('groupBy').optional().isIn(['day', 'week', 'month'])
  ],
  TimeSlotController.getUtilizationStats
);

/**
 * @swagger
 * /api/time-slots/utilization-report:
 *   get:
 *     summary: Reporte detallado de utilización
 *     tags: [TimeSlots]
 */
router.get('/utilization-report',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST']),
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    query('specialistId').optional().isInt({ min: 1 })
  ],
  TimeSlotController.getUtilizationReport
);

/**
 * @swagger
 * /api/time-slots/search:
 *   get:
 *     summary: Búsqueda avanzada de slots
 *     tags: [TimeSlots]
 */
router.get('/search',
  authorizeRole(['OWNER', 'BUSINESS', 'RECEPTIONIST', 'SPECIALIST', 'BUSINESS_SPECIALIST']),
  [
    query('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    query('minDuration').optional().isInt({ min: 15, max: 480 }),
    query('maxDuration').optional().isInt({ min: 15, max: 480 })
  ],
  TimeSlotController.searchAvailableSlots
);

module.exports = router;
