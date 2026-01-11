import React from 'react';
import { 
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ArrowsRightLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

/**
 * Selector de métodos de pago
 * Muestra los métodos activos del negocio incluyendo Wompi
 */
export default function PaymentMethodSelector({ 
  methods, 
  onSelect, 
  currentAmount,
  existingPayments = []
}) {
  const getMethodIcon = (code) => {
    const icons = {
      CASH: BanknotesIcon,
      WOMPI_CARD: CreditCardIcon,
      WOMPI_NEQUI: DevicePhoneMobileIcon,
      TRANSFER: ArrowsRightLeftIcon,
      CARD: CreditCardIcon
    };
    return icons[code] || BanknotesIcon;
  };

  const getMethodColor = (code) => {
    const colors = {
      CASH: 'from-green-500 to-emerald-600',
      WOMPI_CARD: 'from-blue-500 to-indigo-600',
      WOMPI_NEQUI: 'from-purple-500 to-pink-600',
      TRANSFER: 'from-orange-500 to-red-600',
      CARD: 'from-cyan-500 to-blue-600'
    };
    return colors[code] || 'from-gray-500 to-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const totalPaid = existingPayments.reduce((sum, payment) => 
    sum + parseFloat(payment.amount || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Resumen de Monto */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Monto a Pagar</p>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(currentAmount)}
          </p>
          
          {totalPaid > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-600">
                Pagado anteriormente: <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Métodos de Pago */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Selecciona el método de pago
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methods.map((method) => {
            const Icon = getMethodIcon(method.code);
            const colorClass = getMethodColor(method.code);
            
            return (
              <button
                key={method.id}
                onClick={() => onSelect(method)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${colorClass} p-3 rounded-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h5 className="font-semibold text-gray-900 text-lg">
                        {method.name}
                      </h5>
                      {method.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {method.description}
                        </p>
                      )}
                      
                      {/* Badges especiales */}
                      {method.code.includes('WOMPI') && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Pago en línea
                        </span>
                      )}
                      
                      {method.code === 'CASH' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Inmediato
                        </span>
                      )}
                    </div>
                    
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 mb-1">Información</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Puedes usar múltiples métodos de pago</li>
              <li>• Los pagos en línea son procesados de forma segura</li>
              <li>• Se generará un recibo automáticamente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Opción de agregar productos */}
      {currentAmount === 0 && (
        <button
          onClick={() => onSelect({ code: 'PRODUCTS_ONLY', name: 'Vender Productos' })}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium text-gray-600 group-hover:text-blue-600">
              Agregar Productos a la Venta
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
