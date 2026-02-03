/**
 * 📅 CALENDAR CONTROLLER
 * 
 * Controlador para gestión de calendarios y vistas agregadas de citas
 * Maneja diferentes vistas según el rol del usuario
 */

const { 
  Appointment, 
  Branch, 
  Service, 
  Client, 
  User,
  SpecialistProfile,
  SpecialistBranchSchedule
} = require('../models');
const { Op } = require('sequelize');
const AvailabilityService = require('../services/AvailabilityService');

class CalendarController {
  /**
   * Vista completa del negocio (Owner/Business Admin)
   * GET /api/calendar/business/:businessId?startDate=...&endDate=...&branchId=...
   */
  static async getBusinessCalendar(req, res) {
    try {
      const { businessId } = req.params;
      const { startDate, endDate, branchId, specialistId, status } = req.query;

      // Validar fechas
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren startDate y endDate'
        });
      }

      // Construir filtros
      const where = {
        businessId,
        startTime: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        }
      };

      // Filtros opcionales
      if (branchId) {
        where.branchId = branchId;
      }

      if (specialistId) {
        where.specialistId = specialistId;
      }

      if (status) {
        where.status = status;
      }

      // Obtener citas
      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address']
          },
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
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          }
        ],
        order: [['startTime', 'ASC']]
      });

      // Formatear eventos para calendario
      const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.Client.firstName} ${apt.Client.lastName} - ${apt.Service.name}`,
        start: apt.startTime,
        end: apt.endTime,
        status: apt.status,
        backgroundColor: this.getStatusColor(apt.status),
        extendedProps: {
          appointmentId: apt.id,
          branchName: apt.branch?.name,
          branchId: apt.branch?.id,
          clientName: `${apt.Client.firstName} ${apt.Client.lastName}`,
          clientPhone: apt.Client.phone,
          specialistName: `${apt.specialist.firstName} ${apt.specialist.lastName}`,
          specialistId: apt.specialist.id,
          serviceName: apt.Service.name,
          servicePrice: apt.Service.price,
          totalAmount: apt.totalAmount,
          hasConsent: apt.hasConsent,
          notes: apt.notes
        }
      }));

      // Estadísticas
      const stats = {
        total: appointments.length,
        byStatus: {},
        byBranch: {},
        totalRevenue: 0
      };

      appointments.forEach(apt => {
        // Por estado
        stats.byStatus[apt.status] = (stats.byStatus[apt.status] || 0) + 1;
        
        // Por sucursal
        const branchName = apt.branch?.name || 'Sin sucursal';
        stats.byBranch[branchName] = (stats.byBranch[branchName] || 0) + 1;
        
        // Ingresos (solo confirmadas y completadas)
        if (['CONFIRMED', 'COMPLETED'].includes(apt.status)) {
          stats.totalRevenue += parseFloat(apt.totalAmount || 0);
        }
      });

      res.json({
        success: true,
        data: {
          events,
          stats,
          dateRange: {
            startDate,
            endDate
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo calendario del negocio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Vista de sucursal específica (Receptionist)
   * GET /api/calendar/branch/:branchId?startDate=...&endDate=...
   */
  static async getBranchCalendar(req, res) {
    try {
      const { branchId } = req.params;
      const { startDate, endDate, specialistId, status } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren startDate y endDate'
        });
      }

      // Verificar que la sucursal existe
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      // Construir filtros
      const where = {
        branchId,
        businessId: branch.businessId,
        startTime: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        }
      };

      if (specialistId) {
        where.specialistId = specialistId;
      }

      if (status) {
        where.status = status;
      }

      // Obtener citas
      const appointments = await Appointment.findAll({
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
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          }
        ],
        order: [['startTime', 'ASC']]
      });

      // Formatear eventos
      const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.Client.firstName} ${apt.Client.lastName} - ${apt.Service.name}`,
        start: apt.startTime,
        end: apt.endTime,
        status: apt.status,
        backgroundColor: this.getStatusColor(apt.status),
        extendedProps: {
          appointmentId: apt.id,
          clientName: `${apt.Client.firstName} ${apt.Client.lastName}`,
          clientPhone: apt.Client.phone,
          specialistName: `${apt.specialist.firstName} ${apt.specialist.lastName}`,
          specialistId: apt.specialist.id,
          serviceName: apt.Service.name,
          servicePrice: apt.Service.price,
          totalAmount: apt.totalAmount,
          hasConsent: apt.hasConsent,
          notes: apt.notes
        }
      }));

      res.json({
        success: true,
        data: {
          branch: {
            id: branch.id,
            name: branch.name,
            address: branch.address
          },
          events,
          total: appointments.length,
          dateRange: {
            startDate,
            endDate
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo calendario de sucursal:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Agenda combinada de especialista (todas sus sucursales)
   * GET /api/calendar/specialist/:specialistId?startDate=...&endDate=...
   */
  static async getSpecialistCombinedCalendar(req, res) {
    try {
      const { specialistId } = req.params;
      const { startDate, endDate, branchId, status } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren startDate y endDate'
        });
      }

      // Construir filtros
      const where = {
        startTime: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        }
      };

      // Obtener el usuario para verificar su rol
      const user = await User.findByPk(specialistId);
      
      // Solo filtrar por specialistId si es SPECIALIST puro
      // RECEPTIONIST y RECEPTIONIST_SPECIALIST ven TODAS las citas del negocio
      if (user && user.role === 'SPECIALIST') {
        where.specialistId = specialistId;
      } else if (user && ['RECEPTIONIST_SPECIALIST', 'RECEPTIONIST'].includes(user.role)) {
        // Para estos roles, necesitamos filtrar por businessId en lugar de specialistId
        where.businessId = user.businessId;
      } else if (!user) {
        // Si no encontramos el usuario, filtrar por specialistId por defecto
        where.specialistId = specialistId;
      }

      // Filtro opcional por sucursal
      if (branchId) {
        where.branchId = branchId;
      }

      if (status) {
        where.status = status;
      }

      // Obtener citas del especialista en todas sus sucursales
      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address', 'city']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['startTime', 'ASC']]
      });

      // Formatear eventos
      const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.client.firstName} ${apt.client.lastName} - ${apt.service.name}`,
        start: apt.startTime,
        end: apt.endTime,
        status: apt.status,
        backgroundColor: CalendarController.getStatusColor(apt.status),
        extendedProps: {
          appointmentId: apt.id,
          branchName: apt.branch?.name,
          branchId: apt.branch?.id,
          branchAddress: apt.branch?.address,
          clientName: `${apt.client.firstName} ${apt.client.lastName}`,
          clientPhone: apt.client.phone,
          serviceName: apt.service.name,
          servicePrice: apt.service.price,
          totalAmount: apt.totalAmount,
          hasConsent: apt.hasConsent,
          notes: apt.notes
        }
      }));

      // Agrupar por sucursal para estadísticas
      const byBranch = {};
      appointments.forEach(apt => {
        const branchId = apt.branch?.id;
        if (!byBranch[branchId]) {
          byBranch[branchId] = {
            branchName: apt.branch?.name,
            count: 0
          };
        }
        byBranch[branchId].count++;
      });

      res.json({
        success: true,
        data: {
          events,
          appointments, // Agregar appointments raw para uso en dashboards
          total: appointments.length,
          byBranch: Object.values(byBranch),
          dateRange: {
            startDate,
            endDate
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo calendario de especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener slots disponibles (para reserva online o creación de citas)
   * GET /api/calendar/available-slots?businessId=...&branchId=...&specialistId=...&serviceId=...&date=...
   */
  static async getAvailableSlots(req, res) {
    try {
      const { businessId, branchId, specialistId, serviceId, date } = req.query;

      // Validar parámetros requeridos
      if (!businessId || !branchId || !specialistId || !serviceId || !date) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren businessId, branchId, specialistId, serviceId y date'
        });
      }

      // Usar el AvailabilityService
      const availability = await AvailabilityService.generateAvailableSlots({
        businessId,
        branchId,
        specialistId,
        serviceId,
        date
      });

      res.json({
        success: true,
        data: availability
      });

    } catch (error) {
      console.error('Error obteniendo slots disponibles:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener disponibilidad de rango de fechas
   * GET /api/calendar/availability-range?businessId=...&branchId=...&specialistId=...&serviceId=...&startDate=...&endDate=...
   */
  static async getAvailabilityRange(req, res) {
    try {
      const { businessId, branchId, specialistId, serviceId, startDate, endDate } = req.query;

      if (!businessId || !branchId || !specialistId || !serviceId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros requeridos'
        });
      }

      const availability = await AvailabilityService.getAvailabilityRange({
        businessId,
        branchId,
        specialistId,
        serviceId,
        startDate,
        endDate
      });

      res.json({
        success: true,
        data: availability
      });

    } catch (error) {
      console.error('Error obteniendo rango de disponibilidad:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener especialistas disponibles para un horario específico
   * GET /api/calendar/branch/:branchId/specialists?serviceId=...&date=...&time=...
   */
  static async getBranchSpecialists(req, res) {
    try {
      const { branchId } = req.params;
      const { serviceId, date, time } = req.query;

      // Verificar sucursal
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      // Si se proporciona fecha y hora, obtener especialistas disponibles
      if (serviceId && date && time) {
        const specialists = await AvailabilityService.getAvailableSpecialists({
          businessId: branch.businessId,
          branchId,
          serviceId,
          date,
          time
        });

        return res.json({
          success: true,
          data: {
            specialists,
            total: specialists.length
          }
        });
      }

      // Si no, obtener todos los especialistas de la sucursal
      const schedules = await SpecialistBranchSchedule.findAll({
        where: {
          branchId,
          isActive: true
        },
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization', 'bio']
            }]
          }
        ],
        group: ['specialistId'] // Agrupar por especialista
      });

      // Formatear respuesta
      const specialists = schedules.map(schedule => ({
        id: schedule.specialist.id,
        firstName: schedule.specialist.firstName,
        lastName: schedule.specialist.lastName,
        email: schedule.specialist.email,
        specialization: schedule.specialist.SpecialistProfile?.specialization,
        bio: schedule.specialist.SpecialistProfile?.bio
      }));

      res.json({
        success: true,
        data: {
          specialists,
          total: specialists.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo especialistas de sucursal:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Obtener color según estado de cita
   */
  static getStatusColor(status) {
    const colors = {
      PENDING: '#FFA500',      // Naranja
      CONFIRMED: '#4CAF50',    // Verde
      IN_PROGRESS: '#2196F3',  // Azul
      COMPLETED: '#9E9E9E',    // Gris
      CANCELED: '#F44336',     // Rojo
      NO_SHOW: '#FF6347',      // Rojo tomate
      RESCHEDULED: '#FFD700'   // Dorado
    };
    return colors[status] || '#000000';
  }
}

module.exports = CalendarController;
