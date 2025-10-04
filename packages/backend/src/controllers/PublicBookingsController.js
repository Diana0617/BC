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
const TimeSlotService = require('../services/TimeSlotService');
const WompiService = require('../services/WompiService');
const { validationResult } = require('express-validator');

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

      // Verificar si el negocio tiene habilitado Online Bookings
      const appointmentSettings = business.settings?.appointments || {};
      if (!appointmentSettings.allowOnlineBooking) {
        return res.status(404).json({
          success: false,
          message: 'Este negocio no tiene habilitadas las reservas online'
        });
      }

      // Obtener servicios activos del negocio
      const services = await Service.findAll({
        where: {
          businessId: business.id,
          status: 'ACTIVE'
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
          attributes: ['id', 'name', 'email'],
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
        attributes: ['id', 'specialties', 'bio', 'experienceYears'],
        order: [['user', 'name', 'ASC']]
      });

      // Formatear respuesta
      const formattedSpecialists = specialists.map(specialist => ({
        id: specialist.id,
        name: specialist.user.name,
        specialties: specialist.specialties || [],
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
      if (serviceId) {
        const service = await Service.findOne({
          where: {
            id: serviceId,
            businessId: business.id,
            status: 'ACTIVE'
          }
        });

        if (!service) {
          return res.status(404).json({
            success: false,
            message: 'Servicio no encontrado'
          });
        }
      }

      // Verificar que el especialista existe y pertenece al negocio (si se especifica)
      if (specialistId) {
        const specialist = await SpecialistProfile.findOne({
          where: {
            id: specialistId,
            businessId: business.id,
            status: 'ACTIVE'
          }
        });

        if (!specialist) {
          return res.status(404).json({
            success: false,
            message: 'Especialista no encontrado'
          });
        }
      }

      // Obtener duración del servicio para calcular slots
      let duration = 30; // default
      if (serviceId) {
        const service = await Service.findByPk(serviceId);
        duration = service.duration;
      }

      // Usar TimeSlotService para obtener disponibilidad
      const availability = await TimeSlotService.getAvailability({
        businessId: business.id,
        specialistId: specialistId || undefined,
        startDate,
        endDate,
        duration,
        status: 'AVAILABLE'
      });

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
    const transaction = await Sequelize.transaction();

    try {
      const { businessCode } = req.params;
      const {
        serviceId,
        specialistId,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        paymentMethod = 'WOMPI'
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

      // Verificar configuración de bookings online
      const appointmentSettings = business.settings?.appointments || {};
      if (!appointmentSettings.allowOnlineBooking) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Reservas online no habilitadas para este negocio'
        });
      }

      // Verificar que el servicio existe
      const service = await Service.findOne({
        where: {
          id: serviceId,
          businessId: business.id,
          status: 'ACTIVE'
        },
        transaction
      });

      if (!service) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      // Verificar que el especialista existe
      const specialist = await SpecialistProfile.findOne({
        where: {
          id: specialistId,
          businessId: business.id,
          status: 'ACTIVE'
        },
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
        client = await Client.create({
          businessId: business.id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          status: 'ACTIVE'
        }, { transaction });
      }

      // Combinar fecha y hora
      const appointmentDateTime = new Date(`${date}T${time}`);

      // Verificar que el slot esté disponible
      const isAvailable = await TimeSlotService.checkSlotAvailability({
        businessId: business.id,
        specialistId,
        date: date,
        time: time,
        duration: service.duration
      });

      if (!isAvailable) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'El horario seleccionado ya no está disponible'
        });
      }

      // Generar código único para la reserva
      const bookingCode = `BK-${Date.now().toString().slice(-6)}`;

      // Determinar estado inicial basado en método de pago
      let initialStatus = 'PENDING_PAYMENT';
      if (paymentMethod === 'CASH' || paymentMethod === 'BANK_TRANSFER') {
        initialStatus = 'PENDING_CONFIRMATION';
      }

      // Crear la cita
      const appointment = await Appointment.create({
        businessId: business.id,
        clientId: client.id,
        specialistId,
        serviceId,
        date: appointmentDateTime,
        duration: service.duration,
        price: service.price,
        status: initialStatus,
        notes: notes || '',
        bookingCode,
        paymentMethod,
        paymentStatus: paymentMethod === 'WOMPI' ? 'PENDING' : 'PENDING',
        source: 'ONLINE_BOOKING'
      }, { transaction });

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
            totalAmount: service.price,
            paymentMethod,
            date: appointment.date,
            duration: service.duration,
            service: {
              name: service.name,
              price: service.price
            },
            specialist: {
              name: specialist.user.name
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
}

module.exports = PublicBookingsController;