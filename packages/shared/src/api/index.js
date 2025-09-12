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

// Export all OWNER APIs as a group
export const ownerApis = {
  ownerApi,
  ownerDashboardApi,
  ownerBusinessesApi,
  ownerSubscriptionsApi,
  ownerPlansApi,
  ownerModulesApi,
  ownerPaymentsApi,
  ownerFinancialReportsApi
};