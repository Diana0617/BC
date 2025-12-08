import React from 'react'
import WhatsAppMessagesHistory from './WhatsAppMessagesHistory'

/**
 * WhatsAppMessagesTab Component
 * 
 * Tab principal para historial de mensajes enviados.
 * Wrapper simple que contiene el componente de historial.
 */
const WhatsAppMessagesTab = () => {
  return (
    <div className="space-y-6">
      <WhatsAppMessagesHistory />
    </div>
  )
}

export default WhatsAppMessagesTab
