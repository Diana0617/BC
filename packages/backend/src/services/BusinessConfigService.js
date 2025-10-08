// TEMPORARILY SIMPLIFIED - BusinessConfigService under refactoring
// Full functionality temporarily unavailable while BusinessRules system is being refactored

const { Op } = require('sequelize');
const Business = require('../models/Business');
const SpecialistProfile = require('../models/SpecialistProfile');
const Schedule = require('../models/Schedule');
const TimeSlot = require('../models/TimeSlot');
const BusinessPaymentConfig = require('../models/BusinessPaymentConfig');
const User = require('../models/User');
const Service = require('../models/Service');

class BusinessConfigService {
  
  // TEMPORARILY DISABLED METHODS - Return error messages
  
  async getBusinessRules(businessId) {
    throw new Error('BusinessRules functionality temporarily unavailable - system under refactoring');
  }

  async updateBusinessRules(businessId, rulesData) {
    throw new Error('BusinessRules functionality temporarily unavailable - system under refactoring');
  }

  async createDefaultScheduleForSpecialist(businessId, specialistId) {
    throw new Error('createDefaultScheduleForSpecialist temporarily unavailable - BusinessRules system under refactoring');
  }

  // Add minimal methods that might be needed
  async deactivateOtherDefaultSchedules(businessId, specialistId) {
    // Temporary stub - might be called by other services
    return true;
  }

  async generateTimeSlotsForSchedule(schedule) {
    // Temporary stub - might be called by other services
    return true;
  }

  generateSlotsForShift(date, shift, slotDuration, bufferTime, schedule) {
    // Temporary stub
    return [];
  }

  getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  async hasActiveAppointments(specialistId) {
    // Temporary stub
    return false;
  }

  // ==================== BUSINESS BASIC OPERATIONS ====================

  /**
   * Get business by ID
   */
  async getBusiness(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      return business;
    } catch (error) {
      console.error('Error getting business:', error);
      throw error;
    }
  }

  /**
   * Update business basic info
   */
  async updateBusiness(businessId, data) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }
      
      await business.update(data);
      return business;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }

  /**
   * Update business settings (JSONB field)
   */
  async updateBusinessSettings(businessId, settings) {
    try {
      const business = await Business.findByPk(businessId);
      if (!business) {
        throw new Error('Negocio no encontrado');
      }
      
      await business.update({ settings });
      return business;
    } catch (error) {
      console.error('Error updating business settings:', error);
      throw error;
    }
  }

  async deleteSpecialistSchedulesAndSlots(specialistId) {
    // Temporary stub
    return true;
  }

  async regenerateTimeSlotsForSchedule(schedule) {
    // Temporary stub
    return true;
  }

  async testWompiConfig(config) {
    throw new Error('Payment config testing temporarily unavailable - system under refactoring');
  }

  async testStripeConfig(config) {
    throw new Error('Payment config testing temporarily unavailable - system under refactoring');
  }

  // Service methods - these might still work without BusinessRules
  async getSpecialists(businessId, filters = {}) {
    try {
      const whereClause = { businessId };

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      if (filters.specialization) {
        whereClause.specialization = filters.specialization;
      }

      // Filtro opcional por sucursal
      const includeOptions = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ];

      if (filters.branchId) {
        includeOptions.push({
          model: require('../models/Branch'),
          as: 'branches',
          where: { id: filters.branchId },
          through: { attributes: [] }, // Excluir atributos de la tabla intermedia
          required: true // INNER JOIN para filtrar solo especialistas de la sucursal
        });
      } else {
        // Si no hay filtro de sucursal, incluir todas las sucursales del especialista
        includeOptions.push({
          model: require('../models/Branch'),
          as: 'branches',
          through: { attributes: [] },
          required: false // LEFT JOIN para incluir especialistas sin sucursal asignada
        });
      }

      const specialists = await SpecialistProfile.findAll({
        where: whereClause,
        include: includeOptions,
        order: [['createdAt', 'DESC']]
      });

      return specialists;
    } catch (error) {
      throw new Error(`Error al obtener especialistas: ${error.message}`);
    }
  }

  async getServices(businessId, filters = {}) {
    try {
      const whereClause = { businessId };
      
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      
      if (filters.category) {
        whereClause.category = filters.category;
      }

      const services = await Service.findAll({
        where: whereClause,
        order: [['name', 'ASC']]
      });

      return services;
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  }

  async getService(serviceId, businessId = null) {
    try {
      const whereClause = { id: serviceId };
      if (businessId) {
        whereClause.businessId = businessId;
      }

      const service = await Service.findOne({
        where: whereClause
      });

      return service;
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  }
}

module.exports = new BusinessConfigService();
