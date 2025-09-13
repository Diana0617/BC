import { apiClient } from './client';

// ================================
// OWNER RULE TEMPLATE API
// ================================

/**
 * Crear nueva plantilla de regla
 */
export const createRuleTemplate = async (templateData) => {
  return await apiClient.post('/owner/rule-templates', templateData);
};

/**
 * Obtener plantillas del Owner
 */
export const getOwnerRuleTemplates = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
  if (filters.businessType) params.append('businessType', filters.businessType);
  if (filters.search) params.append('search', filters.search);
  
  const query = params.toString();
  return await apiClient.get(`/owner/rule-templates${query ? `?${query}` : ''}`);
};

/**
 * Obtener plantilla específica por ID
 */
export const getRuleTemplateById = async (templateId) => {
  return await apiClient.get(`/owner/rule-templates/${templateId}`);
};

/**
 * Actualizar plantilla de regla
 */
export const updateRuleTemplate = async (templateId, updateData) => {
  return await apiClient.put(`/owner/rule-templates/${templateId}`, updateData);
};

/**
 * Eliminar plantilla de regla
 */
export const deleteRuleTemplate = async (templateId) => {
  return await apiClient.delete(`/owner/rule-templates/${templateId}`);
};

/**
 * Activar/desactivar plantilla
 */
export const toggleRuleTemplate = async (templateId, isActive) => {
  return await apiClient.patch(`/owner/rule-templates/${templateId}/toggle`, { isActive });
};

/**
 * Clonar plantilla de regla
 */
export const cloneRuleTemplate = async (templateId, newName) => {
  return await apiClient.post(`/owner/rule-templates/${templateId}/clone`, { name: newName });
};

/**
 * Obtener estadísticas de uso de plantillas
 */
export const getRuleTemplateStats = async () => {
  return await apiClient.get('/admin/rule-templates/stats');
};

/**
 * Sincronizar reglas con plantillas actualizadas
 */
export const syncRulesWithTemplates = async (businessId = null) => {
  return await apiClient.post('/admin/rule-templates/sync', { businessId });
};

/**
 * Obtener plantillas por categoría
 */
export const getRuleTemplatesByCategory = async (category) => {
  return await apiClient.get(`/owner/rule-templates?category=${category}`);
};

/**
 * Obtener historial de uso de una plantilla
 */
export const getRuleTemplateUsageHistory = async (templateId) => {
  return await apiClient.get(`/owner/rule-templates/${templateId}/usage-history`);
};

/**
 * Validar regla antes de crear plantilla
 */
export const validateRule = async (ruleData) => {
  return await apiClient.post('/owner/rule-templates/validate', ruleData);
};

/**
 * Previsualizar regla con datos de ejemplo
 */
export const previewRule = async (ruleData, businessContext = {}) => {
  return await apiClient.post('/owner/rule-templates/preview', {
    rule: ruleData,
    context: businessContext
  });
};

/**
 * Exportar plantillas de regla
 */
export const exportRuleTemplates = async (templateIds = [], format = 'json') => {
  return await apiClient.post('/owner/rule-templates/export', {
    templateIds,
    format
  });
};

/**
 * Importar plantillas de regla
 */
export const importRuleTemplates = async (templatesData) => {
  return await apiClient.post('/owner/rule-templates/import', {
    templates: templatesData
  });
};

/**
 * Obtener dependencias de una plantilla
 */
export const getRuleTemplateDependencies = async (templateId) => {
  return await apiClient.get(`/owner/rule-templates/${templateId}/dependencies`);
};

/**
 * Obtener conflictos de una plantilla
 */
export const getRuleTemplateConflicts = async (templateId) => {
  return await apiClient.get(`/owner/rule-templates/${templateId}/conflicts`);
};

/**
 * Verificar compatibilidad de plantilla con tipo de negocio
 */
export const checkTemplateCompatibility = async (templateId, businessType, planType) => {
  return await apiClient.post(`/owner/rule-templates/${templateId}/check-compatibility`, {
    businessType,
    planType
  });
};

// ================================
// RULE TEMPLATE API OBJECT
// ================================

export const ruleTemplateApi = {
  // CRUD operations
  createRuleTemplate,
  getOwnerRuleTemplates,
  getRuleTemplateById,
  updateRuleTemplate,
  deleteRuleTemplate,
  toggleRuleTemplate,
  
  // Advanced operations
  cloneRuleTemplate,
  validateRule,
  previewRule,
  
  // Import/Export
  exportRuleTemplates,
  importRuleTemplates,
  
  // Analytics and admin
  getRuleTemplateStats,
  syncRulesWithTemplates,
  getRuleTemplateUsageHistory,
  
  // Queries and filtering
  getRuleTemplatesByCategory,
  getRuleTemplateDependencies,
  getRuleTemplateConflicts,
  checkTemplateCompatibility
};

export default ruleTemplateApi;