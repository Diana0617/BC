/**
 * Redux slices para funcionalidades de OWNER
 * Exporta todos los slices relacionados con la gestión del Owner
 */

// Existing slices
export { default as authSlice } from './authSlice';
export { default as userSlice } from './userSlice';
export { default as ownerStatsSlice } from './ownerStatsSlice';
export { default as ownerBusinessesSlice } from './ownerBusinessesSlice';
export { default as ownerSubscriptionsSlice } from './ownerSubscriptionsSlice';
export { default as plansSlice } from './plansSlice';
export { default as ownerPlansSlice } from './ownerPlansSlice';
export { default as ownerModulesSlice } from './ownerModulesSlice';

// New OWNER Redux slices
export { default as ownerDashboardSlice } from './ownerDashboardSlice';
export { default as ownerBusinessSlice } from './ownerBusinessSlice';
export { default as ownerSubscriptionSlice } from './ownerSubscriptionSlice';
export { default as ownerPaymentsSlice } from './ownerPaymentsSlice';
export { default as ownerFinancialReportsSlice } from './ownerFinancialReportsSlice';

// 🔄 NEW SYSTEM SLICES
export { default as autoRenewalSlice } from './autoRenewalSlice';
export { default as ownerBusinessManagementSlice } from './ownerBusinessManagementSlice';
export { default as publicInvitationSlice } from './publicInvitationSlice';
export { default as ownerPaymentConfigSlice } from './ownerPaymentConfigSlice';
export { default as ownerFinancialReportsSlice } from './ownerFinancialReportsSlice';

// 💳 ADVANCE PAYMENTS & BUSINESS VALIDATION SLICES
export { default as advancePaymentSlice } from './advancePaymentSlice';
export { default as businessValidationSlice } from './businessValidationSlice';
export { default as businessRuleSlice } from './businessRuleSlice';

// Export all OWNER slices as a group
export const ownerSlices = {
  ownerStatsSlice,
  ownerBusinessesSlice,
  ownerSubscriptionsSlice,
  ownerPlansSlice,
  ownerModulesSlice,
  ownerDashboardSlice,
  ownerBusinessSlice,
  ownerSubscriptionSlice,
  ownerPaymentsSlice,
  ownerFinancialReportsSlice
};