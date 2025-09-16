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
        BusinessRules,
        User,
        Client,
        Service,
        Product,
        Appointment,
        PlanModule,
        BusinessSubscription,
        BusinessClient,
        InventoryMovement,
        FinancialMovement,
        PaymentIntegration,
        PasswordResetToken,
        // Nuevos modelos de comisiones
        SpecialistDocument,
        SpecialistCommission,
        CommissionPaymentRequest,
        CommissionDetail,
        // Nuevos modelos de pagos OWNER
        OwnerPaymentConfiguration,
        SubscriptionPayment,
        OwnerFinancialReport,
        // Nuevos modelos de Rule Templates
        BusinessRuleTemplate,
        BusinessRuleAssignment,
        // Nuevo modelo de recibos
        Receipt
      } = require('./src/models');

      // Configuración de sincronización - cambiar FORCE_SYNC_DB=true para recrear toda la base
      const syncMode = process.env.FORCE_SYNC_DB === 'true' ? 'force' : 'alter';
      const syncOptions = syncMode === 'force' ? { force: true } : { alter: true };
      
      if (syncMode === 'force') {
        console.log('🔥 FORCE_SYNC_DB activado - RECREANDO TODA LA BASE DE DATOS');
        console.log('⚠️  TODOS LOS DATOS SERÁN ELIMINADOS');
      } else {
        console.log('🔄 Sincronizando tablas con alter mode...');
      }
      
      // 1. Tablas sin dependencias
      await SubscriptionPlan.sync(syncOptions);
      await Module.sync(syncOptions);
      console.log('✅ Tablas base sincronizadas');
      
      // 2. Business (puede depender de SubscriptionPlan si agregamos currentPlanId)
      await Business.sync(syncOptions);
      console.log('✅ Tabla Business sincronizada');
      
      // 3. User primero (porque BusinessRuleTemplate referencia al Owner/User)
      await User.sync(syncOptions);
      console.log('✅ Tabla User sincronizada');
      
      // 4. Tablas de Rule Templates (necesarias antes de BusinessRules)
      await BusinessRuleTemplate.sync(syncOptions);
      await BusinessRuleAssignment.sync(syncOptions);
      console.log('✅ Tablas de Rule Templates sincronizadas');
      
      // 5. Ahora BusinessRules (después de que existan las tablas que referencia)
      await BusinessRules.sync(syncOptions);
      await Client.sync(syncOptions);
      await Service.sync(syncOptions);
      await Product.sync(syncOptions);
      console.log('✅ Tablas principales sincronizadas');
      
      // 6. Modelos de especialistas (nuevos)
      await SpecialistDocument.sync(syncOptions);
      await SpecialistCommission.sync(syncOptions);
      console.log('✅ Tablas de especialistas sincronizadas');
      
      // 7. Modelos de pagos OWNER (nuevos)
      await OwnerPaymentConfiguration.sync(syncOptions);
      console.log('✅ Configuración de pagos OWNER sincronizada');
      
      // 8. Tablas que dependen de múltiples entidades
      await Appointment.sync(syncOptions);
      await PlanModule.sync(syncOptions);
      await BusinessSubscription.sync(syncOptions);
      await BusinessClient.sync(syncOptions);
      await InventoryMovement.sync(syncOptions);
      await FinancialMovement.sync(syncOptions);
      await PaymentIntegration.sync(syncOptions);
      await PasswordResetToken.sync(syncOptions);
      
      // 7. Tablas de comisiones (al final porque dependen de otras)
      await CommissionPaymentRequest.sync(syncOptions);
      await CommissionDetail.sync(syncOptions);
      console.log('✅ Tablas de comisiones sincronizadas');
      
      // 9. Tablas de pagos del OWNER (al final porque dependen de BusinessSubscription)
      await SubscriptionPayment.sync(syncOptions);
      await OwnerFinancialReport.sync(syncOptions);
      console.log('✅ Tablas de pagos OWNER sincronizadas');
      
      console.log(`✅ Todas las tablas sincronizadas en modo: ${syncMode.toUpperCase()}`);
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