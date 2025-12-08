/**
 * ⏰ TIME SLOT CONTROLLER
 * 
 * Controlador para gestión de slots de tiempo, disponibilidad y bloqueos
 */

const TimeSlotService = require('../services/TimeSlotService');
const { validationResult } = require('express-validator');

class TimeSlotController {
  /**
   * Consultar disponibilidad de slots
   */
  static async getAvailability(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistId,
        startDate,
        endDate,
        duration = 30,
        status
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin requeridas'
        });
      }

      const availability = await TimeSlotService.getAvailability({
        businessId,
        specialistId,
        startDate,
        endDate,
        duration: parseInt(duration),
        status
      });

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Encontrar próximo slot disponible
   */
  static async getNextAvailable(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistId,
        duration = 30,
        fromDate,
        maxDays = 30
      } = req.query;

      const nextSlot = await TimeSlotService.getNextAvailable({
        businessId,
        specialistId,
        duration: parseInt(duration),
        fromDate: fromDate ? new Date(fromDate) : new Date(),
        maxDays: parseInt(maxDays)
      });

      if (!nextSlot) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron slots disponibles en el rango especificado'
        });
      }

      res.json({
        success: true,
        data: nextSlot
      });
    } catch (error) {
      console.error('Error al buscar próximo slot:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener disponibilidad de todo el negocio para una fecha
   */
  static async getBusinessAvailability(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        date,
        duration = 30
      } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Fecha requerida'
        });
      }

      const availability = await TimeSlotService.getBusinessAvailability({
        businessId,
        date,
        duration: parseInt(duration)
      });

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error al obtener disponibilidad del negocio:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener detalle de un slot específico
   */
  static async getSlotDetail(req, res) {
    try {
      const { slotId } = req.params;
      const { businessId } = req.user;

      const slot = await TimeSlotService.getSlotDetail(slotId, businessId);

      res.json({
        success: true,
        data: slot
      });
    } catch (error) {
      console.error('Error al obtener detalle del slot:', error);
      if (error.message === 'Slot no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bloquear un slot específico
   */
  static async blockSlot(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { slotId } = req.params;
      const { businessId } = req.user;
      const { reason, notes } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Razón del bloqueo requerida'
        });
      }

      const slot = await TimeSlotService.blockSlot({
        slotId,
        businessId,
        reason,
        notes,
        blockedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Slot bloqueado exitosamente',
        data: slot
      });
    } catch (error) {
      console.error('Error al bloquear slot:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Desbloquear un slot específico
   */
  static async unblockSlot(req, res) {
    try {
      const { slotId } = req.params;
      const { businessId } = req.user;
      const { notes } = req.body;

      const slot = await TimeSlotService.unblockSlot({
        slotId,
        businessId,
        notes,
        unblockedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Slot desbloqueado exitosamente',
        data: slot
      });
    } catch (error) {
      console.error('Error al desbloquear slot:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bloquear múltiples slots
   */
  static async bulkBlockSlots(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { businessId } = req.user;
      const { slotIds, reason, notes } = req.body;

      if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de slots requerida'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Razón del bloqueo requerida'
        });
      }

      const result = await TimeSlotService.bulkBlockSlots({
        businessId,
        slotIds,
        reason,
        notes,
        blockedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Slots bloqueados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al bloquear slots masivamente:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bloquear rango de tiempo
   */
  static async blockTimeRange(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { businessId } = req.user;
      const { 
        specialistId,
        startDateTime,
        endDateTime,
        reason,
        notes
      } = req.body;

      if (!specialistId || !startDateTime || !endDateTime || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Especialista, rango de tiempo y razón requeridos'
        });
      }

      const result = await TimeSlotService.blockTimeRange({
        businessId,
        specialistId,
        startDateTime,
        endDateTime,
        reason,
        notes,
        blockedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Rango de tiempo bloqueado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al bloquear rango de tiempo:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de utilización
   */
  static async getUtilizationStats(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistId,
        startDate,
        endDate,
        groupBy = 'day'
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin requeridas'
        });
      }

      const validGroupBy = ['day', 'week', 'month'];
      if (!validGroupBy.includes(groupBy)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de agrupación debe ser: day, week o month'
        });
      }

      const stats = await TimeSlotService.getUtilizationStats({
        businessId,
        specialistId,
        startDate,
        endDate,
        groupBy
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener reporte de utilización detallado
   */
  static async getUtilizationReport(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistId,
        startDate,
        endDate
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin requeridas'
        });
      }

      const report = await TimeSlotService.getUtilizationReport({
        businessId,
        specialistId,
        startDate,
        endDate
      });

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error al generar reporte:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar slots disponibles con filtros avanzados
   */
  static async searchAvailableSlots(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistIds,
        startDate,
        endDate,
        minDuration = 30,
        maxDuration,
        timeRanges,
        excludeDates,
        onlyMorning,
        onlyAfternoon,
        onlyEvening
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Fechas de inicio y fin requeridas'
        });
      }

      // Construir filtros avanzados
      const filters = {
        businessId,
        startDate,
        endDate,
        minDuration: parseInt(minDuration)
      };

      if (specialistIds) {
        filters.specialistIds = specialistIds.split(',').map(id => parseInt(id));
      }

      if (maxDuration) {
        filters.maxDuration = parseInt(maxDuration);
      }

      if (timeRanges) {
        filters.timeRanges = JSON.parse(timeRanges);
      }

      if (excludeDates) {
        filters.excludeDates = excludeDates.split(',');
      }

      if (onlyMorning === 'true') {
        filters.timeRange = 'morning';
      } else if (onlyAfternoon === 'true') {
        filters.timeRange = 'afternoon';
      } else if (onlyEvening === 'true') {
        filters.timeRange = 'evening';
      }

      // Implementar búsqueda avanzada
      const availability = await TimeSlotService.getAvailability(filters);

      // Aplicar filtros adicionales
      let filteredAvailability = availability;

      // Filtrar por horarios específicos si se especifican
      if (filters.timeRange) {
        filteredAvailability = this.filterByTimeRange(filteredAvailability, filters.timeRange);
      }

      res.json({
        success: true,
        data: {
          filters: filters,
          availability: filteredAvailability,
          totalDays: filteredAvailability.length,
          totalSlots: this.countTotalSlots(filteredAvailability)
        }
      });
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===========================================
  // MÉTODOS UTILITARIOS
  // ===========================================

  /**
   * Filtrar disponibilidad por rango de tiempo
   */
  static filterByTimeRange(availability, timeRange) {
    const timeRanges = {
      morning: { start: '06:00', end: '12:00' },
      afternoon: { start: '12:00', end: '18:00' },
      evening: { start: '18:00', end: '23:59' }
    };

    const range = timeRanges[timeRange];
    if (!range) return availability;

    return availability.map(day => ({
      ...day,
      specialists: day.specialists.map(specialist => ({
        ...specialist,
        availableSlots: specialist.availableSlots.filter(slot => {
          const slotTime = slot.startTime;
          return slotTime >= range.start && slotTime <= range.end;
        })
      }))
    }));
  }

  /**
   * Contar total de slots disponibles
   */
  static countTotalSlots(availability) {
    return availability.reduce((total, day) => {
      return total + day.specialists.reduce((dayTotal, specialist) => {
        return dayTotal + specialist.availableSlots.length;
      }, 0);
    }, 0);
  }
}

module.exports = TimeSlotController;
