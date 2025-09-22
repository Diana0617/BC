import React from 'react'
import { useSelector } from 'react-redux'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BellIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const SubscriptionSection = ({ isSetupMode }) => {
  const business = useSelector(state => state.business?.currentBusiness)
  const isLoading = useSelector(state => state.business?.isLoading)
  
  // Obtener información de suscripción del negocio
  const currentSubscription = business?.subscriptions?.find(sub => 
    sub.status === 'ACTIVE' || sub.status === 'TRIAL'
  ) || business?.subscriptions?.[0]
  
  // Funciones auxiliares para fechas y pagos
  const calculateDaysRemaining = (expirationDate) => {
    if (!expirationDate) return 0
    const today = new Date()
    const expiry = new Date(expirationDate)
    const diffTime = expiry - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getNextPaymentInfo = () => {
    if (business.status === 'TRIAL') {
      return {
        isTrialMode: true,
        daysRemaining: calculateDaysRemaining(business.trialExpiresAt),
        expirationDate: business.trialExpiresAt,
        nextPaymentDate: business.trialExpiresAt,
        amount: business.plan?.price || 0
      }
    }
    
    return {
      isTrialMode: false,
      daysRemaining: calculateDaysRemaining(currentSubscription?.expiresAt),
      expirationDate: currentSubscription?.expiresAt,
      nextPaymentDate: currentSubscription?.nextPaymentDate || currentSubscription?.expiresAt,
      amount: currentSubscription?.amount || business.plan?.price || 0
    }
  }

  // Determinar el estado efectivo considerando trial
  const getEffectiveStatus = () => {
    // Si el negocio está en trial, mostrar como activo
    if (business?.status === 'TRIAL' && business?.trialEndDate) {
      const trialEnd = new Date(business.trialEndDate)
      const now = new Date()
      return trialEnd > now ? 'TRIAL_ACTIVE' : 'TRIAL_EXPIRED'
    }
    
    // Si no, usar el estado de la suscripción
    return currentSubscription?.status || 'PENDING'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': {
        color: 'text-green-700 bg-green-100',
        icon: CheckCircleIcon,
        label: 'Activa'
      },
      'TRIAL_ACTIVE': {
        color: 'text-blue-700 bg-blue-100',
        icon: CheckCircleIcon,
        label: 'Trial Activo'
      },
      'TRIAL_EXPIRED': {
        color: 'text-red-700 bg-red-100',
        icon: ExclamationTriangleIcon,
        label: 'Trial Vencido'
      },
      'EXPIRED': {
        color: 'text-red-700 bg-red-100',
        icon: ExclamationTriangleIcon,
        label: 'Vencida'
      },
      'SUSPENDED': {
        color: 'text-yellow-700 bg-yellow-100',
        icon: ExclamationTriangleIcon,
        label: 'Suspendida'
      },
      'PENDING': {
        color: 'text-blue-700 bg-blue-100',
        icon: ClockIcon,
        label: 'Pendiente'
      }
    }

    const config = statusConfig[status] || statusConfig['PENDING']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!business || !currentSubscription) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sin información de suscripción
        </h3>
        <p className="text-gray-500">
          No se pudo cargar la información de tu suscripción
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Estado de Suscripción
        </h2>
        {getStatusBadge(getEffectiveStatus())}
      </div>

      {/* Plan actual */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {business.plan?.name || 'Plan Básico'}
            </h3>
            <p className="text-sm text-gray-600">Plan actual</p>
          </div>
          <CreditCardIcon className="h-8 w-8 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Fecha de vencimiento</p>
              <p className="font-medium text-gray-900">
                {business.status === 'TRIAL' 
                  ? formatDate(business.trialExpiresAt) 
                  : formatDate(currentSubscription.expiresAt)
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Estado del pago</p>
              <p className="font-medium text-gray-900">
                {getEffectiveStatus() === 'TRIAL_ACTIVE' || currentSubscription.status === 'ACTIVE' 
                  ? 'Al día' 
                  : 'Requiere atención'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de próximo pago / Trial */}
      {(() => {
        const paymentInfo = getNextPaymentInfo()
        
        return (
          <div className={`rounded-lg p-6 ${
            paymentInfo.isTrialMode 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {paymentInfo.isTrialMode ? (
                  <ClockIcon className="h-6 w-6 text-amber-600 mr-3" />
                ) : (
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {paymentInfo.isTrialMode ? 'Período de Prueba' : 'Próximo Pago'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {paymentInfo.isTrialMode 
                      ? 'Tu trial está activo' 
                      : 'Información de facturación'
                    }
                  </p>
                </div>
              </div>
              <BellIcon className="h-5 w-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <CalendarDaysIcon className={`h-5 w-5 mr-2 ${
                  paymentInfo.isTrialMode ? 'text-amber-500' : 'text-green-500'
                }`} />
                <div>
                  <p className="text-sm text-gray-600">
                    {paymentInfo.isTrialMode ? 'Trial expira' : 'Próximo pago'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(paymentInfo.nextPaymentDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <ClockIcon className={`h-5 w-5 mr-2 ${
                  paymentInfo.daysRemaining <= 3 ? 'text-red-500' : 
                  paymentInfo.daysRemaining <= 7 ? 'text-amber-500' : 
                  paymentInfo.isTrialMode ? 'text-amber-500' : 'text-green-500'
                }`} />
                <div>
                  <p className="text-sm text-gray-600">Días restantes</p>
                  <p className={`font-medium ${
                    paymentInfo.daysRemaining <= 3 ? 'text-red-600' : 
                    paymentInfo.daysRemaining <= 7 ? 'text-amber-600' : 'text-gray-900'
                  }`}>
                    {paymentInfo.daysRemaining} días
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <CurrencyDollarIcon className={`h-5 w-5 mr-2 ${
                  paymentInfo.isTrialMode ? 'text-amber-500' : 'text-green-500'
                }`} />
                <div>
                  <p className="text-sm text-gray-600">
                    {paymentInfo.isTrialMode ? 'Precio después del trial' : 'Monto'}
                  </p>
                  <p className="font-medium text-gray-900">
                    ${paymentInfo.amount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje adicional para trial */}
            {paymentInfo.isTrialMode && (
              <div className="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-800 font-medium">
                      {paymentInfo.daysRemaining <= 3 
                        ? '¡Tu trial expira pronto!' 
                        : 'Período de prueba activo'
                      }
                    </p>
                    <p className="text-amber-700 mt-1">
                      {paymentInfo.daysRemaining <= 3 
                        ? 'Actualiza tu plan para continuar usando todas las funcionalidades sin interrupciones.'
                        : `Tienes ${paymentInfo.daysRemaining} días para explorar todas las funcionalidades. El plan se activará automáticamente cuando termine el trial.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje para próximo pago */}
            {!paymentInfo.isTrialMode && paymentInfo.daysRemaining <= 7 && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-green-800 font-medium">
                      Próximo pago programado
                    </p>
                    <p className="text-green-700 mt-1">
                      Tu suscripción se renovará automáticamente el {formatDate(paymentInfo.nextPaymentDate)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Módulos incluidos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Módulos Incluidos
        </h3>
        
        {business.plan?.modules && business.plan.modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {business.plan.modules.map((module, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {module.name || module.code}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {module.description || 'Módulo activo'}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay módulos adicionales en este plan</p>
          </div>
        )}
      </div>

      {/* Límites y uso - Solo mostrar si hay límites definidos */}
      {business.plan?.limits && Object.keys(business.plan.limits).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Límites del Plan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(business.plan.limits).map(([key, limit]) => {
              const usage = business.plan.usage?.[key] || 0
              const percentage = limit > 0 ? (usage / limit) * 100 : 0
              
              return (
                <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {usage}/{limit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage > 90 ? 'bg-red-500' :
                        percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Acciones */}
      {!isSetupMode && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <CurrencyDollarIcon className="h-5 w-5 inline mr-2" />
            Historial de Pagos
          </button>
          
          <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <CreditCardIcon className="h-5 w-5 inline mr-2" />
            Cambiar Plan
          </button>
        </div>
      )}

      {/* Mensaje para modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              Tu suscripción está activa. Ahora configura tu negocio para comenzar a usar todas las funcionalidades.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionSection