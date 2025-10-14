import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

/**
 * @slice consentSlice
 * @description Redux slice para gestión de plantillas y firmas de consentimiento
 * @feature FM-26
 */

// =====================================================
// THUNKS - Acciones Asíncronas
// =====================================================

/**
 * Listar plantillas de consentimiento
 * GET /api/business/:businessId/consent-templates
 */
export const fetchConsentTemplates = createAsyncThunk(
  'consent/fetchTemplates',
  async ({ businessId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/consent-templates`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener plantillas de consentimiento'
      );
    }
  }
);

/**
 * Obtener una plantilla específica
 * GET /api/business/:businessId/consent-templates/:templateId
 */
export const fetchConsentTemplate = createAsyncThunk(
  'consent/fetchTemplate',
  async ({ businessId, templateId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/consent-templates/${templateId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener plantilla'
      );
    }
  }
);

/**
 * Crear plantilla de consentimiento
 * POST /api/business/:businessId/consent-templates
 */
export const createConsentTemplate = createAsyncThunk(
  'consent/createTemplate',
  async ({ businessId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/consent-templates`,
        data
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear plantilla'
      );
    }
  }
);

/**
 * Actualizar plantilla de consentimiento
 * PUT /api/business/:businessId/consent-templates/:templateId
 */
export const updateConsentTemplate = createAsyncThunk(
  'consent/updateTemplate',
  async ({ businessId, templateId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        `/business/${businessId}/consent-templates/${templateId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar plantilla'
      );
    }
  }
);

/**
 * Eliminar (desactivar) plantilla de consentimiento
 * DELETE /api/business/:businessId/consent-templates/:templateId
 */
export const deleteConsentTemplate = createAsyncThunk(
  'consent/deleteTemplate',
  async ({ businessId, templateId, hardDelete = false }, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        `/business/${businessId}/consent-templates/${templateId}`,
        { params: { hardDelete } }
      );
      return templateId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar plantilla'
      );
    }
  }
);

/**
 * Firmar consentimiento
 * POST /api/business/:businessId/consent-signatures
 */
export const signConsent = createAsyncThunk(
  'consent/signConsent',
  async ({ businessId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/consent-signatures`,
        data
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al firmar consentimiento'
      );
    }
  }
);

/**
 * Obtener firmas de un cliente
 * GET /api/business/:businessId/consent-signatures/customer/:customerId
 */
export const fetchCustomerSignatures = createAsyncThunk(
  'consent/fetchCustomerSignatures',
  async ({ businessId, customerId, status }, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(
        `/business/${businessId}/consent-signatures/customer/${customerId}`,
        { params }
      );
      return { customerId, signatures: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener firmas del cliente'
      );
    }
  }
);

/**
 * Obtener una firma específica
 * GET /api/business/:businessId/consent-signatures/:signatureId
 */
export const fetchSignature = createAsyncThunk(
  'consent/fetchSignature',
  async ({ businessId, signatureId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/consent-signatures/${signatureId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener firma'
      );
    }
  }
);

/**
 * Revocar una firma
 * POST /api/business/:businessId/consent-signatures/:signatureId/revoke
 */
export const revokeSignature = createAsyncThunk(
  'consent/revokeSignature',
  async ({ businessId, signatureId, reason, revokedBy }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/business/${businessId}/consent-signatures/${signatureId}/revoke`,
        { reason, revokedBy }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al revocar firma'
      );
    }
  }
);

/**
 * Generar/obtener PDF de firma
 * GET /api/business/:businessId/consent-signatures/:signatureId/pdf
 */
export const getSignaturePDF = createAsyncThunk(
  'consent/getSignaturePDF',
  async ({ businessId, signatureId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `/business/${businessId}/consent-signatures/${signatureId}/pdf`,
        { responseType: 'blob' } // Para descargar archivos
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener PDF'
      );
    }
  }
);

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  // Plantillas
  templates: [],
  templatesLoading: false,
  templatesError: null,

  // Plantilla seleccionada
  selectedTemplate: null,
  selectedTemplateLoading: false,
  selectedTemplateError: null,

  // Firmas por cliente
  customerSignatures: {}, // { customerId: [signatures] }
  customerSignaturesLoading: {},
  customerSignaturesError: {},

  // Firma seleccionada
  selectedSignature: null,
  selectedSignatureLoading: false,
  selectedSignatureError: null,

  // Proceso de firma
  signingLoading: false,
  signingError: null,
  lastSignedConsent: null,

  // PDF
  pdfLoading: false,
  pdfError: null,

  // UI State
  filters: {
    category: null,
    activeOnly: true,
    search: '',
  },
  lastUpdated: null,
};

// =====================================================
// SLICE
// =====================================================

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    // Actualizar filtros
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Limpiar plantilla seleccionada
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
      state.selectedTemplateError = null;
    },

    // Limpiar firma seleccionada
    clearSelectedSignature: (state) => {
      state.selectedSignature = null;
      state.selectedSignatureError = null;
    },

    // Limpiar último consentimiento firmado
    clearLastSignedConsent: (state) => {
      state.lastSignedConsent = null;
      state.signingError = null;
    },

    // Limpiar errores
    clearTemplatesError: (state) => {
      state.templatesError = null;
    },

    clearSigningError: (state) => {
      state.signingError = null;
    },

    clearPdfError: (state) => {
      state.pdfError = null;
    },

    // Reset completo
    resetConsentState: () => initialState,
  },

  extraReducers: (builder) => {
    // ============ FETCH TEMPLATES ============
    builder
      .addCase(fetchConsentTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(fetchConsentTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchConsentTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload;
      });

    // ============ FETCH TEMPLATE ============
    builder
      .addCase(fetchConsentTemplate.pending, (state) => {
        state.selectedTemplateLoading = true;
        state.selectedTemplateError = null;
      })
      .addCase(fetchConsentTemplate.fulfilled, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchConsentTemplate.rejected, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplateError = action.payload;
      });

    // ============ CREATE TEMPLATE ============
    builder
      .addCase(createConsentTemplate.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(createConsentTemplate.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates.unshift(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createConsentTemplate.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload;
      });

    // ============ UPDATE TEMPLATE ============
    builder
      .addCase(updateConsentTemplate.pending, (state) => {
        state.selectedTemplateLoading = true;
        state.selectedTemplateError = null;
      })
      .addCase(updateConsentTemplate.fulfilled, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplate = action.payload;
        
        // Actualizar en la lista
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateConsentTemplate.rejected, (state, action) => {
        state.selectedTemplateLoading = false;
        state.selectedTemplateError = action.payload;
      });

    // ============ DELETE TEMPLATE ============
    builder
      .addCase(deleteConsentTemplate.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(deleteConsentTemplate.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = state.templates.filter(t => t.id !== action.payload);
        if (state.selectedTemplate?.id === action.payload) {
          state.selectedTemplate = null;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteConsentTemplate.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload;
      });

    // ============ SIGN CONSENT ============
    builder
      .addCase(signConsent.pending, (state) => {
        state.signingLoading = true;
        state.signingError = null;
      })
      .addCase(signConsent.fulfilled, (state, action) => {
        state.signingLoading = false;
        state.lastSignedConsent = action.payload;
        
        // Agregar a firmas del cliente si están cargadas
        const customerId = action.payload.customerId;
        if (state.customerSignatures[customerId]) {
          state.customerSignatures[customerId].unshift(action.payload);
        }
      })
      .addCase(signConsent.rejected, (state, action) => {
        state.signingLoading = false;
        state.signingError = action.payload;
      });

    // ============ FETCH CUSTOMER SIGNATURES ============
    builder
      .addCase(fetchCustomerSignatures.pending, (state, action) => {
        const { customerId } = action.meta.arg;
        state.customerSignaturesLoading[customerId] = true;
        delete state.customerSignaturesError[customerId];
      })
      .addCase(fetchCustomerSignatures.fulfilled, (state, action) => {
        const { customerId, signatures } = action.payload;
        state.customerSignaturesLoading[customerId] = false;
        state.customerSignatures[customerId] = signatures;
      })
      .addCase(fetchCustomerSignatures.rejected, (state, action) => {
        const { customerId } = action.meta.arg;
        state.customerSignaturesLoading[customerId] = false;
        state.customerSignaturesError[customerId] = action.payload;
      });

    // ============ FETCH SIGNATURE ============
    builder
      .addCase(fetchSignature.pending, (state) => {
        state.selectedSignatureLoading = true;
        state.selectedSignatureError = null;
      })
      .addCase(fetchSignature.fulfilled, (state, action) => {
        state.selectedSignatureLoading = false;
        state.selectedSignature = action.payload;
      })
      .addCase(fetchSignature.rejected, (state, action) => {
        state.selectedSignatureLoading = false;
        state.selectedSignatureError = action.payload;
      });

    // ============ REVOKE SIGNATURE ============
    builder
      .addCase(revokeSignature.pending, (state) => {
        state.selectedSignatureLoading = true;
        state.selectedSignatureError = null;
      })
      .addCase(revokeSignature.fulfilled, (state, action) => {
        state.selectedSignatureLoading = false;
        state.selectedSignature = action.payload;
        
        // Actualizar en las firmas del cliente si están cargadas
        const customerId = action.payload.customerId;
        if (state.customerSignatures[customerId]) {
          const index = state.customerSignatures[customerId].findIndex(
            s => s.id === action.payload.id
          );
          if (index !== -1) {
            state.customerSignatures[customerId][index] = action.payload;
          }
        }
      })
      .addCase(revokeSignature.rejected, (state, action) => {
        state.selectedSignatureLoading = false;
        state.selectedSignatureError = action.payload;
      });

    // ============ GET SIGNATURE PDF ============
    builder
      .addCase(getSignaturePDF.pending, (state) => {
        state.pdfLoading = true;
        state.pdfError = null;
      })
      .addCase(getSignaturePDF.fulfilled, (state) => {
        state.pdfLoading = false;
      })
      .addCase(getSignaturePDF.rejected, (state, action) => {
        state.pdfLoading = false;
        state.pdfError = action.payload;
      });
  },
});

// =====================================================
// ACTIONS
// =====================================================

export const {
  setFilters,
  clearSelectedTemplate,
  clearSelectedSignature,
  clearLastSignedConsent,
  clearTemplatesError,
  clearSigningError,
  clearPdfError,
  resetConsentState,
} = consentSlice.actions;

// =====================================================
// SELECTORS
// =====================================================

// Templates Selectors
export const selectConsentTemplates = (state) => state.consent.templates;
export const selectTemplatesLoading = (state) => state.consent.templatesLoading;
export const selectTemplatesError = (state) => state.consent.templatesError;

export const selectSelectedTemplate = (state) => state.consent.selectedTemplate;
export const selectSelectedTemplateLoading = (state) => state.consent.selectedTemplateLoading;
export const selectSelectedTemplateError = (state) => state.consent.selectedTemplateError;

// Filters
export const selectConsentFilters = (state) => state.consent.filters;

// Filtered templates (memoized)
export const selectFilteredTemplates = (state) => {
  const { templates, filters } = state.consent;
  
  return templates.filter(template => {
    // Filter by category
    if (filters.category && template.category !== filters.category) {
      return false;
    }
    
    // Filter by active status
    if (filters.activeOnly && !template.isActive) {
      return false;
    }
    
    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        template.name.toLowerCase().includes(search) ||
        template.code.toLowerCase().includes(search)
      );
    }
    
    return true;
  });
};

// Signatures Selectors
export const selectCustomerSignatures = (customerId) => (state) =>
  state.consent.customerSignatures[customerId] || [];

export const selectCustomerSignaturesLoading = (customerId) => (state) =>
  state.consent.customerSignaturesLoading[customerId] || false;

export const selectCustomerSignaturesError = (customerId) => (state) =>
  state.consent.customerSignaturesError[customerId] || null;

export const selectSelectedSignature = (state) => state.consent.selectedSignature;
export const selectSelectedSignatureLoading = (state) => state.consent.selectedSignatureLoading;
export const selectSelectedSignatureError = (state) => state.consent.selectedSignatureError;

// Signing Process Selectors
export const selectSigningLoading = (state) => state.consent.signingLoading;
export const selectSigningError = (state) => state.consent.signingError;
export const selectLastSignedConsent = (state) => state.consent.lastSignedConsent;

// PDF Selectors
export const selectPdfLoading = (state) => state.consent.pdfLoading;
export const selectPdfError = (state) => state.consent.pdfError;

// Utility Selectors
export const selectConsentLastUpdated = (state) => state.consent.lastUpdated;

// Templates by category
export const selectTemplatesByCategory = (category) => (state) =>
  state.consent.templates.filter(t => t.category === category && t.isActive);

// Active signatures count for customer
export const selectActiveSignaturesCount = (customerId) => (state) => {
  const signatures = state.consent.customerSignatures[customerId] || [];
  return signatures.filter(s => s.status === 'ACTIVE').length;
};

// =====================================================
// REDUCER
// =====================================================

export default consentSlice.reducer;
