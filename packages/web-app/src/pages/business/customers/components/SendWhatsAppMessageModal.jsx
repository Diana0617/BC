/**
 * SendWhatsAppMessageModal Component
 * 
 * Modal para enviar mensajes de WhatsApp a un cliente usando plantillas aprobadas.
 * Permite:
 * - Seleccionar plantilla aprobada
 * - Completar variables dinámicas
 * - Enviar mensaje
 * - Ver preview del mensaje
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { whatsappApi } from '@shared/api';
import toast from 'react-hot-toast';

const SendWhatsAppMessageModal = ({ isOpen, onClose, client }) => {
  const { currentBusiness } = useSelector(state => state.business);
  
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Cargar plantillas aprobadas al abrir el modal
  useEffect(() => {
    if (isOpen && currentBusiness?.id) {
      loadApprovedTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentBusiness?.id]);

  const loadApprovedTemplates = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await whatsappApi.getTemplates(currentBusiness.id, {
        status: 'APPROVED',
        limit: 100
      });
      
      if (response.success) {
        setTemplates(response.data.templates || []);
        if (response.data.templates?.length === 0) {
          setLoadError('No tienes plantillas aprobadas. Crea y aprueba plantillas en Configuración → WhatsApp.');
        }
      } else {
        setLoadError(response.error || 'Error al cargar plantillas');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setLoadError('Error al cargar plantillas. Asegúrate de tener WhatsApp configurado.');
    } finally {
      setIsLoading(false);
    }
  };

  // Detectar variables en la plantilla seleccionada
  useEffect(() => {
    if (selectedTemplate) {
      const vars = extractVariablesFromTemplate(selectedTemplate);
      const initialVars = {};
      vars.forEach(varNum => {
        initialVars[varNum] = '';
      });
      setVariables(initialVars);
    } else {
      setVariables({});
    }
  }, [selectedTemplate]);

  const extractVariablesFromTemplate = (template) => {
    const variablePattern = /\{\{(\d+)\}\}/g;
    const variables = new Set();
    
    template.components.forEach(component => {
      if (component.text) {
        let match;
        while ((match = variablePattern.exec(component.text)) !== null) {
          variables.add(match[1]);
        }
      }
    });
    
    return Array.from(variables).sort();
  };

  const handleVariableChange = (varNum, value) => {
    setVariables(prev => ({
      ...prev,
      [varNum]: value
    }));
  };

  const handleSendMessage = async () => {
    if (!selectedTemplate) {
      toast.error('Selecciona una plantilla');
      return;
    }

    // Validar que todas las variables estén completadas
    const requiredVars = extractVariablesFromTemplate(selectedTemplate);
    const missingVars = requiredVars.filter(varNum => !variables[varNum]?.trim());
    
    if (missingVars.length > 0) {
      toast.error(`Completa todas las variables requeridas (${missingVars.join(', ')})`);
      return;
    }

    // Validar que el cliente tenga teléfono
    if (!client.phone) {
      toast.error('Este cliente no tiene número de teléfono registrado');
      return;
    }

    setIsSending(true);
    try {
      const messageData = {
        recipientPhone: client.phone,
        templateName: selectedTemplate.name,
        variables: Object.keys(variables)
          .sort()
          .map(key => variables[key]),
        clientId: client.id
      };

      const response = await whatsappApi.sendTemplateMessage(
        currentBusiness.id,
        messageData
      );

      if (response.success) {
        toast.success('✅ Mensaje enviado exitosamente');
        onClose();
      } else {
        toast.error(response.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    const bodyComponent = selectedTemplate.components.find(c => c.type === 'BODY');
    if (!bodyComponent) return null;

    let previewText = bodyComponent.text;
    Object.keys(variables).forEach(varNum => {
      const value = variables[varNum] || `{{${varNum}}}`;
      previewText = previewText.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, 'g'), value);
    });

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
          Vista Previa
        </h4>
        <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
          {previewText}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                📱 Enviar Mensaje por WhatsApp
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                A: {client.firstName} {client.lastName} ({client.phone || 'Sin teléfono'})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">Cargando plantillas...</p>
              </div>
            )}

            {/* Error State */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{loadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Template Selection */}
            {!isLoading && !loadError && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plantilla *
                  </label>
                  <select
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === parseInt(e.target.value));
                      setSelectedTemplate(template);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una plantilla...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo se muestran plantillas aprobadas por Meta
                  </p>
                </div>

                {/* Variables Form */}
                {selectedTemplate && extractVariablesFromTemplate(selectedTemplate).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Variables del Mensaje
                    </label>
                    <div className="space-y-3">
                      {extractVariablesFromTemplate(selectedTemplate).map(varNum => (
                        <div key={varNum}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Variable {varNum} *
                          </label>
                          <input
                            type="text"
                            value={variables[varNum] || ''}
                            onChange={(e) => handleVariableChange(varNum, e.target.value)}
                            placeholder={`Valor para {{${varNum}}}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {selectedTemplate && renderPreview()}

                {/* WhatsApp Not Configured Warning */}
                {templates.length === 0 && !isLoading && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-900">
                          WhatsApp no configurado
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Para enviar mensajes, primero debes:
                        </p>
                        <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
                          <li>Configurar tu conexión con WhatsApp Business</li>
                          <li>Crear plantillas de mensajes</li>
                          <li>Enviar plantillas a Meta para aprobación</li>
                          <li>Esperar aprobación (24-48 horas)</li>
                        </ol>
                        <p className="text-sm text-yellow-700 mt-2">
                          Ve a: <strong>Configuración → WhatsApp</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!isLoading && !loadError && templates.length > 0 && (
            <div className="flex justify-end items-center space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!selectedTemplate || isSending || !client.phone}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendWhatsAppMessageModal;
