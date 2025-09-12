/**
 * Configuración de rutas protegidas para la aplicación
 * Define qué roles y permisos se requieren para cada ruta
 */

import { ROLES, PERMISSIONS } from '../constants/permissions';

export const ROUTE_CONFIG = {
  // Rutas públicas (no requieren autenticación)
  public: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/'
  ],

  // Rutas que requieren autenticación básica
  protected: [
    '/dashboard',
    '/profile',
    '/settings'
  ],

  // Rutas específicas por rol
  routes: {
    // Rutas solo para OWNER
    '/owner/dashboard': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLATFORM.VIEW_STATS]
    },
    '/owner/businesses': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLATFORM.MANAGE_BUSINESSES]
    },
    '/owner/users': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLATFORM.MANAGE_USERS]
    },
    '/owner/subscriptions': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLATFORM.MANAGE_SUBSCRIPTIONS]
    },
    '/owner/plans': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLAN.MANAGE]
    },
    '/owner/reports': {
      roles: [ROLES.OWNER],
      permissions: [PERMISSIONS.PLATFORM.VIEW_STATS]
    },

    // Rutas para administradores de negocio
    '/business/dashboard': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.BUSINESS.VIEW]
    },
    '/business/settings': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.BUSINESS.EDIT]
    },
    '/business/staff': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.USER.MANAGE_STAFF]
    },
    '/business/clients': {
      roles: [ROLES.BUSINESS, ROLES.SPECIALIST, ROLES.RECEPTIONIST],
      permissions: [PERMISSIONS.CLIENT.VIEW]
    },
    '/business/appointments': {
      roles: [ROLES.BUSINESS, ROLES.SPECIALIST, ROLES.RECEPTIONIST],
      permissions: [PERMISSIONS.APPOINTMENT.VIEW]
    },
    '/business/services': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.SERVICE.VIEW]
    },
    '/business/products': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.PRODUCT.VIEW]
    },
    '/business/reports': {
      roles: [ROLES.BUSINESS],
      permissions: [PERMISSIONS.FINANCIAL.VIEW]
    },

    // Rutas para especialistas
    '/specialist/schedule': {
      roles: [ROLES.SPECIALIST],
      permissions: [PERMISSIONS.APPOINTMENT.VIEW]
    },
    '/specialist/clients': {
      roles: [ROLES.SPECIALIST],
      permissions: [PERMISSIONS.CLIENT.VIEW]
    },

    // Rutas para recepcionistas
    '/reception/appointments': {
      roles: [ROLES.RECEPTIONIST],
      permissions: [PERMISSIONS.APPOINTMENT.CREATE, PERMISSIONS.APPOINTMENT.EDIT]
    },
    '/reception/clients': {
      roles: [ROLES.RECEPTIONIST],
      permissions: [PERMISSIONS.CLIENT.CREATE, PERMISSIONS.CLIENT.EDIT]
    },

    // Rutas para clientes
    '/client/appointments': {
      roles: [ROLES.CLIENT],
      permissions: [PERMISSIONS.APPOINTMENT.VIEW_OWN]
    },
    '/client/profile': {
      roles: [ROLES.CLIENT],
      permissions: []
    }
  }
};

/**
 * Función para obtener la configuración de una ruta específica
 * @param {string} path - Path de la ruta
 * @returns {Object|null} Configuración de la ruta o null si no existe
 */
export function getRouteConfig(path) {
  // Verificar rutas exactas
  if (ROUTE_CONFIG.routes[path]) {
    return ROUTE_CONFIG.routes[path];
  }

  // Verificar rutas con parámetros usando regex
  for (const routePath in ROUTE_CONFIG.routes) {
    const regex = new RegExp('^' + routePath.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
    if (regex.test(path)) {
      return ROUTE_CONFIG.routes[routePath];
    }
  }

  return null;
}

/**
 * Función para verificar si una ruta es pública
 * @param {string} path - Path de la ruta
 * @returns {boolean} True si la ruta es pública
 */
export function isPublicRoute(path) {
  return ROUTE_CONFIG.public.includes(path);
}

/**
 * Función para verificar si una ruta requiere solo autenticación básica
 * @param {string} path - Path de la ruta
 * @returns {boolean} True si la ruta requiere solo autenticación
 */
export function isProtectedRoute(path) {
  return ROUTE_CONFIG.protected.includes(path);
}

/**
 * Obtener todas las rutas accesibles para un rol específico
 * @param {string} userRole - Rol del usuario
 * @returns {Array} Array de rutas accesibles
 */
export function getAccessibleRoutes(userRole) {
  const accessibleRoutes = [...ROUTE_CONFIG.public];

  // Agregar rutas protegidas básicas
  if (userRole) {
    accessibleRoutes.push(...ROUTE_CONFIG.protected);
  }

  // Agregar rutas específicas del rol
  for (const [route, config] of Object.entries(ROUTE_CONFIG.routes)) {
    if (config.roles.includes(userRole)) {
      accessibleRoutes.push(route);
    }
  }

  return accessibleRoutes;
}

/**
 * Configuración de navegación por rol
 */
export const NAVIGATION_CONFIG = {
  [ROLES.OWNER]: [
    {
      path: '/owner/dashboard',
      label: 'Panel Principal',
      icon: 'dashboard',
      permissions: [PERMISSIONS.PLATFORM.VIEW_STATS]
    },
    {
      path: '/owner/businesses',
      label: 'Negocios',
      icon: 'business',
      permissions: [PERMISSIONS.PLATFORM.MANAGE_BUSINESSES]
    },
    {
      path: '/owner/users',
      label: 'Usuarios',
      icon: 'users',
      permissions: [PERMISSIONS.PLATFORM.MANAGE_USERS]
    },
    {
      path: '/owner/subscriptions',
      label: 'Suscripciones',
      icon: 'subscription',
      permissions: [PERMISSIONS.PLATFORM.MANAGE_SUBSCRIPTIONS]
    },
    {
      path: '/owner/plans',
      label: 'Planes',
      icon: 'plans',
      permissions: [PERMISSIONS.PLAN.MANAGE]
    },
    {
      path: '/owner/reports',
      label: 'Reportes',
      icon: 'reports',
      permissions: [PERMISSIONS.PLATFORM.VIEW_STATS]
    }
  ],

  [ROLES.BUSINESS]: [
    {
      path: '/business/dashboard',
      label: 'Panel Principal',
      icon: 'dashboard',
      permissions: [PERMISSIONS.BUSINESS.VIEW]
    },
    {
      path: '/business/appointments',
      label: 'Citas',
      icon: 'calendar',
      permissions: [PERMISSIONS.APPOINTMENT.VIEW]
    },
    {
      path: '/business/clients',
      label: 'Clientes',
      icon: 'users',
      permissions: [PERMISSIONS.CLIENT.VIEW]
    },
    {
      path: '/business/staff',
      label: 'Personal',
      icon: 'team',
      permissions: [PERMISSIONS.USER.MANAGE_STAFF]
    },
    {
      path: '/business/services',
      label: 'Servicios',
      icon: 'services',
      permissions: [PERMISSIONS.SERVICE.VIEW]
    },
    {
      path: '/business/products',
      label: 'Productos',
      icon: 'products',
      permissions: [PERMISSIONS.PRODUCT.VIEW]
    },
    {
      path: '/business/reports',
      label: 'Reportes',
      icon: 'reports',
      permissions: [PERMISSIONS.FINANCIAL.VIEW]
    },
    {
      path: '/business/settings',
      label: 'Configuración',
      icon: 'settings',
      permissions: [PERMISSIONS.BUSINESS.EDIT]
    }
  ],

  [ROLES.SPECIALIST]: [
    {
      path: '/specialist/schedule',
      label: 'Mi Horario',
      icon: 'calendar',
      permissions: [PERMISSIONS.APPOINTMENT.VIEW]
    },
    {
      path: '/specialist/clients',
      label: 'Mis Clientes',
      icon: 'users',
      permissions: [PERMISSIONS.CLIENT.VIEW]
    }
  ],

  [ROLES.RECEPTIONIST]: [
    {
      path: '/reception/appointments',
      label: 'Citas',
      icon: 'calendar',
      permissions: [PERMISSIONS.APPOINTMENT.CREATE, PERMISSIONS.APPOINTMENT.EDIT]
    },
    {
      path: '/reception/clients',
      label: 'Clientes',
      icon: 'users',
      permissions: [PERMISSIONS.CLIENT.CREATE, PERMISSIONS.CLIENT.EDIT]
    }
  ],

  [ROLES.CLIENT]: [
    {
      path: '/client/appointments',
      label: 'Mis Citas',
      icon: 'calendar',
      permissions: [PERMISSIONS.APPOINTMENT.VIEW_OWN]
    },
    {
      path: '/client/profile',
      label: 'Mi Perfil',
      icon: 'user',
      permissions: []
    }
  ]
};