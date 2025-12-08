
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { businessProfileApi } from '@shared'
import { fetchPublicPlans } from '@shared/store/slices/plansSlice'
import { fetchCurrentBusiness } from '@shared/store/slices/businessSlice'
import { setCurrentBusiness } from '@shared/store/slices/businessSlice'
import SubscriptionStatusBadge from '../../../../components/subscription/SubscriptionStatusBadge'
import RenewSubscriptionModal from '../../../../components/subscription/RenewSubscriptionModal'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BellIcon,
  InformationCircleIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

const SubscriptionSection = ({ isSetupMode }) => {
  const dispatch = useDispatch()
  const business = useSelector(state => state.business?.currentBusiness)
  const isLoading = useSelector(state => state.business?.isLoading)
  // Selector de planes disponibles desde el store de plans
  const availablePlans = useSelector(state => state.plans?.plans || [])
  // Estado para modal y selección
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showRenewModal, setShowRenewModal] = useState(false)
  // Cargar los planes disponibles al abrir el modal
  useEffect(() => {
    if (showChangePlanModal) {
      dispatch(fetchPublicPlans())
    }
  }, [showChangePlanModal, dispatch])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Obtener información de suscripción del negocio
  const currentSubscription = business?.subscriptions?.find(sub => 
    sub.status === 'ACTIVE' || sub.status === 'TRIAL'
  ) || business?.subscriptions?.[0]
  
  // 🔧 FIX: Priorizar el estado del negocio si está en TRIAL
  // A veces la suscripción puede estar SUSPENDED pero el negocio sigue en TRIAL
  const effectiveSubscription = currentSubscription ? {
    ...currentSubscription,
    status: business?.status === 'TRIAL' ? 'TRIAL' : currentSubscription.status,
    trialEndDate: business?.trialEndDate || currentSubscription.trialEndDate
  } : null
  
  // Preferir el currentPlan expuesto por el backend; si no, usar el plan de la suscripción
  const currentPlan = business?.currentPlan || currentSubscription?.plan
  
  // Determinar si es plan gratuito
  const planPrice = currentPlan?.price
  const isFreePlan = planPrice === 0 || planPrice === '0.00' || parseFloat(planPrice) === 0

  // Mapeo de iconos para módulos
  const getModuleIcon = (iconName, category) => {
    const iconMap = {
      'calendar-days': CalendarDaysIcon,
      'user-group': UserGroupIcon,
      'chart-bar': ChartBarIcon,
      'document-text': DocumentTextIcon,
      'photo': PhotoIcon,
      'cog-6-tooth': Cog6ToothIcon
    }
    
    // Si no hay icono específico, usar por categoría
    const categoryIcons = {
      'APPOINTMENTS': CalendarDaysIcon,
      'CLIENTS': UserGroupIcon,
      'REPORTS': ChartBarIcon,
      'INVENTORY': DocumentTextIcon,
      'MARKETING': PhotoIcon,
      'SETTINGS': Cog6ToothIcon
    }
    
    return iconMap[iconName] || categoryIcons[category] || Cog6ToothIcon
  }

  // Nombre legible de un módulo (soporta objetos o strings)
  const getModuleName = (mod) => {
    if (!mod) return ''
    if (typeof mod === 'string') return mod
    return mod.displayName || mod.name || mod.title || ''
  }

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
    if (effectiveSubscription?.status === 'TRIAL') {
      const trialEndDate = effectiveSubscription.trialEndDate;
      // Usar el precio y moneda de la suscripción actual
      const price = effectiveSubscription?.amount || currentPlan?.price || '0';
      const currency = effectiveSubscription?.currency || currentPlan?.currency || 'COP';
      return {
        isTrialMode: true,
        daysRemaining: calculateDaysRemaining(trialEndDate),
        expirationDate: trialEndDate,
        nextPaymentDate: trialEndDate,
        amount: parseFloat(price),
        currency: currency
      };
    }
    
    return {
      isTrialMode: false,
      daysRemaining: calculateDaysRemaining(effectiveSubscription?.endDate),
      expirationDate: effectiveSubscription?.endDate,
      nextPaymentDate: effectiveSubscription?.nextPaymentDate || effectiveSubscription?.endDate,
      amount: effectiveSubscription?.amount || currentPlan?.price || 0
    }
  }

  const formatPrice = (price, currency = 'COP') => {
    console.log('Debug - formatPrice called with:', price, currency)
    if (!price || price === 0 || price === '0' || price === '0.00') return '$0'
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numericPrice) || numericPrice <= 0) return '$0'
    return `$${numericPrice.toLocaleString()} ${currency}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no configurada'
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha inválida'
    }
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

  if (!business || !effectiveSubscription) {
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
      {/* Header with Status Badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Estado de Suscripción
        </h2>
        <SubscriptionStatusBadge 
          subscription={effectiveSubscription}
          compact={false}
          showDetails={true}
        />
      </div>

      {/* Alerta para suscripciones suspendidas o vencidas */}
      {(effectiveSubscription?.status === 'SUSPENDED' || effectiveSubscription?.status === 'OVERDUE') && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Suscripción {effectiveSubscription?.status === 'SUSPENDED' ? 'Suspendida' : 'Vencida'}
              </h3>
              <p className="text-red-800 mb-3">
                Tu suscripción ha sido {effectiveSubscription?.status === 'SUSPENDED' ? 'suspendida' : 'vencida'}. 
                Renueva ahora para recuperar el acceso completo a todas las funcionalidades.
              </p>
              <button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold inline-flex items-center"
                onClick={() => setShowRenewModal(true)}
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Renovar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan actual */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentPlan?.name || 'Plan Básico'}
            </h3>
            <p className="text-sm text-gray-600">Plan actual</p>
          </div>
          <CreditCardIcon className="h-8 w-8 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isFreePlan && (
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">
                  {effectiveSubscription?.status === 'TRIAL' ? 'Trial finaliza' : 'Fecha de vencimiento'}
                </p>
                <p className="font-medium text-gray-900">
                  {effectiveSubscription?.status === 'TRIAL' 
                    ? formatDate(effectiveSubscription.trialEndDate) 
                    : formatDate(effectiveSubscription?.endDate)
                  }
                </p>
              </div>
            </div>
          )}
          
          {!isFreePlan && (
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Ciclo de facturación</p>
                <p className="font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    effectiveSubscription?.billingCycle === 'ANNUAL' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {effectiveSubscription?.billingCycle === 'ANNUAL' ? '📅 Anual' : '📆 Mensual'}
                  </span>
                </p>
              </div>
            </div>
          )}
          
          {!isFreePlan && (
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Estado del pago</p>
                <p className="font-medium text-gray-900">
                  {effectiveSubscription?.status === 'TRIAL' && 'Período de prueba - Sin cargo'}
                  {effectiveSubscription?.status === 'ACTIVE' && 'Al día'}
                  {effectiveSubscription?.status === 'PENDING' && 'Procesando pago'}
                  {(effectiveSubscription?.status === 'OVERDUE' || effectiveSubscription?.status === 'SUSPENDED') && 'Requiere atención'}
                </p>
              </div>
            </div>
          )}

          {isFreePlan && (
             <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium text-gray-900">Plan Gratuito - Siempre activo</p>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Información de próximo pago / Trial */}
      {(() => {
        if (isFreePlan) return null;
        
        const paymentInfo = getNextPaymentInfo()
        const isTrial = effectiveSubscription?.status === 'TRIAL'
        
        return (
          <div className={`rounded-lg p-6 ${
            isTrial 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          }`}>
            {/* Sección para trial */}
            {isTrial ? (
              <div>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium text-lg">
                        {paymentInfo.daysRemaining <= 3 
                          ? '¡Tu trial expira pronto!' 
                          : 'Período de prueba activo'
                        }
                      </p>
                      <p className="text-amber-700 mt-1">
                        Precio después del trial: <span className="font-semibold">{formatPrice(paymentInfo.amount, paymentInfo.currency)}</span>
                      </p>
                      <p className="text-xs text-amber-600 mt-2">
                        Se cobrará automáticamente el {formatDate(effectiveSubscription.trialEndDate)}
                      </p>
                    </div>
                  </div>
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Cancelar Trial
                  </button>
                </div>
              </div>
            ) : (
              /* Sección completa para suscripción normal */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Próximo Pago</h3>
                      <p className="text-sm text-gray-600">Información de facturación</p>
                    </div>
                  </div>
                  <BellIcon className="h-5 w-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Próximo pago</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(paymentInfo.nextPaymentDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className={`h-5 w-5 mr-2 ${
                      paymentInfo.daysRemaining <= 3 ? 'text-red-500' : 
                      paymentInfo.daysRemaining <= 7 ? 'text-amber-500' : 'text-green-500'
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
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Monto</p>
                      <p className="font-medium text-gray-900">
                        ${paymentInfo.amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensaje para próximo pago */}
                {paymentInfo.daysRemaining <= 7 && (
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
            )}
          </div>
        )
      })()}

      {/* Módulos incluidos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Módulos Incluidos
          </h3>
          {effectiveSubscription?.status === 'TRIAL' && (
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              <ClockIcon className="h-4 w-4 mr-1" />
              Trial: {calculateDaysRemaining(effectiveSubscription.trialEndDate)} días restantes
            </div>
          )}
        </div>
        
        {currentSubscription?.plan?.modules && currentSubscription.plan.modules.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentSubscription.plan.modules.map((module, index) => {
              const IconComponent = getModuleIcon(module.icon, module.category)
              return (
                <div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                >
                  {/* Header del módulo */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {module.displayName || module.name}
                        </h4>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">
                          {module.category?.replace('_', ' ') || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {module.description || 'Módulo activo en tu plan'}
                  </p>

                  {/* Información adicional */}
                  <div className="space-y-3">
                    {/* Estado de inclusión */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Estado en el plan:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        module.PlanModule?.isIncluded 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {module.PlanModule?.isIncluded ? 'Incluido' : 'No incluido'}
                      </span>
                    </div>

                    {/* Precio adicional si aplica */}
                    {module.PlanModule?.additionalPrice && parseFloat(module.PlanModule.additionalPrice) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Precio adicional:</span>
                        <span className="text-sm font-medium text-blue-600">
                          ${parseFloat(module.PlanModule.additionalPrice).toLocaleString()} {effectiveSubscription.currency || 'COP'}
                        </span>
                      </div>
                    )}

                    {/* Límite de cantidad si aplica */}
                    {module.PlanModule?.limitQuantity && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Límite:</span>
                        <span className="text-sm font-medium text-gray-700">
                          {module.PlanModule.limitQuantity} unidades
                        </span>
                      </div>
                    )}

                    {/* Estado del trial para este módulo */}
                    {effectiveSubscription?.status === 'TRIAL' && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center text-sm">
                          <ClockIcon className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-amber-800">
                            <strong>Acceso de prueba:</strong> Disponible hasta el {formatDate(effectiveSubscription.trialEndDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Sin módulos adicionales</h4>
            <p className="text-gray-500 max-w-sm mx-auto">
              Este plan no incluye módulos adicionales. Considera actualizar para acceder a más funcionalidades.
            </p>
          </div>
        )}
      </div>

      {/* Límites y uso - Solo mostrar si hay límites definidos */}
      {currentPlan?.limits && Object.keys(currentPlan.limits).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Límites del Plan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentPlan.limits).map(([key, limit]) => {
              const usage = currentPlan.usage?.[key] || 0
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
          {/* Botón de renovación para suscripciones suspendidas o vencidas */}
          {(effectiveSubscription?.status === 'SUSPENDED' || effectiveSubscription?.status === 'OVERDUE') && (
            <button 
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              onClick={() => setShowRenewModal(true)}
            >
              <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
              Renovar Suscripción
            </button>
          )}
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <CurrencyDollarIcon className="h-5 w-5 inline mr-2" />
            Historial de Pagos
          </button>
          <button
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => setShowChangePlanModal(true)}
          >
            <CreditCardIcon className="h-5 w-5 inline mr-2" />
            Cambiar Plan
          </button>
        </div>
      )}

      {/* Modal de cambio de plan */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowChangePlanModal(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Selecciona un nuevo plan</h3>
            <div className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[52vh] overflow-auto">
                {availablePlans && availablePlans.length > 0 ? (
                  availablePlans.map(plan => {
                    const planId = plan.id;
                    const isCurrent = currentPlan && currentPlan.id === planId;
                    const displayPrice = plan.displayPrice || plan.price || 0;
                    const currentPrice = (currentPlan && (currentPlan.displayPrice || currentPlan.price)) || 0;
                    const priceDiff = Number(displayPrice) - Number(currentPrice || 0);
                    const formatted = formatPrice(displayPrice, plan.currency || 'COP')
                    const parts = formatted.split(' ')
                    const amountPart = parts.slice(0, -1).join(' ')
                    const currencyPart = parts[parts.length - 1]

                    return (
                      <button
                        key={planId}
                        type="button"
                        aria-pressed={selectedPlanId === planId}
                        tabIndex={0}
                        onClick={() => !isCurrent && setSelectedPlanId(planId)}
                        className={`w-full text-left p-3 rounded-lg border flex flex-col justify-between transition-shadow duration-200 min-h-[140px] break-words ${isCurrent ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : selectedPlanId === planId ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{plan.name}</h4>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {isCurrent ? 'Plan actual' : (priceDiff > 0 ? 'Más caro' : (priceDiff < 0 ? 'Más barato' : 'Igual'))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{plan.description}</p>
                          {/* Muestra hasta 3 módulos clave del plan */}
                          {plan.modules && plan.modules.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="font-medium text-gray-700 mb-1">Módulos clave:</div>
                              <div className="flex flex-wrap gap-2">
                                {plan.modules.slice(0,3).map((m, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs truncate max-w-[120px]">{getModuleName(m)}</span>
                                ))}
                                {plan.modules.length > 3 && (
                                  <span className="px-2 py-0.5 bg-gray-50 rounded-full text-xs text-gray-500">+{plan.modules.length - 3} más</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 gap-3">
                          <div className="text-sm text-gray-700 truncate">{plan.features && plan.features.length ? `${plan.features.length} características` : 'Sin detalles'}</div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 leading-none">{amountPart}</div>
                            <div className="text-xs text-gray-500">{currencyPart}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-500 py-6">No hay planes disponibles</div>
                )}
              </div>
            </div>

            {/* Selected summary and confirm */}
            <div className="mt-4">
              {selectedPlanId ? (() => {
                const sel = availablePlans.find(p => p.id === selectedPlanId) || {};
                const selPrice = Number(sel.displayPrice || sel.price || 0);
                const curPrice = Number(currentPlan?.displayPrice || currentPlan?.price || 0);
                const diff = selPrice - curPrice;
                return (
                  <div className="mb-3 p-3 rounded-md bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-600">Seleccionado:</div>
                        <div className="font-semibold text-gray-900 truncate">{sel.name}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Precio</div>
                        {(() => {
                          const formatted = formatPrice(selPrice, sel.currency || 'COP')
                          const parts = formatted.split(' ')
                          const amt = parts.slice(0, -1).join(' ')
                          const cur = parts[parts.length - 1]
                          return (
                            <div>
                              <div className="font-bold text-gray-900 leading-none">{amt}</div>
                              <div className="text-xs text-gray-500">{cur}</div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      {diff > 0 ? (
                        <div className="text-red-600">Será <strong>más caro</strong> que tu plan actual por {formatPrice(diff, sel.currency || 'COP')}</div>
                      ) : diff < 0 ? (
                        <div className="text-green-700">Será <strong>más barato</strong> que tu plan actual, ahorrarías {formatPrice(Math.abs(diff), sel.currency || 'COP')}</div>
                      ) : (
                        <div className="text-gray-700">Mismo precio que tu plan actual</div>
                      )}
                    </div>

                    {/* Comparación de módulos añadidos / eliminados */}
                    {(() => {
                      const selMods = (sel.modules || []).map(getModuleName).filter(Boolean)
                      const curMods = (currentPlan?.modules || []).map(getModuleName).filter(Boolean)
                      const added = selMods.filter(x => !curMods.includes(x))
                      const removed = curMods.filter(x => !selMods.includes(x))
                      if (added.length === 0 && removed.length === 0) return null
                      return (
                        <div className="mt-3 text-sm">
                          {added.length > 0 && (
                            <div className="text-sm text-gray-800 mb-1">
                              <strong className="text-green-700">+{added.length} módulos</strong> incluidos: {added.slice(0,5).join(', ')}{added.length > 5 ? ', ...' : ''}
                            </div>
                          )}
                          {removed.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <strong className="text-red-600">-{removed.length} módulos</strong> no estarán: {removed.slice(0,5).join(', ')}{removed.length > 5 ? ', ...' : ''}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )
              })() : (
                <div className="text-sm text-gray-500 mb-3">Selecciona un plan para ver la diferencia</div>
              )}

              <button
                className={`w-full mt-3 sm:mt-4 bg-blue-600 text-white py-3 sm:py-2 rounded-lg font-semibold ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!selectedPlanId || isSubmitting || (currentPlan && selectedPlanId === currentPlan.id)}
                onClick={async () => {
                  if (!selectedPlanId) return;
                  setIsSubmitting(true);
                  try {
                    const result = await businessProfileApi.changeBusinessPlan(selectedPlanId);
                    alert(result.message || 'Plan cambiado correctamente');
                    if (result.data && result.data.debug) {
                      console.log('change-plan debug:', result.data.debug);
                      // Debug info removed for production
                    }
                    if (result.data && result.data.currentBusiness) {
                      try {
                        dispatch(setCurrentBusiness(result.data.currentBusiness));
                      } catch (e) {
                        console.warn('No se pudo setCurrentBusiness tras cambio de plan', e);
                      }
                    } else {
                      try {
                        await dispatch(fetchCurrentBusiness());
                      } catch (e) {
                        console.warn('No se pudo refrescar business tras cambio de plan', e);
                      }
                    }
                    setShowChangePlanModal(false);
                    setSelectedPlanId(null);
                  } catch (err) {
                    console.error('Error changing plan:', err);
                    const message = err?.response?.data?.message || 'Error al cambiar el plan';
                    alert(message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Confirmar cambio
              </button>
            </div>
          </div>
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

      {/* Modal de renovación */}
      {showRenewModal && (
        <RenewSubscriptionModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          businessId={business?.id}
        />
      )}
    </div>
  )
}

export default SubscriptionSection