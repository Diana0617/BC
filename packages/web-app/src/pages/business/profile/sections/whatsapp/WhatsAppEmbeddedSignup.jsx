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
    const result = await dispatch(getEmbeddedSignupConfig())
    console.log('🔧 Embedded Signup Config:', result.payload)
    setIsLoadingConfig(false)
  }

  // Load Embedded Signup config on mount
  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar SDK de Facebook
  useEffect(() => {
    if (!embeddedSignupConfig.appId) return

    // Verificar si ya está cargado
    if (window.FB) {
      window.FB.init({
        appId: embeddedSignupConfig.appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      return
    }

    // Cargar SDK de Facebook
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: embeddedSignupConfig.appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
      }
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [embeddedSignupConfig.appId])

  const handleEmbeddedSignupClick = () => {
    if (!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) {
      toast.error('Configuración de Embedded Signup no disponible')
      return
    }

    // Inicializar SDK de Facebook si no está cargado
    if (!window.FB) {
      toast.error('SDK de Facebook no está cargado')
      return
    }

    // Usar el método oficial de Embedded Signup del SDK de Facebook
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const { code } = response.authResponse
          
          // Procesar el callback
          dispatch(handleEmbeddedSignupCallback({
            code,
            state: embeddedSignupConfig.state,
            setup: response.authResponse.setup || {}
          }))
          .unwrap()
          .then(() => {
            toast.success('✅ Conexión exitosa con WhatsApp Business')
          })
          .catch((error) => {
            toast.error(`❌ Error: ${error}`)
          })
        } else {
          toast.error('Conexión cancelada')
        }
      },
      {
        config_id: embeddedSignupConfig.configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {}
        }
      }
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

      {/* Debug Info - Remove in production */}
      {(!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 font-medium mb-2">⚠️ Configuración incompleta</p>
          <ul className="text-xs text-red-700 space-y-1">
            {!embeddedSignupConfig.appId && <li>• App ID no configurado en el backend</li>}
            {!embeddedSignupConfig.configId && <li>• Configuration ID no configurado en el backend</li>}
          </ul>
          <p className="text-xs text-red-600 mt-2">
            Contacte al administrador del sistema para configurar las variables de entorno.
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleEmbeddedSignupClick}
        disabled={isLoadingConfig || isHandlingCallback || !embeddedSignupConfig.appId || !embeddedSignupConfig.configId}
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
