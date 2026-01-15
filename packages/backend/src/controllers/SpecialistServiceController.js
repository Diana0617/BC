const { SpecialistService, SpecialistProfile, User, Service } = require('../models');
const { Op } = require('sequelize');

class SpecialistServiceController {
  /**
   * @swagger
   * /api/specialists/{specialistId}/services:
   *   get:
   *     summary: Obtener servicios asignados a un especialista
   *     tags: [Specialist Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: specialistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del especialista
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filtrar por servicios activos/inactivos
   *     responses:
   *       200:
   *         description: Lista de servicios del especialista
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Especialista no encontrado
   */
  static async getSpecialistServices(req, res) {
    console.log('🔍 getSpecialistServices called with params:', req.params);
    console.log('🔍 User:', req.user);
    
    try {
      const { businessId, specialistId } = req.params;
      const { isActive } = req.query;
      const { id: userId, role, businessId: userBusinessId } = req.user; // Usar 'id' en lugar de 'userId'

      // Validar que el businessId del path coincida con el del usuario (seguridad)
      if (userBusinessId && businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este negocio'
        });
      }

      // El specialistId puede ser:
      // 1. userId (para BUSINESS, BUSINESS_SPECIALIST)
      // 2. specialistProfileId (para SPECIALIST, RECEPTIONIST_SPECIALIST)
      
      // Intentar encontrar por userId primero (para roles de staff que usan su propio userId)
      let specialist = await SpecialistProfile.findOne({
        where: {
          userId: specialistId,
          businessId: businessId || userBusinessId
        }
      });

      // Si no se encuentra, intentar por specialistProfileId
      if (!specialist) {
        specialist = await SpecialistProfile.findOne({
          where: {
            id: specialistId,
            businessId: businessId || userBusinessId
          }
        });
      }

      // Si aún no existe, verificar si es un usuario BUSINESS/BUSINESS_SPECIALIST sin SpecialistProfile
      let targetUserId = null;
      
      if (!specialist) {
        // Verificar si el specialistId es directamente un userId de BUSINESS o BUSINESS_SPECIALIST
        const staffUser = await User.findOne({
          where: {
            id: specialistId,
            businessId: businessId || userBusinessId,
            role: { [Op.in]: ['BUSINESS', 'BUSINESS_SPECIALIST'] },
            status: 'ACTIVE'
          }
        });
        
        if (staffUser) {
          console.log('✅ Staff user (BUSINESS/BUSINESS_SPECIALIST) detectado:', staffUser.role);
          targetUserId = staffUser.id;
        } else {
          return res.status(404).json({
            success: false,
            error: 'Especialista no encontrado'
          });
        }
      } else {
        targetUserId = specialist.userId;
      }

      // Solo el especialista mismo, BUSINESS u OWNER pueden ver
      // Permitir también a RECEPTIONIST y otros roles de staff
      const allowedRoles = ['BUSINESS', 'OWNER', 'RECEPTIONIST', 'BUSINESS_SPECIALIST', 'SPECIALIST'];
      const isAllowedRole = allowedRoles.includes(role);
      const isOwnProfile = userId === targetUserId;
      
      if (!isAllowedRole && !isOwnProfile) {
        console.log('❌ Acceso denegado - Role:', role, 'UserId:', userId, 'Target userId:', targetUserId);
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para ver estos servicios',
          debug: { role, userId, targetUserId }
        });
      }

      console.log('✅ Acceso permitido - Role:', role, 'IsOwnProfile:', isOwnProfile);

      // Buscar servicios del especialista en SpecialistService
      // ⚠️ IMPORTANTE: Ahora TODOS los roles (incluyendo BUSINESS) deben tener servicios asignados
      const whereClause = { specialistId: targetUserId };
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const specialistServices = await SpecialistService.findAll({
        where: whereClause,
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'price', 'duration', 'category']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log(`✅ Found ${specialistServices.length} services for specialist ${targetUserId}`);

      return res.status(200).json({
        success: true,
        data: specialistServices
      });
    } catch (error) {
      console.error('Error en getSpecialistServices:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener servicios del especialista',
        details: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/specialists/{specialistId}/services:
   *   post:
   *     summary: Asignar un servicio a un especialista
   *     tags: [Specialist Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: specialistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del especialista
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - serviceId
   *             properties:
   *               serviceId:
   *                 type: integer
   *               customPrice:
   *                 type: number
   *                 format: float
   *                 nullable: true
   *               skillLevel:
   *                 type: string
   *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED, EXPERT]
   *               averageDuration:
   *                 type: integer
   *                 nullable: true
   *               commissionPercentage:
   *                 type: number
   *                 format: float
   *                 default: 0
   *               canBeBooked:
   *                 type: boolean
   *                 default: true
   *               requiresApproval:
   *                 type: boolean
   *                 default: false
   *               maxBookingsPerDay:
   *                 type: integer
   *                 nullable: true
   *               notes:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Servicio asignado exitosamente
   *       400:
   *         description: Datos inválidos
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Especialista o servicio no encontrado
   *       409:
   *         description: El servicio ya está asignado al especialista
   */
  static async assignService(req, res) {
    console.log('🔍 assignService called with params:', req.params);
    console.log('🔍 Body:', req.body);
    console.log('🔍 User:', req.user);
    
    try {
      const { businessId, specialistId } = req.params;
      const { userId, role, businessId: userBusinessId } = req.user;
      const {
        serviceId,
        customPrice = null,
        skillLevel = 'INTERMEDIATE',
        averageDuration = null,
        commissionPercentage = 0,
        canBeBooked = true,
        requiresApproval = false,
        maxBookingsPerDay = null,
        notes = null
      } = req.body;

      // Validar que el businessId del path coincida con el del usuario (seguridad)
      if (userBusinessId && businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este negocio'
        });
      }

      // Solo BUSINESS u OWNER pueden asignar servicios
      if (!['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para asignar servicios'
        });
      }

      // Verificar que el especialista existe y pertenece al negocio
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: businessId || userBusinessId
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
        });
      }

      // Verificar que el servicio existe y pertenece al negocio
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId: businessId || userBusinessId
        }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Servicio no encontrado'
        });
      }

      // Verificar si ya existe la asignación
      const existingAssignment = await SpecialistService.findOne({
        where: {
          specialistId,
          serviceId
        }
      });

      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          error: 'El servicio ya está asignado a este especialista'
        });
      }

      // Crear la asignación (usar specialist.userId ya que specialistId en la tabla apunta a users)
      const specialistService = await SpecialistService.create({
        specialistId: specialist.userId, // ⚠️ IMPORTANTE: usar userId del perfil
        serviceId,
        customPrice,
        skillLevel,
        averageDuration,
        commissionPercentage,
        canBeBooked,
        requiresApproval,
        maxBookingsPerDay,
        assignedBy: userId,
        notes
      });

      // Recargar con datos del servicio
      await specialistService.reload({
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'price', 'duration']
          }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Servicio asignado exitosamente',
        data: specialistService
      });
    } catch (error) {
      console.error('Error en assignServiceToSpecialist:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al asignar servicio',
        details: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/specialists/{specialistId}/services/{serviceId}:
   *   put:
   *     summary: Actualizar configuración de un servicio del especialista
   *     tags: [Specialist Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: specialistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del especialista
   *       - in: path
   *         name: serviceId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               customPrice:
   *                 type: number
   *                 format: float
   *                 nullable: true
   *               isActive:
   *                 type: boolean
   *               skillLevel:
   *                 type: string
   *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED, EXPERT]
   *               averageDuration:
   *                 type: integer
   *                 nullable: true
   *               commissionPercentage:
   *                 type: number
   *                 format: float
   *               canBeBooked:
   *                 type: boolean
   *               requiresApproval:
   *                 type: boolean
   *               maxBookingsPerDay:
   *                 type: integer
   *                 nullable: true
   *               notes:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Servicio actualizado exitosamente
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Asignación no encontrada
   */
  static async updateSpecialistService(req, res) {
    try {
      const { businessId, specialistId, serviceId } = req.params;
      const { role, businessId: userBusinessId } = req.user;
      const updateData = req.body;

      // Validar que el businessId del path coincida con el del usuario (seguridad)
      if (userBusinessId && businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este negocio'
        });
      }

      // Solo BUSINESS u OWNER pueden actualizar
      if (!['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para actualizar servicios'
        });
      }

      // Verificar que el especialista pertenece al negocio
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: businessId || userBusinessId
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
        });
      }

      // Buscar la asignación (usar specialist.userId ya que specialistId en la tabla apunta a users)
      const specialistService = await SpecialistService.findOne({
        where: {
          specialistId: specialist.userId,
          serviceId
        }
      });

      if (!specialistService) {
        return res.status(404).json({
          success: false,
          error: 'Servicio no asignado a este especialista'
        });
      }

      // Actualizar
      await specialistService.update(updateData);

      // Recargar con datos del servicio
      await specialistService.reload({
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'price', 'duration']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: specialistService
      });
    } catch (error) {
      console.error('Error en updateSpecialistService:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar servicio',
        details: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/specialists/{specialistId}/services/{serviceId}:
   *   delete:
   *     summary: Eliminar un servicio del especialista
   *     tags: [Specialist Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: specialistId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del especialista
   *       - in: path
   *         name: serviceId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio
   *     responses:
   *       200:
   *         description: Servicio eliminado exitosamente
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Asignación no encontrada
   */
  static async removeService(req, res) {
    try {
      const { businessId, specialistId, serviceId } = req.params;
      const { role, businessId: userBusinessId } = req.user;

      // Validar que el businessId del path coincida con el del usuario (seguridad)
      if (userBusinessId && businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este negocio'
        });
      }

      // Solo BUSINESS u OWNER pueden eliminar
      if (!['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para eliminar servicios'
        });
      }

      // Verificar que el especialista pertenece al negocio
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: businessId || userBusinessId
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
        });
      }

      // Buscar la asignación (usar specialist.userId ya que specialistId en la tabla apunta a users)
      const specialistService = await SpecialistService.findOne({
        where: {
          specialistId: specialist.userId,
          serviceId
        }
      });

      if (!specialistService) {
        return res.status(404).json({
          success: false,
          error: 'Servicio no asignado a este especialista'
        });
      }

      // Eliminar (soft delete marcando como inactivo podría ser mejor)
      await specialistService.destroy();

      return res.status(200).json({
        success: true,
        message: 'Servicio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en removeServiceFromSpecialist:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar servicio',
        details: error.message
      });
    }
  }

  /**
   * Activar/Desactivar servicio del especialista
   */
  static async toggleServiceStatus(req, res) {
    try {
      const { businessId, specialistId, serviceId } = req.params;
      const { role, businessId: userBusinessId } = req.user;
      const { isActive } = req.body;

      // Validar que el businessId del path coincida con el del usuario (seguridad)
      if (userBusinessId && businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este negocio'
        });
      }

      // Solo BUSINESS u OWNER pueden cambiar estado
      if (!['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER'].includes(role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para cambiar el estado de servicios'
        });
      }

      // Verificar que el especialista pertenece al negocio
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: businessId || userBusinessId
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
        });
      }

      // Buscar la asignación (usar specialist.userId ya que specialistId en la tabla apunta a users)
      const specialistService = await SpecialistService.findOne({
        where: {
          specialistId: specialist.userId,
          serviceId
        }
      });

      if (!specialistService) {
        return res.status(404).json({
          success: false,
          error: 'Servicio no asignado a este especialista'
        });
      }

      // Actualizar estado
      await specialistService.update({ isActive });

      // Recargar con datos del servicio
      await specialistService.reload({
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'price', 'duration']
          }
        ]
      });

      return res.status(200).json({
        success: true,
        message: `Servicio ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: specialistService
      });
    } catch (error) {
      console.error('Error en toggleServiceStatus:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al cambiar estado del servicio',
        details: error.message
      });
    }
  }
}

module.exports = SpecialistServiceController;
