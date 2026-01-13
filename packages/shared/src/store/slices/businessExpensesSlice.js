import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

// ==================== ASYNC THUNKS ====================

/**
 * Obtener lista de gastos con filtros
 */
export const fetchExpenses = createAsyncThunk(
  'businessExpenses/fetchExpenses',
  async ({ businessId, filters = {}, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });

      const response = await apiClient.get(`/api/business/${businessId}/expenses?${params.toString()}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener gastos');
    }
  }
);

/**
 * Obtener categorías de gastos
 */
export const fetchExpenseCategories = createAsyncThunk(
  'businessExpenses/fetchCategories',
  async ({ businessId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/business/${businessId}/expenses/categories`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener categorías');
    }
  }
);

/**
 * Crear nuevo gasto
 */
export const createExpense = createAsyncThunk(
  'businessExpenses/create',
  async ({ businessId, expenseData }, { rejectWithValue }) => {
    try {
      // Si expenseData ya es FormData, usarlo directamente
      let formData;
      if (expenseData instanceof FormData) {
        formData = expenseData;
      } else {
        // Si no, crear FormData desde el objeto
        formData = new FormData();
        Object.keys(expenseData).forEach(key => {
          if (expenseData[key] !== null && expenseData[key] !== undefined) {
            if (key === 'file' && expenseData[key] instanceof File) {
              formData.append('receipt', expenseData[key]);
            } else {
              formData.append(key, expenseData[key]);
            }
          }
        });
      }

      const response = await apiClient.post(`/api/business/${businessId}/expenses`, formData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear gasto');
    }
  }
);

/**
 * Actualizar gasto existente
 */
export const updateExpense = createAsyncThunk(
  'businessExpenses/update',
  async ({ businessId, expenseId, expenseData }, { rejectWithValue }) => {
    try {
      // Si expenseData ya es FormData, usarlo directamente
      let formData;
      if (expenseData instanceof FormData) {
        formData = expenseData;
      } else {
        // Si no, crear FormData desde el objeto
        formData = new FormData();
        Object.keys(expenseData).forEach(key => {
          if (expenseData[key] !== null && expenseData[key] !== undefined) {
            if (key === 'file' && expenseData[key] instanceof File) {
              formData.append('receipt', expenseData[key]);
            } else {
              formData.append(key, expenseData[key]);
            }
          }
        });
      }

      const response = await apiClient.put(`/api/business/${businessId}/expenses/${expenseId}`, formData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar gasto');
    }
  }
);

/**
 * Eliminar gasto (soft delete)
 */
export const deleteExpense = createAsyncThunk(
  'businessExpenses/delete',
  async ({ businessId, expenseId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/business/${businessId}/expenses/${expenseId}`);

      return expenseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar gasto');
    }
  }
);

/**
 * Aprobar gasto
 */
export const approveExpense = createAsyncThunk(
  'businessExpenses/approve',
  async ({ businessId, expenseId, notes }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/api/business/${businessId}/expenses/${expenseId}/approve`,
        { notes }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al aprobar gasto');
    }
  }
);

/**
 * Marcar gasto como pagado
 */
export const markExpenseAsPaid = createAsyncThunk(
  'businessExpenses/markAsPaid',
  async ({ businessId, expenseId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `/api/business/${businessId}/expenses/${expenseId}/mark-paid`,
        paymentData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al marcar como pagado');
    }
  }
);

/**
 * Obtener estadísticas de gastos
 */
export const fetchExpenseStats = createAsyncThunk(
  'businessExpenses/fetchStats',
  async ({ businessId, filters = {} }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);

      const response = await apiClient.get(`/api/business/${businessId}/expenses/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  expenses: [],
  categories: [],
  stats: {
    byStatus: [],
    byCategory: [],
    general: {
      totalExpenses: 0,
      totalAmount: 0,
      averageAmount: 0
    }
  },
  filters: {
    categoryId: null,
    status: null,
    vendor: null,
    startDate: null,
    endDate: null,
    isRecurring: null
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  loading: false,
  categoriesLoading: false,
  statsLoading: false,
  error: null,
  selectedExpense: null
};

const businessExpensesSlice = createSlice({
  name: 'businessExpenses',
  initialState,
  reducers: {
    setExpenseFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearExpenseFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedExpense: (state, action) => {
      state.selectedExpense = action.payload;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.stats = action.payload.stats || initialState.stats;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchExpenseCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchExpenseCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })

      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = [action.payload, ...state.expenses];
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.selectedExpense?.id === action.payload.id) {
          state.selectedExpense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
        if (state.selectedExpense?.id === action.payload) {
          state.selectedExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve Expense
      .addCase(approveExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })

      // Mark as Paid
      .addCase(markExpenseAsPaid.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })

      // Fetch Stats
      .addCase(fetchExpenseStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchExpenseStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  }
});

// ==================== ACTIONS & SELECTORS ====================

export const {
  setExpenseFilters,
  clearExpenseFilters,
  setSelectedExpense,
  clearSelectedExpense,
  clearExpenses
} = businessExpensesSlice.actions;

// Selectors
export const selectExpenses = (state) => state.businessExpenses.expenses;
export const selectExpenseCategories = (state) => state.businessExpenses.categories;
export const selectExpenseStats = (state) => state.businessExpenses.stats;
export const selectExpenseFilters = (state) => state.businessExpenses.filters;
export const selectExpensePagination = (state) => state.businessExpenses.pagination;
export const selectExpensesLoading = (state) => state.businessExpenses.loading;
export const selectCategoriesLoading = (state) => state.businessExpenses.categoriesLoading;
export const selectStatsLoading = (state) => state.businessExpenses.statsLoading;
export const selectExpenseError = (state) => state.businessExpenses.error;
export const selectSelectedExpense = (state) => state.businessExpenses.selectedExpense;

export default businessExpensesSlice.reducer;
