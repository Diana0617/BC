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

  // ==================== SERVICIOS ====================

  /**
   * Obtener lista de servicios
   * GET /api/business/:businessId/config/services
   */
  async getServices(req, res) {
    try {
      const { businessId } = req.params;
      const { isActive, category, search, page, limit, sortBy, sortOrder } = req.query;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const filters = {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(category && { category }),
        ...(search && { search }),
        ...(page && { page }),
        ...(limit && { limit }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      };

      const result = await BusinessConfigService.getServices(businessId, filters);

      res.json({
        success: true,
        data: result.services,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener servicio específico
   * GET /api/business/:businessId/config/services/:serviceId
   */
  async getService(req, res) {
    try {
      const { businessId, serviceId } = req.params;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const service = await BusinessConfigService.getService(serviceId, businessId);

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear nuevo servicio
   * POST /api/business/:businessId/config/services
   */
  async createService(req, res) {
    try {
      const { businessId } = req.params;
      const serviceData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear servicios en este negocio'
        });
      }

      const service = await BusinessConfigService.createService(businessId, serviceData);

      res.status(201).json({
        success: true,
        data: service,
        message: 'Servicio creado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar servicio existente
   * PUT /api/business/:businessId/config/services/:serviceId
   */
  async updateService(req, res) {
    try {
      const { businessId, serviceId } = req.params;
      const serviceData = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar servicios en este negocio'
        });
      }

      const service = await BusinessConfigService.updateService(serviceId, serviceData, businessId);

      res.json({
        success: true,
        data: service,
        message: 'Servicio actualizado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar servicio
   * DELETE /api/business/:businessId/config/services/:serviceId
   */
  async deleteService(req, res) {
    try {
      const { businessId, serviceId } = req.params;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar servicios en este negocio'
        });
      }

      const result = await BusinessConfigService.deleteService(serviceId, businessId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Activar/Desactivar servicio
   * PATCH /api/business/:businessId/config/services/:serviceId/status
   */
  async toggleServiceStatus(req, res) {
    try {
      const { businessId, serviceId } = req.params;
      const { isActive } = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cambiar el estado de servicios en este negocio'
        });
      }

      const service = await BusinessConfigService.toggleServiceStatus(serviceId, isActive, businessId);

      res.json({
        success: true,
        data: service,
        message: `Servicio ${isActive ? 'activado' : 'desactivado'} exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener categorías de servicios
   * GET /api/business/:businessId/config/services/categories
   */
  async getServiceCategories(req, res) {
    try {
      const { businessId } = req.params;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const categories = await BusinessConfigService.getServiceCategories(businessId);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar imágenes del servicio
   * POST /api/business/:businessId/config/services/:serviceId/images
   */
  async updateServiceImages(req, res) {
    try {
      const { businessId, serviceId } = req.params;
      const { images } = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar imágenes en este negocio'
        });
      }

      const service = await BusinessConfigService.updateServiceImages(serviceId, images, businessId);

      res.json({
        success: true,
        data: service,
        message: 'Imágenes del servicio actualizadas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de servicios
   * GET /api/business/:businessId/config/services/stats
   */
  async getServicesStats(req, res) {
    try {
      const { businessId } = req.params;
      const { period, startDate, endDate } = req.query;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const filters = {};
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      } else if (period) {
        const now = new Date();
        switch (period) {
          case 'week':
            filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filters.endDate = now;
            break;
          case 'month':
            filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            filters.endDate = now;
            break;
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            filters.startDate = new Date(now.getFullYear(), quarter * 3, 1);
            filters.endDate = now;
            break;
          case 'year':
            filters.startDate = new Date(now.getFullYear(), 0, 1);
            filters.endDate = now;
            break;
        }
      }

      const stats = await BusinessConfigService.getServicesStats(businessId, filters);

      res.json({
        success: true,
        data: stats
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

  // ==================== CONFIGURACIONES DE NUMERACIÓN ====================

  /**
   * Obtener configuraciones de numeración
   * GET /api/business/:businessId/config/numbering
   */
  async getNumberingSettings(req, res) {
    try {
      const { businessId } = req.params;
      
      // Verificar permisos
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }
      
      const business = await BusinessConfigService.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }
      
      const settings = business.settings || {};
      const numberingSettings = settings.numbering || {};
      
      res.json({
        success: true,
        data: {
          receipts: numberingSettings.receipts || {
            enabled: true,
            initialNumber: 1,
            currentNumber: 1,
            prefix: 'REC',
            format: 'REC-{YEAR}-{NUMBER}',
            padLength: 5,
            resetYearly: true
          },
          invoices: numberingSettings.invoices || {
            enabled: true,
            initialNumber: 1,
            currentNumber: 1,
            prefix: 'INV',
            format: 'INV-{YEAR}-{NUMBER}',
            padLength: 5,
            resetYearly: true
          },
          fiscal: numberingSettings.fiscal || {
            enabled: false,
            taxxa_prefix: '',
            tax_regime: 'SIMPLIFIED',
            resolution_number: '',
            resolution_date: null,
            valid_from: null,
            valid_to: null,
            technical_key: '',
            software_id: ''
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching numbering settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Actualizar configuraciones de numeración
   * PUT /api/business/:businessId/config/numbering
   */
  async updateNumberingSettings(req, res) {
    try {
      const { businessId } = req.params;
      const { receipts, invoices, fiscal } = req.body;
      
      // Verificar permisos
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este negocio'
        });
      }
      
      const business = await BusinessConfigService.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }
      
      const currentSettings = business.settings || {};
      
      // Validaciones básicas
      if (receipts) {
        if (receipts.initialNumber < 1) {
          return res.status(400).json({
            success: false,
            message: 'El número inicial de recibos debe ser mayor a 0'
          });
        }
        
        if (receipts.padLength < 1 || receipts.padLength > 10) {
          return res.status(400).json({
            success: false,
            message: 'La longitud de padding debe estar entre 1 y 10'
          });
        }
      }
      
      if (invoices) {
        if (invoices.initialNumber < 1) {
          return res.status(400).json({
            success: false,
            message: 'El número inicial de facturas debe ser mayor a 0'
          });
        }
        
        if (invoices.padLength < 1 || invoices.padLength > 10) {
          return res.status(400).json({
            success: false,
            message: 'La longitud de padding debe estar entre 1 y 10'
          });
        }
      }
      
      // Actualizar configuraciones
      const updatedSettings = {
        ...currentSettings,
        numbering: {
          ...currentSettings.numbering,
          ...(receipts && { receipts }),
          ...(invoices && { invoices }),
          ...(fiscal && { fiscal })
        }
      };
      
      await BusinessConfigService.updateBusinessSettings(businessId, updatedSettings);
      
      res.json({
        success: true,
        message: 'Configuraciones actualizadas exitosamente',
        data: updatedSettings.numbering
      });
      
    } catch (error) {
      console.error('Error updating numbering settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener configuraciones de comunicaciones (WhatsApp y Email)
   * GET /api/business/:businessId/config/communications
   */
  async getCommunicationSettings(req, res) {
    try {
      const { businessId } = req.params;
      
      // Verificar permisos
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }
      
      const business = await BusinessConfigService.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }
      
      const settings = business.settings || {};
      const communicationSettings = settings.communications || {};
      
      // No devolver tokens sensibles en la respuesta
      const whatsappSettings = communicationSettings.whatsapp || {};
      const emailSettings = communicationSettings.email || {};
      
      res.json({
        success: true,
        data: {
          whatsapp: {
            enabled: whatsappSettings.enabled || false,
            phone_number: whatsappSettings.phone_number || '',
            business_account_id: whatsappSettings.business_account_id || '',
            send_receipts: whatsappSettings.send_receipts !== false,
            send_appointments: whatsappSettings.send_appointments !== false,
            send_reminders: whatsappSettings.send_reminders !== false,
            // No incluir tokens por seguridad
            has_access_token: !!whatsappSettings.access_token,
            has_webhook_token: !!whatsappSettings.webhook_verify_token
          },
          email: {
            enabled: emailSettings.enabled !== false,
            smtp_host: emailSettings.smtp_host || '',
            smtp_port: emailSettings.smtp_port || 587,
            smtp_user: emailSettings.smtp_user || '',
            from_email: emailSettings.from_email || '',
            from_name: emailSettings.from_name || '',
            // No incluir password por seguridad
            has_smtp_password: !!emailSettings.smtp_password
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching communication settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Actualizar configuraciones de comunicaciones
   * PUT /api/business/:businessId/config/communications
   */
  async updateCommunicationSettings(req, res) {
    try {
      const { businessId } = req.params;
      const { whatsapp, email } = req.body;
      
      // Verificar permisos
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este negocio'
        });
      }
      
      const business = await BusinessConfigService.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }
      
      const currentSettings = business.settings || {};
      const currentComms = currentSettings.communications || {};
      
      // Validaciones
      if (whatsapp && whatsapp.phone_number && !whatsapp.phone_number.match(/^\+?[1-9]\d{1,14}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de número de WhatsApp inválido'
        });
      }
      
      if (email && email.smtp_port && (email.smtp_port < 1 || email.smtp_port > 65535)) {
        return res.status(400).json({
          success: false,
          message: 'Puerto SMTP inválido'
        });
      }
      
      // Actualizar configuraciones
      const updatedSettings = {
        ...currentSettings,
        communications: {
          ...currentComms,
          ...(whatsapp && { 
            whatsapp: {
              ...currentComms.whatsapp,
              ...whatsapp
            }
          }),
          ...(email && { 
            email: {
              ...currentComms.email,
              ...email
            }
          })
        }
      };
      
      await BusinessConfigService.updateBusinessSettings(businessId, updatedSettings);
      
      res.json({
        success: true,
        message: 'Configuraciones de comunicación actualizadas exitosamente'
      });
      
    } catch (error) {
      console.error('Error updating communication settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Previsualizar formato de numeración
   * GET /api/business/:businessId/config/numbering/preview
   */
  async previewNumberFormat(req, res) {
    try {
      const { format, prefix, padLength, number } = req.query;
      
      if (!format) {
        return res.status(400).json({
          success: false,
          message: 'Formato es requerido'
        });
      }
      
      const currentYear = new Date().getFullYear();
      const testNumber = number || 1;
      
      const preview = format
        .replace('{YEAR}', currentYear.toString())
        .replace('{PREFIX}', prefix || 'PREFIX')
        .replace('{NUMBER}', testNumber.toString().padStart(parseInt(padLength) || 5, '0'));
      
      res.json({
        success: true,
        data: {
          preview,
          year: currentYear,
          number: testNumber,
          formatted_number: testNumber.toString().padStart(parseInt(padLength) || 5, '0')
        }
      });
      
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new BusinessConfigController();