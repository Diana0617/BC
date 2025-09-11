import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';

// Create and configure the Redux store
export const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      }),
    devTools: process.env.NODE_ENV !== 'production'
  });
};

// Create default store instance
export const store = createStore();

// Export types for TypeScript (if needed later)
export const getStoreState = () => store.getState();
export const getStoreDispatch = () => store.dispatch;