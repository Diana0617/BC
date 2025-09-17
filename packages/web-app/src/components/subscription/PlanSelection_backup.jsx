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
          included: true
        },
        {
          name: 'Pagos',
          description: 'Integración con Wompi y otros',
          included: true
        },
        {
          name: 'Marketing',
          description: 'Campañas básicas por email/SMS',
          included: true
        },
        {
          name: 'Analytics',
          description: 'Análisis básicos de rendimiento',
          included: false
        }
      ],
      features: [
        'Hasta 10 especialistas',
        'Gestión avanzada de citas',
        'CRM completo de clientes',
        'Gestión de inventario',
        'Reportes detallados',
        'Integración de pagos',
        'Recordatorios automáticos',
        'Soporte prioritario'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Plan Empresarial',
      price: 99900,
      currency: 'COP',
      billingPeriod: 'MONTHLY',
      trialDays: 45,
      description: 'Para salones establecidos que necesitan todas las funciones',
      modules: [
        {
          name: 'Gestión de Citas',
          description: 'Sistema completo multi-ubicación',
          included: true
        },
        {
          name: 'Clientes',
          description: 'CRM empresarial con segmentación',
          included: true
        },
        {
          name: 'Especialistas',
          description: 'Especialistas ilimitados',
          included: true
        },
        {
          name: 'Reportes',
          description: 'Dashboard ejecutivo personalizable',
          included: true
        },
        {
          name: 'Inventario',
          description: 'Gestión multi-sucursal avanzada',
          included: true
        },
        {
          name: 'Pagos',
          description: 'Integraciones personalizadas',
          included: true
        },
        {
          name: 'Marketing',
          description: 'Suite completa de marketing',
          included: true
        },
        {
          name: 'Analytics',
          description: 'BI avanzado con predicciones',
          included: true
        }
      ],
      features: [
        'Especialistas ilimitados',
        'Múltiples ubicaciones',
        'Analytics avanzados',
        'API personalizada',
        'Integraciones personalizadas',
        'Soporte 24/7',
        'Capacitación personalizada',
        'Manager dedicado'
      ],
      limitations: [],
      popular: false
    }
  ]

  const plansToShow = plans.length > 0 ? plans : mockPlans

  console.log('PlanSelection - Plans to show:', plansToShow)
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Elige el plan perfecto para tu negocio
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Gestiona tu negocio con nuestro sistema completo. 
          Sin compromisos a largo plazo, cancela cuando quieras.
        </p>
        
        {invitationToken && (
          <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg max-w-md mx-auto">
            <p className="text-pink-800 font-medium">
              🎉 ¡Has sido invitado por Business Control!
            </p>
            <p className="text-pink-600 text-sm mt-1">
              Disfruta de condiciones especiales en tu suscripción
            </p>
          </div>
        )}
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plansToShow.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg border ${
              plan.popular 
                ? 'border-pink-500 ring-2 ring-pink-500 ring-opacity-50' 
                : 'border-gray-200'
            } p-6 transition-all duration-200 hover:shadow-xl flex flex-col h-full`}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {plan.description}
              </p>
              
              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-gray-600 ml-2">
                  /mes
                </span>
              </div>
            </div>

            {/* Content area that grows */}
            <div className="flex-1">
              {/* Modules */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-center">
                  📦 Módulos del Sistema
                </h4>
                <div className="space-y-2">
                  {plan.modules && Array.isArray(plan.modules) ? (
                    (() => {
                      console.log(`Plan ${plan.name} - Full modules structure:`, JSON.stringify(plan.modules, null, 2))
                      return plan.modules.map((module, index) => {
                        // El backend puede tener la información en diferentes lugares
                        const isIncluded = module.isIncluded || 
                                         module.included || 
                                         module.PlanModule?.isIncluded || 
                                         false
                        
                        console.log(`Module ${module.name} - Object:`, module)
                        console.log(`Module ${module.name} - Final isIncluded: ${isIncluded}`)
                        
                        return (
                          <div key={index} className="flex items-center justify-between py-1">
                            <div className="flex items-center flex-1">
                              {isIncluded ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              ) : (
                                <XCircleIcon className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-medium block ${isIncluded ? 'text-gray-900' : 'text-gray-400'}`}>
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
                    // Fallback para planes que no tienen módulos definidos
                    Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start py-1">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    )) : (
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">Funcionalidades básicas incluidas</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Additional Features */}
              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-center">
                    ⭐ Beneficios Adicionales
                  </h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-3 h-3 text-pink-500 mr-2 mt-1 flex-shrink-0" />
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
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-600 mb-3 text-center">
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
            <div className="mt-auto pt-4">
              {/* CTA Button */}
              <button
                onClick={() => onPlanSelect(plan)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                {plan.popular ? 'Comenzar Ahora' : 'Seleccionar Plan'}
              </button>

              {/* Free trial note */}
              <p className="text-center text-gray-500 text-xs mt-3">
                {plan.trialDays || 14} días de prueba gratuita
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional info */}
      <div className="text-center mt-12 space-y-4">
        <p className="text-gray-600">
          Todos los planes incluyen prueba gratuita
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
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