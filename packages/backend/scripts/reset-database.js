/**
 * Script para RESETEAR COMPLETAMENTE la base de datos y recrearla desde cero
 * ⚠️ ESTO BORRA TODOS LOS DATOS
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

require('dotenv').config();

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'beauty_control_dev';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

async function resetDatabase() {
  try {
    console.log('🔥 RESET COMPLETO DE BASE DE DATOS\n');
    console.log('⚠️  Esto borrará TODOS los datos y recreará las tablas\n');

    // 1. Conectar a postgres (base de datos por defecto)
    const psqlCommand = `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT}`;
    
    console.log('1️⃣ Cerrando conexiones activas a la base de datos...');
    try {
      await execPromise(`${psqlCommand} -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" postgres`);
      console.log('   ✅ Conexiones cerradas');
    } catch (err) {
      console.log('   ⚠️  No había conexiones activas o base de datos no existe');
    }

    // 2. Eliminar base de datos
    console.log('\n2️⃣ Eliminando base de datos...');
    try {
      await execPromise(`${psqlCommand} -c "DROP DATABASE IF EXISTS ${DB_NAME};" postgres`);
      console.log('   ✅ Base de datos eliminada');
    } catch (err) {
      console.log('   ⚠️  Error al eliminar:', err.message);
    }

    // 3. Crear base de datos nueva
    console.log('\n3️⃣ Creando base de datos nueva...');
    await execPromise(`${psqlCommand} -c "CREATE DATABASE ${DB_NAME};" postgres`);
    console.log('   ✅ Base de datos creada');

    // 4. Ahora sincronizar todas las tablas con force
    console.log('\n4️⃣ Sincronizando TODAS las tablas...');
    
    const { sequelize } = require('../src/models');
    const {
      SubscriptionPlan,
      Module,
      Business,
      User,
      Client,
      Service,
      Product,
      Appointment,
      Branch,
      PlanModule,
      BusinessSubscription,
      BusinessClient,
      InventoryMovement,
      FinancialMovement,
      PaymentIntegration,
      PasswordResetToken,
      UserBranch,
      SpecialistService,
      SpecialistProfile,
      SpecialistBranchSchedule,
      SpecialistDocument,
      SpecialistCommission,
      CommissionPaymentRequest,
      CommissionDetail,
      OwnerPaymentConfiguration,
      SubscriptionPayment,
      OwnerFinancialReport,
      OwnerExpense,
      RuleTemplate,
      BusinessRule,
      Receipt,
      BusinessExpenseCategory,
      BusinessExpense,
      // ===== NUEVOS MODELOS FM-26 =====
      BusinessCommissionConfig,
      ServiceCommission,
      ConsentTemplate,
      ConsentSignature
    } = require('../src/models');

    await sequelize.authenticate();
    console.log('   ✅ Conectado a la base de datos\n');

    // Sincronizar en orden correcto
    console.log('   Sincronizando tablas base...');
    await SubscriptionPlan.sync({ force: true });
    await Module.sync({ force: true });
    await Business.sync({ force: true });
    await User.sync({ force: true });
    await RuleTemplate.sync({ force: true });
    await BusinessRule.sync({ force: true });
    
    console.log('   Sincronizando tablas principales...');
    await Branch.sync({ force: true });
    await Client.sync({ force: true });
    await Product.sync({ force: true });
    
    console.log('   Sincronizando tablas de comisiones y consentimientos (FM-26)...');
    await BusinessCommissionConfig.sync({ force: true });
    await ConsentTemplate.sync({ force: true });
    await Service.sync({ force: true }); // Ahora que ConsentTemplate existe
    await ServiceCommission.sync({ force: true });
    
    console.log('   Sincronizando tablas multi-branch...');
    await UserBranch.sync({ force: true });
    await SpecialistService.sync({ force: true });
    await SpecialistProfile.sync({ force: true });
    await SpecialistBranchSchedule.sync({ force: true });
    
    console.log('   Sincronizando tablas de especialistas...');
    await SpecialistDocument.sync({ force: true });
    await SpecialistCommission.sync({ force: true });
    
    console.log('   Sincronizando tablas de pagos OWNER...');
    await OwnerPaymentConfiguration.sync({ force: true });
    
    console.log('   Sincronizando tablas de gastos...');
    await BusinessExpenseCategory.sync({ force: true });
    await BusinessExpense.sync({ force: true });
    
    console.log('   Sincronizando tablas con dependencias múltiples...');
    // Crear ConsentSignature primero SIN la FK a Appointment
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "consent_signatures" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "businessId" UUID NOT NULL,
        "consentTemplateId" UUID NOT NULL,
        "customerId" UUID NOT NULL,
        "appointmentId" UUID,
        "serviceId" UUID,
        "templateVersion" VARCHAR(20) NOT NULL,
        "templateContent" TEXT NOT NULL,
        "signatureData" TEXT,
        "signatureType" VARCHAR(20) NOT NULL DEFAULT 'DIGITAL',
        "signedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "signedBy" VARCHAR(255) NOT NULL,
        "editableFieldsData" JSONB DEFAULT '{}',
        "pdfUrl" VARCHAR(255),
        "pdfGeneratedAt" TIMESTAMP WITH TIME ZONE,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        "location" JSONB,
        "device" JSONB DEFAULT '{}',
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "revokedReason" TEXT,
        "revokedBy" UUID,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Ahora crear Appointment
    await Appointment.sync({ force: true });
    
    // Agregar las FKs después
    await sequelize.query(`
      ALTER TABLE "consent_signatures" 
      ADD CONSTRAINT "fk_consent_appointment" 
      FOREIGN KEY ("appointmentId") 
      REFERENCES "appointments"("id") 
      ON DELETE SET NULL;
      
      ALTER TABLE "consent_signatures"
      ADD CONSTRAINT "fk_consent_business"
      FOREIGN KEY ("businessId")
      REFERENCES "businesses"("id")
      ON DELETE CASCADE;
      
      ALTER TABLE "consent_signatures"
      ADD CONSTRAINT "fk_consent_template"
      FOREIGN KEY ("consentTemplateId")
      REFERENCES "consent_templates"("id")
      ON DELETE RESTRICT;
      
      ALTER TABLE "consent_signatures"
      ADD CONSTRAINT "fk_consent_customer"
      FOREIGN KEY ("customerId")
      REFERENCES "clients"("id")
      ON DELETE CASCADE;
      
      ALTER TABLE "consent_signatures"
      ADD CONSTRAINT "fk_consent_service"
      FOREIGN KEY ("serviceId")
      REFERENCES "services"("id")
      ON DELETE SET NULL;
      
      ALTER TABLE "consent_signatures"
      ADD CONSTRAINT "fk_consent_revoked_by"
      FOREIGN KEY ("revokedBy")
      REFERENCES "users"("id")
      ON DELETE SET NULL;
    `);
    
    await PlanModule.sync({ force: true });
    await BusinessSubscription.sync({ force: true });
    await BusinessClient.sync({ force: true });
    await InventoryMovement.sync({ force: true });
    await FinancialMovement.sync({ force: true });
    await PaymentIntegration.sync({ force: true });
    await PasswordResetToken.sync({ force: true });
    await Receipt.sync({ force: true });
    
    console.log('   Sincronizando tablas finales...');
    await CommissionPaymentRequest.sync({ force: true });
    await CommissionDetail.sync({ force: true });
    await SubscriptionPayment.sync({ force: true });
    await OwnerFinancialReport.sync({ force: true });
    await OwnerExpense.sync({ force: true });
    
    console.log('   ✅ TODAS las tablas sincronizadas\n');

    // 5. Sembrar datos iniciales
    console.log('5️⃣ Sembrando datos iniciales...\n');
    
    console.log('   📦 Sembrando módulos...');
    await execPromise('node scripts/seed-modules.js', { cwd: __dirname + '/..' });
    
    console.log('   📋 Sembrando reglas de negocio...');
    await execPromise('node scripts/seed-rule-templates.js', { cwd: __dirname + '/..' });
    
    console.log('\n✨ ¡RESET COMPLETADO EXITOSAMENTE!\n');
    console.log('📋 Resumen:');
    console.log('   ✅ Base de datos eliminada y recreada');
    console.log('   ✅ Todas las tablas creadas (incluyendo FM-26)');
    console.log('   ✅ Módulos sembrados');
    console.log('   ✅ Reglas de negocio sembradas');
    console.log('\n🚀 Ahora puedes iniciar el servidor con: npm start\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante el reset:', error);
    console.error('\nDetalles:', error.message);
    process.exit(1);
  }
}

// Confirmar antes de ejecutar
console.log('⚠️  ADVERTENCIA: Este script borrará TODOS los datos de la base de datos');
console.log(`📊 Base de datos: ${DB_NAME}`);
console.log(`🏠 Host: ${DB_HOST}:${DB_PORT}`);
console.log(`👤 Usuario: ${DB_USER}\n`);

setTimeout(() => {
  resetDatabase();
}, 2000);
