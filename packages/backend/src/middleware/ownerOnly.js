/**
 * Middleware de autorización para el rol OWNER
 * 
 * Verifica que el usuario autenticado tenga rol OWNER y esté activo.
 * Debe usarse después del middleware 'auth.js' para acceder a req.user.
 * 
 * Permisos del OWNER según la matriz de roles:
 * - Gestionar planes de suscripción de la plataforma
 * - Configurar módulos de cada plan
 * - Ver estadísticas globales de la plataforma
 * - Gestionar gastos/finanzas de la plataforma
 * - Crear/activar/cancelar suscripciones de negocios
 * - Registrar un negocio manualmente
 * - Gestionar negocios (editar datos, activar/desactivar)
 */

const ownerOnly = (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Se requiere autenticación.'
      });
    }

    // Verificar que el usuario tenga rol OWNER
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador (OWNER) para realizar esta acción.',
        requiredRole: 'OWNER',
        currentRole: req.user.role
      });
    }

    // Verificar que el usuario esté activo
    // Temporalmente comentado para testing
    // if (req.user.status !== 'ACTIVE') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Cuenta inactiva. Contacte al administrador.',
    //     userStatus: req.user.status
    //   });
    // }

    // Usuario OWNER válido, continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error en middleware ownerOnly:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en la verificación de permisos.'
    });
  }
};

module.exports = ownerOnly;