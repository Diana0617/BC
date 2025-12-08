const Receipt = require('../models/Receipt');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
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
      const { paymentData } = req.body;
      
      // Validar que la cita existe y está pagada
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: User, as: 'specialist', attributes: ['id', 'name', 'code'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'phone', 'email'] },
          { model: Business, as: 'business', attributes: ['id', 'name'] }
        ]
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      if (appointment.status !== 'COMPLETED' || appointment.paymentStatus !== 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'La cita debe estar completada y pagada para generar un recibo'
        });
      }
      
      // Verificar que no existe ya un recibo para esta cita
      const existingReceipt = await Receipt.findOne({
        where: { appointmentId: appointment.id }
      });
      
      if (existingReceipt) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un recibo para esta cita',
          data: existingReceipt.getSummary()
        });
      }
      
      // Crear el recibo
      const receipt = await Receipt.createFromAppointment(
        appointment.toJSON(),
        paymentData,
        { createdBy: req.user.id }
      );
      
      res.status(201).json({
        success: true,
        message: 'Recibo creado exitosamente',
        data: receipt
      });
      
    } catch (error) {
      console.error('Error creating receipt:', error);
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
}

module.exports = ReceiptController;