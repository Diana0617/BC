require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuración directa de la base de datos
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aoi02FPudzqj@ep-curly-union-aek8wz8r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 DATABASE_URL:', DATABASE_URL ? '✅ Configurado' : '❌ No configurado');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
});

async function initializeBasicDatabase() {
  try {
    console.log('🔄 Iniciando proceso de inicialización básica...');

    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Crear tablas básicas usando SQL directo
    console.log('🏗️ Creando tablas básicas...');
    
    // Crear ENUMS primero
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_subscription_plans_billing_cycle" AS ENUM('MONTHLY', 'YEARLY', 'QUARTERLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_businesses_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_users_role" AS ENUM('ADMIN', 'OWNER', 'EMPLOYEE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_modules_category" AS ENUM('CORE', 'BUSINESS', 'PREMIUM', 'ENTERPRISE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Tabla subscription_plans
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "price" INTEGER NOT NULL DEFAULT 0,
        "billing_cycle" "enum_subscription_plans_billing_cycle" NOT NULL DEFAULT 'MONTHLY',
        "features" JSON DEFAULT '[]',
        "limits" JSON DEFAULT '{}',
        "is_active" BOOLEAN DEFAULT true,
        "sort_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla modules  
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "modules" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "description" TEXT,
        "category" "enum_modules_category" NOT NULL DEFAULT 'CORE',
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla businesses
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "businesses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "code" VARCHAR(50) UNIQUE,
        "email" VARCHAR(255) UNIQUE,
        "phone" VARCHAR(255),
        "address" JSON DEFAULT '{}',
        "settings" JSON DEFAULT '{}',
        "status" "enum_businesses_status" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla users
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "business_id" UUID REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "role" "enum_users_role" NOT NULL DEFAULT 'EMPLOYEE',
        "is_active" BOOLEAN DEFAULT true,
        "avatar_url" VARCHAR(500),
        "last_login" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla plan_modules (relación many-to-many)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "plan_modules" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "subscription_plan_id" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "module_id" UUID NOT NULL REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "is_included" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE("subscription_plan_id", "module_id")
      );
    `);

    // Tabla business_subscriptions
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "business_subscriptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "business_id" UUID NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "subscription_plan_id" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "status" VARCHAR(50) DEFAULT 'ACTIVE',
        "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ends_at" TIMESTAMP WITH TIME ZONE,
        "auto_renew" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Tablas básicas creadas');

    // Crear datos básicos
    console.log('📦 Insertando datos básicos...');
    
    // 1. Crear módulos
    const modules = [
      { name: 'Gestión de Clientes', description: 'Administración completa de información de clientes', category: 'CORE' },
      { name: 'Agenda y Citas', description: 'Sistema de agendamiento y gestión de citas', category: 'CORE' },
      { name: 'Servicios', description: 'Catálogo y gestión de servicios ofrecidos', category: 'CORE' },
      { name: 'Inventario', description: 'Control de productos e inventario', category: 'BUSINESS' },
      { name: 'Finanzas', description: 'Gestión financiera y reportes', category: 'BUSINESS' }
    ];

    for (const module of modules) {
      await sequelize.query(`
        INSERT INTO "modules" (name, description, category, is_active)
        VALUES (:name, :description, :category, true)
        ON CONFLICT (name) DO NOTHING;
      `, {
        replacements: module
      });
    }

    // 2. Crear planes
    const plans = [
      { name: 'Básico', description: 'Plan básico para emprendedores', price: 29900, billing_cycle: 'MONTHLY' },
      { name: 'Profesional', description: 'Plan profesional con más funciones', price: 59900, billing_cycle: 'MONTHLY' },
      { name: 'Empresarial', description: 'Plan completo para empresas', price: 99900, billing_cycle: 'MONTHLY' }
    ];

    for (const plan of plans) {
      await sequelize.query(`
        INSERT INTO "subscription_plans" (name, description, price, billing_cycle, is_active)
        VALUES (:name, :description, :price, :billing_cycle, true)
        ON CONFLICT DO NOTHING;
      `, {
        replacements: plan
      });
    }

    // 3. Crear business de prueba
    await sequelize.query(`
      INSERT INTO "businesses" (name, code, email, status)
      VALUES ('Demo Beauty Salon', 'DEMO001', 'demo@beautysalon.com', 'ACTIVE')
      ON CONFLICT (email) DO NOTHING;
    `);

    // 4. Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await sequelize.query(`
      INSERT INTO "users" (business_id, email, password, name, role, is_active)
      SELECT b.id, 'admin@beautysalon.com', :password, 'Admin Usuario', 'ADMIN', true
      FROM "businesses" b WHERE b.email = 'demo@beautysalon.com'
      ON CONFLICT (email) DO NOTHING;
    `, {
      replacements: { password: hashedPassword }
    });

    console.log('✅ Datos básicos insertados');

    console.log('🎉 Base de datos inicializada correctamente');
    console.log('👤 Usuario de prueba: admin@beautysalon.com / admin123');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  initializeBasicDatabase()
    .then(() => {
      console.log('✨ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script de inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeBasicDatabase };