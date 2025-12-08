import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// AsyncThunk para crear suscripción
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscriptionData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear la suscripción')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para iniciar pago de suscripción con Wompi
export const initiateWompiPayment = createAsyncThunk(
  'subscription/initiateWompiPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/wompi/initiate-subscription-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar el pago')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para obtener configuración de Wompi (incluye clave pública)
export const getWompiConfig = createAsyncThunk(
  'subscription/getWompiConfig',
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/wompi/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener configuración de Wompi')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para iniciar pago de suscripción con Wompi
export const initiateWompiPayment = createAsyncThunk(
  'subscription/initiateWompiPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/wompi/initiate-subscription-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar el pago')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para obtener configuración de Wompi (incluye clave pública)
export const getWompiConfig = createAsyncThunk(
  'subscription/getWompiConfig',
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/wompi/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener configuración de Wompi')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    // Estado de creación de suscripción
    creating: false,
    createError: null,
    subscription: null,
    
    // Estado de pagos Wompi
    processingPayment: false,
    paymentError: null,
    paymentResult: null,
    
    // Configuración de Wompi
    wompiConfig: null,
    wompiConfigLoading: false,
    wompiConfigError: null,
    
    // Estado general
    success: false,
    redirectUrl: null
  },
  reducers: {
    clearSubscriptionState: (state) => {
      state.creating = false
      state.createError = null
      state.subscription = null
      state.success = false
      state.redirectUrl = null
    },
    clearPaymentState: (state) => {
      state.processingPayment = false
      state.paymentError = null
      state.paymentResult = null
    },
    setRedirectUrl: (state, action) => {
      state.redirectUrl = action.payload
    },
    resetSubscriptionFlow: (state) => {
      return {
        ...state,
        creating: false,
        createError: null,
        subscription: null,
        processingPayment: false,
        paymentError: null,
        paymentResult: null,
        success: false,
        redirectUrl: null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // createSubscription
      .addCase(createSubscription.pending, (state) => {
        state.creating = true
        state.createError = null
        state.success = false
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.creating = false
        state.subscription = action.payload
        state.success = true
        state.createError = null
        
        // Si hay URL de redirección en la respuesta
        if (action.payload.redirectUrl) {
          state.redirectUrl = action.payload.redirectUrl
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.creating = false
        state.createError = action.payload
        state.success = false
      })
      
      // processWompiPayment
      .addCase(processWompiPayment.pending, (state) => {
        state.processingPayment = true
        state.paymentError = null
      })
      .addCase(processWompiPayment.fulfilled, (state, action) => {
        state.processingPayment = false
        state.paymentResult = action.payload
        state.paymentError = null
      })
      .addCase(processWompiPayment.rejected, (state, action) => {
        state.processingPayment = false
        state.paymentError = action.payload
      })
      
      // generateWompiSignature
      .addCase(generateWompiSignature.pending, (state) => {
        state.processingPayment = true
        state.paymentError = null
      })
      .addCase(generateWompiSignature.fulfilled, (state, action) => {
        state.processingPayment = false
        state.paymentError = null
      })
      .addCase(generateWompiSignature.rejected, (state, action) => {
        state.processingPayment = false
        state.paymentError = action.payload
      })
      
      // getWompiPublicKey
      .addCase(getWompiPublicKey.pending, (state) => {
        state.wompiPublicKeyLoading = true
        state.wompiPublicKeyError = null
      })
      .addCase(getWompiPublicKey.fulfilled, (state, action) => {
        state.wompiPublicKeyLoading = false
        state.wompiPublicKey = action.payload
        state.wompiPublicKeyError = null
      })
      .addCase(getWompiPublicKey.rejected, (state, action) => {
        state.wompiPublicKeyLoading = false
        state.wompiPublicKeyError = action.payload
      })
  }
})

export const { 
  clearSubscriptionState, 
  clearPaymentState, 
  setRedirectUrl, 
  resetSubscriptionFlow 
} = subscriptionSlice.actions

export default subscriptionSlice.reducer