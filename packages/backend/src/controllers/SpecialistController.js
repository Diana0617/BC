const { 
  Appointment, 
  Service, 
  Client, 
  SpecialistProfile, 
  User,
  Product,
  InventoryMovement
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Controlador para especialistas - Gestiona agenda personal, historial y reportes
 * Implementa las reglas de seguridad: especialista solo ve su propia información
 */
class SpecialistController {

  /**
   * Obtener agenda personal del especialista
   * GET /api/specialists/me/appointments?businessId={bizId}
   */
  static async getMyAppointments(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      // Parámetros de filtrado
      const {
        page = 1,
        limit = 10,
        status,
        date,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {
        businessId,
        specialistId,
      };

      // Filtros opcionales
      if (status) {
        where.status = status;
      }

      if (date) {
        // Filtrar por día específico
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        };
      } else if (startDate && endDate) {
        // Filtrar por rango de fechas
        where.startTime = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
      } else if (startDate) {
        where.startTime = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        where.startTime = {
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
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        attributes: [
          'id', 'appointmentNumber', 'startTime', 'endTime', 'status', 
          'paymentStatus', 'totalAmount', 'paidAmount', 'discountAmount',
          'notes', 'clientNotes', 'specialistNotes', 'hasConsent',
          'evidence', 'rating', 'feedback', 'isOnline', 'meetingLink',
          'depositStatus', 'advancePayment', 'wompiPaymentReference', // Campos de pago adelantado
          'createdAt', 'updatedAt'
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      // Agregar información adicional sobre pagos adelantados
      const appointmentsWithPaymentInfo = appointments.map(appointment => {
        const appointmentData = appointment.toJSON();
        
        // Información de pago adelantado
        appointmentData.advancePaymentInfo = {
          required: appointmentData.depositStatus !== 'NOT_REQUIRED',
          status: appointmentData.depositStatus,
          isPaid: appointmentData.depositStatus === 'PAID',
          canProceed: appointmentData.depositStatus === 'PAID' || appointmentData.depositStatus === 'NOT_REQUIRED',
          paymentData: appointmentData.advancePayment
        };

        return appointmentData;
      });

      res.json({
        success: true,
        data: {
          appointments: appointmentsWithPaymentInfo,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo agenda del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado de una cita
   * PATCH /api/specialists/me/appointments/:appointmentId/status
   */
  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      const { status, notes } = req.body;

      // Validar estados permitidos para especialista
      const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado no válido para especialista'
        });
      }

      // Buscar la cita
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Preparar datos de actualización
      const updateData = { status };
      if (notes) {
        updateData.specialistNotes = notes;
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

      // Actualizar la cita
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
   * Obtener historial de procedimientos realizados
   * GET /api/specialists/me/history?businessId={bizId}
   */
  static async getMyHistory(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        serviceId
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {
        businessId,
        specialistId,
        status: 'COMPLETED'
      };

      // Filtros opcionales
      if (startDate && endDate) {
        where.completedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      if (serviceId) {
        where.serviceId = serviceId;
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
            attributes: ['id', 'firstName', 'lastName', 'phone']
          }
        ],
        order: [['completedAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      // Calcular estadísticas del período
      const stats = await Appointment.findOne({
        where: {
          ...where,
          completedAt: where.completedAt || { [Op.ne]: null }
        },
        attributes: [
          [fn('COUNT', col('id')), 'totalAppointments'],
          [fn('SUM', col('totalAmount')), 'totalRevenue'],
          [fn('AVG', col('rating')), 'averageRating']
        ],
        raw: true
      });

      res.json({
        success: true,
        data: {
          appointments,
          stats: {
            totalAppointments: parseInt(stats.totalAppointments) || 0,
            totalRevenue: parseFloat(stats.totalRevenue) || 0,
            averageRating: parseFloat(stats.averageRating) || 0
          },
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reportes de comisiones del especialista
   * GET /api/specialists/me/commissions?businessId={bizId}
   */
  static async getMyCommissions(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      const {
        startDate,
        endDate,
        month,
        year = new Date().getFullYear()
      } = req.query;

      // Obtener perfil del especialista para comisión
      const profile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId }
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Perfil de especialista no encontrado'
        });
      }

      let dateFilter = {};

      if (month && year) {
        // Filtrar por mes específico
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        dateFilter.completedAt = {
          [Op.between]: [startOfMonth, endOfMonth]
        };
      } else if (startDate && endDate) {
        // Filtrar por rango personalizado
        dateFilter.completedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else {
        // Por defecto, mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateFilter.completedAt = {
          [Op.between]: [startOfMonth, endOfMonth]
        };
      }

      // Obtener citas completadas para calcular comisiones
      const appointments = await Appointment.findAll({
        where: {
          businessId,
          specialistId,
          status: 'COMPLETED',
          ...dateFilter
        },
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'price']
          }
        ],
        order: [['completedAt', 'DESC']]
      });

      // Calcular comisiones
      const commissionData = appointments.map(appointment => {
        let commissionAmount = 0;
        
        if (profile.commissionType === 'PERCENTAGE') {
          commissionAmount = (appointment.totalAmount * profile.commissionRate) / 100;
        } else if (profile.commissionType === 'FIXED_AMOUNT') {
          commissionAmount = profile.fixedCommissionAmount;
        }

        return {
          appointmentId: appointment.id,
          clientName: `${appointment.Client?.firstName} ${appointment.Client?.lastName}`,
          serviceName: appointment.Service?.name,
          serviceAmount: appointment.totalAmount,
          commissionRate: profile.commissionRate,
          commissionType: profile.commissionType,
          commissionAmount,
          completedAt: appointment.completedAt
        };
      });

      // Resumen de comisiones
      const totalCommissions = commissionData.reduce((sum, item) => sum + item.commissionAmount, 0);
      const totalServices = appointments.length;
      const totalRevenue = appointments.reduce((sum, appointment) => sum + parseFloat(appointment.totalAmount), 0);

      res.json({
        success: true,
        data: {
          specialist: {
            id: specialistId,
            commissionRate: profile.commissionRate,
            commissionType: profile.commissionType
          },
          summary: {
            totalServices,
            totalRevenue,
            totalCommissions,
            averageCommissionPerService: totalServices > 0 ? totalCommissions / totalServices : 0
          },
          commissions: commissionData
        }
      });

    } catch (error) {
      console.error('Error obteniendo comisiones del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener perfil personal del especialista
   * GET /api/specialists/me/profile?businessId={bizId}
   */
  static async getMyProfile(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;

      const profile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
          }
        ]
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Perfil de especialista no encontrado'
        });
      }

      res.json({
        success: true,
        data: profile
      });

    } catch (error) {
      console.error('Error obteniendo perfil del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar perfil personal del especialista (campos limitados)
   * PUT /api/specialists/me/profile
   */
  static async updateMyProfile(req, res) {
    try {
      const { businessId } = req.body;
      const specialistId = req.specialist.id;

      // Campos que el especialista puede actualizar
      const allowedFields = [
        'biography',
        'skills',
        'languages',
        'phoneExtension',
        'emergencyContact',
        'socialMedia',
        'preferences'
      ];

      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No hay datos válidos para actualizar'
        });
      }

      const [updatedRows] = await SpecialistProfile.update(updateData, {
        where: { userId: specialistId, businessId }
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Perfil de especialista no encontrado'
        });
      }

      // Obtener perfil actualizado
      const updatedProfile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Error actualizando perfil del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = SpecialistController;