const BusinessConfigService = require('../services/BusinessConfigService');

class BusinessConfigController {

  // ==================== REGLAS DEL NEGOCIO ====================

  /**
   * Obtener reglas del negocio
   * GET /api/business/:businessId/config/rules
   */
  async getBusinessRules(req, res) {
    try {
      const { businessId } = req.params;
      
      // Verificar que el usuario pertenece al negocio
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const rules = await BusinessConfigService.getBusinessRules(businessId);

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar reglas del negocio
   * PUT /api/business/:businessId/config/rules
   */
  async updateBusinessRules(req, res) {
    try {
      const { businessId } = req.params;
      const rulesData = req.body;
      
      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar las reglas del negocio'
        });
      }

      const rules = await BusinessConfigService.updateBusinessRules(businessId, rulesData);

      res.json({
        success: true,
        data: rules,
        message: 'Reglas del negocio actualizadas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== ESPECIALISTAS ====================

  /**
   * Obtener lista de especialistas
   * GET /api/business/:businessId/config/specialists
   */
  async getSpecialists(req, res) {
    try {
      const { businessId } = req.params;
      const { isActive, status, specialization } = req.query;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const filters = {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(status && { status }),
        ...(specialization && { specialization })
      };

      const specialists = await BusinessConfigService.getSpecialists(businessId, filters);

      res.json({
        success: true,
        data: specialists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear nuevo especialista
   * POST /api/business/:businessId/config/specialists
   */
  async createSpecialist(req, res) {
    try {
      const { businessId } = req.params;
      const { userData, profileData } = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear especialistas'
        });
      }

      const specialist = await BusinessConfigService.createSpecialist(
        businessId, 
        userData, 
        profileData
      );

      res.status(201).json({
        success: true,
        data: specialist,
        message: 'Especialista creado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar perfil de especialista
   * PUT /api/business/:businessId/config/specialists/:profileId
   */
  async updateSpecialistProfile(req, res) {
    try {
      const { businessId, profileId } = req.params;
      const profileData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar especialistas'
        });
      }

      const profile = await BusinessConfigService.updateSpecialistProfile(profileId, profileData);

      res.json({
        success: true,
        data: profile,
        message: 'Perfil de especialista actualizado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar especialista
   * DELETE /api/business/:businessId/config/specialists/:profileId
   */
  async deleteSpecialist(req, res) {
    try {
      const { businessId, profileId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar especialistas'
        });
      }

      const result = await BusinessConfigService.deleteSpecialist(profileId);

      res.json({
        success: true,
        data: result,
        message: result.deleted ? 
          'Especialista eliminado exitosamente' : 
          'Especialista desactivado debido a citas pendientes'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== HORARIOS ====================

  /**
   * Obtener horarios
   * GET /api/business/:businessId/config/schedules
   */
  async getSchedules(req, res) {
    try {
      const { businessId } = req.params;
      const { specialistId } = req.query;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const schedules = await BusinessConfigService.getSchedules(businessId, specialistId);

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear nuevo horario
   * POST /api/business/:businessId/config/schedules
   */
  async createSchedule(req, res) {
    try {
      const { businessId } = req.params;
      const scheduleData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear horarios'
        });
      }

      // Los especialistas solo pueden crear sus propios horarios
      if (req.user.role === 'SPECIALIST' && scheduleData.specialistId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes crear tus propios horarios'
        });
      }

      const schedule = await BusinessConfigService.createSchedule(
        businessId, 
        scheduleData, 
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Horario creado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar horario
   * PUT /api/business/:businessId/config/schedules/:scheduleId
   */
  async updateSchedule(req, res) {
    try {
      const { businessId, scheduleId } = req.params;
      const scheduleData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar horarios'
        });
      }

      const schedule = await BusinessConfigService.updateSchedule(
        scheduleId, 
        scheduleData, 
        req.user.id
      );

      res.json({
        success: true,
        data: schedule,
        message: 'Horario actualizado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar horario
   * DELETE /api/business/:businessId/config/schedules/:scheduleId
   */
  async deleteSchedule(req, res) {
    try {
      const { businessId, scheduleId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar horarios'
        });
      }

      await BusinessConfigService.deleteSchedule(scheduleId);

      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== SLOTS DE TIEMPO ====================

  /**
   * Obtener slots disponibles
   * GET /api/business/:businessId/config/slots/available
   */
  async getAvailableSlots(req, res) {
    try {
      const { businessId } = req.params;
      const { specialistId, date, serviceId } = req.query;
      
      if (!specialistId || !date) {
        return res.status(400).json({
          success: false,
          message: 'specialistId y date son requeridos'
        });
      }

      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const slots = await BusinessConfigService.getAvailableSlots(
        businessId, 
        specialistId, 
        date, 
        serviceId
      );

      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bloquear slot
   * POST /api/business/:businessId/config/slots/:slotId/block
   */
  async blockSlot(req, res) {
    try {
      const { businessId, slotId } = req.params;
      const { reason } = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para bloquear slots'
        });
      }

      const slot = await BusinessConfigService.blockSlot(slotId, reason, req.user.id);

      res.json({
        success: true,
        data: slot,
        message: 'Slot bloqueado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Desbloquear slot
   * POST /api/business/:businessId/config/slots/:slotId/unblock
   */
  async unblockSlot(req, res) {
    try {
      const { businessId, slotId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para desbloquear slots'
        });
      }

      const slot = await BusinessConfigService.unblockSlot(slotId, req.user.id);

      res.json({
        success: true,
        data: slot,
        message: 'Slot desbloqueado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== CONFIGURACIÓN DE PAGOS ====================

  /**
   * Obtener configuración de pagos
   * GET /api/business/:businessId/config/payments
   */
  async getPaymentConfig(req, res) {
    try {
      const { businessId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración de pagos'
        });
      }

      const config = await BusinessConfigService.getPaymentConfig(businessId);

      // Ocultar información sensible
      const safeConfig = { ...config.toJSON() };
      if (safeConfig.wompiConfig) {
        safeConfig.wompiConfig = {
          ...safeConfig.wompiConfig,
          privateKey: safeConfig.wompiConfig.privateKey ? '****' : null,
          privateKeyTest: safeConfig.wompiConfig.privateKeyTest ? '****' : null,
          webhookSecret: safeConfig.wompiConfig.webhookSecret ? '****' : null
        };
      }

      res.json({
        success: true,
        data: safeConfig
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar configuración de pagos
   * PUT /api/business/:businessId/config/payments
   */
  async updatePaymentConfig(req, res) {
    try {
      const { businessId } = req.params;
      const configData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar la configuración de pagos'
        });
      }

      const config = await BusinessConfigService.updatePaymentConfig(
        businessId, 
        configData, 
        req.user.id
      );

      res.json({
        success: true,
        data: config,
        message: 'Configuración de pagos actualizada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Probar configuración de pagos
   * POST /api/business/:businessId/config/payments/test
   */
  async testPaymentConfig(req, res) {
    try {
      const { businessId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para probar la configuración de pagos'
        });
      }

      const testResult = await BusinessConfigService.testPaymentConfig(businessId);

      res.json({
        success: true,
        data: testResult,
        message: testResult.success ? 
          'Configuración de pagos válida' : 
          'Error en la configuración de pagos'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== RESUMEN DE CONFIGURACIÓN ====================

  /**
   * Obtener resumen completo de configuración del negocio
   * GET /api/business/:businessId/config/summary
   */
  async getConfigSummary(req, res) {
    try {
      const { businessId } = req.params;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const [rules, specialists, schedules, paymentConfig] = await Promise.all([
        BusinessConfigService.getBusinessRules(businessId),
        BusinessConfigService.getSpecialists(businessId, { isActive: true }),
        BusinessConfigService.getSchedules(businessId),
        BusinessConfigService.getPaymentConfig(businessId)
      ]);

      const summary = {
        rules,
        specialists: specialists.length,
        activeSpecialists: specialists.filter(s => s.status === 'ACTIVE').length,
        schedules: schedules.length,
        paymentConfigured: paymentConfig?.isActive || false,
        completionPercentage: this.calculateCompletionPercentage({
          rules, specialists, schedules, paymentConfig
        })
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  calculateCompletionPercentage(config) {
    let completed = 0;
    const total = 4;

    // Reglas configuradas
    if (config.rules) completed++;
    
    // Al menos un especialista activo
    if (config.specialists?.length > 0) completed++;
    
    // Al menos un horario configurado
    if (config.schedules?.length > 0) completed++;
    
    // Pagos configurados
    if (config.paymentConfig?.isActive) completed++;

    return Math.round((completed / total) * 100);
  }
}

module.exports = new BusinessConfigController();