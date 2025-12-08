import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

/**
 * Thunks para gestión de asignación de usuarios a sucursales (multi-branch)
 */

// Obtener sucursales asignadas a un usuario
export const getUserBranches = createAsyncThunk(
  'userBranch/getUserBranches',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/branches`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener sucursales del usuario' });
    }
  }
);

// Asignar una sucursal a un usuario
export const assignBranchToUser = createAsyncThunk(
  'userBranch/assignBranchToUser',
  async ({ userId, branchData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/branches`, branchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al asignar sucursal' });
    }
  }
);

// Actualizar configuración de sucursal del usuario
export const updateUserBranch = createAsyncThunk(
  'userBranch/updateUserBranch',
  async ({ userId, branchId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/branches/${branchId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar sucursal' });
    }
  }
);

// Establecer sucursal por defecto
export const setDefaultBranch = createAsyncThunk(
  'userBranch/setDefaultBranch',
  async ({ userId, branchId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/branches/${branchId}/set-default`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al establecer sucursal por defecto' });
    }
  }
);

// Remover sucursal de un usuario
export const removeBranchFromUser = createAsyncThunk(
  'userBranch/removeBranchFromUser',
  async ({ userId, branchId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}/branches/${branchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al remover sucursal' });
    }
  }
);

// Obtener usuarios asignados a una sucursal
export const getBranchUsers = createAsyncThunk(
  'userBranch/getBranchUsers',
  async ({ branchId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/branches/${branchId}/users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener usuarios de la sucursal' });
    }
  }
);

const initialState = {
  userBranches: [], // Sucursales del usuario actual
  branchUsers: [], // Usuarios de una sucursal específica
  defaultBranch: null,
  loading: false,
  error: null,
  success: false,
  message: null
};

const userBranchSlice = createSlice({
  name: 'userBranch',
  initialState,
  reducers: {
    clearUserBranchError: (state) => {
      state.error = null;
    },
    clearUserBranchSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetUserBranchState: (state) => {
      state.userBranches = [];
      state.branchUsers = [];
      state.defaultBranch = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Branches
      .addCase(getUserBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.userBranches = action.payload.data || [];
        // Encontrar la sucursal por defecto
        const defaultBranch = state.userBranches.find(b => b.isDefault);
        state.defaultBranch = defaultBranch || null;
        state.error = null;
      })
      .addCase(getUserBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener sucursales';
      })

      // Assign Branch to User
      .addCase(assignBranchToUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(assignBranchToUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Sucursal asignada exitosamente';
        if (action.payload.data) {
          state.userBranches.push(action.payload.data);
          if (action.payload.data.isDefault) {
            state.defaultBranch = action.payload.data;
          }
        }
      })
      .addCase(assignBranchToUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al asignar sucursal';
        state.success = false;
      })

      // Update User Branch
      .addCase(updateUserBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Sucursal actualizada exitosamente';
        if (action.payload.data) {
          const index = state.userBranches.findIndex(
            b => b.id === action.payload.data.id
          );
          if (index !== -1) {
            state.userBranches[index] = action.payload.data;
          }
        }
      })
      .addCase(updateUserBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al actualizar sucursal';
        state.success = false;
      })

      // Set Default Branch
      .addCase(setDefaultBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(setDefaultBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Sucursal por defecto establecida';
        // Actualizar las sucursales: quitar isDefault de todas y ponerlo en la nueva
        state.userBranches = state.userBranches.map(b => ({
          ...b,
          isDefault: b.branchId === action.meta.arg.branchId
        }));
        const newDefault = state.userBranches.find(b => b.branchId === action.meta.arg.branchId);
        state.defaultBranch = newDefault || null;
      })
      .addCase(setDefaultBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al establecer sucursal por defecto';
        state.success = false;
      })

      // Remove Branch from User
      .addCase(removeBranchFromUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeBranchFromUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Sucursal removida exitosamente';
        state.userBranches = state.userBranches.filter(
          b => b.branchId !== action.meta.arg.branchId
        );
        // Si era la sucursal por defecto, limpiar
        if (state.defaultBranch?.branchId === action.meta.arg.branchId) {
          state.defaultBranch = null;
        }
      })
      .addCase(removeBranchFromUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al remover sucursal';
        state.success = false;
      })

      // Get Branch Users
      .addCase(getBranchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.branchUsers = action.payload.data || [];
        state.error = null;
      })
      .addCase(getBranchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener usuarios de la sucursal';
      });
  }
});

export const {
  clearUserBranchError,
  clearUserBranchSuccess,
  resetUserBranchState
} = userBranchSlice.actions;

export default userBranchSlice.reducer;
