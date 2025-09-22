/**
 * ⏰ TIME SLOT SERVICE
 * 
 * Servicio para gestión completa de slots de tiempo, disponibilidad,
 * bloqueos y estadísticas de utilización.
 */

const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const TimeSlot = require('../models/TimeSlot');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

class TimeSlotService {
  /**
   * Consultar disponibilidad de slots
   */
  static async getAvailability({
    businessId,
    specialistId = null,
    startDate,
    endDate,
    duration = 30,
    status = null
  }) {
    try {
      const whereConditions = {
        businessId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (specialistId) {
        whereConditions.specialistId = specialistId;
      }

      if (status) {
        whereConditions.status = status;
      }

      // Filtrar por duración mínima si se especifica
      if (duration > 30) {
        whereConditions.duration = {
          [Op.gte]: duration
        };
      }

      const slots = await TimeSlot.findAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Appointment,
            as: 'appointment',
            required: false,
            attributes: ['id', 'status', 'totalAmount']
          }
        ],
        order: [['date', 'ASC'], ['startTime', 'ASC']]
      });

      // Agrupar slots por fecha y especialista
      return this.groupSlotsByDateAndSpecialist(slots);
    } catch (error) {
      throw new Error(`Error al consultar disponibilidad: ${error.message}`);
    }
  }

  /**
   * Encontrar el próximo slot disponible
   */
  static async getNextAvailable({
    businessId,
    specialistId = null,
    duration = 30,
    fromDate = new Date(),
    maxDays = 30
  }) {
    try {
      const endDate = new Date(fromDate);
      endDate.setDate(endDate.getDate() + maxDays);

      const whereConditions = {
        businessId,
        status: 'AVAILABLE',
        duration: {
          [Op.gte]: duration
        },
        startDateTime: {
          [Op.gte]: fromDate
        },
        date: {
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      };

      if (specialistId) {
        whereConditions.specialistId = specialistId;
      }

      const nextSlot = await TimeSlot.findOne({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['startDateTime', 'ASC']]
      });

      return nextSlot;
    } catch (error) {
      throw new Error(`Error al buscar próximo slot: ${error.message}`);
    }
  }

  /**
   * Obtener disponibilidad de todo el negocio para una fecha
   */
  static async getBusinessAvailability({
    businessId,
    date,
    duration = 30
  }) {
    try {
      const slots = await TimeSlot.findAll({
        where: {
          businessId,
          date,
          status: 'AVAILABLE',
          duration: {
            [Op.gte]: duration
          }
        },
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['specialistId', 'ASC'], ['startTime', 'ASC']]
      });

      // Agrupar por especialista
      const availability = {};
      slots.forEach(slot => {
        const specialistId = slot.specialistId;
        if (!availability[specialistId]) {
          availability[specialistId] = {
            specialist: slot.specialist,
            availableSlots: []
          };
        }
        availability[specialistId].availableSlots.push(slot);
      });

      return {
        date,
        specialists: Object.values(availability)
      };
    } catch (error) {
      throw new Error(`Error al obtener disponibilidad del negocio: ${error.message}`);
    }
  }

  /**
   * Obtener detalle de un slot específico
   */
  static async getSlotDetail(slotId, businessId) {
    try {
      const slot = await TimeSlot.findOne({
        where: { id: slotId, businessId },
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Schedule,
            as: 'schedule',
            attributes: ['id', 'name', 'type']
          },
          {
            model: Appointment,
            as: 'appointment',
            required: false,
            attributes: ['id', 'status', 'totalAmount', 'clientId']
          }
        ]
      });

      if (!slot) {
        throw new Error('Slot no encontrado');
      }

      return slot;
    } catch (error) {
      throw new Error(`Error al obtener detalle del slot: ${error.message}`);
    }
  }

  /**
   * Bloquear un slot específico
   */
  static async blockSlot({
    slotId,
    businessId,
    reason,
    notes = null,
    blockedBy
  }) {
    const transaction = await sequelize.transaction();

    try {
      const slot = await TimeSlot.findOne({
        where: { id: slotId, businessId },
        transaction
      });

      if (!slot) {
        throw new Error('Slot no encontrado');
      }

      if (slot.status !== 'AVAILABLE') {
        throw new Error(`No se puede bloquear un slot con estado: ${slot.status}`);
      }

      await slot.update({
        status: 'BLOCKED',
        blockReason: reason,
        notes: notes,
        lastModifiedBy: blockedBy
      }, { transaction });

      await transaction.commit();
      return slot;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Desbloquear un slot específico
   */
  static async unblockSlot({
    slotId,
    businessId,
    notes = null,
    unblockedBy
  }) {
    const transaction = await sequelize.transaction();

    try {
      const slot = await TimeSlot.findOne({
        where: { id: slotId, businessId },
        transaction
      });

      if (!slot) {
        throw new Error('Slot no encontrado');
      }

      if (slot.status !== 'BLOCKED') {
        throw new Error(`No se puede desbloquear un slot con estado: ${slot.status}`);
      }

      await slot.update({
        status: 'AVAILABLE',
        blockReason: null,
        notes: notes,
        lastModifiedBy: unblockedBy
      }, { transaction });

      await transaction.commit();
      return slot;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Bloquear múltiples slots
   */
  static async bulkBlockSlots({
    businessId,
    slotIds,
    reason,
    notes = null,
    blockedBy
  }) {
    const transaction = await sequelize.transaction();

    try {
      const slots = await TimeSlot.findAll({
        where: {
          id: { [Op.in]: slotIds },
          businessId,
          status: 'AVAILABLE'
        },
        transaction
      });

      if (slots.length === 0) {
        throw new Error('No se encontraron slots disponibles para bloquear');
      }

      const updateResult = await TimeSlot.update({
        status: 'BLOCKED',
        blockReason: reason,
        notes: notes,
        lastModifiedBy: blockedBy
      }, {
        where: {
          id: { [Op.in]: slots.map(slot => slot.id) }
        },
        transaction
      });

      await transaction.commit();
      
      return {
        blockedCount: updateResult[0],
        slotsProcessed: slots.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Bloquear rango de tiempo
   */
  static async blockTimeRange({
    businessId,
    specialistId,
    startDateTime,
    endDateTime,
    reason,
    notes = null,
    blockedBy
  }) {
    const transaction = await sequelize.transaction();

    try {
      const slots = await TimeSlot.findAll({
        where: {
          businessId,
          specialistId,
          startDateTime: {
            [Op.gte]: startDateTime
          },
          endDateTime: {
            [Op.lte]: endDateTime
          },
          status: 'AVAILABLE'
        },
        transaction
      });

      if (slots.length === 0) {
        throw new Error('No se encontraron slots disponibles en el rango especificado');
      }

      const updateResult = await TimeSlot.update({
        status: 'BLOCKED',
        blockReason: reason,
        notes: notes,
        lastModifiedBy: blockedBy
      }, {
        where: {
          id: { [Op.in]: slots.map(slot => slot.id) }
        },
        transaction
      });

      await transaction.commit();
      
      return {
        blockedCount: updateResult[0],
        timeRange: {
          start: startDateTime,
          end: endDateTime
        }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener estadísticas de utilización
   */
  static async getUtilizationStats({
    businessId,
    specialistId = null,
    startDate,
    endDate,
    groupBy = 'day'
  }) {
    try {
      const whereConditions = {
        businessId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (specialistId) {
        whereConditions.specialistId = specialistId;
      }

      // Definir formato de agrupación según el parámetro
      let dateFormat;
      switch (groupBy) {
        case 'week':
          dateFormat = '%Y-%u'; // Año-semana
          break;
        case 'month':
          dateFormat = '%Y-%m'; // Año-mes
          break;
        default:
          dateFormat = '%Y-%m-%d'; // Año-mes-día
      }

      const stats = await TimeSlot.findAll({
        where: whereConditions,
        attributes: [
          [fn('DATE_FORMAT', col('date'), dateFormat), 'period'],
          [fn('COUNT', col('id')), 'totalSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'AVAILABLE' THEN 1 END")), 'availableSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'BOOKED' THEN 1 END")), 'bookedSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'BLOCKED' THEN 1 END")), 'blockedSlots']
        ],
        group: [fn('DATE_FORMAT', col('date'), dateFormat)],
        order: [[fn('DATE_FORMAT', col('date'), dateFormat), 'ASC']],
        raw: true
      });

      // Calcular porcentajes de utilización
      const formattedStats = stats.map(stat => ({
        period: stat.period,
        totalSlots: parseInt(stat.totalSlots),
        availableSlots: parseInt(stat.availableSlots),
        bookedSlots: parseInt(stat.bookedSlots),
        blockedSlots: parseInt(stat.blockedSlots),
        utilizationRate: ((parseInt(stat.bookedSlots) / parseInt(stat.totalSlots)) * 100).toFixed(2),
        availabilityRate: ((parseInt(stat.availableSlots) / parseInt(stat.totalSlots)) * 100).toFixed(2)
      }));

      return {
        groupBy,
        dateRange: { startDate, endDate },
        periods: formattedStats
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtener reporte de utilización detallado
   */
  static async getUtilizationReport({
    businessId,
    specialistId = null,
    startDate,
    endDate
  }) {
    try {
      const whereConditions = {
        businessId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (specialistId) {
        whereConditions.specialistId = specialistId;
      }

      // Obtener resumen general
      const summary = await TimeSlot.findOne({
        where: whereConditions,
        attributes: [
          [fn('COUNT', col('id')), 'totalSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'AVAILABLE' THEN 1 END")), 'availableSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'BOOKED' THEN 1 END")), 'bookedSlots'],
          [fn('COUNT', literal("CASE WHEN status = 'BLOCKED' THEN 1 END")), 'blockedSlots'],
          [fn('SUM', col('duration')), 'totalMinutes']
        ],
        raw: true
      });

      // Obtener distribución por especialista si no se especifica uno
      let specialistBreakdown = null;
      if (!specialistId) {
        specialistBreakdown = await TimeSlot.findAll({
          where: whereConditions,
          attributes: [
            'specialistId',
            [fn('COUNT', col('TimeSlot.id')), 'totalSlots'],
            [fn('COUNT', literal("CASE WHEN TimeSlot.status = 'BOOKED' THEN 1 END")), 'bookedSlots']
          ],
          include: [
            {
              model: User,
              as: 'specialist',
              attributes: ['firstName', 'lastName', 'email']
            }
          ],
          group: ['specialistId', 'specialist.id'],
          raw: false
        });
      }

      // Calcular métricas
      const totalSlots = parseInt(summary.totalSlots);
      const bookedSlots = parseInt(summary.bookedSlots);
      const utilizationRate = totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(2) : 0;

      return {
        dateRange: { startDate, endDate },
        summary: {
          ...summary,
          totalSlots,
          utilizationRate: parseFloat(utilizationRate),
          totalHours: (parseInt(summary.totalMinutes) / 60).toFixed(2)
        },
        specialistBreakdown: specialistBreakdown ? specialistBreakdown.map(item => ({
          specialist: item.specialist,
          totalSlots: parseInt(item.dataValues.totalSlots),
          bookedSlots: parseInt(item.dataValues.bookedSlots),
          utilizationRate: ((parseInt(item.dataValues.bookedSlots) / parseInt(item.dataValues.totalSlots)) * 100).toFixed(2)
        })) : null
      };
    } catch (error) {
      throw new Error(`Error al generar reporte de utilización: ${error.message}`);
    }
  }

  // ===========================================
  // MÉTODOS UTILITARIOS
  // ===========================================

  /**
   * Agrupar slots por fecha y especialista
   */
  static groupSlotsByDateAndSpecialist(slots) {
    const grouped = {};

    slots.forEach(slot => {
      const dateKey = slot.date;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          specialists: {}
        };
      }

      const specialistKey = slot.specialistId;
      if (!grouped[dateKey].specialists[specialistKey]) {
        grouped[dateKey].specialists[specialistKey] = {
          specialist: slot.specialist,
          availableSlots: [],
          bookedSlots: [],
          blockedSlots: [],
          breakSlots: []
        };
      }

      // Categorizar slot por estado
      const specialist = grouped[dateKey].specialists[specialistKey];
      switch (slot.status) {
        case 'AVAILABLE':
          specialist.availableSlots.push(slot);
          break;
        case 'BOOKED':
          specialist.bookedSlots.push(slot);
          break;
        case 'BLOCKED':
          specialist.blockedSlots.push(slot);
          break;
        case 'BREAK':
          specialist.breakSlots.push(slot);
          break;
      }
    });

    // Convertir a array y formatear
    return Object.values(grouped).map(day => ({
      ...day,
      specialists: Object.values(day.specialists)
    }));
  }
}

module.exports = TimeSlotService;
