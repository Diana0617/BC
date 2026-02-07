const { sequelize } = require('../src/config/database');

/**
 * Script para verificar la estructura actual de las tablas de permisos
 * ANTES de realizar cualquier cambio en producción
 */
async function checkTablesStructure() {
  try {
    console.log('🔍 Verificando estructura de tablas de permisos en Azure...\n');

    const tables = ['permissions', 'role_default_permissions', 'user_business_permissions'];

    for (const tableName of tables) {
      console.log(`📋 Tabla: ${tableName}`);
      console.log('─'.repeat(60));

      // Consultar columnas de la tabla
      const [columns] = await sequelize.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);

      if (columns.length === 0) {
        console.log(`⚠️  Tabla '${tableName}' NO existe en la base de datos\n`);
        continue;
      }

      // Mostrar todas las columnas
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        console.log(`  - ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
      });

      // Verificar específicamente las columnas timestamp
      const hasCreatedAt = columns.some(c => c.column_name === 'createdAt');
      const hasUpdatedAt = columns.some(c => c.column_name === 'updatedAt');
      const hasCreated_at = columns.some(c => c.column_name === 'created_at');
      const hasUpdated_at = columns.some(c => c.column_name === 'updated_at');

      console.log('\n  📅 Formato de timestamps:');
      if (hasCreatedAt && hasUpdatedAt) {
        console.log('  ✅ camelCase: createdAt, updatedAt');
      } else if (hasCreated_at && hasUpdated_at) {
        console.log('  🔧 snake_case: created_at, updated_at');
        console.log('  ⚠️  NECESITA MIGRACIÓN a camelCase');
      } else {
        console.log('  ❌ No se encontraron columnas de timestamp');
      }

      // Contar registros
      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) as count FROM ${tableName};
      `);
      console.log(`\n  📊 Registros existentes: ${countResult[0].count}`);
      console.log('');
    }

    console.log('✅ Verificación completada\n');
    
    // Resumen de recomendación
    console.log('📝 RECOMENDACIÓN:');
    console.log('  Si las tablas usan snake_case (created_at, updated_at):');
    console.log('  → Ejecutar migración para normalizar a camelCase');
    console.log('');
    console.log('  Si las tablas usan camelCase (createdAt, updatedAt):');
    console.log('  → Ya está correcto, ejecutar seed directamente');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verificando tablas:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

checkTablesStructure();
