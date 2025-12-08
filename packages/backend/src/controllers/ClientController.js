const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const Voucher = require('../models/Voucher');
const CustomerBookingBlock = require('../models/CustomerBookingBlock');
const ConsentSignature = require('../models/ConsentSignature');
const Service = require('../models/Service');
const User = require('../models/User');
const ConsentTemplate = require('../models/ConsentTemplate');
const { Op } = require('sequelize');

/**
 * ClientController
 * Gestiona los clientes del negocio
 */
class ClientController {
  /**
   * Buscar clientes por nombre o teléfono
   * GET /api/business/:businessId/clients/search?q=juan
   */
  async searchClients(req, res) {
    try {
      const { businessId } = req.params;
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.json({ success: true, data: [] });
      }

      const searchTerm = q.trim();

      const clients = await Client.findAll({
        where: {
          businessId: businessId, // 🔒 CRÍTICO: Filtrar por businessId
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } },
            { phone: { [Op.iLike]: `%${searchTerm}%` } },
            { email: { [Op.iLike]: `%${searchTerm}%` } }
          ],
          status: 'ACTIVE'
        },
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
        limit: 10,
        order: [['firstName', 'ASC']]
      });

      // Formatear resultados
      const results = clients.map(client => ({
        id: client.id,
        name: `${client.firstName} ${client.lastName}`.trim(),
        phone: client.phone,
        email: client.email
      }));

      return res.json({ success: true, data: results });
    } catch (error) {
      console.error('❌ Error en searchClients:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al buscar clientes',
        error: error.message
      });
    }
  }

  /**
   * Listar todos los clientes de un negocio
   * GET /api/business/:businessId/clients
   */
  async listClients(req, res) {
    try {
      const { businessId } = req.params;
      const { status, search, sortBy = 'recent', timeRange = '30' } = req.query;

      // Calcular fecha de inicio según rango
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // 🔒 CRÍTICO: SIEMPRE filtrar por businessId para evitar fuga de datos
      const whereClause = {
        businessId: businessId // ✅ Filtro obligatorio por negocio
      };
      
      if (status && status !== 'all') {
        if (status === 'blocked') {
          whereClause.status = 'BLOCKED';
        } else if (status === 'active') {
          whereClause.status = 'ACTIVE';
        }
      }

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Obtener clientes con conteos
      const clients = await Client.findAll({
        where: whereClause,
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'phone',
          'avatar',
          'status',
          'lastAppointment',
          'createdAt'
        ],
        order: this.getSortOrder(sortBy)
      });

      // Enriquecer con estadísticas
      const enrichedClients = await Promise.all(
        clients.map(async (client) => {
          const clientData = client.toJSON();

          // Contar citas totales
          const totalAppointments = await Appointment.count({
            where: {
              businessId,
              clientId: clientData.id
            }
          });

          // Contar citas completadas
          const completedAppointments = await Appointment.count({
            where: {
              businessId,
              clientId: clientData.id,
              status: 'COMPLETED'
            }
          });

          // Contar cancelaciones
          const cancellationsCount = await Appointment.count({
            where: {
              businessId,
              clientId: clientData.id,
              status: 'CANCELED'
            }
          });

          // Contar vouchers activos (si la tabla existe)
          let activeVouchersCount = 0;
          try {
            activeVouchersCount = await Voucher.count({
              where: {
                businessId,
                customerId: clientData.id,
                status: 'ACTIVE',
                expiresAt: { [Op.gt]: new Date() }
              }
            });
          } catch (error) {
            // Tabla vouchers no existe aún, devolver 0
            if (error.parent?.code !== '42P01') {
              throw error; // Re-lanzar si es otro tipo de error
            }
          }

          // Verificar si está bloqueado (si la tabla existe)
          let blockRecord = null;
          try {
            blockRecord = await CustomerBookingBlock.findOne({
              where: {
                businessId,
                customerId: clientData.id,
                status: 'ACTIVE',
                expiresAt: { [Op.gt]: new Date() }
              }
            });
          } catch (error) {
            // Tabla customer_booking_blocks no existe aún, devolver null
            if (error.parent?.code !== '42P01') {
              throw error;
            }
          }

          // Calcular total gastado
          const appointments = await Appointment.findAll({
            where: {
              businessId,
              clientId: clientData.id,
              status: { [Op.in]: ['COMPLETED', 'CONFIRMED'] }
            },
            attributes: ['totalAmount']
          });

          const totalSpent = appointments.reduce(
            (sum, apt) => sum + (parseFloat(apt.totalAmount) || 0),
            0
          );

          // Contar consentimientos firmados
          let consentsCount = 0;
          try {
            consentsCount = await ConsentSignature.count({
              where: {
                businessId,
                customerId: clientData.id
              }
            });
          } catch (error) {
            // Tabla consent_signatures no existe aún, devolver 0
            if (error.parent?.code !== '42P01') {
              throw error;
            }
          }

          return {
            id: clientData.id,
            name: `${clientData.firstName} ${clientData.lastName}`,
            email: clientData.email,
            phone: clientData.phone,
            avatar: clientData.avatar,
            totalAppointments,
            completedAppointments,
            cancellationsCount,
            activeVouchersCount,
            consentsCount,
            isBlocked: blockRecord !== null || clientData.status === 'BLOCKED',
            blockReason: blockRecord?.reason || null,
            lastAppointment: clientData.lastAppointment,
            totalSpent,
            createdAt: clientData.createdAt
          };
        })
      );

      res.json({
        success: true,
        data: enrichedClients,
        total: enrichedClients.length
      });
    } catch (error) {
      console.error('Error listing clients:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener la lista de clientes'
      });
    }
  }

  /**
   * Obtener detalles de un cliente específico
   * GET /api/business/:businessId/clients/:clientId
   */
  async getClientDetails(req, res) {
    try {
      const { businessId, clientId } = req.params;

      // 🔒 CRÍTICO: Buscar con businessId Y clientId para evitar acceso cruzado
      const client = await Client.findOne({
        where: {
          id: clientId,
          businessId: businessId // ✅ Verificar que pertenece al negocio
        },
        attributes: { exclude: ['password'] }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      // Obtener citas del cliente
      const appointments = await Appointment.findAll({
        where: {
          businessId,
          clientId: clientId
        },
        order: [['dateTime', 'DESC']],
        limit: 50
      });

      // Obtener vouchers (si la tabla existe)
      let vouchers = [];
      try {
        vouchers = await Voucher.findAll({
          where: {
            businessId,
            customerId: clientId
          },
          order: [['createdAt', 'DESC']]
        });
      } catch (error) {
        // Tabla vouchers no existe aún, devolver array vacío
        if (error.parent?.code !== '42P01') {
          throw error;
        }
      }

      // Obtener historial de bloqueos (si la tabla existe)
      let blockHistory = [];
      try {
        blockHistory = await CustomerBookingBlock.findAll({
          where: {
            businessId,
            customerId: clientId
          },
          order: [['createdAt', 'DESC']]
        });
      } catch (error) {
        // Tabla customer_booking_blocks no existe aún, devolver array vacío
        if (error.parent?.code !== '42P01') {
          throw error;
        }
      }

      res.json({
        success: true,
        data: {
          client: client.toJSON(),
          appointments,
          vouchers,
          blockHistory
        }
      });
    } catch (error) {
      console.error('Error getting client details:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalles del cliente'
      });
    }
  }

  /**
   * Crear nuevo cliente
   * POST /api/business/:businessId/clients
   */
  async createClient(req, res) {
    try {
      const { businessId } = req.params;
      const {
        firstName,
        lastName,
        email,
        phone,
        phoneSecondary,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        zipCode,
        notes
      } = req.body;

      // Validar campos requeridos
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, apellido y email son requeridos'
        });
      }

      // 🔒 CRÍTICO: Verificar email duplicado SOLO dentro del mismo negocio
      const existingClient = await Client.findOne({
        where: { 
          email,
          businessId: businessId // ✅ Verificar duplicado solo en este negocio
        }
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un cliente con ese email en este negocio'
        });
      }

      // Validar y limpiar fecha de nacimiento
      let validDateOfBirth = null;
      if (dateOfBirth && dateOfBirth !== 'Invalid date' && dateOfBirth.trim() !== '') {
        const parsedDate = new Date(dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          validDateOfBirth = parsedDate;
        }
      }

      // 🔒 CRÍTICO: SIEMPRE guardar el businessId con el cliente
      const newClient = await Client.create({
        businessId: businessId, // ✅ Asociar cliente al negocio
        firstName,
        lastName,
        email,
        phone: phone || null,
        phoneSecondary: phoneSecondary || null,
        dateOfBirth: validDateOfBirth,
        gender: gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        notes: notes || null,
        status: 'ACTIVE'
      });

      res.status(201).json({
        success: true,
        data: newClient,
        message: 'Cliente creado exitosamente'
      });
    } catch (error) {
      console.error('Error creating client:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al crear el cliente'
      });
    }
  }

  /**
   * Actualizar cliente
   * PUT /api/business/:businessId/clients/:clientId
   */
  async updateClient(req, res) {
    try {
      const { clientId } = req.params;
      const updateData = req.body;

      // No permitir actualizar ciertos campos
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Validar y limpiar fecha de nacimiento si está presente
      if ('dateOfBirth' in updateData) {
        if (!updateData.dateOfBirth || 
            updateData.dateOfBirth === 'Invalid date' || 
            updateData.dateOfBirth.trim() === '') {
          updateData.dateOfBirth = null;
        } else {
          const parsedDate = new Date(updateData.dateOfBirth);
          if (isNaN(parsedDate.getTime())) {
            updateData.dateOfBirth = null;
          }
        }
      }

      // Convertir campos vacíos a null
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      // 🔒 CRÍTICO: Verificar que el cliente pertenece al negocio
      const client = await Client.findOne({
        where: {
          id: clientId,
          businessId: businessId // ✅ Verificar propiedad
        }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      await client.update(updateData);

      res.json({
        success: true,
        data: client,
        message: 'Cliente actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el cliente'
      });
    }
  }

  /**
   * Bloquear/Desbloquear cliente
   * PATCH /api/business/:businessId/clients/:clientId/status
   */
  async toggleClientStatus(req, res) {
    try {
      const { businessId, clientId } = req.params;
      const { status, reason } = req.body;

      // 🔒 CRÍTICO: Verificar que el cliente pertenece al negocio
      const client = await Client.findOne({
        where: {
          id: clientId,
          businessId: businessId // ✅ Verificar propiedad
        }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      await client.update({ status });

      // Si se bloquea, crear registro de bloqueo (si la tabla existe)
      if (status === 'BLOCKED') {
        try {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Bloqueo de 30 días por defecto
          
          await CustomerBookingBlock.create({
            businessId,
            customerId: clientId,
            reason: 'MANUAL',
            status: 'ACTIVE',
            blockedAt: new Date(),
            expiresAt,
            cancellationCount: 0,
            notes: reason || 'Bloqueado manualmente'
          });
        } catch (error) {
          // Tabla customer_booking_blocks no existe aún, solo actualizar status
          if (error.parent?.code !== '42P01') {
            throw error;
          }
        }
      }

      res.json({
        success: true,
        data: client,
        message: `Cliente ${status === 'BLOCKED' ? 'bloqueado' : 'activado'} exitosamente`
      });
    } catch (error) {
      console.error('Error toggling client status:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar el estado del cliente'
      });
    }
  }

  /**
   * Helper: Obtener orden de ordenamiento
   */
  getSortOrder(sortBy) {
    switch (sortBy) {
      case 'name_asc':
        return [['firstName', 'ASC'], ['lastName', 'ASC']];
      case 'name_desc':
        return [['firstName', 'DESC'], ['lastName', 'DESC']];
      case 'email_asc':
        return [['email', 'ASC']];
      case 'email_desc':
        return [['email', 'DESC']];
      case 'recent':
      default:
        return [['createdAt', 'DESC']];
    }
  }

  /**
   * Obtener historial completo del cliente
   * GET /api/business/:businessId/clients/:clientId/history
   */
  async getClientHistory(req, res) {
    try {
      const { businessId, clientId } = req.params;

      console.log('📋 Obteniendo historial del cliente:', clientId);

      // 🔒 CRÍTICO: Verificar que el cliente pertenece al negocio
      const client = await Client.findOne({
        where: {
          id: clientId,
          businessId: businessId // ✅ Verificar propiedad
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'medicalInfo', 'notes']
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente no encontrado'
        });
      }

      // 1. Obtener todas las citas del cliente
      const appointments = await Appointment.findAll({
        where: {
          businessId,
          clientId,
          status: {
            [Op.in]: ['COMPLETED', 'IN_PROGRESS', 'CONFIRMED', 'CANCELED']
          }
        },
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'category', 'duration', 'requiresConsent']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: ConsentSignature,
            as: 'consentSignature',
            attributes: ['id', 'signedAt', 'signedPdfUrl'],
            include: [
              {
                model: ConsentTemplate,
                as: 'template',
                attributes: ['id', 'title', 'version']
              }
            ]
          }
        ],
        order: [['startTime', 'DESC']],
        limit: 50 // Últimas 50 citas
      });

      // 2. Obtener todos los consentimientos firmados
      const consents = await ConsentSignature.findAll({
        where: {
          businessId,
          customerId: clientId
        },
        include: [
          {
            model: ConsentTemplate,
            as: 'template',
            attributes: ['id', 'title', 'version', 'category']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name']
          }
        ],
        order: [['signedAt', 'DESC']]
      });

      // 3. Obtener historial de cancelaciones
      const cancellations = await Appointment.findAll({
        where: {
          businessId,
          clientId,
          status: 'CANCELED'
        },
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'canceledByUser',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        attributes: ['id', 'startTime', 'canceledAt', 'cancelReason'],
        order: [['canceledAt', 'DESC']],
        limit: 20
      });

      // 4. Obtener bloqueos activos
      const blocks = await CustomerBookingBlock.findAll({
        where: {
          businessId,
          customerId: clientId,
          status: {
            [Op.in]: ['ACTIVE', 'LIFTED']
          }
        },
        order: [['blockedAt', 'DESC']]
      });

      // 5. Obtener vouchers
      const vouchers = await Voucher.findAll({
        where: {
          businessId,
          customerId: clientId
        },
        order: [['createdAt', 'DESC']]
      });

      // Formatear respuesta
      const history = {
        client: {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          dateOfBirth: client.dateOfBirth,
          medicalInfo: client.medicalInfo,
          notes: client.notes
        },
        statistics: {
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(a => a.status === 'COMPLETED').length,
          canceledAppointments: cancellations.length,
          activeBlocks: blocks.filter(b => b.status === 'ACTIVE').length,
          totalConsents: consents.length,
          availableVouchers: vouchers.filter(v => v.status === 'ACTIVE' && new Date(v.expiresAt) > new Date()).length
        },
        appointments: appointments.map(apt => ({
          id: apt.id,
          appointmentNumber: apt.appointmentNumber,
          startTime: apt.startTime,
          endTime: apt.endTime,
          status: apt.status,
          service: apt.service ? {
            id: apt.service.id,
            name: apt.service.name,
            category: apt.service.category,
            duration: apt.service.duration
          } : null,
          specialist: apt.specialist ? {
            id: apt.specialist.id,
            name: `${apt.specialist.firstName} ${apt.specialist.lastName}`
          } : null,
          evidence: apt.evidence || { before: [], after: [], documents: [] },
          specialistNotes: apt.specialistNotes,
          rating: apt.rating,
          feedback: apt.feedback,
          hasConsent: apt.hasConsent,
          consentSignature: apt.consentSignature ? {
            id: apt.consentSignature.id,
            signedAt: apt.consentSignature.signedAt,
            pdfUrl: apt.consentSignature.signedPdfUrl,
            template: apt.consentSignature.template
          } : null,
          totalAmount: apt.totalAmount,
          paidAmount: apt.paidAmount,
          paymentStatus: apt.paymentStatus
        })),
        consents: consents.map(consent => ({
          id: consent.id,
          signedAt: consent.signedAt,
          pdfUrl: consent.signedPdfUrl,
          template: consent.template ? {
            id: consent.template.id,
            title: consent.template.title,
            version: consent.template.version,
            category: consent.template.category
          } : null,
          service: consent.service ? {
            id: consent.service.id,
            name: consent.service.name
          } : null
        })),
        cancellations: cancellations.map(cancel => ({
          id: cancel.id,
          appointmentDate: cancel.startTime,
          canceledAt: cancel.canceledAt,
          reason: cancel.cancelReason,
          service: cancel.service ? {
            id: cancel.service.id,
            name: cancel.service.name
          } : null,
          canceledBy: cancel.canceledByUser ? {
            id: cancel.canceledByUser.id,
            name: `${cancel.canceledByUser.firstName} ${cancel.canceledByUser.lastName}`
          } : null
        })),
        blocks: blocks.map(block => ({
          id: block.id,
          status: block.status,
          reason: block.reason,
          blockedAt: block.blockedAt,
          expiresAt: block.expiresAt,
          liftedAt: block.liftedAt,
          cancellationCount: block.cancellationCount,
          notes: block.notes
        })),
        vouchers: vouchers.map(voucher => ({
          id: voucher.id,
          code: voucher.code,
          type: voucher.type,
          value: voucher.value,
          status: voucher.status,
          expiresAt: voucher.expiresAt,
          usedAt: voucher.usedAt,
          reason: voucher.reason
        }))
      };

      console.log('✅ Historial obtenido:', {
        totalAppointments: history.appointments.length,
        totalConsents: history.consents.length,
        totalCancellations: history.cancellations.length
      });

      return res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('❌ Error al obtener historial del cliente:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener el historial del cliente'
      });
    }
  }
}

module.exports = new ClientController();
