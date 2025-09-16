/**
 * Hooks para funcionalidades de OWNER
 * Exporta todos los hooks relacionados con la gestión del Owner
 */

// OWNER main hooks
export { default as useOwner } from './useOwner';

// OWNER dashboard
export { default as useOwnerDashboard } from './useOwnerDashboard';

// OWNER business management
export { default as useOwnerBusinesses } from './useOwnerBusinesses';

// OWNER subscription management
export { default as useOwnerSubscriptions } from './useOwnerSubscriptions';
export { default as useOwnerSubscription } from './useOwnerSubscription';

// OWNER plans management
export { default as useOwnerPlans } from './useOwnerPlans';

// OWNER modules management
export { default as useOwnerModules } from './useOwnerModules';

// OWNER payments management
export { default as useOwnerPayments } from './useOwnerPayments';

// OWNER financial reports
export { default as useOwnerFinancialReports } from './useOwnerFinancialReports';

// PUBLIC hooks for landing page
export { default as usePublicPlans } from './usePublicPlans';

// Export all OWNER hooks as a group
export const ownerHooks = {
  useOwner,
  useOwnerDashboard,
  useOwnerBusinesses,
  useOwnerSubscriptions,
  useOwnerSubscription,
  useOwnerPlans,
  useOwnerModules,
  useOwnerPayments,
  useOwnerFinancialReports
};