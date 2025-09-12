/**
 * Configuración de Cron Jobs para Beauty Control
 * 
 * Jobs programados:
 * - Verificación diaria de suscripciones (8:00 AM)
 * - Limpieza de tokens expirados (2:00 AM)
 * - Generación de reportes financieros (9:00 AM)
 */

const cron = require('node-cron');
const SubscriptionStatusService = require('../services/SubscriptionStatusService');

class CronJobManager {
  
  static initializeJobs() {
    console.log('🕒 Inicializando Cron Jobs...');

    // Verificación diaria de suscripciones - 8:00 AM todos los días
    cron.schedule('0 8 * * *', async () => {
      console.log('🔄 Ejecutando verificación diaria de suscripciones...');
      try {
        const result = await SubscriptionStatusService.runDailyStatusCheck();
        console.log('✅ Verificación completada:', result);
      } catch (error) {
        console.error('❌ Error en verificación diaria:', error);
      }
    }, {
      timezone: "America/Bogota" // Ajustar según tu zona horaria
    });

    // Verificación cada hora durante horario comercial (9 AM - 6 PM)
    cron.schedule('0 9-18 * * *', async () => {
      try {
        const attention = await SubscriptionStatusService.getSubscriptionsRequiringAttention();
        if (attention.expiringSoon > 0 || attention.overdue > 0 || attention.pendingPayments > 0) {
          console.log('⚠️ Suscripciones requieren atención:', attention);
        }
      } catch (error) {
        console.error('❌ Error verificando atención:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Limpieza de tokens expirados - 2:00 AM todos los días
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Limpiando tokens expirados...');
      try {
        const { PasswordResetToken } = require('../models');
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const deleted = await PasswordResetToken.destroy({
          where: {
            createdAt: {
              [require('sequelize').Op.lt]: oneDayAgo
            }
          }
        });
        
        console.log(`🗑️ Eliminados ${deleted} tokens expirados`);
      } catch (error) {
        console.error('❌ Error limpiando tokens:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Generación de reportes financieros - 9:00 AM todos los lunes
    cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Generando reportes financieros semanales...');
      try {
        // TODO: Implementar generación automática de reportes
        console.log('📈 Reportes financieros generados (pendiente implementación)');
      } catch (error) {
        console.error('❌ Error generando reportes:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    console.log('✅ Cron Jobs inicializados correctamente');
  }

  /**
   * Ejecuta verificación manual (para testing)
   */
  static async runManualSubscriptionCheck() {
    console.log('🧪 Ejecutando verificación manual...');
    try {
      const result = await SubscriptionStatusService.runDailyStatusCheck();
      const attention = await SubscriptionStatusService.getSubscriptionsRequiringAttention();
      
      return {
        statusChanges: result,
        attention: attention,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error en verificación manual:', error);
      throw error;
    }
  }

  /**
   * Detiene todos los cron jobs (útil para testing)
   */
  static stopAllJobs() {
    cron.getTasks().forEach(task => {
      task.stop();
    });
    console.log('⏹️ Todos los Cron Jobs detenidos');
  }
}

module.exports = CronJobManager;