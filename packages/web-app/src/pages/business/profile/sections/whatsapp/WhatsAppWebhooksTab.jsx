import React from 'react'
import WhatsAppWebhookEvents from './WhatsAppWebhookEvents'

/**
 * WhatsAppWebhooksTab Component
 * 
 * Tab de Webhooks - muestra el log de eventos recibidos
 */
const WhatsAppWebhooksTab = () => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          ℹ️ Registro de Eventos de Webhook
        </h4>
        <p className="text-sm text-blue-800">
          Aquí se registran todos los eventos recibidos desde Meta (WhatsApp Business Platform).
          Los eventos incluyen actualizaciones de estado de mensajes, mensajes recibidos, 
          cambios en plantillas y más. Puedes re-procesar eventos fallidos usando el botón "Re-procesar".
        </p>
      </div>

      {/* Webhook events list */}
      <WhatsAppWebhookEvents />
    </div>
  )
}

export default WhatsAppWebhooksTab
