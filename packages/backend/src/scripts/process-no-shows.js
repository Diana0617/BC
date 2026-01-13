#!/usr/bin/env node

/**
 * Script CRON para procesar turnos sin asistencia (No Shows)
 * Ejecutar diariamente a las 00:00
 * 
 * Agregar a crontab:
 * 0 0 * * * /usr/bin/node /path/to/process-no-shows.js >> /var/log/no-shows.log 2>&1
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const NoShowService = require('../services/NoShowService');

async function run() {
  console.log('=====================================');
  console.log('🕐 Iniciando proceso de No Shows');
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-AR')}`);
  console.log('=====================================\n');

  try {
    const result = await NoShowService.markNoShowAppointments();

    if (result.success) {
      console.log('\n✅ PROCESO EXITOSO');
      console.log(`📊 Resumen:`);
      console.log(`   - Turnos encontrados: ${result.totalFound || 0}`);
      console.log(`   - Marcados como No Show: ${result.processedCount || 0}`);
      console.log(`   - Errores: ${result.errorCount || 0}`);

      if (result.results && result.results.length > 0) {
        console.log('\n📋 Detalle:');
        result.results.forEach((r, index) => {
          if (r.success) {
            console.log(`   ${index + 1}. ✅ ${r.appointmentNumber} - ${r.clientName} - ${r.serviceName}`);
          } else {
            console.log(`   ${index + 1}. ❌ ${r.appointmentNumber} - Error: ${r.error}`);
          }
        });
      }
    } else {
      console.log('\n❌ PROCESO FALLIDO');
      console.error(`Error: ${result.message}`);
      console.error(result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:');
    console.error(error);
    process.exit(1);
  }

  console.log('\n=====================================');
  console.log('✅ Proceso finalizado');
  console.log('=====================================');
  
  process.exit(0);
}

// Ejecutar
run();
