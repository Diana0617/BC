import { apiClient } from './client';

// ================================
// BUSINESS RULE MANAGEMENT API
// ================================

/**
 * Obtener plantillas disponibles para el negocio
 */
export const getAvailableTemplates = async () => {
  return await apiClient.get('/business/rule-templates/available');
};

/**
 * Obtener plantillas disponibles por categoría
 */
export const getAvailableTemplatesByCategory = async (category) => {
  return await apiClient.get(`/business/rule-templates/available?category=${category}`);
};

/**
 * Asignar plantilla de regla al negocio
 */
export const assignRuleTemplate = async (templateId, options = {}) => {
  return await apiClient.post(`/business/rule-templates/${templateId}/assign`, options);
};

/**
 * Obtener reglas asignadas al negocio
 */
export const getBusinessAssignedRules = async (includeInactive = false) => {
  return await apiClient.get(`/business/rule-assignments?includeInactive=${includeInactive}`);
};

/**
 * Obtener reglas asignadas por categoría
 */
export const getBusinessAssignedRulesByCategory = async (category) => {
  return await apiClient.get(`/business/rule-assignments?category=${category}`);
};

/**
 * Obtener detalles de una regla asignada específica
 */
export const getAssignedRuleDetails = async (assignmentId) => {
  return await apiClient.get(`/business/rule-assignments/${assignmentId}`);
};

/**
 * Personalizar regla asignada
 */
export const customizeAssignedRule = async (assignmentId, { customValue, notes }) => {
  return await apiClient.put(`/business/rule-assignments/${assignmentId}/customize`, {
    customValue,
    notes
  });
};

/**
 * Activar/desactivar regla asignada
 */
export const toggleRuleAssignment = async (assignmentId, { isActive }) => {
  return await apiClient.patch(`/business/rule-assignments/${assignmentId}/toggle`, {
    isActive
  });
};

/**
 * Remover regla asignada
 */
export const removeRuleAssignment = async (assignmentId) => {
  return await apiClient.delete(`/business/rule-assignments/${assignmentId}`);
};

/**
 * Revertir personalización de regla (volver a la plantilla original)
 */
export const revertRuleCustomization = async (assignmentId) => {
  return await apiClient.patch(`/business/rule-assignments/${assignmentId}/revert`);
};

/**
 * Actualizar prioridad de regla
 */
export const updateRulePriority = async (assignmentId, priority) => {
  return await apiClient.patch(`/business/rule-assignments/${assignmentId}/priority`, {
    priority
  });
};

/**
 * Actualizar fechas efectivas de regla
 */
export const updateRuleEffectiveDates = async (assignmentId, { effectiveFrom, effectiveTo }) => {
  return await apiClient.patch(`/business/rule-assignments/${assignmentId}/dates`, {
    effectiveFrom,
    effectiveTo
  });
};

/**
 * Obtener conflictos de reglas del negocio
 */
export const getBusinessRuleConflicts = async () => {
  return await apiClient.get('/business/rule-assignments/conflicts');
};

/**
 * Resolver conflicto de reglas
 */
export const resolveRuleConflict = async (conflictId, resolution) => {
  return await apiClient.post(`/business/rule-assignments/conflicts/${conflictId}/resolve`, {
    resolution
  });
};

/**
 * Verificar compatibilidad antes de asignar regla
 */
export const checkRuleCompatibility = async (templateId) => {
  return await apiClient.post(`/business/rule-templates/${templateId}/check-compatibility`);
};

/**
 * Previsualizar regla antes de asignar
 */
export const previewRuleForBusiness = async (templateId, customValue = null) => {
  return await apiClient.post(`/business/rule-templates/${templateId}/preview`, {
    customValue
  });
};

/**
 * Obtener historial de cambios de reglas del negocio
 */
export const getBusinessRuleHistory = async (assignmentId = null) => {
  const url = assignmentId 
    ? `/business/rule-assignments/${assignmentId}/history`
    : '/business/rule-assignments/history';
  return await apiClient.get(url);
};

/**
 * Crear copia de seguridad de reglas del negocio
 */
export const backupBusinessRules = async () => {
  return await apiClient.post('/business/rule-assignments/backup');
};

/**
 * Restaurar reglas desde copia de seguridad
 */
export const restoreBusinessRules = async (backupId) => {
  return await apiClient.post(`/business/rule-assignments/restore/${backupId}`);
};

/**
 * Obtener estadísticas de uso de reglas del negocio
 */
export const getBusinessRuleStats = async () => {
  return await apiClient.get('/business/rule-assignments/stats');
};

/**
 * Validar configuración actual de reglas
 */
export const validateCurrentRuleConfiguration = async () => {
  return await apiClient.post('/business/rule-assignments/validate');
};

/**
 * Obtener recomendaciones de reglas para el negocio
 */
export const getRuleRecommendations = async () => {
  return await apiClient.get('/business/rule-templates/recommendations');
};

/**
 * Sincronizar reglas con plantillas actualizadas (para el negocio específico)
 */
export const syncBusinessRulesWithTemplates = async () => {
  return await apiClient.post('/business/rule-assignments/sync');
};

/**
 * Obtener actualizaciones pendientes de plantillas
 */
export const getPendingTemplateUpdates = async () => {
  return await apiClient.get('/business/rule-assignments/pending-updates');
};

/**
 * Aplicar actualizaciones pendientes de plantillas
 */
export const applyPendingUpdates = async (assignmentIds = []) => {
  return await apiClient.patch('/business/rule-assignments/apply-updates', {
    assignmentIds
  });
};

/**
 * Exportar configuración de reglas del negocio
 */
export const exportBusinessRuleConfiguration = async (format = 'json') => {
  return await apiClient.post('/business/rule-assignments/export', { format });
};

/**
 * Importar configuración de reglas al negocio
 */
export const importBusinessRuleConfiguration = async (configurationData) => {
  return await apiClient.post('/business/rule-assignments/import', {
    configuration: configurationData
  });
};

// ================================
// BUSINESS RULE API OBJECT
// ================================

export const businessRuleApi = {
  // Template discovery
  getAvailableTemplates,
  getAvailableTemplatesByCategory,
  getRuleRecommendations,
  
  // Rule assignment
  assignRuleTemplate,
  removeRuleAssignment,
  checkRuleCompatibility,
  previewRuleForBusiness,
  
  // Rule management
  getBusinessAssignedRules,
  getBusinessAssignedRulesByCategory,
  getAssignedRuleDetails,
  
  // Customization
  customizeAssignedRule,
  revertRuleCustomization,
  toggleRuleAssignment,
  updateRulePriority,
  updateRuleEffectiveDates,
  
  // Conflict resolution
  getBusinessRuleConflicts,
  resolveRuleConflict,
  validateCurrentRuleConfiguration,
  
  // History and analytics
  getBusinessRuleHistory,
  getBusinessRuleStats,
  
  // Backup and restore
  backupBusinessRules,
  restoreBusinessRules,
  
  // Template synchronization
  syncBusinessRulesWithTemplates,
  getPendingTemplateUpdates,
  applyPendingUpdates,
  
  // Import/Export
  exportBusinessRuleConfiguration,
  importBusinessRuleConfiguration
};

export default businessRuleApi;