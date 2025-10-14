/**
 * @file consentSelectors.js
 * @description Selectores centralizados para el sistema de consentimientos (FM-26)
 * @exports Selectores para templates, signatures y PDF operations
 */

// Re-export all selectors from consentSlice
export {
  // Template Selectors
  selectConsentTemplates,
  selectTemplatesLoading,
  selectTemplatesError,
  selectSelectedTemplate,
  selectSelectedTemplateLoading,
  selectSelectedTemplateError,
  selectFilteredTemplates,
  selectTemplatesByCategory,
  
  // Signature Selectors
  selectCustomerSignatures,
  selectCustomerSignaturesLoading,
  selectCustomerSignaturesError,
  selectSelectedSignature,
  selectSelectedSignatureLoading,
  selectSelectedSignatureError,
  selectActiveSignaturesCount,
  
  // Signing Process Selectors
  selectSigningLoading,
  selectSigningError,
  selectLastSignedConsent,
  
  // PDF Selectors
  selectPdfLoading,
  selectPdfError,
  
  // Filter Selectors
  selectConsentFilters,
  
  // Utility Selectors
  selectConsentLastUpdated
} from '../slices/consentSlice';

/**
 * CONSENT CATEGORIES
 */
export const CONSENT_CATEGORIES = {
  MEDICAL: 'MEDICAL',
  COSMETIC: 'COSMETIC',
  PRIVACY: 'PRIVACY',
  MARKETING: 'MARKETING',
  TREATMENT: 'TREATMENT',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  OTHER: 'OTHER'
};

/**
 * CONSENT CATEGORY LABELS
 */
export const CONSENT_CATEGORY_LABELS = {
  MEDICAL: 'Médico',
  COSMETIC: 'Cosmético',
  PRIVACY: 'Privacidad',
  MARKETING: 'Marketing',
  TREATMENT: 'Tratamiento',
  PHOTOGRAPHY: 'Fotografía',
  OTHER: 'Otro'
};

/**
 * SIGNATURE STATUSES
 */
export const SIGNATURE_STATUSES = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED'
};

/**
 * Helper function para verificar si un consentimiento está vigente
 * @param {Object} signature - Firma de consentimiento
 * @returns {boolean} True si está activo y no expirado
 */
export const isConsentActive = (signature) => {
  if (!signature) return false;
  if (signature.status !== SIGNATURE_STATUSES.ACTIVE) return false;
  
  // Si tiene fecha de expiración, verificarla
  if (signature.expiresAt) {
    const now = new Date();
    const expiryDate = new Date(signature.expiresAt);
    return now <= expiryDate;
  }
  
  return true;
};

/**
 * Helper function para obtener consentimientos por servicio
 * @param {Array} signatures - Lista de firmas
 * @param {string} serviceId - ID del servicio
 * @returns {Array} Firmas filtradas por servicio
 */
export const getSignaturesByService = (signatures, serviceId) => {
  if (!signatures || !Array.isArray(signatures)) return [];
  return signatures.filter(sig => sig.serviceId === serviceId);
};

/**
 * Helper function para verificar si un cliente tiene consentimiento firmado para un servicio
 * @param {Array} signatures - Lista de firmas del cliente
 * @param {string} serviceId - ID del servicio
 * @returns {boolean} True si tiene consentimiento activo
 */
export const hasActiveConsentForService = (signatures, serviceId) => {
  const serviceSignatures = getSignaturesByService(signatures, serviceId);
  return serviceSignatures.some(isConsentActive);
};

/**
 * Helper function para obtener la firma más reciente de un servicio
 * @param {Array} signatures - Lista de firmas
 * @param {string} serviceId - ID del servicio
 * @returns {Object|null} Firma más reciente o null
 */
export const getMostRecentSignature = (signatures, serviceId) => {
  const serviceSignatures = getSignaturesByService(signatures, serviceId);
  if (serviceSignatures.length === 0) return null;
  
  return serviceSignatures.reduce((latest, current) => {
    const latestDate = new Date(latest.signedAt);
    const currentDate = new Date(current.signedAt);
    return currentDate > latestDate ? current : latest;
  });
};

/**
 * Helper function para reemplazar placeholders en contenido
 * @param {string} content - Contenido HTML con placeholders
 * @param {Object} data - Datos para reemplazar
 * @returns {string} Contenido con placeholders reemplazados
 */
export const replacePlaceholders = (content, data) => {
  if (!content || !data) return content;
  
  let processedContent = content;
  
  // Reemplazos estándar
  const replacements = {
    '{{negocio_nombre}}': data.businessName || '',
    '{{cliente_nombre}}': data.customerName || '',
    '{{servicio_nombre}}': data.serviceName || '',
    '{{fecha_firma}}': data.signDate || new Date().toLocaleDateString('es-CO'),
    '{{especialista_nombre}}': data.specialistName || '',
    '{{precio_servicio}}': data.servicePrice || ''
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return processedContent;
};

/**
 * Helper function para formatear fecha de firma
 * @param {string} signedAt - Fecha ISO
 * @returns {string} Fecha formateada
 */
export const formatSignDate = (signedAt) => {
  if (!signedAt) return '';
  
  const date = new Date(signedAt);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Helper function para validar campos editables
 * @param {Object} editableFields - Configuración de campos editables
 * @param {Object} values - Valores ingresados
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateEditableFields = (editableFields, values) => {
  const errors = {};
  let isValid = true;
  
  if (!editableFields || !Array.isArray(editableFields)) {
    return { isValid: true, errors: {} };
  }
  
  editableFields.forEach(field => {
    if (field.required && !values[field.key]) {
      errors[field.key] = `${field.label} es requerido`;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Helper function para generar nombre de archivo PDF
 * @param {Object} signature - Firma de consentimiento
 * @returns {string} Nombre de archivo sugerido
 */
export const generatePdfFilename = (signature) => {
  if (!signature) return 'consentimiento.pdf';
  
  const date = new Date(signature.signedAt);
  const dateStr = date.toISOString().split('T')[0];
  const customerName = signature.Customer?.name?.replace(/\s+/g, '_') || 'cliente';
  const templateCode = signature.ConsentTemplate?.code || 'consentimiento';
  
  return `${templateCode}_${customerName}_${dateStr}.pdf`;
};

/**
 * Helper function para obtener color de estado
 * @param {string} status - Estado de la firma
 * @returns {string} Color para UI
 */
export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: '#10b981', // green
    REVOKED: '#ef4444', // red
    EXPIRED: '#f59e0b'  // orange
  };
  
  return colors[status] || '#6b7280'; // gray por defecto
};

/**
 * Helper function para obtener label de estado
 * @param {string} status - Estado de la firma
 * @returns {string} Label localizado
 */
export const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: 'Activo',
    REVOKED: 'Revocado',
    EXPIRED: 'Expirado'
  };
  
  return labels[status] || 'Desconocido';
};
