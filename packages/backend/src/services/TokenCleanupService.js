const { PasswordResetToken } = require('../models');

/**
 * Script de limpieza automática de tokens expirados
 * Ejecuta cada hora para mantener la base de datos limpia
 */
class TokenCleanupService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Iniciar el servicio de limpieza automática
   * @param {number} intervalMinutes - Intervalo en minutos (default: 60)
   */
  start(intervalMinutes = 60) {
    if (this.isRunning) {
      console.log('🧹 Servicio de limpieza ya está corriendo');
      return;
    }

    console.log(`🧹 Iniciando servicio de limpieza de tokens (cada ${intervalMinutes} minutos)`);
    
    // Ejecutar inmediatamente una vez
    this.cleanup();
    
    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  /**
   * Detener el servicio de limpieza
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Servicio de limpieza de tokens detenido');
    }
  }

  /**
   * Ejecutar limpieza manual
   */
  async cleanup() {
    try {
      const deletedCount = await PasswordResetToken.cleanupExpiredTokens();
      
      if (deletedCount > 0) {
        console.log(`🧹 Limpieza completada: ${deletedCount} tokens expirados eliminados`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Error en limpieza de tokens:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de tokens
   */
  async getStats() {
    try {
      const total = await PasswordResetToken.count();
      const valid = await PasswordResetToken.scope('valid').count();
      const expired = await PasswordResetToken.scope('expired').count();
      const used = await PasswordResetToken.scope('used').count();

      return {
        total,
        valid,
        expired,
        used,
        pendingCleanup: expired
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de tokens:', error);
      return null;
    }
  }

  /**
   * Obtener estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: !!this.intervalId
    };
  }
}

// Exportar instancia singleton
const tokenCleanupService = new TokenCleanupService();

// Auto-iniciar en producción
if (process.env.NODE_ENV === 'production') {
  tokenCleanupService.start(60); // Cada 60 minutos en producción
} else {
  tokenCleanupService.start(180); // Cada 3 horas en desarrollo
}

// Manejar cierre graceful
process.on('SIGINT', () => {
  tokenCleanupService.stop();
});

process.on('SIGTERM', () => {
  tokenCleanupService.stop();
});

module.exports = tokenCleanupService;