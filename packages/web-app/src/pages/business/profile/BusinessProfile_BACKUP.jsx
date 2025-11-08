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
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

// Redux actions
import {
  loadBusinessConfiguration,
  setSetupMode,
  loadBranding
} from '@shared/store/slices/businessConfigurationSlice'
import { fetchCurrentBusiness } from '@shared/store/slices/businessSlice'
import { logout } from '@shared/store/slices/authSlice'

// Componentes de secciones
import SubscriptionSection from './sections/SubscriptionSection'
import BasicInfoSection from './sections/BasicInfoSection'
import BrandingSection from './sections/BrandingSection'
import BranchesSection from './sections/BranchesSection'
import StaffManagementSection from './sections/StaffManagementSection'
import ServicesSection from './sections/ServicesSection'
import TaxxaConfigSection from './sections/TaxxaConfigSection'
import InventoryConfigSection from './sections/InventoryConfigSection'
import SuppliersConfigSection from './sections/SuppliersConfigSection'
import AppointmentsConfigSection from './sections/AppointmentsConfigSection'
import AppointmentPaymentsConfigSection from './sections/AppointmentPaymentsConfigSection'
import PaymentMethodsSection from './sections/PaymentMethodsSection'
import CalendarAccessSection from './sections/CalendarAccessSection'
import CustomerHistorySection from './sections/CustomerHistorySection'
import WhatsAppConfigSection from './sections/WhatsAppConfigSection'
import BusinessRuleModal from '../../../components/BusinessRuleModalV2'

// Hook personalizado para la configuración del negocio
// import { useBusinessSetup } from './hooks/useBusinessSetup'

const BusinessProfile = () => {


  // Logout handler
  const handleLogout = () => {
    dispatch(logout())
    navigate('/', { replace: true })
  }

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Estados locales
  const [activeSection, setActiveSection] = useState('subscription')
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [activeInitialConfigTab, setActiveInitialConfigTab] = useState('basic-info')

  // Estados de Redux
  const { user } = useSelector(state => state.auth)
  const business = useSelector(state => state.business?.currentBusiness)
  const {
    loading,
    saving,
    error,
    setupProgress,
    completedSteps,
    isSetupMode,
    branding
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

  // Cargar branding del negocio (una sola vez cuando se carga el business)
  useEffect(() => {
    if (business?.id && !branding) {
      // Evitar solicitar branding para un negocio que no es el del token actual.
      // En algunos flujos (owner cambiando de negocio o navegación previa) el currentBusiness
      // en Redux puede no coincidir con el negocio asociado al token. Eso genera 403
      // porque el backend sólo permite acceder a /api/business/:id/branding cuando
      // el businessId coincide con el del usuario en el token.
      const tokenBusinessId = user?.business?.id
      if (tokenBusinessId && tokenBusinessId !== business.id) {
        // Re-sincronizar el negocio actual desde el backend antes de solicitar branding
        // Esto evita peticiones con businessId stale que producen 403 intermitentes.
        dispatch(fetchCurrentBusiness())
        return
      }

      dispatch(loadBranding(business.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id])

  // Obtener TODOS los módulos disponibles y marcar cuáles están incluidos en el plan
  const allModules = business?.allModules || []
  const availableModules = allModules.filter(module => module.isAvailable).map(module => module.name) || []

  console.log('🔍 All Modules:', allModules)
  console.log('✅ Available Modules:', availableModules)

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
      id: 'initial-config',
      name: 'Configuración Inicial',
      icon: CogIcon,
      component: null, // Se renderiza con tabs internos
      alwaysVisible: true,
      hasTabs: true,
      tabs: [
        {
          id: 'basic-info',
          name: 'Datos Básicos',
          icon: BuildingStorefrontIcon,
          component: BasicInfoSection,
          setupStep: 'basic-info'
        },
        {
          id: 'branding',
          name: 'Branding',
          icon: PaintBrushIcon,
          component: BrandingSection,
          setupStep: 'branding'
        },
        {
          id: 'business-rules',
          name: 'Reglas de Negocio',
          icon: ShieldCheckIcon,
          component: null,
          isModalTrigger: true
        },
        {
          id: 'services',
          name: 'Servicios',
          icon: ClipboardDocumentListIcon,
          component: ServicesSection,
          setupStep: 'services'
        },
        {
          id: 'staff',
          name: 'Equipo de Trabajo',
          icon: UsersIcon,
          component: StaffManagementSection,
          setupStep: 'specialists'
        },
        {
          id: 'payment-methods',
          name: 'Métodos de Pago',
          icon: CreditCardIcon,
          component: PaymentMethodsSection,
          setupStep: 'payment-methods-config'
        }
      ]
    },
    {
      id: 'branches',
      name: 'Sucursales',
      icon: BuildingOfficeIcon,
      component: BranchesSection,
      setupStep: 'branches',
      moduleRequired: 'multi_branch', // ✅ Requiere módulo multi-sucursal
      alwaysVisible: false // ❌ No siempre visible
    },
    {
      id: 'calendar-access',
      name: 'Calendario y Acceso',
      icon: CalendarDaysIcon,
      component: CalendarAccessSection,
      alwaysVisible: true
    },
    {
      id: 'customer-history',
      name: 'Historial de Clientes',
      icon: UsersIcon,
      component: CustomerHistorySection,
      alwaysVisible: true
    }
  ]

  // Secciones modulares basadas en el plan
  const modulesSections = [
    {
      id: 'inventory',
      name: 'Inventario',
      icon: CubeIcon,
      component: InventoryConfigSection,
      moduleRequired: 'inventario',
      setupStep: 'inventory-config',
      hasExternalLink: true,
      externalPath: '/business/inventory'
    },
    {
      id: 'whatsapp-integration',
      name: 'WhatsApp Business',
      icon: ChatBubbleLeftRightIcon,
      component: WhatsAppConfigSection,
      moduleRequired: 'appointment-reminders',
      setupStep: 'whatsapp-config'
    },
    {
      id: 'taxxa',
      name: 'Facturación (Taxxa)',
      icon: CogIcon,
      component: TaxxaConfigSection,
      moduleRequired: 'facturacion_electronica', // Actualizado para coincidir con BD
      setupStep: 'taxxa-config'
    },
    {
      id: 'appointments',
      name: 'Gestión de Turnos',
      icon: CalendarDaysIcon,
      component: AppointmentsConfigSection,
      moduleRequired: 'gestion_de_turnos',
      setupStep: 'appointments-config'
    },
    {
      id: 'appointment-payments',
      name: 'Pagos de Turnos Online',
      icon: CreditCardIcon,
      component: AppointmentPaymentsConfigSection,
      moduleRequired: 'wompi_appointment_payments',
      setupStep: 'appointment-payments-config'
    }
   
  ]

  // Módulos que NO deben mostrarse en el sidebar (no tienen configuración UI o son redundantes)
  const excludedModules = [
    // Autenticación y seguridad (se usan pero no tienen UI de configuración)
    'autenticacion',
    'authentication',
    'auth',
    'seguridad',
    'security',
    // Panel de control (toda esta vista ES el panel de control)
    'panel_de_control',
    'dashboard',
    'panel',
    // Gestión de usuarios (se maneja desde "Equipo de Trabajo" y "Historial de Clientes")
    'gestion_de_usuarios',
    'user_management',
    'usuarios',
    'users',
    'clientes',
    'clients',
    'client_management',
    // Reserva de citas (se maneja desde "Gestión de Turnos" y "Calendario y Acceso")
    'reserva_de_citas',
    'booking',
    'appointments_booking',
    'citas',
    'appointment',
    'reservas',
    // Pagos básicos (se maneja desde "Métodos de Pago" en Configuración Inicial)
    'pagos_basicos',
    'basic_payments',
    'payments',
    'pagos',
    'payment',
    // Control de Stock (ya está incluido en "Inventario" con InventoryConfigSection)
    'stock-control',
    'stock_control',
    'control_de_stock',
    'control_stock',
    // Historial de Clientes (ya está en secciones base como alwaysVisible)
    'customer_history',
    'historial_clientes',
    'client_history',
    'historial_de_clientes'
  ]

  // Crear un mapa de secciones con información de módulos
  // Primero, enriquecer modulesSections con información de disponibilidad desde allModules
  const enrichedModulesSections = modulesSections.map(section => {
    const moduleInfo = allModules.find(m => m.name === section.moduleRequired)
    return {
      ...section,
      isAvailable: moduleInfo?.isAvailable || false,
      moduleInfo: moduleInfo || null
    }
  })

  // Luego, crear secciones genéricas solo para módulos que NO están en modulesSections
  const existingModuleNames = modulesSections.map(s => s.moduleRequired)
  const genericModulesSections = allModules
    .filter(module => 
      !excludedModules.includes(module.name.toLowerCase()) &&
      !existingModuleNames.includes(module.name)
    )
    .map(module => ({
      id: `module-${module.name}`,
      name: module.displayName || module.name,
      icon: CogIcon,
      component: null,
      moduleRequired: module.name,
      isAvailable: module.isAvailable,
      moduleInfo: module,
      isGeneric: true
    }))

  // Combinar todas las secciones SIN duplicados
  const allSections = [
    ...profileSections,
    ...enrichedModulesSections,  // Secciones específicas con info de disponibilidad
    ...genericModulesSections     // Solo módulos nuevos sin sección específica
  ]

  // Ya no necesitamos mapear nuevamente, la disponibilidad ya está incluida
  const sectionsWithAvailability = allSections.map(section => ({
    ...section,
    // Para secciones que siempre están visibles o no requieren módulo
    isAvailable: section.alwaysVisible || 
                 !section.moduleRequired || 
                 section.isAvailable === true
  }))

  console.log('📋 Sections with availability:', sectionsWithAvailability)

 

  // Función para cambiar de sección
  const handleSectionChange = (sectionId) => {
    const section = sectionsWithAvailability.find(s => s.id === sectionId)

    // Si la sección no está disponible, mostrar mensaje de upgrade
    if (section && !section.isAvailable) {
      console.log(`Sección ${sectionId} no disponible. Requiere módulo: ${section.requiredModule}`)
      // TODO: Mostrar modal de upgrade de plan
      return
    }

    // Si la sección tiene un link externo, navegar a esa ruta
    if (section?.hasExternalLink && section?.externalPath) {
      navigate(section.externalPath)
      return
    }

    // Si es una sección con tabs, activar la primera tab
    if (section?.hasTabs && section.tabs?.length > 0) {
      setActiveInitialConfigTab(section.tabs[0].id)
    }

    setActiveSection(sectionId)

    // En modo setup, actualizar la URL
    if (isSetupMode) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('step', sectionId)
      navigate(`?${newParams.toString()}`, { replace: true })
    }
  }

  // Función para manejar el cambio de tab dentro de Configuración Inicial
  const handleTabChange = (tabId) => {
    const section = sectionsWithAvailability.find(s => s.id === 'initial-config')
    const tab = section?.tabs?.find(t => t.id === tabId)

    // Si es un trigger de modal, abrir el modal correspondiente
    if (tab?.isModalTrigger) {
      if (tabId === 'business-rules') {
        setIsRuleModalOpen(true)
        return
      }
    }

    setActiveInitialConfigTab(tabId)
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
            {section.moduleInfo && (
              <p className="text-sm text-blue-600 mt-2">
                {section.moduleInfo.description}
              </p>
            )}
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

    // Si es una sección con tabs (Configuración Inicial), renderizar tabs
    if (section.hasTabs && section.tabs) {
      return (
        <div>
          {/* Navegación de tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {section.tabs.map((tab) => {
                const TabIcon = tab.icon
                const isActiveTab = activeInitialConfigTab === tab.id
                const isCompleted = tab.setupStep ? isStepCompleted(tab.setupStep) : false

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      transition-colors
                      ${isActiveTab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                    style={isActiveTab ? {
                      borderBottomColor: branding?.primaryColor || '#2563eb',
                      color: branding?.primaryColor || '#2563eb'
                    } : {}}
                  >
                    <TabIcon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    {isSetupMode && isCompleted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Contenido de la tab activa */}
          <div>
            {section.tabs.map((tab) => {
              if (tab.id !== activeInitialConfigTab) return null

              // Si es un trigger de modal (como Reglas de Negocio), mostrar mensaje
              if (tab.isModalTrigger) {
                return (
                  <div key={tab.id} className="text-center py-12">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                      <tab.icon className="h-8 w-8" style={{ color: branding?.primaryColor || '#2563eb' }} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {tab.name}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Configura las reglas de negocio que rigen el funcionamiento de tu establecimiento.
                    </p>
                    <button
                      onClick={() => setIsRuleModalOpen(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                      style={{ backgroundColor: branding?.primaryColor || '#2563eb' }}
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span>Abrir Configuración de Reglas</span>
                    </button>
                  </div>
                )
              }

              // Renderizar componente de la tab
              if (tab.component) {
                const Component = tab.component
                return (
                  <div key={tab.id}>
                    <Component
                      isSetupMode={isSetupMode}
                      onComplete={() => completeStep(tab.setupStep)}
                      isCompleted={tab.setupStep ? isStepCompleted(tab.setupStep) : false}
                    />
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      )
    }

    // Si es una sección genérica sin componente, mostrar mensaje de "próximamente"
    if (section.isGeneric) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <section.icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {section.name}
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Esta funcionalidad está en desarrollo y estará disponible próximamente.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Módulo:</span> {section.requiredModule}
            </p>
            {section.moduleInfo && (
              <p className="text-sm text-blue-600 mt-2">
                {section.moduleInfo.description}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Mantente atento a las actualizaciones
          </div>
        </div>
      )
    }

    // Renderizar componente específico si existe
    if (section.component) {
      const Component = section.component
      return (
        <Component
          isSetupMode={isSetupMode}
          onComplete={() => completeStep(section.setupStep)}
          isCompleted={section.setupStep ? isStepCompleted(section.setupStep) : false}
        />
      )
    }

    return null
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
              {/* Logo del negocio o icono por defecto */}
              {branding?.logo ? (
                <img 
                  src={branding.logo} 
                  alt={business?.name || 'Logo'} 
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
              ) : (
                <BuildingStorefrontIcon 
                  className="h-8 w-8 mr-3" 
                  style={{ color: branding?.primaryColor || '#2563eb' }}
                />
              )}
              <div>
                <h1 
                  className="text-xl font-semibold text-gray-900"
                  style={{ color: branding?.primaryColor || '#111827' }}
                >
                  {business?.name || 'Mi Negocio'}
                </h1>
                {isSetupMode && (
                  <p className="text-sm text-gray-500">
                    Configuración inicial - Progreso: {Math.round(setupProgress)}%
                  </p>
                )}
              </div>
            </div>
            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition hover:bg-gray-100"
              style={{ color: branding?.secondaryColor || '#06b6d4' }}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Salir</span>
            </button>
            {isSetupMode && (
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${setupProgress}%`,
                      backgroundColor: branding?.primaryColor || '#2563eb'
                    }}
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
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${!isAvailable
                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-60'
                        : isActive && !section.hasExternalLink
                          ? 'bg-opacity-10 border-l-4'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    style={isActive && isAvailable && !section.hasExternalLink ? {
                      backgroundColor: `${branding?.primaryColor || '#dbeafe'}20`,
                      borderLeftColor: branding?.primaryColor || '#2563eb',
                      color: branding?.primaryColor || '#1d4ed8'
                    } : {}}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{section.name}</span>

                    {/* Indicador de link externo */}
                    {section.hasExternalLink && isAvailable && (
                      <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}

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