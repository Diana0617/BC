import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

/**
 * BillingCycleSelector - Componente para elegir entre facturación mensual o anual
 * 
 * @param {Object} props
 * @param {Object} props.plan - Plan de suscripción con monthlyPrice y annualPrice
 * @param {'MONTHLY'|'ANNUAL'} props.selectedCycle - Ciclo seleccionado actual
 * @param {Function} props.onCycleChange - Callback cuando cambia la selección
 * @param {boolean} props.disabled - Deshabilitar selector
 * @param {string} props.className - Clases CSS adicionales
 */
const BillingCycleSelector = ({ 
  plan, 
  selectedCycle = 'MONTHLY', 
  onCycleChange,
  disabled = false,
  className = ''
}) => {
  if (!plan) {
    return null;
  }

  const monthlyPrice = plan.monthlyPrice || plan.price || 0;
  const annualPrice = plan.annualPrice || (monthlyPrice * 12);
  const discountPercent = plan.annualDiscountPercent || 0;

  // Calcular ahorros
  const monthlyCostPerYear = monthlyPrice * 12;
  const annualSavings = monthlyCostPerYear - annualPrice;
  const actualDiscountPercent = monthlyCostPerYear > 0 
    ? Math.round((annualSavings / monthlyCostPerYear) * 100) 
    : discountPercent;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: plan.currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const cycles = [
    {
      id: 'MONTHLY',
      label: 'Mensual',
      price: monthlyPrice,
      priceLabel: `${formatPrice(monthlyPrice)}/mes`,
      description: 'Paga mes a mes',
      badge: null
    },
    {
      id: 'ANNUAL',
      label: 'Anual',
      price: annualPrice,
      priceLabel: `${formatPrice(annualPrice)}/año`,
      description: `Paga una vez al año`,
      badge: actualDiscountPercent > 0 ? `Ahorra ${actualDiscountPercent}%` : null,
      savings: actualDiscountPercent > 0 ? formatPrice(annualSavings) : null
    }
  ];

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Ciclo de facturación
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cycles.map((cycle) => {
          const isSelected = selectedCycle === cycle.id;
          
          return (
            <button
              key={cycle.id}
              type="button"
              onClick={() => !disabled && onCycleChange(cycle.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Badge de ahorro */}
              {cycle.badge && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {cycle.badge}
                </div>
              )}

              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                </div>
              )}

              <div className="text-left">
                {/* Título */}
                <h3 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                  {cycle.label}
                </h3>

                {/* Precio */}
                <p className={`text-2xl font-bold mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {cycle.priceLabel}
                </p>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-2">
                  {cycle.description}
                </p>

                {/* Info de ahorro para plan anual */}
                {cycle.id === 'ANNUAL' && cycle.savings && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Ahorras {cycle.savings} al año
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      vs. pago mensual ({formatPrice(monthlyPrice)} × 12)
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mensaje informativo */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        {selectedCycle === 'MONTHLY' 
          ? 'Se renovará automáticamente cada mes'
          : 'Se renovará automáticamente cada año'
        }
      </p>
    </div>
  );
};

export default BillingCycleSelector;
