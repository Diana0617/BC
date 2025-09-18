import { apiClient } from './client.js';

// ================================
// OWNER RULE TEMPLATE API
// ================================

/**
 * Crear nueva plantilla de regla
 */
export const createRuleTemplate = async (templateData) => {
  return await apiClient.post('/api/rule-templates/owner/templates', templateData);
};

/**
 * Obtener plantillas del Owner
 */
export const getOwnerRuleTemplates = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.isActive !== undefined) params.append('active', filters.isActive);
  if (filters.businessType) params.append('businessType', filters.businessType);
  if (filters.search) params.append('search', filters.search);
  
  const query = params.toString();
  return await apiClient.get(`/api/rule-templates/owner/templates${query ? `?${query}` : ''}`);
};

/**
 * Obtener plantilla específica por ID
 */
export const getRuleTemplateById = async (templateId) => {
  return await apiClient.get(`/api/rule-templates/owner/templates/${templateId}`);
};

/**
 * Actualizar plantilla de regla
 */
export const updateRuleTemplate = async (templateId, updateData) => {
  return await apiClient.put(`/api/rule-templates/owner/templates/${templateId}`, updateData);
};

/**
 * Eliminar plantilla de regla
 */
export const deleteRuleTemplate = async (templateId) => {
  return await apiClient.delete(`/api/rule-templates/owner/templates/${templateId}`);
};

/**
 * Activar/desactivar plantilla - NO IMPLEMENTADO EN BACKEND
 */
// export const toggleRuleTemplate = async (templateId, isActive) => {
//   return await apiClient.patch(`/api/rule-templates/owner/templates/${templateId}/toggle`, { isActive });
// };

/**
 * Clonar plantilla de regla - NO IMPLEMENTADO EN BACKEND
 */
// export const cloneRuleTemplate = async (templateId, newName) => {
//   return await apiClient.post(`/api/rule-templates/owner/templates/${templateId}/clone`, { name: newName });
// };

/**
 * Obtener estadísticas de uso de plantillas - NO IMPLEMENTADO EN BACKEND
 */
// export const getRuleTemplateStats = async () => {
//   return await apiClient.get('/api/rule-templates/admin/rule-templates/stats');
// };

/**
 * Sincronizar reglas con plantillas actualizadas - NO IMPLEMENTADO EN BACKEND
 */
// export const syncRulesWithTemplates = async (businessId = null) => {
//   return await apiClient.post('/api/rule-templates/admin/rule-templates/sync', { businessId });
// };

/**
 * Obtener plantillas por categoría - USAR getOwnerRuleTemplates con filtro
 */
// export const getRuleTemplatesByCategory = async (category) => {
//   return await apiClient.get(`/api/rule-templates/owner/templates?category=${category}`);
// };

/**
 * Obtener historial de uso de una plantilla - NO IMPLEMENTADO EN BACKEND
 */
// export const getRuleTemplateUsageHistory = async (templateId) => {
//   return await apiClient.get(`/api/rule-templates/owner/templates/${templateId}/usage-history`);
// };

/**
 * Validar regla antes de crear plantilla - PENDIENTE DE IMPLEMENTAR
 */
// export const validateRule = async (ruleData) => {
//   return await apiClient.post('/api/rule-templates/owner/validate', ruleData);
// };

/**
 * Previsualizar regla con datos de ejemplo - PENDIENTE DE IMPLEMENTAR
 */
// export const previewRule = async (ruleData, businessContext = {}) => {
//   return await apiClient.post('/api/rule-templates/owner/preview', {
//     rule: ruleData,
//     context: businessContext
//   });
// };

/**
 * Exportar plantillas de regla - PENDIENTE DE IMPLEMENTAR
 */
// export const exportRuleTemplates = async (templateIds = [], format = 'json') => {
//   return await apiClient.post('/api/rule-templates/owner/export', {
//     templateIds,
//     format
//   });
// };

/**
 * Importar plantillas de regla - PENDIENTE DE IMPLEMENTAR
 */
// export const importRuleTemplates = async (templatesData) => {
//   return await apiClient.post('/api/rule-templates/owner/import', {
//     templates: templatesData
//   });
// };

/**
 * Obtener dependencias de una plantilla - PENDIENTE DE IMPLEMENTAR
 */
// export const getRuleTemplateDependencies = async (templateId) => {
//   return await apiClient.get(`/api/rule-templates/owner/rule-templates/${templateId}/dependencies`);
// };

/**
 * Obtener conflictos de una plantilla - PENDIENTE DE IMPLEMENTAR
 */
// export const getRuleTemplateConflicts = async (templateId) => {
//   return await apiClient.get(`/api/rule-templates/owner/rule-templates/${templateId}/conflicts`);
// };

/**
 * Verificar compatibilidad de plantilla con tipo de negocio - PENDIENTE DE IMPLEMENTAR
 */
// export const checkTemplateCompatibility = async (templateId, businessType, planType) => {
//   return await apiClient.post(`/api/rule-templates/owner/rule-templates/${templateId}/check-compatibility`, {
//     businessType,
//     planType
//   });
// };

// ================================
// RULE TEMPLATE API OBJECT
// ================================

export const ruleTemplateApi = {
  // CRUD operations - IMPLEMENTADOS EN BACKEND
  createRuleTemplate,
  getOwnerRuleTemplates,
  getRuleTemplateById,
  updateRuleTemplate,
  deleteRuleTemplate,
  
  // Funciones no implementadas en backend - comentadas
  // toggleRuleTemplate,
  // cloneRuleTemplate,
  // validateRule,
  // previewRule,
  // exportRuleTemplates,
  // importRuleTemplates,
  // getRuleTemplateStats,
  // syncRulesWithTemplates,
  // getRuleTemplateUsageHistory,
  // getRuleTemplatesByCategory,
  // getRuleTemplateDependencies,
  // getRuleTemplateConflicts,
  // checkTemplateCompatibility
};

export default ruleTemplateApi;