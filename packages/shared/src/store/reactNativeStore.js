import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Temporal async thunk for login (React Native specific)
export const loginUserRN = createAsyncThunk(
  'auth/loginUserRN',
  async ({ credentials, rememberMe }, { rejectWithValue }) => {
    try {
      // Use IP address instead of localhost for React Native
      const API_URL = 'http://192.168.0.213:3001';
      const response = await fetch(`${API_URL}/api/auth/login`, {
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
      return { token: data.data.tokens.accessToken, user: data.data.user };
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
      const API_URL = 'http://192.168.0.213:3001';
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/plans?${queryString}` : '/api/plans';
      
      const response = await fetch(`${API_URL}${url}`, {
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
      const API_URL = 'http://192.168.0.213:3001';
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/api/plans/${planId}?${queryString}` : `/api/plans/${planId}`;
      
      const response = await fetch(`${API_URL}${url}`, {
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
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUserRN.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
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
      publicPlans: publicPlansSlice.reducer
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
export const selectRememberedEmail = (state) => state.auth.rememberedEmail;

// Public Plans selectors
export const selectPublicPlans = (state) => state.publicPlans.plans;
export const selectCurrentPublicPlan = (state) => state.publicPlans.currentPlan;
export const selectPublicPlansLoading = (state) => state.publicPlans.isLoading;
export const selectPublicPlansError = (state) => state.publicPlans.error;