import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StorageHelper } from '../utils/storage.js';
import { STORAGE_KEYS, API_CONFIG } from '../constants/api.js';
// Import shared slices needed for React Native
import businessRuleReducer from './slices/businessRuleSlice.js';
import businessConfigurationReducer from './slices/businessConfigurationSlice.js';
import businessReducer from './slices/businessSlice.js';
// Import calendar system slices
import scheduleReducer from './slices/scheduleSlice.js';
import appointmentCalendarReducer from './slices/appointmentCalendarSlice.js';
import timeSlotReducer from './slices/timeSlotSlice.js';

// Temporal async thunk for login (React Native specific)
export const loginUserRN = createAsyncThunk(
  'auth/loginUserRN',
  async ({ credentials, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login response data:', data); // Debug
      
  const user = data?.data?.user;
  const tokens = data?.data?.tokens;
      const businessId = user?.businessId || user?.Business?.id || data?.data?.businessId;
      
      console.log('Extracted values:', { user: !!user, tokens: !!tokens, businessId }); // Debug
      
      // Persistir tokens y user en AsyncStorage para que el apiClient en RN los use
      try {
        if (tokens?.accessToken) {
          await StorageHelper.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
        }
        if (tokens?.refreshToken) {
          await StorageHelper.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        }
        if (user) {
          await StorageHelper.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        }
      } catch (storageError) {
        console.warn('Error saving auth data in RN AsyncStorage:', storageError);
      }

      return { 
        token: tokens?.accessToken, 
        refreshToken: tokens?.refreshToken,
        user: user,
        businessId: businessId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Public plans async thunks for React Native
export const fetchPublicPlans = createAsyncThunk(
  'publicPlans/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/plans?${queryString}` : '/api/plans';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicPlanById = createAsyncThunk(
  'publicPlans/fetchById',
  async ({ planId, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/plans/${planId}?${queryString}` : `/api/plans/${planId}`;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice for React Native
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    businessId: null,
    isLoading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.businessId = action.payload.businessId;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.businessId = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.businessId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserRN.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserRN.fulfilled, (state, action) => {
        console.log('loginUserRN.fulfilled payload:', action.payload); // Debug
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
        state.businessId = action.payload?.businessId || null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUserRN.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.businessId = null;
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Public Plans slice for React Native
const publicPlansSlice = createSlice({
  name: 'publicPlans',
  initialState: {
    plans: [],
    currentPlan: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearPublicPlansError: (state) => {
      state.error = null;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all public plans
      .addCase(fetchPublicPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchPublicPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public plan by id
      .addCase(fetchPublicPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPlan = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchPublicPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export public plans actions
export const { clearPublicPlansError, clearCurrentPlan } = publicPlansSlice.actions;

// Create React Native compatible store
export const createReactNativeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      publicPlans: publicPlansSlice.reducer,
      businessRule: businessRuleReducer,
      businessConfiguration: businessConfigurationReducer,
      business: businessReducer,
      // Calendar system reducers
      schedule: scheduleReducer,
      appointmentCalendar: appointmentCalendarReducer,
      timeSlot: timeSlotReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      }),
    devTools: process.env.NODE_ENV !== 'production'
  });
};

export const store = createReactNativeStore();

// Selectors
export const selectIsLoggingIn = (state) => state.auth.isLoading;
export const selectLoginError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectBusinessId = (state) => state.auth.businessId;
export const selectRememberedEmail = (state) => state.auth.rememberedEmail;

// Public Plans selectors
export const selectPublicPlans = (state) => state.publicPlans.plans;
export const selectCurrentPublicPlan = (state) => state.publicPlans.currentPlan;
export const selectPublicPlansLoading = (state) => state.publicPlans.isLoading;
export const selectPublicPlansError = (state) => state.publicPlans.error;