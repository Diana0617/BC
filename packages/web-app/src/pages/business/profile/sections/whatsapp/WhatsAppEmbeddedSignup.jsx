import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getEmbeddedSignupConfig,
  handleEmbeddedSignupCallback,
  selectEmbeddedSignupConfig,
  selectIsHandlingCallback,
  selectCallbackError
} from '@shared/store/slices/whatsappTokenSlice'
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppEmbeddedSignup Component
 * 
 * Componente para OAuth flow usando Meta's Embedded Signup.
 * Permite conectar WhatsApp Business en 1 click usando Meta Business.
 * 
 * Referencias:
 * - https://developers.facebook.com/docs/whatsapp/embedded-signup
 */
const WhatsAppEmbeddedSignup = () => {
  const dispatch = useDispatch()
  
  const embeddedSignupConfig = useSelector(selectEmbeddedSignupConfig)
  const isHandlingCallback = useSelector(selectIsHandlingCallback)
  const callbackError = useSelector(selectCallbackError)
  
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)

  const loadConfig = async () => {
    setIsLoadingConfig(true)
    await dispatch(getEmbeddedSignupConfig())
    setIsLoadingConfig(false)
  }

  // Load Embedded Signup config on mount
  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle OAuth callback from popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Validate origin (should be from Meta)
      if (!event.origin.includes('facebook.com')) {
        return
      }

      // Extract OAuth data from postMessage
      const { code, state, setup } = event.data

      if (code && state) {
        // Validate state matches our config
        if (state !== embeddedSignupConfig.state) {
          toast.error('Estado de OAuth inválido')
          return
        }

        // Process the callback
        const result = await dispatch(handleEmbeddedSignupCallback({
          code,
          state,
          setup // Contains phone_number_id, waba_id, etc.
        }))

        if (result.type.endsWith('/fulfilled')) {
          toast.success('✅ Conexión exitosa con WhatsApp Business')
        } else {
          toast.error('❌ Error al procesar la conexión')
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [dispatch, embeddedSignupConfig])

  const handleEmbeddedSignupClick = () => {
    if (!embeddedSignupConfig.appId || !embeddedSignupConfig.redirectUri) {
      toast.error('Configuración de Embedded Signup no disponible')
      return
    }

    // Construct OAuth URL
    const oauthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    oauthUrl.searchParams.set('client_id', embeddedSignupConfig.appId)
    oauthUrl.searchParams.set('redirect_uri', embeddedSignupConfig.redirectUri)
    oauthUrl.searchParams.set('state', embeddedSignupConfig.state)
    oauthUrl.searchParams.set('scope', embeddedSignupConfig.scope || 'business_management,whatsapp_business_management,whatsapp_business_messaging')
    oauthUrl.searchParams.set('response_type', 'code')
    oauthUrl.searchParams.set('extras', JSON.stringify({
      feature: 'whatsapp_embedded_signup',
      setup: {
        // Pre-fill business info if available
      }
    }))

    // Open popup window
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    window.open(
      oauthUrl.toString(),
      'WhatsApp Embedded Signup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Conexión Rápida con Meta (Recomendado)
          </h3>
          <p className="text-sm text-gray-600">
            Conecta tu WhatsApp Business en 1 click usando tu cuenta de Meta Business
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">Ventajas:</h4>
        <ul className="space-y-2">
          {[
            'Configuración automática en menos de 2 minutos',
            'Token de acceso permanente sin expiración',
            'Permisos gestionados automáticamente',
            'Configuración de webhook automática',
            'Más seguro y fácil de mantener'
          ].map((benefit, index) => (
            <li key={index} className="flex items-start text-sm text-blue-800">
              <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Requisitos:</h4>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Cuenta de Meta Business verificada</li>
          <li>Número de teléfono no usado en WhatsApp personal</li>
          <li>Acceso de administrador a Meta Business</li>
        </ul>
      </div>

      {/* Action Button */}
      <button
        onClick={handleEmbeddedSignupClick}
        disabled={isLoadingConfig || isHandlingCallback || !embeddedSignupConfig.appId}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoadingConfig ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Cargando configuración...
          </>
        ) : isHandlingCallback ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Procesando conexión...
          </>
        ) : (
          <>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
            Conectar con Meta Business
          </>
        )}
      </button>

      {/* Error Display */}
      {callbackError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {callbackError}
          </p>
        </div>
      )}

      {/* Help Link */}
      <div className="mt-4 text-center">
        <a
          href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          ¿Cómo funciona Embedded Signup? →
        </a>
      </div>
    </div>
  )
}

export default WhatsAppEmbeddedSignup
