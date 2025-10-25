const { 
  Appointment, 
  Service, 
  Client, 
  SpecialistProfile, 
  User,
  Business,
  Branch,
  SpecialistService,
  UserBranch,
  BusinessClient
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
        console.log('📅 Buscando citas entre:', {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      }

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
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

      console.log(`✅ Encontradas ${count} citas`);
      if (appointments.length > 0) {
        console.log('Primera cita:', {
          id: appointments[0].id,
          startTime: appointments[0].startTime,
          client: appointments[0].client?.firstName
        });
      }

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
            as: 'service',
            attributes: ['id', 'name', 'description', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'dateOfBirth']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'phone'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
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
   * Obtener citas por rango de fechas
   * GET /api/appointments/date-range?startDate={start}&endDate={end}&branchId={id}
   */
  static async getAppointmentsByDateRange(req, res) {
    try {
      const { businessId, startDate, endDate, branchId, specialistId } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate y endDate son requeridos'
        });
      }

      const where = {
        businessId,
        startTime: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        }
      };

      console.log('📅 Buscando citas por rango:', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        branchId,
        businessId
      });

      // Filtros opcionales
      if (branchId) {
        where.branchId = branchId;
      }

      if (specialistId) {
        where.specialistId = specialistId;
      }

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      } else if (req.receptionist && req.user.branchIds && req.user.branchIds.length > 0) {
        where.branchId = {
          [Op.in]: req.user.branchIds
        };
      }

      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
              attributes: ['id', 'specialization', 'profileImage']
            }]
          },
          {
            model: require('../models/Branch'),
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ],
        order: [['startTime', 'ASC']]
      });

      console.log(`✅ Encontradas ${appointments.length} citas en el rango`);
      if (appointments.length > 0) {
        console.log('Primera cita:', {
          id: appointments[0].id,
          startTime: appointments[0].startTime,
          clientName: `${appointments[0].client?.firstName} ${appointments[0].client?.lastName}`,
          serviceName: appointments[0].service?.name
        });
      }

      res.json({
        success: true,
        data: appointments
      });

    } catch (error) {
      console.error('Error obteniendo citas por rango de fechas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear nueva cita
   * POST /api/appointments
   * Permitido para: BUSINESS, RECEPTIONIST, RECEPTIONIST_SPECIALIST, SPECIALIST
   * NO permitido para: OWNER (dueño de la plataforma)
   */
  static async createAppointment(req, res) {
    try {
      // Verificar que el usuario NO sea OWNER de la plataforma
      if (req.user?.role === 'OWNER') {
        return res.status(403).json({
          success: false,
          error: 'Los propietarios de la plataforma no pueden crear citas de negocios'
        });
      }

      // Todos los demás roles (BUSINESS, RECEPTIONIST, SPECIALIST, etc.) pueden crear citas
      const { businessId } = req.body;
      const {
        clientId,
        clientName,
        clientPhone,
        clientEmail,
        specialistId,
        serviceId,
        startTime,
        endTime,
        notes,
        clientNotes,
        branchId
      } = req.body;

      // Buscar o crear cliente
      let client;
      if (clientId) {
        // Si viene clientId, validar que exista
        client = await Client.findOne({
          where: { id: clientId }
        });

        if (!client) {
          return res.status(400).json({
            success: false,
            error: 'Cliente no encontrado'
          });
        }
      } else if (clientEmail) {
        // Si viene email, buscar cliente por email (los clientes son compartidos entre negocios)
        client = await Client.findOne({
          where: { 
            email: clientEmail
          }
        });

        if (!client) {
          // Crear nuevo cliente
          console.log('📝 Creando nuevo cliente:', clientName, clientEmail);
          
          // Parsear nombre y apellido
          const nameParts = (clientName || '').trim().split(' ');
          const firstName = nameParts[0] || 'Cliente';
          const lastName = nameParts.slice(1).join(' ') || 'Nuevo';

          client = await Client.create({
            firstName,
            lastName,
            email: clientEmail,
            phone: clientPhone || null,
            status: 'ACTIVE'
          });

          console.log('✅ Cliente creado con ID:', client.id);
        } else {
          console.log('✅ Cliente existente encontrado:', client.id);
        }

        // Verificar si existe la relación BusinessClient, si no, crearla
        const businessClientRelation = await BusinessClient.findOne({
          where: {
            businessId,
            clientId: client.id
          }
        });

        if (!businessClientRelation) {
          console.log('📝 Creando relación Business-Client');
          await BusinessClient.create({
            businessId,
            clientId: client.id,
            status: 'ACTIVE',
            firstVisit: new Date()
          });
          console.log('✅ Relación Business-Client creada');
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar clientId o clientEmail'
        });
      }

      // Validar que el especialista pertenezca al negocio
      console.log('🔍 Buscando especialista:', { specialistId, businessId });
      
      // Primero buscar el SpecialistProfile para obtener el userId
      const SpecialistProfile = require('../models/SpecialistProfile');
      const specialistProfile = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId,
          isActive: true
        },
        include: [{
          model: User,
          as: 'user',
          where: {
            status: 'ACTIVE',
            role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] }
          }
        }]
      });

      if (!specialistProfile || !specialistProfile.user) {
        console.log('❌ Especialista no encontrado o no válido');
        return res.status(400).json({
          success: false,
          error: 'Especialista no válido para este negocio'
        });
      }
      
      const specialist = specialistProfile.user;
      console.log('✅ Especialista válido:', specialist.id);

      // Validar que el servicio pertenezca al negocio
      console.log('🔍 Buscando servicio:', { serviceId, businessId });
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId,
          isActive: true
        }
      });

      if (!service) {
        console.log('❌ Servicio no encontrado o no activo');
        return res.status(400).json({
          success: false,
          error: 'Servicio no válido para este negocio'
        });
      }
      console.log('✅ Servicio válido:', service.id);

      // Validar sucursal si se proporciona
      if (branchId) {
        console.log('🔍 Validando sucursal:', { branchId, businessId });
        const Branch = require('../models/Branch');
        const branch = await Branch.findOne({
          where: {
            id: branchId,
            businessId,
            status: 'ACTIVE' // Usar status en lugar de isActive
          }
        });

        if (!branch) {
          console.log('❌ Sucursal no encontrada o no activa');
          return res.status(400).json({
            success: false,
            error: 'Sucursal no válida para este negocio'
          });
        }

        console.log('🔍 Verificando acceso del especialista a la sucursal');
        // Verificar que el especialista tenga acceso a esa sucursal
        const specialistBranchAccess = await UserBranch.findOne({
          where: {
            userId: specialist.id, // Usar el User.id del especialista
            branchId: branchId
          }
        });

        if (!specialistBranchAccess) {
          console.log('❌ Especialista sin acceso a la sucursal');
          return res.status(400).json({
            success: false,
            error: 'El especialista no tiene acceso a la sucursal seleccionada'
          });
        }
        console.log('✅ Especialista tiene acceso a la sucursal');
      }

      // ✅ NUEVA VALIDACIÓN: Verificar que el especialista tenga horario configurado
      const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
      const appointmentDate = new Date(startTime);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      const appointmentTime = appointmentDate.toTimeString().split(' ')[0]; // "HH:MM:SS"
      
      console.log('🔍 Verificando horario del especialista:', {
        specialistProfileId: specialistProfile.id,
        branchId,
        dayOfWeek,
        appointmentTime,
        appointmentDate: appointmentDate.toISOString()
      });

      const schedules = await SpecialistBranchSchedule.findAll({
        where: {
          specialistId: specialistProfile.id, // specialistProfileId
          branchId: branchId || null,
          dayOfWeek,
          isActive: true
        }
      });

      console.log(`📅 Horarios encontrados: ${schedules.length}`);

      if (schedules.length === 0) {
        const dayNames = {
          monday: 'lunes',
          tuesday: 'martes',
          wednesday: 'miércoles',
          thursday: 'jueves',
          friday: 'viernes',
          saturday: 'sábado',
          sunday: 'domingo'
        };
        
        return res.status(400).json({
          success: false,
          error: `El especialista no trabaja los ${dayNames[dayOfWeek]}${branchId ? ' en esta sucursal' : ''}. Por favor, selecciona otro día u horario.`
        });
      }

      // Validar que la hora esté dentro de algún rango configurado
      const isWithinSchedule = schedules.some(schedule => {
        const scheduleStart = schedule.startTime; // "09:00:00"
        const scheduleEnd = schedule.endTime;     // "18:00:00"
        
        console.log(`⏰ Comparando: ${appointmentTime} entre ${scheduleStart} y ${scheduleEnd}`);
        
        return appointmentTime >= scheduleStart && appointmentTime < scheduleEnd;
      });

      if (!isWithinSchedule) {
        const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
        
        return res.status(400).json({
          success: false,
          error: `El especialista no está disponible a las ${appointmentTime.substring(0, 5)}. Horarios disponibles: ${availableRanges}`
        });
      }

      console.log('✅ Horario válido según configuración del especialista');

      // Verificar disponibilidad del especialista (conflictos con otras citas)
      const conflictingAppointment = await Appointment.findOne({
        where: {
          specialistId: specialist.id, // Usar el userId del especialista
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
          specialistId: specialistProfile.id, // Usar el SpecialistProfile.id para buscar precios
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
        clientId: client.id,
        specialistId: specialist.id, // Usar el User.id del especialista
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
            as: 'service', // Agregar el alias
            attributes: ['id', 'name', 'duration', 'price']
          },
          {
            model: Client,
            as: 'client', // Agregar el alias
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
        const targetBranchId = branchId !== undefined ? branchId : appointment.branchId;
        
        // ✅ VALIDACIÓN: Verificar horario configurado del especialista
        const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
        const SpecialistProfile = require('../models/SpecialistProfile');
        
        const specialistProfile = await SpecialistProfile.findOne({
          where: {
            userId: targetSpecialistId,
            businessId,
            isActive: true
          }
        });

        if (specialistProfile) {
          const appointmentDate = new Date(startTime);
          const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
          const appointmentTime = appointmentDate.toTimeString().split(' ')[0];

          const schedules = await SpecialistBranchSchedule.findAll({
            where: {
              specialistId: specialistProfile.id,
              branchId: targetBranchId || null,
              dayOfWeek,
              isActive: true
            }
          });

          if (schedules.length === 0) {
            const dayNames = {
              monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles',
              thursday: 'jueves', friday: 'viernes', saturday: 'sábado', sunday: 'domingo'
            };
            
            return res.status(400).json({
              success: false,
              error: `El especialista no trabaja los ${dayNames[dayOfWeek]}${targetBranchId ? ' en esta sucursal' : ''}.`
            });
          }

          const isWithinSchedule = schedules.some(schedule => 
            appointmentTime >= schedule.startTime && appointmentTime < schedule.endTime
          );

          if (!isWithinSchedule) {
            const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
            return res.status(400).json({
              success: false,
              error: `El especialista no está disponible a las ${appointmentTime.substring(0, 5)}. Horarios: ${availableRanges}`
            });
          }
        }
        
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
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
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
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
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

      // ✅ VALIDACIÓN: Verificar horario configurado del especialista
      const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
      const SpecialistProfile = require('../models/SpecialistProfile');
      
      const specialistProfile = await SpecialistProfile.findOne({
        where: {
          userId: appointment.specialistId,
          businessId,
          isActive: true
        }
      });

      if (specialistProfile) {
        const appointmentDate = new Date(newStartTime);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
        const appointmentTime = appointmentDate.toTimeString().split(' ')[0];

        const schedules = await SpecialistBranchSchedule.findAll({
          where: {
            specialistId: specialistProfile.id,
            branchId: appointment.branchId || null,
            dayOfWeek,
            isActive: true
          }
        });

        if (schedules.length === 0) {
          const dayNames = {
            monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles',
            thursday: 'jueves', friday: 'viernes', saturday: 'sábado', sunday: 'domingo'
          };
          
          return res.status(400).json({
            success: false,
            error: `El especialista no trabaja los ${dayNames[dayOfWeek]}${appointment.branchId ? ' en esta sucursal' : ''}.`
          });
        }

        const isWithinSchedule = schedules.some(schedule => 
          appointmentTime >= schedule.startTime && appointmentTime < schedule.endTime
        );

        if (!isWithinSchedule) {
          const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
          return res.status(400).json({
            success: false,
            error: `El especialista no está disponible a las ${appointmentTime.substring(0, 5)}. Horarios: ${availableRanges}`
          });
        }
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
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName'],
            include: [{
              model: SpecialistProfile,
              as: 'specialistProfile',
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

  /**
   * Obtener agenda del especialista para su dashboard móvil
   * GET /api/specialists/me/appointments
   * Incluye toda la información necesaria para la app móvil
   */
  static async getSpecialistDashboardAppointments(req, res) {
    console.log('🎯 getSpecialistDashboardAppointments CALLED');
    console.log('🎯 req.user:', req.user);
    console.log('🎯 req.query:', req.query);
    
    try {
      const userId = req.user.id;
      const {
        date,          // Para compatibilidad con código antiguo
        startDate,     // Nueva opción: rango de fechas
        endDate,       // Nueva opción: rango de fechas
        branchId,
        status,
        page = 1,
        limit = 50
      } = req.query;

      console.log('📱 Cargando agenda del especialista:', { userId, date, startDate, endDate, branchId, status });

      // Buscar el perfil del especialista
      const specialistProfile = await SpecialistProfile.findOne({
        where: { userId }
      });

      if (!specialistProfile) {
        return res.status(404).json({
          success: false,
          error: 'Perfil de especialista no encontrado'
        });
      }

      console.log('✅ SpecialistProfile encontrado:', specialistProfile.id);

      const businessId = specialistProfile.businessId;

      // Construir filtros
      // IMPORTANTE: specialistId en appointments es userId, no specialistProfile.id
      const where = {
        businessId,
        specialistId: specialistProfile.userId  // Usar userId, no profile.id
      };

      console.log('🔍 Filtrando citas con:', where);

      // Filtro por rango de fechas (prioridad: startDate/endDate > date > hoy)
      if (startDate && endDate) {
        // Rango personalizado
        where.startTime = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
        console.log('📅 Usando rango:', { startDate, endDate });
      } else if (date) {
        // Un solo día específico (compatibilidad con código antiguo)
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        };
        console.log('📅 Usando día único:', date);
      } else {
        // Por defecto, mostrar turnos de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        };
        console.log('📅 Usando hoy por defecto');
      }

      // Filtro por sucursal
      if (branchId) {
        where.branchId = branchId;
      }

      // Filtro por estado
      if (status) {
        where.status = status;
      }

      const offset = (page - 1) * limit;

      // Obtener citas con toda la información
      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'duration', 'price']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'address', 'city']
          }
        ],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit),
        offset
      });

      // Calcular comisiones para cada cita
      const appointmentsWithCommission = await Promise.all(
        appointments.map(async (appointment) => {
          const appointmentData = appointment.toJSON();
          
          // Obtener configuración de comisión del servicio para este especialista
          const specialistService = await SpecialistService.findOne({
            where: {
              specialistId: specialistProfile.id,
              serviceId: appointment.serviceId
            }
          });

          const commissionPercentage = specialistService?.commissionPercentage || 50;
          // Usar totalAmount de la cita, o el precio del servicio si no hay totalAmount
          const price = appointment.totalAmount || appointmentData.service?.price || 0;
          const commissionAmount = (price * commissionPercentage) / 100;

          // Determinar origen de la cita
          const origin = appointment.createdBy ? 
            (appointment.createdBy === userId ? 'specialist' : 'business') : 
            'online';

          return {
            id: appointmentData.id,
            date: appointmentData.startTime,
            startTime: new Date(appointmentData.startTime).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            endTime: new Date(appointmentData.endTime).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            duration: appointmentData.service?.duration || 60,
            status: appointmentData.status,
            
            // Cliente
            clientId: appointmentData.client?.id,
            clientName: `${appointmentData.client?.firstName || ''} ${appointmentData.client?.lastName || ''}`.trim(),
            clientPhone: appointmentData.client?.phone,
            clientEmail: appointmentData.client?.email,
            
            // Servicio
            serviceId: appointmentData.service?.id,
            serviceName: appointmentData.service?.name,
            serviceDescription: appointmentData.service?.description,
            
            // Sucursal
            branchId: appointmentData.branch?.id,
            branchName: appointmentData.branch?.name || 'Principal',
            branchAddress: appointmentData.branch?.address,
            branchColor: '#3b82f6', // TODO: Agregar color a Branch model
            
            // Precios y comisión
            price,
            commissionPercentage,
            commissionAmount,
            
            // Estados
            paymentStatus: appointmentData.paymentStatus || 'pending',
            consentStatus: appointmentData.consentStatus || 'not_required',
            evidenceStatus: appointmentData.evidencePhotos ? 'completed' : 'pending',
            
            // Metadata
            origin,
            notes: appointmentData.notes,
            createdAt: appointmentData.createdAt,
            updatedAt: appointmentData.updatedAt
          };
        })
      );

      // Calcular estadísticas del día
      const stats = {
        total: count,
        completed: appointmentsWithCommission.filter(a => a.status === 'COMPLETED').length,
        confirmed: appointmentsWithCommission.filter(a => a.status === 'CONFIRMED').length,
        inProgress: appointmentsWithCommission.filter(a => a.status === 'IN_PROGRESS').length,
        cancelled: appointmentsWithCommission.filter(a => a.status === 'CANCELLED').length,
        totalEarnings: appointmentsWithCommission
          .filter(a => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + a.price, 0),
        totalCommissions: appointmentsWithCommission
          .filter(a => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + a.commissionAmount, 0),
        pendingCommissions: appointmentsWithCommission
          .filter(a => a.status !== 'CANCELLED')
          .reduce((sum, a) => sum + a.commissionAmount, 0)
      };

      res.json({
        success: true,
        data: {
          appointments: appointmentsWithCommission,
          stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo agenda del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

}

module.exports = AppointmentController;