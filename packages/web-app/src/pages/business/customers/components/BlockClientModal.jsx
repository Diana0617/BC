/**
 * Modal para Bloquear Cliente
 * Permite bloquear temporalmente a un cliente para que no pueda agendar citas
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  XMarkIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/client';

const BlockClientModal = ({ client, onClose, onSuccess }) => {
  const { currentBusiness } = useSelector(state => state.business);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    reason: 'MANUAL',
    durationDays: '30',
    notes: ''
  });

  const reasonOptions = [
    { value: 'MANUAL', label: 'Bloqueo Manual' },
    { value: 'EXCESSIVE_CANCELLATIONS', label: 'Cancelaciones Excesivas' },
    { value: 'NO_SHOW', label: 'No Se Presentó a Citas' },
    { value: 'OTHER', label: 'Otra Razón' }
  ];

  const durationOptions = [
    { value: '7', label: '7 días' },
    { value: '15', label: '15 días' },
    { value: '30', label: '30 días (recomendado)' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.confirm(
      `¿Estás seguro de bloquear a ${client.firstName} ${client.lastName}?\n\n` +
      `El cliente no podrá agendar citas durante ${formData.durationDays} días.`
    )) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post(
        `/api/business/${currentBusiness.id}/clients/${client.id}/block`,
        {
          reason: formData.reason,
          durationDays: parseInt(formData.durationDays),
          notes: formData.notes || null
        }
      );

      if (response.data.success) {
        toast.success('Cliente bloqueado exitosamente');
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        onClose();
      } else {
        toast.error(response.data.message || 'Error al bloquear cliente');
      }
    } catch (error) {
      console.error('Error blocking client:', error);
      toast.error(error.response?.data?.error || 'Error al bloquear cliente');
    } finally {
      setLoading(false);
    }
  };

  const calculateUnblockDate = () => {
    if (!formData.durationDays) return '';
    const date = new Date();
    date.setDate(date.getDate() + parseInt(formData.durationDays));
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
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <NoSymbolIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bloquear Cliente
                </h3>
                <p className="text-sm text-gray-500">
                  {client.firstName} {client.lastName}
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

          {/* Warning Alert */}
          <div className="mx-6 mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-amber-900">
                  ⚠️ Advertencia Importante
                </h4>
                <p className="mt-1 text-sm text-amber-700">
                  Al bloquear este cliente, <strong>no podrá agendar nuevas citas</strong> durante 
                  el período especificado. Esta acción es reversible y puedes desbloquear al cliente 
                  en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Razón del bloqueo */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <NoSymbolIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Razón del Bloqueo *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {reasonOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duración del bloqueo */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Duración del Bloqueo *
              </label>
              <select
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.durationDays && (
                <p className="mt-1 text-xs text-gray-500">
                  El bloqueo se levantará automáticamente el: <span className="font-medium">{calculateUnblockDate()}</span>
                </p>
              )}
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                Notas Adicionales (Opcional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Ej: Cliente canceló 3 citas consecutivas sin aviso previo..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Estas notas serán visibles en el historial del bloqueo
              </p>
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bloqueando...
                </>
              ) : (
                <>
                  <NoSymbolIcon className="h-4 w-4 mr-2" />
                  Bloquear Cliente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockClientModal;
