import React, { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline'

/**
 * WebhookEventCard Component
 * 
 * Tarjeta expandible para mostrar evento de webhook.
 * Incluye timestamp, tipo de evento, y payload completo.
 * 
 * @param {Object} event - Evento de webhook
 */
const WebhookEventCard = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getEventTypeLabel = (type) => {
    const labels = {
      message_status: 'Actualización de Estado',
      message_received: 'Mensaje Recibido',
      template_status: 'Estado de Plantilla',
      account_update: 'Actualización de Cuenta',
      phone_number_quality_update: 'Actualización de Calidad'
    }
    return labels[type] || type
  }

  const getEventTypeBadge = (type) => {
    const configs = {
      message_status: { bg: 'bg-blue-100', text: 'text-blue-800' },
      message_received: { bg: 'bg-green-100', text: 'text-green-800' },
      template_status: { bg: 'bg-purple-100', text: 'text-purple-800' },
      account_update: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      phone_number_quality_update: { bg: 'bg-orange-100', text: 'text-orange-800' }
    }
    const config = configs[type] || { bg: 'bg-gray-100', text: 'text-gray-800' }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <BellIcon className="h-4 w-4 mr-1.5" />
        {getEventTypeLabel(type)}
      </span>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 transition-colors">
      {/* Card Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start space-x-3 flex-1 text-left">
          <div className="mt-1">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              {getEventTypeBadge(event.eventType)}
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              {new Date(event.createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>

        {event.processed && (
          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Procesado
          </span>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          {/* Event metadata */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            {event.metaEventId && (
              <div>
                <p className="text-xs font-medium text-gray-500">Meta Event ID</p>
                <p className="text-gray-900 font-mono text-xs">{event.metaEventId}</p>
              </div>
            )}
            {event.messageId && (
              <div>
                <p className="text-xs font-medium text-gray-500">Message ID</p>
                <p className="text-gray-900 font-mono text-xs">{event.messageId}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500">Procesado</p>
              <p className="text-gray-900">
                {event.processed ? 'Sí' : 'No'}
                {event.processedAt && ` - ${new Date(event.processedAt).toLocaleString('es-ES')}`}
              </p>
            </div>
            {event.error && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-red-600">Error de Procesamiento</p>
                <p className="text-red-800 text-xs mt-1">{event.error}</p>
              </div>
            )}
          </div>

          {/* Payload display */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Payload del Webhook</p>
            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebhookEventCard
