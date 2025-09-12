import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Temporal async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
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
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
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

// Create React Native compatible store
export const createReactNativeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer
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