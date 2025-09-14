import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/auth.js';
import { STORAGE_KEYS } from '../../constants/api.js';
import { StorageHelper } from '../../utils/storage.js';

// Async thunks for auth actions
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      // Extract user and tokens from nested structure
      const { user, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;
      
      return {
        user,
        token: accessToken,
        refreshToken
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ credentials, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Extract user and token from the new response structure
      const { user, tokens } = response.data.data;
      const token = tokens.accessToken;
      const refreshToken = tokens.refreshToken;

      // Store token and user data
      if (typeof window !== 'undefined') {
        StorageHelper.setItem(STORAGE_KEYS.AUTH_TOKEN, token, rememberMe);
        StorageHelper.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user), rememberMe);
        
        // Store refresh token
        StorageHelper.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, rememberMe);
        
        if (rememberMe) {
          StorageHelper.setItem(STORAGE_KEYS.REMEMBER_EMAIL, credentials.email, true);
        }
      }

      return { token, user, refreshToken, expiresIn: tokens.expiresIn };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyResetToken = createAsyncThunk(
  'auth/verifyResetToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyResetToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkExistingSession = createAsyncThunk(
  'auth/checkExistingSession',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      
      const token = StorageHelper.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = StorageHelper.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userDataStr = StorageHelper.getItem(STORAGE_KEYS.USER_DATA);
      
      if (!token || !userDataStr) {
        return null;
      }
      
      const user = JSON.parse(userDataStr);
      return { token, refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to get initial state from storage
const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null, user: null };
  }

  const token = StorageHelper.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const refreshToken = StorageHelper.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const userDataStr = StorageHelper.getItem(STORAGE_KEYS.USER_DATA);
  
  let user = null;
  if (userDataStr) {
    try {
      user = JSON.parse(userDataStr);
    } catch (error) {
      console.warn('Failed to parse user data from storage');
    }
  }

  return { token, refreshToken, user };
};

const initialState = {
  // Auth state
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  user: null,
  
  // Loading states
  isLoading: false,
  isRegistering: false,
  isLoggingIn: false,
  isForgettingPassword: false,
  isVerifyingToken: false,
  isResettingPassword: false,
  isChangingPassword: false,
  
  // Error states
  error: null,
  registerError: null,
  loginError: null,
  forgotPasswordError: null,
  verifyTokenError: null,
  resetPasswordError: null,
  changePasswordError: null,
  
  // Success states
  registerSuccess: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  changePasswordSuccess: false,
  
  // Remember email
  rememberedEmail: typeof window !== 'undefined' ? 
    StorageHelper.getItem(STORAGE_KEYS.REMEMBER_EMAIL) : null,
  
  // Initialize from storage
  ...getInitialAuthState()
};

// Update initial authentication state
if (initialState.token && initialState.user) {
  initialState.isAuthenticated = true;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.registerError = null;
      state.loginError = null;
      state.forgotPasswordError = null;
      state.verifyTokenError = null;
      state.resetPasswordError = null;
      state.changePasswordError = null;
    },
    
    // Clear success flags
    clearSuccess: (state) => {
      state.registerSuccess = false;
      state.forgotPasswordSuccess = false;
      state.resetPasswordSuccess = false;
      state.changePasswordSuccess = false;
    },
    
    // Logout user
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;
      
      // Clear storage
      if (typeof window !== 'undefined') {
        StorageHelper.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        StorageHelper.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        StorageHelper.removeItem(STORAGE_KEYS.USER_DATA);
      }
    },
    
    // Update user data
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update storage
        if (typeof window !== 'undefined') {
          StorageHelper.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user), true);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isRegistering = true;
        state.registerError = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isRegistering = false;
        state.registerSuccess = true;
        // Note: We don't auto-login after registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.registerError = action.payload;
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoggingIn = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.loginError = action.payload;
      });

    // Get user profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If profile fetch fails, might mean token is invalid
        if (action.payload.includes('401') || action.payload.includes('unauthorized')) {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isForgettingPassword = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isForgettingPassword = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isForgettingPassword = false;
        state.forgotPasswordError = action.payload;
      });

    // Verify reset token
    builder
      .addCase(verifyResetToken.pending, (state) => {
        state.isVerifyingToken = true;
        state.verifyTokenError = null;
      })
      .addCase(verifyResetToken.fulfilled, (state) => {
        state.isVerifyingToken = false;
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.isVerifyingToken = false;
        state.verifyTokenError = action.payload;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isResettingPassword = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isResettingPassword = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isResettingPassword = false;
        state.resetPasswordError = action.payload;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isChangingPassword = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.changePasswordError = action.payload;
      });

    // Check existing session
    builder
      .addCase(checkExistingSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkExistingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.token = null;
          state.refreshToken = null;
          state.user = null;
        }
      })
      .addCase(checkExistingSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
      });
  }
});

export const { 
  clearErrors, 
  clearSuccess, 
  logout, 
  updateUserData 
} = authSlice.actions;

export default authSlice.reducer;