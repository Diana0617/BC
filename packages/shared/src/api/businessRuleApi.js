import { apiClient } from './client.js';

// ================================
// BUSINESS RULE MANAGEMENT API
// ================================

/**
 * Obtener plantillas disponibles para el negocio
 */
export const getAvailableTemplates = async () => {
  return await apiClient.get('/api/rule-templates/business/templates/available');
};

/**
 * Obtener plantillas disponibles por categoría
 */
export const getAvailableTemplatesByCategory = async (category) => {
  return await apiClient.get(`/api/rule-templates/business/templates/available?category=${category}`);
};

/**
 * Obtener plantillas disponibles desde business-rules endpoint
 */
export const getAvailableRuleTemplates = async () => {
  return await apiClient.get('/api/business-rules/rule-templates');
};

/**
 * Obtener reglas asignadas al negocio
 */
export const getBusinessAssignedRules = async (includeInactive = false) => {
  return await apiClient.get(`/api/business-rules/business/rules?includeInactive=${includeInactive}`);
};

/**
 * Personalizar regla de negocio
 */
export const customizeBusinessRule = async (ruleKey, customValue) => {
  return await apiClient.put(`/api/business-rules/business/rules/${ruleKey}`, {
    value: customValue
  });
};

/**
 * Configurar reglas iniciales del negocio
 */
export const setupBusinessRules = async (rulesConfig) => {
  return await apiClient.post('/api/business-rules/business/rules/setup', rulesConfig);
};

/**
 * Personalizar regla asignada
 */
export const customizeAssignedRule = async (assignmentId, { customValue, notes }) => {
  return await apiClient.put(`/api/rule-templates/business/rule-assignments/${assignmentId}/customize`, {
    customValue,
    notes
  });
};

/**
 * Activar/desactivar regla asignada
 */
export const toggleRuleAssignment = async (assignmentId, { isActive }) => {
  return await apiClient.patch(`/api/rule-templates/business/rule-assignments/${assignmentId}/toggle`, {
    isActive
  });
};

/**
 * Remover regla asignada
 */
export const removeRuleAssignment = async (assignmentId) => {
  return await apiClient.delete(`/api/rule-templates/business/rule-assignments/${assignmentId}`);
};

/**
 * Revertir personalización de regla (volver a la plantilla original)
 */
export const revertRuleCustomization = async (assignmentId) => {
  return await apiClient.patch(`/api/business/rule-assignments/${assignmentId}/revert`);
};

/**
 * Actualizar prioridad de regla
 */
export const updateRulePriority = async (assignmentId, priority) => {
  return await apiClient.patch(`/api/business/rule-assignments/${assignmentId}/priority`, {
    priority
  });
};

/**
 * Actualizar fechas efectivas de regla
 */
export const updateRuleEffectiveDates = async (assignmentId, { effectiveFrom, effectiveTo }) => {
  return await apiClient.patch(`/api/business/rule-assignments/${assignmentId}/dates`, {
    effectiveFrom,
    effectiveTo
  });
};

/**
 * Obtener conflictos de reglas del negocio
 */
export const getBusinessRuleConflicts = async () => {
  return await apiClient.get('/api/business/rule-assignments/conflicts');
};

/**
 * Resolver conflicto de reglas
 */
export const resolveRuleConflict = async (conflictId, resolution) => {
  return await apiClient.post(`/api/business/rule-assignments/conflicts/${conflictId}/resolve`, {
    resolution
  });
};

/**
 * Verificar compatibilidad antes de asignar regla
 */
export const checkRuleCompatibility = async (templateId) => {
  return await apiClient.post(`/api/business/rule-templates/${templateId}/check-compatibility`);
};

/**
 * Previsualizar regla antes de asignar
 */
export const previewRuleForBusiness = async (templateId, customValue = null) => {
  return await apiClient.post(`/api/business/rule-templates/${templateId}/preview`, {
    customValue
  });
};

/**
 * Obtener historial de cambios de reglas del negocio
 */
export const getBusinessRuleHistory = async (assignmentId = null) => {
  const url = assignmentId 
    ? `/api/business/rule-assignments/${assignmentId}/history`
    : '/api/business/rule-assignments/history';
  return await apiClient.get(url);
};

/**
 * Crear copia de seguridad de reglas del negocio
 */
export const backupBusinessRules = async () => {
  return await apiClient.post('/api/business/rule-assignments/backup');
};

/**
 * Restaurar reglas desde copia de seguridad
 */
export const restoreBusinessRules = async (backupId) => {
  return await apiClient.post(`/api/business/rule-assignments/restore/${backupId}`);
};

/**
 * Obtener estadísticas de uso de reglas del negocio
 */
export const getBusinessRuleStats = async () => {
  return await apiClient.get('/api/business/rule-assignments/stats');
};

/**
 * Validar configuración actual de reglas
 */
export const validateCurrentRuleConfiguration = async () => {
  return await apiClient.post('/api/business/rule-assignments/validate');
};

/**
 * Obtener recomendaciones de reglas para el negocio
 */
export const getRuleRecommendations = async () => {
  return await apiClient.get('/api/business/rule-templates/recommendations');
};

/**
 * Sincronizar reglas con plantillas actualizadas (para el negocio específico)
 */
export const syncBusinessRulesWithTemplates = async () => {
  return await apiClient.post('/api/business/rule-assignments/sync');
};

/**
 * Obtener actualizaciones pendientes de plantillas
 */
export const getPendingTemplateUpdates = async () => {
  return await apiClient.get('/api/business/rule-assignments/pending-updates');
};

/**
 * Aplicar actualizaciones pendientes de plantillas
 */
export const applyPendingUpdates = async (assignmentIds = []) => {
  return await apiClient.patch('/api/business/rule-assignments/apply-updates', {
    assignmentIds
  });
};

/**
 * Exportar configuración de reglas del negocio
 */
export const exportBusinessRuleConfiguration = async (format = 'json') => {
  return await apiClient.post('/api/business/rule-assignments/export', { format });
};

/**
 * Importar configuración de reglas al negocio
 */
export const importBusinessRuleConfiguration = async (configurationData) => {
  return await apiClient.post('/api/business/rule-assignments/import', {
    configuration: configurationData
  });
};

// ================================
// BUSINESS RULE API OBJECT - UPDATED
// ================================

export const businessRuleApi = {
  // IMPLEMENTADOS - Templates y reglas disponibles
  getAvailableTemplates,
  getAvailableTemplatesByCategory, 
  getAvailableRuleTemplates,
  
  // IMPLEMENTADOS - Gestión de reglas del negocio
  getBusinessAssignedRules,
  customizeBusinessRule,
  setupBusinessRules,
  
  // PENDIENTES DE IMPLEMENTAR - comentados
  // assignRuleTemplate,
  // removeRuleAssignment,
  // getAssignedRuleDetails,
  // customizeAssignedRule,
  // revertRuleCustomization,
  // toggleRuleAssignment,
  // updateRulePriority,
  // checkRuleCompatibility,
  // previewRuleForBusiness,
  // getRuleRecommendations,
  // getBusinessRuleConflicts,
  // resolveRuleConflict,
  // validateCurrentRuleConfiguration,
  // getBusinessRuleHistory,
  // getBusinessRuleStats,
  // backupBusinessRules,
  // restoreBusinessRules,
  // syncBusinessRulesWithTemplates,
  // getPendingTemplateUpdates,
  // applyPendingUpdates,
  // exportBusinessRuleConfiguration,
  // importBusinessRuleConfiguration
};

export default businessRuleApi;