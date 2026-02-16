const Receipt = require('../models/Receipt');
const Appointment = require('../models/Appointment');
const AppointmentPayment = require('../models/AppointmentPayment');
const User = require('../models/User');
const Client = require('../models/Client');
const Business = require('../models/Business');
const { Op } = require('sequelize');

/**
 * Controlador para gestión de recibos
 */
class ReceiptController {
  
  /**
   * Crear un recibo desde una cita pagada
   */
  static async createFromAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      let { paymentData } = req.body;
      
      console.log('🧾 [ReceiptController] createFromAppointment - appointmentId:', appointmentId);
      console.log('🧾 [ReceiptController] paymentData from body:', paymentData);
      
      // Validar que la cita existe y está pagada
      console.log('🔍 [ReceiptController] Buscando appointment...');
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName'] },
          { model: Client, as: 'client', attributes: ['id', 'firstName', 'lastName', 'phone', 'email'] },
          { model: Business, as: 'business', attributes: ['id', 'name'] }
        ]
      });
      
      console.log('🔍 [ReceiptController] Appointment encontrado:', appointment ? 'Sí' : 'No');
      if (appointment) {
        console.log('🔍 [ReceiptController] Status:', appointment.status, 'PaymentStatus:', appointment.paymentStatus);
      }
      
      if (!appointment) {
        console.log('❌ [ReceiptController] Cita no encontrada');
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      if (appointment.status !== 'COMPLETED' || appointment.paymentStatus !== 'PAID') {
        console.log('❌ [ReceiptController] Estado inválido - status:', appointment.status, 'paymentStatus:', appointment.paymentStatus);
        return res.status(400).json({
          success: false,
          message: 'La cita debe estar completada y pagada para generar un recibo'
        });
      }
      
      console.log('✅ [ReceiptController] Cita válida, verificando si ya existe recibo...');
      
      // Verificar que no existe ya un recibo para esta cita (ANTES de construir paymentData)
      const existingReceipt = await Receipt.findOne({
        where: { appointmentId: appointment.id },
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
          { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });
      
      if (existingReceipt) {
        console.log('⚠️ [ReceiptController] Ya existe un recibo para esta cita:', existingReceipt.id);
        return res.status(200).json({
          success: true,
          message: 'Ya existe un recibo para esta cita',
          data: existingReceipt
        });
      }
      
      // Si no se proporcionó paymentData en el body, construirlo desde la cita
      if (!paymentData) {
        console.log('🔧 [ReceiptController] Construyendo paymentData desde la cita...');
        
        // Buscar el último pago registrado para esta cita
        const lastPayment = await AppointmentPayment.findOne({
          where: { appointmentId: appointment.id },
          order: [['paymentDate', 'DESC']],
          attributes: ['paymentMethodType', 'paymentMethodName', 'amount', 'reference']
        });
        
        console.log('🔍 [ReceiptController] Último pago encontrado:', lastPayment ? 'Sí' : 'No');
        if (lastPayment) {
          console.log('🔍 [ReceiptController] paymentMethodType:', lastPayment.paymentMethodType);
          console.log('🔍 [ReceiptController] paymentMethodName:', lastPayment.paymentMethodName);
        }
        
        paymentData = {
          amount: appointment.paidAmount || 0,
          method: lastPayment?.paymentMethodType || 'CASH',
          methodName: lastPayment?.paymentMethodName || 'Efectivo',
          transactionId: appointment.paymentTransactionId,
          reference: lastPayment?.reference || appointment.paymentReference
        };
        console.log('🔧 [ReceiptController] paymentData construido:', paymentData);
      }
      
      console.log('🆕 [ReceiptController] Creando nuevo recibo...');
      const appointmentJSON = appointment.toJSON();
      console.log('🔍 [ReceiptController] Appointment data keys:', Object.keys(appointmentJSON));
      console.log('🔍 [ReceiptController] userId:', appointmentJSON.userId);
      console.log('🔍 [ReceiptController] clientId:', appointmentJSON.clientId);
      console.log('🔍 [ReceiptController] startTime:', appointmentJSON.startTime);
      
      // Crear el recibo con retry logic para race conditions
      let receipt;
      let retries = 0;
      const maxRetries = 5;
      
      while (retries <= maxRetries) {
        try {
          console.log(`🔄 [ReceiptController] Intento ${retries + 1} de ${maxRetries + 1} para crear recibo`);
          receipt = await Receipt.createFromAppointment(
            appointmentJSON,
            paymentData,
            { createdBy: req.user.id }
          );
          console.log(`✅ [ReceiptController] Recibo creado exitosamente en intento ${retries + 1}`);
          break; // Éxito, salir del loop
        } catch (createError) {
          // Si es un error de número duplicado y aún tenemos retries, reintentar
          if (createError.name === 'SequelizeUniqueConstraintError' && 
              (createError.message?.includes('receipts_number_unique') || 
               createError.fields?.receiptNumber) &&
              retries < maxRetries) {
            retries++;
            const waitTime = 200 + (100 * retries); // Backoff: 300ms, 400ms, 500ms, 600ms, 700ms
            console.log(`⚠️ [ReceiptController] Race condition en receiptNumber (intento ${retries}/${maxRetries}), esperando ${waitTime}ms antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          // Si no es un error de número duplicado o ya no quedan retries, lanzar el error
          console.error(`❌ [ReceiptController] Error en intento ${retries + 1}:`, createError.name, createError.message);
          throw createError;
        }
      }
      
      console.log('✅ [ReceiptController] Recibo creado exitosamente:', receipt.id);
      
      // Recargar el recibo con todas las relaciones
      const receiptWithRelations = await Receipt.findByPk(receipt.id, {
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
          { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });
      
      console.log('📤 [ReceiptController] Enviando respuesta con recibo:', receiptWithRelations.receiptNumber);
      res.status(201).json({
        success: true,
        message: 'Recibo creado exitosamente',
        data: receiptWithRelations
      });
      
    } catch (error) {
      console.error('❌ [ReceiptController] Error creating receipt:', error);
      console.error('❌ [ReceiptController] Error stack:', error.stack);
      
      // Si es un error de constraint único (duplicate key), retornar el recibo existente
      if (error.name === 'SequelizeUniqueConstraintError' || 
          error.message?.includes('receipts_appointment_id_unique') ||
          error.message?.includes('receipts_number_unique')) {
        console.log('⚠️ [ReceiptController] Recibo duplicado detectado por constraint, buscando existente...');
        try {
          const { appointmentId } = req.params;
          const existingReceipt = await Receipt.findOne({
            where: { appointmentId },
            include: [
              { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
              { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'email'] },
              { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
              { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
            ]
          });
          if (existingReceipt) {
            console.log('✅ [ReceiptController] Recibo existente encontrado:', existingReceipt.receiptNumber);
            return res.status(200).json({
              success: true,
              message: 'Ya existe un recibo para esta cita',
              data: existingReceipt
            });
          }
        } catch (findError) {
          console.error('❌ [ReceiptController] Error buscando recibo existente:', findError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtener recibo por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const receipt = await Receipt.findByPk(id, {
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
          { model: User, as: 'specialist', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Appointment, as: 'appointment', attributes: ['id', 'date', 'time'] }
        ]
      });
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Recibo no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: receipt
      });
      
    } catch (error) {
      console.error('Error fetching receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtener recibo por número
   */
  static async getByNumber(req, res) {
    try {
      const { receiptNumber } = req.params;
      
      const receipt = await Receipt.findOne({
        where: { receiptNumber },
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
          { model: User, as: 'specialist', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Appointment, as: 'appointment', attributes: ['id', 'date', 'time'] }
        ]
      });
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Recibo no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: receipt
      });
      
    } catch (error) {
      console.error('Error fetching receipt by number:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Listar recibos por negocio
   */
  static async getByBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        startDate, 
        endDate, 
        specialistId,
        status = 'ACTIVE'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereConditions = { businessId, status };
      
      // Filtros adicionales
      if (startDate && endDate) {
        whereConditions.serviceDate = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      if (specialistId) {
        whereConditions.specialistId = specialistId;
      }
      
      const { count, rows: receipts } = await Receipt.findAndCountAll({
        where: whereConditions,
        include: [
          { model: User, as: 'specialist', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'name'] }
        ],
        order: [['sequenceNumber', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          receipts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching business receipts:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Listar recibos por especialista
   */
  static async getBySpecialist(req, res) {
    try {
      const { specialistId } = req.params;
      const { 
        page = 1, 
        limit = 20, 
        startDate, 
        endDate,
        status = 'ACTIVE'
      } = req.query;
      
      const offset = (page - 1) * limit;
      const whereConditions = { specialistId, status };
      
      // Filtros adicionales
      if (startDate && endDate) {
        whereConditions.serviceDate = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      const { count, rows: receipts } = await Receipt.findAndCountAll({
        where: whereConditions,
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'name'] }
        ],
        order: [['serviceDate', 'DESC'], ['serviceTime', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          receipts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching specialist receipts:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Marcar recibo como enviado por email
   */
  static async markSentViaEmail(req, res) {
    try {
      const { id } = req.params;
      
      const receipt = await Receipt.findByPk(id);
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Recibo no encontrado'
        });
      }
      
      await receipt.markSentViaEmail();
      
      res.json({
        success: true,
        message: 'Recibo marcado como enviado por email'
      });
      
    } catch (error) {
      console.error('Error marking receipt as sent via email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Marcar recibo como enviado por WhatsApp
   */
  static async markSentViaWhatsApp(req, res) {
    try {
      const { id } = req.params;
      
      const receipt = await Receipt.findByPk(id);
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Recibo no encontrado'
        });
      }
      
      await receipt.markSentViaWhatsApp();
      
      res.json({
        success: true,
        message: 'Recibo marcado como enviado por WhatsApp'
      });
      
    } catch (error) {
      console.error('Error marking receipt as sent via WhatsApp:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtener estadísticas de recibos por negocio
   */
  static async getStatistics(req, res) {
    try {
      const { businessId } = req.params;
      const { startDate, endDate } = req.query;
      
      const whereConditions = { 
        businessId, 
        status: 'ACTIVE' 
      };
      
      if (startDate && endDate) {
        whereConditions.serviceDate = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // Estadísticas básicas
      const totalReceipts = await Receipt.count({
        where: whereConditions
      });
      
      const totalRevenue = await Receipt.sum('totalAmount', {
        where: whereConditions
      });
      
      // Recibos por especialista
      const receiptsBySpecialist = await Receipt.findAll({
        where: whereConditions,
        attributes: [
          'specialistId',
          'specialistName',
          [Receipt.sequelize.fn('COUNT', Receipt.sequelize.col('id')), 'count'],
          [Receipt.sequelize.fn('SUM', Receipt.sequelize.col('totalAmount')), 'revenue']
        ],
        group: ['specialistId', 'specialistName'],
        order: [[Receipt.sequelize.fn('SUM', Receipt.sequelize.col('totalAmount')), 'DESC']]
      });
      
      // Recibos por método de pago
      const receiptsByPaymentMethod = await Receipt.findAll({
        where: whereConditions,
        attributes: [
          'paymentMethod',
          [Receipt.sequelize.fn('COUNT', Receipt.sequelize.col('id')), 'count'],
          [Receipt.sequelize.fn('SUM', Receipt.sequelize.col('totalAmount')), 'revenue']
        ],
        group: ['paymentMethod']
      });
      
      res.json({
        success: true,
        data: {
          totalReceipts,
          totalRevenue: totalRevenue || 0,
          receiptsBySpecialist,
          receiptsByPaymentMethod
        }
      });
      
    } catch (error) {
      console.error('Error fetching receipt statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar PDF del recibo
   * GET /api/receipts/:id/pdf
   */
  static async generatePDF(req, res) {
    try {
      const { id } = req.params;
      
      // Obtener recibo con relaciones
      const receipt = await Receipt.findByPk(id, {
        include: [
          { 
            model: Business, 
            as: 'business', 
            attributes: ['id', 'name', 'address', 'phone', 'email', 'logo'] 
          },
          { 
            model: User, 
            as: 'specialist', 
            attributes: ['id', 'firstName', 'lastName', 'email'] 
          },
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] 
          },
          { 
            model: Appointment, 
            as: 'appointment', 
            attributes: ['id', 'startTime'] 
          }
        ]
      });
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Recibo no encontrado'
        });
      }
      
      // Generar PDF usando el servicio
      console.log('📄 [ReceiptController] Generando PDF para recibo:', receipt.receiptNumber);
      const ReceiptPDFService = require('../services/ReceiptPDFService');
      const receiptData = receipt.toJSON();
      
      console.log('🔍 [ReceiptController] Receipt data keys:', Object.keys(receiptData));
      console.log('🔍 [ReceiptController] Business data:', receiptData.business);
      
      const pdfBuffer = await ReceiptPDFService.generateReceiptPDF(
        receiptData,
        receiptData.business
      );
      
      console.log('✅ [ReceiptController] PDF generado exitosamente, tamaño:', pdfBuffer.length, 'bytes');
      
      // Enviar PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="recibo-${receipt.receiptNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      console.log('📤 [ReceiptController] Enviando PDF al cliente...');
      return res.end(pdfBuffer, 'binary');
      
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar el PDF del recibo'
      });
    }
  }

  /**
   * Obtener recibo por appointmentId
   */
  static async getByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      
      const receipt = await Receipt.findOne({
        where: { appointmentId },
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'address', 'phone'] },
          { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un recibo para esta cita'
        });
      }
      
      res.json({
        success: true,
        data: receipt
      });
      
    } catch (error) {
      console.error('Error obteniendo recibo por cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ReceiptController;