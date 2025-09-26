import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  UserCircleIcon, 
  CogIcon, 
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Redux actions
import {
  loadBusinessConfiguration,
  setSetupMode,
  setCurrentStep
} from '@shared/store/slices/businessConfigurationSlice'
import { fetchCurrentBusiness } from '@shared/store/slices/businessSlice'

// Componentes de secciones
import SubscriptionSection from './sections/SubscriptionSection'
import BasicInfoSection from './sections/BasicInfoSection'
import SpecialistsSection from './sections/SpecialistsSection'
import ServicesSection from './sections/ServicesSection'
import TaxxaConfigSection from './sections/TaxxaConfigSection'
import InventoryConfigSection from './sections/InventoryConfigSection'
import ScheduleConfigSection from './sections/ScheduleConfigSection'
import SuppliersConfigSection from './sections/SuppliersConfigSection'
import BusinessRuleModal from '../../../components/BusinessRuleModal'

// Hook personalizado para la configuración del negocio
// import { useBusinessSetup } from './hooks/useBusinessSetup'

const BusinessProfile = () => {
  console.log('🟢 BusinessProfile component is rendering...')
  console.log('🔧 Current path:', window.location.pathname)
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Estados locales
  const [activeSection, setActiveSection] = useState('subscription')
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  
    // Estados de Redux
  const { user } = useSelector(state => state.auth)
  const business = useSelector(state => state.business?.currentBusiness)
  const {
    loading,
    saving,
    error,
    setupProgress,
    completedSteps,
    isSetupMode
  } = useSelector(state => state.businessConfiguration)
  
  console.log('👤 User:', user)
  console.log('🏢 Business:', business)
  console.log('📋 Current Plan:', business?.currentPlan)
  console.log('📊 Subscriptions:', business?.subscriptions)
  console.log('⚙️  BusinessConfiguration:', { loading, saving, error, setupProgress, completedSteps, isSetupMode })

  // Detectar si venimos del setup inicial
  useEffect(() => {
    const setupParam = searchParams.get('setup')
    if (setupParam === 'true') {
      dispatch(setSetupMode(true))
      setActiveSection('basic-info') // Empezar con datos básicos en setup
    }
  }, [searchParams, dispatch])

  // Cargar información del negocio si el usuario es BUSINESS
  useEffect(() => {
    if (user?.role === 'BUSINESS' && !business) {
      dispatch(fetchCurrentBusiness())
    }
  }, [user?.role, business, dispatch])

  // Cargar configuración del negocio
  useEffect(() => {
    if (business?.id) {
      dispatch(loadBusinessConfiguration(business.id))
    }
  }, [business?.id, dispatch])

  // Obtener módulos disponibles basados en la suscripción
  const currentSubscription = business?.subscriptions?.find(sub => sub.status === 'ACTIVE' || sub.status === 'TRIAL') || business?.subscriptions?.[0]
  const currentPlan = business?.currentPlan || currentSubscription?.plan
  const availableModules = currentPlan?.modules
    ?.filter(module => module.PlanModule?.isIncluded)
    ?.map(module => module.name) || []
  
  console.log('📦 Available Modules:', availableModules)
  console.log('🎯 Current Subscription:', currentSubscription)
  console.log('💼 Current Plan Details:', currentPlan)
  console.log('🔧 Full Modules Info:', currentPlan?.modules)

  // Función para verificar si un paso está completado
  const isStepCompleted = (stepId) => completedSteps.includes(stepId)

  // Función para completar paso
  const completeStep = (stepId) => {
    // Esta función será manejada por cada sección individual
    console.log('Completando paso:', stepId)
  }

  // Configuración de secciones
  const profileSections = [
    {
      id: 'subscription',
      name: 'Suscripción',
      icon: CreditCardIcon,
      component: SubscriptionSection,
      alwaysVisible: true
    },
    {
      id: 'business-rules',
      name: 'Reglas de Negocio',
      icon: ShieldCheckIcon,
      component: null, // No tiene componente de sección, abre modal
      alwaysVisible: true,
      isModalTrigger: true
    },
    {
      id: 'basic-info',
      name: 'Información Básica',
      icon: BuildingStorefrontIcon,
      component: BasicInfoSection,
      setupStep: 'basic-info'
    },
    {
      id: 'specialists',
      name: 'Especialistas',
      icon: UsersIcon,
      component: SpecialistsSection,
      setupStep: 'specialists'
    },
    {
      id: 'services',
      name: 'Servicios',
      icon: ClipboardDocumentListIcon,
      component: ServicesSection,
      setupStep: 'services'
    },
    {
      id: 'schedule',
      name: 'Horarios',
      icon: CalendarDaysIcon,
      component: ScheduleConfigSection,
      setupStep: 'schedule'
    }
  ]

  // Secciones modulares basadas en el plan
  const modulesSections = [
    {
      id: 'taxxa',
      name: 'Facturación (Taxxa)',
      icon: CogIcon,
      component: TaxxaConfigSection,
      moduleRequired: 'taxxa-integration',
      setupStep: 'taxxa-config'
    },
    {
      id: 'inventory',
      name: 'Inventario',
      icon: WrenchScrewdriverIcon,
      component: InventoryConfigSection,
      moduleRequired: 'basic-inventory',
      setupStep: 'inventory-config'
    },
    {
      id: 'suppliers',
      name: 'Proveedores',
      icon: UserCircleIcon,
      component: SuppliersConfigSection,
      moduleRequired: 'basic-payments', // Los proveedores requieren pagos
      setupStep: 'suppliers-config'
    }
  ]

  // Filtrar secciones disponibles basadas en los módulos del plan
  const allSections = [
    ...profileSections,
    ...modulesSections
  ]

  // Agregar información de disponibilidad a cada sección
  const sectionsWithAvailability = allSections.map(section => ({
    ...section,
    isAvailable: section.alwaysVisible || 
                !section.moduleRequired || 
                availableModules.includes(section.moduleRequired),
    requiredModule: section.moduleRequired
  }))

  // Función para cambiar de sección
  const handleSectionChange = (sectionId) => {
    const section = sectionsWithAvailability.find(s => s.id === sectionId)
    
    // Si es un trigger de modal, abrir el modal correspondiente
    if (section?.isModalTrigger) {
      if (sectionId === 'business-rules') {
        setIsRuleModalOpen(true)
        return
      }
    }
    
    // Si la sección no está disponible, mostrar mensaje de upgrade
    if (section && !section.isAvailable) {
      console.log(`Sección ${sectionId} no disponible. Requiere módulo: ${section.requiredModule}`)
      // TODO: Mostrar modal de upgrade de plan
      return
    }
    
    setActiveSection(sectionId)
    
    // En modo setup, actualizar la URL
    if (isSetupMode) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('step', sectionId)
      navigate(`?${newParams.toString()}`, { replace: true })
    }
  }

  // Función para completar el setup
  const handleCompleteSetup = () => {
    dispatch(setSetupMode(false))
    setActiveSection('subscription')
    navigate('/business/profile', { replace: true })
  }

  // Renderizar sección activa
  const renderActiveSection = () => {
    const section = sectionsWithAvailability.find(s => s.id === activeSection)
    if (!section) return null

    // Si la sección no está disponible, mostrar mensaje de upgrade
    if (!section.isAvailable) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <section.icon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {section.name}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Esta funcionalidad requiere un plan superior. Actualiza tu suscripción para acceder a {section.name}.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Módulo requerido:</span> {section.requiredModule}
            </p>
          </div>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              // TODO: Implementar navegación a planes
              console.log('Navegar a planes de suscripción')
            }}
          >
            Ver Planes Disponibles
          </button>
        </div>
      )
    }

    const SectionComponent = section.component
    return (
      <SectionComponent
        isSetupMode={isSetupMode}
        onComplete={section.setupStep ? () => completeStep(section.setupStep) : undefined}
        isCompleted={section.setupStep ? isStepCompleted(section.setupStep) : false}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil del negocio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del perfil */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {business?.name || 'Mi Negocio'}
                </h1>
                {isSetupMode && (
                  <p className="text-sm text-gray-500">
                    Configuración inicial - Progreso: {Math.round(setupProgress)}%
                  </p>
                )}
              </div>
            </div>
            
            {isSetupMode && (
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${setupProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(setupProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sectionsWithAvailability.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                const isCompleted = section.setupStep ? isStepCompleted(section.setupStep) : false
                const isAvailable = section.isAvailable
                
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    disabled={!isAvailable}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      !isAvailable
                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                        : isActive
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{section.name}</span>
                    
                    {/* Indicador de disponibilidad */}
                    {!isAvailable && (
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full ml-2">
                        Pro
                      </span>
                    )}
                    
                    {isSetupMode && isCompleted && isAvailable && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Botón para completar setup */}
            {isSetupMode && setupProgress === 100 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 mb-3">
                  ¡Configuración completa!
                </p>
                <button
                  onClick={handleCompleteSetup}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Finalizar Configuración
                </button>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reglas de negocio */}
      <BusinessRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        businessId={business?.id}
        business={business}
      />
    </div>
  )
}

export default BusinessProfile