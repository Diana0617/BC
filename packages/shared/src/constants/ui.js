/**
 * Constantes de UI y UX para toda la aplicación
 */

// ==================== PAGINACIÓN ====================
export const PAGINATION = {
  // Elementos por página en diferentes contextos
  DEFAULT_PAGE_SIZE: 8,
  SMALL_PAGE_SIZE: 5,
  MEDIUM_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 20,
  
  // Tamaños específicos por tipo de contenido
  MOVEMENTS: 8,
  APPOINTMENTS: 10,
  CLIENTS: 10,
  PRODUCTS: 12,
  INVOICES: 8,
  EXPENSES: 8,
  COMMISSIONS: 8,
  
  // Opciones para selector de tamaño de página
  PAGE_SIZE_OPTIONS: [5, 8, 10, 20, 50, 100]
};

// ==================== LAYOUT ====================
export const LAYOUT = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280
};

// ==================== ANIMACIONES ====================
export const ANIMATIONS = {
  DURATION_FAST: 150,
  DURATION_NORMAL: 300,
  DURATION_SLOW: 500
};

// ==================== VALIDACIONES ====================
export const VALIDATION = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024 // 10MB
};

// ==================== FORMATOS ====================
export const FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  CURRENCY: 'es-CO',
  CURRENCY_CODE: 'COP'
};

export default {
  PAGINATION,
  LAYOUT,
  ANIMATIONS,
  VALIDATION,
  FORMATS
};
