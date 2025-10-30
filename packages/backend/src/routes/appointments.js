const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');
const { authenticateToken } = require('../middleware/auth');
const { Appointment } = require('../models');
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

// Iniciar cita (cambiar a IN_PROGRESS)
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.query;

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Validar que esté en estado PENDING o CONFIRMED
    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: `No se puede iniciar una cita en estado ${appointment.status}`
      });
    }

    // Actualizar a IN_PROGRESS
    await appointment.update({
      status: 'IN_PROGRESS',
      startedAt: new Date()
    });

    return res.json({
      success: true,
      message: 'Cita iniciada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('Error al iniciar cita:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Completar cita con pago
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.query;
    const { payment, notes } = req.body;

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Cita no encontrada'
      });
    }

    // Validar que esté en estado IN_PROGRESS
    if (appointment.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        error: `No se puede completar una cita en estado ${appointment.status}. Debe estar en progreso.`
      });
    }

    // Actualizar a COMPLETED
    const updateData = {
      status: 'COMPLETED',
      completedAt: new Date()
    };

    if (notes) {
      updateData.specialistNotes = notes;
    }

    // Si se proporciona información de pago, actualizar el estado de pago
    if (payment) {
      updateData.paymentStatus = 'PAID';
      updateData.paidAt = new Date();
    }

    await appointment.update(updateData);

    return res.json({
      success: true,
      message: 'Cita completada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('Error al completar cita:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Subir evidencia de cita
router.post('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.query;
    const { evidence } = req.body; // { before: [], after: [], documents: [] }

    if (!evidence) {
      return res.status(400).json({
        success: false,
        error: 'Datos de evidencia requeridos'
      });
    }

    const where = { id, businessId };

    // Aplicar filtros de acceso según el rol
    if (req.specialist) {
      where.specialistId = req.specialist.id;
    }

    const appointment = await Appointment.findOne({ where });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Actualizar evidencia
    // Merge con evidencia existente si la hay
    const currentEvidence = appointment.evidence || { before: [], after: [], documents: [] };
    const updatedEvidence = {
      before: [...(currentEvidence.before || []), ...(evidence.before || [])],
      after: [...(currentEvidence.after || []), ...(evidence.after || [])],
      documents: [...(currentEvidence.documents || []), ...(evidence.documents || [])]
    };

    await appointment.update({
      evidence: updatedEvidence
    });

    console.log(`✅ Evidencia actualizada para turno ${id}`);

    return res.json({
      success: true,
      message: 'Evidencia guardada exitosamente',
      data: appointment
    });

  } catch (error) {
    console.error('Error al subir evidencia:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;