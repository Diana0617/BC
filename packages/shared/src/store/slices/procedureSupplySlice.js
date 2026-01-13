import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { procedureSupplyApi } from '../../api/procedureSupplyApi';

// AsyncThunks
export const fetchSupplies = createAsyncThunk(
  'procedureSupply/fetchSupplies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await procedureSupplyApi.getSupplies(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplyById = createAsyncThunk(
  'procedureSupply/fetchSupplyById',
  async (supplyId, { rejectWithValue }) => {
    try {
      const response = await procedureSupplyApi.getSupplyById(supplyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSupply = createAsyncThunk(
  'procedureSupply/createSupply',
  async (supplyData, { rejectWithValue }) => {
    try {
      const response = await procedureSupplyApi.createSupply(supplyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSuppliesByAppointment = createAsyncThunk(
  'procedureSupply/fetchSuppliesByAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await procedureSupplyApi.getSuppliesByAppointment(appointmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSupplyStats = createAsyncThunk(
  'procedureSupply/fetchSupplyStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await procedureSupplyApi.getSupplyStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  supplies: [],
  currentSupply: null,
  appointmentSupplies: null, // Para consumos de un turno específico
  stats: null,
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
  loading: false,
  error: null,
  createSuccess: false
};

const procedureSupplySlice = createSlice({
  name: 'procedureSupply',
  initialState,
  reducers: {
    clearSupplyError: (state) => {
      state.error = null;
    },
    clearCurrentSupply: (state) => {
      state.currentSupply = null;
    },
    clearAppointmentSupplies: (state) => {
      state.appointmentSupplies = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    resetSupplyState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Supplies
      .addCase(fetchSupplies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplies.fulfilled, (state, action) => {
        state.loading = false;
        state.supplies = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
        state.limit = action.payload.pagination?.limit || 50;
        state.totalPages = action.payload.pagination?.totalPages || 0;
      })
      .addCase(fetchSupplies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Supply By ID
      .addCase(fetchSupplyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSupply = action.payload.data;
      })
      .addCase(fetchSupplyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Supply
      .addCase(createSupply.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createSupply.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.currentSupply = action.payload.data;
        
        // Agregar al inicio de la lista si existe
        if (state.supplies.length > 0) {
          state.supplies.unshift(action.payload.data);
          state.total += 1;
        }

        // Si estamos viendo los consumos de un turno, agregarlo también
        if (state.appointmentSupplies?.supplies && 
            action.payload.data.appointmentId === state.appointmentSupplies.supplies[0]?.appointmentId) {
          state.appointmentSupplies.supplies.unshift(action.payload.data);
          state.appointmentSupplies.summary.totalItems += 1;
          state.appointmentSupplies.summary.totalCost += action.payload.data.totalCost || 0;
        }
      })
      .addCase(createSupply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })

      // Fetch Supplies By Appointment
      .addCase(fetchSuppliesByAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliesByAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointmentSupplies = action.payload.data;
      })
      .addCase(fetchSuppliesByAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Supply Stats
      .addCase(fetchSupplyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchSupplyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearSupplyError, 
  clearCurrentSupply, 
  clearAppointmentSupplies,
  clearCreateSuccess,
  resetSupplyState 
} = procedureSupplySlice.actions;

export default procedureSupplySlice.reducer;
