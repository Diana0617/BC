/**
 * Hooks para funcionalidades de OWNER
 * Exporta todos los hooks relacionados con la gestión del Owner
 */

// Importaciones individuales para el objeto ownerHooks
import useOwnerHook from './useOwner';
import useOwnerDashboardHook from './useOwnerDashboard';
import useOwnerBusinessesHook from './useOwnerBusinesses';
import useOwnerSubscriptionsHook from './useOwnerSubscriptions';
import useOwnerSubscriptionHook from './useOwnerSubscription';
import useOwnerPlansHook from './useOwnerPlans';
import useRuleTemplatesHook from './useRuleTemplates';
import useOwnerModulesHook from './useOwnerModules';
import useOwnerPaymentsHook from './useOwnerPayments';
import useOwnerFinancialReportsHook from './useOwnerFinancialReports';

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

// OWNER rule templates management
export { default as useRuleTemplates } from './useRuleTemplates';

// OWNER modules management
export { default as useOwnerModules } from './useOwnerModules';

// OWNER payments management
export { default as useOwnerPayments } from './useOwnerPayments';

// OWNER expenses management
export { default as useOwnerExpenses } from './useOwnerExpenses';

// OWNER financial reports
export { default as useOwnerFinancialReports } from './useOwnerFinancialReports';

// PUBLIC hooks for landing page
export { default as usePublicPlans } from './usePublicPlans';

// Export all OWNER hooks as a group
export const ownerHooks = {
  useOwner: useOwnerHook,
  useOwnerDashboard: useOwnerDashboardHook,
  useOwnerBusinesses: useOwnerBusinessesHook,
  useOwnerSubscriptions: useOwnerSubscriptionsHook,
  useOwnerSubscription: useOwnerSubscriptionHook,
  useOwnerPlans: useOwnerPlansHook,
  useRuleTemplates: useRuleTemplatesHook,
  useOwnerModules: useOwnerModulesHook,
  useOwnerPayments: useOwnerPaymentsHook,
  useOwnerFinancialReports: useOwnerFinancialReportsHook
};