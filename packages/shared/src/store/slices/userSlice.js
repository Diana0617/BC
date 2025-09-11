import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../api/auth.js';

// Async thunks for user actions
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(userId, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Users list
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  
  // Selected user for viewing/editing
  selectedUser: null,
  
  // Loading states
  isLoading: false,
  isFetchingUsers: false,
  isFetchingUser: false,
  isUpdating: false,
  isDeleting: false,
  
  // Error states
  error: null,
  fetchUsersError: null,
  fetchUserError: null,
  updateError: null,
  deleteError: null,
  
  // Success states
  updateSuccess: false,
  deleteSuccess: false,
  
  // Filters and search
  filters: {
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.fetchUsersError = null;
      state.fetchUserError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    
    // Clear success flags
    clearSuccess: (state) => {
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    
    // Set selected user
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    
    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Add user to list (for real-time updates)
    addUser: (state, action) => {
      state.users.unshift(action.payload);
      state.totalUsers += 1;
    },
    
    // Update user in list
    updateUserInList: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    
    // Remove user from list
    removeUserFromList: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      state.totalUsers -= 1;
    }
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isFetchingUsers = true;
        state.fetchUsersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isFetchingUsers = false;
        state.users = action.payload.users || action.payload;
        state.totalUsers = action.payload.total || action.payload.length;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.pages || 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isFetchingUsers = false;
        state.fetchUsersError = action.payload;
      });

    // Fetch single user
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isFetchingUser = true;
        state.fetchUserError = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isFetchingUser = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isFetchingUser = false;
        state.fetchUserError = action.payload;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        
        // Update selected user if it's the same
        if (state.selectedUser && state.selectedUser.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        
        // Update user in list
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.deleteSuccess = true;
        
        // Remove from list
        state.users = state.users.filter(user => user.id !== action.payload);
        state.totalUsers -= 1;
        
        // Clear selected user if it was deleted
        if (state.selectedUser && state.selectedUser.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
      });
  }
});

export const {
  clearErrors,
  clearSuccess,
  setSelectedUser,
  clearSelectedUser,
  updateFilters,
  resetFilters,
  addUser,
  updateUserInList,
  removeUserFromList
} = userSlice.actions;

export default userSlice.reducer;