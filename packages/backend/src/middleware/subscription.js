/**
 * Middleware para verificación de suscripción activa
 * 
 * Protege rutas basándose en el estado de suscripción del negocio:
 * - ACTIVE: Acceso completo
 * - PENDING: Acceso completo (período de gracia)
 * - OVERDUE: Acceso limitado (solo funciones básicas)
 * - SUSPENDED: Sin acceso (solo consulta de estado)
 */

const SubscriptionStatusService = require('../services/SubscriptionStatusService');

/**
 * Middleware que requiere suscripción activa (ACTIVE o PENDING)
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    // Solo aplica a usuarios con businessId (no OWNER)
    if (!req.user.businessId || req.user.role === 'OWNER') {
      return next();
    }

    const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(req.user.businessId);

    if (!statusInfo.access) {
      return res.status(402).json({
        success: false,
        message: 'Su suscripción está suspendida. Por favor, realice el pago para continuar.',
        subscriptionStatus: {
          status: statusInfo.status,
          daysOverdue: statusInfo.daysOverdue,
          hasAccess: false
        }
      });
    }

    // Agregar información de suscripción al request
    req.subscriptionStatus = statusInfo;
    next();

  } catch (error) {
    console.error('Error verificando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado de suscripción.'
    });
  }
};

/**
 * Middleware que requiere acceso completo (ACTIVE o PENDING)
 * Bloquea acceso limitado (OVERDUE)
 */
const requireFullAccess = async (req, res, next) => {
  try {
    // Solo aplica a usuarios con businessId (no OWNER)
    if (!req.user.businessId || req.user.role === 'OWNER') {
      return next();
    }

    const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(req.user.businessId);

    if (!statusInfo.access || statusInfo.level === 'LIMITED') {
      const message = statusInfo.level === 'LIMITED' 
        ? 'Acceso limitado: Su suscripción está vencida. Algunas funciones están restringidas.'
        : 'Su suscripción está suspendida. Por favor, realice el pago para continuar.';

      return res.status(402).json({
        success: false,
        message,
        subscriptionStatus: {
          status: statusInfo.status,
          accessLevel: statusInfo.level,
          daysOverdue: statusInfo.daysOverdue,
          hasAccess: statusInfo.access
        }
      });
    }

    req.subscriptionStatus = statusInfo;
    next();

  } catch (error) {
    console.error('Error verificando acceso completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado de suscripción.'
    });
  }
};

/**
 * Middleware que permite acceso básico (ACTIVE, PENDING, OVERDUE)
 * Solo bloquea SUSPENDED
 */
const requireBasicAccess = async (req, res, next) => {
  try {
    // OWNER no tiene restricciones de suscripción (admin de plataforma)
    if (req.user.role === 'OWNER') {
      return next();
    }

    // Usuarios sin businessId pueden pasar (casos especiales)
    if (!req.user.businessId) {
      return next();
    }

    const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(req.user.businessId);

    if (statusInfo.status === 'SUSPENDED') {
      return res.status(402).json({
        success: false,
        message: 'Su suscripción está suspendida. Solo puede consultar el estado de pago.',
        subscriptionStatus: {
          status: statusInfo.status,
          daysOverdue: statusInfo.daysOverdue,
          hasAccess: false
        }
      });
    }

    req.subscriptionStatus = statusInfo;
    next();

  } catch (error) {
    console.error('Error verificando acceso básico:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado de suscripción.'
    });
  }
};

/**
 * Middleware informativo que agrega información de suscripción al request
 * No bloquea el acceso, solo informa
 */
const addSubscriptionInfo = async (req, res, next) => {
  try {
    // Solo aplica a usuarios con businessId (no OWNER)
    if (!req.user.businessId || req.user.role === 'OWNER') {
      return next();
    }

    const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(req.user.businessId);
    req.subscriptionStatus = statusInfo;
    
    // Agregar header con información de suscripción
    res.set('X-Subscription-Status', statusInfo.status);
    res.set('X-Access-Level', statusInfo.level);
    
    next();

  } catch (error) {
    console.error('Error obteniendo información de suscripción:', error);
    // No bloquea la request, solo continúa sin info
    next();
  }
};

/**
 * Funciones de utilidad para verificar permisos específicos
 */
const SubscriptionPermissions = {
  
  /**
   * Verificar si puede crear nuevos recursos
   */
  canCreate: (subscriptionStatus) => {
    return subscriptionStatus && 
           subscriptionStatus.level === 'FULL' && 
           ['ACTIVE', 'PENDING'].includes(subscriptionStatus.status);
  },

  /**
   * Verificar si puede acceder a módulos premium
   */
  canAccessPremium: (subscriptionStatus) => {
    return subscriptionStatus && 
           subscriptionStatus.level === 'FULL' && 
           subscriptionStatus.status === 'ACTIVE';
  },

  /**
   * Verificar si puede generar reportes avanzados
   */
  canGenerateReports: (subscriptionStatus) => {
    return subscriptionStatus && 
           subscriptionStatus.level === 'FULL' && 
           ['ACTIVE', 'PENDING'].includes(subscriptionStatus.status);
  },

  /**
   * Verificar si puede realizar operaciones administrativas
   */
  canAdministrate: (subscriptionStatus) => {
    return subscriptionStatus && 
           subscriptionStatus.level === 'FULL' && 
           subscriptionStatus.status === 'ACTIVE';
  }
};

module.exports = {
  requireActiveSubscription,
  requireFullAccess,
  requireBasicAccess,
  addSubscriptionInfo,
  SubscriptionPermissions
};