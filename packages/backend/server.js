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
        PasswordResetToken
      } = require('./src/models');

      // Sincronizar en orden de dependencias
      //console.log('🔄 Sincronizando tablas en orden...');
      
      // 1. Tablas sin dependencias
      await SubscriptionPlan.sync({ alter: true });
      await Module.sync({ alter: true });
      //console.log('✅ Tablas base creadas');
      
      // 2. Business (puede depender de SubscriptionPlan si agregamos currentPlanId)
      await Business.sync({ alter: true });
      //console.log('✅ Tabla Business creada');
      
      // 3. Tablas que dependen de Business
      await BusinessRules.sync({ alter: true });
      await User.sync({ alter: true });
      await Client.sync({ alter: true });
      await Service.sync({ alter: true });
      await Product.sync({ alter: true });
      //console.log('✅ Tablas principales creadas');
      
      // 4. Tablas que dependen de múltiples entidades
      await Appointment.sync({ alter: true });
      await PlanModule.sync({ alter: true });
      await BusinessSubscription.sync({ alter: true });
      await BusinessClient.sync({ alter: true });
      await InventoryMovement.sync({ alter: true });
      await FinancialMovement.sync({ alter: true });
      await PaymentIntegration.sync({ alter: true });
      await PasswordResetToken.sync({ alter: true });
      
      //console.log('✅ Todas las tablas sincronizadas con la base de datos');
    }

    // Inicializar servicios
    const tokenCleanupService = require('./src/services/TokenCleanupService');
    //console.log('🧹 Servicio de limpieza de tokens inicializado');

    // Iniciar servidor en todas las interfaces de red
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor Beauty Control corriendo en puerto ${PORT}`);
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