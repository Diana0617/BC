const LoyaltyService = require('../services/LoyaltyService');
const LoyaltyCardPDFService = require('../services/LoyaltyCardPDFService');
const BusinessClient = require('../models/BusinessClient');
const Client = require('../models/Client');

/**
 * LoyaltyController - Controlador para sistema de fidelización
 */
class LoyaltyController {

  /**
   * Obtener balance de puntos del cliente
   * GET /api/loyalty/balance
   */
  static async getBalance(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;

      const balance = await LoyaltyService.getClientBalance(businessId, userId);

      res.json({
        success: true,
        data: balance
      });

    } catch (error) {
      console.error('Error obteniendo balance:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener balance de puntos'
      });
    }
  }

  /**
   * Obtener historial de transacciones de puntos
   * GET /api/loyalty/transactions
   */
  static async getTransactions(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;
      const { limit = 50, offset = 0, type } = req.query;

      const result = await LoyaltyService.getClientTransactions(businessId, userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        type
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener historial de transacciones'
      });
    }
  }

  /**
   * Obtener código de referido del cliente
   * GET /api/loyalty/referral-code
   */
  static async getReferralCode(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;

      const businessClient = await LoyaltyService.getOrCreateBusinessClient(businessId, userId);

      res.json({
        success: true,
        data: {
          referralCode: businessClient.referralCode,
          referralCount: businessClient.referralCount,
          lastReferralDate: businessClient.lastReferralDate
        }
      });

    } catch (error) {
      console.error('Error obteniendo código de referido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener código de referido'
      });
    }
  }

  /**
   * Obtener lista de clientes referidos
   * GET /api/loyalty/my-referrals
   */
  static async getMyReferrals(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;

      const referrals = await LoyaltyService.getClientReferrals(businessId, userId);

      res.json({
        success: true,
        data: referrals,
        count: referrals.length
      });

    } catch (error) {
      console.error('Error obteniendo referidos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener lista de referidos'
      });
    }
  }

  /**
   * Canjear puntos por recompensa
   * POST /api/loyalty/redeem
   */
  static async redeemPoints(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;
      const {
        pointsToRedeem,
        rewardType,
        value,
        description,
        conditions
      } = req.body;

      if (!pointsToRedeem || !rewardType || !value) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros incompletos: pointsToRedeem, rewardType y value son requeridos'
        });
      }

      const result = await LoyaltyService.redeemPoints({
        businessId,
        clientId: userId,
        pointsToRedeem: parseInt(pointsToRedeem),
        rewardType,
        value: parseFloat(value),
        description,
        conditions: conditions || {},
        issuedBy: req.user.id
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Puntos canjeados exitosamente',
        data: {
          reward: result.reward,
          newBalance: result.newBalance
        }
      });

    } catch (error) {
      console.error('Error canjeando puntos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al canjear puntos'
      });
    }
  }

  /**
   * Obtener recompensas del cliente
   * GET /api/loyalty/rewards
   */
  static async getRewards(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;
      const { status, includeExpired } = req.query;

      const rewards = await LoyaltyService.getClientRewards(businessId, userId, {
        status,
        includeExpired: includeExpired === 'true'
      });

      res.json({
        success: true,
        data: rewards,
        count: rewards.length
      });

    } catch (error) {
      console.error('Error obteniendo recompensas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener recompensas'
      });
    }
  }

  /**
   * Aplicar recompensa a una compra
   * POST /api/loyalty/apply-reward
   */
  static async applyReward(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;
      const { rewardCode, referenceType, referenceId } = req.body;

      if (!rewardCode || !referenceType || !referenceId) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros incompletos: rewardCode, referenceType y referenceId son requeridos'
        });
      }

      const result = await LoyaltyService.applyReward(
        rewardCode,
        businessId,
        userId,
        referenceType,
        referenceId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Recompensa aplicada exitosamente',
        data: result.reward
      });

    } catch (error) {
      console.error('Error aplicando recompensa:', error);
      res.status(500).json({
        success: false,
        error: 'Error al aplicar recompensa'
      });
    }
  }

  // =====================================================
  // ENDPOINTS PARA BUSINESS/OWNER
  // =====================================================

  /**
   * Obtener balance de puntos de un cliente específico (BUSINESS)
   * GET /api/loyalty/business/client/:clientId/balance
   */
  static async getClientBalance(req, res) {
    try {
      const { businessId } = req.user;
      const { clientId } = req.params;

      const balance = await LoyaltyService.getClientBalance(businessId, clientId);

      res.json({
        success: true,
        data: balance
      });

    } catch (error) {
      console.error('Error obteniendo balance del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener balance'
      });
    }
  }

  /**
   * Obtener transacciones de un cliente específico (BUSINESS)
   * GET /api/loyalty/business/client/:clientId/transactions
   */
  static async getClientTransactions(req, res) {
    try {
      const { businessId } = req.user;
      const { clientId } = req.params;
      const { limit = 50, offset = 0, type } = req.query;

      const result = await LoyaltyService.getClientTransactions(businessId, clientId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        type
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error obteniendo transacciones del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener transacciones'
      });
    }
  }

  /**
   * Acreditar puntos manualmente a un cliente (BUSINESS)
   * POST /api/loyalty/business/credit-points
   */
  static async creditPointsManually(req, res) {
    try {
      const { businessId } = req.user;
      const {
        clientId,
        points,
        description,
        branchId
      } = req.body;

      if (!clientId || !points) {
        return res.status(400).json({
          success: false,
          error: 'clientId y points son requeridos'
        });
      }

      const result = await LoyaltyService.creditPoints({
        businessId,
        clientId,
        points: parseInt(points),
        type: 'MANUAL_ADJUSTMENT',
        description: description || 'Ajuste manual por el negocio',
        branchId,
        processedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Puntos acreditados exitosamente',
        data: {
          transaction: result.transaction,
          newBalance: result.newBalance
        }
      });

    } catch (error) {
      console.error('Error acreditando puntos manualmente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al acreditar puntos'
      });
    }
  }

  /**
   * Obtener referidos de un cliente (BUSINESS)
   * GET /api/loyalty/business/client/:clientId/referrals
   */
  static async getClientReferrals(req, res) {
    try {
      const { businessId } = req.user;
      const { clientId } = req.params;

      const referrals = await LoyaltyService.getClientReferrals(businessId, clientId);

      res.json({
        success: true,
        data: referrals,
        count: referrals.length
      });

    } catch (error) {
      console.error('Error obteniendo referidos del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener referidos'
      });
    }
  }

  /**
   * Buscar cliente por código de referido (BUSINESS)
   * GET /api/loyalty/business/find-by-referral-code/:code
   */
  static async findClientByReferralCode(req, res) {
    try {
      const { businessId } = req.user;
      const { code } = req.params;

      const businessClient = await BusinessClient.findOne({
        where: {
          businessId,
          referralCode: code
        },
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      if (!businessClient) {
        return res.status(404).json({
          success: false,
          error: 'Código de referido no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          client: businessClient.client,
          referralCode: businessClient.referralCode,
          referralCount: businessClient.referralCount
        }
      });

    } catch (error) {
      console.error('Error buscando cliente por código de referido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar cliente'
      });
    }
  }

  /**
   * Limpiar puntos y recompensas expirados (CRON/ADMIN)
   * POST /api/loyalty/cleanup
   */
  static async cleanup(req, res) {
    try {
      const pointsResult = await LoyaltyService.expireOldPoints();
      const rewardsResult = await LoyaltyService.expireOldRewards();

      res.json({
        success: true,
        data: {
          expiredPoints: pointsResult,
          expiredRewards: rewardsResult
        },
        message: 'Limpieza completada exitosamente'
      });

    } catch (error) {
      console.error('Error en limpieza de loyalty:', error);
      res.status(500).json({
        success: false,
        error: 'Error al realizar limpieza'
      });
    }
  }

  /**
   * Generar tarjeta de fidelización en PDF (Cliente)
   * GET /api/loyalty/card/pdf
   */
  static async generateCardPDF(req, res) {
    try {
      const { businessId } = req.user;
      const userId = req.user.userId || req.user.id;

      // Obtener balance actual
      const balance = await LoyaltyService.getClientBalance(businessId, userId);

      // Generar PDF
      const pdfDoc = await LoyaltyCardPDFService.generateLoyaltyCard(
        businessId,
        userId,
        balance.totalPoints
      );

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=tarjeta-fidelizacion.pdf');

      // Stream del PDF a la respuesta
      pdfDoc.pipe(res);

    } catch (error) {
      console.error('Error generando tarjeta PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar tarjeta de fidelización'
      });
    }
  }

  /**
   * Generar tarjeta de fidelización en PDF para un cliente específico (Business)
   * GET /api/loyalty/business/client/:clientId/card/pdf
   */
  static async generateClientCardPDF(req, res) {
    try {
      const { businessId } = req.user;
      const { clientId } = req.params;

      // Obtener balance del cliente
      const balance = await LoyaltyService.getClientBalance(businessId, clientId);

      // Generar PDF
      const pdfDoc = await LoyaltyCardPDFService.generateLoyaltyCard(
        businessId,
        clientId,
        balance.totalPoints
      );

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=tarjeta-${clientId}.pdf`);

      // Stream del PDF a la respuesta
      pdfDoc.pipe(res);

    } catch (error) {
      console.error('Error generando tarjeta PDF para cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar tarjeta de fidelización'
      });
    }
  }

  /**
   * Generar múltiples tarjetas en un solo PDF (Business)
   * POST /api/loyalty/business/cards/bulk-pdf
   * Body: { clients: [{ clientId, points }] }
   */
  static async generateBulkCardsPDF(req, res) {
    try {
      const { businessId } = req.user;
      const { clients } = req.body;

      if (!clients || !Array.isArray(clients) || clients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de clientes'
        });
      }

      // Generar PDF con múltiples tarjetas
      const pdfDoc = await LoyaltyCardPDFService.generateMultipleCards(
        businessId,
        clients
      );

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=tarjetas-fidelizacion-${Date.now()}.pdf`);

      // Stream del PDF a la respuesta
      pdfDoc.pipe(res);

    } catch (error) {
      console.error('Error generando tarjetas bulk PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar tarjetas de fidelización'
      });
    }
  }

  /**
   * Consultar puntos por código de referido (público - para QR)
   * GET /api/loyalty/public/check/:referralCode
   */
  static async checkPointsByReferralCode(req, res) {
    try {
      const { referralCode } = req.params;

      // Buscar el BusinessClient por código de referido
      const businessClient = await BusinessClient.findOne({
        where: { referralCode },
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['firstName', 'lastName']
          }
        ]
      });

      if (!businessClient) {
        return res.status(404).json({
          success: false,
          error: 'Código de tarjeta no encontrado'
        });
      }

      // Obtener balance actualizado
      const balance = await LoyaltyService.getClientBalance(
        businessClient.businessId,
        businessClient.clientId
      );

      res.json({
        success: true,
        data: {
          clientName: `${businessClient.client.firstName} ${businessClient.client.lastName}`,
          points: balance.totalPoints,
          referralCode: businessClient.referralCode,
          referralCount: businessClient.referralCount
        }
      });

    } catch (error) {
      console.error('Error consultando puntos por QR:', error);
      res.status(500).json({
        success: false,
        error: 'Error al consultar puntos'
      });
    }
  }
}

module.exports = LoyaltyController;
