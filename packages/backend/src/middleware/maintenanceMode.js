const SystemConfig = require('../models/SystemConfig');

/**
 * Middleware para verificar modo de mantenimiento
 * Bloquea todas las peticiones excepto las de desarrolladores
 */
const maintenanceMode = async (req, res, next) => {
  try {
    // Rutas que siempre se permiten incluso en mantenimiento
    const allowedPaths = [
      '/api/auth/login',
      '/api/developer',
      '/api/health'
    ];

    // Verificar si la ruta actual está permitida
    const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));
    if (isAllowedPath) {
      return next();
    }

    // Verificar si el usuario es OWNER (desarrollador)
    if (req.user && req.user.role === 'OWNER') {
      return next();
    }

    // Verificar estado de mantenimiento
    const config = await SystemConfig.findOne({
      where: { key: 'maintenance_mode' }
    });

    if (config && config.value.enabled) {
      return res.status(503).json({
        success: false,
        error: 'Sistema en mantenimiento',
        maintenanceMode: true,
        message: config.value.message || 'El sistema está en mantenimiento. Por favor intenta más tarde.',
        estimatedEndTime: config.value.estimatedEndTime || null
      });
    }

    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // En caso de error, permitir que la petición continúe
    next();
  }
};

module.exports = maintenanceMode;
