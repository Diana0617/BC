import React from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

const PlanSelection = ({ plans = [], loading, onPlanSelect, invitationToken }) => {
  
  // Debug: Ver qué viene del backend
  console.log('PlanSelection - Plans from backend:', plans)
  console.log('PlanSelection - Loading state:', loading)
  console.log('PlanSelection - Plans length:', plans.length)
  
  // Debug: Ver trial days en los planes del backend
  if (plans.length > 0) {
    console.log('Trial days check:', plans.map(p => ({ name: p.name, trialDays: p.trialDays })))
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando planes disponibles...</p>
      </div>
    )
  }

  // Si no hay planes disponibles del backend
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No hay planes disponibles
        </h2>
        <p className="text-gray-600 mb-6">
          Lo sentimos, no pudimos cargar los planes de suscripción en este momento.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Recargar página
        </button>
      </div>
    )
  }

  console.log('PlanSelection - Plans to show:', plans)
  console.log('PlanSelection - Using backend plans:', plans.length > 0)

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP'
    }).format(price)
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-cyan-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
          Elige el plan perfecto para tu negocio
        </h1>
        <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto">
          Gestiona tu negocio con nuestro sistema completo. 
          Sin compromisos a largo plazo, cancela cuando quieras.
        </p>
        {invitationToken && (
          <div className="mt-6 p-3 sm:p-4 bg-yellow-100 border border-yellow-300 rounded-lg max-w-md mx-auto shadow-lg">
            <p className="text-yellow-900 font-medium text-sm sm:text-base">
              🎉 ¡Has sido invitado por Business Control!
            </p>
            <p className="text-yellow-700 text-xs sm:text-sm mt-1">
              Disfruta de condiciones especiales en tu suscripción
            </p>
          </div>
        )}
      </div>

      {/* Plans grid estilo landing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-2 sm:px-0">
        {plans.map((plan, idx) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-plan-lg border-2 ${
              plan.popular 
                ? 'border-yellow-400 ring-2 sm:ring-4 ring-yellow-400 scale-100 sm:scale-105 z-10' 
                : idx === 0 ? 'border-cyan-400' : idx === 1 ? 'border-yellow-400' : 'border-red-400'
            } p-4 sm:p-8 flex flex-col h-full transition-all duration-300 hover:shadow-3xl hover:-translate-y-2`}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-max">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  MÁS POPULAR
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                {plan.name}
              </h3>
              <p className="text-xs sm:text-gray-600 mb-2 sm:mb-4">
                {plan.description}
              </p>
              {/* Price */}
              <div className="mb-2 sm:mb-4">
                <span className="text-xl sm:text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-gray-600 ml-1 sm:ml-2 text-xs sm:text-base">
                  /mes
                </span>
              </div>
            </div>

            {/* Content area that grows */}
            <div className="flex-1">
              {/* Modules */}
              <div className="mb-4 sm:mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">
                  📦 Módulos del Sistema
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {plan.modules && Array.isArray(plan.modules) ? (
                    (() => {
                      return plan.modules.map((module, index) => {
                        const isIncluded = module.isIncluded || 
                                         module.included || 
                                         module.PlanModule?.isIncluded || 
                                         false
                        return (
                          <div key={index} className="flex items-center justify-between py-1">
                            <div className="flex items-center flex-1">
                              {isIncluded ? (
                                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                              ) : (
                                <XCircleIcon className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`text-xs sm:text-sm font-medium block ${isIncluded ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {module.displayName || module.name}
                                </span>
                                <p className={`text-xs ${isIncluded ? 'text-gray-600' : 'text-gray-400'} truncate`}>
                                  {module.description || 'Módulo del sistema'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()
                  ) : (
                    Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start py-1">
                        <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
                      </div>
                    )) : (
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs sm:text-sm">Funcionalidades básicas incluidas</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Additional Features */}
              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">
                    ⭐ Beneficios Adicionales
                  </h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-3 h-3 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-xs">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-500 text-center pt-1">
                        +{plan.features.length - 4} beneficios más
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {plan.limitations && Array.isArray(plan.limitations) && plan.limitations.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="font-semibold text-gray-600 mb-2 sm:mb-3 text-center text-xs sm:text-base">
                    ⚠️ Limitaciones
                  </h4>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span className="text-gray-500 text-xs">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom section with CTA */}
            <div className="mt-auto pt-2 sm:pt-4">
              {/* CTA Button */}
              <button
                onClick={() => onPlanSelect(plan)}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl inline-flex items-center justify-center ${
                  idx === 0 ? 'bg-cyan-400 hover:bg-cyan-500 text-white' :
                  idx === 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' :
                  'bg-red-400 hover:bg-red-500 text-white'
                }`}
              >
                {plan.popular ? 'Comenzar Ahora' : 'Seleccionar Plan'}
              </button>
              {/* Free trial note */}
              <p className="text-center text-gray-500 text-xs mt-2 sm:mt-3">
                {plan.trialDays || 14} días de prueba gratuita
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional info */}
      <div className="text-center mt-8 sm:mt-12 space-y-2 sm:space-y-4 px-2 sm:px-0">
        <p className="text-gray-700 text-sm sm:text-base font-semibold">
          Todos los planes incluyen prueba gratuita
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-gray-700 font-medium">
          <span className="flex items-center">
            ✓ Sin compromisos a largo plazo
          </span>
          <span className="flex items-center">
            ✓ Cancela cuando quieras
          </span>
          <span className="flex items-center">
            ✓ Soporte en español
          </span>
        </div>
      </div>
    </div>
  )
}

export default PlanSelection