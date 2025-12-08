import React from 'react';
import WompiWidgetMinimal from './WompiWidgetMinimal';

/**
 * RenewalPaymentFlow
 * Componente que maneja el flujo de pago para renovación de suscripciones
 * Utiliza WompiWidgetMinimal para procesar pagos 3DS v2
 */
const RenewalPaymentFlow = ({ 
  selectedPlan, 
  billingCycle,
  businessData,
  onSuccess,
  onError 
}) => {
  const getAmount = () => {
    if (billingCycle === 'YEARLY' && selectedPlan.yearlyPrice) {
      return selectedPlan.yearlyPrice;
    }
    return selectedPlan.price;
  };

  return (
    <div className="space-y-4">
      {/* Info de renovación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Renovación de Suscripción
        </h3>
        <p className="text-xs text-blue-800">
          Estás renovando tu suscripción al plan <strong>{selectedPlan.name}</strong> 
          {' '}({billingCycle === 'YEARLY' ? 'Anual' : 'Mensual'}).
          Se procesará un pago de <strong>${getAmount().toLocaleString()} COP</strong>.
        </p>
      </div>

      {/* Widget de pago Wompi con 3DS */}
      <WompiWidgetMinimal
        planName={selectedPlan.name}
        amount={getAmount()}
        businessData={businessData}
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        isRenewal={true}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
};

export default RenewalPaymentFlow;
