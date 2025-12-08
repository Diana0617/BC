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

// 🎟️ SUBSCRIPTION SYSTEM SLICES
export { default as subscriptionSlice } from './subscriptionSlice';

// 🏨 PUBLIC BOOKING SYSTEM SLICES
export { default as publicBookingSlice } from './publicBookingSlice';

// 🏢 MULTI-BRANCH SYSTEM SLICES
export { default as userBranchSlice } from './userBranchSlice';

// 💰 SPECIALIST SERVICE PRICING SLICES
export { default as specialistServiceSlice } from './specialistServiceSlice';

// �‍⚕️ SPECIALIST DASHBOARD SLICES
export { default as specialistDashboardSlice } from './specialistDashboardSlice';

// �📅 CALENDAR SYSTEM SLICES
export { default as scheduleSlice } from './scheduleSlice';
export { default as appointmentCalendarSlice } from './appointmentCalendarSlice';
export { default as timeSlotSlice } from './timeSlotSlice';

// 🎫 VOUCHER SYSTEM SLICES
export { default as voucherSlice } from './voucherSlice';

// 💰 COMMISSION & CONSENT SYSTEM SLICES (FM-26)
export { default as commissionSlice } from './commissionSlice';
export { default as consentSlice } from './consentSlice';

// 🔐 PERMISSIONS SYSTEM SLICES (FM-28)
export { default as permissionsSlice } from './permissionsSlice';

// 💉 TREATMENT PLANS SYSTEM SLICES (FM-28)
export { default as treatmentPlansSlice } from './treatmentPlansSlice';

// 💳 PAYMENT METHODS SYSTEM SLICES
export { default as paymentMethodsSlice } from './paymentMethodsSlice';

// � WHATSAPP BUSINESS PLATFORM SLICES
export { default as whatsappTokenSlice } from './whatsappTokenSlice';
export { default as whatsappTemplatesSlice } from './whatsappTemplatesSlice';
export { default as whatsappMessagesSlice } from './whatsappMessagesSlice';
export { default as whatsappWebhookEventsSlice } from './whatsappWebhookEventsSlice';

// �💳 ADVANCE PAYMENT EXPORTS
export {
  // Thunks
  checkAdvancePaymentRequired,
  initiateAdvancePayment,
  confirmAdvancePayment,
  checkAdvancePaymentStatus,
  // Selectors - Basic
  selectPaymentRequired,
  selectPaymentRequiredLoaded,
  selectRequirementDetails,
  selectCurrentPayment,
  selectPaymentUrl,
  selectTransactionId,
  selectPaymentStatus,
  selectPaymentConfirmed,
  selectWompiData,
  selectPublicKey,
  selectCanProceedWithAppointment,
  selectPaymentStep,
  selectPaymentDetails,
  // Selectors - Loading
  selectCheckRequiredLoading,
  selectInitiateLoading,
  selectConfirmLoading,
  selectStatusLoading,
  // Selectors - Error
  selectCheckRequiredError,
  selectInitiateError,
  selectConfirmError,
  selectStatusError,
  // Selectors - Success
  selectInitiateSuccess,
  selectConfirmSuccess,
  // Selectors - Modal
  selectModals,
  selectPaymentRequiredModalOpen,
  selectPaymentProcessModalOpen,
  selectPaymentConfirmationModalOpen,
  // Selectors - Computed
  selectIsPaymentInProgress,
  selectIsPaymentComplete,
  selectHasPaymentError,
  selectPaymentSummary
} from './advancePaymentSlice';

// 🔐 BUSINESS VALIDATION EXPORTS
export {
  // Thunks
  validateBusinessAccess,
  getAvailableBusinesses,
  switchActiveBusiness,
  checkModulePermissions,
  // Selectors - Basic
  selectActiveBusiness,
  selectActiveBusinessId,
  selectAvailableBusinesses,
  selectAvailableBusinessesLoaded,
  selectHasBusinessAccess,
  selectAccessValidated,
  selectAccessDetails,
  selectModulePermissions,
  selectPermissionsLoaded,
  selectSwitchingBusiness,
  selectUserRole,
  selectUserBusinessId,
  selectUserPermissions,
  // Selectors - Loading
  selectValidateAccessLoading,
  selectAvailableBusinessesLoading,
  selectSwitchBusinessLoading,
  selectModulePermissionsLoading,
  // Selectors - Error
  selectValidateAccessError,
  selectAvailableBusinessesError,
  selectSwitchBusinessError,
  selectModulePermissionsError,
  // Selectors - Success
  selectValidateAccessSuccess,
  selectSwitchBusinessSuccess,
  // Selectors - Modal
  selectModals as selectBusinessValidationModals,
  selectBusinessSelectorModalOpen,
  selectAccessDeniedModalOpen,
  selectPermissionsRequiredModalOpen,
  // Selectors - Computed
  selectHasBusinessPermission,
  selectCanAccessModule,
  selectBusinessOptions,
  selectValidationCacheStatus
} from './businessValidationSlice';

// 🔐 PERMISSIONS SYSTEM EXPORTS (FM-28)
export {
  // Thunks
  fetchAllPermissions,
  fetchRoleDefaults,
  fetchUserPermissions,
  fetchTeamMembersWithPermissions,
  grantUserPermission,
  revokeUserPermission,
  grantUserPermissionsBulk,
  revokeUserPermissionsBulk,
  resetToDefaults,
  // Actions
  clearErrors as clearPermissionsErrors,
  clearSuccess as clearPermissionsSuccess,
  setCurrentEditingUser,
  clearCurrentEditingUser,
  openModal as openPermissionsModal,
  closeModal as closePermissionsModal,
  updateFilters as updatePermissionsFilters,
  resetFilters as resetPermissionsFilters,
  updatePermissionLocally
} from './permissionsSlice';

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

// 💉 TREATMENT PLANS SYSTEM EXPORTS (FM-28)
export {
  // Thunks - Plans
  createTreatmentPlan,
  fetchTreatmentPlan,
  fetchTreatmentPlans,
  fetchClientTreatmentPlans,
  updateTreatmentPlan,
  cancelTreatmentPlan,
  addPlanPayment,
  // Thunks - Sessions
  fetchSession,
  scheduleSession,
  completeSession,
  cancelSession,
  rescheduleSession,
  markSessionNoShow,
  addSessionPhoto,
  deleteSessionPhoto,
  registerSessionPayment,
  // Actions
  clearErrors as clearTreatmentPlansErrors,
  clearSuccess as clearTreatmentPlansSuccess,
  clearError as clearTreatmentPlanError,
  clearSuccessFlag as clearTreatmentPlanSuccessFlag,
  clearCurrentPlan,
  clearCurrentSession,
  clearAllTreatmentPlans,
  updateSessionInCache,
  // Selectors - Basic
  selectAllPlans,
  selectCurrentPlan,
  selectClientPlans,
  selectCurrentSession,
  selectSessions,
  selectPagination,
  // Selectors - Loading
  selectLoading as selectTreatmentPlansLoading,
  selectIsLoading as selectIsTreatmentPlanLoading,
  // Selectors - Error
  selectErrors as selectTreatmentPlansErrors,
  selectError as selectTreatmentPlanError,
  // Selectors - Success
  selectSuccess as selectTreatmentPlansSuccess,
  selectSuccessFlag as selectTreatmentPlanSuccessFlag,
  // Selectors - By ID
  selectPlanById,
  selectSessionById,
  // Selectors - Filtered
  selectActivePlans,
  selectCompletedPlans,
  selectCurrentPlanSessions,
  selectCurrentPlanPendingSessions,
  selectCurrentPlanCompletedSessions
} from './treatmentPlansSlice';

// 💳 PAYMENT METHODS EXPORTS
export {
  // Thunks
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
  // Actions
  clearErrors as clearPaymentMethodsErrors,
  clearPaymentMethods,
  // Selectors
  selectPaymentMethods,
  selectActivePaymentMethods,
  selectPaymentMethodsLoading,
  selectPaymentMethodsError,
  selectPaymentMethodsCreating,
  selectPaymentMethodsUpdating,
  selectPaymentMethodsDeleting
} from './paymentMethodsSlice';

// 💰 CASH REGISTER SYSTEM EXPORTS
export { default as cashRegisterSlice } from './cashRegisterSlice';
export {
  // Thunks
  checkShouldUseCashRegister,
  getActiveShift,
  openShift,
  getShiftSummary,
  generateClosingPDF,
  closeShift,
  getShiftsHistory,
  getLastClosedShift,
  // Actions
  clearError as clearCashRegisterError,
  clearActiveShift,
  clearHistory as clearShiftsHistory,
  resetCashRegister,
  // Selectors
  selectShouldUseCashRegister,
  selectActiveShift,
  selectShiftSummary,
  selectLastClosedShift,
  selectShiftsHistory,
  selectHistoryPagination,
  selectCashRegisterLoading,
  selectCashRegisterError
} from './cashRegisterSlice';

// 📄 RECEIPT SYSTEM EXPORTS
export { default as receiptSlice } from './receiptSlice';
export {
  // Thunks
  generateReceiptPDF,
  getReceiptData,
  markReceiptSent,
  // Actions
  clearGeneratedPDF,
  clearCurrentReceiptData,
  clearError as clearReceiptError,
  addReceipt,
  resetReceipts,
  // Selectors
  selectGeneratedPDF,
  selectGeneratedPDFFilename,
  selectCurrentReceiptData,
  selectReceiptByAppointmentId,
  selectAllReceipts,
  selectReceiptLoading,
  selectReceiptError,
  selectReceiptSentStatus
} from './receiptSlice';

