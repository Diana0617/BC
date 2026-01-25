/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { businessServicesApi, commissionApi, consentApi } from '@shared/api'
import { usePermissions } from '@shared/hooks'
import UpgradePlanModal from '../../../../components/common/UpgradePlanModal'
import ServiceFormModal from '../../../../components/services/ServiceFormModal'
import CommissionConfigModal from '../../../../components/services/CommissionConfigModal'
import ConsentTemplateModal from '../../../../components/consent/ConsentTemplateModal'

const ServicesSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const activeBusiness = useSelector(state => state.business.currentBusiness)
  const { isBusinessSpecialist } = usePermissions()
  
  // Obtener la suscripción activa o la primera disponible
  const currentSubscription = activeBusiness?.subscriptions?.find(sub => 
    sub.status === 'ACTIVE' || sub.status === 'TRIAL'
  ) || activeBusiness?.subscriptions?.[0] || activeBusiness?.subscription

  // Determinar si el usuario tiene restricciones (por rol o por plan gratuito)
  const planPrice = currentSubscription?.plan?.price
  const isFreePlan = planPrice === 0 || planPrice === '0.00' || parseFloat(planPrice) === 0
  const isRestricted = isBusinessSpecialist || isFreePlan

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Estados principales
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Estados de UI
  const [expandedService, setExpandedService] = useState(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  
  // Configuración global de comisiones
  const [commissionConfig, setCommissionConfig] = useState(null)
  const [consentTemplates, setConsentTemplates] = useState([])

  // Cargar datos iniciales
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadServices(),
        loadCommissionConfig(),
        loadConsentTemplates()
      ])
    }
    
    if (activeBusiness?.id) {
      loadAllData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusiness])

  const loadServices = async () => {
    if (!activeBusiness?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      const response = await businessServicesApi.getServices(activeBusiness.id, { 
        isActive: true,
        _t: Date.now()
      })
      console.log('📦 Services loaded:', response)
      setServices(response.data || [])
    } catch (err) {
      console.error('Error loading services:', err)
      setError('Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCommissionConfig = async () => {
    if (!activeBusiness?.id) return
    
    try {
      const response = await commissionApi.getBusinessConfig(activeBusiness.id)
      setCommissionConfig(response.data)
    } catch (err) {
      console.error('Error loading commission config:', err)
      // No mostrar error si no existe config aún
    }
  }

  const loadConsentTemplates = async () => {
    if (!activeBusiness?.id) return
    
    try {
      const response = await consentApi.getTemplates(activeBusiness.id, { activeOnly: true })
      setConsentTemplates(response.data || [])
    } catch (err) {
      console.error('Error loading consent templates:', err)
    }
  }

  const handleCreateService = () => {
    // Límite de servicios para plan gratuito (ej: 5 servicios)
    if (isRestricted && services.length >= 5) {
      setShowUpgradeModal(true)
      return
    }
    setSelectedService(null)
    setShowServiceModal(true)
  }

  const handleEditService = (service) => {
    setSelectedService(service)
    setShowServiceModal(true)
  }

  const handleServiceSaved = async () => {
    setShowServiceModal(false)
    setSelectedService(null)
    await loadServices()
    
    // Completar paso en modo setup si es el primer servicio
    if (isSetupMode && services.length === 0 && onComplete) {
      onComplete()
    }
  }

  const handleConfigureCommission = (service) => {
    setSelectedService(service)
    setShowCommissionModal(true)
  }

  const handleCommissionSaved = async () => {
    setShowCommissionModal(false)
    setSelectedService(null)
    await loadServices()
  }

  const handleConfigureConsent = (service) => {
    setSelectedService(service)
    setShowConsentModal(true)
  }

  const handleConsentSaved = async (templateId) => {
    try {
      // Actualizar el servicio con el nuevo templateId
      if (selectedService && activeBusiness?.id) {
        await businessServicesApi.updateService(
          activeBusiness.id,
          selectedService.id,
          { consentTemplateId: templateId }
        )
        
        toast.success(templateId ? 'Plantilla asignada exitosamente' : 'Plantilla removida exitosamente')
      }
    } catch (error) {
      console.error('Error updating consent template:', error)
      toast.error('Error al actualizar la plantilla')
    } finally {
      setShowConsentModal(false)
      setSelectedService(null)
      await loadServices()
    }
  }

  const toggleServiceExpand = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  const getCommissionTypeLabel = (calculationType) => {
    const types = {
      'PERCENTAGE': 'Por porcentaje',
      'FIXED_AMOUNT': 'Monto fijo',
      'NO_COMMISSION': 'Sin comisión'
    }
    return types[calculationType] || 'No configurado'
  }

  const ServiceCard = ({ service }) => {
    const isExpanded = expandedService === service.id
    const hasCommission = service.ServiceCommission || commissionConfig?.commissionsEnabled
    const hasConsent = service.consentTemplateId

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            </div>
            
            <button
              onClick={() => handleEditService(service)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg ml-4"
              title="Editar servicio"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Info básica */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">⏱️ {service.duration} min</span>
              <span className="font-semibold text-green-600 text-lg">
                ${service.price.toLocaleString('es-CO')}
              </span>
            </div>

            <button
              onClick={() => toggleServiceExpand(service.id)}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              {isExpanded ? 'Menos' : 'Configurar'}
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Badges de configuración */}
          <div className="flex gap-2 mt-3">
            {hasCommission && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                Comisión configurada
              </span>
            )}
            {hasConsent && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <DocumentTextIcon className="h-3 w-3 mr-1" />
                Consentimiento
              </span>
            )}
          </div>
        </div>

        {/* Panel expandible */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
            {/* Configurar comisión */}
            <button
              onClick={() => handleConfigureCommission(service)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Configurar Comisión</p>
                  <p className="text-xs text-gray-500">
                    {service.ServiceCommission 
                      ? `${service.ServiceCommission.specialistPercentage}% especialista / ${service.ServiceCommission.businessPercentage}% negocio`
                      : commissionConfig?.commissionsEnabled 
                        ? `Usando config general: ${getCommissionTypeLabel(commissionConfig.calculationType)}`
                        : 'Sin configurar'
                    }
                  </p>
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-400 -rotate-90" />
            </button>

            {/* Configurar consentimiento */}
            <button
              onClick={() => handleConfigureConsent(service)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Consentimiento Informado</p>
                  <p className="text-xs text-gray-500">
                    {service.consentTemplateId 
                      ? 'Plantilla asignada'
                      : 'Asignar plantilla de consentimiento'
                    }
                  </p>
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-400 -rotate-90" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Procedimientos y Servicios
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        <button
          onClick={handleCreateService}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Procedimiento
        </button>
      </div>

      {/* Stats Card - Configuración global */}
      {commissionConfig && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Configuración Global de Comisiones</p>
              <p className="text-lg font-semibold text-gray-900">
                {commissionConfig.commissionsEnabled 
                  ? getCommissionTypeLabel(commissionConfig.calculationType)
                  : 'Deshabilitadas'
                }
              </p>
            </div>
            {commissionConfig.commissionsEnabled && commissionConfig.calculationType === 'PERCENTAGE' && (
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {commissionConfig.generalPercentage}%
                </p>
                <p className="text-xs text-gray-500">Para especialistas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de servicios */}
      {isLoading && services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando procedimientos...</p>
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : null}

      {/* Estado vacío */}
      {!isLoading && services.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin procedimientos registrados
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Crea tus primeros procedimientos con configuración completa de comisiones 
            y consentimientos informados
          </p>
          <button
            onClick={handleCreateService}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crear Primer Procedimiento
          </button>
        </div>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>✨ Nuevo sistema mejorado:</strong> Ahora puedes configurar comisiones 
            personalizadas y plantillas de consentimiento informado para cada procedimiento. 
            ¡Comienza creando tus primeros procedimientos!
          </p>
        </div>
      )}

      {/* Modals */}
      {showServiceModal && (
        <ServiceFormModal
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false)
            setSelectedService(null)
          }}
          onSave={handleServiceSaved}
          service={selectedService}
          businessId={activeBusiness?.id}
        />
      )}

      {showCommissionModal && selectedService && (
        <CommissionConfigModal
          isOpen={showCommissionModal}
          onClose={() => {
            setShowCommissionModal(false)
            setSelectedService(null)
          }}
          onSave={handleCommissionSaved}
          service={selectedService}
          businessId={activeBusiness?.id}
          globalConfig={commissionConfig}
        />
      )}

      {showConsentModal && selectedService && (
        <ConsentTemplateModal
          isOpen={showConsentModal}
          onClose={() => {
            setShowConsentModal(false)
            setSelectedService(null)
          }}
          onSelect={(templateId) => {
            handleConsentSaved(templateId)
          }}
          businessId={activeBusiness?.id}
          currentTemplateId={selectedService?.consentTemplateId}
        />
      )}
      {/* Modal de Upgrade */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Servicios Ilimitados"
      />
    </div>
  )
}

export default ServicesSection