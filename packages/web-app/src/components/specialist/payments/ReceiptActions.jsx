import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { apiClient } from '@shared/api/client';

/**
 * Componente para generar y enviar recibos PDF
 * Se integra después de completar pagos de citas
 */
export default function ReceiptActions({ 
  appointmentId, 
  businessId,
  onReceiptCreated 
}) {
  const businessSettings = useSelector((state) => state.business.currentBusiness?.settings);

  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    if (appointmentId && businessId) {
      loadReceiptData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, businessId]);

  /**
   * Cargar o crear datos del recibo
   */
  const loadReceiptData = async () => {
    console.log('📄 [ReceiptActions] Iniciando carga de recibo para appointment:', appointmentId);
    setLoading(true);
    try {
      // Intentar obtener el recibo existente
      console.log('📄 [ReceiptActions] Intentando GET /api/receipts/from-appointment/' + appointmentId);
      const response = await apiClient.get(
        `/api/receipts/from-appointment/${appointmentId}`
      );

      console.log('✅ [ReceiptActions] Recibo encontrado:', response.data);
      if (response.data.success) {
        setReceiptData(response.data.data);
      }
    } catch (error) {
      // Si no existe, intentar crearlo
      const errorMessage = (error.message || '').toLowerCase();
      console.log('❌ [ReceiptActions] Error al obtener recibo:', error.message);
      console.log('🔍 [ReceiptActions] Verificando si es 404...');
      console.log('🔍 [ReceiptActions] errorMessage lowercase:', errorMessage);
      console.log('🔍 [ReceiptActions] Contiene "encontr"?', errorMessage.includes('encontr'));
      console.log('🔍 [ReceiptActions] Contiene "not found"?', errorMessage.includes('not found'));
      
      if (error.response?.status === 404 || errorMessage.includes('encontr') || errorMessage.includes('not found')) {
        console.log('✅ [ReceiptActions] Es 404, intentando crear recibo...');
        await createReceipt();
      } else {
        console.error('❌ [ReceiptActions] Error inesperado loading receipt:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear recibo desde la cita
   */
  const createReceipt = async () => {
    console.log('🆕 [ReceiptActions] Iniciando creación de recibo para appointment:', appointmentId);
    try {
      console.log('🆕 [ReceiptActions] Llamando POST /api/receipts/from-appointment/' + appointmentId);
      const response = await apiClient.post(
        `/api/receipts/from-appointment/${appointmentId}`,
        {}
      );

      console.log('✅ [ReceiptActions] Respuesta del POST:', response.data);
      if (response.data.success) {
        console.log('✅ [ReceiptActions] Recibo creado exitosamente:', response.data.data);
        setReceiptData(response.data.data);
        if (onReceiptCreated) {
          onReceiptCreated(response.data.data);
        }
      }
    } catch (error) {
      console.error('❌ [ReceiptActions] Error creating receipt:', error);
      console.error('❌ [ReceiptActions] Error message:', error.message);
      console.error('❌ [ReceiptActions] Error response:', error.response);
      // Si ya existe, obtenerlo
      if (error.response?.data?.data) {
        console.log('ℹ️ [ReceiptActions] Recibo ya existe, usando data del error');
        setReceiptData(error.response.data.data);
      }
    }
  };

  /**
   * Generar y descargar PDF del recibo
   */
  const handleGeneratePDF = async () => {
    if (!receiptData?.id) {
      toast.error('No hay datos de recibo disponibles');
      return;
    }

    setGeneratingPDF(true);
    const toastId = toast.loading('Generando PDF...');

    try {
      const response = await apiClient.get(
        `/api/receipts/${receiptData.id}/pdf`,
        {
          responseType: 'blob'
        }
      );

      // Crear URL del blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${receiptData.receiptNumber || appointmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ PDF generado y descargado', { id: toastId });

      // Marcar como enviado por email (asumimos que se comparte)
      await markSentViaEmail();

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('❌ Error al generar el PDF', { id: toastId });
    } finally {
      setGeneratingPDF(false);
    }
  };

  /**
   * Enviar recibo por WhatsApp
   */
  const handleSendWhatsApp = async () => {
    if (!receiptData?.id) {
      toast.error('No hay datos de recibo disponibles');
      return;
    }

    if (!receiptData.clientPhone) {
      toast.error('El cliente no tiene número de teléfono registrado');
      return;
    }

    setSendingWhatsApp(true);
    const toastId = toast.loading('Preparando mensaje...');

    try {
      // Primero generar el PDF
      await apiClient.get(
        `/api/receipts/${receiptData.id}/pdf`,
        {
          responseType: 'blob'
        }
      );

      // Crear URL temporal del PDF (para descarga adicional si se necesita)
      // const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      // const pdfUrl = window.URL.createObjectURL(blob);
      // No necesitamos el URL aquí, solo abrimos WhatsApp con el mensaje

      // Construir mensaje de WhatsApp
      const businessName = businessSettings?.name || 'nuestro negocio';
      const clientName = receiptData.clientName || 'Cliente';
      const total = receiptData.totalAmount || 0;
      
      const message = `¡Hola ${clientName}! 👋\n\nTe enviamos el recibo de tu cita en ${businessName}.\n\n📄 Recibo #${receiptData.receiptNumber}\n💰 Total: ${formatCurrency(total)}\n\n¡Gracias por tu preferencia! ✨`;

      // Limpiar número de teléfono
      const phoneNumber = receiptData.clientPhone.replace(/\D/g, '');
      
      // Abrir WhatsApp Web con el mensaje
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success('✅ WhatsApp abierto. Comparte el PDF manualmente', { id: toastId });

      // Marcar como enviado
      await markSentViaWhatsApp();

      // Nota: En web no podemos enviar archivos directamente por WhatsApp
      // El usuario debe compartir manualmente el PDF descargado
      toast.info('💡 Descarga el PDF y compártelo en el chat de WhatsApp', {
        duration: 5000
      });

    } catch (error) {
      console.error('Error sending via WhatsApp:', error);
      toast.error('❌ Error al preparar el mensaje', { id: toastId });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  /**
   * Marcar recibo como enviado por email
   */
  const markSentViaEmail = async () => {
    try {
      await apiClient.put(
        `/api/receipts/${receiptData.id}/sent-email`,
        {}
      );

      setReceiptData(prev => ({
        ...prev,
        sentViaEmail: true,
        sentAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error marking sent via email:', error);
    }
  };

  /**
   * Marcar recibo como enviado por WhatsApp
   */
  const markSentViaWhatsApp = async () => {
    try {
      await apiClient.put(
        `/api/receipts/${receiptData.id}/sent-whatsapp`,
        {}
      );

      setReceiptData(prev => ({
        ...prev,
        sentViaWhatsApp: true,
        sentAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error marking sent via whatsapp:', error);
    }
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600">Cargando recibo...</span>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return null;
  }

  const canSendWhatsApp = receiptData.clientPhone && businessSettings?.whatsappEnabled;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Título */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recibo de Pago
        </h3>
        {receiptData.receiptNumber && (
          <span className="text-sm font-mono text-gray-500">
            #{receiptData.receiptNumber}
          </span>
        )}
      </div>

      {/* Información del recibo */}
      {receiptData && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-20">Cliente:</span>
            <span className="text-gray-900 font-medium">
              {receiptData.clientName || 'Sin nombre'}
            </span>
          </div>
          
          {receiptData.clientPhone && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">Teléfono:</span>
              <span className="text-gray-900">{receiptData.clientPhone}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className="text-gray-600 w-20">Total:</span>
            <span className="text-gray-900 font-semibold">
              {formatCurrency(receiptData.totalAmount)}
            </span>
          </div>

          {receiptData.serviceName && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">Servicio:</span>
              <span className="text-gray-900">{receiptData.serviceName}</span>
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-2">
        {/* Generar PDF */}
        <button
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            generatingPDF
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {generatingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generando...</span>
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Descargar PDF</span>
            </>
          )}
        </button>

        {/* Enviar por WhatsApp */}
        <button
          onClick={handleSendWhatsApp}
          disabled={!canSendWhatsApp || sendingWhatsApp}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            !canSendWhatsApp || sendingWhatsApp
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {sendingWhatsApp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Preparando...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>
                {canSendWhatsApp ? 'Enviar por WhatsApp' : 'WhatsApp no disponible'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Estado de envío */}
      {(receiptData.sentViaEmail || receiptData.sentViaWhatsApp) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">
              Enviado por {receiptData.sentViaWhatsApp ? 'WhatsApp' : 'Email'}
            </span>
          </div>
        </div>
      )}

      {/* Nota sobre WhatsApp */}
      {!canSendWhatsApp && receiptData.clientPhone && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            WhatsApp no está configurado para este negocio. 
            Puedes descargar el PDF y compartirlo manualmente.
          </p>
        </div>
      )}

      {!receiptData.clientPhone && (
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            El cliente no tiene número de teléfono registrado.
          </p>
        </div>
      )}
    </div>
  );
}
