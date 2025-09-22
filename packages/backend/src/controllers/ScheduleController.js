/**
 * ��� SCHEDULE CONTROLLER
 * 
 * Controlador para gestión de horarios y generación de slots
 */

const ScheduleService = require('../services/ScheduleService');
const { validationResult } = require('express-validator');

class ScheduleController {
  /**
   * Crear nuevo horario
   */
  static async createSchedule(req, res) {
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
      const scheduleData = {
        ...req.body,
        businessId,
        createdBy: req.user.id
      };

      const schedule = await ScheduleService.createSchedule(scheduleData);

      res.status(201).json({
        success: true,
        message: 'Horario creado exitosamente',
        data: schedule
      });
    } catch (error) {
      console.error('Error al crear horario:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener horarios del negocio
   */
  static async getSchedules(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        specialistId,
        type,
        status = 'ACTIVE',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        businessId,
        specialistId,
        type,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const schedules = await ScheduleService.getSchedules(filters);

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener detalle de un horario específico
   */
  static async getScheduleDetail(req, res) {
    try {
      const { scheduleId } = req.params;
      const { businessId } = req.user;

      const schedule = await ScheduleService.getScheduleDetail(scheduleId, businessId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Horario no encontrado'
        });
      }

      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Error al obtener detalle del horario:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar horario
   */
  static async updateSchedule(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { scheduleId } = req.params;
      const { businessId } = req.user;
      const updateData = {
        ...req.body,
        updatedBy: req.user.id
      };

      const schedule = await ScheduleService.updateSchedule(scheduleId, businessId, updateData);

      res.json({
        success: true,
        message: 'Horario actualizado exitosamente',
        data: schedule
      });
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar/desactivar horario
   */
  static async deleteSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { businessId } = req.user;

      await ScheduleService.deleteSchedule(scheduleId, businessId);

      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Generar slots para un horario específico
   */
  static async generateSlots(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de validación incorrectos',
          errors: errors.array()
        });
      }

      const { scheduleId } = req.params;
      const { businessId } = req.user;
      const { 
        startDate,
        endDate,
        generateBreaks = true,
        overwriteExisting = false
      } = req.body;

      const result = await ScheduleService.generateTimeSlots({
        scheduleId,
        businessId,
        startDate,
        endDate,
        generateBreaks,
        overwriteExisting
      });

      res.json({
        success: true,
        message: 'Slots generados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al generar slots:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Generar slots para múltiples horarios
   */
  static async bulkGenerateSlots(req, res) {
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
        scheduleIds,
        specialistId,
        startDate,
        endDate,
        generateBreaks = true,
        overwriteExisting = false
      } = req.body;

      const results = [];

      // Generar slots para cada horario
      for (const scheduleId of scheduleIds) {
        try {
          const result = await ScheduleService.generateTimeSlots({
            scheduleId,
            businessId,
            startDate,
            endDate,
            generateBreaks,
            overwriteExisting
          });
          results.push({
            scheduleId,
            success: true,
            data: result
          });
        } catch (error) {
          results.push({
            scheduleId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Generación masiva de slots completada',
        data: {
          results,
          total: scheduleIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });
    } catch (error) {
      console.error('Error en generación masiva de slots:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener vista de agenda por semana
   */
  static async getWeeklyAgenda(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        startDate,
        specialistId
      } = req.query;

      if (!startDate) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de inicio requerida'
        });
      }

      // Calcular fecha de fin (7 días después)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const agenda = await ScheduleService.getWeeklyAgenda({
        businessId,
        startDate,
        endDate: endDate.toISOString().split('T')[0],
        specialistId
      });

      res.json({
        success: true,
        data: agenda
      });
    } catch (error) {
      console.error('Error al obtener agenda semanal:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener vista de agenda por mes
   */
  static async getMonthlyAgenda(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        year,
        month,
        specialistId
      } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: 'Año y mes requeridos'
        });
      }

      // Calcular primer y último día del mes
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const agenda = await ScheduleService.getMonthlyAgenda({
        businessId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        specialistId
      });

      res.json({
        success: true,
        data: agenda
      });
    } catch (error) {
      console.error('Error al obtener agenda mensual:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Validar configuración de horario semanal
   */
  static async validateWeeklySchedule(req, res) {
    try {
      const { businessId } = req.user;
      const { specialistId, weeklySchedule } = req.body;

      if (!specialistId || !weeklySchedule) {
        return res.status(400).json({
          success: false,
          message: 'ID del especialista y configuración semanal requeridos'
        });
      }

      const validation = await ScheduleService.validateWeeklySchedule({
        businessId,
        specialistId,
        weeklySchedule
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error al validar horario semanal:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Clonar horario existente
   */
  static async cloneSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { businessId } = req.user;
      const { 
        name,
        specialistId,
        startDate,
        endDate
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nombre del nuevo horario requerido'
        });
      }

      const clonedSchedule = await ScheduleService.cloneSchedule({
        originalScheduleId: scheduleId,
        businessId,
        newName: name,
        specialistId,
        startDate,
        endDate,
        clonedBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Horario clonado exitosamente',
        data: clonedSchedule
      });
    } catch (error) {
      console.error('Error al clonar horario:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener plantillas de horarios predefinidas
   */
  static async getScheduleTemplates(req, res) {
    try {
      const templates = ScheduleService.getScheduleTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear horario desde plantilla
   */
  static async createFromTemplate(req, res) {
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
        templateId,
        name,
        specialistId,
        startDate,
        endDate,
        customizations = {}
      } = req.body;

      const schedule = await ScheduleService.createFromTemplate({
        templateId,
        businessId,
        name,
        specialistId,
        startDate,
        endDate,
        customizations,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Horario creado desde plantilla exitosamente',
        data: schedule
      });
    } catch (error) {
      console.error('Error al crear desde plantilla:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ScheduleController;
