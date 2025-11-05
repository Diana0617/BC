import React, { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  LinkIcon,
  DocumentTextIcon,
  ChatBubbleOvalLeftIcon,
  BellIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import {
  WhatsAppConnectionTab,
  WhatsAppTemplatesTab,
  WhatsAppMessagesTab,
  WhatsAppWebhooksTab
} from './whatsapp'

/**
 * WhatsAppConfigSection Component
 * 
 * Sección principal de configuración de WhatsApp Business Platform
 * con sistema de tabs para organizar todas las funcionalidades
 */
const WhatsAppConfigSection = () => {
  const [activeTab, setActiveTab] = useState('connection')

  const tabs = [
    {
      id: 'connection',
      label: 'Conexión',
      icon: LinkIcon,
      description: 'Configurar y verificar conexión con Meta'
    },
    {
      id: 'templates',
      label: 'Plantillas',
      icon: DocumentTextIcon,
      description: 'Gestionar plantillas de mensajes'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: ChatBubbleOvalLeftIcon,
      description: 'Historial de mensajes enviados'
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: BellIcon,
      description: 'Eventos recibidos de Meta'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'connection':
        return <WhatsAppConnectionTab />
      case 'templates':
        return <WhatsAppTemplatesTab />
      case 'messages':
        return <WhatsAppMessagesTab />
      case 'webhooks':
        return <WhatsAppWebhooksTab />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                WhatsApp Business Platform
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Integración oficial con Meta para envío de mensajes y plantillas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">WhatsApp Business Platform - Integración oficial con Meta</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Envío de mensajes con plantillas aprobadas</li>
              <li>Recepción de webhooks en tiempo real</li>
              <li>Seguimiento de estado de mensajes</li>
              <li>Gestión completa desde la plataforma</li>
            </ul>
            <p className="mt-3">
              <a 
                href="https://developers.facebook.com/docs/whatsapp/cloud-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Ver documentación oficial →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  transition-colors duration-200
                  ${isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default WhatsAppConfigSection
