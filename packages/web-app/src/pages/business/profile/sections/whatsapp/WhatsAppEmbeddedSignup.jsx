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

      {/* Status Message */}
      {(!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                🚀 Conexión Automática en Proceso de Activación
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  La conexión automática con Facebook está siendo habilitada para todos los negocios. 
                  Este proceso es realizado por el equipo de Beauty Control y no requiere acción de tu parte.
                </p>
                <p className="mb-3 font-medium">
                  📱 Mientras tanto, puedes conectar WhatsApp usando el método manual arriba.
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    ¿Qué pasará cuando se active? →
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs ml-4 list-disc">
                    <li>Conectarás WhatsApp en <strong>1 solo clic</strong> con Facebook</li>
                    <li>No tendrás que copiar tokens manualmente</li>
                    <li>La configuración será 100% automática</li>
                    <li>Te notificaremos cuando esté disponible</li>
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleEmbeddedSignupClick}
        disabled={isLoadingConfig || isHandlingCallback || !embeddedSignupConfig.appId || !embeddedSignupConfig.configId}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={(!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) ? 
          "Conexión automática en proceso de activación - Usa el método manual mientras tanto" : 
          ""}
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
        ) : (!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) ? (
          <>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Activación en Proceso...
          </>
        ) : (
          <>
            <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
            Conectar con Meta Business
          </>
        )}
      </button>

      {/* Disabled Explanation */}
      {(!embeddedSignupConfig.appId || !embeddedSignupConfig.configId) && (
        <p className="mt-2 text-xs text-center text-gray-500">
          El equipo de Beauty Control está activando esta función. Te notificaremos cuando esté lista.
        </p>
      )}

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
