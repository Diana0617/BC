/**
 * APIs para funcionalidades de OWNER
 * Exporta todas las APIs relacionadas con la gestión del Owner
 */

// OWNER main API
export { default as ownerApi } from './ownerApi';

// OWNER dashboard API
export { default as ownerDashboardApi } from './ownerDashboardApi';

// OWNER business management APIs
export { default as ownerBusinessesApi } from './ownerBusinessesApi';

// OWNER subscription management APIs
export { default as ownerSubscriptionsApi } from './ownerSubscriptionsApi';

// OWNER plans management API
export { default as ownerPlansApi } from './ownerPlansApi';

// OWNER modules management API
export { default as ownerModulesApi } from './ownerModulesApi';

// OWNER payments management API
export { default as ownerPaymentsApi } from './ownerPaymentsApi';

// OWNER financial reports API
export { default as ownerFinancialReportsApi } from './ownerFinancialReportsApi';

// OWNER expenses management API
export { ownerExpensesApi } from './ownerExpensesApi';

// OWNER trials management API
export { default as ownerTrialsApi } from './ownerTrialsApi';

// BUSINESS APIs - Para gestión interna del negocio
export { default as businessSpecialistsApi } from './businessSpecialistsApi';
export { default as businessServicesApi } from './businessServicesApi';

// 🔄 NEW SYSTEM APIS
export { autoRenewalApi } from './autoRenewalApi';
export { ownerBusinessManagementApi } from './ownerBusinessManagementApi';
export { publicInvitationApi } from './publicInvitationApi';
export { ownerPaymentConfigApi } from './ownerPaymentConfigApi';
export { subscriptionStatusApi } from './subscriptionStatusApi';

// 🔧 RULE TEMPLATE SYSTEM APIS
export { ruleTemplateApi } from './ruleTemplateApi';
export { businessRuleApi } from './businessRuleApi';

// 💳 ADVANCE PAYMENT SYSTEM APIS
export { default as advancePaymentApi } from './advancePaymentApi';

// 🔐 BUSINESS VALIDATION SYSTEM APIS
export { default as businessValidationApi } from './businessValidationApi';

// Export all OWNER APIs as a group
export const ownerApis = {
  ownerApi,
  ownerDashboardApi,
  ownerBusinessesApi,
  ownerSubscriptionsApi,
  ownerPlansApi,
  ownerModulesApi,
  ownerPaymentsApi,
  ownerFinancialReportsApi,
  ownerExpensesApi,
  ownerTrialsApi,
  // New APIs
  autoRenewalApi,
  ownerBusinessManagementApi,
  publicInvitationApi,
  ownerPaymentConfigApi,
  subscriptionStatusApi,
  // Rule Template APIs
  ruleTemplateApi,
  businessRuleApi
};

// Export all BUSINESS APIs as a group
export const businessApis = {
  businessSpecialistsApi,
  businessServicesApi,
  advancePaymentApi,
  businessValidationApi
};