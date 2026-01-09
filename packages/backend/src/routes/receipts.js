const express = require('express');
const router = express.Router();
const ReceiptController = require('../controllers/ReceiptController');
const { authenticateToken } = require('../middleware/auth');
const { allStaffRoles, businessAndOwner, staffRoles } = require('../middleware/roleCheck');

/**
 * Rutas para gestión de recibos
 */

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * POST /api/receipts/from-appointment/:appointmentId
 * Crear un recibo desde una cita pagada
 * Acceso: Especialista, Recepcionista, Propietario, Business
 */
router.post('/from-appointment/:appointmentId', 
  allStaffRoles,
  ReceiptController.createFromAppointment
);

/**
 * GET /api/receipts/:id
 * Obtener recibo por ID
 * Acceso: Staff del negocio
 */
router.get('/:id', 
  allStaffRoles,
  ReceiptController.getById
);

/**
 * GET /api/receipts/number/:receiptNumber
 * Obtener recibo por número
 * Acceso: Staff del negocio
 */
router.get('/number/:receiptNumber', 
  allStaffRoles,
  ReceiptController.getByNumber
);

/**
 * GET /api/receipts/business/:businessId
 * Listar recibos por negocio
 * Query params: page, limit, startDate, endDate, specialistId, status
 * Acceso: Propietario, Business
 */
router.get('/business/:businessId', 
  businessAndOwner,
  ReceiptController.getByBusiness
);

/**
 * GET /api/receipts/specialist/:specialistId
 * Listar recibos por especialista
 * Query params: page, limit, startDate, endDate, status
 * Acceso: Especialista (solo sus propios recibos), Propietario, Business
 */
router.get('/specialist/:specialistId', 
  (req, res, next) => {
    // Verificar que el especialista solo acceda a sus propios recibos
    // o que sea el propietario/business del negocio
    if ((req.user.role === 'SPECIALIST' || req.user.role === 'BUSINESS_SPECIALIST') && req.user.id !== parseInt(req.params.specialistId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estos recibos'
      });
    }
    next();
  },
  allStaffRoles,
  ReceiptController.getBySpecialist
);

/**
 * PUT /api/receipts/:id/sent-email
 * Marcar recibo como enviado por email
 * Acceso: Staff del negocio
 */
router.put('/:id/sent-email', 
  allStaffRoles,
  ReceiptController.markSentViaEmail
);

/**
 * PUT /api/receipts/:id/sent-whatsapp
 * Marcar recibo como enviado por WhatsApp
 * Acceso: Staff del negocio
 */
router.put('/:id/sent-whatsapp', 
  allStaffRoles,
  ReceiptController.markSentViaWhatsApp
);

/**
 * GET /api/receipts/business/:businessId/statistics
 * Obtener estadísticas de recibos por negocio
 * Query params: startDate, endDate
 * Acceso: Propietario, Business
 */
router.get('/business/:businessId/statistics', 
  businessAndOwner,
  ReceiptController.getStatistics
);

module.exports = router;