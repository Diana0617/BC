import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  testConnection,
  selectTokenInfo,
  selectConnectionTest,
  selectIsTesting,
  selectTestError,
  resetConnectionTest
} from '@shared/store/slices/whatsappTokenSlice'
import {
  CheckCircleIcon,
  XCircleIcon,
  SignalIcon,
  PhoneIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppConnectionCard Component
 * 
 * Muestra el estado actual de la conexión con WhatsApp Business API.
 * Incluye información del token, número de teléfono, y botón para test de conexión.
 */
const WhatsAppConnectionCard = () => {
  const dispatch = useDispatch()
  
  const tokenInfo = useSelector(selectTokenInfo)
  const connectionTest = useSelector(selectConnectionTest)
  const isTesting = useSelector(selectIsTesting)
  const testError = useSelector(selectTestError)

  const [showTestResult, setShowTestResult] = useState(false)

  const handleTestConnection = async () => {
    setShowTestResult(false)
    const result = await dispatch(testConnection())
    
    if (result.type.endsWith('/fulfilled')) {
      setShowTestResult(true)
      toast.success('✅ Conexión exitosa con WhatsApp Business API')
    } else {
      setShowTestResult(true)
      toast.error('❌ Error al probar la conexión')
    }
  }

  const handleCloseTestResult = () => {
    setShowTestResult(false)
    dispatch(resetConnectionTest())
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 ${tokenInfo.hasToken && tokenInfo.isActive ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${tokenInfo.hasToken && tokenInfo.isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
              <SignalIcon className={`h-6 w-6 ${tokenInfo.hasToken && tokenInfo.isActive ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Estado de Conexión
              </h3>
              <p className="text-sm text-gray-600">
                WhatsApp Business Platform API
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div>
            {tokenInfo.hasToken && tokenInfo.isActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                Conectado
              </span>
            ) : tokenInfo.hasToken && !tokenInfo.isActive ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                Token Expirado
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                <XCircleIcon className="h-4 w-4 mr-1.5" />
                No Conectado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {tokenInfo.hasToken ? (
          <>
            {/* Connection Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Phone Number */}
              {tokenInfo.phoneNumber && (
                <div className="flex items-start space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Número de WhatsApp</p>
                    <p className="text-sm text-gray-900 font-mono">{tokenInfo.phoneNumber}</p>
                  </div>
                </div>
              )}

              {/* Phone Number ID */}
              {tokenInfo.phoneNumberId && (
                <div className="flex items-start space-x-3">
                  <CheckBadgeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone Number ID</p>
                    <p className="text-sm text-gray-900 font-mono">{tokenInfo.phoneNumberId}</p>
                  </div>
                </div>
              )}

              {/* Token Type */}
              <div className="flex items-start space-x-3">
                <CheckBadgeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Origen del Token</p>
                  <p className="text-sm text-gray-900">
                    {tokenInfo.source === 'embedded_signup' ? 'OAuth (Embedded Signup)' : 'Manual'}
                  </p>
                </div>
              </div>

              {/* Created At */}
              {tokenInfo.createdAt && (
                <div className="flex items-start space-x-3">
                  <CheckBadgeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Conectado desde</p>
                    <p className="text-sm text-gray-900">
                      {new Date(tokenInfo.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Verifica que la conexión esté funcionando correctamente
              </p>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Probando...
                  </>
                ) : (
                  <>
                    <SignalIcon className="h-4 w-4 mr-2" />
                    Probar Conexión
                  </>
                )}
              </button>
            </div>

            {/* Test Result */}
            {showTestResult && (connectionTest.success !== null || testError) && (
              <div className={`mt-4 p-4 rounded-lg ${connectionTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {connectionTest.success ? (
                      <>
                        <div className="flex items-center mb-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="text-sm font-semibold text-green-900">
                            Conexión Exitosa
                          </h4>
                        </div>
                        <div className="text-sm text-green-800 space-y-1">
                          {connectionTest.verifiedName && (
                            <p><span className="font-medium">Nombre verificado:</span> {connectionTest.verifiedName}</p>
                          )}
                          {connectionTest.phoneNumber && (
                            <p><span className="font-medium">Número:</span> {connectionTest.phoneNumber}</p>
                          )}
                          {connectionTest.quality && (
                            <p><span className="font-medium">Calidad:</span> {connectionTest.quality}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center mb-2">
                          <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                          <h4 className="text-sm font-semibold text-red-900">
                            Error en la Conexión
                          </h4>
                        </div>
                        <p className="text-sm text-red-800">
                          {testError || 'No se pudo establecer conexión con WhatsApp Business API'}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleCloseTestResult}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Connection State */
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <XCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay conexión configurada
            </h4>
            <p className="text-sm text-gray-600">
              Conecta tu cuenta de WhatsApp Business usando uno de los métodos a continuación
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WhatsAppConnectionCard
