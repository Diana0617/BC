import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerBusinessManagementApi } from '../../api/ownerBusinessManagementApi';

// 🏢 GESTIÓN DE NEGOCIOS OWNER - Async Thunks

/**
 * Obtener planes disponibles para invitaciones
 */
export const getAvailablePlans = createAsyncThunk(
  'ownerBusinessManagement/getAvailablePlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.getAvailablePlans();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo planes',
        status: error.response?.status
      });
    }
  }
);

/**
 * Crear invitación de negocio
 */
export const createBusinessInvitation = createAsyncThunk(
  'ownerBusinessManagement/createBusinessInvitation',
  async (invitationData, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.createBusinessInvitation(invitationData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error creando invitación',
        status: error.response?.status,
        details: error.response?.data?.details
      });
    }
  }
);

/**
 * Obtener lista de invitaciones del owner
 */
export const getMyInvitations = createAsyncThunk(
  'ownerBusinessManagement/getMyInvitations',
  async ({ status, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.getMyInvitations({ status, page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo invitaciones',
        status: error.response?.status
      });
    }
  }
);

/**
 * Obtener estadísticas de invitaciones
 */
export const getInvitationStats = createAsyncThunk(
  'ownerBusinessManagement/getInvitationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.getInvitationStats();
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo estadísticas',
        status: error.response?.status
      });
    }
  }
);

/**
 * Reenviar invitación
 */
export const resendInvitation = createAsyncThunk(
  'ownerBusinessManagement/resendInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.resendInvitation(invitationId);
      return { invitationId, data: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error reenviando invitación',
        status: error.response?.status,
        invitationId
      });
    }
  }
);

/**
 * Cancelar invitación
 */
export const cancelInvitation = createAsyncThunk(
  'ownerBusinessManagement/cancelInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.cancelInvitation(invitationId);
      return { invitationId, data: response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error cancelando invitación',
        status: error.response?.status,
        invitationId
      });
    }
  }
);

/**
 * Obtener detalles de una invitación específica
 */
export const getInvitationDetails = createAsyncThunk(
  'ownerBusinessManagement/getInvitationDetails',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await ownerBusinessManagementApi.getInvitationDetails(invitationId);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Error obteniendo detalles',
        status: error.response?.status
      });
    }
  }
);

// Estado inicial
const initialState = {
  // Planes disponibles
  availablePlans: [],
  isLoadingPlans: false,
  
  // Invitaciones
  invitations: [],
  invitationsPagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoadingInvitations: false,
  
  // Filtros de invitaciones
  invitationFilters: {
    status: null, // SENT, VIEWED, PAYMENT_STARTED, COMPLETED, EXPIRED, CANCELLED
  },
  
  // Estadísticas de invitaciones
  invitationStats: null,
  isLoadingStats: false,
  
  // Creación de invitación
  isCreatingInvitation: false,
  createdInvitation: null,
  
  // Acciones en invitaciones
  actionInProgress: {}, // { invitationId: 'resending' | 'cancelling' }
  
  // Detalles de invitación
  selectedInvitation: null,
  isLoadingDetails: false,
  
  // Estados globales
  error: null,
  lastUpdated: null,
  
  // UI States
  showCreateModal: false,
  showDetailsModal: false
};

// Slice
const ownerBusinessManagementSlice = createSlice({
  name: 'ownerBusinessManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInvitationFilter: (state, action) => {
      state.invitationFilters = { ...state.invitationFilters, ...action.payload };
    },
    clearInvitationFilters: (state) => {
      state.invitationFilters = initialState.invitationFilters;
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowDetailsModal: (state, action) => {
      state.showDetailsModal = action.payload;
    },
    clearCreatedInvitation: (state) => {
      state.createdInvitation = null;
    },
    clearSelectedInvitation: (state) => {
      state.selectedInvitation = null;
    },
    resetInvitations: (state) => {
      state.invitations = [];
      state.invitationsPagination = initialState.invitationsPagination;
    },
    updateInvitationInList: (state, action) => {
      const { invitationId, updates } = action.payload;
      const index = state.invitations.findIndex(inv => inv.id === invitationId);
      if (index !== -1) {
        state.invitations[index] = { ...state.invitations[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Available Plans
      .addCase(getAvailablePlans.pending, (state) => {
        state.isLoadingPlans = true;
        state.error = null;
      })
      .addCase(getAvailablePlans.fulfilled, (state, action) => {
        state.isLoadingPlans = false;
        state.availablePlans = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAvailablePlans.rejected, (state, action) => {
        state.isLoadingPlans = false;
        state.error = action.payload;
      })

      // Create Business Invitation
      .addCase(createBusinessInvitation.pending, (state) => {
        state.isCreatingInvitation = true;
        state.error = null;
      })
      .addCase(createBusinessInvitation.fulfilled, (state, action) => {
        state.isCreatingInvitation = false;
        state.createdInvitation = action.payload;
        // Agregar la nueva invitación al inicio de la lista si existe
        if (state.invitations.length > 0) {
          state.invitations.unshift(action.payload);
        }
        state.showCreateModal = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createBusinessInvitation.rejected, (state, action) => {
        state.isCreatingInvitation = false;
        state.error = action.payload;
      })

      // Get My Invitations
      .addCase(getMyInvitations.pending, (state) => {
        state.isLoadingInvitations = true;
        state.error = null;
      })
      .addCase(getMyInvitations.fulfilled, (state, action) => {
        state.isLoadingInvitations = false;
        const { items, pagination } = action.payload;
        
        if (pagination.currentPage === 1) {
          state.invitations = items;
        } else {
          state.invitations = [...state.invitations, ...items];
        }
        
        state.invitationsPagination = pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getMyInvitations.rejected, (state, action) => {
        state.isLoadingInvitations = false;
        state.error = action.payload;
      })

      // Invitation Stats
      .addCase(getInvitationStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(getInvitationStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.invitationStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getInvitationStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
      })

      // Resend Invitation
      .addCase(resendInvitation.pending, (state, action) => {
        const invitationId = action.meta.arg;
        state.actionInProgress[invitationId] = 'resending';
        state.error = null;
      })
      .addCase(resendInvitation.fulfilled, (state, action) => {
        const { invitationId, data } = action.payload;
        delete state.actionInProgress[invitationId];
        
        // Actualizar la invitación en la lista
        const index = state.invitations.findIndex(inv => inv.id === invitationId);
        if (index !== -1) {
          state.invitations[index] = { ...state.invitations[index], ...data };
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(resendInvitation.rejected, (state, action) => {
        const { invitationId } = action.payload;
        delete state.actionInProgress[invitationId];
        state.error = action.payload;
      })

      // Cancel Invitation
      .addCase(cancelInvitation.pending, (state, action) => {
        const invitationId = action.meta.arg;
        state.actionInProgress[invitationId] = 'cancelling';
        state.error = null;
      })
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        const { invitationId } = action.payload;
        delete state.actionInProgress[invitationId];
        
        // Actualizar el estado de la invitación
        const index = state.invitations.findIndex(inv => inv.id === invitationId);
        if (index !== -1) {
          state.invitations[index].status = 'CANCELLED';
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(cancelInvitation.rejected, (state, action) => {
        const { invitationId } = action.payload;
        delete state.actionInProgress[invitationId];
        state.error = action.payload;
      })

      // Invitation Details
      .addCase(getInvitationDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(getInvitationDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.selectedInvitation = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getInvitationDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const {
  clearError,
  setInvitationFilter,
  clearInvitationFilters,
  setShowCreateModal,
  setShowDetailsModal,
  clearCreatedInvitation,
  clearSelectedInvitation,
  resetInvitations,
  updateInvitationInList
} = ownerBusinessManagementSlice.actions;

// Selectors
export const selectOwnerBusinessManagement = (state) => state.ownerBusinessManagement;
export const selectAvailablePlans = (state) => state.ownerBusinessManagement.availablePlans;
export const selectInvitations = (state) => state.ownerBusinessManagement.invitations;
export const selectInvitationsPagination = (state) => state.ownerBusinessManagement.invitationsPagination;
export const selectInvitationStats = (state) => state.ownerBusinessManagement.invitationStats;
export const selectIsCreatingInvitation = (state) => state.ownerBusinessManagement.isCreatingInvitation;
export const selectCreatedInvitation = (state) => state.ownerBusinessManagement.createdInvitation;
export const selectSelectedInvitation = (state) => state.ownerBusinessManagement.selectedInvitation;
export const selectInvitationFilters = (state) => state.ownerBusinessManagement.invitationFilters;
export const selectActionInProgress = (state) => state.ownerBusinessManagement.actionInProgress;
export const selectShowCreateModal = (state) => state.ownerBusinessManagement.showCreateModal;
export const selectShowDetailsModal = (state) => state.ownerBusinessManagement.showDetailsModal;
export const selectOwnerBusinessManagementError = (state) => state.ownerBusinessManagement.error;

// Computed Selectors
export const selectInvitationsByStatus = (state) => {
  const invitations = selectInvitations(state);
  return {
    sent: invitations.filter(inv => inv.status === 'SENT'),
    viewed: invitations.filter(inv => inv.status === 'VIEWED'),
    paymentStarted: invitations.filter(inv => inv.status === 'PAYMENT_STARTED'),
    completed: invitations.filter(inv => inv.status === 'COMPLETED'),
    expired: invitations.filter(inv => inv.status === 'EXPIRED'),
    cancelled: invitations.filter(inv => inv.status === 'CANCELLED')
  };
};

export const selectIsInvitationActionInProgress = (state, invitationId) => {
  return !!state.ownerBusinessManagement.actionInProgress[invitationId];
};

export default ownerBusinessManagementSlice.reducer;