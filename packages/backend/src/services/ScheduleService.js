/**
 * Ì≥Ö SCHEDULE SERVICE
 * 
 * Servicio para gesti√≥n completa de horarios y generaci√≥n de slots de tiempo.
 */

const { Op, Transaction } = require('sequelize');
const { sequelize } = require('../config/database');
const Schedule = require('../models/Schedule');
const TimeSlot = require('../models/TimeSlot');
const User = require('../models/User');
const Business = require('../models/Business');

class ScheduleService {
  /**
   * Crear un nuevo horario
   */
  static async createSchedule({
    businessId,
    specialistId = null,
    type = 'BUSINESS_DEFAULT',
    name,
    description,
    weeklySchedule,
    slotDuration = 30,
    bufferTime = 5,
    timezone = 'America/Bogota',
    effectiveFrom = null,
    effectiveTo = null,
    isDefault = false,
    exceptions = [],
    createdBy
  }) {
    const transaction = await sequelize.transaction();
    
    try {
      // Si es horario por defecto, desactivar otros horarios por defecto
      if (isDefault) {
        await Schedule.update(
          { isDefault: false },
          { 
            where: { 
              businessId, 
              specialistId,
              isActive: true 
            },
            transaction 
          }
        );
      }

      // Validar estructura del horario semanal
      this.validateWeeklySchedule(weeklySchedule);

      const schedule = await Schedule.create({
        businessId,
        specialistId,
        type,
        name,
        description,
        weeklySchedule,
        slotDuration,
        bufferTime,
        timezone,
        effectiveFrom,
        effectiveTo,
        isDefault,
        exceptions,
        createdBy
      }, { transaction });

      await transaction.commit();
      return schedule;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener horarios de un negocio o especialista
   */
  static async getSchedules({
    businessId,
    specialistId = null,
    includeInactive = false,
    effectiveDate = null
  }) {
    const whereConditions = {
      businessId,
      ...(specialistId && { specialistId }),
      ...((!includeInactive) && { isActive: true })
    };

    // Filtrar por fecha efectiva si se proporciona
    if (effectiveDate) {
      const targetDate = new Date(effectiveDate);
      whereConditions[Op.and] = [
        {
          [Op.or]: [
            { effectiveFrom: null },
            { effectiveFrom: { [Op.lte]: targetDate } }
          ]
        },
        {
          [Op.or]: [
            { effectiveTo: null },
            { effectiveTo: { [Op.gte]: targetDate } }
          ]
        }
      ];
    }

    const schedules = await Schedule.findAll({
      where: whereConditions,
      order: [['priority', 'DESC'], ['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    return schedules;
  }

  /**
   * Validar estructura del horario semanal
   */
  static validateWeeklySchedule(weeklySchedule) {
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of requiredDays) {
      if (!weeklySchedule[day]) {
        throw new Error(`Configuraci√≥n faltante para ${day}`);
      }

      const dayConfig = weeklySchedule[day];
      
      if (typeof dayConfig.enabled !== 'boolean') {
        throw new Error(`${day}.enabled debe ser booleano`);
      }

      if (!Array.isArray(dayConfig.shifts)) {
        throw new Error(`${day}.shifts debe ser un array`);
      }
    }
  }
}

module.exports = ScheduleService;
