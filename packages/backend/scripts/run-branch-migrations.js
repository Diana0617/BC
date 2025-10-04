require('dotenv').config();
const { sequelize } = require('../src/models');

/**
 * Script para sincronizar modelos de sucursales con la base de datos
 * Crea las tablas necesarias para el sistema de sucursales
 */

async function syncBranchModels() {
  try {
    console.log('🔄 Iniciando sincronización de modelos de sucursales...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Importar modelos necesarios
    const { Branch, SpecialistProfile, SpecialistBranchSchedule, Appointment } = require('../src/models');

    console.log('🔄 Sincronizando modelo Branch...');
    await Branch.sync({ alter: true });
    console.log('✅ Modelo Branch sincronizado');

    console.log('🔄 Sincronizando modelo SpecialistProfile...');
    await SpecialistProfile.sync({ alter: true });
    console.log('✅ Modelo SpecialistProfile sincronizado');

    console.log('🔄 Sincronizando modelo SpecialistBranchSchedule...');
    await SpecialistBranchSchedule.sync({ alter: true });
    console.log('✅ Modelo SpecialistBranchSchedule sincronizado');

    console.log('🔄 Sincronizando modelo Appointment (para agregar branch_id)...');
    await Appointment.sync({ alter: true });
    console.log('✅ Modelo Appointment sincronizado');

    console.log('🎉 Todos los modelos de sucursales sincronizados exitosamente');

  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔒 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncBranchModels();
}

module.exports = { syncBranchModels };