const { TreatmentSession, TreatmentPlan, Appointment, Service, Client, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Controlador para gestionar sesiones individuales de tratamiento
 */
const TreatmentSessionController = {

  /**
   * Obtener sesión por ID
   * GET /api/treatment-sessions/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const session = await TreatmentSession.findByPk(id, {
        include: [
          {
            model: TreatmentPlan,
            as: 'treatmentPlan',
            include: [
              { model: Client, as: 'client' },
              { model: Service, as: 'service' }
            ]
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'startTime', 'endTime', 'status', 'notes']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      return res.json(session);

    } catch (error) {
      console.error('❌ Error al obtener sesión:', error);
      return res.status(500).json({ 
        error: 'Error al obtener sesión',
        details: error.message 
      });
    }
  },

  /**
   * Agendar una sesión (vincular con un turno)
   * POST /api/treatment-sessions/:id/schedule
   */
  async schedule(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { appointmentId, specialistId } = req.body;

      if (!appointmentId) {
        await transaction.rollback();
        return res.status(400).json({ error: 'appointmentId es requerido' });
      }

      // Obtener la sesión
      const session = await TreatmentSession.findByPk(id, {
        include: [{ model: TreatmentPlan, as: 'treatmentPlan' }]
      });

      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (!session.canSchedule()) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Esta sesión no puede ser agendada',
          currentStatus: session.status
        });
      }

      // Verificar que el turno existe
      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Turno no encontrado' });
      }

      // Verificar que el turno no esté ya vinculado a otra sesión
      const existingSession = await TreatmentSession.findOne({
        where: { appointmentId }
      });

      if (existingSession) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Este turno ya está vinculado a otra sesión de tratamiento' 
        });
      }

      // Actualizar la sesión
      await session.update({
        appointmentId,
        specialistId: specialistId || appointment.specialistId,
        status: 'SCHEDULED',
        scheduledDate: appointment.startTime
      }, { transaction });

      await transaction.commit();

      const updatedSession = await TreatmentSession.findByPk(id, {
        include: [
          { model: TreatmentPlan, as: 'treatmentPlan' },
          { model: Appointment, as: 'appointment' },
          { model: User, as: 'specialist' }
        ]
      });

      return res.json({
        message: 'Sesión agendada exitosamente',
        session: updatedSession
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al agendar sesión:', error);
      return res.status(500).json({ 
        error: 'Error al agendar sesión',
        details: error.message 
      });
    }
  },

  /**
   * Completar una sesión
   * POST /api/treatment-sessions/:id/complete
   */
  async complete(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { notes, photosUrls, metadata } = req.body;

      const session = await TreatmentSession.findByPk(id, {
        include: [{ model: TreatmentPlan, as: 'treatmentPlan' }]
      });

      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (!session.canComplete()) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Esta sesión no puede ser completada',
          currentStatus: session.status,
          hasAppointment: !!session.appointmentId
        });
      }

      // Actualizar la sesión
      await session.update({
        status: 'COMPLETED',
        completedDate: new Date(),
        notes: notes || session.notes,
        photosUrls: photosUrls || session.photosUrls,
        metadata: metadata || session.metadata
      }, { transaction });

      // Actualizar el contador del plan de tratamiento
      const treatmentPlan = session.treatmentPlan;
      const newCompletedSessions = treatmentPlan.completedSessions + 1;

      await treatmentPlan.update({
        completedSessions: newCompletedSessions,
        status: newCompletedSessions >= treatmentPlan.totalSessions ? 'COMPLETED' : treatmentPlan.status,
        actualEndDate: newCompletedSessions >= treatmentPlan.totalSessions ? new Date() : treatmentPlan.actualEndDate
      }, { transaction });

      await transaction.commit();

      const updatedSession = await TreatmentSession.findByPk(id, {
        include: [
          { 
            model: TreatmentPlan, 
            as: 'treatmentPlan',
            include: [
              { model: Client, as: 'client' },
              { model: Service, as: 'service' }
            ]
          },
          { model: Appointment, as: 'appointment' },
          { model: User, as: 'specialist' }
        ]
      });

      return res.json({
        message: 'Sesión completada exitosamente',
        session: updatedSession,
        treatmentCompleted: newCompletedSessions >= treatmentPlan.totalSessions
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al completar sesión:', error);
      return res.status(500).json({ 
        error: 'Error al completar sesión',
        details: error.message 
      });
    }
  },

  /**
   * Cancelar una sesión
   * POST /api/treatment-sessions/:id/cancel
   */
  async cancel(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { reason } = req.body;

      const session = await TreatmentSession.findByPk(id);

      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (session.status === 'COMPLETED') {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'No se puede cancelar una sesión completada' 
        });
      }

      await session.update({
        status: 'CANCELLED',
        notes: session.notes 
          ? `${session.notes}\n\nCancelada: ${reason || 'Sin razón especificada'}`
          : `Cancelada: ${reason || 'Sin razón especificada'}`,
        appointmentId: null // Desvincular del turno si estaba agendada
      }, { transaction });

      await transaction.commit();

      return res.json({
        message: 'Sesión cancelada exitosamente',
        session
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al cancelar sesión:', error);
      return res.status(500).json({ 
        error: 'Error al cancelar sesión',
        details: error.message 
      });
    }
  },

  /**
   * Subir foto de progreso
   * POST /api/treatment-sessions/:id/photos
   */
  async addPhoto(req, res) {
    try {
      const { id } = req.params;
      const { photoUrl, type = 'progress', description } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: 'photoUrl es requerido' });
      }

      const session = await TreatmentSession.findByPk(id);

      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      // Agregar foto al array
      const currentPhotos = session.photosUrls || [];
      const newPhoto = {
        url: photoUrl,
        type,
        description: description || '',
        uploadedAt: new Date()
      };

      await session.update({
        photosUrls: [...currentPhotos, newPhoto]
      });

      return res.json({
        message: 'Foto agregada exitosamente',
        photo: newPhoto,
        totalPhotos: currentPhotos.length + 1
      });

    } catch (error) {
      console.error('❌ Error al agregar foto:', error);
      return res.status(500).json({ 
        error: 'Error al agregar foto',
        details: error.message 
      });
    }
  },

  /**
   * Eliminar foto de progreso
   * DELETE /api/treatment-sessions/:id/photos/:photoIndex
   */
  async deletePhoto(req, res) {
    try {
      const { id, photoIndex } = req.params;

      const session = await TreatmentSession.findByPk(id);

      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const currentPhotos = session.photosUrls || [];
      const index = parseInt(photoIndex);

      if (index < 0 || index >= currentPhotos.length) {
        return res.status(400).json({ error: 'Índice de foto inválido' });
      }

      currentPhotos.splice(index, 1);

      await session.update({
        photosUrls: currentPhotos
      });

      return res.json({
        message: 'Foto eliminada exitosamente',
        totalPhotos: currentPhotos.length
      });

    } catch (error) {
      console.error('❌ Error al eliminar foto:', error);
      return res.status(500).json({ 
        error: 'Error al eliminar foto',
        details: error.message 
      });
    }
  },

  /**
   * Registrar pago de una sesión
   * POST /api/treatment-sessions/:id/payment
   */
  async addPayment(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      const session = await TreatmentSession.findByPk(id, {
        include: [{ model: TreatmentPlan, as: 'treatmentPlan' }]
      });

      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (session.paid) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Esta sesión ya está pagada' });
      }

      const sessionPrice = parseFloat(session.price);

      // Marcar sesión como pagada
      await session.update({
        paid: true,
        paymentDate: new Date()
      }, { transaction });

      // Actualizar monto pagado en el plan
      const treatmentPlan = session.treatmentPlan;
      const newPaidAmount = parseFloat(treatmentPlan.paidAmount) + sessionPrice;

      await treatmentPlan.update({
        paidAmount: newPaidAmount
      }, { transaction });

      await transaction.commit();

      const paymentProgress = treatmentPlan.getPaymentProgress();

      return res.json({
        message: 'Pago de sesión registrado exitosamente',
        session: {
          id: session.id,
          sessionNumber: session.sessionNumber,
          paid: true,
          paymentDate: session.paymentDate,
          price: sessionPrice
        },
        treatmentPlan: {
          paidAmount: newPaidAmount,
          totalPrice: treatmentPlan.totalPrice,
          paymentProgress
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al registrar pago de sesión:', error);
      return res.status(500).json({ 
        error: 'Error al registrar pago de sesión',
        details: error.message 
      });
    }
  },

  /**
   * Marcar sesión como no asistida
   * POST /api/treatment-sessions/:id/no-show
   */
  async markNoShow(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const session = await TreatmentSession.findByPk(id);

      if (!session) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (session.status !== 'SCHEDULED') {
        return res.status(400).json({ 
          error: 'Solo sesiones agendadas pueden marcarse como no asistidas' 
        });
      }

      await session.update({
        status: 'NO_SHOW',
        notes: notes ? `${session.notes || ''}\n\nNo show: ${notes}` : session.notes
      });

      return res.json({
        message: 'Sesión marcada como no asistida',
        session
      });

    } catch (error) {
      console.error('❌ Error al marcar no show:', error);
      return res.status(500).json({ 
        error: 'Error al marcar no show',
        details: error.message 
      });
    }
  },

  /**
   * Reagendar una sesión (cambiar el turno asociado)
   * PATCH /api/treatment-sessions/:id/reschedule
   */
  async reschedule(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { newAppointmentId } = req.body;

      if (!newAppointmentId) {
        await transaction.rollback();
        return res.status(400).json({ error: 'newAppointmentId es requerido' });
      }

      const session = await TreatmentSession.findByPk(id);

      if (!session) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      if (session.status === 'COMPLETED') {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'No se puede reagendar una sesión completada' 
        });
      }

      // Verificar que el nuevo turno existe
      const newAppointment = await Appointment.findByPk(newAppointmentId);
      if (!newAppointment) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Nuevo turno no encontrado' });
      }

      // Verificar que el nuevo turno no esté vinculado
      const existingSession = await TreatmentSession.findOne({
        where: { 
          appointmentId: newAppointmentId,
          id: { [Op.ne]: id }
        }
      });

      if (existingSession) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'El nuevo turno ya está vinculado a otra sesión' 
        });
      }

      await session.update({
        appointmentId: newAppointmentId,
        scheduledDate: newAppointment.startTime,
        status: 'SCHEDULED'
      }, { transaction });

      await transaction.commit();

      const updatedSession = await TreatmentSession.findByPk(id, {
        include: [
          { model: Appointment, as: 'appointment' },
          { model: TreatmentPlan, as: 'treatmentPlan' }
        ]
      });

      return res.json({
        message: 'Sesión reagendada exitosamente',
        session: updatedSession
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al reagendar sesión:', error);
      return res.status(500).json({ 
        error: 'Error al reagendar sesión',
        details: error.message 
      });
    }
  }
};

module.exports = TreatmentSessionController;
