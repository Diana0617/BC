require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos en desarrollo (cuidado en producción)
    if (process.env.NODE_ENV === 'development') {
      // Importar modelos para sincronización manual
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
        // Nuevos modelos multi-branch y pricing
        UserBranch,
        SpecialistService,
        // Modelo de especialistas
        SpecialistProfile,
        SpecialistBranchSchedule,
        // Nuevos modelos de comisiones
        SpecialistDocument,
        SpecialistCommission,
        CommissionPaymentRequest,
        CommissionDetail,
        // Nuevos modelos de pagos OWNER
        OwnerPaymentConfiguration,
        SubscriptionPayment,
        OwnerFinancialReport,
        OwnerExpense,
        // Nuevos modelos simplificados de reglas
        RuleTemplate,
        BusinessRule,
        // Nuevo modelo de recibos
        Receipt,
        // Modelos de gastos del negocio
        BusinessExpenseCategory,
        BusinessExpense,
        // Nuevos modelos de comisiones y consentimientos (FM-26)
        BusinessCommissionConfig,
        ServiceCommission,
        ConsentTemplate,
        ConsentSignature
      } = require('./src/models');

      // Configuración de sincronización
      // DISABLE_SYNC=true para deshabilitar sincronización automática (más rápido)
      // FORCE_SYNC_DB=true para recrear toda la base de datos
      const disableSync = process.env.DISABLE_SYNC === 'true';
      const syncMode = process.env.FORCE_SYNC_DB === 'true' ? 'force' : 'alter';
      const syncOptions = syncMode === 'force' ? { force: true } : { alter: true };
      
      if (disableSync) {
        console.log('⚡ DISABLE_SYNC activado - OMITIENDO sincronización automática');
        console.log('✅ Base de datos ya debe estar configurada correctamente');
      } else if (syncMode === 'force') {
        console.log('🔥 FORCE_SYNC_DB activado - RECREANDO TODA LA BASE DE DATOS');
        console.log('⚠️  TODOS LOS DATOS SERÁN ELIMINADOS');
      } else {
        console.log('🔄 Sincronizando tablas con alter mode...');
      }
      
      // Solo sincronizar si no está deshabilitado
      if (!disableSync) {
        // 1. Tablas sin dependencias
        await SubscriptionPlan.sync(syncOptions);
        await Module.sync(syncOptions);
        // console.log('✅ Tablas base sincronizadas');
        
        // 2. Business (puede depender de SubscriptionPlan si agregamos currentPlanId)
        await Business.sync(syncOptions);
        // console.log('✅ Tabla Business sincronizada');
        
        // 3. User primero (porque BusinessRuleTemplate referencia al Owner/User)
        await User.sync(syncOptions);
        // console.log('✅ Tabla User sincronizada');
        
        // 4. Nuevos modelos simplificados de reglas
        await RuleTemplate.sync(syncOptions);
        await BusinessRule.sync(syncOptions);
        // console.log('✅ Nuevos modelos de reglas sincronizados');
        
        // 5. Tablas principales (ANTES DE TABLAS CON FK A ESTAS)
        await Branch.sync(syncOptions);
        await Client.sync(syncOptions);
        await Product.sync(syncOptions);
        // console.log('✅ Tablas principales (Branch, Client, Product) sincronizadas');
        
        // 5.0.1. TABLAS DE COMISIONES Y CONSENTIMIENTOS (ANTES DE SERVICE)
        await BusinessCommissionConfig.sync(syncOptions);
        await ConsentTemplate.sync(syncOptions);
        // console.log('✅ Tablas de comisiones y consentimientos base (FM-26) sincronizadas');
        
        // 5.0.2. SERVICE (AHORA QUE CONSENT_TEMPLATES YA EXISTE)
        await Service.sync(syncOptions);
        // console.log('✅ Tabla Service sincronizada (con FK a ConsentTemplate)');
        
        // 5.0.3. TABLAS QUE DEPENDEN DE SERVICE
        await ServiceCommission.sync(syncOptions);
        // ConsentSignature movido a después de Appointment (tiene FK a appointments)
        // console.log('✅ Tablas que dependen de Service (ServiceCommission) sincronizadas');
        
        // 5.1. NUEVAS TABLAS MULTI-BRANCH Y PRICING PERSONALIZADO
        await UserBranch.sync(syncOptions);
        await SpecialistService.sync(syncOptions);
        // console.log('✅ Tablas de multi-branch y pricing personalizado sincronizadas');
        
        // 5.2. TABLA DE PERFILES DE ESPECIALISTAS
        await SpecialistProfile.sync(syncOptions);
        // console.log('✅ Tabla specialist_profiles sincronizada');
        
        // 5.3. TABLA DE HORARIOS DE ESPECIALISTAS POR SUCURSAL (many-to-many)
        await SpecialistBranchSchedule.sync(syncOptions);
        // console.log('✅ Tabla specialist_branch_schedules sincronizada');
        
        // 6. Modelos de especialistas (nuevos)
        await SpecialistDocument.sync(syncOptions);
        await SpecialistCommission.sync(syncOptions);
        // console.log('✅ Tablas de especialistas sincronizadas');
        
        // 7. Modelos de pagos OWNER (nuevos)
        await OwnerPaymentConfiguration.sync(syncOptions);
        // console.log('✅ Configuración de pagos OWNER sincronizada');
        
        // 7.1. Tablas de gastos del negocio (ANTES de FinancialMovement porque FinancialMovement tiene FK a estas)
        await BusinessExpenseCategory.sync(syncOptions);
        await BusinessExpense.sync(syncOptions);
        // console.log('✅ Tablas de gastos del negocio sincronizadas');
        
        // 8. Tablas que dependen de múltiples entidades
        await Appointment.sync(syncOptions);
        // ConsentSignature movido aquí (necesita appointments + services + clients)
        await ConsentSignature.sync(syncOptions);
        await PlanModule.sync(syncOptions);
        await BusinessSubscription.sync(syncOptions);
        await BusinessClient.sync(syncOptions);
        await InventoryMovement.sync(syncOptions);
        await FinancialMovement.sync(syncOptions); // Ahora puede referenciar business_expense_categories
        await PaymentIntegration.sync(syncOptions);
        await PasswordResetToken.sync(syncOptions);
        
        // 9. Tablas de comisiones (al final porque dependen de otras)
        await CommissionPaymentRequest.sync(syncOptions);
        await CommissionDetail.sync(syncOptions);
        // console.log('✅ Tablas de comisiones sincronizadas');
        
        // 9. Tablas de pagos del OWNER (al final porque dependen de BusinessSubscription)
        await SubscriptionPayment.sync(syncOptions);
  await OwnerFinancialReport.sync(syncOptions);
        // OwnerExpense puede no existir en bases de datos antiguas; crearla en desarrollo si falta
        // Evitamos usar `alter` sobre tablas complejas que puedan generar SQL inválido
        // en ciertas combinaciones de versiones de Postgres/Sequelize. Solo usamos
        // force cuando explícitamente se pide via FORCE_SYNC_DB, de lo contrario
        // realizamos una creación no destructiva (create-if-not-exists).
        if (syncMode === 'force') {
          await OwnerExpense.sync({ force: true });
        } else {
          await OwnerExpense.sync();
        }
        // console.log('✅ Tablas de pagos OWNER sincronizadas');
        
        console.log(`✅ Todas las tablas sincronizadas en modo: ${syncMode.toUpperCase()}`);
      }
    }

    // Inicializar servicios
    const tokenCleanupService = require('./src/services/TokenCleanupService');
    //console.log('🧹 Servicio de limpieza de tokens inicializado');

    // Inicializar Cron Jobs
    const CronJobManager = require('./src/utils/CronJobManager');
    if (process.env.NODE_ENV !== 'test') {
      CronJobManager.initializeJobs();
    }

    // Iniciar servidor en todas las interfaces de red
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor Business Control corriendo en puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Mobile access: http://192.168.0.213:${PORT}/health`);
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
      
      server.close(async () => {
        console.log('🔒 Servidor HTTP cerrado');
        
        try {
          await sequelize.close();
          console.log('🔒 Conexión a la base de datos cerrada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error cerrando la base de datos:', error);
          process.exit(1);
        }
      });
    });

    process.on('SIGINT', async () => {
      console.log('🔄 Recibida señal SIGINT, cerrando servidor...');
      
      server.close(async () => {
        console.log('🔒 Servidor HTTP cerrado');
        
        try {
          await sequelize.close();
          console.log('🔒 Conexión a la base de datos cerrada');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error cerrando la base de datos:', error);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo de promesa no manejado:', reason);
  process.exit(1);
});

startServer();