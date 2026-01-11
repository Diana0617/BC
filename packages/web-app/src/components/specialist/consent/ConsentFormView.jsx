import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SignaturePad from './SignaturePad';

/**
 * Formulario completo de consentimiento informado
 * Muestra template, datos del paciente y captura firma
 */
export default function ConsentFormView({ 
  appointment,
  templateId,
  onSuccess,
  onCancel,
  token
}) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [signatureData, setSignatureData] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const businessId = appointment.businessId;
      if (!businessId) {
        throw new Error('businessId no disponible en el appointment');
      }
      
      console.log('🔑 ConsentFormView - Loading template:', {
        templateId,
        businessId,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${businessId}/consent-templates/${templateId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading template');

      const data = await response.json();
      setTemplate(data.data || data);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error al cargar el formulario de consentimiento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signatureData) {
      alert('Por favor firma el documento');
      return;
    }

    if (!acceptTerms) {
      alert('Debes aceptar los términos del consentimiento');
      return;
    }

    setLoading(true);
    try {
      const businessId = appointment.businessId;
      if (!businessId) {
        throw new Error('businessId no disponible');
      }
      
      const client = appointment.Client || appointment.client;
      const clientName = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : 'Cliente';
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${businessId}/consent-signatures`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appointmentId: appointment.id,
            consentTemplateId: templateId,
            customerId: appointment.clientId,
            signatureData,
            signedBy: clientName
          })
        }
      );

      if (!response.ok) throw new Error('Error saving consent');

      const data = await response.json();
      alert('Consentimiento guardado exitosamente');
      onSuccess?.(data);
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('Error al guardar el consentimiento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <DocumentTextIcon className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {template.name}
        </h3>
        <p className="text-gray-600">
          Consentimiento Informado
        </p>
      </div>

      {/* Información del Paciente */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Datos del Paciente
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre Completo</p>
            <p className="font-semibold text-gray-900">
              {appointment.client?.firstName} {appointment.client?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Documento</p>
            <p className="font-semibold text-gray-900">
              {appointment.client?.documentNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Servicio</p>
            <p className="font-semibold text-gray-900">
              {appointment.service?.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-semibold text-gray-900">
              {appointment.date ? format(new Date(appointment.date), "d 'de' MMMM, yyyy", { locale: es }) : 'Fecha no disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido del Consentimiento */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Términos del Consentimiento</h4>
        </div>
        
        <div className="p-6 prose prose-sm max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: template.content }}
            className="text-gray-700 leading-relaxed"
          />
        </div>
      </div>

      {/* Checkbox de Aceptación */}
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <p className="font-medium text-gray-900">
              Acepto los términos del consentimiento informado
            </p>
            <p className="text-sm text-gray-600 mt-1">
              He leído y comprendido completamente la información proporcionada. 
              Autorizo el procedimiento descrito y confirmo que mis dudas han sido aclaradas.
            </p>
          </div>
        </label>
      </div>

      {/* Firma */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          Firma del Paciente
        </h4>
        <SignaturePad
          onSave={setSignatureData}
          onClear={() => setSignatureData('')}
        />
      </div>

      {/* Botones */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <XMarkIcon className="w-5 h-5" />
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={loading || !signatureData || !acceptTerms}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Guardar Consentimiento
            </>
          )}
        </button>
      </form>

      {/* Información Legal */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600 text-center">
          🔒 Este documento tiene validez legal. La firma digital será almacenada 
          de forma segura y encriptada cumpliendo con las normativas de protección de datos.
        </p>
      </div>
    </div>
  );
}
