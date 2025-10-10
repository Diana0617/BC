import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

/**
 * Thunks para gestión de servicios de especialistas con precios personalizados
 */

// Obtener servicios de un especialista
export const getSpecialistServices = createAsyncThunk(
  'specialistService/getSpecialistServices',
  async ({ specialistId, isActive }, { rejectWithValue }) => {
    try {
      const params = isActive !== undefined ? { isActive } : {};
      const response = await api.get(`/specialists/${specialistId}/services`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener servicios del especialista' });
    }
  }
);

// Asignar un servicio a un especialista con precio personalizado
export const assignServiceToSpecialist = createAsyncThunk(
  'specialistService/assignServiceToSpecialist',
  async ({ specialistId, serviceData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/specialists/${specialistId}/services`, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al asignar servicio' });
    }
  }
);

// Actualizar configuración de servicio del especialista (precio, nivel de habilidad, etc.)
export const updateSpecialistService = createAsyncThunk(
  'specialistService/updateSpecialistService',
  async ({ specialistId, serviceId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/specialists/${specialistId}/services/${serviceId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar servicio' });
    }
  }
);

// Eliminar servicio del especialista
export const removeServiceFromSpecialist = createAsyncThunk(
  'specialistService/removeServiceFromSpecialist',
  async ({ specialistId, serviceId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/specialists/${specialistId}/services/${serviceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al eliminar servicio' });
    }
  }
);

const initialState = {
  specialistServices: [], // Lista de servicios del especialista actual
  selectedSpecialistService: null,
  loading: false,
  error: null,
  success: false,
  message: null
};

const specialistServiceSlice = createSlice({
  name: 'specialistService',
  initialState,
  reducers: {
    clearSpecialistServiceError: (state) => {
      state.error = null;
    },
    clearSpecialistServiceSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetSpecialistServiceState: (state) => {
      state.specialistServices = [];
      state.selectedSpecialistService = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    setSelectedSpecialistService: (state, action) => {
      state.selectedSpecialistService = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Specialist Services
      .addCase(getSpecialistServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialistServices.fulfilled, (state, action) => {
        state.loading = false;
        state.specialistServices = action.payload.data || [];
        state.error = null;
      })
      .addCase(getSpecialistServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al obtener servicios';
      })

      // Assign Service to Specialist
      .addCase(assignServiceToSpecialist.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(assignServiceToSpecialist.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Servicio asignado exitosamente';
        // Agregar el nuevo servicio a la lista
        if (action.payload.data) {
          state.specialistServices.push(action.payload.data);
        }
      })
      .addCase(assignServiceToSpecialist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al asignar servicio';
        state.success = false;
      })

      // Update Specialist Service
      .addCase(updateSpecialistService.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSpecialistService.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Servicio actualizado exitosamente';
        // Actualizar el servicio en la lista
        if (action.payload.data) {
          const index = state.specialistServices.findIndex(
            s => s.id === action.payload.data.id
          );
          if (index !== -1) {
            state.specialistServices[index] = action.payload.data;
          }
        }
      })
      .addCase(updateSpecialistService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al actualizar servicio';
        state.success = false;
      })

      // Remove Service from Specialist
      .addCase(removeServiceFromSpecialist.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeServiceFromSpecialist.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Servicio eliminado exitosamente';
        // Remover el servicio de la lista
        state.specialistServices = state.specialistServices.filter(
          s => s.id !== action.meta.arg.serviceId
        );
      })
      .addCase(removeServiceFromSpecialist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Error al eliminar servicio';
        state.success = false;
      });
  }
});

export const {
  clearSpecialistServiceError,
  clearSpecialistServiceSuccess,
  resetSpecialistServiceState,
  setSelectedSpecialistService
} = specialistServiceSlice.actions;

export default specialistServiceSlice.reducer;
