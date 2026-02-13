import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { XIcon, CreditCardIcon, CheckCircleIcon, AlertCircleIcon, Loader2 } from 'lucide-react';
import { fetchPublicPlans } from '@shared/store/slices/plansSlice';
import RenewalPaymentFlow from './RenewalPaymentFlow';

const RenewSubscriptionModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { plans, loading: plansLoading } = useSelector((state) => state.plans);
  
  const [step, setStep] = useState('plan-selection'); // plan-selection, payment, processing, success
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicPlans());
  }, [dispatch]);

  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCycleChange = (cycle) => {
    setBillingCycle(cycle);
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    setStep('payment');
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('✅ Renovación completada:', paymentData);
    setPaymentResult(paymentData.transaction || paymentData);
    setStep('success');
    
    // Completar después de un breve delay
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(paymentData);
      }
      // Redirigir al dashboard con recarga completa
      window.location.href = '/business/dashboard';
    }, 2500);
  };

  const handleBackToPlanSelection = () => {
    setStep('plan-selection');
    setSelectedPlan(null);
  };

  // Renderizar paso de selección de plan
  const renderPlanSelection = () => {
    // Filtrar planes activos y excluir LIFETIME (solo para owner)
    const activePlans = Array.isArray(plans) 
      ? plans.filter(p => p.status === 'ACTIVE' && p.billingCycle !== 'LIFETIME') 
      : [];

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Renueva tu Suscripción</h3>
          <p className="text-gray-600">Selecciona un plan para continuar disfrutando de todos los beneficios</p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => handleCycleChange('MONTHLY')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => handleCycleChange('YEARLY')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'YEARLY'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual <span className="text-xs text-green-600 ml-1">(Ahorra 20%)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : activePlans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No hay planes disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {activePlans.map((plan) => {
              // Calcular precio según ciclo de facturación
              const monthlyPrice = plan.monthlyPrice || plan.price || 0;
              const yearlyPrice = plan.annualPrice || (monthlyPrice * 12 * 0.8); // 20% descuento si no existe annualPrice
              const price = billingCycle === 'MONTHLY' ? monthlyPrice : yearlyPrice;
              const isSelected = selectedPlan?.id === plan.id;
              const monthlyEquivalent = billingCycle === 'YEARLY' ? (yearlyPrice / 12) : null;

              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  )}

                  <h4 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{plan.description}</p>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      por {billingCycle === 'MONTHLY' ? 'mes' : 'año'}
                    </div>
                    {monthlyEquivalent && (
                      <div className="text-xs text-green-600 mt-1">
                        ~{formatPrice(monthlyEquivalent)}/mes
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-xs text-gray-500 italic">
                          +{plan.features.length - 4} más...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={!selectedPlan}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedPlan
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CreditCardIcon className="h-5 w-5" />
            Continuar al pago
          </button>
        </div>
      </div>
    );
  };

  // Renderizar paso de pago
  const renderPayment = () => {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Procesar Pago</h3>
            <p className="text-sm text-gray-600">Plan: {selectedPlan?.name} - {billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}</p>
          </div>
          <button
            onClick={handleBackToPlanSelection}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Cambiar plan
          </button>
        </div>

        {/* Renewal Payment Flow */}
        <RenewalPaymentFlow
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          businessData={{
            businessId: user?.businessId,
            businessName: user?.businessName || 'Mi Negocio',
            email: user?.email
          }}
          onSuccess={handlePaymentSuccess}
          onError={(error) => {
            console.error('❌ Error en renovación:', error);
          }}
        />
      </div>
    );
  };

  // Renderizar paso de éxito
  const renderSuccess = () => {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Renovación Exitosa!</h3>
        <p className="text-gray-600 mb-2">Tu suscripción ha sido renovada correctamente</p>
        <p className="text-sm text-gray-500">Tus datos han sido restaurados y tienes acceso completo</p>
        
        {paymentResult && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-xs text-gray-500 mb-1">Referencia de transacción:</p>
            <p className="text-sm font-mono text-gray-700">{paymentResult.reference || paymentResult.id}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-6">Redirigiendo...</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Renovar Suscripción</h2>
          </div>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 'plan-selection' && renderPlanSelection()}
          {step === 'payment' && renderPayment()}
          {step === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default RenewSubscriptionModal;
