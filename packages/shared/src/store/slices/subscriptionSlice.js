import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// AsyncThunk para crear suscripción y business completo
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Usar el endpoint correcto para crear suscripciones
      const subscriptionPayload = {
        // Plan de suscripción
        planId: subscriptionData.planId,
        
        // Datos del business  
        businessData: {
          name: subscriptionData.businessData.name,
          businessCode: subscriptionData.businessData.businessCode,
          type: subscriptionData.businessData.type,
          phone: subscriptionData.businessData.phone,
          email: subscriptionData.businessData.email,
          address: subscriptionData.businessData.address,
          city: subscriptionData.businessData.city,
          country: subscriptionData.businessData.country,
          description: subscriptionData.businessData.description || ''
        },
        
        // Datos del usuario
        userData: {
          firstName: subscriptionData.userData.firstName,
          lastName: subscriptionData.userData.lastName,
          email: subscriptionData.userData.email,
          password: subscriptionData.userData.password
        },
        
        // Datos del pago
        paymentData: subscriptionData.paymentData,
        
        // Otros datos
        invitationToken: subscriptionData.invitationToken || null,
        acceptedTerms: subscriptionData.acceptedTerms || true
      }

      console.log('🚀 Enviando datos al endpoint /api/subscriptions/create:', subscriptionPayload)

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No se necesita Authorization - es endpoint público
        },
        body: JSON.stringify(subscriptionPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear la suscripción')
      }

      return result.data
    } catch (error) {
      console.error('❌ Error en createSubscription:', error)
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
  async (_, { rejectWithValue, getState }) => {
    try {
      // Verificar si ya tenemos la configuración en el estado
      const state = getState()
      if (state.subscription.wompiConfig) {
        console.log('⚡ Usando configuración Wompi desde cache')
        return state.subscription.wompiConfig
      }

      console.log('🌐 Obteniendo configuración Wompi desde API...')
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_BASE_URL}/api/wompi/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
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

// AsyncThunk para crear pago 3DS v2
export const create3DSPayment = createAsyncThunk(
  'subscription/create3DSPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Token de autenticación requerido para 3DS')
      }

      console.log('🔐 Iniciando pago 3DS v2:', paymentData)

      const response = await fetch(`${API_BASE_URL}/api/owner/payments/3ds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Error en transacción 3DS')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para consultar estado de transacción 3DS
export const check3DSTransactionStatus = createAsyncThunk(
  'subscription/check3DSTransactionStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Token de autenticación requerido')
      }

      const response = await fetch(`${API_BASE_URL}/api/owner/payments/3ds/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al consultar estado 3DS')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para obtener estadísticas de pagos 3DS
export const get3DSPaymentStats = createAsyncThunk(
  'subscription/get3DSPaymentStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Token de autenticación requerido')
      }

      const queryParams = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/api/owner/payments/3ds/stats${queryParams ? `?${queryParams}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener estadísticas 3DS')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para crear pago 3DS v2 público (registro)
export const createPublic3DSPayment = createAsyncThunk(
  'subscription/createPublic3DSPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/3ds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Sin Authorization - es endpoint público
        },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear pago 3DS público')
      }

      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para consultar estado de transacción 3DS v2 pública
export const checkPublic3DSTransactionStatus = createAsyncThunk(
  'subscription/checkPublic3DSTransactionStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/3ds/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // Sin Authorization - es endpoint público
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al consultar estado 3DS público')
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
    
    // Estado de pagos 3DS v2 (owners autenticados)
    processing3DS: false,
    threeds_error: null,
    threeds_result: null,
    transactionData: null,
    challengeIframe: null,
    threeds_stats: null,
    
    // Estado de pagos 3DS v2 públicos (registro)
    processingPublic3DS: false,
    public3DS_error: null,
    public3DS_result: null,
    publicTransactionData: null,
    
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
    clear3DSState: (state) => {
      state.processing3DS = false
      state.threeds_error = null
      state.threeds_result = null
      state.transactionData = null
      state.challengeIframe = null
    },
    setChallengeIframe: (state, action) => {
      state.challengeIframe = action.payload
    },
    setTransactionData: (state, action) => {
      state.transactionData = action.payload
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
      
      // initiateWompiPayment
      .addCase(initiateWompiPayment.pending, (state) => {
        state.processingPayment = true
        state.paymentError = null
      })
      .addCase(initiateWompiPayment.fulfilled, (state, action) => {
        state.processingPayment = false
        state.paymentResult = action.payload
        state.paymentError = null
      })
      .addCase(initiateWompiPayment.rejected, (state, action) => {
        state.processingPayment = false
        state.paymentError = action.payload
      })
      
      // getWompiConfig
      .addCase(getWompiConfig.pending, (state) => {
        state.wompiConfigLoading = true
        state.wompiConfigError = null
      })
      .addCase(getWompiConfig.fulfilled, (state, action) => {
        state.wompiConfigLoading = false
        state.wompiConfig = action.payload
        state.wompiConfigError = null
      })
      .addCase(getWompiConfig.rejected, (state, action) => {
        state.wompiConfigLoading = false
        state.wompiConfigError = action.payload
      })
      
      // create3DSPayment
      .addCase(create3DSPayment.pending, (state) => {
        state.processing3DS = true
        state.threeds_error = null
      })
      .addCase(create3DSPayment.fulfilled, (state, action) => {
        state.processing3DS = false
        state.threeds_result = action.payload
        state.transactionData = action.payload
        state.threeds_error = null
      })
      .addCase(create3DSPayment.rejected, (state, action) => {
        state.processing3DS = false
        state.threeds_error = action.payload
      })
      
      // check3DSTransactionStatus
      .addCase(check3DSTransactionStatus.pending, (state) => {
        state.processing3DS = true
      })
      .addCase(check3DSTransactionStatus.fulfilled, (state, action) => {
        state.processing3DS = false
        state.transactionData = { ...state.transactionData, ...action.payload }
      })
      .addCase(check3DSTransactionStatus.rejected, (state, action) => {
        state.processing3DS = false
        state.threeds_error = action.payload
      })
      
      // get3DSPaymentStats
      .addCase(get3DSPaymentStats.pending, (state) => {
        state.processing3DS = true
      })
      .addCase(get3DSPaymentStats.fulfilled, (state, action) => {
        state.processing3DS = false
        state.threeds_stats = action.payload
      })
      .addCase(get3DSPaymentStats.rejected, (state, action) => {
        state.processing3DS = false
        state.threeds_error = action.payload
      })

      // createPublic3DSPayment
      .addCase(createPublic3DSPayment.pending, (state) => {
        state.processingPublic3DS = true
        state.public3DS_error = null
      })
      .addCase(createPublic3DSPayment.fulfilled, (state, action) => {
        state.processingPublic3DS = false
        state.public3DS_result = action.payload
        state.publicTransactionData = action.payload.transaction
      })
      .addCase(createPublic3DSPayment.rejected, (state, action) => {
        state.processingPublic3DS = false
        state.public3DS_error = action.payload
      })

      // checkPublic3DSTransactionStatus
      .addCase(checkPublic3DSTransactionStatus.pending, (state) => {
        state.processingPublic3DS = true
      })
      .addCase(checkPublic3DSTransactionStatus.fulfilled, (state, action) => {
        state.processingPublic3DS = false
        state.public3DS_result = action.payload
        if (action.payload.transaction) {
          state.publicTransactionData = action.payload.transaction
        }
      })
      .addCase(checkPublic3DSTransactionStatus.rejected, (state, action) => {
        state.processingPublic3DS = false
        state.public3DS_error = action.payload
      })
  }
})

export const { 
  clearSubscriptionState, 
  clearPaymentState, 
  clear3DSState,
  setChallengeIframe,
  setTransactionData,
  setRedirectUrl, 
  resetSubscriptionFlow 
} = subscriptionSlice.actions

export default subscriptionSlice.reducer