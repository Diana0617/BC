const Business = require('../models/Business');
const { Op } = require('sequelize');

/**
 * Servicio para manejar la retención de datos de negocios
 * Política: Los datos se mantienen 30 días después del vencimiento de suscripción
 */
class DataRetentionService {
  
  /**
   * Establece la fecha de retención de datos para un negocio
   * @param {string} businessId - ID del negocio
   * @param {Date} expirationDate - Fecha de expiración de la suscripción
   * @returns {Promise<Business>} Negocio actualizado
   */
  static async setDataRetentionDate(businessId, expirationDate) {
    try {
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // Calcular fecha de retención: 30 días después de la expiración
      const retentionDate = new Date(expirationDate);
      retentionDate.setDate(retentionDate.getDate() + 30);

      await business.update({
        dataRetentionUntil: retentionDate
      });

      console.log(`📅 Fecha de retención establecida para negocio ${businessId}: ${retentionDate.toISOString()}`);
      
      return business;
    } catch (error) {
      console.error('Error estableciendo fecha de retención:', error);
      throw error;
    }
  }

  /**
   * Verifica si un negocio está en período de retención
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object>} { inRetention, daysLeft, retentionDate }
   */
  static async checkRetentionStatus(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      if (!business.dataRetentionUntil) {
        return {
          inRetention: false,
          daysLeft: null,
          retentionDate: null
        };
      }

      const now = new Date();
      const retentionDate = new Date(business.dataRetentionUntil);
      const inRetention = now <= retentionDate;
      
      const daysLeft = inRetention 
        ? Math.ceil((retentionDate - now) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        inRetention,
        daysLeft,
        retentionDate: business.dataRetentionUntil
      };
    } catch (error) {
      console.error('Error verificando estado de retención:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los negocios cuyo período de retención ha expirado
   * @returns {Promise<Array>} Lista de negocios para eliminar
   */
  static async getExpiredRetentionBusinesses() {
    try {
      const businesses = await Business.findAll({
        where: {
          dataRetentionUntil: {
            [Op.lt]: new Date()
          },
          status: {
            [Op.notIn]: ['ACTIVE']
          }
        }
      });

      console.log(`🗑️ Encontrados ${businesses.length} negocios con retención expirada`);
      
      return businesses;
    } catch (error) {
      console.error('Error obteniendo negocios con retención expirada:', error);
      throw error;
    }
  }

  /**
   * Limpia los datos de un negocio (para ejecutar después del período de retención)
   * ADVERTENCIA: Esta operación es irreversible
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  static async cleanupBusinessData(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      const retentionStatus = await this.checkRetentionStatus(businessId);
      
      if (retentionStatus.inRetention) {
        throw new Error(`Negocio aún está en período de retención. ${retentionStatus.daysLeft} días restantes.`);
      }

      // TODO: Implementar limpieza de datos relacionados
      // - Citas
      // - Clientes
      // - Servicios
      // - Productos
      // - Etc.

      console.log(`🗑️ ADVERTENCIA: Limpieza de datos para negocio ${businessId} - NO IMPLEMENTADO AÚN`);
      
      return {
        success: false,
        message: 'Limpieza de datos no implementada. Requiere aprobación manual.',
        businessId
      };
    } catch (error) {
      console.error('Error limpiando datos del negocio:', error);
      throw error;
    }
  }

  /**
   * Extiende el período de retención cuando se renueva la suscripción
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Business>} Negocio actualizado
   */
  static async clearRetentionDate(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      
      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      await business.update({
        dataRetentionUntil: null
      });

      console.log(`✅ Fecha de retención eliminada para negocio ${businessId} (suscripción renovada)`);
      
      return business;
    } catch (error) {
      console.error('Error limpiando fecha de retención:', error);
      throw error;
    }
  }

  /**
   * Actualiza automáticamente las fechas de retención para trials expirados
   * Se ejecuta periódicamente o durante el login
   */
  static async updateExpiredTrialsRetention() {
    try {
      const expiredTrials = await Business.findAll({
        where: {
          status: 'TRIAL',
          trialEndDate: {
            [Op.lt]: new Date()
          },
          dataRetentionUntil: null
        }
      });

      console.log(`📋 Actualizando ${expiredTrials.length} trials expirados con fecha de retención`);

      for (const business of expiredTrials) {
        await this.setDataRetentionDate(business.id, business.trialEndDate);
      }

      return {
        updated: expiredTrials.length,
        businesses: expiredTrials.map(b => b.id)
      };
    } catch (error) {
      console.error('Error actualizando retención de trials expirados:', error);
      throw error;
    }
  }
}

module.exports = DataRetentionService;
