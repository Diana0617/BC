/**
 * Configuración de Cron Jobs para Beauty Control
 * 
 * Jobs programados:
 * - Verificación diaria de suscripciones (8:00 AM)
 * - Limpieza de tokens expirados (2:00 AM)
 * - Generación de reportes financieros (9:00 AM lunes)
 * - Auto-renovación de suscripciones (6:00 AM)
 * - Reintentos de pagos fallidos (10:00 AM y 3:00 PM)
 * - Notificaciones de próximos vencimientos (9:00 AM)
 * - Recordatorios WhatsApp de citas (cada 15 minutos)
 * - Verificación horaria de recordatorios WhatsApp (cada hora - backup)
 * - Procesamiento de No Shows (00:00 AM - medianoche)
 */

const cron = require('node-cron');
const SubscriptionStatusService = require('../services/SubscriptionStatusService');
const AutoRenewalService = require('../services/AutoRenewalService');

class CronJobManager {
  
  static initializeJobs() {
    // console.log('🕒 Inicializando Cron Jobs...');

    // Verificación diaria de suscripciones - 8:00 AM todos los días
    cron.schedule('0 8 * * *', async () => {
      // console.log('🔄 Ejecutando verificación diaria de suscripciones...');
      try {
        const result = await SubscriptionStatusService.runDailyStatusCheck();
        // console.log('✅ Verificación completada:', result);
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
      // console.log('🧹 Limpiando tokens expirados...');
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
        
        // console.log(`🗑️ Eliminados ${deleted} tokens expirados`);
      } catch (error) {
        console.error('❌ Error limpiando tokens:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Generación de reportes financieros - 9:00 AM todos los lunes
    cron.schedule('0 9 * * 1', async () => {
      // console.log('📊 Generando reportes financieros semanales...');
      try {
        // TODO: Implementar generación automática de reportes
        // console.log('📈 Reportes financieros generados (pendiente implementación)');
      } catch (error) {
        console.error('❌ Error generando reportes:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // =================================================
    // AUTO-RENOVACIÓN DE SUSCRIPCIONES
    // =================================================
    
    // Procesar auto-renovaciones - 6:00 AM todos los días
    cron.schedule('0 6 * * *', async () => {
      // console.log('🔄 Ejecutando proceso de auto-renovación...');
      try {
        const result = await AutoRenewalService.processAutoRenewals();
        // console.log('✅ Auto-renovación completada:', result);
      } catch (error) {
        console.error('❌ Error en auto-renovación:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Procesar reintentos de pagos fallidos - 10:00 AM y 3:00 PM
    cron.schedule('0 10,15 * * *', async () => {
      // console.log('🔄 Procesando reintentos de pagos...');
      try {
        await AutoRenewalService.processPaymentRetries();
      } catch (error) {
        console.error('❌ Error en reintentos de pagos:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Notificar próximos vencimientos - 9:00 AM todos los días
    cron.schedule('0 9 * * *', async () => {
      // console.log('📧 Enviando notificaciones de próximos vencimientos...');
      try {
        await AutoRenewalService.notifyUpcomingExpirations();
      } catch (error) {
        console.error('❌ Error enviando notificaciones:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // =================================================
    // RECORDATORIOS WHATSAPP
    // =================================================
    
    // Enviar recordatorios de citas - Cada 15 minutos
    cron.schedule('*/15 * * * *', async () => {
      try {
        const appointmentReminderCron = require('../cron/appointmentReminders');
        await appointmentReminderCron.sendReminders();
      } catch (error) {
        console.error('❌ Error enviando recordatorios WhatsApp:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // Verificación cada hora para recordatorios pendientes (backup)
    cron.schedule('0 * * * *', async () => {
      try {
        const appointmentReminderCron = require('../cron/appointmentReminders');
        await appointmentReminderCron.sendReminders();
      } catch (error) {
        console.error('❌ Error en verificación horaria de recordatorios:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // =================================================
    // PROCESAMIENTO DE NO SHOWS (TURNOS SIN ASISTENCIA)
    // =================================================
    
    // Procesar No Shows - 00:00 (medianoche) todos los días
    cron.schedule('0 0 * * *', async () => {
      console.log('🔍 Ejecutando proceso de No Shows...');
      try {
        const noShowProcessor = require('../cron/noShowProcessor');
        const result = await noShowProcessor.processNoShows();
        console.log('✅ Proceso de No Shows completado:', result);
      } catch (error) {
        console.error('❌ Error en proceso de No Shows:', error);
      }
    }, {
      timezone: "America/Bogota"
    });

    // console.log('✅ Cron Jobs inicializados correctamente');
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
   * Ejecuta auto-renovación manual (para testing)
   */
  static async runManualAutoRenewal() {
    console.log('🧪 Ejecutando auto-renovación manual...');
    try {
      const result = await AutoRenewalService.processAutoRenewals();
      console.log('✅ Auto-renovación manual completada:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en auto-renovación manual:', error);
      throw error;
    }
  }

  /**
   * Ejecuta reintentos de pagos manual (para testing)
   */
  static async runManualPaymentRetries() {
    console.log('🧪 Ejecutando reintentos manual...');
    try {
      await AutoRenewalService.processPaymentRetries();
      console.log('✅ Reintentos manuales completados');
    } catch (error) {
      console.error('❌ Error en reintentos manuales:', error);
      throw error;
    }
  }

  /**
   * Ejecuta notificaciones manual (para testing)
   */
  static async runManualNotifications() {
    console.log('🧪 Ejecutando notificaciones manual...');
    try {
      await AutoRenewalService.notifyUpcomingExpirations();
      console.log('✅ Notificaciones manuales enviadas');
    } catch (error) {
      console.error('❌ Error en notificaciones manuales:', error);
      throw error;
    }
  }

  /**
   * Ejecuta envío de recordatorios WhatsApp manual (para testing)
   */
  static async runManualWhatsAppReminders() {
    console.log('🧪 Ejecutando recordatorios WhatsApp manual...');
    try {
      const appointmentReminderCron = require('../cron/appointmentReminders');
      const result = await appointmentReminderCron.sendReminders();
      console.log('✅ Recordatorios WhatsApp enviados:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en recordatorios WhatsApp manual:', error);
      throw error;
    }
  }

  /**
   * Envía recordatorio WhatsApp inmediato para una cita específica (para testing)
   */
  static async sendImmediateReminder(appointmentId) {
    console.log(`🧪 Enviando recordatorio inmediato para cita ${appointmentId}...`);
    try {
      const appointmentReminderCron = require('../cron/appointmentReminders');
      const result = await appointmentReminderCron.sendImmediateReminder(appointmentId);
      console.log('✅ Recordatorio inmediato enviado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error enviando recordatorio inmediato:', error);
      throw error;
    }
  }

  /**
   * Ejecuta procesamiento de No Shows manual (para testing)
   */
  static async runManualNoShowProcess() {
    console.log('🧪 Ejecutando procesamiento de No Shows manual...');
    try {
      const noShowProcessor = require('../cron/noShowProcessor');
      const result = await noShowProcessor.processNoShows();
      console.log('✅ Procesamiento de No Shows completado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en procesamiento de No Shows manual:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de No Shows para un negocio (para testing/reportes)
   */
  static async getNoShowStats(businessId, days = 30) {
    console.log(`🧪 Obteniendo estadísticas de No Shows para negocio ${businessId}...`);
    try {
      const noShowProcessor = require('../cron/noShowProcessor');
      const result = await noShowProcessor.getNoShowStats(businessId, days);
      console.log('✅ Estadísticas de No Shows obtenidas:', result);
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de No Shows:', error);
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
    // console.log('⏹️ Todos los Cron Jobs detenidos');
  }
}

module.exports = CronJobManager;