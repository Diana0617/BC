const { sequelize } = require('./src/config/database');

async function dropPermissionsTables() {
  try {
    console.log('🗑️  Eliminando tablas de permisos...');
    
    // Eliminar tablas en orden inverso (para respetar foreign keys)
    await sequelize.query('DROP TABLE IF EXISTS "user_business_permissions" CASCADE;');
    console.log('✅ Tabla user_business_permissions eliminada');
    
    await sequelize.query('DROP TABLE IF EXISTS "role_default_permissions" CASCADE;');
    console.log('✅ Tabla role_default_permissions eliminada');
    
    await sequelize.query('DROP TABLE IF EXISTS "permissions" CASCADE;');
    console.log('✅ Tabla permissions eliminada');
    
    // Eliminar el ENUM type si existe
    await sequelize.query('DROP TYPE IF EXISTS "enum_role_default_permissions_role" CASCADE;');
    console.log('✅ ENUM type eliminado');
    
    console.log('\n✅ Todas las tablas de permisos eliminadas correctamente');
    console.log('💡 Ahora ejecuta: node create-permissions-tables.js');
    
  } catch (error) {
    console.error('❌ Error al eliminar tablas:', error.message);
  } finally {
    await sequelize.close();
  }
}

dropPermissionsTables();
