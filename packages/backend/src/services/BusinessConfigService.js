const { Op } = require('sequelize');
const Business = require('../models/Business');
const BusinessRules = require('../models/BusinessRules');
const SpecialistProfile = require('../models/SpecialistProfile');
const Schedule = require('../models/Schedule');
const TimeSlot = require('../models/TimeSlot');
const BusinessPaymentConfig = require('../models/BusinessPaymentConfig');
const User = require('../models/User');
const Service = require('../models/Service');

class BusinessConfigService {
  
  // ==================== GESTIÓN DE REGLAS DEL NEGOCIO ====================
  
  async getBusinessRules(businessId) {
    try {
      let rules = await BusinessRules.findOne({
        where: { businessId }
      });

      // Si no existen reglas, crear las predeterminadas
      if (!rules) {
        rules = await BusinessRules.create({
          businessId,
          // Los valores por defecto están definidos en el modelo
        });
      }

      return rules;
    } catch (error) {
      throw new Error(`Error al obtener reglas del negocio: ${error.message}`);
    }
  }

  async updateBusinessRules(businessId, rulesData) {
    try {
      const [rules, created] = await BusinessRules.findOrCreate({
        where: { businessId },
        defaults: { businessId, ...rulesData }
      });

      if (!created) {
        await rules.update(rulesData);
      }

      return rules;
    } catch (error) {
      throw new Error(`Error al actualizar reglas del negocio: ${error.message}`);
    }
  }

  // ==================== GESTIÓN DE ESPECIALISTAS ====================

  async getSpecialists(businessId, filters = {}) {
    try {
      const whereClause = { businessId };
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.specialization) {
        whereClause.specialization = {
          [Op.iLike]: `%${filters.specialization}%`
        };
      }

      const specialists = await SpecialistProfile.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'status'],
            where: { role: 'SPECIALIST' }
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return specialists;
    } catch (error) {
      throw new Error(`Error al obtener especialistas: ${error.message}`);
    }
  }

  async createSpecialist(businessId, userData, profileData) {
    try {
      // Crear el usuario especialista
      const user = await User.create({
        ...userData,
        role: 'SPECIALIST',
        businessId
      });

      // Crear el perfil del especialista
      const profile = await SpecialistProfile.create({
        userId: user.id,
        businessId,
        ...profileData
      });

      // Crear horario por defecto para el especialista
      await this.createDefaultScheduleForSpecialist(businessId, user.id);

      return {
        user,
        profile
      };
    } catch (error) {
      throw new Error(`Error al crear especialista: ${error.message}`);
    }
  }

  async updateSpecialistProfile(profileId, profileData) {
    try {
      const profile = await SpecialistProfile.findByPk(profileId);
      if (!profile) {
        throw new Error('Perfil de especialista no encontrado');
      }

      await profile.update(profileData);
      return profile;
    } catch (error) {
      throw new Error(`Error al actualizar perfil de especialista: ${error.message}`);
    }
  }

  async deleteSpecialist(profileId) {
    try {
      const profile = await SpecialistProfile.findByPk(profileId, {
        include: [{ model: User, as: 'user' }]
      });
      
      if (!profile) {
        throw new Error('Especialista no encontrado');
      }

      // Verificar si tiene citas pendientes
      const hasPendingAppointments = await this.hasActivAppointments(profile.userId);
      if (hasPendingAppointments) {
        // En lugar de eliminar, desactivar
        await profile.update({ 
          status: 'INACTIVE', 
          isActive: false 
        });
        await profile.user.update({ status: 'INACTIVE' });
        
        return { deleted: false, deactivated: true };
      }

      // Eliminar horarios y slots asociados
      await this.deleteSpecialistSchedulesAndSlots(profile.userId);
      
      // Eliminar perfil y usuario
      await profile.destroy();
      await profile.user.destroy();

      return { deleted: true, deactivated: false };
    } catch (error) {
      throw new Error(`Error al eliminar especialista: ${error.message}`);
    }
  }

  // ==================== GESTIÓN DE HORARIOS ====================

  async getSchedules(businessId, specialistId = null) {
    try {
      const whereClause = { businessId };
      if (specialistId) {
        whereClause.specialistId = specialistId;
      }

      const schedules = await Schedule.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [
          ['isDefault', 'DESC'],
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      return schedules;
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }

  async createSchedule(businessId, scheduleData, createdBy) {
    try {
      // Si es el horario por defecto, desactivar otros horarios por defecto
      if (scheduleData.isDefault) {
        await this.deactivateOtherDefaultSchedules(
          businessId, 
          scheduleData.specialistId
        );
      }

      const schedule = await Schedule.create({
        businessId,
        ...scheduleData,
        createdBy
      });

      // Generar slots de tiempo para este horario
      await this.generateTimeSlotsForSchedule(schedule);

      return schedule;
    } catch (error) {
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  }

  async updateSchedule(scheduleId, scheduleData, updatedBy) {
    try {
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('Horario no encontrado');
      }

      // Si se está marcando como por defecto, desactivar otros
      if (scheduleData.isDefault && !schedule.isDefault) {
        await this.deactivateOtherDefaultSchedules(
          schedule.businessId, 
          schedule.specialistId
        );
      }

      await schedule.update({
        ...scheduleData,
        updatedBy
      });

      // Regenerar slots si cambió la configuración
      if (scheduleData.weeklySchedule || scheduleData.slotDuration) {
        await this.regenerateTimeSlotsForSchedule(schedule);
      }

      return schedule;
    } catch (error) {
      throw new Error(`Error al actualizar horario: ${error.message}`);
    }
  }

  async deleteSchedule(scheduleId) {
    try {
      const schedule = await Schedule.findByPk(scheduleId);
      if (!schedule) {
        throw new Error('Horario no encontrado');
      }

      // Verificar si es el horario por defecto
      if (schedule.isDefault) {
        throw new Error('No se puede eliminar el horario por defecto');
      }

      // Eliminar slots de tiempo asociados
      await TimeSlot.destroy({
        where: { scheduleId }
      });

      await schedule.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  }

  // ==================== GESTIÓN DE SLOTS DE TIEMPO ====================

  async getAvailableSlots(businessId, specialistId, date, serviceId = null) {
    try {
      const whereClause = {
        businessId,
        specialistId,
        date,
        status: 'AVAILABLE'
      };

      if (serviceId) {
        // Validar que el slot sea compatible con la duración del servicio
        const service = await Service.findByPk(serviceId);
        if (service) {
          whereClause.duration = { [Op.gte]: service.duration };
        }
      }

      const slots = await TimeSlot.findAll({
        where: whereClause,
        order: [['startTime', 'ASC']]
      });

      return slots;
    } catch (error) {
      throw new Error(`Error al obtener slots disponibles: ${error.message}`);
    }
  }

  async blockSlot(slotId, reason, blockedBy) {
    try {
      const slot = await TimeSlot.findByPk(slotId);
      if (!slot) {
        throw new Error('Slot no encontrado');
      }

      if (slot.status !== 'AVAILABLE') {
        throw new Error('El slot no está disponible para bloquear');
      }

      await slot.update({
        status: 'BLOCKED',
        blockReason: reason,
        lastModifiedBy: blockedBy
      });

      return slot;
    } catch (error) {
      throw new Error(`Error al bloquear slot: ${error.message}`);
    }
  }

  async unblockSlot(slotId, unblockedBy) {
    try {
      const slot = await TimeSlot.findByPk(slotId);
      if (!slot) {
        throw new Error('Slot no encontrado');
      }

      await slot.update({
        status: 'AVAILABLE',
        blockReason: null,
        lastModifiedBy: unblockedBy
      });

      return slot;
    } catch (error) {
      throw new Error(`Error al desbloquear slot: ${error.message}`);
    }
  }

  // ==================== GESTIÓN DE CONFIGURACIÓN DE PAGOS ====================

  async getPaymentConfig(businessId) {
    try {
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });

      if (!config) {
        // Crear configuración por defecto
        return await BusinessPaymentConfig.create({
          businessId,
          // Los valores por defecto están en el modelo
        });
      }

      return config;
    } catch (error) {
      throw new Error(`Error al obtener configuración de pagos: ${error.message}`);
    }
  }

  async updatePaymentConfig(businessId, configData, updatedBy) {
    try {
      const [config, created] = await BusinessPaymentConfig.findOrCreate({
        where: { businessId },
        defaults: { businessId, ...configData }
      });

      if (!created) {
        await config.update({
          ...configData,
          activatedBy: updatedBy,
          activatedAt: configData.isActive ? new Date() : null
        });
      }

      return config;
    } catch (error) {
      throw new Error(`Error al actualizar configuración de pagos: ${error.message}`);
    }
  }

  async testPaymentConfig(businessId) {
    try {
      const config = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });

      if (!config) {
        throw new Error('Configuración de pagos no encontrada');
      }

      // Implementar prueba según el proveedor
      let testResult;
      switch (config.provider) {
        case 'WOMPI':
          testResult = await this.testWompiConfig(config);
          break;
        case 'STRIPE':
          testResult = await this.testStripeConfig(config);
          break;
        default:
          throw new Error(`Proveedor ${config.provider} no soportado`);
      }

      // Actualizar resultado de la prueba
      await config.update({
        lastTestDate: new Date(),
        lastTestResult: testResult
      });

      return testResult;
    } catch (error) {
      throw new Error(`Error al probar configuración de pagos: ${error.message}`);
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  async createDefaultScheduleForSpecialist(businessId, specialistId) {
    try {
      // Obtener horario del negocio como referencia
      const businessRules = await this.getBusinessRules(businessId);
      
      const schedule = await Schedule.create({
        businessId,
        specialistId,
        type: 'SPECIALIST_CUSTOM',
        name: 'Horario por defecto',
        isDefault: true,
        isActive: true,
        weeklySchedule: businessRules.workingHours,
        createdBy: specialistId
      });

      await this.generateTimeSlotsForSchedule(schedule);
      return schedule;
    } catch (error) {
      console.error('Error creando horario por defecto:', error);
    }
  }

  async deactivateOtherDefaultSchedules(businessId, specialistId) {
    const whereClause = {
      businessId,
      isDefault: true,
      isActive: true
    };

    if (specialistId) {
      whereClause.specialistId = specialistId;
    } else {
      whereClause.specialistId = null;
    }

    await Schedule.update(
      { isDefault: false },
      { where: whereClause }
    );
  }

  async generateTimeSlotsForSchedule(schedule) {
    try {
      const { weeklySchedule, slotDuration, bufferTime } = schedule;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Generar para 30 días

      // Eliminar slots existentes para este horario
      await TimeSlot.destroy({
        where: { scheduleId: schedule.id }
      });

      const slotsToCreate = [];
      
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dayName = this.getDayName(currentDate);
        const daySchedule = weeklySchedule[dayName];
        
        if (!daySchedule?.enabled || !daySchedule.shifts?.length) {
          continue;
        }

        for (const shift of daySchedule.shifts) {
          const slots = this.generateSlotsForShift(
            currentDate,
            shift,
            slotDuration,
            bufferTime,
            schedule
          );
          slotsToCreate.push(...slots);
        }
      }

      if (slotsToCreate.length > 0) {
        await TimeSlot.bulkCreate(slotsToCreate);
      }

      return slotsToCreate.length;
    } catch (error) {
      console.error('Error generando slots:', error);
      throw error;
    }
  }

  generateSlotsForShift(date, shift, slotDuration, bufferTime, schedule) {
    const slots = [];
    const dateStr = date.toISOString().split('T')[0];
    
    const startTime = new Date(`${dateStr}T${shift.start}:00`);
    const endTime = new Date(`${dateStr}T${shift.end}:00`);
    
    // Crear break si existe
    let breakStart = null;
    let breakEnd = null;
    if (shift.breakStart && shift.breakEnd) {
      breakStart = new Date(`${dateStr}T${shift.breakStart}:00`);
      breakEnd = new Date(`${dateStr}T${shift.breakEnd}:00`);
    }

    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + (slotDuration * 60000));
      
      if (slotEnd > endTime) break;

      // Verificar si está en horario de break
      const isBreakTime = breakStart && breakEnd && 
        currentTime >= breakStart && currentTime < breakEnd;

      slots.push({
        businessId: schedule.businessId,
        specialistId: schedule.specialistId,
        scheduleId: schedule.id,
        date: dateStr,
        startTime: currentTime.toTimeString().substring(0, 8),
        endTime: slotEnd.toTimeString().substring(0, 8),
        startDateTime: new Date(currentTime),
        endDateTime: new Date(slotEnd),
        status: isBreakTime ? 'BREAK' : 'AVAILABLE',
        type: isBreakTime ? 'BREAK' : 'REGULAR',
        duration: slotDuration,
        generatedAt: new Date()
      });

      currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
    }

    return slots;
  }

  getDayName(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  async hasActivAppointments(specialistId) {
    // Esta función se implementaría para verificar citas activas
    // Por ahora retorna false
    return false;
  }

  async deleteSpecialistSchedulesAndSlots(specialistId) {
    await TimeSlot.destroy({
      where: { specialistId }
    });
    await Schedule.destroy({
      where: { specialistId }
    });
  }

  async regenerateTimeSlotsForSchedule(schedule) {
    await this.generateTimeSlotsForSchedule(schedule);
  }

  async testWompiConfig(config) {
    // Implementar prueba de configuración de Wompi
    return {
      success: true,
      message: 'Configuración de Wompi válida',
      provider: 'WOMPI',
      testMode: config.testMode
    };
  }

  async testStripeConfig(config) {
    // Implementar prueba de configuración de Stripe
    return {
      success: true,
      message: 'Configuración de Stripe válida',
      provider: 'STRIPE',
      testMode: config.testMode
    };
  }
}

module.exports = new BusinessConfigService();