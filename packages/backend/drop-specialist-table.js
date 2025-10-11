const { sequelize } = require('./src/models');

async function dropTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Eliminar tabla y tipos ENUM
    await sequelize.query('DROP TABLE IF EXISTS specialist_profiles CASCADE;');
    console.log('✅ Tabla specialist_profiles eliminada');
    
    await sequelize.query('DROP TYPE IF EXISTS "enum_specialist_profiles_commissionType" CASCADE;');
    console.log('✅ Tipo enum_specialist_profiles_commissionType eliminado');
    
    await sequelize.query('DROP TYPE IF EXISTS "enum_specialist_profiles_status" CASCADE;');
    console.log('✅ Tipo enum_specialist_profiles_status eliminado');
    
    await sequelize.query('DROP TYPE IF EXISTS "enum_specialist_profiles_contractType" CASCADE;');
    console.log('✅ Tipo enum_specialist_profiles_contractType eliminado');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropTable();
