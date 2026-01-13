/**
 * APIs para funcionalidades de OWNER
 * Exporta todas las APIs relacionadas con la gestión del Owner
 */

// OWNER main API
export { ownerApi } from './ownerApi';
import { ownerApi } from './ownerApi';

// OWNER dashboard API
export { ownerDashboardApi } from './ownerDashboardApi';
import { ownerDashboardApi } from './ownerDashboardApi';

// OWNER business management APIs
export { ownerBusinessesApi } from './ownerBusinessesApi';
import { ownerBusinessesApi } from './ownerBusinessesApi';

// OWNER subscription management APIs
export { default as ownerSubscriptionsApi } from './ownerSubscriptionsApi';
import ownerSubscriptionsApi from './ownerSubscriptionsApi';

// OWNER plans management API
export { ownerPlansApi } from './ownerPlansApi';
import { ownerPlansApi } from './ownerPlansApi';

// OWNER modules management API
export { ownerModulesApi } from './ownerModulesApi';
import { ownerModulesApi } from './ownerModulesApi';

// OWNER payments management API
export { default as ownerPaymentsApi } from './ownerPaymentsApi';
import ownerPaymentsApi from './ownerPaymentsApi';

// OWNER financial reports API
export { default as ownerFinancialReportsApi } from './ownerFinancialReportsApi';
import ownerFinancialReportsApi from './ownerFinancialReportsApi';

// OWNER expenses management API
export { ownerExpensesApi } from './ownerExpensesApi';
import { ownerExpensesApi } from './ownerExpensesApi';

// OWNER trials management API
export { default as ownerTrialsApi } from './ownerTrialsApi';
import ownerTrialsApi from './ownerTrialsApi';

// BUSINESS APIs - Para gestión interna del negocio
export { default as businessSpecialistsApi } from './businessSpecialistsApi';
import businessSpecialistsApi from './businessSpecialistsApi';
export { default as businessServicesApi } from './businessServicesApi';
import businessServicesApi from './businessServicesApi';
export { default as businessBrandingApi } from './businessBrandingApi';
import businessBrandingApi from './businessBrandingApi';
export { default as businessBranchesApi } from './businessBranchesApi';
import businessBranchesApi from './businessBranchesApi';
export { default as specialistServicesApi } from './specialistServicesApi';
import specialistServicesApi from './specialistServicesApi';

// 🔄 NEW SYSTEM APIS
export { autoRenewalApi } from './autoRenewalApi';
import { autoRenewalApi } from './autoRenewalApi';
export { ownerBusinessManagementApi } from './ownerBusinessManagementApi';
import { ownerBusinessManagementApi } from './ownerBusinessManagementApi';
export { publicInvitationApi } from './publicInvitationApi';
import { publicInvitationApi } from './publicInvitationApi';
export { ownerPaymentConfigApi } from './ownerPaymentConfigApi';
import { ownerPaymentConfigApi } from './ownerPaymentConfigApi';
export { subscriptionStatusApi } from './subscriptionStatusApi';
import { subscriptionStatusApi } from './subscriptionStatusApi';

// 🔧 RULE TEMPLATE SYSTEM APIS
export { ruleTemplateApi } from './ruleTemplateApi';
import { ruleTemplateApi } from './ruleTemplateApi';
export { businessRuleApi } from './businessRuleApi';
import { businessRuleApi } from './businessRuleApi';

// 🏨 PUBLIC BOOKING SYSTEM APIS
export * from './publicBookingApi';

// 💳 ADVANCE PAYMENTS & BUSINESS VALIDATION APIS
export { default as advancePaymentApi } from './advancePaymentApi';
export { default as businessValidationApi } from './businessValidationApi';

// 🎫 VOUCHER SYSTEM API
export { default as voucherApi } from './voucherApi';
import voucherApi from './voucherApi';

// 🎁 LOYALTY/FIDELITY SYSTEM API
export { default as loyaltyApi } from './loyaltyApi';
import loyaltyApi from './loyaltyApi';

// 💰 COMMISSION & CONSENT SYSTEM APIS (FM-26)
export { default as commissionApi } from './commissionApi';
import commissionApi from './commissionApi';
export { default as consentApi } from './consentApi';
import consentApi from './consentApi';

// 📅 APPOINTMENT SYSTEM API (Calendar + Validations)
export { default as appointmentApi } from './appointmentApi';
import appointmentApi from './appointmentApi';

// 💉 TREATMENT PLANS SYSTEM API (FM-28)
export { default as treatmentPlansApi } from './treatmentPlansApi';
import treatmentPlansApi from './treatmentPlansApi';

// 💳 PAYMENT METHODS SYSTEM API
export { paymentMethodsApi } from './paymentMethodsApi';
import { paymentMethodsApi } from './paymentMethodsApi';

// 💬 WHATSAPP BUSINESS PLATFORM API
export { default as whatsappApi } from './whatsappApi';
import whatsappApi from './whatsappApi';

// 💳 BUSINESS WOMPI PAYMENT CONFIG API
export { default as businessWompiPaymentApi } from './businessWompiPaymentApi';
import businessWompiPaymentApi from './businessWompiPaymentApi';

// 📦 PRODUCTS & INVENTORY SYSTEM API
export { productsApi } from './productsApi';
import { productsApi } from './productsApi';

// 💰 SALES SYSTEM API
export { salesApi } from './salesApi';
import { salesApi } from './salesApi';

// 💉 PROCEDURE SUPPLY SYSTEM API
export { procedureSupplyApi } from './procedureSupplyApi';
import { procedureSupplyApi } from './procedureSupplyApi';

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
  businessRuleApi,
  // Voucher System API
  voucherApi,
  // Loyalty System API
  loyaltyApi
};

// Export all BUSINESS APIs as a group
export const businessApis = {
  businessSpecialistsApi,
  businessServicesApi,
  businessBrandingApi,
  businessBranchesApi,
  specialistServicesApi,
  // Appointment System API
  appointmentApi,
  // Commission & Consent APIs (FM-26)
  commissionApi,
  consentApi,
  // Treatment Plans System API (FM-28)
  treatmentPlansApi,
  // Payment Methods System API
  paymentMethodsApi,
  // WhatsApp Business Platform API
  whatsappApi,
  // Business Wompi Payment Config API
  businessWompiPaymentApi,
  // Products & Inventory System API
  productsApi,
  // Sales System API
  salesApi,
  // Procedure Supply System API
  procedureSupplyApi,
  // Loyalty System API
  loyaltyApi
};