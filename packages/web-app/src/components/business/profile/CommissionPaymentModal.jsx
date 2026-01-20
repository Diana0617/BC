import React, { useState } from 'react';
import {
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CommissionPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  specialist,
  details,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);

  // Calcular el monto pendiente total
  const pendingAmount = details?.services?.reduce((sum, service) => {
    return sum + (service.isPaid ? 0 : service.commission);
  }, 0) || 0;

  React.useEffect(() => {
    if (isOpen && pendingAmount > 0) {
      setFormData(prev => ({
        ...prev,
        amount: pendingAmount.toString()
      }));
    }
  }, [isOpen, pendingAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, paymentProof: 'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF' }));
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentProof: 'El archivo no debe superar 5MB' }));
        return;
      }

      setPaymentProofFile(file);
      setErrors(prev => ({ ...prev, paymentProof: '' }));

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  const removeFile = () => {
    setPaymentProofFile(null);
    setPaymentProofPreview(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }

    const amount = parseFloat(formData.amount);
    if (amount > pendingAmount) {
      newErrors.amount = `El monto no puede ser mayor al pendiente (${formatCurrency(pendingAmount)})`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Selecciona una fecha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await onSubmit(formData, paymentProofFile);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white" id="modal-title">
                Registrar Pago de Comisión
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Specialist Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <UserCircleIcon className="h-12 w-12 text-pink-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {specialist?.firstName} {specialist?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{specialist?.email}</p>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Comisiones Generadas</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(specialist?.totalCommissionsGenerated || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ya Pagadas</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(specialist?.totalCommissionsPaid || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendientes</p>
                      <p className="text-sm font-semibold text-yellow-600">
                        {formatCurrency(pendingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Summary */}
            {details?.services && details.services.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Servicios del Período ({format(new Date(details.period?.year, details.period?.month - 1), 'MMMM yyyy', { locale: es })})
                </h4>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Servicio</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cliente</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Comisión</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {details.services.map((service, index) => (
                        <tr key={index} className={service.isPaid ? 'bg-green-50' : ''}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {format(new Date(service.date), 'dd/MM/yy', { locale: es })}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{service.serviceName}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{service.clientName}</td>
                          <td className="px-4 py-2 text-sm font-medium text-pink-600 text-right">
                            {formatCurrency(service.commission)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {service.isPaid ? (
                              <span className="text-xs text-green-600 font-medium">✓ Pagado</span>
                            ) : (
                              <span className="text-xs text-yellow-600 font-medium">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monto */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Monto a Pagar <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max={pendingAmount}
                        className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          errors.amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Máximo: {formatCurrency(pendingAmount)}
                    </p>
                  </div>

                  {/* Fecha de Pago */}
                  <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Pago <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        id="paymentDate"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.paymentDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
                    )}
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="CASH">Efectivo</option>
                      <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                      <option value="DIGITAL_WALLET">Billetera Digital (Nequi, Daviplata, etc.)</option>
                      <option value="CHECK">Cheque</option>
                    </select>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas o Referencia
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Ej: Pago quincenal, Ref: 123456..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Comprobante de Pago */}
                <div>
                  <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-1">
                    Comprobante de Pago (Opcional)
                  </label>
                  
                  {!paymentProofFile ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="paymentProof"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                          >
                            <span>Subir comprobante</span>
                            <input
                              id="paymentProof"
                              name="paymentProof"
                              type="file"
                              className="sr-only"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP, PDF hasta 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 border-2 border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {paymentProofPreview ? (
                            <img
                              src={paymentProofPreview}
                              alt="Preview"
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{paymentProofFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errors.paymentProof && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentProof}</p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> Al registrar este pago se creará automáticamente:
                      </p>
                      <ul className="mt-2 text-xs text-blue-600 list-disc list-inside space-y-1">
                        <li>Un gasto en la categoría "Comisiones a Especialistas"</li>
                        <li>Un movimiento financiero de egreso</li>
                        <li>El registro de pago en el historial del especialista</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || pendingAmount === 0}
                  className="w-full sm:w-auto px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                      Registrar Pago
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionPaymentModal;
