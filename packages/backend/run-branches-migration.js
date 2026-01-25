const { sequelize } = require('./src/config/database');

async function runMigration() {
  try {
    await sequelize.authenticate();


    // Permitir NULL en address
    await sequelize.query(`
      ALTER TABLE branches 
      ALTER COLUMN address DROP NOT NULL;
    `);

    // Permitir NULL en city
    await sequelize.query(`
      ALTER TABLE branches 
      ALTER COLUMN city DROP NOT NULL;
    `);

    // Agregar comentarios
    await sequelize.query(`
      COMMENT ON COLUMN branches.address IS 'Dirección de la sucursal (opcional durante configuración inicial)';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN branches.city IS 'Ciudad de la sucursal (opcional durante configuración inicial)';
    `);

    
    // Verificar cambios
    const [results] = await sequelize.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'branches' 
      AND column_name IN ('address', 'city', 'email')
      ORDER BY column_name;
    `);
    

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
