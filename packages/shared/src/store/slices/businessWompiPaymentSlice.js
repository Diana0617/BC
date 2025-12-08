/**
 * businessWompiPaymentSlice.js
 * 
 * Redux slice para la gestión de configuración de pagos Wompi de cada Business.
 * 
 * IMPORTANTE: Este slice es COMPLETAMENTE SEPARADO del sistema de suscripciones
 * de Beauty Control. Maneja la configuración de Wompi para que cada negocio
 * reciba pagos de turnos online de sus clientes.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as businessWompiPaymentApi from '../../api/businessWompiPaymentApi'

// Estado inicial
const initialState = {
  config: null,
  loading: false,
  saving: false,
  verifying: false,
  error: null,
  verificationResult: null,
  lastAction: null
}

// ==================== THUNKS ====================

/**
 * Obtener configuración de Wompi del negocio
 */
export const fetchWompiConfig = createAsyncThunk(
  'businessWompiPayment/fetchConfig',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await businessWompiPaymentApi.getWompiConfig(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cargar la configuración de Wompi'
      )
    }
  }
)

/**
 * Guardar configuración de Wompi
 */
export const saveWompiConfig = createAsyncThunk(
  'businessWompiPayment/saveConfig',
  async ({ businessId, configData }, { rejectWithValue }) => {
    try {
      const response = await businessWompiPaymentApi.saveWompiConfig(businessId, configData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al guardar la configuración de Wompi'
      )
    }
  }
)

/**
 * Verificar credenciales de Wompi
 */
export const verifyWompiCredentials = createAsyncThunk(
  'businessWompiPayment/verifyCredentials',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await businessWompiPaymentApi.verifyWompiCredentials(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al verificar las credenciales de Wompi'
      )
    }
  }
)

/**
 * Cambiar modo (test/producción)
 */
export const toggleWompiMode = createAsyncThunk(
  'businessWompiPayment/toggleMode',
  async ({ businessId, isTestMode }, { rejectWithValue }) => {
    try {
      const response = await businessWompiPaymentApi.toggleWompiMode(businessId, isTestMode)
      return { isTestMode, ...response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cambiar el modo de Wompi'
      )
    }
  }
)

/**
 * Activar/desactivar configuración
 */
export const toggleWompiStatus = createAsyncThunk(
  'businessWompiPayment/toggleStatus',
  async ({ businessId, isActive }, { rejectWithValue }) => {
    try {
      const response = await businessWompiPaymentApi.toggleWompiStatus(businessId, isActive)
      return { isActive, ...response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Error al cambiar el estado de Wompi'
      )
    }
  }
)

// ==================== SLICE ====================

const businessWompiPaymentSlice = createSlice({
  name: 'businessWompiPayment',
  initialState,
  reducers: {
    // Limpiar error
    clearError: (state) => {
      state.error = null
    },
    // Limpiar resultado de verificación
    clearVerificationResult: (state) => {
      state.verificationResult = null
    },
    // Reset completo del state
    resetWompiConfig: () => initialState
  },
  extraReducers: (builder) => {
    // ==================== FETCH CONFIG ====================
    builder
      .addCase(fetchWompiConfig.pending, (state) => {
        state.loading = true
        state.error = null
        state.lastAction = 'fetch'
      })
      .addCase(fetchWompiConfig.fulfilled, (state, action) => {
        state.loading = false
        state.config = action.payload
        state.error = null
      })
      .addCase(fetchWompiConfig.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ==================== SAVE CONFIG ====================
    builder
      .addCase(saveWompiConfig.pending, (state) => {
        state.saving = true
        state.error = null
        state.lastAction = 'save'
      })
      .addCase(saveWompiConfig.fulfilled, (state, action) => {
        state.saving = false
        state.error = null
        // Actualizar config con los nuevos datos
        if (state.config) {
          state.config = {
            ...state.config,
            exists: true,
            webhookUrl: action.payload.webhookUrl,
            verificationStatus: action.payload.verificationStatus
          }
        }
      })
      .addCase(saveWompiConfig.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

    // ==================== VERIFY CREDENTIALS ====================
    builder
      .addCase(verifyWompiCredentials.pending, (state) => {
        state.verifying = true
        state.error = null
        state.verificationResult = null
        state.lastAction = 'verify'
      })
      .addCase(verifyWompiCredentials.fulfilled, (state, action) => {
        state.verifying = false
        state.verificationResult = {
          success: true,
          verified: action.payload.verified,
          mode: action.payload.mode,
          message: action.payload.message
        }
        // Actualizar estado de verificación en config
        if (state.config) {
          state.config.verificationStatus = 'verified'
          state.config.lastVerifiedAt = new Date().toISOString()
        }
      })
      .addCase(verifyWompiCredentials.rejected, (state, action) => {
        state.verifying = false
        state.verificationResult = {
          success: false,
          verified: false,
          error: action.payload
        }
        // Actualizar estado de verificación en config
        if (state.config) {
          state.config.verificationStatus = 'failed'
          state.config.verificationError = action.payload
        }
      })

    // ==================== TOGGLE MODE ====================
    builder
      .addCase(toggleWompiMode.pending, (state) => {
        state.saving = true
        state.error = null
        state.lastAction = 'toggleMode'
      })
      .addCase(toggleWompiMode.fulfilled, (state, action) => {
        state.saving = false
        // Actualizar modo en config
        if (state.config) {
          state.config.isTestMode = action.payload.isTestMode
          state.config.verificationStatus = 'pending' // Reset verification al cambiar modo
        }
      })
      .addCase(toggleWompiMode.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })

    // ==================== TOGGLE STATUS ====================
    builder
      .addCase(toggleWompiStatus.pending, (state) => {
        state.saving = true
        state.error = null
        state.lastAction = 'toggleStatus'
      })
      .addCase(toggleWompiStatus.fulfilled, (state, action) => {
        state.saving = false
        // Actualizar estado activo en config
        if (state.config) {
          state.config.isActive = action.payload.isActive
        }
      })
      .addCase(toggleWompiStatus.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
  }
})

// ==================== EXPORTS ====================

export const { clearError, clearVerificationResult, resetWompiConfig } = businessWompiPaymentSlice.actions

// Selectores
export const selectWompiConfig = (state) => state.businessWompiPayment?.config
export const selectWompiLoading = (state) => state.businessWompiPayment?.loading
export const selectWompiSaving = (state) => state.businessWompiPayment?.saving
export const selectWompiVerifying = (state) => state.businessWompiPayment?.verifying
export const selectWompiError = (state) => state.businessWompiPayment?.error
export const selectWompiVerificationResult = (state) => state.businessWompiPayment?.verificationResult
export const selectWompiLastAction = (state) => state.businessWompiPayment?.lastAction

// Selector para saber si la configuración existe
export const selectWompiConfigExists = (state) => state.businessWompiPayment?.config?.exists || false

// Selector para saber si está en modo test
export const selectWompiIsTestMode = (state) => state.businessWompiPayment?.config?.isTestMode ?? true

// Selector para saber si está activo
export const selectWompiIsActive = (state) => state.businessWompiPayment?.config?.isActive || false

// Selector para estado de verificación
export const selectWompiVerificationStatus = (state) => state.businessWompiPayment?.config?.verificationStatus || 'pending'

// Selector para saber si tiene credenciales de test
export const selectWompiHasTestCredentials = (state) => state.businessWompiPayment?.config?.hasTestCredentials || false

// Selector para saber si tiene credenciales de producción
export const selectWompiHasProdCredentials = (state) => state.businessWompiPayment?.config?.hasProdCredentials || false

// Selector para saber si está listo para pagos
export const selectWompiIsReadyForPayments = (state) => {
  const config = state.businessWompiPayment?.config
  if (!config || !config.exists) return false
  
  const hasActiveCredentials = config.isTestMode 
    ? config.hasTestCredentials 
    : config.hasProdCredentials
  
  return hasActiveCredentials && 
         config.verificationStatus === 'verified' && 
         config.isActive
}

export default businessWompiPaymentSlice.reducer
