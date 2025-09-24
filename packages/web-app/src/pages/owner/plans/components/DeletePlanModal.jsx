import React from 'react';
import { useOwnerPlans } from '@shared';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const DeletePlanModal = ({ isOpen, plan, onClose }) => {
  const { actions, deleteLoading } = useOwnerPlans();

  // Validación para evitar errores
  if (!isOpen || !plan) {
    return null;
  }

  const formatPrice = (price, currency = 'COP') => {
    // Convertir string a number si es necesario
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericPrice);
  };

  const handleDelete = async () => {
    try {
      await actions.deletePlan(plan.id);
      onClose();
    } catch (error) {
      console.error('Error eliminando plan:', error);
    }
  };

  const hasActiveSubscriptions = plan.subscriptionsCount > 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg bg-white rounded-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Eliminar Plan
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={deleteLoading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {hasActiveSubscriptions ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No se puede eliminar este plan
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Este plan tiene <strong>{plan.subscriptionsCount} suscripción(es) activa(s)</strong> y no puede ser eliminado. 
                      Primero debes migrar o cancelar todas las suscripciones asociadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      ¿Estás seguro que deseas eliminar este plan?
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Esta acción no se puede deshacer. El plan será marcado como depreciado.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Plan a eliminar:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nombre:</span>
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className="text-sm font-medium text-gray-900">{plan.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Suscripciones:</span>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {plan.subscriptionsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={deleteLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          {!hasActiveSubscriptions && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Eliminar Plan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { DeletePlanModal };