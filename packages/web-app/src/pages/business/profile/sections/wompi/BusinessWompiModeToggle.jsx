/**
 * BusinessWompiModeToggle.jsx
 * 
 * Toggle para cambiar entre modo prueba y producción
 */

import React, { useState } from 'react'
import {
  ExclamationTriangleIcon,
  BeakerIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

const BusinessWompiModeToggle = ({ 
  isTestMode, 
  hasProdCredentials, 
  onToggle, 
  disabled 
}) => {
  const [showWarning, setShowWarning] = useState(false)

  const handleToggle = () => {
    if (!isTestMode && !hasProdCredentials) {
      // No se puede cambiar a producción sin credenciales
      return
    }

    if (isTestMode) {
      // Cambiar a producción - mostrar advertencia
      setShowWarning(true)
    } else {
      // Cambiar a prueba - sin advertencia
      onToggle(true)
    }
  }

  const confirmProductionMode = () => {
    setShowWarning(false)
    onToggle(false) // false = production
  }

  const cancelModeChange = () => {
    setShowWarning(false)
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {isTestMode ? (
                <BeakerIcon className="h-5 w-5 text-yellow-600" />
              ) : (
                <RocketLaunchIcon className="h-5 w-5 text-green-600" />
              )}
              <h3 className="font-semibold text-gray-900">
                Modo {isTestMode ? 'Prueba' : 'Producción'}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {isTestMode 
                ? 'Los pagos no son reales. Usa este modo para probar tu integración.'
                : '¡Los pagos son reales! Los clientes serán cobrados de verdad.'}
            </p>
            {!hasProdCredentials && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Configura credenciales de producción para activar este modo
              </p>
            )}
          </div>

          <button
            onClick={handleToggle}
            disabled={disabled || (!isTestMode && !hasProdCredentials)}
            className={`
              relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isTestMode 
                ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}
              ${(disabled || (!isTestMode && !hasProdCredentials)) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span
              aria-hidden="true"
              className={`
                pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${isTestMode ? 'translate-x-0' : 'translate-x-8'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Modal de advertencia al cambiar a producción */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Cambiar a Modo Producción?
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Estás a punto de activar el modo de <strong>producción</strong>. 
                  Esto significa que:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside mb-4">
                  <li>Los pagos serán <strong>reales</strong></li>
                  <li>Los clientes serán cobrados de <strong>verdad</strong></li>
                  <li>Las transacciones aparecerán en tu cuenta bancaria</li>
                  <li>Wompi cobrará comisiones por cada transacción</li>
                </ul>
                <p className="text-sm text-gray-700 font-medium">
                  ¿Estás seguro de que quieres continuar?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelModeChange}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmProductionMode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sí, cambiar a Producción
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BusinessWompiModeToggle
