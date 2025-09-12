import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ownerApi } from '../../api/ownerApi';

// AsyncThunks
export const createSubscription = createAsyncThunk(
  'ownerSubscriptions/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.createSubscription(subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'ownerSubscriptions/cancelSubscription',
  async ({ subscriptionId, reason }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.cancelSubscription(subscriptionId, { reason });
      return { subscriptionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  creating: false,
  cancelling: false,
  createError: null,
  cancelError: null,
  lastCreatedSubscription: null,
  lastCancelledSubscription: null
};

const ownerSubscriptionsSlice = createSlice({
  name: 'ownerSubscriptions',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.createError = null;
      state.cancelError = null;
    },
    clearLastActions: (state) => {
      state.lastCreatedSubscription = null;
      state.lastCancelledSubscription = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.creating = false;
        state.lastCreatedSubscription = action.payload.data;
        state.createError = null;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      })

      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.cancelling = true;
        state.cancelError = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.cancelling = false;
        state.lastCancelledSubscription = action.payload;
        state.cancelError = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.cancelling = false;
        state.cancelError = action.payload;
      });
  }
});

export const { clearErrors, clearLastActions } = ownerSubscriptionsSlice.actions;

// Selectors
export const selectSubscriptionsCreating = (state) => state.ownerSubscriptions.creating;
export const selectSubscriptionsCancelling = (state) => state.ownerSubscriptions.cancelling;
export const selectSubscriptionsCreateError = (state) => state.ownerSubscriptions.createError;
export const selectSubscriptionsCancelError = (state) => state.ownerSubscriptions.cancelError;
export const selectLastCreatedSubscription = (state) => state.ownerSubscriptions.lastCreatedSubscription;
export const selectLastCancelledSubscription = (state) => state.ownerSubscriptions.lastCancelledSubscription;

export default ownerSubscriptionsSlice.reducer;