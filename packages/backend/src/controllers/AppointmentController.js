const { 
  Appointment, 
  Service, 
  Client, 
  SpecialistProfile, 
  User,
  Business,
  SpecialistService,
  UserBranch
} = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para gestión de citas
 * Permite a especialistas y recepcionistas gestionar citas con diferentes niveles de acceso
 */
class AppointmentController {

  /**
   * Obtener lista de citas
   * GET /api/appointments?businessId={bizId}
   * - SPECIALIST: Solo sus propias citas
   * - RECEPTIONIST: Todas las citas del negocio
   */
  static async getAppointments(req, res) {
    try {
      const { businessId } = req.query;
      
      const {
        page = 1,
        limit = 10,
        status,
        specialistId,
        date,
        startDate,
        endDate,
        branchId
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { businessId };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        // SPECIALIST: Solo sus propias citas
        where.specialistId = req.specialist.id;
        
        // Si el especialista tiene asignadas varias sucursales, filtrar por ellas
        if (req.user.branchIds && req.user.branchIds.length > 0) {
          where.branchId = {
            [Op.in]: req.user.branchIds
          };
        }
      } else if (req.receptionist) {
        // RECEPTIONIST: Puede especificar especialista o ver todas
        if (specialistId) {
          where.specialistId = specialistId;
        }
        
        // Si el recepcionista tiene asignadas varias sucursales, filtrar por ellas
        if (req.user.branchIds && req.user.branchIds.length > 0) {
          where.branchId = {
            [Op.in]: req.user.branchIds
          };
        }
      }

      // Filtro opcional por sucursal específica (sobrescribe el filtro multi-branch)
      if (branchId) {
        where.branchId = branchId;
      }

      // Filtros adicionales
      if (status) {
        where.status = status;
      }

      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        };
      } else if (startDate && endDate) {
        where.startTime = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
      }

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo citas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener detalle de una cita específica
   * GET /api/appointments/:appointmentId?businessId={bizId}
   */
  static async getAppointmentDetail(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({
        where,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'description', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'dateOfBirth']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'phone'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization', 'experience']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address'],
            required: false
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        data: appointment
      });

    } catch (error) {
      console.error('Error obteniendo detalle de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva cita
   * POST /api/appointments
   * Solo para RECEPTIONIST (los especialistas no crean citas)
   */
  static async createAppointment(req, res) {
    try {
      // Solo recepcionistas pueden crear citas
      if (!req.receptionist) {
        return res.status(403).json({
          success: false,
          error: 'Solo recepcionistas pueden crear citas'
        });
      }

      const { businessId } = req.body;
      const {
        clientId,
        specialistId,
        serviceId,
        startTime,
        endTime,
        notes,
        clientNotes,
        branchId
      } = req.body;

      // Validar que el especialista pertenezca al negocio
      const specialist = await User.findOne({
        where: {
          id: specialistId,
          businessId,
          role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] },
          status: 'ACTIVE'
        }
      });

      if (!specialist) {
        return res.status(400).json({
          success: false,
          error: 'Especialista no válido para este negocio'
        });
      }

      // Validar que el servicio pertenezca al negocio
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId,
          isActive: true
        }
      });

      if (!service) {
        return res.status(400).json({
          success: false,
          error: 'Servicio no válido para este negocio'
        });
      }

      // Validar que el cliente exista
      const client = await Client.findOne({
        where: { id: clientId }
      });

      if (!client) {
        return res.status(400).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      // Validar sucursal si se proporciona
      if (branchId) {
        const Branch = require('../models/Branch');
        const branch = await Branch.findOne({
          where: {
            id: branchId,
            businessId,
            isActive: true
          }
        });

        if (!branch) {
          return res.status(400).json({
            success: false,
            error: 'Sucursal no válida para este negocio'
          });
        }

        // Verificar que el especialista tenga acceso a esa sucursal
        const specialistBranchAccess = await UserBranch.findOne({
          where: {
            userId: specialistId,
            branchId: branchId
          }
        });

        if (!specialistBranchAccess) {
          return res.status(400).json({
            success: false,
            error: 'El especialista no tiene acceso a la sucursal seleccionada'
          });
        }
      }

      // Verificar disponibilidad del especialista
      const conflictingAppointment = await Appointment.findOne({
        where: {
          specialistId,
          businessId,
          status: {
            [Op.notIn]: ['CANCELED', 'COMPLETED']
          },
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [new Date(startTime), new Date(endTime)]
              }
            },
            {
              endTime: {
                [Op.between]: [new Date(startTime), new Date(endTime)]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: new Date(startTime) } },
                { endTime: { [Op.gte]: new Date(endTime) } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          error: 'El especialista no está disponible en ese horario'
        });
      }

      // Consultar precio personalizado del especialista para este servicio
      const specialistService = await SpecialistService.findOne({
        where: {
          specialistId,
          serviceId,
          isActive: true
        }
      });

      // Usar precio personalizado si existe, sino usar el precio del servicio
      const finalPrice = specialistService && specialistService.customPrice !== null 
        ? specialistService.customPrice 
        : service.price;

      // Generar número de cita único
      const appointmentNumber = `CITA-${Date.now()}`;

      // Crear la cita
      const appointment = await Appointment.create({
        businessId,
        clientId,
        specialistId,
        serviceId,
        branchId: branchId || null, // Campo opcional
        appointmentNumber,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalAmount: finalPrice,
        status: 'PENDING',
        notes,
        clientNotes
      });

      // Obtener la cita creada con relaciones
      const createdAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: createdAppointment
      });

    } catch (error) {
      console.error('Error creando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado de cita
   * PATCH /api/appointments/:appointmentId/status
   */
  static async updateAppointmentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const { status, notes, cancelReason } = req.body;

      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
        
        // Validar estados permitidos para especialista
        const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: 'Estado no válido para especialista'
          });
        }
      }

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Preparar datos de actualización
      const updateData = { status };
      
      if (notes) {
        if (req.specialist) {
          updateData.specialistNotes = notes;
        } else if (req.receptionist) {
          updateData.notes = notes;
        }
      }

      if (cancelReason && status === 'CANCELED') {
        updateData.cancelReason = cancelReason;
        updateData.canceledAt = new Date();
        updateData.canceledBy = req.user.id;
      }

      // Agregar timestamps según el estado
      switch (status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'IN_PROGRESS':
          updateData.startedAt = new Date();
          break;
        case 'COMPLETED':
          updateData.completedAt = new Date();
          break;
      }

      await appointment.update(updateData);

      res.json({
        success: true,
        message: 'Estado de la cita actualizado exitosamente',
        data: appointment
      });

    } catch (error) {
      console.error('Error actualizando estado de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancelar cita
   * DELETE /api/appointments/:appointmentId
   */
  static async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const { cancelReason } = req.body;

      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Verificar si la cita se puede cancelar
      if (['COMPLETED', 'CANCELED'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          error: 'No se puede cancelar una cita que ya está completada o cancelada'
        });
      }

      // Actualizar estado a cancelado
      await appointment.update({
        status: 'CANCELED',
        cancelReason: cancelReason || 'Cancelada por usuario',
        canceledAt: new Date(),
        canceledBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: appointment
      });

    } catch (error) {
      console.error('Error cancelando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar cita
   * PUT /api/appointments/:id
   * Permite modificar horario, servicio, especialista, etc.
   * 
   * VALIDACIONES INTEGRADAS:
   * - Estado de la cita (no completadas ni canceladas)
   * - Disponibilidad si cambia horario
   * - Permisos del usuario
   */
  static async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;
      const {
        startTime,
        endTime,
        serviceId,
        specialistId,
        notes,
        clientNotes,
        branchId
      } = req.body;

      const where = {
        id,
        businessId
      };

      // Solo recepcionistas pueden actualizar citas
      if (!req.receptionist) {
        return res.status(403).json({
          success: false,
          error: 'Solo recepcionistas pueden actualizar citas'
        });
      }

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // ✅ VALIDACIÓN INTEGRADA: Reglas de Actualización
      const BusinessRuleService = require('../services/BusinessRuleService');
      
      const validation = await BusinessRuleService.validateAppointmentUpdate(
        appointment,
        req.body
      );

      if (!validation.canUpdate) {
        return res.status(400).json({
          success: false,
          error: 'No se puede actualizar la cita',
          validationErrors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Preparar datos de actualización
      const updateData = {};

      // Si cambia el horario, validar disponibilidad
      if (startTime && endTime) {
        const targetSpecialistId = specialistId || appointment.specialistId;
        
        // Verificar disponibilidad del especialista en el nuevo horario
        const conflictingAppointment = await Appointment.findOne({
          where: {
            id: { [Op.ne]: id }, // Excluir la cita actual
            specialistId: targetSpecialistId,
            businessId,
            status: {
              [Op.notIn]: ['CANCELED', 'NO_SHOW']
            },
            [Op.or]: [
              {
                startTime: {
                  [Op.between]: [new Date(startTime), new Date(endTime)]
                }
              },
              {
                endTime: {
                  [Op.between]: [new Date(startTime), new Date(endTime)]
                }
              },
              {
                [Op.and]: [
                  { startTime: { [Op.lte]: new Date(startTime) } },
                  { endTime: { [Op.gte]: new Date(endTime) } }
                ]
              }
            ]
          }
        });

        if (conflictingAppointment) {
          return res.status(400).json({
            success: false,
            error: 'El especialista no está disponible en ese horario'
          });
        }

        updateData.startTime = new Date(startTime);
        updateData.endTime = new Date(endTime);
      }

      // Si cambia el servicio, actualizar precio
      if (serviceId && serviceId !== appointment.serviceId) {
        const service = await Service.findOne({
          where: {
            id: serviceId,
            businessId,
            isActive: true
          }
        });

        if (!service) {
          return res.status(400).json({
            success: false,
            error: 'Servicio no válido'
          });
        }

        const targetSpecialistId = specialistId || appointment.specialistId;

        // Consultar precio personalizado del especialista
        const specialistService = await SpecialistService.findOne({
          where: {
            specialistId: targetSpecialistId,
            serviceId,
            isActive: true
          }
        });

        const finalPrice = specialistService && specialistService.customPrice !== null
          ? specialistService.customPrice
          : service.price;

        updateData.serviceId = serviceId;
        updateData.totalAmount = finalPrice;
      }

      // Si cambia el especialista
      if (specialistId && specialistId !== appointment.specialistId) {
        const specialist = await User.findOne({
          where: {
            id: specialistId,
            businessId,
            role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] },
            status: 'ACTIVE'
          }
        });

        if (!specialist) {
          return res.status(400).json({
            success: false,
            error: 'Especialista no válido'
          });
        }

        // Si hay sucursal, validar que el especialista tenga acceso
        if (branchId || appointment.branchId) {
          const targetBranchId = branchId || appointment.branchId;
          const specialistBranchAccess = await UserBranch.findOne({
            where: {
              userId: specialistId,
              branchId: targetBranchId
            }
          });

          if (!specialistBranchAccess) {
            return res.status(400).json({
              success: false,
              error: 'El especialista no tiene acceso a esta sucursal'
            });
          }
        }

        updateData.specialistId = specialistId;
      }

      // Actualizar sucursal si se proporciona
      if (branchId !== undefined) {
        if (branchId) {
          const Branch = require('../models/Branch');
          const branch = await Branch.findOne({
            where: {
              id: branchId,
              businessId,
              status: 'ACTIVE'
            }
          });

          if (!branch) {
            return res.status(400).json({
              success: false,
              error: 'Sucursal no válida'
            });
          }
        }
        updateData.branchId = branchId;
      }

      // Actualizar notas
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (clientNotes !== undefined) {
        updateData.clientNotes = clientNotes;
      }

      // Actualizar la cita
      await appointment.update(updateData);

      // Obtener la cita actualizada con relaciones
      const updatedAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cita actualizada exitosamente',
        data: updatedAppointment
      });

    } catch (error) {
      console.error('Error actualizando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Completar cita
   * PATCH /api/appointments/:id/complete
   * Marca la cita como completada y calcula comisión si está configurada
   * 
   * VALIDACIONES INTEGRADAS:
   * - Consentimiento firmado (si el servicio lo requiere)
   * - Reglas de negocio (evidencia fotográfica, pago, etc.)
   * - Estado de la cita
   */
  static async completeAppointment(req, res) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;
      const { rating, feedback, finalAmount } = req.body;

      const where = {
        id,
        businessId
      };

      // Solo especialistas pueden completar sus propias citas
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({ 
        where,
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'requiresConsent', 'consentTemplateId']
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Validar que la cita esté en progreso o confirmada
      if (!['CONFIRMED', 'IN_PROGRESS'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          error: 'Solo se pueden completar citas confirmadas o en progreso'
        });
      }

      // ✅ VALIDACIÓN INTEGRADA: Reglas de Negocio + Consentimiento
      const BusinessRuleService = require('../services/BusinessRuleService');
      
      const validation = await BusinessRuleService.validateAppointmentCompletion(
        appointment.id,
        businessId
      );

      if (!validation.canComplete) {
        return res.status(400).json({
          success: false,
          error: 'No se puede completar la cita',
          validationErrors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Si hay warnings, incluirlos en la respuesta pero continuar
      const hasWarnings = validation.warnings && validation.warnings.length > 0;

      // Preparar datos de actualización
      const updateData = {
        status: 'COMPLETED',
        completedAt: new Date()
      };

      // Actualizar monto final si se proporciona
      if (finalAmount !== undefined) {
        updateData.totalAmount = finalAmount;
      }

      // Actualizar rating y feedback si se proporcionan
      if (rating !== undefined) {
        updateData.rating = rating;
      }

      if (feedback !== undefined) {
        updateData.feedback = feedback;
      }

      // Calcular comisión si está configurada
      try {
        const ServiceCommission = require('../models/ServiceCommission');
        const BusinessCommissionConfig = require('../models/BusinessCommissionConfig');

        // Buscar comisión específica del servicio
        const serviceCommission = await ServiceCommission.findOne({
          where: {
            businessId,
            serviceId: appointment.serviceId,
            isActive: true
          }
        });

        let specialistPercentage = null;
        let businessPercentage = null;

        if (serviceCommission) {
          // Usar configuración específica del servicio
          specialistPercentage = serviceCommission.specialistPercentage;
          businessPercentage = serviceCommission.businessPercentage;
        } else {
          // Usar configuración global del negocio
          const businessConfig = await BusinessCommissionConfig.findOne({
            where: {
              businessId,
              isActive: true
            }
          });

          if (businessConfig) {
            specialistPercentage = businessConfig.defaultSpecialistPercentage;
            businessPercentage = businessConfig.defaultBusinessPercentage;
          }
        }

        // Si hay configuración de comisión, calcularla
        if (specialistPercentage !== null && businessPercentage !== null) {
          const amount = finalAmount !== undefined ? finalAmount : appointment.totalAmount;
          const specialistCommission = (amount * specialistPercentage) / 100;
          const businessCommission = (amount * businessPercentage) / 100;

          updateData.specialistCommission = specialistCommission;
          updateData.businessCommission = businessCommission;
        }
      } catch (commissionError) {
        console.warn('Error calculando comisión (continuando sin comisión):', commissionError);
        // Continuar sin comisión si hay error
      }

      // Actualizar la cita
      await appointment.update(updateData);

      // Obtener la cita actualizada con relaciones
      const completedAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cita completada exitosamente',
        data: completedAppointment
      });

    } catch (error) {
      console.error('Error completando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Reprogramar cita
   * POST /api/appointments/:id/reschedule
   * Cambia el horario de la cita y registra en historial
   * 
   * VALIDACIONES INTEGRADAS:
   * - Estado de la cita (no completadas ni canceladas)
   * - Disponibilidad del especialista
   * - Fecha en el futuro
   */
  static async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;
      const { newStartTime, newEndTime, reason } = req.body;

      if (!newStartTime || !newEndTime) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren newStartTime y newEndTime'
        });
      }

      const where = {
        id,
        businessId
      };

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // ✅ VALIDACIÓN INTEGRADA: Reglas de Reprogramación
      const BusinessRuleService = require('../services/BusinessRuleService');
      
      const validation = await BusinessRuleService.validateReschedule(
        appointment,
        newStartTime
      );

      if (!validation.canReschedule) {
        return res.status(400).json({
          success: false,
          error: 'No se puede reprogramar la cita',
          validationErrors: validation.errors,
          warnings: validation.warnings
        });
      }

      // Verificar disponibilidad del especialista en el nuevo horario
      const conflictingAppointment = await Appointment.findOne({
        where: {
          id: { [Op.ne]: id }, // Excluir la cita actual
          specialistId: appointment.specialistId,
          businessId,
          status: {
            [Op.notIn]: ['CANCELED', 'NO_SHOW']
          },
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [new Date(newStartTime), new Date(newEndTime)]
              }
            },
            {
              endTime: {
                [Op.between]: [new Date(newStartTime), new Date(newEndTime)]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: new Date(newStartTime) } },
                { endTime: { [Op.gte]: new Date(newEndTime) } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          error: 'El especialista no está disponible en el nuevo horario',
          conflictingAppointment: {
            id: conflictingAppointment.id,
            startTime: conflictingAppointment.startTime,
            endTime: conflictingAppointment.endTime
          }
        });
      }

      // Guardar historial de reprogramación
      const rescheduleHistory = appointment.rescheduleHistory || [];
      rescheduleHistory.push({
        oldStartTime: appointment.startTime,
        oldEndTime: appointment.endTime,
        newStartTime: new Date(newStartTime),
        newEndTime: new Date(newEndTime),
        reason: reason || 'No especificada',
        rescheduledBy: req.user.id,
        rescheduledAt: new Date()
      });

      // Actualizar la cita
      await appointment.update({
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        rescheduleHistory,
        status: 'RESCHEDULED' // Opcional: cambiar estado a RESCHEDULED
      });

      // Obtener la cita actualizada con relaciones
      const updatedAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              attributes: ['specialization']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cita reprogramada exitosamente',
        data: updatedAppointment,
        warnings: validation.warnings
      });

    } catch (error) {
      console.error('Error reprogramando cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir evidencia (fotos antes/después)
   * POST /api/appointments/:id/evidence
   * Requiere multer para manejo de archivos
   */
  static async uploadEvidence(req, res) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;
      const { type } = req.body; // 'before' o 'after'

      if (!type || !['before', 'after', 'documents'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de evidencia inválido. Debe ser: before, after o documents'
        });
      }

      const where = {
        id,
        businessId
      };

      // Solo el especialista asignado puede subir evidencia
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({ where });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Validar que la cita esté en progreso o completada
      if (!['IN_PROGRESS', 'COMPLETED'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          error: 'Solo se puede subir evidencia de citas en progreso o completadas'
        });
      }

      // Verificar que se hayan subido archivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se han proporcionado archivos'
        });
      }

      // Procesar archivos subidos
      const evidence = appointment.evidence || { before: [], after: [], documents: [] };
      
      // Guardar rutas de archivos (asumiendo que multer guarda en uploads/)
      const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
      
      // Agregar URLs al array correspondiente
      if (type === 'before') {
        evidence.before = [...evidence.before, ...fileUrls];
      } else if (type === 'after') {
        evidence.after = [...evidence.after, ...fileUrls];
      } else if (type === 'documents') {
        evidence.documents = [...evidence.documents, ...fileUrls];
      }

      // Actualizar la cita
      await appointment.update({ evidence });

      res.json({
        success: true,
        message: `Evidencia ${type} subida exitosamente`,
        data: {
          appointmentId: appointment.id,
          evidence,
          uploadedFiles: fileUrls
        }
      });

    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = AppointmentController;