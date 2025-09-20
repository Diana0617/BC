/**
 * Hook personalizado para manejar pagos 3D Secure v2 con Wompi
 * Proporciona funciones y estado para integrar 3DS en componentes
 * Soporta tanto flujo autenticado (owners) como público (registro)
 */

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { 
  create3DSPayment, 
  check3DSTransactionStatus, 
  get3DSPaymentStats,
  createPublic3DSPayment,
  checkPublic3DSTransactionStatus,
  getWompiConfig,
  clear3DSState,
  setChallengeIframe,
  setTransactionData 
} from '../store/slices/subscriptionSlice'

export const use3DSPayments = () => {
  const dispatch = useDispatch()
  
  // Selectores de estado - 3DS autenticado (owners)
  const {
    processing3DS,
    threeds_error,
    threeds_result,
    transactionData,
    challengeIframe,
    threeds_stats,
    wompiConfig,
    wompiConfigLoading,
    wompiConfigError,
    // 3DS público (registro)
    processingPublic3DS,
    public3DS_error,
    public3DS_result,
    publicTransactionData
  } = useSelector(state => state.subscription)

  // Cargar configuración Wompi
  const loadWompiConfig = useCallback(async () => {
    try {
      if (!wompiConfig && !wompiConfigLoading) {
        await dispatch(getWompiConfig()).unwrap()
      }
      return wompiConfig
    } catch (error) {
      throw error
    }
  }, [dispatch, wompiConfig, wompiConfigLoading])

  // Función para obtener información del navegador (formato Wompi)
  const getBrowserInfo = useCallback(() => {
    return {
      browser_color_depth: (screen.colorDepth || 24).toString(),
      browser_screen_height: (screen.height || 1080).toString(),
      browser_screen_width: (screen.width || 1920).toString(),
      browser_language: navigator.language || 'es-CO',
      browser_user_agent: navigator.userAgent,
      browser_tz: new Date().getTimezoneOffset().toString()
    }
  }, [])

  // Crear pago 3DS v2
  const createPayment = useCallback(async (paymentData) => {
    try {
      const browserInfo = getBrowserInfo()
      
      const payload = {
        ...paymentData,
        browserInfo
      }
      
      const result = await dispatch(create3DSPayment(payload)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch, getBrowserInfo])

  // Consultar estado de transacción
  const checkTransactionStatus = useCallback(async (transactionId) => {
    try {
      const result = await dispatch(check3DSTransactionStatus(transactionId)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch])

  // Obtener estadísticas
  const getPaymentStats = useCallback(async (params = {}) => {
    try {
      const result = await dispatch(get3DSPaymentStats(params)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch])

  // Manejar challenge iframe
  const setChallengeData = useCallback((iframeData) => {
    dispatch(setChallengeIframe(iframeData))
  }, [dispatch])

  // Establecer datos de transacción
  const setTransaction = useCallback((data) => {
    dispatch(setTransactionData(data))
  }, [dispatch])

  // Limpiar estado 3DS
  const clearState = useCallback(() => {
    dispatch(clear3DSState())
  }, [dispatch])

  // Procesar challenge 3DS
  const processChallenge = useCallback(async (transactionId, methodData) => {
    try {
      // Decodificar el iframe del challenge
      const decodedHtml = atob(methodData)
      
      // Crear iframe para el challenge
      const iframe = document.createElement('iframe')
      iframe.style.width = '100%'
      iframe.style.height = '400px'
      iframe.style.border = 'none'
      iframe.srcdoc = decodedHtml
      
      // Guardar datos del challenge
      setChallengeData(methodData)
      
      // Mostrar el iframe en el contenedor designado
      const challengeContainer = document.getElementById('challenge-container')
      if (challengeContainer) {
        challengeContainer.innerHTML = ''
        challengeContainer.appendChild(iframe)
      }
      
      return { iframe, challengeContainer }
    } catch (error) {
      throw new Error(`Error procesando challenge 3DS: ${error.message}`)
    }
  }, [setChallengeData])

  // Polling del estado de transacción
  const pollTransactionStatus = useCallback(async (transactionId, options = {}) => {
    const { 
      maxAttempts = 10, 
      intervalMs = 3000, 
      onStatusChange,
      onComplete,
      onError 
    } = options

    let attempts = 0
    
    const poll = async () => {
      try {
        attempts++
        console.log(`🔍 Consultando estado 3DS (intento ${attempts}/${maxAttempts}):`, transactionId)
        
        const result = await checkTransactionStatus(transactionId)
        
        if (onStatusChange) {
          onStatusChange(result, attempts)
        }
        
        // Estados finales
        if (result.status === 'APPROVED' || result.status === 'DECLINED') {
          if (onComplete) {
            onComplete(result)
          }
          return result
        }
        
        // Continuar polling si no hemos alcanzado el máximo de intentos
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs)
        } else {
          const timeoutError = new Error('Timeout consultando estado de transacción 3DS')
          if (onError) {
            onError(timeoutError)
          }
          throw timeoutError
        }
      } catch (error) {
        if (onError) {
          onError(error)
        }
        throw error
      }
    }
    
    return poll()
  }, [checkTransactionStatus])

  // Polling para transacción pública
  const pollPublicTransactionStatus = useCallback(async (transactionId, maxAttempts = 20, interval = 3000) => {
    let attempts = 0
    
    const poll = async () => {
      try {
        const result = await dispatch(checkPublic3DSTransactionStatus(transactionId)).unwrap()
        
        console.log('🔍 Polling result:', result)
        console.log('🔍 Transaction status:', result?.transaction?.status)
        console.log('🔍 Business creation completed:', result?.business_creation?.completed)
        
        // El slice devuelve result.data, así que usamos result.transaction.status
        if (result.transaction.status === 'APPROVED' || result.transaction.status === 'DECLINED') {
          console.log('✅ Polling detectó transacción finalizada:', result.transaction.status)
          return result
        }
        
        attempts++
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval))
          return poll()
        } else {
          throw new Error('Timeout: La transacción no se completó en el tiempo esperado')
        }
      } catch (error) {
        throw error
      }
    }
    
    return poll()
  }, [dispatch])

  // Crear pago 3DS público para registro
  const createPublicPayment = useCallback(async (paymentData) => {
    try {
      const result = await dispatch(createPublic3DSPayment(paymentData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch])

  // Consultar estado de transacción pública
  const checkPublicTransactionStatus = useCallback(async (transactionId) => {
    try {
      const result = await dispatch(checkPublic3DSTransactionStatus(transactionId)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch])

  return {
    // Estado 3DS autenticado (owners)
    isProcessing: processing3DS,
    error: threeds_error,
    result: threeds_result,
    transactionData,
    challengeIframe,
    stats: threeds_stats,
    
    // Estado 3DS público (registro)
    isProcessingPublic: processingPublic3DS,
    publicError: public3DS_error,
    publicResult: public3DS_result,
    publicTransactionData,
    
    // Estado de configuración Wompi
    config: wompiConfig,
    configLoading: wompiConfigLoading,
    configError: wompiConfigError,
    
    // Funciones 3DS autenticado
    loadWompiConfig,
    createPayment,
    checkTransactionStatus,
    getPaymentStats,
    setChallengeData,
    setTransaction,
    clearState,
    processChallenge,
    pollTransactionStatus,
    getBrowserInfo,
    
    // Funciones 3DS público
    createPublicPayment,
    checkPublicTransactionStatus,
    pollPublicTransactionStatus,
    
    // Estados computados autenticado
    hasChallenge: !!challengeIframe,
    hasTransaction: !!transactionData,
    hasConfig: !!wompiConfig,
    isCompleted: transactionData?.status === 'APPROVED',
    isDeclined: transactionData?.status === 'DECLINED',
    
    // Estados computados público
    hasPublicTransaction: !!publicTransactionData,
    isPublicCompleted: publicTransactionData?.status === 'APPROVED',
    isPublicDeclined: publicTransactionData?.status === 'DECLINED',
    isPending: transactionData?.status === 'PENDING_3DS'
  }
}

export default use3DSPayments