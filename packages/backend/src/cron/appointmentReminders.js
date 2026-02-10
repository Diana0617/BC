/**
 * Servicio de Recordatorios de Citas por WhatsApp
 * 
 * Este módulo maneja el envío automático de recordatorios de citas 24 horas antes
 * a través de WhatsApp Business API. Es llamado por el CronJobManager.
 * 
 * Funcionalidad:
 * - Busca citas que estén entre 23 y 25 horas en el futuro
 * - Verifica que no se haya enviado ya el recordatorio
 * - Envía mensaje por WhatsApp con detalles de la cita
 * - Marca la cita como recordatorio enviado
 * 
 * Frecuencia de llamada: Cada 15 minutos (configurado en CronJobManager)
 */

const { Appointment, Client, Service, User, Business } = require('../models');
const { Op } = require('sequelize');
const WhatsAppService = require('../services/WhatsAppService');

// Flag para prevenir ejecuciones concurrentes
let isRunning = false;

/**
 * Envía recordatorios a citas que estén 24 horas antes
 * @returns {Object} Estadísticas de envío {sent, failed, total}
 */
async function sendReminders() {
  if (isRunning) {
    console.log('⏭️  Proceso de recordatorios ya en ejecución, saltando...');
    return { sent: 0, failed: 0, total: 0, skipped: true };
  }

  isRunning = true;
  console.log('📱 Ejecutando proceso de recordatorios WhatsApp...');

  try {
    // Calcular ventana de tiempo: 23h a 25h antes de la cita
    const now = new Date();
    const reminderStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 horas
    const reminderEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25 horas

    //console.log(`🔍 Buscando citas entre ${reminderStart.toISOString()} y ${reminderEnd.toISOString()}`);

    // Buscar citas que necesiten recordatorio
    const appointments = await Appointment.findAll({
      where: {
        startTime: {
          [Op.between]: [reminderStart, reminderEnd]
        },
        status: {
          [Op.in]: ['CONFIRMED', 'PENDING'] // Solo citas confirmadas o pendientes
        },
        remindersSent: {
          [Op.or]: [null, false] // Que no se haya enviado recordatorio
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ],
      order: [['startTime', 'ASC']]
    });

    console.log(`📋 Encontradas ${appointments.length} citas para recordatorio`);

    let sentCount = 0;
    let failedCount = 0;

    // Procesar cada cita
    for (const appointment of appointments) {
      try {
        // Verificar que el cliente tenga teléfono
        if (!appointment.client?.phone) {
          console.log(`⚠️  Cita ${appointment.id}: Cliente sin teléfono, saltando...`);
          continue;
        }

        // Intentar enviar recordatorio
        //console.log(`📤 Enviando recordatorio para cita ${appointment.id} (${appointment.client.firstName} ${appointment.client.lastName})`);
        
        const result = await WhatsAppService.sendAppointmentReminder(
          appointment.businessId,
          appointment
        );

        if (result.success) {
          // Marcar como enviado
          await appointment.update({
            remindersSent: true,
            reminderSentAt: new Date(),
            reminderMessageId: result.messageId
          });

          sentCount++;
          //console.log(`✅ Recordatorio enviado exitosamente para cita ${appointment.id}`);
        } else {
          failedCount++;
          console.error(`❌ Fallo al enviar recordatorio para cita ${appointment.id}:`, result.error);
        }

        // Pequeño delay para no sobrecargar la API
        await sleep(1000); // 1 segundo entre mensajes
      } catch (error) {
        failedCount++;
        console.error(`❌ Error procesando cita ${appointment.id}:`, error);
      }
    }

    const summary = {
      sent: sentCount,
      failed: failedCount,
      total: appointments.length
    };

//     console.log(`
// 📊 Resumen de recordatorios:
//    ✅ Enviados: ${sentCount}
//    ❌ Fallidos: ${failedCount}
//    📋 Total procesadas: ${appointments.length}
//     `);

    return summary;

  } catch (error) {
    console.error('❌ Error en proceso de recordatorios:', error);
    throw error;
  } finally {
    isRunning = false;
  }
}

/**
 * Función de utilidad para pausar ejecución
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Envía recordatorio inmediato para una cita específica (uso manual/testing)
 * @param {number} appointmentId - ID de la cita
 * @returns {Object} Resultado del envío
 */
async function sendImmediateReminder(appointmentId) {
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'duration', 'price']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ]
    });

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }

    if (!appointment.client?.phone) {
      throw new Error('Cliente sin número de teléfono');
    }

    const result = await WhatsAppService.sendAppointmentReminder(
      appointment.businessId,
      appointment
    );

    if (result.success) {
      await appointment.update({
        remindersSent: true,
        reminderSentAt: new Date(),
        reminderMessageId: result.messageId
      });

      return {
        success: true,
        message: 'Recordatorio enviado exitosamente',
        messageId: result.messageId
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error enviando recordatorio inmediato:', error);
    throw error;
  }
}

// Exportar funciones
module.exports = {
  sendReminders,
  sendImmediateReminder
};
