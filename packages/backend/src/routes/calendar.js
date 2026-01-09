/**
 * 📅 ROUTES: CALENDAR
 * 
 * Rutas para gestión de calendarios y vistas de disponibilidad
 */

const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/CalendarController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * Vista completa del negocio (Owner/Business Admin)
 * GET /api/calendar/business/:businessId
 * Query params:
 *   - startDate: YYYY-MM-DD (required)
 *   - endDate: YYYY-MM-DD (required)
 *   - branchId: UUID (optional) - filtrar por sucursal
 *   - specialistId: UUID (optional) - filtrar por especialista
 *   - status: String (optional) - filtrar por estado
 */
router.get('/business/:businessId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN']),
  CalendarController.getBusinessCalendar
);

/**
 * Vista de sucursal específica (Receptionist)
 * GET /api/calendar/branch/:branchId
 * Query params:
 *   - startDate: YYYY-MM-DD (required)
 *   - endDate: YYYY-MM-DD (required)
 *   - specialistId: UUID (optional)
 *   - status: String (optional)
 */
router.get('/branch/:branchId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'RECEPTIONIST', 'SPECIALIST_RECEPTIONIST']),
  CalendarController.getBranchCalendar
);

/**
 * Agenda combinada de especialista (todas sus sucursales)
 * GET /api/calendar/specialist/:specialistId
 * Query params:
 *   - startDate: YYYY-MM-DD (required)
 *   - endDate: YYYY-MM-DD (required)
 *   - branchId: UUID (optional) - filtrar por sucursal específica
 *   - status: String (optional)
 */
router.get('/specialist/:specialistId',
  authorizeRole(['OWNER', 'BUSINESS_ADMIN', 'SPECIALIST', 'SPECIALIST_RECEPTIONIST', 'BUSINESS_SPECIALIST']),
  CalendarController.getSpecialistCombinedCalendar
);

/**
 * Obtener slots disponibles para un día específico
 * GET /api/calendar/available-slots
 * Query params:
 *   - businessId: UUID (required)
 *   - branchId: UUID (required)
 *   - specialistId: UUID (required)
 *   - serviceId: UUID (required)
 *   - date: YYYY-MM-DD (required)
 * 
 * Esta ruta puede ser pública si el negocio tiene reserva online activa
 */
router.get('/available-slots',
  CalendarController.getAvailableSlots
);

/**
 * Obtener disponibilidad de rango de fechas
 * GET /api/calendar/availability-range
 * Query params:
 *   - businessId: UUID (required)
 *   - branchId: UUID (required)
 *   - specialistId: UUID (required)
 *   - serviceId: UUID (required)
 *   - startDate: YYYY-MM-DD (required)
 *   - endDate: YYYY-MM-DD (required)
 */
router.get('/availability-range',
  CalendarController.getAvailabilityRange
);

/**
 * Obtener especialistas disponibles en una sucursal
 * GET /api/calendar/branch/:branchId/specialists
 * Query params:
 *   - serviceId: UUID (optional) - para verificar disponibilidad
 *   - date: YYYY-MM-DD (optional)
 *   - time: HH:MM (optional)
 * 
 * Si se proporciona serviceId, date y time, retorna solo especialistas disponibles
 * Si no, retorna todos los especialistas de la sucursal
 */
router.get('/branch/:branchId/specialists',
  CalendarController.getBranchSpecialists
);

module.exports = router;
