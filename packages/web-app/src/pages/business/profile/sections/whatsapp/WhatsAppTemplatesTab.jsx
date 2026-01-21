import React, { useState } from 'react'
import WhatsAppTemplatesList from './WhatsAppTemplatesList'
import WhatsAppTemplateEditor from './WhatsAppTemplateEditor'
import WhatsAppTemplatePreview from './WhatsAppTemplatePreview'

/**
 * WhatsAppTemplatesTab Component
 * 
 * Tab principal para gestión de plantillas de WhatsApp.
 * Integra lista, editor y preview en un layout de 2 columnas.
 */
const WhatsAppTemplatesTab = () => {
  const [showEditor, setShowEditor] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const handleCreateTemplate = () => {
    setShowEditor(true)
    setPreviewTemplate(null)
  }

  const handleEditTemplate = (template) => {
    setShowEditor(true)
    setPreviewTemplate(template)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setPreviewTemplate(null)
  }

  const handlePreviewUpdate = (templateData) => {
    setPreviewTemplate(templateData)
  }

  return (
    <div className="space-y-6">
      {showEditor ? (
        /* Editor + Preview Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          <div>
            <WhatsAppTemplateEditor
              onClose={handleCloseEditor}
              onPreview={handlePreviewUpdate}
            />
          </div>

          {/* Preview Column */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <WhatsAppTemplatePreview 
              template={previewTemplate}
              businessName={previewTemplate?.businessName}
            />
          </div>
        </div>
      ) : (
        /* List View */
        <WhatsAppTemplatesList
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
        />
      )}
    </div>
  )
}

export default WhatsAppTemplatesTab
