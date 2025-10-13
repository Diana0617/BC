const Voucher = require('../models/Voucher');
const CustomerCancellationHistory = require('../models/CustomerCancellationHistory');
const CustomerBookingBlock = require('../models/CustomerBookingBlock');
const BusinessRule = require('../models/BusinessRule');
const { Op } = require('sequelize');

/**
 * VoucherService - Lógica de negocio para vouchers y penalizaciones
 */
class VoucherService {
  
  /**
   * Generar código único de voucher
   */
  static generateVoucherCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VCH-';
    for (let i = 0; i < 9; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 2 || i === 5) code += '-';
    }
    return code;
  }

  /**
   * Obtener reglas de voucher del negocio
   */
  static async getVoucherRules(businessId) {
    const rules = await BusinessRule.findAll({
      where: {
        businessId,
        ruleKey: {
          [Op.in]: [
            'CITAS_HORAS_VOUCHER_CANCELACION',
            'CITAS_VOUCHER_VALIDEZ_DIAS',
            'CITAS_VOUCHER_PORCENTAJE_VALOR',
            'CITAS_MAX_CANCELACIONES_PERMITIDAS',
            'CITAS_PERIODO_RESETEO_CANCELACIONES',
            'CITAS_BLOQUEO_TEMPORAL_DIAS',
            'CITAS_NOTIFICAR_VOUCHER_EMAIL'
          ]
        }
      }
    });

    const rulesMap = {};
    rules.forEach(rule => {
      rulesMap[rule.ruleKey] = rule.value;
    });

    // Valores por defecto si no están configurados
    return {
      hoursForVoucher: rulesMap['CITAS_HORAS_VOUCHER_CANCELACION'] || 24,
      voucherValidityDays: rulesMap['CITAS_VOUCHER_VALIDEZ_DIAS'] || 30,
      voucherPercentage: rulesMap['CITAS_VOUCHER_PORCENTAJE_VALOR'] || 100,
      maxCancellations: rulesMap['CITAS_MAX_CANCELACIONES_PERMITIDAS'] || 3,
      resetPeriodDays: rulesMap['CITAS_PERIODO_RESETEO_CANCELACIONES'] || 30,
      blockDurationDays: rulesMap['CITAS_BLOQUEO_TEMPORAL_DIAS'] || 15,
      notifyByEmail: rulesMap['CITAS_NOTIFICAR_VOUCHER_EMAIL'] !== false
    };
  }

  /**
   * Procesar cancelación de cita
   * @param {Object} params - Parámetros de la cancelación
   * @param {UUID} params.businessId - ID del negocio
   * @param {UUID} params.customerId - ID del cliente
   * @param {UUID} params.bookingId - ID de la cita
   * @param {Date} params.bookingDateTime - Fecha/hora de la cita
   * @param {Number} params.bookingAmount - Monto de la cita
   * @param {String} params.cancelReason - Razón de cancelación
   * @param {String} params.cancelledBy - Quién canceló ('CUSTOMER', 'BUSINESS', 'SYSTEM')
   */
  static async processCancellation({
    businessId,
    customerId,
    bookingId,
    bookingDateTime,
    bookingAmount,
    cancelReason = null,
    cancelledBy = 'CUSTOMER'
  }) {
    const rules = await this.getVoucherRules(businessId);
    
    // Calcular horas de anticipación
    const now = new Date();
    const hoursBeforeBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    let voucher = null;
    let voucherGenerated = false;

    // Solo generar voucher si:
    // 1. El cliente canceló (no el negocio)
    // 2. Canceló con suficiente anticipación
    // 3. La cita tenía un monto asociado
    if (
      cancelledBy === 'CUSTOMER' &&
      hoursBeforeBooking >= rules.hoursForVoucher &&
      bookingAmount > 0
    ) {
      // Calcular valor del voucher
      const voucherAmount = (bookingAmount * rules.voucherPercentage) / 100;
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + rules.voucherValidityDays);

      // Generar código único
      let code = this.generateVoucherCode();
      let codeExists = await Voucher.findOne({ where: { code } });
      
      // Regenerar si existe (muy improbable)
      while (codeExists) {
        code = this.generateVoucherCode();
        codeExists = await Voucher.findOne({ where: { code } });
      }

      // Crear voucher
      voucher = await Voucher.create({
        code,
        businessId,
        customerId,
        originalBookingId: bookingId,
        amount: voucherAmount,
        currency: 'COP', // TODO: Obtener de configuración del negocio
        status: 'ACTIVE',
        expiresAt,
        cancelReason
      });

      voucherGenerated = true;
    }

    // Registrar cancelación en historial
    const cancellationRecord = await CustomerCancellationHistory.create({
      businessId,
      customerId,
      bookingId,
      cancelledAt: now,
      bookingDateTime,
      hoursBeforeBooking,
      voucherGenerated,
      voucherId: voucher?.id || null,
      reason: cancelReason,
      cancelledBy
    });

    // Verificar si debe aplicar penalización
    const shouldBlock = await this.checkAndApplyPenalty(
      businessId,
      customerId,
      rules
    );

    return {
      voucher,
      voucherGenerated,
      cancellationRecord,
      blocked: shouldBlock,
      hoursBeforeBooking
    };
  }

  /**
   * Verificar y aplicar penalización por exceso de cancelaciones
   */
  static async checkAndApplyPenalty(businessId, customerId, rules) {
    // Calcular fecha límite para contar cancelaciones
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rules.resetPeriodDays);

    // Contar cancelaciones recientes del cliente
    const recentCancellations = await CustomerCancellationHistory.count({
      where: {
        businessId,
        customerId,
        cancelledBy: 'CUSTOMER', // Solo contar cancelaciones del cliente
        cancelledAt: {
          [Op.gte]: cutoffDate
        }
      }
    });

    // Si excede el límite, aplicar bloqueo
    if (recentCancellations >= rules.maxCancellations) {
      // Verificar si ya tiene un bloqueo activo
      const existingBlock = await CustomerBookingBlock.findOne({
        where: {
          businessId,
          customerId,
          status: 'ACTIVE',
          expiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!existingBlock) {
        // Calcular fecha de expiración del bloqueo
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + rules.blockDurationDays);

        // Crear bloqueo
        await CustomerBookingBlock.create({
          businessId,
          customerId,
          status: 'ACTIVE',
          reason: 'EXCESSIVE_CANCELLATIONS',
          expiresAt,
          cancellationCount: recentCancellations
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Verificar si un cliente está bloqueado
   */
  static async isCustomerBlocked(businessId, customerId) {
    const block = await CustomerBookingBlock.findOne({
      where: {
        businessId,
        customerId,
        status: 'ACTIVE',
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    return block !== null;
  }

  /**
   * Aplicar voucher a una cita
   */
  static async applyVoucherToBooking(voucherCode, businessId, customerId, bookingId) {
    const voucher = await Voucher.findOne({
      where: {
        code: voucherCode,
        businessId,
        customerId,
        status: 'ACTIVE'
      }
    });

    if (!voucher) {
      throw new Error('Voucher no encontrado o inválido');
    }

    // Verificar expiración
    if (new Date() > voucher.expiresAt) {
      await voucher.update({ status: 'EXPIRED' });
      throw new Error('El voucher ha expirado');
    }

    // Marcar como usado
    await voucher.update({
      status: 'USED',
      usedAt: new Date(),
      usedInBookingId: bookingId
    });

    return voucher;
  }

  /**
   * Obtener vouchers activos de un cliente
   */
  static async getCustomerVouchers(businessId, customerId, includeExpired = false) {
    const where = {
      businessId,
      customerId
    };

    if (!includeExpired) {
      where.status = 'ACTIVE';
      where.expiresAt = {
        [Op.gt]: new Date()
      };
    }

    return await Voucher.findAll({
      where,
      order: [['expiresAt', 'ASC']]
    });
  }

  /**
   * Obtener historial de cancelaciones de un cliente
   */
  static async getCustomerCancellationHistory(businessId, customerId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await CustomerCancellationHistory.findAll({
      where: {
        businessId,
        customerId,
        cancelledAt: {
          [Op.gte]: cutoffDate
        }
      },
      order: [['cancelledAt', 'DESC']]
    });
  }

  /**
   * Levantar bloqueo manualmente
   */
  static async liftBlock(blockId, liftedByUserId, notes = null) {
    const block = await CustomerBookingBlock.findByPk(blockId);
    
    if (!block) {
      throw new Error('Bloqueo no encontrado');
    }

    if (block.status !== 'ACTIVE') {
      throw new Error('El bloqueo ya no está activo');
    }

    await block.update({
      status: 'LIFTED',
      liftedAt: new Date(),
      liftedBy: liftedByUserId,
      notes
    });

    return block;
  }

  /**
   * Limpiar bloqueos expirados automáticamente
   */
  static async cleanupExpiredBlocks() {
    const result = await CustomerBookingBlock.update(
      { status: 'EXPIRED' },
      {
        where: {
          status: 'ACTIVE',
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      }
    );

    return result[0]; // Número de registros actualizados
  }

  /**
   * Expirar vouchers vencidos
   */
  static async expireOldVouchers() {
    const result = await Voucher.update(
      { status: 'EXPIRED' },
      {
        where: {
          status: 'ACTIVE',
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      }
    );

    return result[0]; // Número de registros actualizados
  }
}

module.exports = VoucherService;
