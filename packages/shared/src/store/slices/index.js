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

// 🔧 RULE TEMPLATE SYSTEM SLICES
export { default as ruleTemplateSlice } from './ruleTemplateSlice';
export { default as businessRuleSlice } from './businessRuleSlice';

// 💳 ADVANCE PAYMENT SYSTEM SLICES
export { default as advancePaymentSlice } from './advancePaymentSlice';

// 🔐 BUSINESS VALIDATION SYSTEM SLICES
export { default as businessValidationSlice } from './businessValidationSlice';

// � SUBSCRIPTION SYSTEM SLICES
export { default as subscriptionSlice } from './subscriptionSlice';

// �💳 ADVANCE PAYMENTS & BUSINESS VALIDATION SLICES
export { default as advancePaymentSlice } from './advancePaymentSlice';
export { default as businessValidationSlice } from './businessValidationSlice';
export { default as businessRuleSlice } from './businessRuleSlice';

// 🏨 PUBLIC BOOKING SYSTEM SLICES
export { default as publicBookingSlice } from './publicBookingSlice';

// 🏢 MULTI-BRANCH SYSTEM SLICES
export { default as userBranchSlice } from './userBranchSlice';

// 💰 SPECIALIST SERVICE PRICING SLICES
export { default as specialistServiceSlice } from './specialistServiceSlice';

// 📅 CALENDAR SYSTEM SLICES
export { default as scheduleSlice } from './scheduleSlice';
export { default as appointmentCalendarSlice } from './appointmentCalendarSlice';
export { default as timeSlotSlice } from './timeSlotSlice';

// 🎫 VOUCHER SYSTEM SLICES
export { default as voucherSlice } from './voucherSlice';

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

// 💳 ADVANCE PAYMENT EXPORTS
export {
  // Actions
  checkAdvancePaymentRequired,
  initiateAdvancePayment,
  checkAdvancePaymentStatus,
  getBusinessAdvancePaymentConfig,
  clearErrors as clearAdvancePaymentErrors,
  clearCurrentPayment,
  showPaymentModal,
  hidePaymentModal,
  setPaymentInProgress,
  updatePaymentFromWebhook,
  cachePaymentInfo,
  // Selectors
  selectAdvancePaymentState,
  selectAdvancePaymentLoading,
  selectAdvancePaymentErrors,
  selectCurrentPayment,
  selectBusinessConfig as selectAdvancePaymentBusinessConfig,
  selectPaymentsHistory,
  selectAdvancePaymentUI,
  selectPaymentForAppointment,
  selectIsPaymentRequired,
  selectIsPaymentPaid,
  selectCanProceedWithAppointment
} from './advancePaymentSlice';

// 🔐 BUSINESS VALIDATION EXPORTS
export {
  // Actions
  validateBusinessAccess,
  getAccessibleBusinesses,
  switchActiveBusiness,
  checkBusinessPermission,
  clearErrors as clearBusinessValidationErrors,
  clearValidationCache,
  clearActiveBusiness,
  showBusinessSelector,
  hideBusinessSelector,
  selectBusinessForSwitch,
  updateMultitenancyConfig,
  cacheValidationResult,
  getCachedValidation,
  invalidateBusinessCache,
  // Selectors
  selectBusinessValidationState,
  selectBusinessValidationLoading,
  selectBusinessValidationErrors,
  selectActiveBusiness,
  selectAccessibleBusinesses,
  selectValidationCache,
  selectMultitenancyConfig,
  selectBusinessValidationUI,
  selectHasBusinessAccess,
  selectIsBusinessOwner,
  selectActiveBusinessId,
  selectHasBusinessPermission,
  selectCanAccessMultipleBusinesses,
  selectCachedValidation,
  selectNeedsBusinessSwitch
} from './businessValidationSlice';

// 🎫 VOUCHER SYSTEM EXPORTS
export {
  // Thunks - Cliente
  fetchMyVouchers,
  validateVoucherCode,
  applyVoucherToBooking,
  checkCustomerBlockStatus,
  fetchCancellationHistory,
  // Thunks - Negocio
  fetchBusinessVouchers,
  cancelBusinessVoucher,
  createManualVoucher,
  fetchBlockedCustomers,
  liftCustomerBlock,
  fetchCustomerStats,
  // Actions
  clearValidation,
  clearApplyState,
  clearOperationMessages,
  resetVoucherState
} from './voucherSlice';