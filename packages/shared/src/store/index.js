import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
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
// 🔄 NEW SYSTEM REDUCERS
import autoRenewalReducer from './slices/autoRenewalSlice';
import ownerBusinessManagementReducer from './slices/ownerBusinessManagementSlice';
import publicInvitationReducer from './slices/publicInvitationSlice';
import ownerPaymentConfigReducer from './slices/ownerPaymentConfigSlice';
// 🔧 RULE TEMPLATE SYSTEM REDUCERS
import ruleTemplateReducer from './slices/ruleTemplateSlice';
import businessRuleReducer from './slices/businessRuleSlice';

// Create and configure the Redux store
export const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
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
      // 🔄 NEW SYSTEM REDUCERS
      autoRenewal: autoRenewalReducer,
      ownerBusinessManagement: ownerBusinessManagementReducer,
      publicInvitation: publicInvitationReducer,
      ownerPaymentConfig: ownerPaymentConfigReducer,
      // 🔧 RULE TEMPLATE SYSTEM REDUCERS
      ruleTemplate: ruleTemplateReducer,
      businessRule: businessRuleReducer
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