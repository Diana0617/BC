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
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor Beauty Control corriendo en puerto ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
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