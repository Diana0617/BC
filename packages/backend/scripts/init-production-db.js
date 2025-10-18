#!/usr/bin/env node

/**
 * Script para inicializar la base de datos de producción
 * Uso: node scripts/init-production-db.js
 */

require('dotenv').config();

// Forzar conexión a producción
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const { sequelize } = require('../src/models');
const { seedModules } = require('./seed-modules');
const { seedPlans } = require('./seed-plans');
const { seedRuleTemplates } = require('./seed-rule-templates');

async function initProductionDatabase() {
  try {
    console.log('🚀 Inicializando base de datos de producción...\n');
    
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Neon...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.\n');
    
    // 2. Sincronizar modelos (crear tablas)
    console.log('🔄 Sincronizando modelos (creando tablas)...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tablas creadas/actualizadas.\n');
    
    // 3. Seed de módulos
    console.log('📦 Insertando módulos base...');
    await seedModules();
    console.log('✅ Módulos insertados.\n');
    
    // 4. Seed de planes
    console.log('💳 Insertando planes de suscripción...');
    await seedPlans();
    console.log('✅ Planes insertados.\n');
    
    // 5. Seed de rule templates
    console.log('📋 Insertando plantillas de reglas...');
    await seedRuleTemplates();
    console.log('✅ Plantillas de reglas insertadas.\n');
    
    // 6. Crear usuario de prueba
    console.log('👤 Creando usuario de producción...');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const { User } = require('../src/models');
    
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    
    const [user, created] = await User.findOrCreate({
      where: { email: 'Owner@bc.com' },
      defaults: {
        id: uuidv4(),
        email: 'Owner@bc.com',
        password: hashedPassword,
        firstName: 'Owner',
        lastName: 'Beauty Control',
        role: 'OWNER',
        isActive: true,
        emailVerified: true
      }
    });
    
    if (created) {
      console.log('✅ Usuario creado exitosamente.');
    } else {
      console.log('ℹ️  Usuario ya existe.');
    }
    
    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: Owner@bc.com');
    console.log('   Password: AdminPassword123!\n');
    
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
if (require.main === module) {
  initProductionDatabase()
    .then(() => {
      console.log('✨ Proceso completado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { initProductionDatabase };
