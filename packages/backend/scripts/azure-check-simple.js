const { Client } = require('pg');

const azureConn = 'postgresql://dbadmin:BeautyControl2024!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require';

async function check() {
  const client = new Client({
    connectionString: azureConn,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('Conectando a Azure...');
    await client.connect();
    console.log('✅ Conectado\n');

    // 1. Verificar formato de columnas
    console.log('1️⃣ FORMATO DE TIMESTAMPS:\n');
    const cols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'permissions' 
        AND column_name IN ('createdAt', 'updatedAt', 'created_at', 'updated_at')
    `);
    
    console.log('Columnas encontradas:', cols.rows.map(r => r.column_name).join(', '));
    const useSnake = cols.rows.some(r => r.column_name === 'created_at');
    console.log(`Formato: ${useSnake ? '🐍 snake_case' : '🐪 camelCase'}\n`);

    // 2. Contar permisos de EXPENSES
    console.log('2️⃣ PERMISOS DE EXPENSES:\n');
    const perms = await client.query(`
      SELECT key, name FROM permissions WHERE category = 'EXPENSES' ORDER BY key
    `);
    
    if (perms.rows.length === 0) {
      console.log('❌ NO existen permisos de EXPENSES en Azure\n');
    } else {
      console.log(`✅ ${perms.rows.length} permisos encontrados:`);
      perms.rows.forEach(p => console.log(`   • ${p.key}`));
      console.log('');
    }

    // 3. Verificar defaults de BUSINESS
    console.log('3️⃣ DEFAULTS DE ROL BUSINESS PARA EXPENSES:\n');
    const defs = await client.query(`
      SELECT p.key, rdp.is_granted
      FROM role_default_permissions rdp
      JOIN permissions p ON p.id = rdp.permission_id
      WHERE rdp.role = 'BUSINESS' AND p.category = 'EXPENSES'
      ORDER BY p.key
    `);

    if (defs.rows.length === 0) {
      console.log('❌ No hay defaults configurados\n');
    } else {
      defs.rows.forEach(d => {
        const icon = d.is_granted ? '✅' : '❌';
        console.log(`   ${icon} ${d.key}: ${d.is_granted}`);
      });
      console.log('');
    }

    console.log('✅ Diagnóstico completado\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

check();
