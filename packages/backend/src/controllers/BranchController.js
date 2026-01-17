const { Branch, SpecialistProfile, SpecialistBranchSchedule, Business } = require('../models');
const { Op } = require('sequelize');

class BranchController {

  /**
   * Obtener todas las sucursales de un negocio
   * GET /api/business/:businessId/branches
   */
  async getBranches(req, res) {
    try {
      const { businessId } = req.params;

      console.log('🏢 getBranches - Validación de acceso:');
      console.log('  businessId (param):', businessId);
      console.log('  req.user.businessId:', req.user.businessId);
      console.log('  req.user.role:', req.user.role);
      console.log('  ¿Coinciden?:', req.user.businessId === businessId);

      // Verificar que el usuario pertenece al negocio
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        console.log('❌ Acceso denegado: businessId no coincide y no es OWNER');
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Por ahora, obtener solo las sucursales sin los especialistas
      // La relación con especialistas se manejará por separado
      const branches = await Branch.findAll({
        where: { businessId, status: 'ACTIVE' },
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: branches
      });
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener una sucursal específica
   * GET /api/business/:businessId/branches/:branchId
   */
  async getBranch(req, res) {
    try {
      const { businessId, branchId } = req.params;

      // Verificar que el usuario pertenece al negocio
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Por ahora, obtener solo la sucursal sin los especialistas
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      res.json({
        success: true,
        data: branch
      });
    } catch (error) {
      console.error('Error obteniendo sucursal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear una nueva sucursal
   * POST /api/business/:businessId/branches
   */
  async createBranch(req, res) {
    try {
      const { businessId } = req.params;
      const branchData = req.body;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear sucursales'
        });
      }

      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Crear la sucursal
      const branch = await Branch.create({
        ...branchData,
        businessId
      });

      res.status(201).json({
        success: true,
        data: branch,
        message: 'Sucursal creada exitosamente'
      });
    } catch (error) {
      console.error('Error creando sucursal:', error);

      // Manejar errores de validación únicos
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors.some(e => e.path === 'code')) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una sucursal con este código'
          });
        }
        if (error.errors.some(e => e.path === 'name')) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una sucursal con este nombre'
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar una sucursal
   * PUT /api/business/:businessId/branches/:branchId
   */
  async updateBranch(req, res) {
    try {
      const { businessId, branchId } = req.params;
      const updateData = req.body;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar sucursales'
        });
      }

      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      // Actualizar la sucursal
      await branch.update(updateData);

      res.json({
        success: true,
        data: branch,
        message: 'Sucursal actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando sucursal:', error);

      // Manejar errores de validación únicos
      if (error.name === 'SequelizeUniqueConstraintError') {
        if (error.errors.some(e => e.path === 'code')) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una sucursal con este código'
          });
        }
        if (error.errors.some(e => e.path === 'name')) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una sucursal con este nombre'
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Desactivar una sucursal (soft delete)
   * DELETE /api/business/:businessId/branches/:branchId
   */
  async deleteBranch(req, res) {
    try {
      const { businessId, branchId } = req.params;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar sucursales'
        });
      }

      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      // Desactivar la sucursal (soft delete)
      await branch.update({ status: 'INACTIVE' });

      res.json({
        success: true,
        message: 'Sucursal desactivada exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando sucursal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Asignar especialistas a una sucursal
   * POST /api/business/:businessId/branches/:branchId/specialists
   */
  async assignSpecialists(req, res) {
    try {
      const { businessId, branchId } = req.params;
      const { specialistIds } = req.body;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para asignar especialistas'
        });
      }

      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      // Verificar que los especialistas existen y pertenecen al negocio
      const specialists = await SpecialistProfile.findAll({
        where: {
          id: { [Op.in]: specialistIds },
          businessId
        }
      });

      if (specialists.length !== specialistIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Uno o más especialistas no existen o no pertenecen a este negocio'
        });
      }

      // Asignar especialistas a la sucursal
      await branch.setSpecialists(specialists);

      res.json({
        success: true,
        message: 'Especialistas asignados exitosamente'
      });
    } catch (error) {
      console.error('Error asignando especialistas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener especialistas de una sucursal
   * GET /api/business/:businessId/branches/:branchId/specialists
   */
  async getBranchSpecialists(req, res) {
    try {
      const { businessId, branchId } = req.params;

      // Verificar que el usuario pertenece al negocio
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const branch = await Branch.findOne({
        where: { id: branchId, businessId },
        include: [
          {
            model: SpecialistProfile,
            as: 'specialists',
            through: { attributes: [] },
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      res.json({
        success: true,
        data: branch.specialists
      });
    } catch (error) {
      console.error('Error obteniendo especialistas de sucursal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear horario de especialista en sucursal
   * POST /api/business/:businessId/branches/:branchId/schedules
   */
  async createSpecialistSchedule(req, res) {
    try {
      const { businessId, branchId } = req.params;
      const { specialistId, dayOfWeek, startTime, endTime, priority, isActive } = req.body;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para gestionar horarios'
        });
      }

      // Verificar que la sucursal existe
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada'
        });
      }

      // Verificar que el especialista existe y pertenece al negocio
      const specialist = await SpecialistProfile.findOne({
        where: { id: specialistId, businessId }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          message: 'Especialista no encontrado'
        });
      }

      // Verificar que no haya conflicto de horarios
      const conflictingSchedule = await SpecialistBranchSchedule.findOne({
        where: {
          specialistId: specialistId,
          branchId,
          dayOfWeek,
          isActive: true
        }
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un horario activo para este especialista en esta sucursal el mismo día'
        });
      }

      // Crear el horario
      const schedule = await SpecialistBranchSchedule.create({
        specialistId: specialistId,
        branchId,
        dayOfWeek,
        startTime,
        endTime,
        priority: priority || 1,
        isActive: isActive !== undefined ? isActive : true
      });

      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Horario creado exitosamente'
      });
    } catch (error) {
      console.error('Error creando horario:', error);

      // Manejar errores de validación
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos: ' + error.errors.map(e => e.message).join(', ')
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar horario de especialista en sucursal
   * PUT /api/business/:businessId/branches/:branchId/schedules/:scheduleId
   */
  async updateSpecialistSchedule(req, res) {
    try {
      const { businessId, branchId, scheduleId } = req.params;
      const updateData = req.body;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para gestionar horarios'
        });
      }

      const schedule = await SpecialistBranchSchedule.findOne({
        where: {
          id: scheduleId,
          branchId
        },
        include: [{
          model: Branch,
          as: 'branch',
          where: { businessId },
          required: true
        }]
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Horario no encontrado'
        });
      }

      // Si se está actualizando el día de la semana, verificar conflictos
      if (updateData.dayOfWeek !== undefined || updateData.specialistId !== undefined) {
        const conflictCheck = await SpecialistBranchSchedule.findOne({
          where: {
            specialistId: updateData.specialistId || schedule.specialistId,
            branchId,
            dayOfWeek: updateData.dayOfWeek || schedule.dayOfWeek,
            isActive: true,
            id: { [Op.ne]: scheduleId } // Excluir el horario actual
          }
        });

        if (conflictCheck) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un horario activo para este especialista en esta sucursal el mismo día'
          });
        }
      }

      // Actualizar el horario
      await schedule.update(updateData);

      res.json({
        success: true,
        data: schedule,
        message: 'Horario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando horario:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos: ' + error.errors.map(e => e.message).join(', ')
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener horarios de especialistas en una sucursal
   * GET /api/business/:businessId/branches/:branchId/schedules
   */
  async getBranchSchedules(req, res) {
    try {
      const { businessId, branchId } = req.params;
      const { specialistId, dayOfWeek, isActive } = req.query;

      // Verificar que el usuario pertenece al negocio
      if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const where = { branchId };

      // Filtros opcionales
      if (specialistId) {
        where.specialistId = specialistId;
      }

      if (dayOfWeek !== undefined) {
        where.dayOfWeek = dayOfWeek;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const schedules = await SpecialistBranchSchedule.findAll({
        where,
        include: [
          {
            model: SpecialistProfile,
            as: 'specialist',
            include: [{
              model: require('../models').User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }]
          },
          {
            model: Branch,
            as: 'branch',
            where: { businessId },
            required: true
          }
        ],
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar horario de especialista en sucursal
   * DELETE /api/business/:businessId/branches/:branchId/schedules/:scheduleId
   */
  async deleteSpecialistSchedule(req, res) {
    try {
      const { businessId, branchId, scheduleId } = req.params;

      // Verificar permisos de administración
      if (req.user.businessId !== businessId || !['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar horarios'
        });
      }

      const schedule = await SpecialistBranchSchedule.findOne({
        where: {
          id: scheduleId,
          branchId
        },
        include: [{
          model: Branch,
          where: { businessId },
          required: true
        }]
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Horario no encontrado'
        });
      }

      // Eliminar el horario
      await schedule.destroy();

      res.json({
        success: true,
        message: 'Horario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando horario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new BranchController();