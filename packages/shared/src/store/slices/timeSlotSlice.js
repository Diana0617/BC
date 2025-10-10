import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

/**
 * 🕐 TIME SLOT SLICE
 * Gestión de slots de tiempo individuales y disponibilidad
 */

// ==================== ASYNC THUNKS ====================

// Obtener slots disponibles por especialista
export const getAvailableSlots = createAsyncThunk(
  'timeSlot/getAvailableSlots',
  async ({ specialistId, date, serviceId }, { rejectWithValue }) => {
    try {
      const params = { specialistId, date };
      if (serviceId) params.serviceId = serviceId;
      
      const response = await api.get('/time-slots/available', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener slots disponibles' });
    }
  }
);

// Obtener slots por rango de fechas
export const getSlotsByDateRange = createAsyncThunk(
  'timeSlot/getSlotsByDateRange',
  async ({ startDate, endDate, specialistId, branchId }, { rejectWithValue }) => {
    try {
      const params = { startDate, endDate };
      if (specialistId) params.specialistId = specialistId;
      if (branchId) params.branchId = branchId;
      
      const response = await api.get('/time-slots', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener slots' });
    }
  }
);

// Crear slot manual
export const createTimeSlot = createAsyncThunk(
  'timeSlot/createTimeSlot',
  async (slotData, { rejectWithValue }) => {
    try {
      const response = await api.post('/time-slots', slotData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear slot' });
    }
  }
);

// Actualizar slot
export const updateTimeSlot = createAsyncThunk(
  'timeSlot/updateTimeSlot',
  async ({ slotId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/time-slots/${slotId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar slot' });
    }
  }
);

// Bloquear slot (marcar como no disponible)
export const blockTimeSlot = createAsyncThunk(
  'timeSlot/blockTimeSlot',
  async ({ slotId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/time-slots/${slotId}/block`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al bloquear slot' });
    }
  }
);

// Desbloquear slot
export const unblockTimeSlot = createAsyncThunk(
  'timeSlot/unblockTimeSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/time-slots/${slotId}/unblock`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al desbloquear slot' });
    }
  }
);

// Eliminar slot
export const deleteTimeSlot = createAsyncThunk(
  'timeSlot/deleteTimeSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/time-slots/${slotId}`);
      return { slotId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al eliminar slot' });
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  slots: [], // Todos los slots
  availableSlots: [], // Solo slots disponibles
  selectedSlot: null, // Slot seleccionado
  slotsByDate: {}, // Slots agrupados por fecha { '2025-10-10': [...] }
  loading: false,
  error: null,
  success: false,
  message: null
};

// ==================== SLICE ====================

const timeSlotSlice = createSlice({
  name: 'timeSlot',
  initialState,
  reducers: {
    clearTimeSlotError: (state) => {
      state.error = null;
    },
    clearTimeSlotSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetTimeSlotState: (state) => {
      Object.assign(state, initialState);
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    groupSlotsByDate: (state) => {
      // Agrupar slots por fecha
      state.slotsByDate = state.slots.reduce((acc, slot) => {
        const date = slot.date || slot.startTime?.split('T')[0];
        if (date) {
          if (!acc[date]) acc[date] = [];
          acc[date].push(slot);
        }
        return acc;
      }, {});
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Available Slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.data || [];
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener slots disponibles';
      })

      // Get Slots by Date Range
      .addCase(getSlotsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSlotsByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload.data || [];
        // Agrupar automáticamente por fecha
        state.slotsByDate = (action.payload.data || []).reduce((acc, slot) => {
          const date = slot.date || slot.startTime?.split('T')[0];
          if (date) {
            if (!acc[date]) acc[date] = [];
            acc[date].push(slot);
          }
          return acc;
        }, {});
      })
      .addCase(getSlotsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener slots';
      })

      // Create Time Slot
      .addCase(createTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slot creado exitosamente';
        if (action.payload.data) {
          state.slots.push(action.payload.data);
          if (action.payload.data.status === 'AVAILABLE') {
            state.availableSlots.push(action.payload.data);
          }
        }
      })
      .addCase(createTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al crear slot';
        state.success = false;
      })

      // Update Time Slot
      .addCase(updateTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slot actualizado exitosamente';
        if (action.payload.data) {
          const index = state.slots.findIndex(s => s.id === action.payload.data.id);
          if (index !== -1) {
            state.slots[index] = action.payload.data;
          }
          const availIndex = state.availableSlots.findIndex(s => s.id === action.payload.data.id);
          if (action.payload.data.status === 'AVAILABLE') {
            if (availIndex === -1) {
              state.availableSlots.push(action.payload.data);
            } else {
              state.availableSlots[availIndex] = action.payload.data;
            }
          } else if (availIndex !== -1) {
            state.availableSlots.splice(availIndex, 1);
          }
        }
      })
      .addCase(updateTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al actualizar slot';
        state.success = false;
      })

      // Block Time Slot
      .addCase(blockTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(blockTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slot bloqueado exitosamente';
        if (action.payload.data) {
          const index = state.slots.findIndex(s => s.id === action.payload.data.id);
          if (index !== -1) {
            state.slots[index] = action.payload.data;
          }
          state.availableSlots = state.availableSlots.filter(s => s.id !== action.payload.data.id);
        }
      })
      .addCase(blockTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al bloquear slot';
        state.success = false;
      })

      // Unblock Time Slot
      .addCase(unblockTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(unblockTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slot desbloqueado exitosamente';
        if (action.payload.data) {
          const index = state.slots.findIndex(s => s.id === action.payload.data.id);
          if (index !== -1) {
            state.slots[index] = action.payload.data;
          }
          if (action.payload.data.status === 'AVAILABLE') {
            state.availableSlots.push(action.payload.data);
          }
        }
      })
      .addCase(unblockTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al desbloquear slot';
        state.success = false;
      })

      // Delete Time Slot
      .addCase(deleteTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Slot eliminado exitosamente';
        state.slots = state.slots.filter(s => s.id !== action.meta.arg);
        state.availableSlots = state.availableSlots.filter(s => s.id !== action.meta.arg);
      })
      .addCase(deleteTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al eliminar slot';
        state.success = false;
      });
  }
});

export const {
  clearTimeSlotError,
  clearTimeSlotSuccess,
  resetTimeSlotState,
  setSelectedSlot,
  groupSlotsByDate
} = timeSlotSlice.actions;

export default timeSlotSlice.reducer;
