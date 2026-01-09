// Roles disponibles en el sistema
export const ROLES = {
  OWNER: 'OWNER',           // Administrador de la plataforma
  BUSINESS: 'BUSINESS',     // Propietario de negocio
  SPECIALIST: 'SPECIALIST', // Especialista/Empleado
  RECEPTIONIST: 'RECEPTIONIST', // Recepcionista
  RECEPTIONIST_SPECIALIST: 'RECEPTIONIST_SPECIALIST', // Recepcionista + Especialista
  BUSINESS_SPECIALIST: 'BUSINESS_SPECIALIST', // Dueño individual + Especialista
  CLIENT: 'CLIENT'          // Cliente
};

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING'
};

// Jerarquía de roles (mayor número = mayor autoridad)
export const ROLE_HIERARCHY = {
  [ROLES.CLIENT]: 1,
  [ROLES.RECEPTIONIST]: 2,
  [ROLES.SPECIALIST]: 3,
  [ROLES.RECEPTIONIST_SPECIALIST]: 3,
  [ROLES.BUSINESS_SPECIALIST]: 3.5, // Tiene permisos de especialista + administración básica
  [ROLES.BUSINESS]: 4,
  [ROLES.OWNER]: 5
};

// Permisos específicos del sistema
export const PERMISSIONS = {
  // === PLATFORM MANAGEMENT ===
  PLATFORM: {
    VIEW_STATS: 'platform:view_stats',
    MANAGE_BUSINESSES: 'platform:manage_businesses',
    MANAGE_USERS: 'platform:manage_users',
    MANAGE_SUBSCRIPTIONS: 'platform:manage_subscriptions',
    SETTINGS: 'platform:settings'
  },
  
  // === BUSINESS MANAGEMENT ===
  BUSINESS: {
    CREATE: 'business:create',
    VIEW: 'business:view',
    EDIT: 'business:edit',
    DELETE: 'business:delete',
    SETTINGS: 'business:settings'
  },
  
  // === USER MANAGEMENT ===
  USER: {
    CREATE: 'user:create',
    VIEW: 'user:view',
    EDIT: 'user:edit',
    DELETE: 'user:delete',
    MANAGE_STAFF: 'user:manage_staff',
    MANAGE_ROLES: 'user:manage_roles'
  },
  
  // === CLIENT MANAGEMENT ===
  CLIENT: {
    CREATE: 'client:create',
    VIEW: 'client:view',
    EDIT: 'client:edit',
    DELETE: 'client:delete',
    VIEW_HISTORY: 'client:view_history'
  },
  
  // === APPOINTMENT MANAGEMENT ===
  APPOINTMENT: {
    CREATE: 'appointment:create',
    VIEW: 'appointment:view',
    EDIT: 'appointment:edit',
    DELETE: 'appointment:delete',
    VIEW_OWN: 'appointment:view_own',
    CANCEL: 'appointment:cancel'
  },
  
  // === SERVICE MANAGEMENT ===
  SERVICE: {
    CREATE: 'service:create',
    VIEW: 'service:view',
    EDIT: 'service:edit',
    DELETE: 'service:delete',
    MANAGE_PRICING: 'service:manage_pricing'
  },
  
  // === PRODUCT MANAGEMENT ===
  PRODUCT: {
    CREATE: 'product:create',
    VIEW: 'product:view',
    EDIT: 'product:edit',
    DELETE: 'product:delete',
    MANAGE_INVENTORY: 'product:manage_inventory'
  },
  
  // === INVENTORY MANAGEMENT ===
  INVENTORY: {
    VIEW: 'inventory.view',
    CREATE: 'inventory.create',
    EDIT: 'inventory.edit',
    DELETE: 'inventory.delete',
    MOVEMENTS: 'inventory.movements'
  },
  
  // === FINANCIAL MANAGEMENT ===
  FINANCIAL: {
    VIEW: 'financial:view',
    CREATE_RECORD: 'financial:create_record',
    EDIT_RECORD: 'financial:edit_record',
    DELETE_RECORD: 'financial:delete_record',
    VIEW_REPORTS: 'financial:view_reports'
  },
  
  // === SUBSCRIPTION MANAGEMENT ===
  SUBSCRIPTION: {
    VIEW: 'subscription:view',
    CREATE: 'subscription:create',
    EDIT: 'subscription:edit',
    CANCEL: 'subscription:cancel'
  },
  
  // === PLAN MANAGEMENT ===
  PLAN: {
    VIEW: 'plan:view',
    CREATE: 'plan:create',
    EDIT: 'plan:edit',
    DELETE: 'plan:delete',
    MANAGE: 'plan:manage'
  },
  
  // === MODULE MANAGEMENT ===
  MODULE: {
    VIEW: 'module:view',
    CREATE: 'module:create',
    EDIT: 'module:edit',
    DELETE: 'module:delete',
    ASSIGN: 'module:assign'
  }
};

// Mapeo de permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: [
    // Acceso completo a toda la plataforma
    PERMISSIONS.PLATFORM.VIEW_STATS,
    PERMISSIONS.PLATFORM.MANAGE_BUSINESSES,
    PERMISSIONS.PLATFORM.MANAGE_USERS,
    PERMISSIONS.PLATFORM.MANAGE_SUBSCRIPTIONS,
    PERMISSIONS.PLATFORM.SETTINGS,
    
    // Gestión completa de negocios
    PERMISSIONS.BUSINESS.CREATE,
    PERMISSIONS.BUSINESS.VIEW,
    PERMISSIONS.BUSINESS.EDIT,
    PERMISSIONS.BUSINESS.DELETE,
    PERMISSIONS.BUSINESS.SETTINGS,
    
    // Gestión completa de usuarios
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.MANAGE_STAFF,
    PERMISSIONS.USER.MANAGE_ROLES,
    
    // Gestión completa de clientes
    PERMISSIONS.CLIENT.CREATE,
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.EDIT,
    PERMISSIONS.CLIENT.DELETE,
    PERMISSIONS.CLIENT.VIEW_HISTORY,
    
    // Gestión completa de citas
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    PERMISSIONS.APPOINTMENT.DELETE,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Gestión completa de servicios
    PERMISSIONS.SERVICE.CREATE,
    PERMISSIONS.SERVICE.VIEW,
    PERMISSIONS.SERVICE.EDIT,
    PERMISSIONS.SERVICE.DELETE,
    PERMISSIONS.SERVICE.MANAGE_PRICING,
    
    // Gestión completa de productos
    PERMISSIONS.PRODUCT.CREATE,
    PERMISSIONS.PRODUCT.VIEW,
    PERMISSIONS.PRODUCT.EDIT,
    PERMISSIONS.PRODUCT.DELETE,
    PERMISSIONS.PRODUCT.MANAGE_INVENTORY,
    
    // Gestión completa de finanzas
    PERMISSIONS.FINANCIAL.VIEW,
    PERMISSIONS.FINANCIAL.CREATE_RECORD,
    PERMISSIONS.FINANCIAL.EDIT_RECORD,
    PERMISSIONS.FINANCIAL.DELETE_RECORD,
    PERMISSIONS.FINANCIAL.VIEW_REPORTS,
    
    // Gestión completa de suscripciones
    PERMISSIONS.SUBSCRIPTION.VIEW,
    PERMISSIONS.SUBSCRIPTION.CREATE,
    PERMISSIONS.SUBSCRIPTION.EDIT,
    PERMISSIONS.SUBSCRIPTION.CANCEL,
    
    // Gestión completa de planes
    PERMISSIONS.PLAN.VIEW,
    PERMISSIONS.PLAN.CREATE,
    PERMISSIONS.PLAN.EDIT,
    PERMISSIONS.PLAN.DELETE,
    PERMISSIONS.PLAN.MANAGE,
    
    // Gestión completa de módulos
    PERMISSIONS.MODULE.VIEW,
    PERMISSIONS.MODULE.CREATE,
    PERMISSIONS.MODULE.EDIT,
    PERMISSIONS.MODULE.DELETE,
    PERMISSIONS.MODULE.ASSIGN
  ],

  [ROLES.BUSINESS]: [
    // Gestión de su negocio
    PERMISSIONS.BUSINESS.VIEW,
    PERMISSIONS.BUSINESS.EDIT,
    PERMISSIONS.BUSINESS.SETTINGS,
    
    // Gestión de staff
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.MANAGE_STAFF,
    
    // Gestión de clientes
    PERMISSIONS.CLIENT.CREATE,
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.EDIT,
    PERMISSIONS.CLIENT.VIEW_HISTORY,
    
    // Gestión de citas
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    PERMISSIONS.APPOINTMENT.DELETE,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Gestión de servicios
    PERMISSIONS.SERVICE.CREATE,
    PERMISSIONS.SERVICE.VIEW,
    PERMISSIONS.SERVICE.EDIT,
    PERMISSIONS.SERVICE.DELETE,
    PERMISSIONS.SERVICE.MANAGE_PRICING,
    
    // Gestión de productos
    PERMISSIONS.PRODUCT.CREATE,
    PERMISSIONS.PRODUCT.VIEW,
    PERMISSIONS.PRODUCT.EDIT,
    PERMISSIONS.PRODUCT.DELETE,
    PERMISSIONS.PRODUCT.MANAGE_INVENTORY,
    
    // Gestión financiera
    PERMISSIONS.FINANCIAL.VIEW,
    PERMISSIONS.FINANCIAL.CREATE_RECORD,
    PERMISSIONS.FINANCIAL.EDIT_RECORD,
    PERMISSIONS.FINANCIAL.VIEW_REPORTS,
    
    // Ver suscripción
    PERMISSIONS.SUBSCRIPTION.VIEW
  ],

  [ROLES.SPECIALIST]: [
    // Ver información del negocio
    PERMISSIONS.BUSINESS.VIEW,
    
    // Gestión básica de clientes
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.VIEW_HISTORY,
    
    // Gestión de sus citas
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    
    // Ver servicios
    PERMISSIONS.SERVICE.VIEW,
    
    // Ver productos
    PERMISSIONS.PRODUCT.VIEW
  ],

  [ROLES.RECEPTIONIST]: [
    // Ver información del negocio
    PERMISSIONS.BUSINESS.VIEW,
    
    // Gestión de clientes
    PERMISSIONS.CLIENT.CREATE,
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.EDIT,
    
    // Gestión de citas
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Ver servicios
    PERMISSIONS.SERVICE.VIEW,
    
    // Ver productos e inventario
    PERMISSIONS.PRODUCT.VIEW,
    PERMISSIONS.INVENTORY.VIEW
  ],

  [ROLES.CLIENT]: [
    // Ver sus propias citas
    PERMISSIONS.APPOINTMENT.VIEW_OWN,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Ver servicios disponibles
    PERMISSIONS.SERVICE.VIEW
  ],

  [ROLES.RECEPTIONIST_SPECIALIST]: [
    // Ver información del negocio
    PERMISSIONS.BUSINESS.VIEW,
    
    // Gestión de clientes (como recepcionista)
    PERMISSIONS.CLIENT.CREATE,
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.EDIT,
    PERMISSIONS.CLIENT.VIEW_HISTORY,
    
    // Gestión de citas (crear para otros + gestionar las propias)
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Ver servicios
    PERMISSIONS.SERVICE.VIEW,
    
    // Ver productos
    PERMISSIONS.PRODUCT.VIEW
  ],

  [ROLES.BUSINESS_SPECIALIST]: [
    // === PERMISOS COMPLETOS DE BUSINESS ===
    // Gestión completa del negocio
    PERMISSIONS.BUSINESS.VIEW,
    PERMISSIONS.BUSINESS.EDIT,
    PERMISSIONS.BUSINESS.DELETE,
    PERMISSIONS.BUSINESS.SETTINGS,
    
    // Gestión completa de usuarios y staff
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.MANAGE_STAFF,
    PERMISSIONS.USER.MANAGE_ROLES,
    
    // Gestión completa de clientes
    PERMISSIONS.CLIENT.CREATE,
    PERMISSIONS.CLIENT.VIEW,
    PERMISSIONS.CLIENT.EDIT,
    PERMISSIONS.CLIENT.DELETE,
    PERMISSIONS.CLIENT.VIEW_HISTORY,
    
    // Gestión completa de citas
    PERMISSIONS.APPOINTMENT.CREATE,
    PERMISSIONS.APPOINTMENT.VIEW,
    PERMISSIONS.APPOINTMENT.EDIT,
    PERMISSIONS.APPOINTMENT.DELETE,
    PERMISSIONS.APPOINTMENT.CANCEL,
    
    // Gestión completa de servicios
    PERMISSIONS.SERVICE.CREATE,
    PERMISSIONS.SERVICE.VIEW,
    PERMISSIONS.SERVICE.EDIT,
    PERMISSIONS.SERVICE.DELETE,
    PERMISSIONS.SERVICE.MANAGE_PRICING,
    
    // Gestión completa de productos e inventario
    PERMISSIONS.PRODUCT.CREATE,
    PERMISSIONS.PRODUCT.VIEW,
    PERMISSIONS.PRODUCT.EDIT,
    PERMISSIONS.PRODUCT.DELETE,
    PERMISSIONS.PRODUCT.MANAGE_INVENTORY,
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.CREATE,
    PERMISSIONS.INVENTORY.EDIT,
    PERMISSIONS.INVENTORY.DELETE,
    PERMISSIONS.INVENTORY.MOVEMENTS,
    
    // Gestión completa de finanzas
    PERMISSIONS.FINANCIAL.VIEW,
    PERMISSIONS.FINANCIAL.CREATE_RECORD,
    PERMISSIONS.FINANCIAL.EDIT_RECORD,
    PERMISSIONS.FINANCIAL.DELETE_RECORD,
    PERMISSIONS.FINANCIAL.VIEW_REPORTS,
    
    // Ver suscripción
    PERMISSIONS.SUBSCRIPTION.VIEW
  ]
};