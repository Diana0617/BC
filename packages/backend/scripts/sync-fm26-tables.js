/**
 * Script para sincronizar SOLO las nuevas tablas de comisiones y consentimientos (FM-26)
 * SIN borrar las demás tablas existentes
 */

require('dotenv').config();
const { sequelize } = require('../src/models');

async function syncNewTables() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Importar SOLO los nuevos modelos
    const { 
      BusinessCommissionConfig, 
      ServiceCommission, 
      ConsentTemplate, 
      ConsentSignature 
    } = require('../src/models');

    console.log('\n📊 Sincronizando tablas de FM-26...\n');

    // 1. BusinessCommissionConfig (no depende de nadie nuevo)
    console.log('⏳ Sincronizando business_commission_configs...');
    await BusinessCommissionConfig.sync({ force: false, alter: true });
    console.log('✅ business_commission_configs lista');

    // 2. ConsentTemplate (no depende de nadie nuevo)
    console.log('⏳ Sincronizando consent_templates...');
    await ConsentTemplate.sync({ force: false, alter: true });
    console.log('✅ consent_templates lista');

    // 3. ServiceCommission (depende de services que ya existe)
    console.log('⏳ Sincronizando service_commissions...');
    await ServiceCommission.sync({ force: false, alter: true });
    console.log('✅ service_commissions lista');

    // 4. ConsentSignature (depende de clients, consent_templates, services, appointments)
    console.log('⏳ Sincronizando consent_signatures...');
    await ConsentSignature.sync({ force: false, alter: true });
    console.log('✅ consent_signatures lista');

    console.log('\n🎉 ¡Todas las tablas de FM-26 sincronizadas exitosamente!\n');

    // Verificar que las tablas existen
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'business_commission_configs',
          'service_commissions',
          'consent_templates',
          'consent_signatures'
        )
      ORDER BY table_name;
    `);

    console.log('📋 Tablas creadas:');
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));

    if (tables.length === 4) {
      console.log('\n✅ Las 4 tablas se crearon correctamente');
    } else {
      console.log(`\n⚠️  Solo ${tables.length}/4 tablas fueron creadas`);
    }

    // También agregar la columna consentTemplateId a services si no existe
    console.log('\n⏳ Verificando columna consentTemplateId en services...');
    try {
      await sequelize.query(`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS "consentTemplateId" UUID 
        REFERENCES consent_templates(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
      `);
      
      await sequelize.query(`
        COMMENT ON COLUMN services."consentTemplateId" 
        IS 'Template de consentimiento por defecto para este servicio';
      `);
      
      console.log('✅ Columna consentTemplateId agregada/verificada en services');
    } catch (err) {
      console.log('⚠️  Columna ya existe o error al agregar:', err.message);
    }

    console.log('\n✨ Proceso completado exitosamente\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

syncNewTables();
