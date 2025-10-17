const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles } = require('../middleware/roleCheck');

// Todas las rutas de citas requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener lista de citas
router.get('/', AppointmentController.getAppointments);

// Obtener citas por rango de fechas (debe ir ANTES de '/:id' para evitar conflictos)
router.get('/date-range', AppointmentController.getAppointmentsByDateRange);

// Crear nueva cita
router.post('/', AppointmentController.createAppointment);

// Obtener cita por ID
router.get('/:id', AppointmentController.getAppointmentDetail);

// Actualizar cita
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar cita aún no implementada'
  });
});

// Cancelar cita
router.patch('/:id/cancel', AppointmentController.updateAppointmentStatus);

// Completar cita
router.patch('/:id/complete', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de completar cita aún no implementada'
  });
});

// Subir evidencia de cita
router.post('/:id/evidence', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de subir evidencia aún no implementada'
  });
});

module.exports = router;