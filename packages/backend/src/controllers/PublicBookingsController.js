/**
 * 🏨 PUBLIC BOOKINGS CONTROLLER
 *
 * Controlador para reservas online públicas (sin autenticación)
 * Permite a clientes consultar servicios, especialistas y disponibilidad, y crear reservas
 */

const {
  Business,
  Service,
  SpecialistProfile,
  User,
  Appointment,
  Client
} = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const TimeSlotService = require('../services/TimeSlotService');
const WompiService = require('../services/WompiService');
const { validationResult } = require('express-validator');
const BusinessRuleService = require('../services/BusinessRuleService');


class PublicBookingsController {

  /**
   * Obtener servicios disponibles de un negocio
   * GET /api/public/bookings/business/{businessCode}/services
   */
  static async getServices(req, res) {
    try {
      const { businessCode } = req.params;

      // Buscar negocio por subdomain (businessCode)
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado o no disponible para reservas online'
        });
      }

      // Verificar si el negocio tiene habilitadas las reservas online (regla de negocio)
      const onlineBookingEnabled = await BusinessRuleService.getRuleValue(
        business.id,
        'RESERVAS_ONLINE_HABILITADAS'
      );

      if (!onlineBookingEnabled) {
        return res.status(404).json({
          success: false,
          message: 'Este negocio no tiene habilitadas las reservas online'
        });
      }

      // Obtener servicios activos del negocio
      const services = await Service.findAll({
        where: {
          businessId: business.id,
          isActive: true
        },
        attributes: [
          'id',
          'name',
          'description',
          'duration',
          'price',
          'category'
        ],
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      res.json({
        success: true,
        data: services
      });

    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener especialistas disponibles
   * GET /api/public/bookings/business/{businessCode}/specialists
   */
  static async getSpecialists(req, res) {
    try {
      const { businessCode } = req.params;
      const { serviceId, branchId } = req.query;

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Construir consulta para especialistas
      let whereCondition = {
        businessId: business.id,
        status: 'ACTIVE'
      };

      // Includes base
      const includeOptions = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: true
        },
        {
          model: require('../models/Branch'),
          as: 'branches',
          through: { attributes: [] },
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ];

      // Si se especifica una sucursal, filtrar especialistas de esa sucursal
      if (branchId) {
        includeOptions[1].where = { id: branchId };
        includeOptions[1].required = true; // INNER JOIN para filtrar por sucursal
      }

      // Si se especifica un servicio, filtrar especialistas que lo ofrecen
      if (serviceId) {
        includeOptions.push({
          model: Service,
          as: 'services',
          where: { id: serviceId },
          attributes: ['id', 'name', 'price'],
          required: true
        });
      } else {
        includeOptions.push({
          model: Service,
          as: 'services',
          attributes: ['id', 'name', 'price'],
          required: false
        });
      }

      // Obtener especialistas
      const specialists = await SpecialistProfile.findAll({
        where: whereCondition,
        include: includeOptions,
        attributes: ['id', 'specialization', 'biography', 'experience', 'skills'],
        order: [[{ model: User, as: 'user' }, 'firstName', 'ASC']]
      });

      // Formatear respuesta
      const formattedSpecialists = specialists.map(specialist => ({
        id: specialist.id, // ID del SpecialistProfile (para compatibilidad con frontend y schedules)
        userId: specialist.userId, // userId del User (para crear appointments)
        name: `${specialist.user.firstName} ${specialist.user.lastName}`.trim(),
        specialization: specialist.specialization,
        skills: specialist.skills || [],
        branches: specialist.branches?.map(branch => ({
          id: branch.id,
          name: branch.name,
          code: branch.code
        })) || [],
        services: specialist.services?.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price
        })) || []
      }));

      res.json({
        success: true,
        data: formattedSpecialists
      });

    } catch (error) {
      console.error('Error al obtener especialistas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Consultar disponibilidad de slots
   * GET /api/public/bookings/business/{businessCode}/availability
   */
  static async getAvailability(req, res) {
    try {
      const { businessCode } = req.params;
      const {
        startDate,
        endDate,
        serviceId,
        specialistId
      } = req.query;

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar que el servicio existe y pertenece al negocio
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId: business.id,
          isActive: true
        }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      // Verificar que el especialista existe y pertenece al negocio (specialistId es el SpecialistProfile.id)
      console.log('🔍 Buscando especialista con id:', specialistId, 'businessId:', business.id);
      const specialistProfile = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: business.id,
          status: 'ACTIVE'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      });

      console.log('✅ Especialista encontrado:', specialistProfile ? {
        id: specialistProfile.id,
        userId: specialistProfile.userId,
        specialization: specialistProfile.specialization
      } : 'NO ENCONTRADO');

      if (!specialistProfile) {
        return res.status(404).json({
          success: false,
          message: 'Especialista no encontrado'
        });
      }

      // Obtener sucursales donde el especialista tiene horarios configurados
      const { SpecialistBranchSchedule, Branch } = require('../models');
      console.log('🔍 Buscando schedules para specialistProfile.id:', specialistProfile.id);
      const scheduledBranches = await SpecialistBranchSchedule.findAll({
        where: {
          specialistId: specialistProfile.id,
          isActive: true
        },
        include: [{
          model: Branch,
          as: 'branch',
          where: {
            businessId: business.id,
            status: 'ACTIVE'
          }
        }],
        attributes: ['branchId'],
        group: ['branchId', 'branch.id', 'branch.name', 'branch.address']
      });

      console.log('✅ Schedules encontrados:', scheduledBranches.length, 'sucursales');

      // Extraer las sucursales únicas
      const branches = scheduledBranches
        .map(schedule => schedule.branch)
        .filter((branch, index, self) => 
          index === self.findIndex(b => b.id === branch.id)
        );
      
      if (!branches || branches.length === 0) {
        return res.json({
          success: true,
          data: {}
        });
      }

      // Generar slots para cada día del rango
      const availability = {};
      const start = new Date(startDate);
      const end = new Date(endDate);
      const specialistName = `${specialistProfile.user.firstName} ${specialistProfile.user.lastName}`;

      // Iterar por cada día del rango
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        availability[dateStr] = [];

        // Generar slots para cada sucursal donde el especialista tiene horarios
        for (const branch of branches) {
          try {
            const AvailabilityService = require('../services/AvailabilityService');
            const result = await AvailabilityService.generateAvailableSlots({
              businessId: business.id,
              branchId: branch.id,
              specialistId: specialistProfile.id, // Usar specialistProfile.id para schedules
              serviceId: service.id,
              date: dateStr
            });

            // Si hay slots disponibles, agregarlos con info de sucursal
            if (result.slots && result.slots.length > 0) {
              result.slots.forEach(slot => {
                availability[dateStr].push({
                  time: slot.startTime,
                  endTime: slot.endTime,
                  specialistId: specialistProfile.id, // SpecialistProfile.id para consistency
                  specialistName: specialistName,
                  branchId: branch.id,
                  branchName: branch.name,
                  branchAddress: branch.address || 'Dirección no disponible'
                });
              });
            }
          } catch (error) {
            console.log(`No hay disponibilidad para ${branch.name} el ${dateStr}:`, error.message);
            // Continuar con la siguiente sucursal
          }
        }

        // Ordenar slots por tiempo
        availability[dateStr].sort((a, b) => a.time.localeCompare(b.time));
      }

      res.json({
        success: true,
        data: availability
      });

    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear una reserva online
   * POST /api/public/bookings/business/{businessCode}
   */
  static async createBooking(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { businessCode } = req.params;
      const {
        serviceId,
        services = [], // Array de servicios múltiples
        totalPrice = 0,
        totalDuration = 0,
        specialistId,
        branchId,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        paymentMethod = 'WOMPI',
        paymentProofUrl = null
      } = req.body;

      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        },
        transaction
      });

      if (!business) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Verificar si el negocio tiene habilitadas las reservas online (regla de negocio)
      const onlineBookingEnabled = await BusinessRuleService.getRuleValue(
        business.id,
        'RESERVAS_ONLINE_HABILITADAS'
      );

      if (!onlineBookingEnabled) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Reservas online no habilitadas para este negocio'
        });
      }

      // Determinar servicios a procesar (múltiples o uno solo para backward compatibility)
      const servicesToProcess = services.length > 0 ? services : (serviceId ? [{ id: serviceId }] : []);
      
      if (servicesToProcess.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Debe seleccionar al menos un servicio'
        });
      }

      // Verificar que todos los servicios existen y calcular totales
      const serviceRecords = [];
      let calculatedTotalPrice = 0;
      let calculatedTotalDuration = 0;

      for (const svcData of servicesToProcess) {
        const service = await Service.findOne({
          where: {
            id: svcData.id,
            businessId: business.id,
            isActive: true
          },
          transaction
        });

        if (!service) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Servicio ${svcData.id} no encontrado`
          });
        }

        serviceRecords.push(service);
        calculatedTotalPrice += parseFloat(service.price);
        calculatedTotalDuration += parseInt(service.duration);
      }

      // Usar el primer servicio para backward compatibility
      const service = serviceRecords[0];

      if (!service) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      // Verificar que el especialista existe (specialistId es SpecialistProfile.id)
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: business.id,
          status: 'ACTIVE'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }],
        transaction
      });

      if (!specialist) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Especialista no encontrado'
        });
      }

      // Verificar que el especialista ofrece el servicio
      const specialistServices = await specialist.getServices({ transaction });
      const offersService = specialistServices.some(s => s.id === serviceId);

      if (!offersService) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'El especialista seleccionado no ofrece este servicio'
        });
      }

      // Crear o encontrar cliente
      let client = await Client.findOne({
        where: {
          businessId: business.id,
          email: clientEmail
        },
        transaction
      });

      if (!client) {
        // Dividir nombre completo en firstName y lastName
        const nameParts = clientName.trim().split(' ');
        const firstName = nameParts[0] || clientName;
        const lastName = nameParts.slice(1).join(' ') || clientName;

        try {
          client = await Client.create({
            businessId: business.id,
            firstName,
            lastName,
            email: clientEmail,
            phone: clientPhone,
            status: 'ACTIVE'
          }, { transaction });
        } catch (createError) {
          // Si falla por duplicate key, intentar buscar nuevamente SIN transacción
          // porque la transacción ya está abortada por el error del create
          if (createError.name === 'SequelizeUniqueConstraintError') {
            console.log('⚠️ Cliente duplicado, buscando sin transacción...');
            client = await Client.findOne({
              where: {
                businessId: business.id,
                email: clientEmail
              }
              // NO usar transaction aquí porque está abortada
            });
            
            if (!client) {
              // Si aún no existe, el problema es que el email existe en otro negocio
              console.error('❌ Email ya existe en otro negocio:', clientEmail);
              await transaction.rollback();
              return res.status(400).json({
                success: false,
                message: 'Este email ya está registrado. Por favor, contacta al negocio para actualizar tus datos.'
              });
            }
          } else {
            throw createError;
          }
        }
      }

      // Combinar fecha y hora
      const appointmentDateTime = new Date(`${date}T${time}`);
      
      // Calcular startTime y endTime usando la duración total
      const startTime = appointmentDateTime;
      const endTime = new Date(appointmentDateTime.getTime() + calculatedTotalDuration * 60000);

      // Generar código único para la reserva
      const bookingCode = `BK-${Date.now().toString().slice(-6)}`;

      // Determinar estado inicial - Las reservas online siempre inician como PENDING
      const initialStatus = 'PENDING';

      // Crear la cita con totalAmount correcto
      const appointment = await Appointment.create({
        businessId: business.id,
        branchId: branchId || null,
        clientId: client.id,
        specialistId: specialist.userId, // Usar userId para foreign key a users
        serviceId: service.id, // Servicio principal para backward compatibility
        startTime,
        endTime,
        totalAmount: calculatedTotalPrice,
        paidAmount: 0,
        discountAmount: 0,
        status: initialStatus,
        notes: notes || '',
        bookingCode,
        paymentMethod,
        paymentStatus: paymentProofUrl ? 'PENDING_VERIFICATION' : 'PENDING',
        paymentProofUrl: paymentProofUrl || null,
        source: 'ONLINE_BOOKING'
      }, { transaction });

      // 🔗 CREAR REGISTROS EN APPOINTMENTSERVICE PARA CADA SERVICIO
      const AppointmentService = require('../models/AppointmentService');
      for (let i = 0; i < serviceRecords.length; i++) {
        const svc = serviceRecords[i];
        
        await AppointmentService.create({
          appointmentId: appointment.id,
          serviceId: svc.id,
          price: parseFloat(svc.price),
          duration: parseInt(svc.duration),
          order: i
        }, { transaction });
      }

      // Si es pago con Wompi, crear transacción
      let paymentUrl = null;
      if (paymentMethod === 'WOMPI') {
        try {
          const wompiConfig = business.settings?.payments?.wompi;
          if (!wompiConfig?.publicKey || !wompiConfig?.privateKey) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Configuración de Wompi no encontrada'
            });
          }

          const paymentData = {
            amount: service.price * 100, // Wompi espera centavos
            currency: business.currency,
            reference: bookingCode,
            description: `Reserva ${service.name} - ${clientName}`,
            customer: {
              name: clientName,
              email: clientEmail,
              phone: clientPhone
            },
            redirectUrl: `${process.env.FRONTEND_URL}/booking/confirmation/${bookingCode}`,
            webhookUrl: `${process.env.BACKEND_URL}/api/wompi/webhook`
          };

          const wompiResponse = await WompiService.createPayment(paymentData, wompiConfig.privateKey);
          paymentUrl = wompiResponse.paymentUrl;

          // Actualizar cita con ID de transacción Wompi
          await appointment.update({
            wompiTransactionId: wompiResponse.transactionId
          }, { transaction });

        } catch (wompiError) {
          console.error('Error creando pago Wompi:', wompiError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Error procesando pago online'
          });
        }
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: {
          booking: {
            id: appointment.id,
            code: bookingCode,
            status: appointment.status,
            totalAmount: calculatedTotalPrice,
            paymentMethod,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            duration: calculatedTotalDuration,
            service: {
              name: service.name,
              price: service.price
            },
            services: serviceRecords.map(svc => ({
              id: svc.id,
              name: svc.name,
              price: svc.price,
              duration: svc.duration
            })),
            specialist: {
              name: `${specialist.user.firstName} ${specialist.user.lastName}`.trim()
            },
            client: {
              name: clientName,
              email: clientEmail
            }
          },
          paymentUrl
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error creando reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener información de pago
   * GET /api/public/bookings/business/{businessCode}/payment-info
   */
  static async getPaymentInfo(req, res) {
    try {
      const { businessCode } = req.params;
      const { paymentMethod } = req.query;

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      if (paymentMethod === 'BANK_TRANSFER') {
        // Obtener configuración bancaria del negocio
        const paymentConfig = business.settings?.payments || {};

        if (!paymentConfig.bankInfo) {
          return res.status(404).json({
            success: false,
            message: 'Información bancaria no configurada'
          });
        }

        res.json({
          success: true,
          data: {
            bankInfo: paymentConfig.bankInfo
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Método de pago no soportado'
        });
      }

    } catch (error) {
      console.error('Error al obtener información de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir comprobante de pago para reserva online
   * POST /api/public/bookings/business/{businessCode}/upload-proof/{bookingCode}
   */
  static async uploadPaymentProof(req, res) {
    try {
      const { businessCode, bookingCode } = req.params;
      const { notes } = req.body;

      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró el archivo del comprobante'
        });
      }

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Buscar la cita por código de reserva
      const appointment = await Appointment.findOne({
        where: {
          appointmentNumber: bookingCode,
          businessId: business.id,
          status: ['PENDING', 'CONFIRMED']
        },
        include: [
          {
            model: Client,
            attributes: ['firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Service,
            attributes: ['name', 'price']
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      // Subir archivo a Cloudinary
      const { cloudinary } = require('../config/cloudinary');
      const fs = require('fs').promises;

      try {
        // Leer el archivo
        const fileBuffer = await fs.readFile(req.file.path);

        // Determinar el tipo de archivo para Cloudinary
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        const resourceType = fileExtension === 'pdf' ? 'raw' : 'image';

        // Subir a Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder: `beauty-control/payment-proofs/${businessCode}`,
              public_id: `proof-${bookingCode}-${Date.now()}`,
              format: fileExtension === 'pdf' ? 'pdf' : undefined
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Convertir buffer a stream
          const { Readable } = require('stream');
          const readableStream = new Readable();
          readableStream.push(fileBuffer);
          readableStream.push(null);
          readableStream.pipe(uploadStream);
        });

        // Actualizar metadata de la cita con información del comprobante
        const currentMetadata = appointment.metadata || {};
        const paymentProofs = currentMetadata.paymentProofs || [];

        paymentProofs.push({
          uploadedAt: new Date(),
          fileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          notes: notes || '',
          status: 'PENDING_REVIEW'
        });

        await appointment.update({
          metadata: {
            ...currentMetadata,
            paymentProofs
          }
        });

        // Limpiar archivo temporal
        await fs.unlink(req.file.path);

        res.json({
          success: true,
          message: 'Comprobante de pago subido exitosamente',
          data: {
            fileUrl: uploadResult.secure_url,
            fileName: req.file.originalname
          }
        });

      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);

        // Limpiar archivo temporal en caso de error
        if (req.file.path) {
          await fs.unlink(req.file.path).catch(() => {});
        }

        return res.status(500).json({
          success: false,
          message: 'Error al subir el comprobante'
        });
      }

    } catch (error) {
      console.error('Error al subir comprobante:', error);

      // Limpiar archivo temporal en caso de error
      if (req.file && req.file.path) {
        require('fs').promises.unlink(req.file.path).catch(() => {});
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener métodos de pago configurados del negocio
   * GET /api/public/bookings/business/{businessCode}/payment-methods
   */
  static async getPaymentMethods(req, res) {
    try {
      const { businessCode } = req.params;

      // Buscar negocio por subdomain
      const business = await Business.findOne({
        where: {
          subdomain: businessCode,
          status: ['ACTIVE', 'TRIAL']
        },
        attributes: ['id', 'name', 'phone']
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      // Obtener métodos de pago activos del negocio
      const { PaymentMethod } = require('../models');
      const paymentMethods = await PaymentMethod.findAll({
        where: {
          businessId: business.id,
          isActive: true
        },
        order: [['order', 'ASC'], ['name', 'ASC']],
        attributes: ['id', 'name', 'type', 'requiresProof', 'icon', 'bankInfo', 'qrInfo', 'metadata', 'order']
      });

      res.json({
        success: true,
        data: {
          businessInfo: {
            name: business.name,
            phone: business.phone
          },
          paymentMethods: paymentMethods.map(pm => ({
            id: pm.id,
            name: pm.name,
            type: pm.type,
            requiresProof: pm.requiresProof,
            icon: pm.icon,
            bankInfo: pm.bankInfo,
            qrInfo: pm.qrInfo,
            metadata: pm.metadata,
            order: pm.order
          }))
        }
      });

    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = PublicBookingsController;