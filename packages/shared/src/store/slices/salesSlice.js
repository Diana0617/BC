import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesApi } from '../../api/salesApi';

// AsyncThunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await salesApi.getSales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (saleId, { rejectWithValue }) => {
    try {
      const response = await salesApi.getSaleById(saleId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await salesApi.createSale(saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelSale = createAsyncThunk(
  'sales/cancelSale',
  async ({ saleId, reason }, { rejectWithValue }) => {
    try {
      const response = await salesApi.cancelSale(saleId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSalesSummary = createAsyncThunk(
  'sales/fetchSalesSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await salesApi.getSalesSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  sales: [],
  currentSale: null,
  summary: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  loading: false,
  error: null,
  createSuccess: false,
  cancelSuccess: false
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearSalesError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    clearCancelSuccess: (state) => {
      state.cancelSuccess = false;
    },
    resetSalesState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.data || [];
        state.total = action.payload.pagination?.total || 0;
        state.page = action.payload.pagination?.page || 1;
        state.limit = action.payload.pagination?.limit || 20;
        state.totalPages = action.payload.pagination?.totalPages || 0;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Sale By ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload.data;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.currentSale = action.payload.data;
        // Agregar al inicio de la lista si existe
        if (state.sales.length > 0) {
          state.sales.unshift(action.payload.data);
          state.total += 1;
        }
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })

      // Cancel Sale
      .addCase(cancelSale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.cancelSuccess = false;
      })
      .addCase(cancelSale.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelSuccess = true;
        
        // Actualizar en la lista
        const index = state.sales.findIndex(s => s.id === action.payload.data.id);
        if (index !== -1) {
          state.sales[index] = action.payload.data;
        }
        
        // Actualizar venta actual si es la misma
        if (state.currentSale?.id === action.payload.data.id) {
          state.currentSale = action.payload.data;
        }
      })
      .addCase(cancelSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cancelSuccess = false;
      })

      // Fetch Sales Summary
      .addCase(fetchSalesSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data;
      })
      .addCase(fetchSalesSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearSalesError, 
  clearCurrentSale, 
  clearCreateSuccess, 
  clearCancelSuccess,
  resetSalesState 
} = salesSlice.actions;

export default salesSlice.reducer;
