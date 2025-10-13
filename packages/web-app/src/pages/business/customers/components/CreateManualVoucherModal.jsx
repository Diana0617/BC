/**
 * Modal para Crear Voucher Manual
 * Componente con Tailwind CSS para crear vouchers de cortesía/compensación
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  XMarkIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { createManualVoucher } from '@shared/store/slices/voucherSlice';
import { selectOperationLoading } from '@shared/store/selectors/voucherSelectors';
import toast from 'react-hot-toast';

const CreateManualVoucherModal = ({ client, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectOperationLoading);

  const [formData, setFormData] = useState({
    amount: '',
    validityDays: 30,
    reason: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }

    if (!formData.validityDays || parseInt(formData.validityDays) < 1) {
      newErrors.validityDays = 'Ingresa días de validez válidos';
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Ingresa un motivo (mínimo 10 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(createManualVoucher({
        customerId: client.id,
        amount: parseFloat(formData.amount),
        validityDays: parseInt(formData.validityDays),
        reason: formData.reason.trim()
      }));

      if (createManualVoucher.fulfilled.match(result)) {
        toast.success('✅ Voucher creado exitosamente');
        onSuccess();
      } else {
        toast.error(result.payload || 'Error al crear voucher');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Error al crear voucher');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TicketIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Crear Voucher de Cortesía
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Para {client.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Monto */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Monto del Voucher
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Monto en COP (peso colombiano)
              </p>
            </div>

            {/* Días de validez */}
            <div>
              <label htmlFor="validityDays" className="block text-sm font-medium text-gray-700 mb-2">
                Días de Validez
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="validityDays"
                  name="validityDays"
                  value={formData.validityDays}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.validityDays ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.validityDays && (
                <p className="mt-1 text-sm text-red-600">{errors.validityDays}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                El voucher expirará después de este período
              </p>
            </div>

            {/* Motivo */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Creación
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ej: Compensación por inconveniente en el servicio del día..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    errors.reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Este motivo quedará registrado en el historial
              </p>
            </div>

            {/* Información del cliente */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Información del Cliente
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Nombre:</span> {client.name}</p>
                <p><span className="font-medium">Email:</span> {client.email}</p>
                <p><span className="font-medium">Teléfono:</span> {client.phone || 'No disponible'}</p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <TicketIcon className="h-4 w-4 mr-2" />
                    Crear Voucher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateManualVoucherModal;
