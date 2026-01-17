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
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      const { isActive, status, specialization, branchId, userId } = req.query;
      
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const filters = {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(status && { status }),
        ...(specialization && { specialization }),
        ...(branchId && { branchId }),
        ...(userId && { userId })
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      console.log('📥 updateSpecialistProfile recibido:', {
        businessId,
        profileId,
        hasBranchId: !!profileData.branchId,
        hasAdditionalBranches: !!(profileData.additionalBranches && profileData.additionalBranches.length > 0),
        role: profileData.role
      });
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      console.error('❌ Error en updateSpecialistProfile controller:', {
        message: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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

  async toggleSpecialistStatus(req, res) {
    try {
      const { businessId, profileId } = req.params;
      const { isActive } = req.body;
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cambiar el estado de especialistas'
        });
      }

      const result = await BusinessConfigService.toggleSpecialistStatus(profileId, isActive);

      res.json({
        success: true,
        data: result,
        message: isActive ? 'Especialista activado exitosamente' : 'Especialista desactivado exitosamente'
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'SPECIALIST', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear horarios'
        });
      }

      // Los especialistas solo pueden crear sus propios horarios
      if ((req.user.role === 'SPECIALIST' || req.user.role === 'BUSINESS_SPECIALIST') && scheduleData.specialistId !== req.user.id) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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

      // Si el servicio devuelve un array directamente, envuélvelo en un objeto
      const response = Array.isArray(result) 
        ? { success: true, data: result }
        : { success: true, data: result.services, pagination: result.pagination };

      res.json(response);
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      console.error('Error updating service:', error);
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
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

      const { Service, sequelize } = require('../models');
      const { Op } = require('sequelize');

      // Obtener categorías únicas de los servicios activos
      const categories = await Service.findAll({
        where: {
          businessId,
          category: { [Op.ne]: null },
          isActive: true
        },
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      const categoryList = categories.map(c => ({
        name: c.category,
        count: parseInt(c.count) || 0
      }));

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Error fetching service categories:', error);
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
      
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar imágenes en este negocio'
        });
      }

      // Si viene un archivo (nuevo flujo con Cloudinary)
      if (req.file) {
        const { Service } = require('../models');
        const { uploadServiceImage } = require('../config/cloudinary');
        const fs = require('fs').promises;
        
        const service = await Service.findOne({
          where: { id: serviceId, businessId }
        });

        if (!service) {
          return res.status(404).json({
            success: false,
            message: 'Servicio no encontrado'
          });
        }

        // Subir la imagen a Cloudinary
        const uploadResult = await uploadServiceImage(req.file.path, businessId, serviceId);

        // Eliminar archivo temporal (ya procesado por Cloudinary)
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          // Ignorar error si el archivo ya fue eliminado por Cloudinary
        }

        // Agregar la nueva imagen al array de imágenes
        const currentImages = service.images || [];
        const newImageUrl = uploadResult.main.url; // URL de Cloudinary
        const updatedImages = [...currentImages, newImageUrl];

        await service.update({ images: updatedImages });

        return res.json({
          success: true,
          data: {
            ...service.toJSON(),
            images: updatedImages
          },
          message: 'Imagen subida exitosamente'
        });
      }

      // Si viene un array de imágenes en el body (flujo antiguo)
      const { images } = req.body;
      const service = await BusinessConfigService.updateServiceImages(serviceId, images, businessId);

      res.json({
        success: true,
        data: service,
        message: 'Imágenes del servicio actualizadas exitosamente'
      });
    } catch (error) {
      console.error('Error updating service images:', error);
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

  // ==================== BRANDING Y PERSONALIZACIÓN ====================

  /**
   * Obtener configuración de branding
   * GET /api/business/:businessId/branding
   */
  async getBranding(req, res) {
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
      const branding = settings.branding || {};
      
      // Combinar branding con valores por defecto y asegurar que incluye el logo
      const brandingResponse = {
        primaryColor: branding.primaryColor || '#FF6B9D',
        secondaryColor: branding.secondaryColor || '#4ECDC4',
        accentColor: branding.accentColor || '#FFE66D',
        fontFamily: branding.fontFamily || 'Poppins',
        logo: branding.logo || business.logo || null,
        favicon: branding.favicon || null
      };
      
      console.log('📋 getBranding response:', {
        businessId,
        businessLogo: business.logo,
        brandingLogo: branding.logo,
        finalLogo: brandingResponse.logo
      });
      
      res.json({
        success: true,
        data: brandingResponse
      });
      
    } catch (error) {
      console.error('Error fetching branding:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar configuración de branding (colores)
   * PUT /api/business/:businessId/branding
   */
  async updateBranding(req, res) {
    try {
      const { businessId } = req.params;
      const { primaryColor, secondaryColor, accentColor, fontFamily } = req.body;
      
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
      
      // Validar formato de colores hexadecimales
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      
      if (primaryColor && !hexColorRegex.test(primaryColor)) {
        return res.status(400).json({
          success: false,
          message: 'Color primario inválido. Debe ser formato hexadecimal (#RRGGBB)'
        });
      }
      
      if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
        return res.status(400).json({
          success: false,
          message: 'Color secundario inválido. Debe ser formato hexadecimal (#RRGGBB)'
        });
      }
      
      if (accentColor && !hexColorRegex.test(accentColor)) {
        return res.status(400).json({
          success: false,
          message: 'Color de acento inválido. Debe ser formato hexadecimal (#RRGGBB)'
        });
      }
      
      const currentSettings = business.settings || {};
      const currentBranding = currentSettings.branding || {};
      
      // Actualizar configuraciones de branding
      const updatedSettings = {
        ...currentSettings,
        branding: {
          ...currentBranding,
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(accentColor && { accentColor }),
          ...(fontFamily && { fontFamily }),
          // Mantener logo actual - priorizar branding.logo, luego business.logo
          logo: currentBranding.logo || business.logo || null
        }
      };
      
      await BusinessConfigService.updateBusinessSettings(businessId, updatedSettings);
      
      res.json({
        success: true,
        data: updatedSettings.branding,
        message: 'Configuración de branding actualizada exitosamente'
      });
      
    } catch (error) {
      console.error('Error updating branding:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir logo del negocio
   * POST /api/business/:businessId/upload-logo
   */
  async uploadLogo(req, res) {
    try {
      const { businessId } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }
      
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
      
      // Subir a Cloudinary usando el servicio existente
      const CloudinaryService = require('../services/CloudinaryService');
      const uploadResult = await CloudinaryService.uploadBusinessLogo(file.path, businessId);
      
      console.log('☁️  Cloudinary upload result:', uploadResult);
      
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al subir el logo a Cloudinary'
        });
      }
      
      // La URL está en uploadResult.data.main.url
      const logoUrl = uploadResult.data.main?.url || uploadResult.data.url;
      const thumbnailUrl = uploadResult.data.thumbnail?.url;
      
      console.log('💾 Updating business.logo with URL:', logoUrl);
      
      // Actualizar logo en el modelo Business
      const updateBusinessResult = await BusinessConfigService.updateBusiness(businessId, {
        logo: logoUrl
      });
      
      console.log('✅ Business updated, logo value:', updateBusinessResult.logo);
      
      // Recargar business para obtener la versión actualizada
      const updatedBusiness = await BusinessConfigService.getBusiness(businessId);
      
      console.log('🔄 Reloaded business, logo value:', updatedBusiness.logo);
      
      // Actualizar también en settings.branding
      const currentSettings = updatedBusiness.settings || {};
      const updatedSettings = {
        ...currentSettings,
        branding: {
          ...(currentSettings.branding || {}),
          logo: logoUrl,
          logoThumbnail: thumbnailUrl
        }
      };
      
      console.log('📝 Updating settings.branding with:', updatedSettings.branding);
      
      await BusinessConfigService.updateBusinessSettings(businessId, updatedSettings);
      
      console.log('✅ Settings updated successfully, sending response...');
      
      const responseData = {
        success: true,
        data: {
          logoUrl: logoUrl,
          thumbnailUrl: thumbnailUrl,
          thumbnails: {
            main: uploadResult.data.main,
            thumbnail: uploadResult.data.thumbnail
          }
        },
        message: 'Logo subido exitosamente'
      };
      
      console.log('📤 Response data:', JSON.stringify(responseData, null, 2));
      
      // Limpiar archivo temporal
      const fs = require('fs');
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log('🗑️  Temporary file cleaned:', file.path);
      }
      
      console.log('📨 About to send JSON response...');
      
      // Asegurar headers correctos
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(responseData);
      
      console.log('✅ JSON response sent successfully with status 200');
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      
      // Limpiar archivo temporal en caso de error
      const fs = require('fs');
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
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