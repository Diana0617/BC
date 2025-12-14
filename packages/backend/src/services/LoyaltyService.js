const LoyaltyPointTransaction = require('../models/LoyaltyPointTransaction');
const LoyaltyReward = require('../models/LoyaltyReward');
const BusinessClient = require('../models/BusinessClient');
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const BusinessRulesService = require('./BusinessRulesService');
const { generateReferralCode, generateRewardCode, calculatePoints, calculatePointsExpiration, calculateRewardExpiration } = require('../utils/loyaltyHelpers');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * LoyaltyService - Servicio de fidelización y puntos
 * 
 * Maneja:
 * - Acreditación de puntos por múltiples fuentes
 * - Consulta de balance
 * - Canje de recompensas
 * - Sistema de referidos
 * - Hitos/milestones
 * - Expiración de puntos
 */
class LoyaltyService {

  /**
   * Verificar si el programa de fidelización está activo para un negocio
   */
  static async isLoyaltyEnabled(businessId) {
    try {
      const enabled = await BusinessRulesService.getBusinessRuleValue(businessId, 'LOYALTY_ENABLED');
      return enabled === true || enabled === 'true';
    } catch (error) {
      console.error('Error verificando si loyalty está habilitado:', error);
      return false;
    }
  }

  /**
   * Obtener todas las reglas de fidelización de un negocio
   */
  static async getLoyaltyRules(businessId) {
    try {
      const rules = await BusinessRulesService.getBusinessEffectiveRules(businessId, {
        categories: ['GENERAL'],
        activeOnly: true
      });

      // Filtrar solo las reglas de loyalty
      const loyaltyRules = rules.filter(r => r.key.startsWith('LOYALTY_'));

      // Convertir a objeto clave-valor
      const rulesMap = {};
      loyaltyRules.forEach(rule => {
        rulesMap[rule.key] = rule.effective_value;
      });

      return rulesMap;
    } catch (error) {
      console.error('Error obteniendo reglas de loyalty:', error);
      return {};
    }
  }

  /**
   * Obtener o crear BusinessClient con código de referido
   */
  static async getOrCreateBusinessClient(businessId, clientId) {
    let businessClient = await BusinessClient.findOne({
      where: { businessId, clientId }
    });

    if (!businessClient) {
      // Crear BusinessClient si no existe
      businessClient = await BusinessClient.create({
        businessId,
        clientId,
        status: 'ACTIVE',
        loyaltyPoints: 0,
        referralCount: 0
      });
    }

    // Generar código de referido si no tiene
    if (!businessClient.referralCode) {
      let code = generateReferralCode();
      let exists = await BusinessClient.findOne({ where: { referralCode: code } });
      
      while (exists) {
        code = generateReferralCode();
        exists = await BusinessClient.findOne({ where: { referralCode: code } });
      }

      await businessClient.update({ referralCode: code });
    }

    return businessClient;
  }

  /**
   * Acreditar puntos a un cliente
   * @param {Object} params
   * @param {UUID} params.businessId
   * @param {UUID} params.clientId
   * @param {Number} params.points - Puntos a acreditar
   * @param {String} params.type - Tipo de transacción
   * @param {String} params.referenceType - Tipo de entidad relacionada
   * @param {UUID} params.referenceId - ID de entidad relacionada
   * @param {Number} params.amount - Monto en dinero (opcional)
   * @param {Number} params.multiplier - Multiplicador (default 1)
   * @param {String} params.description
   * @param {UUID} params.branchId
   * @param {UUID} params.processedBy
   */
  static async creditPoints({
    businessId,
    clientId,
    points,
    type,
    referenceType = null,
    referenceId = null,
    amount = null,
    multiplier = 1,
    description = null,
    branchId = null,
    processedBy = null
  }) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar que loyalty esté habilitado
      const enabled = await this.isLoyaltyEnabled(businessId);
      if (!enabled) {
        await transaction.rollback();
        return { success: false, message: 'Programa de fidelización no está activo' };
      }

      // Obtener reglas de expiración
      const rules = await this.getLoyaltyRules(businessId);
      const expiryDays = parseInt(rules.LOYALTY_POINTS_EXPIRY_DAYS || 365);
      
      let expiresAt = null;
      if (expiryDays > 0) {
        expiresAt = calculatePointsExpiration(expiryDays);
      }

      // Aplicar multiplicador a los puntos
      const finalPoints = Math.floor(points * multiplier);

      // Crear transacción de puntos
      const pointTransaction = await LoyaltyPointTransaction.create({
        businessId,
        clientId,
        branchId,
        points: finalPoints,
        type,
        status: 'COMPLETED',
        referenceType,
        referenceId,
        amount,
        multiplier,
        description,
        expiresAt,
        processedBy
      }, { transaction });

      // Actualizar balance del BusinessClient
      const businessClient = await this.getOrCreateBusinessClient(businessId, clientId);
      const newBalance = parseInt(businessClient.loyaltyPoints || 0) + finalPoints;
      
      await businessClient.update({
        loyaltyPoints: newBalance
      }, { transaction });

      await transaction.commit();

      console.log(`✅ ${finalPoints} puntos acreditados a cliente ${clientId} (${type})`);

      return {
        success: true,
        transaction: pointTransaction,
        newBalance
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error acreditando puntos:', error);
      throw error;
    }
  }

  /**
   * Acreditar puntos por pago de cita completada
   */
  static async creditPointsForAppointmentPayment(businessId, clientId, appointmentId, amount, branchId = null) {
    try {
      const rules = await this.getLoyaltyRules(businessId);
      
      // Verificar si está habilitado
      if (!rules.LOYALTY_APPOINTMENT_POINTS_ENABLED) {
        return { success: false, message: 'Puntos por citas no están habilitados' };
      }

      // Calcular puntos según el monto (por cada $1000 COP)
      const pointsPerUnit = parseFloat(rules.LOYALTY_POINTS_PER_CURRENCY_UNIT || 1);
      const basePoints = Math.floor((amount / 1000) * pointsPerUnit);

      if (basePoints <= 0) {
        return { success: false, message: 'Monto insuficiente para generar puntos' };
      }

      // Verificar bonus por pago puntual
      let multiplier = 1;
      const onTimeBonus = parseInt(rules.LOYALTY_ON_TIME_PAYMENT_BONUS || 0);
      
      // TODO: Verificar si el pago fue puntual (sin deuda previa)
      // Por ahora asumimos que sí
      const bonusPoints = onTimeBonus;

      const result = await this.creditPoints({
        businessId,
        clientId,
        points: basePoints,
        type: 'APPOINTMENT_PAYMENT',
        referenceType: 'appointments',
        referenceId: appointmentId,
        amount,
        multiplier,
        description: `Pago de cita completada - $${amount.toLocaleString()}`,
        branchId
      });

      // Acreditar bonus por pago puntual si aplica
      if (result.success && bonusPoints > 0) {
        await this.creditPoints({
          businessId,
          clientId,
          points: bonusPoints,
          type: 'BONUS',
          referenceType: 'appointments',
          referenceId: appointmentId,
          description: 'Bonus por pago puntual',
          branchId
        });
      }

      // Verificar si alcanzó un hito (milestone)
      await this.checkAndCreditMilestone(businessId, clientId, branchId);

      return result;

    } catch (error) {
      console.error('Error acreditando puntos por cita:', error);
      throw error;
    }
  }

  /**
   * Acreditar puntos por compra de producto
   */
  static async creditPointsForProductPurchase(businessId, clientId, productId, amount, branchId = null) {
    try {
      const rules = await this.getLoyaltyRules(businessId);
      
      if (!rules.LOYALTY_PRODUCT_POINTS_ENABLED) {
        return { success: false, message: 'Puntos por compras no están habilitados' };
      }

      const pointsPerUnit = parseFloat(rules.LOYALTY_POINTS_PER_CURRENCY_UNIT || 1);
      const basePoints = Math.floor((amount / 1000) * pointsPerUnit);

      if (basePoints <= 0) {
        return { success: false, message: 'Monto insuficiente para generar puntos' };
      }

      return await this.creditPoints({
        businessId,
        clientId,
        points: basePoints,
        type: 'PRODUCT_PURCHASE',
        referenceType: 'products',
        referenceId: productId,
        amount,
        description: `Compra de producto - $${amount.toLocaleString()}`,
        branchId
      });

    } catch (error) {
      console.error('Error acreditando puntos por compra:', error);
      throw error;
    }
  }

  /**
   * Procesar referido: acreditar puntos al referidor
   */
  static async processReferral(businessId, referrerId, referredClientId) {
    try {
      const rules = await this.getLoyaltyRules(businessId);
      
      if (!rules.LOYALTY_REFERRAL_ENABLED) {
        return { success: false, message: 'Sistema de referidos no está habilitado' };
      }

      const referralPoints = parseInt(rules.LOYALTY_REFERRAL_POINTS || 500);

      if (referralPoints <= 0) {
        return { success: false, message: 'Puntos por referido no configurados' };
      }

      // Acreditar puntos al referidor
      const result = await this.creditPoints({
        businessId,
        clientId: referrerId,
        points: referralPoints,
        type: 'REFERRAL',
        referenceType: 'clients',
        referenceId: referredClientId,
        description: `Referido exitoso de nuevo cliente`
      });

      // Actualizar contadores del referidor
      const referrerBC = await BusinessClient.findOne({
        where: { businessId, clientId: referrerId }
      });

      if (referrerBC) {
        await referrerBC.update({
          referralCount: (referrerBC.referralCount || 0) + 1,
          lastReferralDate: new Date()
        });
      }

      return result;

    } catch (error) {
      console.error('Error procesando referido:', error);
      throw error;
    }
  }

  /**
   * Acreditar bonus cuando el cliente referido completa su primera cita pagada
   */
  static async processReferralFirstVisitBonus(businessId, referrerId, referredClientId, appointmentId) {
    try {
      const rules = await this.getLoyaltyRules(businessId);
      
      if (!rules.LOYALTY_REFERRAL_ENABLED) {
        return { success: false, message: 'Sistema de referidos no está habilitado' };
      }

      const bonusPoints = parseInt(rules.LOYALTY_REFERRAL_FIRST_VISIT_BONUS || 0);

      if (bonusPoints <= 0) {
        return { success: false, message: 'Bonus por primera visita no configurado' };
      }

      // Verificar que no se haya acreditado antes este bonus
      const existingBonus = await LoyaltyPointTransaction.findOne({
        where: {
          businessId,
          clientId: referrerId,
          type: 'REFERRAL_FIRST_VISIT',
          referenceType: 'clients',
          referenceId: referredClientId
        }
      });

      if (existingBonus) {
        return { success: false, message: 'Bonus ya fue acreditado previamente' };
      }

      // Acreditar bonus
      return await this.creditPoints({
        businessId,
        clientId: referrerId,
        points: bonusPoints,
        type: 'REFERRAL_FIRST_VISIT',
        referenceType: 'clients',
        referenceId: referredClientId,
        description: `Bonus: cliente referido completó su primera cita`
      });

    } catch (error) {
      console.error('Error procesando bonus de primera visita:', error);
      throw error;
    }
  }

  /**
   * Verificar y acreditar puntos por milestone (hitos de X procedimientos)
   */
  static async checkAndCreditMilestone(businessId, clientId, branchId = null) {
    try {
      const rules = await this.getLoyaltyRules(businessId);
      
      if (!rules.LOYALTY_MILESTONE_ENABLED) {
        return { success: false, message: 'Hitos no están habilitados' };
      }

      const milestoneCount = parseInt(rules.LOYALTY_MILESTONE_COUNT || 5);
      const milestonePoints = parseInt(rules.LOYALTY_MILESTONE_POINTS || 300);

      // Contar citas completadas del cliente
      const completedCount = await Appointment.count({
        where: {
          businessId,
          clientId,
          status: 'COMPLETED',
          paymentStatus: 'PAID'
        }
      });

      // Verificar si alcanzó el hito
      if (completedCount % milestoneCount === 0 && completedCount > 0) {
        // Verificar que no se haya acreditado ya para este hito
        const existingMilestone = await LoyaltyPointTransaction.findOne({
          where: {
            businessId,
            clientId,
            type: 'BONUS',
            description: `Hito alcanzado: ${completedCount} procedimientos completados`
          }
        });

        if (!existingMilestone) {
          return await this.creditPoints({
            businessId,
            clientId,
            points: milestonePoints,
            type: 'BONUS',
            description: `Hito alcanzado: ${completedCount} procedimientos completados`,
            branchId,
            metadata: {
              milestone: completedCount,
              milestoneType: 'appointments'
            }
          });
        }
      }

      return { success: false, message: 'Hito no alcanzado aún' };

    } catch (error) {
      console.error('Error verificando milestone:', error);
      throw error;
    }
  }

  /**
   * Obtener balance de puntos de un cliente
   */
  static async getClientBalance(businessId, clientId) {
    try {
      const businessClient = await BusinessClient.findOne({
        where: { businessId, clientId }
      });

      if (!businessClient) {
        return {
          balance: 0,
          referralCode: null,
          referralCount: 0
        };
      }

      // Calcular puntos expirados pero no procesados aún
      const expiredPoints = await LoyaltyPointTransaction.sum('points', {
        where: {
          businessId,
          clientId,
          status: 'COMPLETED',
          expiresAt: {
            [Op.lt]: new Date()
          },
          points: {
            [Op.gt]: 0
          }
        }
      });

      return {
        balance: parseInt(businessClient.loyaltyPoints || 0),
        expiredPoints: parseInt(expiredPoints || 0),
        availablePoints: parseInt(businessClient.loyaltyPoints || 0) - parseInt(expiredPoints || 0),
        referralCode: businessClient.referralCode,
        referralCount: parseInt(businessClient.referralCount || 0),
        lastReferralDate: businessClient.lastReferralDate
      };

    } catch (error) {
      console.error('Error obteniendo balance:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de transacciones de puntos
   */
  static async getClientTransactions(businessId, clientId, options = {}) {
    const { limit = 50, offset = 0, type = null } = options;

    const where = { businessId, clientId };
    if (type) {
      where.type = type;
    }

    const transactions = await LoyaltyPointTransaction.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const total = await LoyaltyPointTransaction.count({ where });

    return {
      transactions,
      total,
      limit,
      offset
    };
  }

  /**
   * Canjear puntos por recompensa
   */
  static async redeemPoints({
    businessId,
    clientId,
    pointsToRedeem,
    rewardType,
    value,
    description = null,
    conditions = {},
    issuedBy = null
  }) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar que loyalty esté habilitado
      const enabled = await this.isLoyaltyEnabled(businessId);
      if (!enabled) {
        await transaction.rollback();
        return { success: false, message: 'Programa de fidelización no está activo' };
      }

      const rules = await this.getLoyaltyRules(businessId);
      const minPoints = parseInt(rules.LOYALTY_MIN_POINTS_TO_REDEEM || 1000);

      // Verificar balance
      const balance = await this.getClientBalance(businessId, clientId);

      if (balance.availablePoints < pointsToRedeem) {
        await transaction.rollback();
        return { success: false, message: 'Puntos insuficientes' };
      }

      if (pointsToRedeem < minPoints) {
        await transaction.rollback();
        return { success: false, message: `Se requieren al menos ${minPoints} puntos para canjear` };
      }

      // Generar código único de recompensa
      let code = generateRewardCode();
      let exists = await LoyaltyReward.findOne({ where: { code } });
      
      while (exists) {
        code = generateRewardCode();
        exists = await LoyaltyReward.findOne({ where: { code } });
      }

      // Calcular fecha de expiración
      const rewardExpiryDays = parseInt(rules.LOYALTY_REWARD_EXPIRY_DAYS || 30);
      const expiresAt = calculateRewardExpiration(rewardExpiryDays);

      // Crear recompensa
      const reward = await LoyaltyReward.create({
        code,
        businessId,
        clientId,
        pointsUsed: pointsToRedeem,
        rewardType,
        value,
        currency: 'COP',
        status: 'ACTIVE',
        expiresAt,
        description: description || `${rewardType} - ${value}`,
        conditions,
        issuedBy,
        metadata: {
          rulesApplied: {
            minPointsToRedeem: minPoints,
            rewardExpiryDays
          }
        }
      }, { transaction });

      // Debitar puntos (transacción negativa)
      await LoyaltyPointTransaction.create({
        businessId,
        clientId,
        points: -pointsToRedeem,
        type: 'REDEMPTION',
        status: 'COMPLETED',
        referenceType: 'loyalty_rewards',
        referenceId: reward.id,
        description: `Canje de recompensa: ${code}`,
        processedBy: issuedBy
      }, { transaction });

      // Actualizar balance del BusinessClient
      const businessClient = await BusinessClient.findOne({
        where: { businessId, clientId },
        transaction
      });

      const newBalance = parseInt(businessClient.loyaltyPoints || 0) - pointsToRedeem;
      await businessClient.update({
        loyaltyPoints: newBalance
      }, { transaction });

      await transaction.commit();

      console.log(`✅ Recompensa ${code} creada para cliente ${clientId} (${pointsToRedeem} puntos)`);

      return {
        success: true,
        reward,
        newBalance
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error canjeando puntos:', error);
      throw error;
    }
  }

  /**
   * Obtener recompensas de un cliente
   */
  static async getClientRewards(businessId, clientId, options = {}) {
    const { status = null, includeExpired = false } = options;

    const where = { businessId, clientId };
    
    if (status) {
      where.status = status;
    }

    if (!includeExpired) {
      where[Op.or] = [
        { expiresAt: { [Op.gt]: new Date() } },
        { status: 'USED' }
      ];
    }

    const rewards = await LoyaltyReward.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return rewards;
  }

  /**
   * Aplicar recompensa a una compra
   */
  static async applyReward(rewardCode, businessId, clientId, referenceType, referenceId) {
    const transaction = await sequelize.transaction();

    try {
      const reward = await LoyaltyReward.findOne({
        where: {
          code: rewardCode,
          businessId,
          clientId,
          status: 'ACTIVE'
        },
        transaction
      });

      if (!reward) {
        await transaction.rollback();
        return { success: false, message: 'Recompensa no encontrada o inválida' };
      }

      // Verificar expiración
      if (new Date() > reward.expiresAt) {
        await reward.update({ status: 'EXPIRED' }, { transaction });
        await transaction.commit();
        return { success: false, message: 'La recompensa ha expirado' };
      }

      // Marcar como usada
      await reward.update({
        status: 'USED',
        usedAt: new Date(),
        usedInReferenceType: referenceType,
        usedInReferenceId: referenceId
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        reward
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error aplicando recompensa:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de clientes referidos por un cliente
   */
  static async getClientReferrals(businessId, referrerId) {
    try {
      const referrals = await BusinessClient.findAll({
        where: {
          businessId,
          referredBy: referrerId
        },
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return referrals;

    } catch (error) {
      console.error('Error obteniendo referidos:', error);
      throw error;
    }
  }

  /**
   * Limpiar puntos expirados (para CRON job)
   */
  static async expireOldPoints() {
    const transaction = await sequelize.transaction();

    try {
      // Obtener todas las transacciones de puntos expirados que aún no se han procesado
      const expiredTransactions = await LoyaltyPointTransaction.findAll({
        where: {
          status: 'COMPLETED',
          expiresAt: {
            [Op.lt]: new Date()
          },
          points: {
            [Op.gt]: 0
          }
        },
        transaction
      });

      let totalExpired = 0;
      const clientsAffected = new Set();

      for (const expTransaction of expiredTransactions) {
        // Crear transacción de expiración (negativa)
        await LoyaltyPointTransaction.create({
          businessId: expTransaction.businessId,
          clientId: expTransaction.clientId,
          branchId: expTransaction.branchId,
          points: -expTransaction.points,
          type: 'EXPIRATION',
          status: 'COMPLETED',
          referenceType: 'loyalty_point_transactions',
          referenceId: expTransaction.id,
          description: `Expiración de ${expTransaction.points} puntos`
        }, { transaction });

        // Actualizar balance del cliente
        const businessClient = await BusinessClient.findOne({
          where: {
            businessId: expTransaction.businessId,
            clientId: expTransaction.clientId
          },
          transaction
        });

        if (businessClient) {
          const newBalance = Math.max(0, parseInt(businessClient.loyaltyPoints || 0) - expTransaction.points);
          await businessClient.update({
            loyaltyPoints: newBalance
          }, { transaction });

          clientsAffected.add(expTransaction.clientId);
        }

        // Marcar transacción original como expirada
        await expTransaction.update({ status: 'EXPIRED' }, { transaction });

        totalExpired += expTransaction.points;
      }

      await transaction.commit();

      console.log(`✅ Expirados ${totalExpired} puntos de ${clientsAffected.size} clientes`);

      return {
        totalExpired,
        clientsAffected: clientsAffected.size,
        transactionsProcessed: expiredTransactions.length
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error expirando puntos:', error);
      throw error;
    }
  }

  /**
   * Expirar recompensas vencidas (para CRON job)
   */
  static async expireOldRewards() {
    try {
      const result = await LoyaltyReward.update(
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

      console.log(`✅ ${result[0]} recompensas expiradas`);

      return result[0];

    } catch (error) {
      console.error('Error expirando recompensas:', error);
      throw error;
    }
  }
}

module.exports = LoyaltyService;
