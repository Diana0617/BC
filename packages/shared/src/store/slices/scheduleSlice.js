import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

/**
 * 📅 SCHEDULE SLICE
 * Gestión de horarios de especialistas y sucursales
 */

// ==================== ASYNC THUNKS ====================

// Crear horario
export const createSchedule = createAsyncThunk(
  'schedule/createSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear horario' });
    }
  }
);

// Obtener horario por ID
export const getScheduleById = createAsyncThunk(
  'schedule/getScheduleById',
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener horario' });
    }
  }
);

// Obtener horarios por sucursal
export const getSchedulesByBranch = createAsyncThunk(
  'schedule/getSchedulesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/branch/${branchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener horarios' });
    }
  }
);

// Actualizar horario
export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ scheduleId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar horario' });
    }
  }
);

// Eliminar horario
export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/schedules/${scheduleId}`);
      return { scheduleId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al eliminar horario' });
    }
  }
);

// Generar slots automáticamente
export const generateSlots = createAsyncThunk(
  'schedule/generateSlots',
  async (slotConfig, { rejectWithValue }) => {
    try {
      const response = await api.post('/schedules/generate-slots', slotConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al generar slots' });
    }
  }
);

// Obtener vista semanal
export const getWeeklySchedule = createAsyncThunk(
  'schedule/getWeeklySchedule',
  async ({ scheduleId, weekStart }, { rejectWithValue }) => {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get(`/schedules/${scheduleId}/weekly`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener vista semanal' });
    }
  }
);

// Obtener vista mensual
export const getMonthlySchedule = createAsyncThunk(
  'schedule/getMonthlySchedule',
  async ({ scheduleId, month, year }, { rejectWithValue }) => {
    try {
      const params = { month, year };
      const response = await api.get(`/schedules/${scheduleId}/monthly`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener vista mensual' });
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  schedules: [], // Lista de horarios
  currentSchedule: null, // Horario seleccionado
  weeklyView: null, // Vista semanal
  monthlyView: null, // Vista mensual
  generatedSlots: [], // Slots generados
  loading: false,
  error: null,
  success: false,
  message: null
};

// ==================== SLICE ====================

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearScheduleError: (state) => {
      state.error = null;
    },
    clearScheduleSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetScheduleState: (state) => {
      Object.assign(state, initialState);
    },
    setCurrentSchedule: (state, action) => {
      state.currentSchedule = action.payload;
    },
    clearWeeklyView: (state) => {
      state.weeklyView = null;
    },
    clearMonthlyView: (state) => {
      state.monthlyView = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Horario creado exitosamente';
        if (action.payload.data) {
          state.schedules.push(action.payload.data);
          state.currentSchedule = action.payload.data;
        }
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al crear horario';
        state.success = false;
      })

      // Get Schedule by ID
      .addCase(getScheduleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSchedule = action.payload.data;
      })
      .addCase(getScheduleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener horario';
      })

      // Get Schedules by Branch
      .addCase(getSchedulesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSchedulesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload.data || [];
      })
      .addCase(getSchedulesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener horarios';
      })

      // Update Schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Horario actualizado exitosamente';
        if (action.payload.data) {
          const index = state.schedules.findIndex(s => s.id === action.payload.data.id);
          if (index !== -1) {
            state.schedules[index] = action.payload.data;
          }
          if (state.currentSchedule?.id === action.payload.data.id) {
            state.currentSchedule = action.payload.data;
          }
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al actualizar horario';
        state.success = false;
      })

      // Delete Schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Horario eliminado exitosamente';
        state.schedules = state.schedules.filter(s => s.id !== action.meta.arg);
        if (state.currentSchedule?.id === action.meta.arg) {
          state.currentSchedule = null;
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al eliminar horario';
        state.success = false;
      })

      // Generate Slots
      .addCase(generateSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slots generados exitosamente';
        state.generatedSlots = action.payload.data || [];
      })
      .addCase(generateSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al generar slots';
        state.success = false;
      })

      // Get Weekly Schedule
      .addCase(getWeeklySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWeeklySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyView = action.payload.data;
      })
      .addCase(getWeeklySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener vista semanal';
      })

      // Get Monthly Schedule
      .addCase(getMonthlySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthlySchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyView = action.payload.data;
      })
      .addCase(getMonthlySchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener vista mensual';
      });
  }
});

export const {
  clearScheduleError,
  clearScheduleSuccess,
  resetScheduleState,
  setCurrentSchedule,
  clearWeeklyView,
  clearMonthlyView
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
