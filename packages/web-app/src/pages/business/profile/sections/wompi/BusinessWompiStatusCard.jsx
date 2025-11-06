/**
 * BusinessWompiStatusCard.jsx
 * 
 * Card que muestra el estado actual de la configuración de Wompi
 */

import React from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const BusinessWompiStatusCard = ({ config }) => {
  // Determinar el estado general
  const getStatus = () => {
    if (!config || !config.exists) {
      return {
        type: 'pending',
        icon: ClockIcon,
        title: 'Sin configurar',
        description: 'Aún no has configurado tus credenciales de Wompi',
        color: 'gray'
      }
    }

    if (config.verificationStatus === 'failed') {
      return {
        type: 'error',
        icon: XCircleIcon,
        title: 'Verificación fallida',
        description: config.verificationError || 'Las credenciales no pudieron ser verificadas',
        color: 'red'
      }
    }

    if (config.verificationStatus === 'verified' && config.isActive) {
      return {
        type: 'success',
        icon: CheckCircleIcon,
        title: '¡Configuración activa!',
        description: `Recibiendo pagos en modo ${config.isTestMode ? 'prueba' : 'producción'}`,
        color: 'green'
      }
    }

    if (config.verificationStatus === 'verified' && !config.isActive) {
      return {
        type: 'warning',
        icon: ExclamationTriangleIcon,
        title: 'Configuración verificada pero inactiva',
        description: 'Las credenciales son válidas pero la configuración está desactivada',
        color: 'yellow'
      }
    }

    return {
      type: 'pending',
      icon: ClockIcon,
      title: 'Pendiente de verificación',
      description: 'Credenciales guardadas, verifica la conexión para activar',
      color: 'blue'
    }
  }

  const status = getStatus()
  const Icon = status.icon

  const colorClasses = {
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      title: 'text-gray-900',
      description: 'text-gray-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      title: 'text-red-900',
      description: 'text-red-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      title: 'text-green-900',
      description: 'text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      title: 'text-yellow-900',
      description: 'text-yellow-700'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      title: 'text-blue-900',
      description: 'text-blue-700'
    }
  }

  const colors = colorClasses[status.color]

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6 mb-6`}>
      <div className="flex items-start space-x-4">
        <div className={`${colors.iconBg} rounded-full p-3 flex-shrink-0`}>
          <Icon className={`h-6 w-6 ${colors.iconText}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.title} mb-1`}>
            {status.title}
          </h3>
          <p className={`text-sm ${colors.description} mb-4`}>
            {status.description}
          </p>

          {config && config.exists && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Modo actual:</span>
                <span className={`ml-2 font-medium ${colors.title}`}>
                  {config.isTestMode ? 'Prueba' : 'Producción'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <span className={`ml-2 font-medium ${colors.title}`}>
                  {config.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {config.lastVerifiedAt && (
                <div className="col-span-2">
                  <span className="text-gray-600">Última verificación:</span>
                  <span className={`ml-2 font-medium ${colors.title}`}>
                    {new Date(config.lastVerifiedAt).toLocaleString('es-CO')}
                  </span>
                </div>
              )}
            </div>
          )}

          {config && config.webhookUrl && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-600 mb-1">URL de Webhook (configura esto en Wompi):</p>
              <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 break-all">
                {config.webhookUrl}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessWompiStatusCard
