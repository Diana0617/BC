import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllPermissions,
  getRoleDefaultPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
  grantBulkPermissions,
  revokeBulkPermissions,
  resetUserPermissions,
  groupPermissionsByCategory,
  calculatePermissionsSummary
} from '../../api/permissions.js';

// ================================
// ASYNC THUNKS
// ================================

/**
 * Obtener todos los permisos disponibles (catálogo)
 */
export const fetchAllPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async (category = null, { rejectWithValue }) => {
    try {
      const response = await getAllPermissions(category);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener permisos por defecto de un rol
 */
export const fetchRoleDefaults = createAsyncThunk(
  'permissions/fetchRoleDefaults',
  async (role, { rejectWithValue }) => {
    try {
      const response = await getRoleDefaultPermissions(role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener permisos de un usuario específico
 */
export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async ({ userId, businessId }, { rejectWithValue }) => {
    try {
      const response = await getUserPermissions(userId, businessId);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener miembros del equipo con resumen de permisos
 */
export const fetchTeamMembersWithPermissions = createAsyncThunk(
  'permissions/fetchTeamMembers',
  async (businessId, { rejectWithValue, dispatch }) => {
    try {
      // Obtener usuarios del negocio
      const usersResponse = await fetch(`/api/business/${businessId}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!usersResponse.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const usersData = await usersResponse.json();
      const users = usersData.data || usersData;

      // Para cada usuario, obtener sus permisos
      const membersWithPermissions = await Promise.all(
        users.map(async (user) => {
          try {
            const permsResponse = await getUserPermissions(user.id, businessId);
            const permissionsData = permsResponse.data;
            
            // Calcular resumen
            const summary = calculatePermissionsSummary(permissionsData.permissions || []);
            const customizations = permissionsData.customizations || {};
            
            return {
              ...user,
              permissionsSummary: {
                ...summary,
                customGranted: customizations.extraGranted?.length || 0,
                customRevoked: customizations.revoked?.length || 0
              }
            };
          } catch (error) {
            console.error(`Error fetching permissions for user ${user.id}:`, error);
            return {
              ...user,
              permissionsSummary: {
                total: 0,
                byCategory: {},
                customGranted: 0,
                customRevoked: 0
              }
            };
          }
        })
      );

      return membersWithPermissions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Conceder permiso a un usuario
 */
export const grantUserPermission = createAsyncThunk(
  'permissions/grantPermission',
  async (data, { rejectWithValue }) => {
    try {
      const response = await grantPermission(data);
      return { ...response.data, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Revocar permiso a un usuario
 */
export const revokeUserPermission = createAsyncThunk(
  'permissions/revokePermission',
  async (data, { rejectWithValue }) => {
    try {
      const response = await revokePermission(data);
      return { ...response.data, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Conceder múltiples permisos
 */
export const grantUserPermissionsBulk = createAsyncThunk(
  'permissions/grantBulk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await grantBulkPermissions(data);
      return { ...response.data, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Revocar múltiples permisos
 */
export const revokeUserPermissionsBulk = createAsyncThunk(
  'permissions/revokeBulk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await revokeBulkPermissions(data);
      return { ...response.data, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Resetear permisos a defaults
 */
export const resetToDefaults = createAsyncThunk(
  'permissions/resetToDefaults',
  async ({ userId, businessId }, { rejectWithValue }) => {
    try {
      const response = await resetUserPermissions(userId, businessId);
      return { ...response.data, userId, businessId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ================================
// INITIAL STATE
// ================================

const initialState = {
  // Catálogo de permisos
  allPermissions: [],
  allPermissionsGrouped: {},
  
  // Permisos por defecto de roles
  roleDefaults: {},
  
  // Miembros del equipo
  teamMembers: [],
  
  // Usuario siendo editado
  currentEditingUser: null,
  currentUserPermissions: null,
  
  // Filtros y búsqueda
  filters: {
    search: '',
    role: '',
    hasCustomizations: null
  },
  
  // Estados de carga
  loading: false,
  loadingPermissions: false,
  loadingUserPermissions: false,
  loadingTeamMembers: false,
  savingPermission: false,
  resetting: false,
  
  // Errores
  error: null,
  permissionsError: null,
  userPermissionsError: null,
  teamMembersError: null,
  saveError: null,
  resetError: null,
  
  // Éxito
  saveSuccess: false,
  resetSuccess: false,
  
  // UI State
  isModalOpen: false,
  modalMode: null, // 'edit' | 'view'
};

// ================================
// SLICE
// ================================

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Limpiar errores
    clearErrors: (state) => {
      state.error = null;
      state.permissionsError = null;
      state.userPermissionsError = null;
      state.teamMembersError = null;
      state.saveError = null;
      state.resetError = null;
    },
    
    // Limpiar banderas de éxito
    clearSuccess: (state) => {
      state.saveSuccess = false;
      state.resetSuccess = false;
    },
    
    // Establecer usuario en edición
    setCurrentEditingUser: (state, action) => {
      state.currentEditingUser = action.payload;
      state.isModalOpen = true;
      state.modalMode = 'edit';
    },
    
    // Limpiar usuario en edición
    clearCurrentEditingUser: (state) => {
      state.currentEditingUser = null;
      state.currentUserPermissions = null;
      state.isModalOpen = false;
      state.modalMode = null;
    },
    
    // Abrir/cerrar modal
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalMode = action.payload?.mode || 'view';
    },
    
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalMode = null;
    },
    
    // Actualizar filtros
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Resetear filtros
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Actualizar permiso localmente (optimistic update)
    updatePermissionLocally: (state, action) => {
      const { userId, permissionKey, isGranted } = action.payload;
      
      // Actualizar en currentUserPermissions si es el usuario actual
      if (state.currentUserPermissions && state.currentUserPermissions.user?.id === userId) {
        const permissionIndex = state.currentUserPermissions.permissions.findIndex(
          p => p.permission?.key === permissionKey
        );
        
        if (permissionIndex !== -1) {
          state.currentUserPermissions.permissions[permissionIndex].isGranted = isGranted;
        }
      }
      
      // Actualizar en teamMembers
      const memberIndex = state.teamMembers.findIndex(m => m.id === userId);
      if (memberIndex !== -1) {
        // Recalcular summary (simplificado)
        if (isGranted) {
          state.teamMembers[memberIndex].permissionsSummary.total += 1;
        } else {
          state.teamMembers[memberIndex].permissionsSummary.total -= 1;
        }
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch all permissions
    builder
      .addCase(fetchAllPermissions.pending, (state) => {
        state.loadingPermissions = true;
        state.permissionsError = null;
      })
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.loadingPermissions = false;
        state.allPermissions = action.payload;
        state.allPermissionsGrouped = groupPermissionsByCategory(action.payload);
      })
      .addCase(fetchAllPermissions.rejected, (state, action) => {
        state.loadingPermissions = false;
        state.permissionsError = action.payload;
      });

    // Fetch role defaults
    builder
      .addCase(fetchRoleDefaults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleDefaults.fulfilled, (state, action) => {
        state.loading = false;
        state.roleDefaults[action.payload.role] = action.payload.permissions;
      })
      .addCase(fetchRoleDefaults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user permissions
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loadingUserPermissions = true;
        state.userPermissionsError = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loadingUserPermissions = false;
        state.currentUserPermissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loadingUserPermissions = false;
        state.userPermissionsError = action.payload;
      });

    // Fetch team members with permissions
    builder
      .addCase(fetchTeamMembersWithPermissions.pending, (state) => {
        state.loadingTeamMembers = true;
        state.teamMembersError = null;
      })
      .addCase(fetchTeamMembersWithPermissions.fulfilled, (state, action) => {
        state.loadingTeamMembers = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembersWithPermissions.rejected, (state, action) => {
        state.loadingTeamMembers = false;
        state.teamMembersError = action.payload;
      });

    // Grant permission
    builder
      .addCase(grantUserPermission.pending, (state) => {
        state.savingPermission = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(grantUserPermission.fulfilled, (state, action) => {
        state.savingPermission = false;
        state.saveSuccess = true;
        
        // Actualizar localmente
        const { userId, permissionKey } = action.payload;
        
        if (state.currentUserPermissions && state.currentUserPermissions.user?.id === userId) {
          const permissionIndex = state.currentUserPermissions.permissions.findIndex(
            p => p.permission?.key === permissionKey
          );
          
          if (permissionIndex !== -1) {
            state.currentUserPermissions.permissions[permissionIndex].isGranted = true;
          }
        }
      })
      .addCase(grantUserPermission.rejected, (state, action) => {
        state.savingPermission = false;
        state.saveError = action.payload;
      });

    // Revoke permission
    builder
      .addCase(revokeUserPermission.pending, (state) => {
        state.savingPermission = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(revokeUserPermission.fulfilled, (state, action) => {
        state.savingPermission = false;
        state.saveSuccess = true;
        
        // Actualizar localmente
        const { userId, permissionKey } = action.payload;
        
        if (state.currentUserPermissions && state.currentUserPermissions.user?.id === userId) {
          const permissionIndex = state.currentUserPermissions.permissions.findIndex(
            p => p.permission?.key === permissionKey
          );
          
          if (permissionIndex !== -1) {
            state.currentUserPermissions.permissions[permissionIndex].isGranted = false;
          }
        }
      })
      .addCase(revokeUserPermission.rejected, (state, action) => {
        state.savingPermission = false;
        state.saveError = action.payload;
      });

    // Grant bulk permissions
    builder
      .addCase(grantUserPermissionsBulk.pending, (state) => {
        state.savingPermission = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(grantUserPermissionsBulk.fulfilled, (state) => {
        state.savingPermission = false;
        state.saveSuccess = true;
      })
      .addCase(grantUserPermissionsBulk.rejected, (state, action) => {
        state.savingPermission = false;
        state.saveError = action.payload;
      });

    // Revoke bulk permissions
    builder
      .addCase(revokeUserPermissionsBulk.pending, (state) => {
        state.savingPermission = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(revokeUserPermissionsBulk.fulfilled, (state) => {
        state.savingPermission = false;
        state.saveSuccess = true;
      })
      .addCase(revokeUserPermissionsBulk.rejected, (state, action) => {
        state.savingPermission = false;
        state.saveError = action.payload;
      });

    // Reset to defaults
    builder
      .addCase(resetToDefaults.pending, (state) => {
        state.resetting = true;
        state.resetError = null;
        state.resetSuccess = false;
      })
      .addCase(resetToDefaults.fulfilled, (state, action) => {
        state.resetting = false;
        state.resetSuccess = true;
        
        // Limpiar currentUserPermissions para forzar recarga
        if (state.currentUserPermissions && 
            state.currentUserPermissions.user?.id === action.payload.userId) {
          state.currentUserPermissions = null;
        }
      })
      .addCase(resetToDefaults.rejected, (state, action) => {
        state.resetting = false;
        state.resetError = action.payload;
      });
  }
});

// ================================
// EXPORTS
// ================================

export const {
  clearErrors,
  clearSuccess,
  setCurrentEditingUser,
  clearCurrentEditingUser,
  openModal,
  closeModal,
  updateFilters,
  resetFilters,
  updatePermissionLocally
} = permissionsSlice.actions;

export default permissionsSlice.reducer;
