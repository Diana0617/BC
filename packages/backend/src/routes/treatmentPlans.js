const express = require('express');
const router = express.Router();
const TreatmentPlanController = require('../controllers/TreatmentPlanController');
const TreatmentSessionController = require('../controllers/TreatmentSessionController');
const { authenticateToken } = require('../middleware/auth');

// ==================== RUTAS DE TREATMENT PLANS ====================

/**
 * @route   POST /api/treatment-plans
 * @desc    Crear nuevo plan de tratamiento
 * @access  Private (OWNER, MANAGER)
 */
router.post('/', authenticateToken, TreatmentPlanController.create);

/**
 * @route   GET /api/treatment-plans
 * @desc    Obtener todos los planes del negocio
 * @access  Private
 */
router.get('/', authenticateToken, TreatmentPlanController.getAll);

/**
 * @route   GET /api/treatment-plans/:id
 * @desc    Obtener plan por ID con todas sus sesiones
 * @access  Private
 */
router.get('/:id', authenticateToken, TreatmentPlanController.getById);

/**
 * @route   PATCH /api/treatment-plans/:id
 * @desc    Actualizar plan de tratamiento
 * @access  Private (OWNER, MANAGER)
 */
router.patch('/:id', authenticateToken, TreatmentPlanController.update);

/**
 * @route   DELETE /api/treatment-plans/:id
 * @desc    Cancelar plan de tratamiento
 * @access  Private (OWNER, MANAGER)
 */
router.delete('/:id', authenticateToken, TreatmentPlanController.cancel);

/**
 * @route   POST /api/treatment-plans/:id/payment
 * @desc    Registrar pago en el plan
 * @access  Private (OWNER, MANAGER, RECEPTION)
 */
router.post('/:id/payment', authenticateToken, TreatmentPlanController.addPayment);

// ==================== RUTAS DE TREATMENT SESSIONS ====================

/**
 * @route   GET /api/treatment-sessions/:id
 * @desc    Obtener sesión por ID
 * @access  Private
 */
router.get('/sessions/:id', authenticateToken, TreatmentSessionController.getById);

/**
 * @route   POST /api/treatment-sessions/:id/schedule
 * @desc    Agendar sesión (vincular con turno)
 * @access  Private (OWNER, MANAGER, RECEPTION)
 */
router.post('/sessions/:id/schedule', authenticateToken, TreatmentSessionController.schedule);

/**
 * @route   POST /api/treatment-sessions/:id/complete
 * @desc    Completar sesión
 * @access  Private (OWNER, MANAGER, SPECIALIST)
 */
router.post('/sessions/:id/complete', authenticateToken, TreatmentSessionController.complete);

/**
 * @route   POST /api/treatment-sessions/:id/cancel
 * @desc    Cancelar sesión
 * @access  Private (OWNER, MANAGER)
 */
router.post('/sessions/:id/cancel', authenticateToken, TreatmentSessionController.cancel);

/**
 * @route   POST /api/treatment-sessions/:id/photos
 * @desc    Agregar foto de progreso
 * @access  Private (OWNER, MANAGER, SPECIALIST)
 */
router.post('/sessions/:id/photos', authenticateToken, TreatmentSessionController.addPhoto);

/**
 * @route   DELETE /api/treatment-sessions/:id/photos/:photoIndex
 * @desc    Eliminar foto de progreso
 * @access  Private (OWNER, MANAGER)
 */
router.delete('/sessions/:id/photos/:photoIndex', authenticateToken, TreatmentSessionController.deletePhoto);

/**
 * @route   POST /api/treatment-sessions/:id/payment
 * @desc    Registrar pago de sesión
 * @access  Private (OWNER, MANAGER, RECEPTION)
 */
router.post('/sessions/:id/payment', authenticateToken, TreatmentSessionController.addPayment);

/**
 * @route   POST /api/treatment-sessions/:id/no-show
 * @desc    Marcar sesión como no asistida
 * @access  Private (OWNER, MANAGER, RECEPTION)
 */
router.post('/sessions/:id/no-show', authenticateToken, TreatmentSessionController.markNoShow);

/**
 * @route   PATCH /api/treatment-sessions/:id/reschedule
 * @desc    Reagendar sesión
 * @access  Private (OWNER, MANAGER, RECEPTION)
 */
router.patch('/sessions/:id/reschedule', authenticateToken, TreatmentSessionController.reschedule);

module.exports = router;
