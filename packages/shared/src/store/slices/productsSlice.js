import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi } from '../../api/productsApi';

// AsyncThunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProductById(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await productsApi.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await productsApi.updateProduct(productId, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productsApi.deleteProduct(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsApi.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkInitialStock = createAsyncThunk(
  'products/bulkInitialStock',
  async (products, { rejectWithValue }) => {
    try {
      const response = await productsApi.bulkInitialStock(products);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductMovements = createAsyncThunk(
  'products/fetchProductMovements',
  async ({ productId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await productsApi.getProductMovements(productId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMovement = createAsyncThunk(
  'products/createMovement',
  async ({ productId, movementData }, { rejectWithValue }) => {
    try {
      const response = await productsApi.createMovement(productId, movementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  categories: [],
  movements: [],
  total: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  error: null,
  bulkStockResult: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearBulkStockResult: (state) => {
      state.bulkStockResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data?.products || action.payload.data || [];
        state.total = action.payload.data?.total || 0;
        state.page = action.payload.data?.page || 1;
        state.totalPages = action.payload.data?.totalPages || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.data;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.data);
        state.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.data.id);
        if (index !== -1) {
          state.products[index] = action.payload.data;
        }
        if (state.currentProduct?.id === action.payload.data.id) {
          state.currentProduct = action.payload.data;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // El producto puede estar eliminado o desactivado
        // Mejor volver a cargar la lista
        state.products = state.products.filter(p => p.id !== action.meta.arg);
        state.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Initial Stock
      .addCase(bulkInitialStock.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bulkStockResult = null;
      })
      .addCase(bulkInitialStock.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkStockResult = action.payload.data;
        // Actualizar productos en el estado si es necesario
        if (action.payload.data?.results) {
          action.payload.data.results.forEach(result => {
            const product = state.products.find(p => p.id === result.productId);
            if (product) {
              product.currentStock = result.newStock;
            }
          });
        }
      })
      .addCase(bulkInitialStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product Movements
      .addCase(fetchProductMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload.data || [];
      })
      .addCase(fetchProductMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Movement
      .addCase(createMovement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.movements.unshift(action.payload.data);
      })
      .addCase(createMovement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductsError, clearCurrentProduct, clearBulkStockResult } = productsSlice.actions;
export default productsSlice.reducer;
