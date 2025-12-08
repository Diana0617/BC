import React from 'react'
import { 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BellIcon
} from '@heroicons/react/24/outline'

/**
 * WhatsAppEmptyState Component
 * 
 * Componente para mostrar estados vacíos en diferentes contextos.
 * Incluye ilustración, mensaje y opcionalmente un botón de acción.
 * 
 * @param {string} variant - Tipo de empty state: 'templates', 'messages', 'webhooks', 'default'
 * @param {string} title - Título personalizado (opcional)
 * @param {string} message - Mensaje personalizado (opcional)
 * @param {Function} onAction - Callback para el botón de acción (opcional)
 * @param {string} actionLabel - Texto del botón de acción (opcional)
 */
const WhatsAppEmptyState = ({ 
  variant = 'default',
  title,
  message,
  onAction,
  actionLabel 
}) => {
  // Configuración por variante
  const configs = {
    templates: {
      icon: DocumentTextIcon,
      title: 'No hay plantillas creadas',
      message: 'Crea tu primera plantilla de mensaje para comenzar a comunicarte con tus clientes.',
      actionLabel: 'Crear Plantilla'
    },
    messages: {
      icon: EnvelopeIcon,
      title: 'No hay mensajes enviados',
      message: 'Cuando envíes mensajes a tus clientes, aparecerán aquí con su estado de entrega.',
      actionLabel: null
    },
    webhooks: {
      icon: BellIcon,
      title: 'No hay eventos registrados',
      message: 'Los eventos de WhatsApp (mensajes recibidos, actualizaciones de estado) aparecerán aquí.',
      actionLabel: null
    },
    default: {
      icon: ChatBubbleLeftRightIcon,
      title: 'No hay datos disponibles',
      message: 'Aún no hay información para mostrar.',
      actionLabel: null
    }
  }

  const config = configs[variant] || configs.default
  const Icon = config.icon

  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const displayActionLabel = actionLabel || config.actionLabel

  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {displayTitle}
        </h3>
        
        {/* Message */}
        <p className="text-sm text-gray-600 mb-8 px-4">
          {displayMessage}
        </p>
        
        {/* Action button */}
        {onAction && displayActionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            {displayActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default WhatsAppEmptyState
