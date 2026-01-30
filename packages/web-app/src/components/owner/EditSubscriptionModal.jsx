import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerPlans } from '@shared/store/slices/ownerPlansSlice';
import { updateSubscription } from '@shared/store/slices/ownerSubscriptionSlice';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditSubscriptionModal = ({ isOpen, onClose, subscriptionData, onSuccess }) => {
  const dispatch = useDispatch();
  const { plans, loading: plansLoading } = useSelector(state => state.ownerPlans);
  const { loading } = useSelector(state => state.ownerSubscription);
  
  const [formData, setFormData] = useState({
    planId: '',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    isLifetime: false
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchOwnerPlans());
      
      // Cargar datos existentes de la suscripción
      if (subscriptionData?.subscription) {
        const sub = subscriptionData.subscription;
        setFormData({
          planId: sub.planId || sub.subscriptionPlanId || '',
          billingCycle: sub.billingCycle || 'MONTHLY',
          status: sub.status || 'ACTIVE',
          startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : '',
          endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '',
          isLifetime: sub.billingCycle === 'LIFETIME'
        });
      }
    }
  }, [isOpen, dispatch, subscriptionData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subscriptionData?.subscription?.id) {
      toast.error('No se encontró la suscripción a editar');
      return;
    }

    try {
      const updateData = {
        planId: formData.planId,
        billingCycle: formData.isLifetime ? 'LIFETIME' : formData.billingCycle,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      const result = await dispatch(updateSubscription({
        subscriptionId: subscriptionData.subscription.id,
        updateData
      }));

      if (updateSubscription.fulfilled.match(result)) {
        toast.success('Suscripción actualizada correctamente');
        onSuccess();
        onClose();
      } else {
        toast.error(result.payload || 'Error al actualizar la suscripción');
      }
    } catch (error) {
      console.error('Error al actualizar suscripción:', error);
      toast.error('Error al actualizar la suscripción');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Suscripción</h2>
            <p className="text-sm text-gray-600 mt-1">
              {subscriptionData?.business?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData(prev => ({ ...prev, planId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={plansLoading}
            >
              <option value="">Seleccionar plan...</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price.toLocaleString()} COP/{plan.interval}
                </option>
              ))}
            </select>
          </div>

          {/* Acceso de por vida */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isLifetime"
              checked={formData.isLifetime}
              onChange={(e) => setFormData(prev => ({ ...prev, isLifetime: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isLifetime" className="text-sm font-medium text-gray-700">
              🎁 Acceso de por vida (LIFETIME)
            </label>
          </div>

          {/* Ciclo de facturación */}
          {!formData.isLifetime && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciclo de Facturación
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="MONTHLY">Mensual</option>
                <option value="ANNUAL">Anual</option>
              </select>
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="ACTIVE">Activa</option>
              <option value="SUSPENDED">Suspendida</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="EXPIRED">Expirada</option>
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={formData.isLifetime}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading.updating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              disabled={loading.updating}
            >
              {loading.updating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionModal;
