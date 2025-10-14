/**
 * Modal para Crear Voucher Manual
 * Permite al negocio crear vouchers de compensación para clientes
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  XMarkIcon,
  TicketIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/client';

const CreateVoucherModal = ({ client, onClose, onSuccess }) => {
  const { currentBusiness } = useSelector(state => state.business);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    expiresInDays: '90',
    notes: ''
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
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validar monto
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    // Validar días de expiración
    if (!formData.expiresInDays || formData.expiresInDays < 1) {
      newErrors.expiresInDays = 'Los días deben ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(
        `/api/business/${currentBusiness.id}/clients/${client.id}/vouchers`,
        {
          amount: parseFloat(formData.amount),
          expiresInDays: parseInt(formData.expiresInDays),
          notes: formData.notes || null
        }
      );

      if (response.data.success) {
        toast.success(`Voucher creado: ${response.data.data.code}`);
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        onClose();
      } else {
        toast.error(response.data.message || 'Error al crear el voucher');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(error.response?.data?.message || 'Error al crear el voucher');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = () => {
    if (!formData.expiresInDays) return '';
    const date = new Date();
    date.setDate(date.getDate() + parseInt(formData.expiresInDays));
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TicketIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Crear Voucher Manual
                </h3>
                <p className="text-sm text-gray-500">
                  Para: {client.firstName} {client.lastName}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Monto */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Monto del Voucher *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="1000"
                  className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Valor en pesos colombianos (COP)
              </p>
            </div>

            {/* Días de validez */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Días de Validez *
              </label>
              <input
                type="number"
                name="expiresInDays"
                value={formData.expiresInDays}
                onChange={handleChange}
                min="1"
                max="365"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.expiresInDays ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.expiresInDays && (
                <p className="mt-1 text-sm text-red-600">{errors.expiresInDays}</p>
              )}
              {formData.expiresInDays && (
                <p className="mt-1 text-xs text-gray-500">
                  Expira el: <span className="font-medium">{calculateExpiryDate()}</span>
                </p>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Notas / Razón (Opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Ej: Compensación por cancelación de última hora, cortesía del negocio..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Esta nota será visible en el detalle del voucher
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <TicketIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">
                    ¿Qué es un voucher?
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Un voucher es un cupón que el cliente puede usar para agendar un nuevo servicio 
                    sin realizar pago adicional (hasta el monto del voucher). Se generan automáticamente 
                    al cancelar citas, o pueden crearse manualmente como compensación.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        </div>
      </div>
    </div>
  );
};

export default CreateVoucherModal;
