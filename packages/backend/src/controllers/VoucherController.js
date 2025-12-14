const VoucherService = require('../services/VoucherService');
const Voucher = require('../models/Voucher');
const Business = require('../models/Business');
const CustomerCancellationHistory = require('../models/CustomerCancellationHistory');
const CustomerBookingBlock = require('../models/CustomerBookingBlock');
const User = require('../models/User');
// TODO: Implementar VoucherPDFService similar a LoyaltyCardPDFService
// const VoucherPDFService = require('../services/VoucherPDFService');
const { Op } = require('sequelize');

/**
 * VoucherController - Gestión de vouchers y penalizaciones
 */
class VoucherController {

  /**
   * @swagger
   * /api/vouchers/my-vouchers:
   *   get:
   *     summary: Obtener vouchers activos del cliente actual
   *     tags: [Vouchers]
   */
  static async getMyVouchers(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { businessId } = req.user;

      const vouchers = await VoucherService.getCustomerVouchers(
        businessId,
        userId,
        false // Solo vouchers activos
      );

      res.json({
        success: true,
        data: vouchers,
        count: vouchers.length
      });
    } catch (error) {
      console.error('Error obteniendo vouchers del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener vouchers'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/validate/{code}:
   *   get:
   *     summary: Validar un código de voucher
   *     tags: [Vouchers]
   */
  static async validateVoucher(req, res) {
    try {
      const { code } = req.params;
      const userId = req.user.userId || req.user.id;
      const { businessId } = req.user;

      const voucher = await Voucher.findOne({
        where: {
          code,
          businessId,
          customerId: userId,
          status: 'ACTIVE'
        }
      });

      if (!voucher) {
        return res.status(404).json({
          success: false,
          valid: false,
          error: 'Voucher no encontrado o inválido'
        });
      }

      // Verificar expiración
      const now = new Date();
      if (now > voucher.expiresAt) {
        await voucher.update({ status: 'EXPIRED' });
        return res.status(400).json({
          success: false,
          valid: false,
          error: 'El voucher ha expirado'
        });
      }

      res.json({
        success: true,
        valid: true,
        data: {
          code: voucher.code,
          amount: voucher.amount,
          currency: voucher.currency,
          expiresAt: voucher.expiresAt
        }
      });
    } catch (error) {
      console.error('Error validando voucher:', error);
      res.status(500).json({
        success: false,
        error: 'Error al validar voucher'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/apply:
   *   post:
   *     summary: Aplicar voucher a una cita
   *     tags: [Vouchers]
   */
  static async applyVoucher(req, res) {
    try {
      const { voucherCode, bookingId } = req.body;
      const userId = req.user.userId || req.user.id;
      const { businessId } = req.user;

      if (!voucherCode || !bookingId) {
        return res.status(400).json({
          success: false,
          error: 'Código de voucher y ID de cita son requeridos'
        });
      }

      const voucher = await VoucherService.applyVoucherToBooking(
        voucherCode,
        businessId,
        userId,
        bookingId
      );

      res.json({
        success: true,
        message: 'Voucher aplicado correctamente',
        data: {
          voucher,
          discount: voucher.amount
        }
      });
    } catch (error) {
      console.error('Error aplicando voucher:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error al aplicar voucher'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/check-block-status:
   *   get:
   *     summary: Verificar si el cliente está bloqueado
   *     tags: [Vouchers]
   */
  static async checkBlockStatus(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { businessId } = req.user;

      const isBlocked = await VoucherService.isCustomerBlocked(businessId, userId);

      if (isBlocked) {
        const block = await CustomerBookingBlock.findOne({
          where: {
            businessId,
            customerId: userId,
            status: 'ACTIVE',
            expiresAt: {
              [Op.gt]: new Date()
            }
          }
        });

        return res.json({
          success: true,
          blocked: true,
          blockInfo: {
            reason: block.reason,
            expiresAt: block.expiresAt,
            cancellationCount: block.cancellationCount
          }
        });
      }

      res.json({
        success: true,
        blocked: false
      });
    } catch (error) {
      console.error('Error verificando estado de bloqueo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar estado de bloqueo'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/cancellation-history:
   *   get:
   *     summary: Obtener historial de cancelaciones del cliente
   *     tags: [Vouchers]
   */
  static async getCancellationHistory(req, res) {
    try {
      const userId = req.user.userId || req.user.id;
      const { businessId } = req.user;
      const { days = 30 } = req.query;

      const history = await VoucherService.getCustomerCancellationHistory(
        businessId,
        userId,
        parseInt(days)
      );

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Error obteniendo historial de cancelaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener historial'
      });
    }
  }

  // =====================================================
  // ENDPOINTS PARA BUSINESS/ADMIN
  // =====================================================

  /**
   * @swagger
   * /api/vouchers/business/list:
   *   get:
   *     summary: Listar todos los vouchers del negocio (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async listBusinessVouchers(req, res) {
    try {
      const { businessId } = req.user;
      const { status, customerId, page = 1, limit = 20 } = req.query;

      const where = { businessId };
      
      if (status) {
        where.status = status;
      }
      
      if (customerId) {
        where.customerId = customerId;
      }

      const offset = (page - 1) * limit;

      const { rows: vouchers, count } = await Voucher.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: vouchers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error listando vouchers del negocio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar vouchers'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/business/cancel/{voucherId}:
   *   post:
   *     summary: Cancelar un voucher manualmente (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async cancelVoucher(req, res) {
    try {
      const { voucherId } = req.params;
      const { businessId } = req.user;
      const { reason } = req.body;

      const voucher = await Voucher.findOne({
        where: {
          id: voucherId,
          businessId
        }
      });

      if (!voucher) {
        return res.status(404).json({
          success: false,
          error: 'Voucher no encontrado'
        });
      }

      if (voucher.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: 'El voucher no está activo'
        });
      }

      await voucher.update({
        status: 'CANCELLED',
        notes: reason || 'Cancelado por el negocio'
      });

      res.json({
        success: true,
        message: 'Voucher cancelado correctamente',
        data: voucher
      });
    } catch (error) {
      console.error('Error cancelando voucher:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cancelar voucher'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/business/create-manual:
   *   post:
   *     summary: Crear voucher manualmente (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async createManualVoucher(req, res) {
    try {
      const { businessId } = req.user;
      const { customerId, amount, validityDays, reason } = req.body;

      if (!customerId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Cliente y monto son requeridos'
        });
      }

      // Generar código único
      let code = VoucherService.generateVoucherCode();
      let codeExists = await Voucher.findOne({ where: { code } });
      
      while (codeExists) {
        code = VoucherService.generateVoucherCode();
        codeExists = await Voucher.findOne({ where: { code } });
      }

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (validityDays || 30));

      const voucher = await Voucher.create({
        code,
        businessId,
        customerId,
        originalBookingId: null, // Voucher manual
        amount,
        currency: 'COP',
        status: 'ACTIVE',
        expiresAt,
        notes: reason || 'Voucher creado manualmente por el negocio'
      });

      res.status(201).json({
        success: true,
        message: 'Voucher creado correctamente',
        data: voucher
      });
    } catch (error) {
      console.error('Error creando voucher manual:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear voucher'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/business/blocks:
   *   get:
   *     summary: Listar clientes bloqueados (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async listBlockedCustomers(req, res) {
    try {
      const { businessId } = req.user;
      const { status = 'ACTIVE' } = req.query;

      const blocks = await CustomerBookingBlock.findAll({
        where: {
          businessId,
          status
        },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [['blockedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: blocks,
        count: blocks.length
      });
    } catch (error) {
      console.error('Error listando clientes bloqueados:', error);
      res.status(500).json({
        success: false,
        error: 'Error al listar bloqueados'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/business/lift-block/{blockId}:
   *   post:
   *     summary: Levantar bloqueo de cliente (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async liftBlock(req, res) {
    try {
      const { blockId } = req.params;
      const { userId, businessId } = req.user;
      const { notes } = req.body;

      const block = await CustomerBookingBlock.findOne({
        where: {
          id: blockId,
          businessId
        }
      });

      if (!block) {
        return res.status(404).json({
          success: false,
          error: 'Bloqueo no encontrado'
        });
      }

      await VoucherService.liftBlock(blockId, userId, notes);

      res.json({
        success: true,
        message: 'Bloqueo levantado correctamente'
      });
    } catch (error) {
      console.error('Error levantando bloqueo:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error al levantar bloqueo'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/business/customer-stats/{customerId}:
   *   get:
   *     summary: Estadísticas de cancelaciones de un cliente (BUSINESS)
   *     tags: [Vouchers - Business]
   */
  static async getCustomerStats(req, res) {
    try {
      const { customerId } = req.params;
      const { businessId } = req.user;
      const { days = 30 } = req.query;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      // Contar cancelaciones
      const totalCancellations = await CustomerCancellationHistory.count({
        where: {
          businessId,
          customerId,
          cancelledAt: {
            [Op.gte]: cutoffDate
          }
        }
      });

      // Contar vouchers generados
      const vouchersGenerated = await CustomerCancellationHistory.count({
        where: {
          businessId,
          customerId,
          voucherGenerated: true,
          cancelledAt: {
            [Op.gte]: cutoffDate
          }
        }
      });

      // Vouchers activos
      const activeVouchers = await Voucher.count({
        where: {
          businessId,
          customerId,
          status: 'ACTIVE',
          expiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      // Verificar bloqueo
      const isBlocked = await VoucherService.isCustomerBlocked(businessId, customerId);

      res.json({
        success: true,
        data: {
          customerId,
          period: `${days} días`,
          totalCancellations,
          vouchersGenerated,
          activeVouchers,
          isBlocked
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * @route GET /api/vouchers/:voucherId/pdf
   * @desc Descargar tarjeta PDF del voucher (incluye logo del negocio)
   * @access Private
   */
  static async getVoucherPDF(req, res) {
    try {
      const { voucherId } = req.params;
      const requesterId = req.user.userId || req.user.id;
      const { businessId, role } = req.user;

      if (!voucherId) {
        return res.status(400).json({
          success: false,
          error: 'voucherId es requerido'
        });
      }

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId no está disponible en el token'
        });
      }

      const voucher = await Voucher.findOne({
        where: { id: voucherId },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ]
      });

      if (!voucher) {
        return res.status(404).json({
          success: false,
          error: 'Voucher no encontrado'
        });
      }

      const isBusinessOperator = ['OWNER', 'ADMIN', 'BUSINESS'].includes(role);
      const sameBusiness = voucher.businessId === businessId;
      const isOwnerCustomer = voucher.customerId === requesterId;

      const canAccess = (isBusinessOperator && sameBusiness) || (!isBusinessOperator && sameBusiness && isOwnerCustomer);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a este voucher'
        });
      }

      // TODO: Implementar VoucherPDFService para generar PDF de vouchers
      return res.status(501).json({
        success: false,
        error: 'Generación de PDF de vouchers no implementada aún'
      });

      // const pdfBuffer = await VoucherPDFService.generateVoucherCardPDF({
      //   voucher,
      //   business: voucher.business,
      //   customer: voucher.customer
      // });

      // const safeCode = voucher.code || voucher.id;
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `inline; filename="voucher-${safeCode}.pdf"`);
      // return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF del voucher:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar PDF del voucher'
      });
    }
  }

  /**
   * @swagger
   * /api/vouchers/cleanup:
   *   post:
   *     summary: Limpiar vouchers y bloqueos expirados (CRON/ADMIN)
   *     tags: [Vouchers - Admin]
   */
  static async cleanup(req, res) {
    try {
      const expiredVouchers = await VoucherService.expireOldVouchers();
      const expiredBlocks = await VoucherService.cleanupExpiredBlocks();

      res.json({
        success: true,
        message: 'Limpieza completada',
        data: {
          expiredVouchers,
          expiredBlocks
        }
      });
    } catch (error) {
      console.error('Error en limpieza:', error);
      res.status(500).json({
        success: false,
        error: 'Error en limpieza'
      });
    }
  }

  /**
   * @swagger
   * /api/business/:businessId/clients/:clientId/vouchers:
   *   get:
   *     summary: Obtener vouchers de un cliente específico
   *     tags: [Vouchers - Clientes]
   */
  static async getCustomerVouchers(req, res) {
    try {
      const { businessId, clientId } = req.params;
      const { includeExpired = 'false' } = req.query;

      const vouchers = await VoucherService.getCustomerVouchers(
        businessId,
        clientId,
        includeExpired === 'true'
      );

      res.json({
        success: true,
        data: vouchers,
        count: vouchers.length
      });
    } catch (error) {
      console.error('Error obteniendo vouchers del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener vouchers del cliente'
      });
    }
  }

  /**
   * @swagger
   * /api/business/:businessId/clients/:clientId/block:
   *   post:
   *     summary: Bloquear cliente manualmente
   *     tags: [Vouchers - Clientes]
   */
  static async blockCustomer(req, res) {
    try {
      const { businessId, clientId } = req.params;
      const { reason = 'MANUAL', notes, durationDays = 30 } = req.body;
      const userId = req.user.userId || req.user.id;

      const block = await VoucherService.createBlock(
        businessId,
        clientId,
        {
          reason,
          notes,
          durationDays,
          blockedBy: userId
        }
      );

      res.json({
        success: true,
        message: 'Cliente bloqueado exitosamente',
        data: block
      });
    } catch (error) {
      console.error('Error bloqueando cliente:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al bloquear cliente'
      });
    }
  }

  /**
   * @swagger
   * /api/business/:businessId/clients/:clientId/block-status:
   *   get:
   *     summary: Obtener estado de bloqueo de un cliente
   *     tags: [Vouchers - Clientes]
   */
  static async getCustomerBlockStatus(req, res) {
    try {
      const { businessId, clientId } = req.params;

      const block = await CustomerBookingBlock.findOne({
        where: {
          businessId,
          customerId: clientId,
          status: 'ACTIVE',
          expiresAt: { [Op.gt]: new Date() }
        },
        order: [['blockedAt', 'DESC']]
      });

      const isBlocked = !!block;

      res.json({
        success: true,
        data: {
          isBlocked,
          block: isBlocked ? {
            id: block.id,
            reason: block.reason,
            blockedAt: block.blockedAt,
            expiresAt: block.expiresAt,
            notes: block.notes,
            cancellationCount: block.cancellationCount
          } : null
        }
      });
    } catch (error) {
      console.error('Error obteniendo estado de bloqueo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estado de bloqueo'
      });
    }
  }
}

module.exports = VoucherController;
