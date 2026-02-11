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
  BusinessClient,
  BusinessRule,
  RuleTemplate
} = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Helper: Get default commission rate from business rules
 * Reads COMISIONES_PORCENTAJE_GENERAL with fallback chain
 */
async function getDefaultCommissionRate(businessId) {
  try {
    const businessRule = await BusinessRule.findOne({
      where: {
        businessId,
        key: 'COMISIONES_PORCENTAJE_GENERAL',
        isActive: true
      }
    });

    if (businessRule) {
      if (businessRule.effective_value !== null && businessRule.effective_value !== undefined) {
        return parseFloat(businessRule.effective_value);
      }
      if (businessRule.customValue !== null && businessRule.customValue !== undefined) {
        return parseFloat(businessRule.customValue);
      }
      if (businessRule.defaultValue !== null && businessRule.defaultValue !== undefined) {
        return parseFloat(businessRule.defaultValue);
      }
    }

    const ruleTemplate = await RuleTemplate.findOne({
      where: { key: 'COMISIONES_PORCENTAJE_GENERAL' }
    });

    if (ruleTemplate?.defaultValue !== null && ruleTemplate?.defaultValue !== undefined) {
      return parseFloat(ruleTemplate.defaultValue);
    }

    return 50;
  } catch (error) {
    console.error('❌ Error getting default commission rate:', error);
    return 50;
  }
}

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
        paymentStatus,
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

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
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
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price', 'category']
          },
          {
            model: Service,
            as: 'services',
            through: { attributes: ['price', 'duration', 'order'] },
            attributes: ['id', 'name', 'duration', 'price', 'category', 'requiresConsent', 'consentTemplateId']
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

      if (appointments.length > 0) {
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
      const { id } = req.params; // ✅ FIXED: cambio de appointmentId a id
      const { businessId } = req.query;
      
      const where = {
        id: id,
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
            attributes: ['id', 'name', 'description', 'duration', 'price', 'category', 'requiresConsent', 'consentTemplateId']
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
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address'],
            required: false
          },
          {
            model: Service,
            as: 'services', // Todos los servicios asociados
            through: { 
              attributes: ['price', 'duration', 'order'],
              as: 'appointmentService'
            },
            attributes: ['id', 'name', 'description', 'duration', 'price', 'category', 'requiresConsent', 'consentTemplateId']
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
            model: Service,
            as: 'services', // Múltiples servicios
            through: { 
              attributes: ['price', 'duration', 'order'],
              as: 'appointmentService'
            }
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

      if (appointments.length > 0) {
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
        serviceIds, // Array de servicios para múltiples servicios
        startTime,
        endTime,
        duration,
        notes,
        clientNotes,
        branchId
      } = req.body;
      
      
      // Determinar qué servicios usar: array o single
      const servicesToValidate = serviceIds && serviceIds.length > 0 ? serviceIds : (serviceId ? [serviceId] : []);
      
      

      // Validar servicios primero para obtener duración total
      if (!servicesToValidate || servicesToValidate.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar al menos un servicio'
        });
      }
      
      // Validar todos los servicios y calcular totales
      const services = [];
      let totalDuration = 0;
      let totalAmount = 0;
      
      for (const sId of servicesToValidate) {
        const service = await Service.findOne({
          where: {
            id: sId,
            businessId,
            isActive: true
          }
        });

        if (!service) {
          return res.status(400).json({
            success: false,
            error: `Servicio ${sId} no válido para este negocio`
          });
        }
        
        services.push(service);
        totalDuration += service.duration;
        totalAmount += parseFloat(service.price);
      }
      
      // Usar el primer servicio como referencia para cálculos de sesión (si aplica)
      const service = services[0];

      // Validar que la fecha/hora no sea en el pasado
      const now = new Date();
      const appointmentStart = new Date(startTime);
      
      if (appointmentStart < now) {
        return res.status(400).json({
          success: false,
          error: 'No se pueden crear citas con fecha y hora pasadas'
        });
      }

      // Calcular endTime si viene duration pero no endTime
      let calculatedEndTime = endTime;
      const effectiveDuration = duration || totalDuration; // Usar la suma de duraciones si no viene duration
      if (!calculatedEndTime && effectiveDuration && startTime) {
        const start = new Date(startTime);
        calculatedEndTime = new Date(start.getTime() + effectiveDuration * 60000); // duration en minutos
      }

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
          
          // Parsear nombre y apellido
          const nameParts = (clientName || '').trim().split(' ');
          const firstName = nameParts[0] || 'Cliente';
          const lastName = nameParts.slice(1).join(' ') || 'Nuevo';

          client = await Client.create({
            firstName,
            lastName,
            email: clientEmail,
            phone: clientPhone || null,
            businessId: businessId, // CRÍTICO: Asignar businessId al cliente
            status: 'ACTIVE'
          });

        } else {
        }

        // Verificar si existe la relación BusinessClient, si no, crearla
        const businessClientRelation = await BusinessClient.findOne({
          where: {
            businessId,
            clientId: client.id
          }
        });

        if (!businessClientRelation) {
          await BusinessClient.create({
            businessId,
            clientId: client.id,
            status: 'ACTIVE',
            firstVisit: new Date()
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar clientId o clientEmail'
        });
      }

      // Validar que el especialista pertenezca al negocio
      
      const User = require('../models/User');
      const SpecialistProfile = require('../models/SpecialistProfile');
      
      let specialist;
      let specialistProfile = null;
      
      // Primero intentar buscar como SpecialistProfile (lo más común)
      specialistProfile = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId,
          isActive: true
        },
        include: [{
          model: User,
          as: 'user',
          where: {
            status: 'ACTIVE'
          },
          required: true
        }]
      });

      if (specialistProfile && specialistProfile.user) {
        specialist = specialistProfile.user;
      } else {
        // Si no es un SpecialistProfile, intentar buscar directamente como User
        // (para casos donde se envíe el userId directamente)
        const userDirectly = await User.findOne({
          where: {
            id: specialistId,
            businessId,
            status: 'ACTIVE',
            role: { [Op.in]: ['BUSINESS_SPECIALIST', 'BUSINESS', 'SPECIALIST', 'RECEPTIONIST_SPECIALIST'] }
          }
        });

        if (userDirectly) {
          specialist = userDirectly;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Especialista no válido para este negocio'
          });
        }
      }

      // Los servicios ya fueron validados al principio
      // Continuar con validación de sucursal

      // Validar sucursal si se proporciona
      if (branchId) {
        const Branch = require('../models/Branch');
        const branch = await Branch.findOne({
          where: {
            id: branchId,
            businessId,
            status: 'ACTIVE' // Usar status en lugar de isActive
          }
        });

        if (!branch) {
          return res.status(400).json({
            success: false,
            error: 'Sucursal no válida para este negocio'
          });
        }

        
        // BUSINESS y BUSINESS_SPECIALIST (propietarios del negocio) tienen acceso a todas las sucursales
        if (['BUSINESS', 'BUSINESS_SPECIALIST'].includes(specialist.role)) {
        } else {
          // Verificar que el especialista regular tenga acceso a esa sucursal
          const specialistBranchAccess = await UserBranch.findOne({
            where: {
              userId: specialist.id, // Usar el User.id del especialista
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
      }

      // ✅ VALIDACIÓN DE HORARIOS: Primero intentar horarios del especialista, luego horarios del negocio
      const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
      const Branch = require('../models/Branch');
      
      const appointmentDate = new Date(startTime);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
      const appointmentTime = appointmentDate.toTimeString().split(' ')[0]; // "HH:MM:SS"
      
      // Usar el specialistProfile.id si existe, de lo contrario null
      const specialistIdForSchedule = specialistProfile ? specialistProfile.id : null;
      

      // 1. Intentar obtener horarios del especialista (solo si tiene SpecialistProfile)
      let schedules = [];
      if (specialistIdForSchedule) {
        schedules = await SpecialistBranchSchedule.findAll({
          where: {
            specialistId: specialistIdForSchedule,
            branchId: branchId || null,
            dayOfWeek,
            isActive: true
          }
        });
      }


      // 2. Si no hay horarios del especialista, usar horarios del negocio (Branch)
      let targetBranch = null;
      if (schedules.length === 0) {
        
        // Si no se especificó branchId, buscar la sucursal principal o única del negocio
        if (!branchId) {
          const Branch = require('../models/Branch');
          const branches = await Branch.findAll({
            where: { businessId, status: 'ACTIVE' },
            order: [['isMain', 'DESC']]
          });
          
          if (branches.length > 0) {
            targetBranch = branches[0]; // Tomar la principal o la primera
          }
        } else {
          const Branch = require('../models/Branch');
          targetBranch = await Branch.findByPk(branchId);
        }
        
        if (targetBranch && targetBranch.businessHours && targetBranch.businessHours[dayOfWeek]) {
          const branchHours = targetBranch.businessHours[dayOfWeek];
          
          // Verificar si la sucursal está abierta ese día (soportar formato viejo y nuevo)
          // Formato nuevo: enabled=true y shifts array
          // Formato viejo: closed=false y open/close
          const isOpen = branchHours.enabled !== false && 
                        !branchHours.closed && 
                        (branchHours.shifts?.length > 0 || (branchHours.open && branchHours.close));
          
          if (isOpen) {
            // Crear schedule virtual con los horarios
            if (branchHours.shifts && branchHours.shifts.length > 0) {
              // Formato nuevo con shifts - usar el primer turno
              const firstShift = branchHours.shifts[0];
              schedules = [{
                startTime: firstShift.start + ':00',
                endTime: firstShift.end + ':00',
                _isBranchHours: true
              }];
            } else if (branchHours.open && branchHours.close) {
              // Formato viejo
              schedules = [{
                startTime: branchHours.open + ':00',
                endTime: branchHours.close + ':00',
                _isBranchHours: true
              }];
            }
          } else {
            // Retornar error específico para sucursal cerrada
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
              error: `La sucursal está cerrada los ${dayNames[dayOfWeek]}. Por favor, selecciona otro día.`,
              details: {
                reason: 'BRANCH_CLOSED',
                dayOfWeek,
                branchId: targetBranch.id,
                branchName: targetBranch.name,
                branchHours: branchHours // Incluir los horarios para debugging
              }
            });
          }
        }
      }

      // 3. Si aún no hay horarios (ni del especialista ni del negocio), rechazar
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
        
        // Mensaje más específico según el contexto
        let errorMessage = `No hay horarios disponibles para los ${dayNames[dayOfWeek]}`;
        let errorReason = 'NO_SCHEDULES';
        
        if (branchId) {
          errorMessage += ' en esta sucursal';
          errorReason = 'NO_SCHEDULES_IN_BRANCH';
        }
        
        if (specialistIdForSchedule) {
          errorMessage += '. El especialista no tiene horarios configurados y la sucursal no tiene horarios definidos para este día';
          errorReason = 'NO_SPECIALIST_SCHEDULES';
        }
        
        errorMessage += '. Por favor, selecciona otro día u horario.';
        
        return res.status(400).json({
          success: false,
          error: errorMessage,
          details: {
            reason: errorReason,
            dayOfWeek,
            branchId,
            specialistId: specialistIdForSchedule,
            suggestion: 'Configura horarios para el especialista o ajusta los horarios de la sucursal'
          }
        });
      }

      // 4. Validar que la hora esté dentro de algún rango configurado
      const isWithinSchedule = schedules.some(schedule => {
        const scheduleStart = schedule.startTime; // "09:00:00"
        const scheduleEnd = schedule.endTime;     // "18:00:00"
        
        
        return appointmentTime >= scheduleStart && appointmentTime < scheduleEnd;
      });

      if (!isWithinSchedule) {
        const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
        const sourceType = schedules[0]._isBranchHours ? 'de la sucursal' : 'del especialista';
        const requestedTime = appointmentTime.substring(0, 5);
        
        return res.status(400).json({
          success: false,
          error: `El horario ${requestedTime} no está disponible. Horarios ${sourceType} para este día: ${availableRanges}`,
          details: {
            reason: 'TIME_OUT_OF_SCHEDULE',
            requestedTime,
            availableRanges: schedules.map(s => ({
              start: s.startTime.substring(0, 5),
              end: s.endTime.substring(0, 5)
            })),
            sourceType: schedules[0]._isBranchHours ? 'branch' : 'specialist'
          }
        });
      }


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
                [Op.between]: [new Date(startTime), calculatedEndTime]
              }
            },
            {
              endTime: {
                [Op.between]: [new Date(startTime), calculatedEndTime]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: new Date(startTime) } },
                { endTime: { [Op.gte]: calculatedEndTime } }
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

      // 🎯 VALIDACIÓN DE SESIONES MULTISESIÓN Y MANTENIMIENTO
      let sessionNumber = 1;
      let sessionInfo = null;
      
      if (service.isPackage) {
        
        // Contar todas las sesiones del cliente para este servicio (excepto canceladas)
        const previousSessions = await Appointment.count({
          where: {
            businessId,
            clientId: client.id,
            serviceId: service.id, // Usar service.id que viene del primer servicio validado
            status: {
              [Op.in]: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS', 'PENDING']
            }
          }
        });
        
        sessionNumber = previousSessions + 1;
        
        const packageConfig = service.packageConfig || {};
        
        if (service.packageType === 'MULTI_SESSION') {
          const totalSessions = packageConfig.sessions || 1;
          
          // Validar que no exceda el número de sesiones
          if (sessionNumber > totalSessions) {
            return res.status(400).json({
              success: false,
              error: `El cliente ya completó todas las sesiones de este servicio (${totalSessions} de ${totalSessions})`,
              details: {
                reason: 'MAX_SESSIONS_REACHED',
                totalSessions,
                completedSessions: previousSessions,
                serviceId: service.id,
                serviceName: service.name
              }
            });
          }
          
          sessionInfo = {
            type: 'MULTI_SESSION',
            sessionNumber,
            totalSessions,
            remainingSessions: totalSessions - sessionNumber
          };
          
          
        } else if (service.packageType === 'WITH_MAINTENANCE') {
          const maintenanceSessions = packageConfig.maintenanceSessions || 0;
          const totalSessions = 1 + maintenanceSessions; // 1 sesión principal + N mantenimientos
          
          // Determinar si es sesión principal o mantenimiento
          const isMainSession = sessionNumber === 1;
          
          // Validar que no exceda el número de sesiones
          if (sessionNumber > totalSessions) {
            return res.status(400).json({
              success: false,
              error: `El cliente ya completó todas las sesiones de este servicio (${totalSessions} de ${totalSessions})`,
              details: {
                reason: 'MAX_SESSIONS_REACHED',
                totalSessions,
                completedSessions: previousSessions,
                serviceId: service.id,
                serviceName: service.name,
                maintenanceSessions
              }
            });
          }
          
          sessionInfo = {
            type: 'WITH_MAINTENANCE',
            sessionNumber,
            totalSessions,
            isMainSession,
            maintenanceNumber: isMainSession ? null : sessionNumber - 1,
            remainingSessions: totalSessions - sessionNumber
          };
          
        }
      }

      // Consultar precio personalizado del especialista para este servicio
      // Para BUSINESS_SPECIALIST, usar el precio base del servicio (sin personalización)
      let specialistService = null;
      
      if (specialistProfile) {
        specialistService = await SpecialistService.findOne({
          where: {
            specialistId: specialistProfile.id, // Usar el SpecialistProfile.id para buscar precios
            serviceId: service.id, // Usar service.id que viene del primer servicio validado
            isActive: true
          }
        });
      }

      // 💰 CÁLCULO DE PRECIO SEGÚN TIPO DE SESIÓN
      let finalPrice = service.price;
      
      if (service.isPackage && sessionInfo) {
        const packageConfig = service.packageConfig || {};
        const pricing = packageConfig.pricing || {};
        
        if (service.packageType === 'MULTI_SESSION') {
          // Para multisesión, usar pricePerSession si existe
          if (service.pricePerSession) {
            finalPrice = service.pricePerSession;
          } else if (pricing.perSession) {
            finalPrice = parseFloat(pricing.perSession);
          }
          
        } else if (service.packageType === 'WITH_MAINTENANCE') {
          // Para WITH_MAINTENANCE, distinguir entre principal y mantenimiento
          if (sessionInfo.isMainSession) {
            finalPrice = pricing.mainSession ? parseFloat(pricing.mainSession) : service.price;
          } else {
            finalPrice = pricing.maintenancePrice ? parseFloat(pricing.maintenancePrice) : service.price;
          }
        }
      } else if (specialistService && specialistService.customPrice !== null) {
        // Usar precio personalizado del especialista si no es paquete
        finalPrice = specialistService.customPrice;
      }

      // Generar número de cita único
      const appointmentNumber = `CITA-${Date.now()}`;

      // 💰 CÁLCULO FINAL DE PRECIO
      // Si hay múltiples servicios, usar el total calculado
      // Si es un servicio de paquete, usar el precio calculado de sesión
      let finalTotalAmount = totalAmount;
      if (services.length === 1 && finalPrice !== service.price) {
        // Si es solo un servicio y tiene precio especial (paquete o personalizado), usar ese precio
        finalTotalAmount = finalPrice;
      }

      // Crear la cita con información de sesión si aplica
      const appointmentData = {
        businessId,
        clientId: client.id,
        specialistId: specialist.id, // Usar el User.id del especialista
        serviceId: services[0].id, // Mantener el primer servicio para backward compatibility
        branchId: branchId || null, // Campo opcional
        appointmentNumber,
        startTime: new Date(startTime),
        endTime: calculatedEndTime,
        totalAmount: finalTotalAmount,
        status: 'PENDING',
        notes,
        clientNotes
      };
      
      // Agregar metadata de sesión si es un paquete
      if (sessionInfo) {
        appointmentData.sessionMetadata = sessionInfo;
      }
      
      const appointment = await Appointment.create(appointmentData);

      // 🔗 CREAR REGISTROS EN APPOINTMENTSERVICE PARA CADA SERVICIO
      const AppointmentService = require('../models/AppointmentService');
      for (let i = 0; i < services.length; i++) {
        const svc = services[i];
        
        
        // Determinar el precio individual
        let servicePrice = parseFloat(svc.price);
        
        // Si es el primer servicio y tiene precio especial, usar ese
        if (i === 0 && finalPrice !== service.price && services.length === 1) {
          servicePrice = finalPrice;
        }
        
        const appointmentServiceData = {
          appointmentId: appointment.id,
          serviceId: svc.id,
          price: servicePrice,
          duration: svc.duration,
          order: i
        };
        
        
        const createdAS = await AppointmentService.create(appointmentServiceData);
      }
      

      // Obtener la cita creada con relaciones incluyendo los servicios
      const createdAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Service,
            as: 'service', // Servicio principal para backward compatibility
            attributes: ['id', 'name', 'duration', 'price', 'isPackage', 'packageType', 'packageConfig', 'pricePerSession']
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
          },
          {
            model: Service,
            as: 'services', // Todos los servicios asociados
            through: { 
              attributes: ['price', 'duration', 'order'],
              as: 'appointmentService'
            }
          }
        ]
      });
      
      if (createdAppointment.services) {
        createdAppointment.services.forEach((svc, idx) => {
        });
      }
      
      // Agregar información de sesión en la respuesta
      const response = {
        success: true,
        message: 'Cita creada exitosamente',
        data: createdAppointment.toJSON()
      };
      
      if (sessionInfo) {
        response.data.sessionInfo = sessionInfo;
        response.message = `Cita creada exitosamente - Sesión ${sessionInfo.sessionNumber}/${sessionInfo.totalSessions}`;
      }

      // 🛒 PROCESAR PRODUCTOS VENDIDOS DURANTE LA CITA (si existen)
      const { productsSold } = req.body;
      if (productsSold && Array.isArray(productsSold) && productsSold.length > 0) {
        
        try {
          const SaleController = require('./SaleController');
          
          // Calcular total de productos
          const productsTotal = productsSold.reduce((sum, item) => sum + (item.total || 0), 0);
          
          // Crear venta asociada a la cita
          const saleData = {
            businessId,
            branchId: branchId || null,
            userId: specialist.id,
            clientId: client.id,
            items: productsSold.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.product?.price,
              discount: item.discount || 0,
              discountType: item.discountType || 'NONE',
              discountValue: item.discountValue || 0
            })),
            discountType: 'NONE',
            discount: 0,
            paymentMethod: 'CASH', // Por defecto, puede cambiarse
            paidAmount: productsTotal,
            notes: `Venta durante cita ${appointment.id}`,
            shiftId: null,
            appointmentId: appointment.id // Vinculamos con la cita
          };

          // Crear la venta
          const mockReq = {
            body: saleData,
            user: req.user
          };
          
          const mockRes = {
            status: function(code) {
              this.statusCode = code;
              return this;
            },
            json: function(data) {
              this.responseData = data;
              return data;
            }
          };

          await SaleController.createSale(mockReq, mockRes);

          if (mockRes.statusCode === 201 && mockRes.responseData?.success) {
            response.data.productSale = {
              id: mockRes.responseData.data.sale?.id,
              total: productsTotal,
              itemsCount: productsSold.length
            };
          } else {
            console.error('⚠️ Error al crear venta de productos:', mockRes.responseData);
          }
        } catch (saleError) {
          console.error('⚠️ Error procesando venta de productos:', saleError);
          // No fallar toda la cita si falla la venta, solo advertir
          response.warning = 'Cita creada pero hubo un problema al registrar la venta de productos';
        }
      }

      res.status(201).json(response);

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
      const { id } = req.params; // La ruta usa :id, no :appointmentId
      const { status, notes, cancelReason } = req.body;
      
      // Obtener businessId del query o del usuario autenticado
      const businessId = req.query.businessId || req.user?.businessId;
      
      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      const where = {
        id: id,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
        
        // Validar estados permitidos para especialista
        const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELED'];
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
        
        // ✅ VALIDACIÓN: Verificar horario configurado (especialista o negocio)
        const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
        const SpecialistProfile = require('../models/SpecialistProfile');
        const Branch = require('../models/Branch');
        
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

          // 1. Intentar horarios del especialista
          let schedules = await SpecialistBranchSchedule.findAll({
            where: {
              specialistId: specialistProfile.id,
              branchId: targetBranchId || null,
              dayOfWeek,
              isActive: true
            }
          });

          // 2. Si no hay horarios del especialista, usar horarios del negocio
          let targetBranch = null;
          if (schedules.length === 0) {
            // Si no se especificó branchId, buscar la sucursal principal o única
            if (!targetBranchId) {
              const branches = await Branch.findAll({
                where: { businessId, status: 'ACTIVE' },
                order: [['isMain', 'DESC']]
              });
              
              if (branches.length > 0) {
                targetBranch = branches[0];
              }
            } else {
              targetBranch = await Branch.findByPk(targetBranchId);
            }
            
            if (targetBranch && targetBranch.businessHours && targetBranch.businessHours[dayOfWeek]) {
              const branchHours = targetBranch.businessHours[dayOfWeek];
              
              // Verificar si la sucursal está abierta (soportar formato viejo y nuevo)
              const isOpen = branchHours.enabled !== false && 
                            !branchHours.closed && 
                            (branchHours.shifts?.length > 0 || (branchHours.open && branchHours.close));
              
              if (isOpen) {
                if (branchHours.shifts && branchHours.shifts.length > 0) {
                  // Formato nuevo con shifts - usar el primer turno
                  const firstShift = branchHours.shifts[0];
                  schedules = [{
                    startTime: firstShift.start + ':00',
                    endTime: firstShift.end + ':00',
                    _isBranchHours: true
                  }];
                } else if (branchHours.open && branchHours.close) {
                  // Formato viejo
                  schedules = [{
                    startTime: branchHours.open + ':00',
                    endTime: branchHours.close + ':00',
                    _isBranchHours: true
                  }];
                }
              }
            }
          }

          if (schedules.length === 0) {
            const dayNames = {
              monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles',
              thursday: 'jueves', friday: 'viernes', saturday: 'sábado', sunday: 'domingo'
            };
            
            return res.status(400).json({
              success: false,
              error: `No hay horarios disponibles para los ${dayNames[dayOfWeek]}${targetBranchId ? ' en esta sucursal' : ''}.`
            });
          }

          const isWithinSchedule = schedules.some(schedule => 
            appointmentTime >= schedule.startTime && appointmentTime < schedule.endTime
          );

          if (!isWithinSchedule) {
            const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
            return res.status(400).json({
              success: false,
              error: `No hay disponibilidad a las ${appointmentTime.substring(0, 5)}. Horarios: ${availableRanges}`
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
      const { rating, feedback, finalAmount, payment } = req.body;

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
      // Prioridad: 1) SpecialistProfile, 2) ServiceCommission, 3) BusinessCommissionConfig, 4) Default 50%
      try {
        const SpecialistProfile = require('../models/SpecialistProfile');
        const ServiceCommission = require('../models/ServiceCommission');
        const BusinessCommissionConfig = require('../models/BusinessCommissionConfig');

        let specialistPercentage = null;
        let businessPercentage = null;

        // 1️⃣ PRIORIDAD MÁXIMA: Comisión del perfil del especialista
        const specialistProfile = await SpecialistProfile.findOne({
          where: {
            userId: appointment.specialistId,
            businessId,
            isActive: true
          }
        });

        if (specialistProfile && specialistProfile.commissionRate !== null) {
          // Usar la comisión individual del especialista
          specialistPercentage = parseFloat(specialistProfile.commissionRate);
          businessPercentage = 100 - specialistPercentage;
          console.log(`✅ Usando comisión del especialista: ${specialistPercentage}%`);
        } else {
          // 2️⃣ Buscar comisión específica del servicio
          const serviceCommission = await ServiceCommission.findOne({
            where: {
              businessId,
              serviceId: appointment.serviceId,
              isActive: true
            }
          });

          if (serviceCommission) {
            // Usar configuración específica del servicio
            specialistPercentage = serviceCommission.specialistPercentage;
            businessPercentage = serviceCommission.businessPercentage;
            console.log(`✅ Usando comisión del servicio: ${specialistPercentage}%`);
          } else {
            // 3️⃣ Usar configuración global del negocio
            const businessConfig = await BusinessCommissionConfig.findOne({
              where: {
                businessId,
                isActive: true
              }
            });

            if (businessConfig) {
              specialistPercentage = businessConfig.defaultSpecialistPercentage;
              businessPercentage = businessConfig.defaultBusinessPercentage;
              console.log(`✅ Usando comisión global del negocio: ${specialistPercentage}%`);
            } else {
              // 4️⃣ Default: 50% especialista, 50% negocio
              specialistPercentage = 50;
              businessPercentage = 50;
              console.log(`✅ Usando comisión default: 50%`);
            }
          }
        }

        // Calcular montos de comisión
        if (specialistPercentage !== null && businessPercentage !== null) {
          const amount = finalAmount !== undefined ? finalAmount : appointment.totalAmount;
          const specialistCommission = (amount * specialistPercentage) / 100;
          const businessCommission = (amount * businessPercentage) / 100;

          updateData.specialistCommission = specialistCommission;
          updateData.businessCommission = businessCommission;
          
          console.log(`💰 Comisión calculada - Especialista: $${specialistCommission.toFixed(2)}, Negocio: $${businessCommission.toFixed(2)}`);
        }
      } catch (commissionError) {
        console.warn('Error calculando comisión (continuando sin comisión):', commissionError);
        // Continuar sin comisión si hay error
      }

      // ===== PROCESAR PAGO SI SE PROPORCIONÓ =====
      let paymentRecord = null;
      if (payment && payment.methodId && payment.amount) {
        try {
          const PaymentMethod = require('../models/PaymentMethod');
          const cloudinary = require('../config/cloudinary');
          
          // Verificar que el método de pago existe y está activo
          const paymentMethod = await PaymentMethod.findOne({
            where: {
              id: payment.methodId,
              businessId,
              isActive: true
            }
          });
          
          if (!paymentMethod) {
            return res.status(400).json({
              success: false,
              error: 'Método de pago no válido o inactivo'
            });
          }
          
          // Subir comprobante a Cloudinary si existe
          let proofUrl = null;
          let proofPublicId = null;
          
          if (payment.proofImageBase64) {
            try {
              const uploadResult = await cloudinary.uploader.upload(payment.proofImageBase64, {
                folder: `beauty-control/businesses/${businessId}/payment-proofs`,
                resource_type: 'image',
                transformation: [
                  { quality: 'auto', fetch_format: 'auto' },
                  { width: 1200, height: 1200, crop: 'limit' }
                ]
              });
              
              proofUrl = uploadResult.secure_url;
              proofPublicId = uploadResult.public_id;
              
            } catch (uploadError) {
              console.error('Error uploading payment proof:', uploadError);
              // Si requiere comprobante y falla la subida, retornar error
              if (paymentMethod.requiresProof) {
                return res.status(400).json({
                  success: false,
                  error: 'Error al subir el comprobante de pago'
                });
              }
            }
          } else if (paymentMethod.requiresProof) {
            return res.status(400).json({
              success: false,
              error: 'Este método de pago requiere adjuntar un comprobante'
            });
          }
          
          // Crear registro de pago (asumiendo que tienes un modelo AppointmentPayment)
          // Si no existe, puedes crearlo o guardar en metadata del appointment
          const AppointmentPayment = require('../models/AppointmentPayment');
          
          paymentRecord = await AppointmentPayment.create({
            appointmentId: appointment.id,
            businessId,
            paymentMethodId: payment.methodId,
            amount: payment.amount,
            proofUrl,
            proofPublicId,
            notes: payment.notes || null,
            createdBy: req.user.id,
            createdAt: new Date()
          });
          
          // Actualizar monto pagado del appointment
          const newPaidAmount = (appointment.paidAmount || 0) + parseFloat(payment.amount);
          updateData.paidAmount = newPaidAmount;
          
          // Actualizar estado de pago
          if (newPaidAmount >= appointment.totalAmount) {
            updateData.paymentStatus = 'PAID';
          } else if (newPaidAmount > 0) {
            updateData.paymentStatus = 'PARTIAL';
          }
          
          
        } catch (paymentError) {
          console.error('Error procesando pago:', paymentError);
          return res.status(400).json({
            success: false,
            error: 'Error al procesar el pago: ' + paymentError.message
          });
        }
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
        data: {
          appointment: completedAppointment,
          payment: paymentRecord ? {
            id: paymentRecord.id,
            amount: paymentRecord.amount,
            methodId: paymentRecord.paymentMethodId,
            proofUrl: paymentRecord.proofUrl,
            notes: paymentRecord.notes
          } : null,
          commission: updateData.specialistCommission ? {
            specialist: updateData.specialistCommission,
            business: updateData.businessCommission
          } : null
        }
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

      // ✅ VALIDACIÓN: Verificar horario configurado (especialista o negocio)
      const SpecialistBranchSchedule = require('../models/SpecialistBranchSchedule');
      const SpecialistProfile = require('../models/SpecialistProfile');
      const Branch = require('../models/Branch');
      
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

        // 1. Intentar horarios del especialista
        let schedules = await SpecialistBranchSchedule.findAll({
          where: {
            specialistId: specialistProfile.id,
            branchId: appointment.branchId || null,
            dayOfWeek,
            isActive: true
          }
        });

        // 2. Si no hay horarios del especialista, usar horarios del negocio
        let targetBranch = null;
        if (schedules.length === 0) {
          // Si no se especificó branchId en la cita, buscar la sucursal principal o única
          if (!appointment.branchId) {
            const branches = await Branch.findAll({
              where: { businessId, status: 'ACTIVE' },
              order: [['isMain', 'DESC']]
            });
            
            if (branches.length > 0) {
              targetBranch = branches[0];
            }
          } else {
            targetBranch = await Branch.findByPk(appointment.branchId);
          }
          
          if (targetBranch && targetBranch.businessHours && targetBranch.businessHours[dayOfWeek]) {
            const branchHours = targetBranch.businessHours[dayOfWeek];
            
            // Verificar si la sucursal está abierta (soportar formato viejo y nuevo)
            const isOpen = branchHours.enabled !== false && 
                          !branchHours.closed && 
                          (branchHours.shifts?.length > 0 || (branchHours.open && branchHours.close));
            
            if (isOpen) {
              if (branchHours.shifts && branchHours.shifts.length > 0) {
                // Formato nuevo con shifts - usar el primer turno
                const firstShift = branchHours.shifts[0];
                schedules = [{
                  startTime: firstShift.start + ':00',
                  endTime: firstShift.end + ':00',
                  _isBranchHours: true
                }];
              } else if (branchHours.open && branchHours.close) {
                // Formato viejo
                schedules = [{
                  startTime: branchHours.open + ':00',
                  endTime: branchHours.close + ':00',
                  _isBranchHours: true
                }];
              }
            }
          }
        }

        if (schedules.length === 0) {
          const dayNames = {
            monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles',
            thursday: 'jueves', friday: 'viernes', saturday: 'sábado', sunday: 'domingo'
          };
          
          return res.status(400).json({
            success: false,
            error: `No hay horarios disponibles para los ${dayNames[dayOfWeek]}${appointment.branchId ? ' en esta sucursal' : ''}.`
          });
        }

        const isWithinSchedule = schedules.some(schedule => 
          appointmentTime >= schedule.startTime && appointmentTime < schedule.endTime
        );

        if (!isWithinSchedule) {
          const availableRanges = schedules.map(s => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}`).join(', ');
          return res.status(400).json({
            success: false,
            error: `No hay disponibilidad a las ${appointmentTime.substring(0, 5)}. Horarios: ${availableRanges}`
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


      const businessId = specialistProfile.businessId;

      // Construir filtros
      // IMPORTANTE: specialistId en appointments es userId, no specialistProfile.id
      const where = {
        businessId
      };

      // Solo filtrar por specialistId si es SPECIALIST puro
      // RECEPTIONIST y RECEPTIONIST_SPECIALIST ven TODAS las citas del negocio
      if (req.user.role === 'SPECIALIST') {
        where.specialistId = specialistProfile.userId;  // Usar userId, no profile.id
      }

      // Filtro por rango de fechas (prioridad: startDate/endDate > date > hoy)
      if (startDate && endDate) {
        // Rango personalizado
        where.startTime = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate)
        };
      } else if (date) {
        // Un solo día específico (compatibilidad con código antiguo)
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        where.startTime = {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        };
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

      // Obtener tasa de comisión por defecto del sistema de reglas (una sola consulta)
      const defaultCommissionRate = await getDefaultCommissionRate(businessId);

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

          const commissionPercentage = specialistService?.commissionPercentage || defaultCommissionRate;
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

  /**
   * Obtener resumen de turnos del día
   * GET /api/appointments/summary/today?businessId={bizId}&date=YYYY-MM-DD
   */
  static async getTodaySummary(req, res) {
    try {
      const { businessId, date, branchId } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // Fecha objetivo (hoy por defecto)
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Construir filtros
      const where = {
        businessId,
        startTime: {
          [Op.gte]: targetDate,
          [Op.lt]: nextDay
        }
      };

      // Filtrar por sucursal si se especifica
      if (branchId) {
        where.branchId = branchId;
      }

      // Obtener todas las citas del día
      const appointments = await Appointment.findAll({
        where,
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['name', 'price', 'duration']
          },
          {
            model: Service,
            as: 'services', // Múltiples servicios
            through: { 
              attributes: ['price', 'duration', 'order'],
              as: 'appointmentService'
            }
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['firstName', 'lastName']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['firstName', 'lastName', 'phone']
          }
        ]
      });

      // Calcular resumen por estado
      const summary = {
        total: appointments.length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
        pending: appointments.filter(a => a.status === 'PENDING').length,
        inProgress: appointments.filter(a => a.status === 'IN_PROGRESS').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        noShow: appointments.filter(a => a.status === 'NO_SHOW').length,
        
        // Totales financieros
        totalRevenue: appointments
          .filter(a => a.status === 'COMPLETED')
          .reduce((sum, a) => sum + parseFloat(a.price || 0), 0),
        
        potentialRevenue: appointments
          .filter(a => ['CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(a.status))
          .reduce((sum, a) => sum + parseFloat(a.price || 0), 0),
        
        // Detalles por estado
        appointmentsByStatus: {
          COMPLETED: appointments.filter(a => a.status === 'COMPLETED'),
          CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED'),
          PENDING: appointments.filter(a => a.status === 'PENDING'),
          IN_PROGRESS: appointments.filter(a => a.status === 'IN_PROGRESS'),
          CANCELLED: appointments.filter(a => a.status === 'CANCELLED'),
          NO_SHOW: appointments.filter(a => a.status === 'NO_SHOW')
        }
      };

      return res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('Error al obtener resumen de turnos del día:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de turnos'
      });
    }
  }

  /**
   * Obtener historial de citas de un cliente
   * GET /api/appointments/client/:clientId?businessId={bizId}&includeReceipt=true&includePaymentInfo=true
   */
  static async getClientAppointments(req, res) {
    try {
      const { clientId } = req.params;
      const { businessId, includeReceipt, includePaymentInfo } = req.query;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere el ID del cliente'
        });
      }

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere el ID del negocio'
        });
      }

      // Construir includes dinámicamente
      const includes = [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'description', 'price', 'duration']
        },
        {
          model: Service,
          as: 'services', // Múltiples servicios
          through: { 
            attributes: ['price', 'duration', 'order'],
            as: 'appointmentService'
          }
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ];

      // Solo agregar paidBy si se solicita explícitamente
      if (includePaymentInfo === 'true') {
        includes.push({
          model: User,
          as: 'paidBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        });
      }

      // Incluir recibo si se solicita
      if (includeReceipt === 'true') {
        const Receipt = require('../models/Receipt');
        includes.push({
          model: Receipt,
          as: 'receipt',
          required: false,
          attributes: ['id', 'receiptNumber', 'totalAmount', 'createdAt']
        });
      }

      // Obtener citas del cliente
      const appointments = await Appointment.findAll({
        where: {
          clientId: clientId,
          businessId: businessId
        },
        include: includes,
        subQuery: false, // Forzar JOINs en lugar de subquery para manejar múltiples asociaciones User
        order: [['startTime', 'DESC']],
        attributes: [
          'id',
          'startTime',
          'endTime',
          'status',
          'paymentStatus',
          'totalAmount',
          'paidAmount',
          'discountAmount',
          'notes',
          'createdAt'
        ]
      });

      return res.json({
        success: true,
        data: appointments,
        count: appointments.length
      });

    } catch (error) {
      console.error('Error al obtener historial de citas del cliente:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener historial de citas'
      });
    }
  }
}

/**
 * Procesar turnos sin asistencia (No Shows)
 * POST /api/appointments/process-no-shows
 * Admin only - para ejecutar manualmente
 */
AppointmentController.processNoShows = async (req, res) => {
  try {
    const CronJobManager = require('../utils/CronJobManager');
    
    const result = await CronJobManager.runManualNoShowProcess();

    return res.json(result);

  } catch (error) {
    console.error('Error procesando No Shows:', error);
    return res.status(500).json({
      success: false,
      message: 'Error procesando turnos sin asistencia',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de No Shows
 * GET /api/appointments/no-show-stats/:businessId
 */
AppointmentController.getNoShowStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { days } = req.query;

    const CronJobManager = require('../utils/CronJobManager');
    
    const result = await CronJobManager.getNoShowStats(businessId, parseInt(days) || 30);

    return res.json(result);

  } catch (error) {
    console.error('Error obteniendo estadísticas de No Show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

module.exports = AppointmentController;