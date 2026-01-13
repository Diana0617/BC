/**
 * Procesador de No Shows (No Asistencias)
 * 
 * Este módulo maneja el marcado automático de turnos sin asistencia.
 * Es llamado por el CronJobManager.
 * 
 * Funcionalidad:
 * - Busca turnos del día anterior con status CONFIRMED o IN_PROGRESS
 * - Verifica que no fueron completados ni cancelados
 * - Los marca como CANCELED con motivo "No asistió - Cancelación automática"
 * - Registra en el historial de cancelaciones del cliente
 * 
 * Frecuencia de llamada: Diaria a las 00:00 (configurado en CronJobManager)
 */

const { Appointment, Service, User, Client, Business } = require('../models');
const { Op } = require('sequelize');

// Flag para prevenir ejecuciones concurrentes
let isRunning = false;

/**
 * Procesa turnos sin asistencia del día anterior
 * @returns {Object} Estadísticas del proceso {processedCount, errorCount, totalFound, results}
 */
async function processNoShows() {
  if (isRunning) {
    console.log('⏭️  Proceso de No Shows ya en ejecución, saltando...');
    return { processedCount: 0, errorCount: 0, totalFound: 0, skipped: true };
  }

  isRunning = true;
  console.log('🔍 Ejecutando proceso de No Shows...');

  try {
    // Fecha de ayer (día completo)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    console.log(`📅 Buscando turnos entre ${yesterday.toISOString()} y ${yesterdayEnd.toISOString()}`);

    // Buscar turnos confirmados del día anterior que no fueron completados ni cancelados
    const noShowAppointments = await Appointment.findAll({
      where: {
        startTime: {
          [Op.between]: [yesterday, yesterdayEnd]
        },
        status: {
          [Op.in]: ['CONFIRMED', 'IN_PROGRESS'] // Turnos que se esperaba que se atendieran
        }
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`📋 Encontrados ${noShowAppointments.length} turnos sin asistencia`);

    if (noShowAppointments.length === 0) {
      return {
        success: true,
        message: 'No hay turnos sin asistencia para procesar',
        processedCount: 0,
        errorCount: 0,
        totalFound: 0
      };
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Procesar cada turno
    for (const appointment of noShowAppointments) {
      try {
        await appointment.update({
          status: 'CANCELED',
          canceledAt: new Date(),
          cancelReason: 'No asistió - Cancelación automática',
          canceledBy: null // null indica cancelación automática del sistema
        });

        console.log(`✅ Turno ${appointment.appointmentNumber} marcado como No Show`);
        
        results.push({
          appointmentId: appointment.id,
          appointmentNumber: appointment.appointmentNumber,
          clientName: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim(),
          serviceName: appointment.service?.name || 'N/A',
          businessName: appointment.business?.name || 'N/A',
          originalStartTime: appointment.startTime,
          success: true
        });

        successCount++;

      } catch (error) {
        console.error(`❌ Error procesando turno ${appointment.id}:`, error);
        
        results.push({
          appointmentId: appointment.id,
          appointmentNumber: appointment.appointmentNumber,
          success: false,
          error: error.message
        });

        errorCount++;
      }
    }

    const summary = {
      success: true,
      message: `Proceso completado: ${successCount} turnos marcados como No Show, ${errorCount} errores`,
      processedCount: successCount,
      errorCount,
      totalFound: noShowAppointments.length,
      results
    };

    console.log(`
📊 Resumen de No Shows:
   ✅ Procesados: ${successCount}
   ❌ Errores: ${errorCount}
   📋 Total encontrados: ${noShowAppointments.length}
    `);

    return summary;

  } catch (error) {
    console.error('❌ Error en proceso de No Shows:', error);
    return {
      success: false,
      message: 'Error procesando turnos sin asistencia',
      error: error.message,
      processedCount: 0,
      errorCount: 0,
      totalFound: 0
    };
  } finally {
    isRunning = false;
  }
}

/**
 * Obtener estadísticas de No Shows por negocio (uso manual/testing)
 * @param {string} businessId - ID del negocio
 * @param {number} days - Días hacia atrás (default: 30)
 * @returns {Object} Estadísticas de No Shows
 */
async function getNoShowStats(businessId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const noShows = await Appointment.count({
      where: {
        businessId,
        status: 'CANCELED',
        cancelReason: {
          [Op.iLike]: '%No asistió%'
        },
        canceledAt: {
          [Op.gte]: startDate
        }
      }
    });

    const totalAppointments = await Appointment.count({
      where: {
        businessId,
        startTime: {
          [Op.gte]: startDate
        }
      }
    });

    return {
      success: true,
      data: {
        noShowCount: noShows,
        totalAppointments,
        noShowRate: totalAppointments > 0 ? ((noShows / totalAppointments) * 100).toFixed(2) : 0,
        period: `${days} días`
      }
    };

  } catch (error) {
    console.error('Error obteniendo estadísticas de No Show:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exportar funciones
module.exports = {
  processNoShows,
  getNoShowStats
};
