import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getPublicServices,
  getPublicSpecialists,
  getPublicAvailability,
  createPublicBooking,
  uploadPaymentProof,
  getPaymentInfo
} from '../../api/publicBookingApi.js';

// Async thunk para obtener servicios públicos
export const fetchPublicServices = createAsyncThunk(
  'publicBooking/fetchServices',
  async (businessCode, { rejectWithValue }) => {
    try {
      const response = await getPublicServices(businessCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk para obtener especialistas públicos
export const fetchPublicSpecialists = createAsyncThunk(
  'publicBooking/fetchSpecialists',
  async ({ businessCode, serviceId }, { rejectWithValue }) => {
    try {
      const response = await getPublicSpecialists(businessCode, serviceId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk para obtener disponibilidad
export const fetchPublicAvailability = createAsyncThunk(
  'publicBooking/fetchAvailability',
  async ({ businessCode, params }, { rejectWithValue }) => {
    try {
      const response = await getPublicAvailability(businessCode, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk para crear reserva
export const createBooking = createAsyncThunk(
  'publicBooking/createBooking',
  async ({ businessCode, bookingData }, { rejectWithValue }) => {
    try {
      const response = await createPublicBooking(businessCode, bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk para subir comprobante de pago
export const uploadProof = createAsyncThunk(
  'publicBooking/uploadProof',
  async ({ businessCode, bookingCode, formData }, { rejectWithValue }) => {
    try {
      const response = await uploadPaymentProof(businessCode, bookingCode, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk para obtener información de pago
export const fetchPaymentInfo = createAsyncThunk(
  'publicBooking/fetchPaymentInfo',
  async ({ businessCode, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await getPaymentInfo(businessCode, paymentMethod);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  // Datos de servicios y especialistas
  services: [],
  specialists: [],

  // Disponibilidad
  availability: [],

  // Información de pago
  paymentInfo: null,

  // Estado del flujo de booking
  currentStep: 1,
  bookingData: {
    service: null,
    specialist: null,
    dateTime: null,
    client: null,
    paymentMethod: null
  },

  // Estado de la reserva actual
  currentBooking: null,
  bookingCode: null,

  // Información del negocio
  businessInfo: null,

  // Estados de carga
  isLoadingServices: false,
  isLoadingSpecialists: false,
  isLoadingAvailability: false,
  isCreatingBooking: false,
  isUploadingProof: false,
  isLoadingPaymentInfo: false,
  isLoadingBusinessInfo: false,

  // Errores
  servicesError: null,
  specialistsError: null,
  availabilityError: null,
  bookingError: null,
  uploadError: null,
  paymentInfoError: null,
  businessInfoError: null,

  // Éxito de operaciones
  uploadSuccess: false
};

const publicBookingSlice = createSlice({
  name: 'publicBooking',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.servicesError = null;
      state.specialistsError = null;
      state.availabilityError = null;
      state.bookingError = null;
      state.uploadError = null;
      state.paymentInfoError = null;
      state.businessInfoError = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.bookingCode = null;
    },
    clearUploadSuccess: (state) => {
      state.uploadSuccess = false;
    },
    // Reducers para el flujo de booking
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateBookingData: (state, action) => {
      state.bookingData = { ...state.bookingData, ...action.payload };
    },
    setBusinessInfo: (state, action) => {
      state.businessInfo = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
    },
    resetBookingFlow: (state) => {
      state.currentStep = 1;
      state.bookingData = {
        service: null,
        specialist: null,
        dateTime: null,
        client: null,
        paymentMethod: null
      };
      state.services = [];
      state.specialists = [];
      state.availability = [];
      state.paymentInfo = null;
      state.currentBooking = null;
      state.bookingCode = null;
      state.uploadSuccess = false;
      // Limpiar errores
      state.servicesError = null;
      state.specialistsError = null;
      state.availabilityError = null;
      state.bookingError = null;
      state.uploadError = null;
      state.paymentInfoError = null;
      state.businessInfoError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Services
    builder
      .addCase(fetchPublicServices.pending, (state) => {
        state.isLoadingServices = true;
        state.servicesError = null;
      })
      .addCase(fetchPublicServices.fulfilled, (state, action) => {
        state.isLoadingServices = false;
        state.services = action.payload;
      })
      .addCase(fetchPublicServices.rejected, (state, action) => {
        state.isLoadingServices = false;
        state.servicesError = action.payload;
      })

      // Fetch Specialists
      .addCase(fetchPublicSpecialists.pending, (state) => {
        state.isLoadingSpecialists = true;
        state.specialistsError = null;
      })
      .addCase(fetchPublicSpecialists.fulfilled, (state, action) => {
        state.isLoadingSpecialists = false;
        state.specialists = action.payload;
      })
      .addCase(fetchPublicSpecialists.rejected, (state, action) => {
        state.isLoadingSpecialists = false;
        state.specialistsError = action.payload;
      })

      // Fetch Availability
      .addCase(fetchPublicAvailability.pending, (state) => {
        state.isLoadingAvailability = true;
        state.availabilityError = null;
      })
      .addCase(fetchPublicAvailability.fulfilled, (state, action) => {
        state.isLoadingAvailability = false;
        state.availability = action.payload;
      })
      .addCase(fetchPublicAvailability.rejected, (state, action) => {
        state.isLoadingAvailability = false;
        state.availabilityError = action.payload;
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.isCreatingBooking = true;
        state.bookingError = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreatingBooking = false;
        state.currentBooking = action.payload.booking;
        state.bookingCode = action.payload.booking.code;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreatingBooking = false;
        state.bookingError = action.payload;
      })

      // Upload Proof
      .addCase(uploadProof.pending, (state) => {
        state.isUploadingProof = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadProof.fulfilled, (state, action) => {
        state.isUploadingProof = false;
        state.uploadSuccess = true;
        // Actualizar metadata de la reserva si existe
        if (state.currentBooking) {
          const currentMetadata = state.currentBooking.metadata || {};
          const paymentProofs = currentMetadata.paymentProofs || [];
          paymentProofs.push(action.payload);
          state.currentBooking.metadata = {
            ...currentMetadata,
            paymentProofs
          };
        }
      })
      .addCase(uploadProof.rejected, (state, action) => {
        state.isUploadingProof = false;
        state.uploadError = action.payload;
      })

      // Fetch Payment Info
      .addCase(fetchPaymentInfo.pending, (state) => {
        state.isLoadingPaymentInfo = true;
        state.paymentInfoError = null;
      })
      .addCase(fetchPaymentInfo.fulfilled, (state, action) => {
        state.isLoadingPaymentInfo = false;
        state.paymentInfo = action.payload;
      })
      .addCase(fetchPaymentInfo.rejected, (state, action) => {
        state.isLoadingPaymentInfo = false;
        state.paymentInfoError = action.payload;
      });
  }
});

export const {
  clearErrors,
  clearCurrentBooking,
  clearUploadSuccess,
  setCurrentStep,
  updateBookingData,
  setBusinessInfo,
  nextStep,
  prevStep,
  resetBookingFlow
} = publicBookingSlice.actions;

export default publicBookingSlice.reducer;