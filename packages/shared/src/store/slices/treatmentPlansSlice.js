import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import treatmentPlansApi from '../../api/treatmentPlansApi';

/**
 * 💉 TREATMENT PLANS SLICE
 * Gestión completa de planes de tratamiento multi-sesión y sus sesiones
 */

// ==================== ASYNC THUNKS - TREATMENT PLANS ====================

/**
 * Crear nuevo plan de tratamiento
 */
export const createTreatmentPlan = createAsyncThunk(
  'treatmentPlans/create',
  async (planData, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.createTreatmentPlan(planData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener plan de tratamiento por ID
 */
export const fetchTreatmentPlan = createAsyncThunk(
  'treatmentPlans/fetchById',
  async (planId, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.getTreatmentPlan(planId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener todos los planes de tratamiento
 */
export const fetchTreatmentPlans = createAsyncThunk(
  'treatmentPlans/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.getTreatmentPlans(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Obtener planes de tratamiento de un cliente
 */
export const fetchClientTreatmentPlans = createAsyncThunk(
  'treatmentPlans/fetchByClient',
  async ({ clientId, includeCompleted = false }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.getClientTreatmentPlans(clientId, includeCompleted);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Actualizar plan de tratamiento
 */
export const updateTreatmentPlan = createAsyncThunk(
  'treatmentPlans/update',
  async ({ planId, updateData }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.updateTreatmentPlan(planId, updateData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cancelar plan de tratamiento
 */
export const cancelTreatmentPlan = createAsyncThunk(
  'treatmentPlans/cancel',
  async ({ planId, reason }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.cancelTreatmentPlan(planId, reason);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Registrar pago en plan de tratamiento
 */
export const addPlanPayment = createAsyncThunk(
  'treatmentPlans/addPayment',
  async ({ planId, paymentData }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.addPlanPayment(planId, paymentData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== ASYNC THUNKS - SESSIONS ====================

/**
 * Obtener sesión por ID
 */
export const fetchSession = createAsyncThunk(
  'treatmentPlans/fetchSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.getSession(sessionId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Agendar sesión (vincular con turno)
 */
export const scheduleSession = createAsyncThunk(
  'treatmentPlans/scheduleSession',
  async ({ sessionId, scheduleData }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.scheduleSession(sessionId, scheduleData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Completar sesión
 */
export const completeSession = createAsyncThunk(
  'treatmentPlans/completeSession',
  async ({ sessionId, completionData }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.completeSession(sessionId, completionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cancelar sesión
 */
export const cancelSession = createAsyncThunk(
  'treatmentPlans/cancelSession',
  async ({ sessionId, reason }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.cancelSession(sessionId, reason);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Reagendar sesión
 */
export const rescheduleSession = createAsyncThunk(
  'treatmentPlans/rescheduleSession',
  async ({ sessionId, newAppointmentId }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.rescheduleSession(sessionId, newAppointmentId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Marcar sesión como no show
 */
export const markSessionNoShow = createAsyncThunk(
  'treatmentPlans/markNoShow',
  async ({ sessionId, notes }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.markSessionNoShow(sessionId, notes);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Agregar foto a sesión
 */
export const addSessionPhoto = createAsyncThunk(
  'treatmentPlans/addPhoto',
  async ({ sessionId, photoData }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.addSessionPhoto(sessionId, photoData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Eliminar foto de sesión
 */
export const deleteSessionPhoto = createAsyncThunk(
  'treatmentPlans/deletePhoto',
  async ({ sessionId, photoIndex }, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.deleteSessionPhoto(sessionId, photoIndex);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Registrar pago de sesión
 */
export const registerSessionPayment = createAsyncThunk(
  'treatmentPlans/registerSessionPayment',
  async (sessionId, { rejectWithValue }) => {
    try {
      const data = await treatmentPlansApi.registerSessionPayment(sessionId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  // Plans data
  plans: [],
  currentPlan: null,
  clientPlans: [],
  
  // Sessions cache (para acceso rápido)
  sessions: {},
  currentSession: null,
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  
  // Loading states por operación
  loading: {
    fetchPlans: false,
    fetchPlan: false,
    createPlan: false,
    updatePlan: false,
    cancelPlan: false,
    addPayment: false,
    fetchSession: false,
    scheduleSession: false,
    completeSession: false,
    cancelSession: false,
    rescheduleSession: false,
    markNoShow: false,
    addPhoto: false,
    deletePhoto: false,
    registerPayment: false
  },
  
  // Error states por operación
  errors: {
    fetchPlans: null,
    fetchPlan: null,
    createPlan: null,
    updatePlan: null,
    cancelPlan: null,
    addPayment: null,
    fetchSession: null,
    scheduleSession: null,
    completeSession: null,
    cancelSession: null,
    rescheduleSession: null,
    markNoShow: null,
    addPhoto: null,
    deletePhoto: null,
    registerPayment: null
  },
  
  // Success flags
  success: {
    createPlan: false,
    updatePlan: false,
    cancelPlan: false,
    addPayment: false,
    scheduleSession: false,
    completeSession: false,
    cancelSession: false,
    rescheduleSession: false,
    markNoShow: false,
    addPhoto: false,
    deletePhoto: false,
    registerPayment: false
  }
};

// ==================== SLICE ====================

const treatmentPlansSlice = createSlice({
  name: 'treatmentPlans',
  initialState,
  reducers: {
    // Limpiar errores
    clearErrors: (state) => {
      state.errors = initialState.errors;
    },
    
    // Limpiar success flags
    clearSuccess: (state) => {
      state.success = initialState.success;
    },
    
    // Limpiar error específico
    clearError: (state, action) => {
      const errorKey = action.payload;
      if (state.errors[errorKey] !== undefined) {
        state.errors[errorKey] = null;
      }
    },
    
    // Limpiar success flag específico
    clearSuccessFlag: (state, action) => {
      const successKey = action.payload;
      if (state.success[successKey] !== undefined) {
        state.success[successKey] = false;
      }
    },
    
    // Limpiar plan actual
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    
    // Limpiar sesión actual
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    
    // Limpiar todo el estado
    clearAllTreatmentPlans: (state) => {
      return initialState;
    },
    
    // Actualizar sesión en cache local
    updateSessionInCache: (state, action) => {
      const session = action.payload;
      if (session && session.id) {
        state.sessions[session.id] = session;
      }
    }
  },
  
  extraReducers: (builder) => {
    // ==================== CREATE PLAN ====================
    builder
      .addCase(createTreatmentPlan.pending, (state) => {
        state.loading.createPlan = true;
        state.errors.createPlan = null;
        state.success.createPlan = false;
      })
      .addCase(createTreatmentPlan.fulfilled, (state, action) => {
        state.loading.createPlan = false;
        state.success.createPlan = true;
        state.currentPlan = action.payload;
        state.plans.unshift(action.payload);
      })
      .addCase(createTreatmentPlan.rejected, (state, action) => {
        state.loading.createPlan = false;
        state.errors.createPlan = action.payload;
        state.success.createPlan = false;
      })
    
    // ==================== FETCH PLAN BY ID ====================
      .addCase(fetchTreatmentPlan.pending, (state) => {
        state.loading.fetchPlan = true;
        state.errors.fetchPlan = null;
      })
      .addCase(fetchTreatmentPlan.fulfilled, (state, action) => {
        state.loading.fetchPlan = false;
        state.currentPlan = action.payload;
        
        // Actualizar en lista si existe
        const index = state.plans.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
        
        // Cachear sesiones
        if (action.payload.sessions) {
          action.payload.sessions.forEach(session => {
            state.sessions[session.id] = session;
          });
        }
      })
      .addCase(fetchTreatmentPlan.rejected, (state, action) => {
        state.loading.fetchPlan = false;
        state.errors.fetchPlan = action.payload;
      })
    
    // ==================== FETCH ALL PLANS ====================
      .addCase(fetchTreatmentPlans.pending, (state) => {
        state.loading.fetchPlans = true;
        state.errors.fetchPlans = null;
      })
      .addCase(fetchTreatmentPlans.fulfilled, (state, action) => {
        state.loading.fetchPlans = false;
        state.plans = action.payload.plans || action.payload;
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchTreatmentPlans.rejected, (state, action) => {
        state.loading.fetchPlans = false;
        state.errors.fetchPlans = action.payload;
      })
    
    // ==================== FETCH CLIENT PLANS ====================
      .addCase(fetchClientTreatmentPlans.pending, (state) => {
        state.loading.fetchPlans = true;
        state.errors.fetchPlans = null;
      })
      .addCase(fetchClientTreatmentPlans.fulfilled, (state, action) => {
        state.loading.fetchPlans = false;
        state.clientPlans = action.payload;
      })
      .addCase(fetchClientTreatmentPlans.rejected, (state, action) => {
        state.loading.fetchPlans = false;
        state.errors.fetchPlans = action.payload;
      })
    
    // ==================== UPDATE PLAN ====================
      .addCase(updateTreatmentPlan.pending, (state) => {
        state.loading.updatePlan = true;
        state.errors.updatePlan = null;
        state.success.updatePlan = false;
      })
      .addCase(updateTreatmentPlan.fulfilled, (state, action) => {
        state.loading.updatePlan = false;
        state.success.updatePlan = true;
        
        // Actualizar current plan
        if (state.currentPlan && state.currentPlan.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        
        // Actualizar en lista
        const index = state.plans.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updateTreatmentPlan.rejected, (state, action) => {
        state.loading.updatePlan = false;
        state.errors.updatePlan = action.payload;
        state.success.updatePlan = false;
      })
    
    // ==================== CANCEL PLAN ====================
      .addCase(cancelTreatmentPlan.pending, (state) => {
        state.loading.cancelPlan = true;
        state.errors.cancelPlan = null;
        state.success.cancelPlan = false;
      })
      .addCase(cancelTreatmentPlan.fulfilled, (state, action) => {
        state.loading.cancelPlan = false;
        state.success.cancelPlan = true;
        
        // Actualizar current plan
        if (state.currentPlan && state.currentPlan.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        
        // Actualizar en lista
        const index = state.plans.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(cancelTreatmentPlan.rejected, (state, action) => {
        state.loading.cancelPlan = false;
        state.errors.cancelPlan = action.payload;
        state.success.cancelPlan = false;
      })
    
    // ==================== ADD PAYMENT ====================
      .addCase(addPlanPayment.pending, (state) => {
        state.loading.addPayment = true;
        state.errors.addPayment = null;
        state.success.addPayment = false;
      })
      .addCase(addPlanPayment.fulfilled, (state, action) => {
        state.loading.addPayment = false;
        state.success.addPayment = true;
        
        // Actualizar current plan
        if (state.currentPlan && state.currentPlan.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        
        // Actualizar en lista
        const index = state.plans.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(addPlanPayment.rejected, (state, action) => {
        state.loading.addPayment = false;
        state.errors.addPayment = action.payload;
        state.success.addPayment = false;
      })
    
    // ==================== FETCH SESSION ====================
      .addCase(fetchSession.pending, (state) => {
        state.loading.fetchSession = true;
        state.errors.fetchSession = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading.fetchSession = false;
        state.currentSession = action.payload;
        state.sessions[action.payload.id] = action.payload;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading.fetchSession = false;
        state.errors.fetchSession = action.payload;
      })
    
    // ==================== SCHEDULE SESSION ====================
      .addCase(scheduleSession.pending, (state) => {
        state.loading.scheduleSession = true;
        state.errors.scheduleSession = null;
        state.success.scheduleSession = false;
      })
      .addCase(scheduleSession.fulfilled, (state, action) => {
        state.loading.scheduleSession = false;
        state.success.scheduleSession = true;
        
        // Actualizar sesión
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
        
        // Si viene el plan actualizado, actualizarlo
        if (action.payload.plan) {
          if (state.currentPlan && state.currentPlan.id === action.payload.plan.id) {
            state.currentPlan = action.payload.plan;
          }
        }
      })
      .addCase(scheduleSession.rejected, (state, action) => {
        state.loading.scheduleSession = false;
        state.errors.scheduleSession = action.payload;
        state.success.scheduleSession = false;
      })
    
    // ==================== COMPLETE SESSION ====================
      .addCase(completeSession.pending, (state) => {
        state.loading.completeSession = true;
        state.errors.completeSession = null;
        state.success.completeSession = false;
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        state.loading.completeSession = false;
        state.success.completeSession = true;
        
        // Actualizar sesión
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
        
        // Actualizar plan con nuevo progreso
        if (action.payload.plan) {
          if (state.currentPlan && state.currentPlan.id === action.payload.plan.id) {
            state.currentPlan = action.payload.plan;
          }
          
          const index = state.plans.findIndex(p => p.id === action.payload.plan.id);
          if (index !== -1) {
            state.plans[index] = action.payload.plan;
          }
        }
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.loading.completeSession = false;
        state.errors.completeSession = action.payload;
        state.success.completeSession = false;
      })
    
    // ==================== CANCEL SESSION ====================
      .addCase(cancelSession.pending, (state) => {
        state.loading.cancelSession = true;
        state.errors.cancelSession = null;
        state.success.cancelSession = false;
      })
      .addCase(cancelSession.fulfilled, (state, action) => {
        state.loading.cancelSession = false;
        state.success.cancelSession = true;
        
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.loading.cancelSession = false;
        state.errors.cancelSession = action.payload;
        state.success.cancelSession = false;
      })
    
    // ==================== RESCHEDULE SESSION ====================
      .addCase(rescheduleSession.pending, (state) => {
        state.loading.rescheduleSession = true;
        state.errors.rescheduleSession = null;
        state.success.rescheduleSession = false;
      })
      .addCase(rescheduleSession.fulfilled, (state, action) => {
        state.loading.rescheduleSession = false;
        state.success.rescheduleSession = true;
        
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
      })
      .addCase(rescheduleSession.rejected, (state, action) => {
        state.loading.rescheduleSession = false;
        state.errors.rescheduleSession = action.payload;
        state.success.rescheduleSession = false;
      })
    
    // ==================== MARK NO SHOW ====================
      .addCase(markSessionNoShow.pending, (state) => {
        state.loading.markNoShow = true;
        state.errors.markNoShow = null;
        state.success.markNoShow = false;
      })
      .addCase(markSessionNoShow.fulfilled, (state, action) => {
        state.loading.markNoShow = false;
        state.success.markNoShow = true;
        
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
      })
      .addCase(markSessionNoShow.rejected, (state, action) => {
        state.loading.markNoShow = false;
        state.errors.markNoShow = action.payload;
        state.success.markNoShow = false;
      })
    
    // ==================== ADD PHOTO ====================
      .addCase(addSessionPhoto.pending, (state) => {
        state.loading.addPhoto = true;
        state.errors.addPhoto = null;
        state.success.addPhoto = false;
      })
      .addCase(addSessionPhoto.fulfilled, (state, action) => {
        state.loading.addPhoto = false;
        state.success.addPhoto = true;
        
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
      })
      .addCase(addSessionPhoto.rejected, (state, action) => {
        state.loading.addPhoto = false;
        state.errors.addPhoto = action.payload;
        state.success.addPhoto = false;
      })
    
    // ==================== DELETE PHOTO ====================
      .addCase(deleteSessionPhoto.pending, (state) => {
        state.loading.deletePhoto = true;
        state.errors.deletePhoto = null;
        state.success.deletePhoto = false;
      })
      .addCase(deleteSessionPhoto.fulfilled, (state, action) => {
        state.loading.deletePhoto = false;
        state.success.deletePhoto = true;
        
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
      })
      .addCase(deleteSessionPhoto.rejected, (state, action) => {
        state.loading.deletePhoto = false;
        state.errors.deletePhoto = action.payload;
        state.success.deletePhoto = false;
      })
    
    // ==================== REGISTER SESSION PAYMENT ====================
      .addCase(registerSessionPayment.pending, (state) => {
        state.loading.registerPayment = true;
        state.errors.registerPayment = null;
        state.success.registerPayment = false;
      })
      .addCase(registerSessionPayment.fulfilled, (state, action) => {
        state.loading.registerPayment = false;
        state.success.registerPayment = true;
        
        // Actualizar sesión
        const session = action.payload.session || action.payload;
        state.sessions[session.id] = session;
        
        if (state.currentSession && state.currentSession.id === session.id) {
          state.currentSession = session;
        }
        
        // Actualizar plan con nuevo pago
        if (action.payload.plan) {
          if (state.currentPlan && state.currentPlan.id === action.payload.plan.id) {
            state.currentPlan = action.payload.plan;
          }
          
          const index = state.plans.findIndex(p => p.id === action.payload.plan.id);
          if (index !== -1) {
            state.plans[index] = action.payload.plan;
          }
        }
      })
      .addCase(registerSessionPayment.rejected, (state, action) => {
        state.loading.registerPayment = false;
        state.errors.registerPayment = action.payload;
        state.success.registerPayment = false;
      });
  }
});

// ==================== ACTIONS ====================
export const {
  clearErrors,
  clearSuccess,
  clearError,
  clearSuccessFlag,
  clearCurrentPlan,
  clearCurrentSession,
  clearAllTreatmentPlans,
  updateSessionInCache
} = treatmentPlansSlice.actions;

// ==================== SELECTORS ====================

// Selectors básicos
export const selectAllPlans = (state) => state.treatmentPlans.plans;
export const selectCurrentPlan = (state) => state.treatmentPlans.currentPlan;
export const selectClientPlans = (state) => state.treatmentPlans.clientPlans;
export const selectCurrentSession = (state) => state.treatmentPlans.currentSession;
export const selectSessions = (state) => state.treatmentPlans.sessions;
export const selectPagination = (state) => state.treatmentPlans.pagination;

// Loading selectors
export const selectLoading = (state) => state.treatmentPlans.loading;
export const selectIsLoading = (operation) => (state) => state.treatmentPlans.loading[operation];

// Error selectors
export const selectErrors = (state) => state.treatmentPlans.errors;
export const selectError = (operation) => (state) => state.treatmentPlans.errors[operation];

// Success selectors
export const selectSuccess = (state) => state.treatmentPlans.success;
export const selectSuccessFlag = (operation) => (state) => state.treatmentPlans.success[operation];

// Selector de plan por ID
export const selectPlanById = (planId) => (state) => {
  return state.treatmentPlans.plans.find(plan => plan.id === planId) || null;
};

// Selector de sesión por ID
export const selectSessionById = (sessionId) => (state) => {
  return state.treatmentPlans.sessions[sessionId] || null;
};

// Selector de planes activos
export const selectActivePlans = (state) => {
  return state.treatmentPlans.plans.filter(plan => plan.status === 'ACTIVE');
};

// Selector de planes completados
export const selectCompletedPlans = (state) => {
  return state.treatmentPlans.plans.filter(plan => plan.status === 'COMPLETED');
};

// Selector de sesiones del plan actual
export const selectCurrentPlanSessions = (state) => {
  return state.treatmentPlans.currentPlan?.sessions || [];
};

// Selector de sesiones pendientes del plan actual
export const selectCurrentPlanPendingSessions = (state) => {
  const sessions = state.treatmentPlans.currentPlan?.sessions || [];
  return sessions.filter(session => session.status === 'PENDING');
};

// Selector de sesiones completadas del plan actual
export const selectCurrentPlanCompletedSessions = (state) => {
  const sessions = state.treatmentPlans.currentPlan?.sessions || [];
  return sessions.filter(session => session.status === 'COMPLETED');
};

export default treatmentPlansSlice.reducer;
