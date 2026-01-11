import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import PaymentProofUpload from './PaymentProofUpload';

/**
 * Componente para pagos por transferencia bancaria
 * Muestra datos bancarios y permite subir comprobante
 */
export default function TransferPayment({ 
  amount, 
  businessInfo, 
  onComplete, 
  onCancel 
}) {
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleProofUploaded = (url) => {
    setProofUrl(url);
    setShowUploader(false);
  };

  const handleConfirm = () => {
    if (!proofUrl) {
      alert('Por favor sube el comprobante de transferencia');
      return;
    }

    onComplete({
      amount,
      proofUrl,
      method: 'TRANSFER'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <BanknotesIcon className="w-10 h-10 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Pago por Transferencia
        </h3>
        <p className="text-gray-600">
          Realiza la transferencia y sube el comprobante
        </p>
      </div>

      {/* Monto */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
        <p className="text-sm text-gray-600 text-center mb-1">Monto a Transferir</p>
        <p className="text-4xl font-bold text-gray-900 text-center">
          {formatCurrency(amount)}
        </p>
      </div>

      {/* Datos Bancarios */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Datos Bancarios</h4>
        </div>
        
        <div className="p-6 space-y-4">
          {businessInfo?.bankAccounts?.map((account, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Banco</p>
                  <p className="font-semibold text-gray-900">{account.bank}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo de Cuenta</p>
                  <p className="font-medium text-gray-900">{account.accountType}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Número de Cuenta</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-lg text-gray-900">
                      {account.accountNumber}
                    </p>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Copiar"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Titular</p>
                  <p className="font-medium text-gray-900">{account.accountHolder}</p>
                </div>
                
                {account.documentNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Documento</p>
                    <p className="font-medium text-gray-900">{account.documentNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center py-6 text-gray-500">
              <p>No hay datos bancarios configurados</p>
            </div>
          )}
        </div>
      </div>

      {/* Comprobante */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <ArrowUpTrayIcon className="w-5 h-5" />
          Comprobante de Transferencia
        </h4>
        
        {proofUrl ? (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Comprobante Subido</p>
                  <p className="text-sm text-gray-600">Listo para confirmar</p>
                </div>
              </div>
              <button
                onClick={() => window.open(proofUrl, '_blank')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                Ver
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowUploader(true)}
            className="w-full border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <ArrowUpTrayIcon className="w-12 h-12 text-blue-400 mx-auto mb-3 group-hover:text-blue-600" />
            <p className="font-medium text-blue-600 mb-1">Subir Comprobante</p>
            <p className="text-sm text-blue-500">Haz clic para seleccionar una imagen</p>
          </button>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-sm font-medium text-yellow-800 mb-2">📌 Instrucciones:</p>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Realiza la transferencia por el monto indicado</li>
          <li>Toma una foto clara del comprobante</li>
          <li>Sube el comprobante usando el botón de arriba</li>
          <li>Confirma el pago</li>
        </ol>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>
        
        <button
          onClick={handleConfirm}
          disabled={!proofUrl}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Confirmar Pago
        </button>
      </div>

      {/* Modal de Subida */}
      {showUploader && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowUploader(false)} />
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subir Comprobante
                </h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <PaymentProofUpload
                onUpload={handleProofUploaded}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
