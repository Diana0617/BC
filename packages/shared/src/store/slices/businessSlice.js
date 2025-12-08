import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { businessProfileApi } from '../../api/businessProfileApi.js';

// Async thunk para obtener información del negocio actual
export const fetchCurrentBusiness = createAsyncThunk(
  'business/fetchCurrentBusiness',
  async (_, { rejectWithValue }) => {
    try {
      const response = await businessProfileApi.getBusinessProfile();
      return response.data; // El negocio viene directamente en response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk para actualizar información del negocio
export const updateCurrentBusiness = createAsyncThunk(
  'business/updateCurrentBusiness',
  async (data, { rejectWithValue }) => {
    try {
      const response = await businessProfileApi.updateBusinessProfile(data);
      return response.data; // El negocio actualizado viene en response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  currentBusiness: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  updateError: null,
  lastUpdated: null
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    },
    clearCurrentBusiness: (state) => {
      state.currentBusiness = null;
      state.lastUpdated = null;
    },
    setCurrentBusiness: (state, action) => {
      state.currentBusiness = action.payload;
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch current business
      .addCase(fetchCurrentBusiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentBusiness.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusiness = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCurrentBusiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update current business
      .addCase(updateCurrentBusiness.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateCurrentBusiness.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentBusiness = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.updateError = null;
      })
      .addCase(updateCurrentBusiness.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
      });
  }
});

export const { clearErrors, clearCurrentBusiness, setCurrentBusiness } = businessSlice.actions;

export default businessSlice.reducer;