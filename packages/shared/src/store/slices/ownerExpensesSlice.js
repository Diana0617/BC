import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerExpensesApi } from '../../api/ownerExpensesApi';

// Async thunks
export const fetchOwnerExpenses = createAsyncThunk(
  'ownerExpenses/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const res = await ownerExpensesApi.getExpenses(filters);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createOwnerExpense = createAsyncThunk(
  'ownerExpenses/create',
  async ({ expenseData, receiptFile }, { rejectWithValue }) => {
    try {
      const res = await ownerExpensesApi.createExpense(expenseData, receiptFile);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  filters: { status: '', category: '', search: '', page: 1, limit: 10 },
  pagination: { page: 1, totalPages: 1, totalItems: 0, limit: 10 },
  stats: {},
};

const ownerExpensesSlice = createSlice({
  name: 'ownerExpenses',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOwnerExpenses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses || [];
        state.stats = action.payload.stats || {};
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchOwnerExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar gastos';
      })
      .addCase(createOwnerExpense.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOwnerExpense.fulfilled, (state, action) => {
        state.loading = false;
        // Opcional: recargar gastos después de crear
      })
      .addCase(createOwnerExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al crear gasto';
      });
  },
});

export const { setFilters, resetError } = ownerExpensesSlice.actions;
export default ownerExpensesSlice.reducer;
