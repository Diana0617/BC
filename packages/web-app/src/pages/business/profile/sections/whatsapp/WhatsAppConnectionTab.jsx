import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTokenInfo } from '@shared/store/slices/whatsappTokenSlice'
import WhatsAppEmbeddedSignup from './WhatsAppEmbeddedSignup'
import WhatsAppTokenManagement from './WhatsAppTokenManagement'
import WhatsAppConnectionCard from './WhatsAppConnectionCard'
import { WhatsAppLoadingState, WhatsAppErrorState } from '../shared'

/**
 * WhatsAppConnectionTab Component
 * 
 * Tab principal para la configuración de conexión con WhatsApp Business API.
 * Incluye 3 secciones principales:
 * 1. Estado de conexión actual
 * 2. Embedded Signup (OAuth con Meta)
 * 3. Gestión manual de tokens
 */
const WhatsAppConnectionTab = () => {
  const dispatch = useDispatch()
  
  // Redux state
  const { tokenInfo, isLoading, error } = useSelector(state => state.whatsappToken)
  const { currentBusiness } = useSelector(state => state.business)

  // Load token info on mount
  useEffect(() => {
    if (currentBusiness?.id) {
      dispatch(fetchTokenInfo())
    }
  }, [dispatch, currentBusiness?.id])

  // Loading state
  if (isLoading && !tokenInfo) {
    return <WhatsAppLoadingState variant="form" />
  }

  // Error state
  if (error && !tokenInfo) {
    return (
      <WhatsAppErrorState 
        error={error}
        onRetry={() => dispatch(fetchTokenInfo())}
        title="Error al cargar información de conexión"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <WhatsAppConnectionCard />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-4 text-sm font-medium text-gray-500">
            Métodos de Conexión
          </span>
        </div>
      </div>

      {/* Embedded Signup Section */}
      <WhatsAppEmbeddedSignup />

      {/* Manual Token Management Section */}
      <WhatsAppTokenManagement />
    </div>
  )
}

export default WhatsAppConnectionTab
