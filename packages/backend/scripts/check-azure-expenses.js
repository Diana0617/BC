const { Client } = require('pg');

// Forzar conexión a Azure (ignorar .env local)
const azureConnectionString = 'postgresql://dbadmin:BeautyControl2024!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require';

async function checkAzureExpensesPermissions() {
  const client = new Client({
    connectionString: azureConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando a Azure PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a Azure\n');

    // Verificar columnas de la tabla permissions
    console.log('📋 Verificando estructura de tabla permissions:');
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'permissions' 
        AND column_name IN ('createdAt', 'updatedAt', 'created_at', 'updated_at')
      ORDER BY column_name;
    `);
    
    const columns = columnsResult.rows.map(r => r.column_name);
    console.log('  Columnas timestamp:', columns.join(', '));
    
    const hasSnakeCase = columns.includes('created_at');
    const hasCamelCase = columns.includes('createdAt');
    
    console.log(`  Formato: ${hasSnakeCase ? 'snake_case' : hasCamelCase ? 'camelCase' : 'DESCONOCIDO'}\n`);

    // Buscar permisos de EXPENSES usando el formato correcto
    const timestampCols = hasSnakeCase ? 'created_at, updated_at' : '"createdAt", "updatedAt"';
    
    console.log('🔍 Buscando permisos de EXPENSES...\n');
    const permissionsResult = await client.query(`
      SELECT id, key, name, category, is_active, ${timestampCols}
      FROM permissions 
      WHERE category = 'EXPENSES'
      ORDER BY key;
    `);

    if (permissionsResult.rows.length === 0) {
      console.log('❌ NO hay permisos de EXPENSES en Azure');
      console.log('\n💡 SOLUCIÓN:');
      console.log('   1. Los modelos necesitan underscored: true (para snake_case)');
      console.log('   2. Ejecutar: node scripts/seed-expenses-permissions.js');
      console.log('   3. Desplegar a Azure\n');
    } else {
      console.log(`✅ Encontrados ${permissionsResult.rows.length} permisos de EXPENSES:\n`);
      permissionsResult.rows.forEach(p => {
        console.log(`  • ${p.key.padEnd(25)} - ${p.name}`);
      });

      // Verificar defaults
      console.log('\n📊 Verificando permisos por defecto...\n');
      const defaultsResult = await client.query(`
        SELECT rdp.role, p.key, rdp.is_granted
        FROM role_default_permissions rdp
        JOIN permissions p ON p.id = rdp.permission_id
        WHERE p.category = 'EXPENSES'
        ORDER BY rdp.role, p.key;
      `);

      if (defaultsResult.rows.length === 0) {
        console.log('⚠️  No hay defaults configurados para EXPENSES');
      } else {
        let currentRole = null;
        defaultsResult.rows.forEach(d => {
          if (d.role !== currentRole) {
            currentRole = d.role;
            console.log(`\n  ${d.role}:`);
          }
          const icon = d.is_granted ? '✅' : '❌';
          console.log(`    ${icon} ${d.key}: ${d.is_granted}`);
        });
      }
    }

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  No se pudo conectar a Azure. Verifica:');
      console.error('   - Conexión a internet');
      console.error('   - Firewall de Azure permite tu IP');
    }
  } finally {
    await client.end();
  }
}

checkAzureExpensesPermissions();
