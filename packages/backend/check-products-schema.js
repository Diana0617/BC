const { sequelize, Product } = require('./src/models');

async function checkSchema() {
  try {
    console.log('Ì¥ç Verificando esquema de la tabla products...');
    
    // Obtener informaci√≥n de la tabla
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nÌ≥ã Columnas en la tabla products:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar si existe la columna images
    const hasImages = results.some(col => col.column_name === 'images');
    
    if (hasImages) {
      console.log('\n‚úÖ La columna images EXISTE en la tabla');
    } else {
      console.log('\n‚ùå La columna images NO EXISTE en la tabla');
      console.log('\nÌ¥ß Necesitas ejecutar esta migraci√≥n:');
      console.log(`
        ALTER TABLE products 
        ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
      `);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('‚ùå Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
