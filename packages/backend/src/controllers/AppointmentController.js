const { 
  Appointment, 
  Service, 
  Client, 
  SpecialistProfile, 
  User,
  Business
} = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para gestión de citas
 * Permite a especialistas y recepcionistas gestionar citas con diferentes niveles de acceso
 */
class AppointmentController {

  /**
   * Obtener lista de citas
   * GET /api/appointments?businessId={bizId}
   * - SPECIALIST: Solo sus propias citas
   * - RECEPTIONIST: Todas las citas del negocio
   */
  static async getAppointments(req, res) {
    try {
      const { businessId } = req.query;
      
      const {
        page = 1,
        limit = 10,
        status,
        specialistId,
        date,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { businessId };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        // SPECIALIST: Solo sus propias citas
        where.specialistId = req.specialist.id;
      } else if (req.receptionist) {
        // RECEPTIONIST: Puede especificar especialista o ver todas
        if (specialistId) {
          where.specialistId = specialistId;
        }
      }

      // Filtros adicionales
      if (status) {
        where.status = status;
      }

      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        };
      } else if (startDate && endDate) {
        where.startTime = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
      }

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          }
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo citas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener detalle de una cita específica
   * GET /api/appointments/:appointmentId?businessId={bizId}
   */
  static async getAppointmentDetail(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({
        where,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'description', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'dateOfBirth']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'phone'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization', 'experience']
            }]
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        data: appointment
      });

    } catch (error) {
      console.error('Error obteniendo detalle de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva cita
   * POST /api/appointments
   * Solo para RECEPTIONIST (los especialistas no crean citas)
   */
  static async createAppointment(req, res) {
    try {
      // Solo recepcionistas pueden crear citas
      if (!req.receptionist) {
        return res.status(403).json({
          success: false,
          error: 'Solo recepcionistas pueden crear citas'
        });
      }

      const { businessId } = req.body;
      const {
        clientId,
        specialistId,
        serviceId,
        startTime,
        endTime,
        notes,
        clientNotes
      } = req.body;

      // Validar que el especialista pertenezca al negocio
      const specialist = await User.findOne({
        where: {
          id: specialistId,
          businessId,
          role: 'SPECIALIST',
          status: 'ACTIVE'
        }
      });

      if (!specialist) {
        return res.status(400).json({
          success: false,
          error: 'Especialista no válido para este negocio'
        });
      }

      // Validar que el servicio pertenezca al negocio
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId,
          isActive: true
        }
      });

      if (!service) {
        return res.status(400).json({
          success: false,
          error: 'Servicio no válido para este negocio'
        });
      }

      // Validar que el cliente exista
      const client = await Client.findOne({
        where: { id: clientId }
      });

      if (!client) {
        return res.status(400).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      // Verificar disponibilidad del especialista
      const conflictingAppointment = await Appointment.findOne({
        where: {
          specialistId,
          businessId,
          status: {
            [Op.notIn]: ['CANCELED', 'COMPLETED']
          },
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [new Date(startTime), new Date(endTime)]
              }
            },
            {
              endTime: {
                [Op.between]: [new Date(startTime), new Date(endTime)]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: new Date(startTime) } },
                { endTime: { [Op.gte]: new Date(endTime) } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          error: 'El especialista no está disponible en ese horario'
        });
      }

      // Generar número de cita único
      const appointmentNumber = `CITA-${Date.now()}`;

      // Crear la cita
      const appointment = await Appointment.create({
        businessId,
        clientId,
        specialistId,
        serviceId,
        appointmentNumber,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalAmount: service.price,
        status: 'PENDING',
        notes,
        clientNotes
      });

      // Obtener la cita creada con relaciones
      const createdAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: createdAppointment
      });

    } catch (error) {
      console.error('Error creando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado de cita
   * PATCH /api/appointments/:appointmentId/status
   */
  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const { status, notes, cancelReason } = req.body;

      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
        
        // Validar estados permitidos para especialista
        const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: 'Estado no válido para especialista'
          });
        }
      }

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Preparar datos de actualización
      const updateData = { status };
      
      if (notes) {
        if (req.specialist) {
          updateData.specialistNotes = notes;
        } else if (req.receptionist) {
          updateData.notes = notes;
        }
      }

      if (cancelReason && status === 'CANCELED') {
        updateData.cancelReason = cancelReason;
        updateData.canceledAt = new Date();
        updateData.canceledBy = req.user.id;
      }

      // Agregar timestamps según el estado
      switch (status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'IN_PROGRESS':
          updateData.startedAt = new Date();
          break;
        case 'COMPLETED':
          updateData.completedAt = new Date();
          break;
      }

      await appointment.update(updateData);

      res.json({
        success: true,
        message: 'Estado de la cita actualizado exitosamente',
        data: appointment
      });

    } catch (error) {
      console.error('Error actualizando estado de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancelar cita
   * DELETE /api/appointments/:appointmentId
   */
  static async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const { cancelReason } = req.body;

      const where = {
        id: appointmentId,
        businessId
      };

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

      // Verificar si la cita se puede cancelar
      if (['COMPLETED', 'CANCELED'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          error: 'No se puede cancelar una cita que ya está completada o cancelada'
        });
      }

      // Actualizar estado a cancelado
      await appointment.update({
        status: 'CANCELED',
        cancelReason: cancelReason || 'Cancelada por usuario',
        canceledAt: new Date(),
        canceledBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: appointment
      });

    } catch (error) {
      console.error('Error cancelando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = AppointmentController;