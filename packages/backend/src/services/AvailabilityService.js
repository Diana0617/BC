/**
 * 📅 AVAILABILITY SERVICE
 * 
 * Servicio para calcular disponibilidad de slots combinando:
 * - Horarios de sucursal (Branch.businessHours)
 * - Disponibilidad de especialista (SpecialistBranchSchedule)
 * - Duración del servicio (Service.duration)
 * - Citas existentes (Appointment)
 * 
 * CARACTERÍSTICAS:
 * 1. Granularidad de 15 minutos para slots
 * 2. NO considera preparationTime/cleanupTime para permitir citas consecutivas sin tiempos muertos
 * 3. Los campos preparationTime/cleanupTime en Service se mantienen por compatibilidad pero no afectan disponibilidad
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

// Constantes de configuración
const SLOT_INTERVAL = 15; // Intervalo entre slots en minutos

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
      console.log(`📅 Fecha: ${date}, Día de la semana: ${dayOfWeek}`);

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
        breakStart: specialistSchedule.breakStart,
        breakEnd: specialistSchedule.breakEnd,
        dayOfWeek: specialistSchedule.dayOfWeek,
        branchId: specialistSchedule.branchId
      } : 'NULL - No encontrado');

      // Si no hay horario específico del especialista, usar horarios de la sucursal
      // Esto permite que los especialistas trabajen en los horarios de la sucursal por defecto
      let workingHours = {
        startTime: branchHours.open,
        endTime: branchHours.close,
        breakStart: branchHours.breakStart,
        breakEnd: branchHours.breakEnd
      };

      // Si el especialista tiene horarios configurados, usarlos
      if (specialistSchedule && specialistSchedule.startTime && specialistSchedule.endTime) {
        workingHours.startTime = specialistSchedule.startTime;
        workingHours.endTime = specialistSchedule.endTime;
        // Si el especialista tiene breaks configurados, usar esos; sino, usar los de la sucursal
        if (specialistSchedule.breakStart && specialistSchedule.breakEnd) {
          workingHours.breakStart = specialistSchedule.breakStart;
          workingHours.breakEnd = specialistSchedule.breakEnd;
          console.log('✅ Usando horarios y breaks del especialista');
        } else {
          console.log('✅ Usando horarios del especialista con breaks de sucursal');
        }
        console.log('   Horarios:', { start: workingHours.startTime, end: workingHours.endTime });
        console.log('   Breaks:', { start: workingHours.breakStart, end: workingHours.breakEnd });
      } else {
        console.log('⚠️ No se encontraron horarios del especialista, usando horarios de sucursal');
      }

      console.log('⏰ Horarios de trabajo finales a usar:', workingHours);

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

      // 6. Obtener información del servicio (duración + tiempos de prep/cleanup)
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId
        }
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      const serviceDuration = service.duration; // Duración del servicio
      // NOTA: No consideramos preparationTime y cleanupTime para permitir citas consecutivas
      const preparationTime = 0; // service.preparationTime || 0;
      const cleanupTime = 0; // service.cleanupTime || 0;
      const totalTimeNeeded = serviceDuration; // Sin buffers adicionales

      console.log(`🕐 Tiempos del servicio "${service.name}":`, {
        duration: serviceDuration,
        preparation: preparationTime,
        cleanup: cleanupTime,
        total: totalTimeNeeded
      });

      // 7. Calcular intersección de horarios
      const workStartTime = this.maxTime(branchHours.open, workingHours.startTime);
      const workEndTime = this.minTime(branchHours.close, workingHours.endTime);

      if (this.parseTime(workStartTime) >= this.parseTime(workEndTime)) {
        return {
          date,
          dayOfWeek,
          message: 'No hay intersección de horarios disponibles',
          slots: []
        };
      }

      // 8. Generar slots con granularidad de 15 minutos
      const allSlots = this.generateTimeSlotsWithInterval(
        workStartTime, 
        workEndTime, 
        serviceDuration,
        preparationTime,
        cleanupTime,
        workingHours.breakStart,
        workingHours.breakEnd,
        SLOT_INTERVAL
      );

      console.log(`✨ Generados ${allSlots.length} slots potenciales con intervalo de ${SLOT_INTERVAL} minutos`);

      // 9. Obtener citas existentes del especialista ese día
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.findAll({
        where: {
          businessId,
          specialistId: userId,
          branchId,
          startTime: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          },
          status: {
            [Op.notIn]: ['CANCELED', 'NO_SHOW']
          }
        },
        include: [{
          model: Service,
          as: 'service',
          attributes: ['duration', 'preparationTime', 'cleanupTime']
        }],
        attributes: ['id', 'startTime', 'endTime', 'status'],
        order: [['startTime', 'ASC']]
      });

      console.log(`📋 ${existingAppointments.length} citas existentes encontradas`);

      // 10. Marcar slots ocupados considerando tiempos de prep/cleanup de citas existentes
      const slotsWithAvailability = allSlots.map(slot => {
        const isOccupied = this.isSlotOccupiedWithBuffer(slot, existingAppointments, date, totalTimeNeeded);
        return {
          ...slot,
          available: !isOccupied
        };
      });

      // 11. Filtrar solo slots disponibles
      const availableSlots = slotsWithAvailability.filter(slot => slot.available);

      console.log(`✅ ${availableSlots.length} slots disponibles de ${allSlots.length} generados`);

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
          preparationTime: preparationTime,
          cleanupTime: cleanupTime,
          totalTime: totalTimeNeeded,
          price: service.price
        },
        workingHours: {
          start: workStartTime,
          end: workEndTime
        },
        slotInterval: SLOT_INTERVAL,
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

      const service = await Service.findByPk(serviceId);
      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      // Calcular endTime basado en duración (SIN prep/cleanup para permitir citas consecutivas)
      const startTime = this.parseTime(time);
      const totalTimeNeeded = service.duration; // Sin buffers adicionales
      const endTime = this.addMinutes(startTime, totalTimeNeeded);
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
   * 🔑 Generar slots con intervalo fijo (15 min)
   * NOTA: Ya no considera preparationTime/cleanupTime para permitir citas consecutivas
   * @param {String} startTime - "09:00"
   * @param {String} endTime - "18:00"
   * @param {Number} serviceDuration - Duración del servicio en minutos
   * @param {Number} preparationTime - DEPRECADO: Ya no se usa (mantener por compatibilidad)
   * @param {Number} cleanupTime - DEPRECADO: Ya no se usa (mantener por compatibilidad)
   * @param {String} breakStart - "12:00" (opcional)
   * @param {String} breakEnd - "13:00" (opcional)
   * @param {Number} slotInterval - Intervalo entre slots (default: 15)
   * @returns {Array} slots
   */
  static generateTimeSlotsWithInterval(
    startTime, 
    endTime, 
    serviceDuration,
    preparationTime = 0,
    cleanupTime = 0,
    breakStart = null, 
    breakEnd = null, 
    slotInterval = 15
  ) {
    const slots = [];
    let current = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    
    const breakStartTime = breakStart ? this.parseTime(breakStart) : null;
    const breakEndTime = breakEnd ? this.parseTime(breakEnd) : null;

    // NOTA: Ya no sumamos prep/cleanup, solo la duración del servicio
    const totalTimeNeeded = serviceDuration; // Sin buffers adicionales

    while (current < end) {
      // Calcular cuándo terminaría este slot (inicio + tiempo total)
      const slotEnd = this.addMinutes(current, totalTimeNeeded);
      
      // Verificar que el slot completo quepa antes del cierre
      if (slotEnd > end) {
        break; // No hay tiempo suficiente
      }
      
      // Verificar si el slot cruza el break
      const crossesBreak = breakStartTime && breakEndTime && (
        (current >= breakStartTime && current < breakEndTime) || // Inicia durante break
        (slotEnd > breakStartTime && slotEnd <= breakEndTime) || // Termina durante break
        (current < breakStartTime && slotEnd > breakEndTime)     // Cruza completamente el break
      );
      
      if (!crossesBreak) {
        slots.push({
          startTime: this.formatTime(current),
          endTime: this.formatTime(this.addMinutes(current, serviceDuration)),
          totalDuration: totalTimeNeeded, // Igual a serviceDuration (sin buffers)
          serviceDuration: serviceDuration,
          preparationTime: 0, // Ya no se usa
          cleanupTime: 0 // Ya no se usa
        });
      }
      
      // 🔑 CAMBIO CLAVE: Incrementar por intervalo fijo (15 min) NO por duración total
      current = this.addMinutes(current, slotInterval);
    }

    return slots;
  }

  /**
   * 🔑 NUEVO: Verificar si un slot está ocupado considerando buffers de prep/cleanup
   * @param {Object} slot - { startTime, endTime, totalDuration }
   * @param {Array} appointments - Citas existentes con sus servicios
   * @param {String} date - YYYY-MM-DD
   * @param {Number} totalTimeNeeded - Duración total incluyendo prep/cleanup
   * @returns {Boolean}
   */
  static isSlotOccupiedWithBuffer(slot, appointments, date, totalTimeNeeded) {
    // Calcular el rango REAL que ocuparía el slot (incluyendo prep/cleanup)
    const slotStart = new Date(`${date}T${slot.startTime}:00`);
    const slotEnd = this.addMinutes(slotStart, totalTimeNeeded);

    return appointments.some(appointment => {
      const aptStart = new Date(appointment.startTime);
      
      // Calcular cuánto tiempo REALMENTE ocupa la cita existente
      // NOTA: Solo usamos la duración del servicio, sin prep/cleanup para permitir citas consecutivas
      let aptTotalTime = 0;
      if (appointment.service) {
        aptTotalTime = (appointment.service.duration || 0);
        // NO sumamos: + (appointment.service.preparationTime || 0) + (appointment.service.cleanupTime || 0)
      } else {
        // Fallback: usar endTime - startTime de la cita
        aptTotalTime = (new Date(appointment.endTime) - aptStart) / 60000;
      }
      
      const aptEnd = this.addMinutes(aptStart, aptTotalTime);

      // Hay conflicto si hay solapamiento
      const hasConflict = (slotStart < aptEnd && slotEnd > aptStart);
      
      if (hasConflict) {
        console.log(`❌ Conflicto detectado:`, {
          slotStart: this.formatTime(slotStart),
          slotEnd: this.formatTime(slotEnd),
          aptStart: this.formatTime(aptStart),
          aptEnd: this.formatTime(aptEnd)
        });
      }
      
      return hasConflict;
    });
  }

  /**
   * DEPRECADO: Usar generateTimeSlotsWithInterval en su lugar
   */
  static generateTimeSlots(startTime, endTime, duration, breakStart = null, breakEnd = null) {
    console.warn('⚠️ generateTimeSlots está deprecado. Use generateTimeSlotsWithInterval');
    return this.generateTimeSlotsWithInterval(startTime, endTime, duration, 0, 0, breakStart, breakEnd, duration);
  }

  /**
   * DEPRECADO: Usar isSlotOccupiedWithBuffer en su lugar
   */
  static isSlotOccupied(slot, appointments, date) {
    console.warn('⚠️ isSlotOccupied está deprecado. Use isSlotOccupiedWithBuffer');
    const slotStart = new Date(`${date}T${slot.startTime}:00`);
    const slotEnd = new Date(`${date}T${slot.endTime}:00`);

    return appointments.some(appointment => {
      const aptStart = new Date(appointment.startTime);
      const aptEnd = new Date(appointment.endTime);
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
    // Usar UTC para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(year, month - 1, day));
    const dayName = days[dateObj.getUTCDay()];
    console.log(`📅 getDayOfWeekName: ${date} → ${dayName} (UTC day: ${dateObj.getUTCDay()})`);
    return dayName;
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
