const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSuppliersTable() {
  try {
    console.log('\n🔍 Verificando tabla suppliers...\n');
    
    // 1. Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla suppliers NO EXISTE');
      await pool.end();
      return;
    }
    
    console.log('✅ La tabla suppliers EXISTE\n');
    
    // 2. Ver estructura de la tabla
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'suppliers'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columnas de la tabla suppliers:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Contar registros
    const countResult = await pool.query('SELECT COUNT(*) FROM suppliers');
    console.log(`\n📊 Total de proveedores: ${countResult.rows[0].count}\n`);
    
    // 4. Ver algunos proveedores del businessId específico
    const businessId = 'b1effc61-cd62-45fc-a942-8eb8c144a721';
    const suppliers = await pool.query(`
      SELECT id, name, email, status, "businessId"
      FROM suppliers
      WHERE "businessId" = $1
      LIMIT 5
    `, [businessId]);
    
    if (suppliers.rows.length > 0) {
      console.log(`✅ Proveedores encontrados para business ${businessId}:`);
      suppliers.rows.forEach(s => {
        console.log(`   - ${s.name} (${s.email}) - Status: ${s.status}`);
      });
    } else {
      console.log(`⚠️ No hay proveedores para business ${businessId}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkSuppliersTable();
