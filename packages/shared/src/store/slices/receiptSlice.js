import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

/**
 * Receipt Redux Slice
 * Gestión de recibos en PDF para clientes
 */

// ==================== ASYNC THUNKS ====================

/**
 * Generar recibo PDF para una cita
 */
export const generateReceiptPDF = createAsyncThunk(
  'receipt/generatePDF',
  async ({ appointmentId, businessId }, { rejectWithValue }) => {
    try {
      // Para PDFs, necesitamos hacer fetch directo con blob response
      const token = await apiClient.getAuthToken();
      const url = `${apiClient.baseURL}/api/cash-register/generate-receipt-pdf/${appointmentId}?businessId=${businessId}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al generar recibo PDF');
      }
      
      // Extraer nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `recibo-${Date.now()}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      
      return {
        blob,
        filename,
        appointmentId
      };
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al generar recibo PDF' });
    }
  }
);

/**
 * Obtener datos del recibo (para envío por WhatsApp)
 */
export const getReceiptData = createAsyncThunk(
  'receipt/getData',
  async ({ appointmentId, businessId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/api/cash-register/receipt-data/${appointmentId}`,
        { businessId }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al obtener datos del recibo' });
    }
  }
);

/**
 * Marcar recibo como enviado
 */
export const markReceiptSent = createAsyncThunk(
  'receipt/markSent',
  async ({ receiptId, method }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/api/cash-register/mark-receipt-sent/${receiptId}`,
        { method } // 'whatsapp' o 'email'
      );
      return {
        receiptId,
        method,
        ...response.data.data
      };
    } catch (error) {
      return rejectWithValue({ error: error.message || 'Error al marcar recibo como enviado' });
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Recibos por appointmentId
  receipts: {},
  
  // PDF generado (blob) temporal
  generatedPDF: null,
  generatedPDFFilename: null,
  
  // Datos del recibo actual para WhatsApp
  currentReceiptData: null,
  
  // Estados de carga
  loading: {
    generatingPDF: false,
    fetchingData: false,
    markingSent: false
  },
  
  // Errores
  error: null
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    // Limpiar PDF generado
    clearGeneratedPDF: (state) => {
      state.generatedPDF = null;
      state.generatedPDFFilename = null;
    },
    
    // Limpiar datos del recibo actual
    clearCurrentReceiptData: (state) => {
      state.currentReceiptData = null;
    },
    
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Agregar recibo local (para tracking)
    addReceipt: (state, action) => {
      const { appointmentId, receipt } = action.payload;
      state.receipts[appointmentId] = receipt;
    },
    
    // Reset completo
    resetReceipts: () => initialState
  },
  extraReducers: (builder) => {
    // ========== GENERATE RECEIPT PDF ==========
    builder
      .addCase(generateReceiptPDF.pending, (state) => {
        state.loading.generatingPDF = true;
        state.error = null;
      })
      .addCase(generateReceiptPDF.fulfilled, (state, action) => {
        state.loading.generatingPDF = false;
        state.generatedPDF = action.payload.blob;
        state.generatedPDFFilename = action.payload.filename;
        
        // Marcar que este appointmentId tiene recibo generado
        if (!state.receipts[action.payload.appointmentId]) {
          state.receipts[action.payload.appointmentId] = {
            generated: true,
            generatedAt: new Date().toISOString(),
            sentViaWhatsApp: false,
            sentViaEmail: false
          };
        }
      })
      .addCase(generateReceiptPDF.rejected, (state, action) => {
        state.loading.generatingPDF = false;
        state.error = action.payload?.error || 'Error al generar PDF';
      });

    // ========== GET RECEIPT DATA ==========
    builder
      .addCase(getReceiptData.pending, (state) => {
        state.loading.fetchingData = true;
        state.error = null;
      })
      .addCase(getReceiptData.fulfilled, (state, action) => {
        state.loading.fetchingData = false;
        state.currentReceiptData = action.payload;
        
        // Actualizar receipts con los datos completos
        const appointmentId = action.payload.receipt?.appointmentId;
        if (appointmentId) {
          state.receipts[appointmentId] = {
            ...state.receipts[appointmentId],
            ...action.payload.receipt
          };
        }
      })
      .addCase(getReceiptData.rejected, (state, action) => {
        state.loading.fetchingData = false;
        state.error = action.payload?.error || 'Error al obtener datos del recibo';
      });

    // ========== MARK RECEIPT SENT ==========
    builder
      .addCase(markReceiptSent.pending, (state) => {
        state.loading.markingSent = true;
        state.error = null;
      })
      .addCase(markReceiptSent.fulfilled, (state, action) => {
        state.loading.markingSent = false;
        
        const { receiptId, method, sentViaWhatsApp, sentViaEmail } = action.payload;
        
        // Actualizar el recibo correspondiente
        const appointmentId = Object.keys(state.receipts).find(
          key => state.receipts[key].id === receiptId
        );
        
        if (appointmentId && state.receipts[appointmentId]) {
          state.receipts[appointmentId] = {
            ...state.receipts[appointmentId],
            sentViaWhatsApp,
            sentViaEmail,
            lastSentMethod: method,
            lastSentAt: new Date().toISOString()
          };
        }
        
        // Actualizar currentReceiptData si existe
        if (state.currentReceiptData?.receipt?.id === receiptId) {
          state.currentReceiptData.receipt.sentViaWhatsApp = sentViaWhatsApp;
          state.currentReceiptData.receipt.sentViaEmail = sentViaEmail;
        }
      })
      .addCase(markReceiptSent.rejected, (state, action) => {
        state.loading.markingSent = false;
        state.error = action.payload?.error || 'Error al marcar recibo como enviado';
      });
  }
});

// ==================== EXPORTS ====================

export const {
  clearGeneratedPDF,
  clearCurrentReceiptData,
  clearError,
  addReceipt,
  resetReceipts
} = receiptSlice.actions;

export default receiptSlice.reducer;

// ==================== SELECTORS ====================

export const selectGeneratedPDF = (state) => state.receipt.generatedPDF;
export const selectGeneratedPDFFilename = (state) => state.receipt.generatedPDFFilename;
export const selectCurrentReceiptData = (state) => state.receipt.currentReceiptData;
export const selectReceiptByAppointmentId = (appointmentId) => (state) => 
  state.receipt.receipts[appointmentId] || null;
export const selectAllReceipts = (state) => state.receipt.receipts;
export const selectReceiptLoading = (state) => state.receipt.loading;
export const selectReceiptError = (state) => state.receipt.error;

// Selector para verificar si un recibo fue enviado
export const selectReceiptSentStatus = (appointmentId) => (state) => {
  const receipt = state.receipt.receipts[appointmentId];
  if (!receipt) return { sentViaWhatsApp: false, sentViaEmail: false };
  return {
    sentViaWhatsApp: receipt.sentViaWhatsApp || false,
    sentViaEmail: receipt.sentViaEmail || false
  };
};
