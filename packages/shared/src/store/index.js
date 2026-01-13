import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import businessReducer from './slices/businessSlice';
import ownerStatsReducer from './slices/ownerStatsSlice';
import ownerBusinessesReducer from './slices/ownerBusinessesSlice';
import ownerSubscriptionsReducer from './slices/ownerSubscriptionsSlice';
import plansReducer from './slices/plansSlice';
import ownerPlansReducer from './slices/ownerPlansSlice';
import ownerModulesReducer from './slices/ownerModulesSlice';
// New OWNER Redux slices
import ownerDashboardReducer from './slices/ownerDashboardSlice';
import ownerBusinessReducer from './slices/ownerBusinessSlice';
import ownerSubscriptionReducer from './slices/ownerSubscriptionSlice';
import ownerPaymentsReducer from './slices/ownerPaymentsSlice';
import ownerFinancialReportsReducer from './slices/ownerFinancialReportsSlice';
import ownerExpensesReducer from './slices/ownerExpensesSlice';
// 🔄 NEW SYSTEM REDUCERS
import autoRenewalReducer from './slices/autoRenewalSlice';
import ownerBusinessManagementReducer from './slices/ownerBusinessManagementSlice';
import publicInvitationReducer from './slices/publicInvitationSlice';
import ownerPaymentConfigReducer from './slices/ownerPaymentConfigSlice';
// 🔧 RULE TEMPLATE SYSTEM REDUCERS
import ruleTemplateReducer from './slices/ruleTemplateSlice';
import businessRuleReducer from './slices/businessRuleSlice';
// 💳 ADVANCE PAYMENTS & BUSINESS VALIDATION REDUCERS
import advancePaymentReducer from './slices/advancePaymentSlice';
import businessValidationReducer from './slices/businessValidationSlice';
// 💰 SUBSCRIPTION SYSTEM REDUCERS
import subscriptionReducer from './slices/subscriptionSlice';
// 🏢 BUSINESS CONFIGURATION REDUCERS
import businessConfigurationReducer from './slices/businessConfigurationSlice';
// 🏨 PUBLIC BOOKING SYSTEM REDUCERS
import publicBookingReducer from './slices/publicBookingSlice';
// 🏢 MULTI-BRANCH SYSTEM REDUCERS
import userBranchReducer from './slices/userBranchSlice';
// 💰 SPECIALIST SERVICE PRICING REDUCERS
import specialistServiceReducer from './slices/specialistServiceSlice';
// 📅 CALENDAR SYSTEM REDUCERS
import scheduleReducer from './slices/scheduleSlice';
import appointmentCalendarReducer from './slices/appointmentCalendarSlice';
import timeSlotReducer from './slices/timeSlotSlice';
// 🎫 VOUCHER SYSTEM REDUCERS
import voucherReducer from './slices/voucherSlice';
// 🎁 LOYALTY/FIDELITY SYSTEM REDUCERS
import loyaltyReducer from './slices/loyaltySlice';
// 💰 COMMISSION & CONSENT SYSTEM REDUCERS (FM-26)
import commissionReducer from './slices/commissionSlice';
import consentReducer from './slices/consentSlice';
// 🔐 PERMISSIONS SYSTEM REDUCERS (FM-28)
import permissionsReducer from './slices/permissionsSlice';
// 💉 TREATMENT PLANS SYSTEM REDUCERS (FM-28)
import treatmentPlansReducer from './slices/treatmentPlansSlice';
// 💳 PAYMENT METHODS SYSTEM REDUCERS
import paymentMethodsReducer from './slices/paymentMethodsSlice';
// 💬 WHATSAPP BUSINESS PLATFORM REDUCERS
import whatsappTokenReducer from './slices/whatsappTokenSlice';
import whatsappTemplatesReducer from './slices/whatsappTemplatesSlice';
import whatsappMessagesReducer from './slices/whatsappMessagesSlice';
import whatsappWebhookEventsReducer from './slices/whatsappWebhookEventsSlice';
// 💳 BUSINESS WOMPI PAYMENT CONFIG REDUCERS
import businessWompiPaymentReducer from './slices/businessWompiPaymentSlice';
// 📦 PRODUCTS & INVENTORY SYSTEM REDUCERS
import productsReducer from './slices/productsSlice';
import salesReducer from './slices/salesSlice';
import procedureSupplyReducer from './slices/procedureSupplySlice';
// 💰 CASH REGISTER & RECEIPTS SYSTEM REDUCERS
import cashRegisterReducer from './slices/cashRegisterSlice';
import receiptReducer from './slices/receiptSlice';
// 📊 FINANCIAL MOVEMENTS & REPORTS REDUCERS
import financialMovementsReducer from './slices/financialMovementsSlice';
// 💸 BUSINESS EXPENSES & COMMISSIONS REDUCERS
import businessExpensesReducer from './slices/businessExpensesSlice';
import specialistCommissionsReducer from './slices/specialistCommissionsSlice';

// Create and configure the Redux store
export const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      business: businessReducer,
      ownerStats: ownerStatsReducer,
      ownerBusinesses: ownerBusinessesReducer,
      ownerSubscriptions: ownerSubscriptionsReducer,
      plans: plansReducer,
      ownerPlans: ownerPlansReducer,
      ownerModules: ownerModulesReducer,
      // New OWNER reducers
      ownerDashboard: ownerDashboardReducer,
      ownerBusiness: ownerBusinessReducer,
      ownerSubscription: ownerSubscriptionReducer,
      ownerPayments: ownerPaymentsReducer,
  ownerFinancialReports: ownerFinancialReportsReducer,
  ownerExpenses: ownerExpensesReducer,
      // 🔄 NEW SYSTEM REDUCERS
      autoRenewal: autoRenewalReducer,
      ownerBusinessManagement: ownerBusinessManagementReducer,
      publicInvitation: publicInvitationReducer,
      ownerPaymentConfig: ownerPaymentConfigReducer,
      // 🔧 RULE TEMPLATE SYSTEM REDUCERS
      ruleTemplate: ruleTemplateReducer,
      businessRule: businessRuleReducer,
      // 💳 ADVANCE PAYMENTS & BUSINESS VALIDATION REDUCERS
      advancePayment: advancePaymentReducer,
      businessValidation: businessValidationReducer,
      // 💰 SUBSCRIPTION SYSTEM REDUCERS
      subscription: subscriptionReducer,
      // 🏢 BUSINESS CONFIGURATION REDUCERS
      businessConfiguration: businessConfigurationReducer,
      // 🏨 PUBLIC BOOKING SYSTEM REDUCERS
      publicBooking: publicBookingReducer,
      // 🏢 MULTI-BRANCH SYSTEM REDUCERS
      userBranch: userBranchReducer,
      // 💰 SPECIALIST SERVICE PRICING REDUCERS
      specialistService: specialistServiceReducer,
      // 📅 CALENDAR SYSTEM REDUCERS
      schedule: scheduleReducer,
      appointmentCalendar: appointmentCalendarReducer,
      timeSlot: timeSlotReducer,
      // 🎫 VOUCHER SYSTEM REDUCERS
      voucher: voucherReducer,
      // 🎁 LOYALTY/FIDELITY SYSTEM REDUCERS
      loyalty: loyaltyReducer,
      // 💰 COMMISSION & CONSENT SYSTEM REDUCERS (FM-26)
      commission: commissionReducer,
      consent: consentReducer,
      // 🔐 PERMISSIONS SYSTEM REDUCERS (FM-28)
      permissions: permissionsReducer,
      // 💉 TREATMENT PLANS SYSTEM REDUCERS (FM-28)
      treatmentPlans: treatmentPlansReducer,
      // 💳 PAYMENT METHODS SYSTEM REDUCERS
      paymentMethods: paymentMethodsReducer,
      // 💬 WHATSAPP BUSINESS PLATFORM REDUCERS
      whatsappToken: whatsappTokenReducer,
      whatsappTemplates: whatsappTemplatesReducer,
      whatsappMessages: whatsappMessagesReducer,
      whatsappWebhookEvents: whatsappWebhookEventsReducer,
      // 💳 BUSINESS WOMPI PAYMENT CONFIG REDUCERS
      businessWompiPayment: businessWompiPaymentReducer,
      // 📦 PRODUCTS & INVENTORY SYSTEM REDUCERS
      products: productsReducer,
      sales: salesReducer,
      procedureSupply: procedureSupplyReducer,
      // 💰 CASH REGISTER & RECEIPTS SYSTEM REDUCERS
      cashRegister: cashRegisterReducer,
      receipt: receiptReducer,
      // 📊 FINANCIAL MOVEMENTS & REPORTS REDUCERS
      financialMovements: financialMovementsReducer,
      // 💸 BUSINESS EXPENSES & COMMISSIONS REDUCERS
      businessExpenses: businessExpensesReducer,
      specialistCommissions: specialistCommissionsReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      }),
    devTools: typeof window !== 'undefined' && window.__ENV__?.NODE_ENV !== 'production'
  });
};

// Create default store instance
export const store = createStore();

// Export types for TypeScript (if needed later)
export const getStoreState = () => store.getState();
export const getStoreDispatch = () => store.dispatch;

// Note: React Native specific store (reactNativeStore.js) is imported directly in mobile app
// and not exported here to avoid conflicts with web app imports