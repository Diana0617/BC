import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  DollarSignIcon,
  CalendarIcon,
  CreditCardIcon,
  UploadIcon,
  FileTextIcon,
  AlertCircleIcon
} from 'lucide-react';
import supplierInvoiceApi from '../../../../api/supplierInvoiceApi';

const PayInvoiceModal = ({ invoice, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: invoice.remainingAmount || invoice.total,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'TRANSFER',
    reference: '',
    receipt: null,
    notes: ''
  });

  const [receiptPreview, setReceiptPreview] = useState(null);

  const paymentMethods = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'TRANSFER', label: 'Transferencia Bancaria' },
    { value: 'CHECK', label: 'Cheque' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Solo se permiten imágenes o archivos PDF');
      return;
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      receipt: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.amount || formData.amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (parseFloat(formData.amount) > invoice.remainingAmount) {
      setError(`El monto no puede exceder el saldo pendiente de $${formatCurrency(invoice.remainingAmount)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // El backend manejará la subida a Cloudinary
      const response = await supplierInvoiceApi.registerPayment(
        user.businessId,
        invoice.id,
        {
          amount: parseFloat(formData.amount),
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          reference: formData.reference,
          receipt: formData.receipt, // Archivo directo, no URL
          notes: formData.notes
        }
      );

      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error registering payment:', err);
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
            <p className="text-sm text-gray-600">
              Factura: {invoice.invoiceNumber} - {invoice.supplier?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Info de la factura */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Factura:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Saldo Pendiente:</span>
              <span className="ml-2 font-semibold text-orange-600">
                {formatCurrency(invoice.remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del Pago *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSignIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                max={invoice.remainingAmount}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Máximo: {formatCurrency(invoice.remainingAmount)}
            </p>
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Pago *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia / Nº de Transacción
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: TRANS-123456, Cheque #789"
            />
          </div>

          {/* Comprobante de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprobante de Pago (Opcional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                {receiptPreview ? (
                  <div className="relative">
                    <img
                      src={receiptPreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptPreview(null);
                        setFormData(prev => ({ ...prev, receipt: null }));
                      }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Subir archivo</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF hasta 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional sobre el pago..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Registrando pago...
                </>
              ) : (
                <>
                  <DollarSignIcon className="w-5 h-5" />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayInvoiceModal;
