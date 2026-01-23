/**
 * 📅 AVAILABILITY SERVICE
 * 
 * Servicio para calcular disponibilidad de slots combinando:
 * - Horarios de sucursal (Branch.businessHours)
 * - Disponibilidad de especialista (SpecialistBranchSchedule)
 * - Duración del servicio (Service.duration)
 * - Citas existentes (Appointment)
 */

const { Op } = require('sequelize');
const { 
  Branch, 
  SpecialistBranchSchedule, 
  Service, 
  Appointment,
  SpecialistProfile,
  User
} = require('../models');
const SpecialistIdNormalizer = require('../utils/specialistIdNormalizer');

class AvailabilityService {
  /**
   * Generar slots disponibles para un día específico
   * @param {Object} params
   * @param {UUID} params.businessId - ID del negocio (multi-tenant)
   * @param {UUID} params.branchId - ID de la sucursal
   * @param {UUID} params.specialistId - ID del especialista
   * @param {UUID} params.serviceId - ID del servicio
   * @param {String} params.date - Fecha en formato YYYY-MM-DD
   * @returns {Array} slots disponibles con formato { startTime, endTime, available }
   */
  static async generateAvailableSlots({
    businessId,
    branchId,
    specialistId,
    serviceId,
    date
  }) {
    try {
      // 1. Validar que la sucursal existe y está activa
      const branch = await Branch.findOne({
        where: {
          id: branchId,
          businessId,
          status: 'ACTIVE'
        }
      });

      if (!branch) {
        throw new Error('Sucursal no encontrada o inactiva');
      }

      // 2. Obtener el día de la semana
      const dayOfWeek = this.getDayOfWeekName(date);

      // 3. Verificar si la sucursal está abierta ese día y normalizar formato
      let branchDayConfig = branch.businessHours[dayOfWeek];
      
      if (!branchDayConfig || branchDayConfig.closed || !branchDayConfig.enabled) {
        return {
          date,
          dayOfWeek,
          message: 'La sucursal está cerrada este día',
          slots: []
        };
      }

      // Normalizar formato de horarios de sucursal (soportar formato viejo y nuevo)
      let branchHours = {};
      if (branchDayConfig.shifts && branchDayConfig.shifts.length > 0) {
        // Formato nuevo con shifts array - usar el primer turno
        const firstShift = branchDayConfig.shifts[0];
        branchHours = {
          open: firstShift.start,
          close: firstShift.end,
          breakStart: firstShift.breakStart,
          breakEnd: firstShift.breakEnd
        };
        console.log('📋 Horarios de sucursal (formato nuevo):', branchHours);
      } else if (branchDayConfig.open && branchDayConfig.close) {
        // Formato viejo con open/close
        branchHours = {
          open: branchDayConfig.open,
          close: branchDayConfig.close
        };
        console.log('📋 Horarios de sucursal (formato viejo):', branchHours);
      } else {
        console.error('❌ Formato de horarios de sucursal no válido:', branchDayConfig);
        return {
          date,
          dayOfWeek,
          message: 'Horarios de sucursal no configurados correctamente',
          slots: []
        };
      }

      // 4. Normalizar specialistId: obtener ambos IDs (userId y specialistProfileId)
      console.log('🔧 Normalizando specialistId:', specialistId);
      const normalized = await SpecialistIdNormalizer.normalize(specialistId, businessId);
      const { userId, specialistProfileId, user, specialistProfile } = normalized;
      
      console.log('✅ IDs normalizados:', {
        userId,
        specialistProfileId,
        source: normalized.source
      });

      // 5. Obtener horario del especialista para ese día/sucursal
      console.log('🔍 Buscando horario del especialista:', {
        specialistProfileId,
        branchId,
        dayOfWeek
      });

      const specialistSchedule = await SpecialistBranchSchedule.findOne({
        where: {
          specialistId: specialistProfileId, // Usar specialistProfileId para schedules
          branchId,
          dayOfWeek,
          isActive: true
        }
      });

      console.log('📋 Horario del especialista encontrado:', specialistSchedule ? {
        id: specialistSchedule.id,
        startTime: specialistSchedule.startTime,
        endTime: specialistSchedule.endTime,
        dayOfWeek: specialistSchedule.dayOfWeek
      } : null);

      // Si no hay horario específico del especialista, usar horarios de la sucursal
      // Esto permite que los especialistas trabajen en los horarios de la sucursal por defecto
      let workingHours = {
        startTime: branchHours.open,
        endTime: branchHours.close
      };

      // Si el especialista tiene horarios configurados, usarlos
      if (specialistSchedule && specialistSchedule.startTime && specialistSchedule.endTime) {
        workingHours.startTime = specialistSchedule.startTime;
        workingHours.endTime = specialistSchedule.endTime;
      }

      console.log('⏰ Horarios de trabajo a usar:', workingHours);

      // Validar que los horarios estén definidos
      if (!workingHours.startTime || !workingHours.endTime) {
        console.warn('⚠️ Horarios no configurados correctamente');
        return {
          date,
          dayOfWeek,
          message: 'Horarios no configurados correctamente',
          slots: []
        };
      }

      // 5. Obtener duración del servicio
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId
        }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      const slotDuration = service.duration; // En minutos

      // 6. Calcular intersección de horarios (lo más restrictivo)
      // El especialista solo puede trabajar cuando AMBOS están disponibles
      const workStartTime = this.maxTime(branchHours.open, workingHours.startTime);
      const workEndTime = this.minTime(branchHours.close, workingHours.endTime);

      // Validar que hay horario disponible
      if (this.parseTime(workStartTime) >= this.parseTime(workEndTime)) {
        return {
          date,
          dayOfWeek,
          message: 'No hay intersección de horarios disponibles',
          slots: []
        };
      }

      // 7. Generar todos los slots posibles en ese rango
      const allSlots = this.generateTimeSlots(workStartTime, workEndTime, slotDuration);

      // 8. Obtener citas existentes del especialista ese día
      // Buscar por userId (appointments usan userId como specialistId)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.findAll({
        where: {
          businessId,
          specialistId: userId, // Appointments usan userId
          branchId,
          startTime: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          },
          status: {
            [Op.notIn]: ['CANCELED', 'NO_SHOW']
          }
        },
        attributes: ['id', 'startTime', 'endTime', 'status'],
        order: [['startTime', 'ASC']]
      });

      // 9. Marcar slots ocupados
      const slotsWithAvailability = allSlots.map(slot => {
        const isOccupied = this.isSlotOccupied(slot, existingAppointments, date);
        return {
          ...slot,
          available: !isOccupied
        };
      });

      // 10. Filtrar solo slots disponibles
      const availableSlots = slotsWithAvailability.filter(slot => slot.available);

      return {
        date,
        dayOfWeek,
        branch: {
          id: branch.id,
          name: branch.name,
          hours: branchHours
        },
        specialist: {
          id: specialistProfileId, // Retornar specialistProfileId
          userId: userId, // También incluir userId para compatibilidad
          name: `${user.firstName} ${user.lastName}`,
          schedule: {
            startTime: workingHours.startTime,
            endTime: workingHours.endTime,
            source: specialistSchedule ? 'specialist_custom' : 'branch_default'
          }
        },
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        },
        workingHours: {
          start: workStartTime,
          end: workEndTime
        },
        totalSlots: allSlots.length,
        availableSlots: availableSlots.length,
        occupiedSlots: existingAppointments.length,
        slots: availableSlots
      };

    } catch (error) {
      console.error('Error generando slots disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtener disponibilidad de múltiples días
   * @param {Object} params
   * @param {UUID} params.businessId
   * @param {UUID} params.branchId
   * @param {UUID} params.specialistId
   * @param {UUID} params.serviceId
   * @param {String} params.startDate - YYYY-MM-DD
   * @param {String} params.endDate - YYYY-MM-DD
   * @returns {Array} disponibilidad por día
   */
  static async getAvailabilityRange({
    businessId,
    branchId,
    specialistId,
    serviceId,
    startDate,
    endDate
  }) {
    const dates = this.getDateRange(startDate, endDate);
    
    const availabilityPromises = dates.map(date =>
      this.generateAvailableSlots({
        businessId,
        branchId,
        specialistId,
        serviceId,
        date
      })
    );

    const results = await Promise.all(availabilityPromises);
    
    // Filtrar solo días con slots disponibles
    return results.filter(day => day.slots.length > 0);
  }

  /**
   * Obtener todos los especialistas disponibles para un servicio en una fecha/hora
   * @param {Object} params
   * @param {UUID} params.businessId
   * @param {UUID} params.branchId
   * @param {UUID} params.serviceId
   * @param {String} params.date - YYYY-MM-DD
   * @param {String} params.time - HH:MM
   * @returns {Array} especialistas disponibles
   */
  static async getAvailableSpecialists({
    businessId,
    branchId,
    serviceId,
    date,
    time
  }) {
    try {
      const dayOfWeek = this.getDayOfWeekName(date);

      // Obtener todos los especialistas que trabajan ese día en esa sucursal
      const schedules = await SpecialistBranchSchedule.findAll({
        where: {
          branchId,
          dayOfWeek,
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
        ]
      });

      // Obtener servicio para saber la duración
      const service = await Service.findByPk(serviceId);
      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      // Calcular endTime basado en duración
      const startTime = this.parseTime(time);
      const endTime = this.addMinutes(startTime, service.duration);
      const endTimeStr = this.formatTime(endTime);

      // Verificar disponibilidad de cada especialista
      const availabilityChecks = schedules.map(async (schedule) => {
        // Verificar que el horario solicitado esté dentro del horario del especialista
        const scheduleStart = this.parseTime(schedule.startTime);
        const scheduleEnd = this.parseTime(schedule.endTime);
        
        if (startTime < scheduleStart || endTime > scheduleEnd) {
          return null; // Fuera del horario del especialista
        }

        // Verificar que no tenga citas en ese horario
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(`${date}T${endTimeStr}:00`);

        const conflictingAppointment = await Appointment.findOne({
          where: {
            businessId,
            specialistId: schedule.specialistId,
            branchId,
            status: {
              [Op.notIn]: ['CANCELED', 'NO_SHOW']
            },
            [Op.or]: [
              // La cita existente empieza durante el slot solicitado
              {
                startTime: {
                  [Op.gte]: startDateTime,
                  [Op.lt]: endDateTime
                }
              },
              // La cita existente termina durante el slot solicitado
              {
                endTime: {
                  [Op.gt]: startDateTime,
                  [Op.lte]: endDateTime
                }
              },
              // La cita existente engloba completamente el slot solicitado
              {
                startTime: {
                  [Op.lte]: startDateTime
                },
                endTime: {
                  [Op.gte]: endDateTime
                }
              }
            ]
          }
        });

        if (conflictingAppointment) {
          return null; // Tiene conflicto
        }

        return {
          id: schedule.specialist.id,
          firstName: schedule.specialist.firstName,
          lastName: schedule.specialist.lastName,
          email: schedule.specialist.email,
          specialization: schedule.specialist.SpecialistProfile?.specialization,
          bio: schedule.specialist.SpecialistProfile?.bio,
          schedule: {
            startTime: schedule.startTime,
            endTime: schedule.endTime
          },
          available: true
        };
      });

      const results = await Promise.all(availabilityChecks);
      
      // Filtrar nulls (no disponibles)
      return results.filter(specialist => specialist !== null);

    } catch (error) {
      console.error('Error obteniendo especialistas disponibles:', error);
      throw error;
    }
  }

  /**
   * Validar si un slot está disponible (útil antes de crear cita)
   * @param {Object} params
   * @returns {Boolean}
   */
  static async validateSlotAvailability({
    businessId,
    branchId,
    specialistId,
    serviceId,
    startTime,
    endTime
  }) {
    try {
      // Verificar que no haya citas conflictivas
      const conflictingAppointment = await Appointment.findOne({
        where: {
          businessId,
          specialistId,
          branchId,
          status: {
            [Op.notIn]: ['CANCELED', 'NO_SHOW']
          },
          [Op.or]: [
            {
              startTime: {
                [Op.gte]: startTime,
                [Op.lt]: endTime
              }
            },
            {
              endTime: {
                [Op.gt]: startTime,
                [Op.lte]: endTime
              }
            },
            {
              startTime: {
                [Op.lte]: startTime
              },
              endTime: {
                [Op.gte]: endTime
              }
            }
          ]
        }
      });

      return !conflictingAppointment;

    } catch (error) {
      console.error('Error validando disponibilidad de slot:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generar slots de tiempo en un rango
   * @param {String} startTime - "09:00"
   * @param {String} endTime - "18:00"
   * @param {Number} duration - Minutos
   * @returns {Array} slots
   */
  static generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    let current = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    while (current < end) {
      const slotEnd = this.addMinutes(current, duration);
      
      if (slotEnd <= end) {
        slots.push({
          startTime: this.formatTime(current),
          endTime: this.formatTime(slotEnd)
        });
      }
      
      current = slotEnd;
    }

    return slots;
  }

  /**
   * Verificar si un slot está ocupado
   * @param {Object} slot - { startTime, endTime }
   * @param {Array} appointments - Citas existentes
   * @param {String} date - YYYY-MM-DD
   * @returns {Boolean}
   */
  static isSlotOccupied(slot, appointments, date) {
    const slotStart = new Date(`${date}T${slot.startTime}:00`);
    const slotEnd = new Date(`${date}T${slot.endTime}:00`);

    return appointments.some(appointment => {
      const aptStart = new Date(appointment.startTime);
      const aptEnd = new Date(appointment.endTime);

      // Hay conflicto si hay solapamiento
      return (slotStart < aptEnd && slotEnd > aptStart);
    });
  }

  /**
   * Obtener nombre del día de la semana
   * @param {String} date - YYYY-MM-DD
   * @returns {String} - 'monday', 'tuesday', etc.
   */
  static getDayOfWeekName(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dateObj = new Date(date + 'T00:00:00'); // Evitar problemas de zona horaria
    return days[dateObj.getDay()];
  }

  /**
   * Parsear string de tiempo a objeto Date
   * @param {String} timeString - "09:00"
   * @returns {Date}
   */
  static parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Formatear Date a string de tiempo
   * @param {Date} date
   * @returns {String} - "09:00"
   */
  static formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }

  /**
   * Agregar minutos a una fecha
   * @param {Date} date
   * @param {Number} minutes
   * @returns {Date}
   */
  static addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  /**
   * Retornar el tiempo máximo entre dos
   * @param {String} time1 - "09:00"
   * @param {String} time2 - "10:00"
   * @returns {String}
   */
  static maxTime(time1, time2) {
    return this.parseTime(time1) > this.parseTime(time2) ? time1 : time2;
  }

  /**
   * Retornar el tiempo mínimo entre dos
   * @param {String} time1 - "17:00"
   * @param {String} time2 - "18:00"
   * @returns {String}
   */
  static minTime(time1, time2) {
    return this.parseTime(time1) < this.parseTime(time2) ? time1 : time2;
  }

  /**
   * Obtener rango de fechas
   * @param {String} startDate - YYYY-MM-DD
   * @param {String} endDate - YYYY-MM-DD
   * @returns {Array} - Array de fechas en formato YYYY-MM-DD
   */
  static getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}

module.exports = AvailabilityService;
