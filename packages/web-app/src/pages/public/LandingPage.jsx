import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import LoginModal from '../auth/LoginModal';
import {
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { usePublicPlans } from '../../../../shared/src/hooks/usePublicPlans';

const LandingPage = () => {
  // Usar los hooks directamente
  const { plans, loading, error } = usePublicPlans();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Redux para auth y navegación
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Handler para el botón Ingresar
  const handleIngresar = React.useCallback(() => {
    // Si está logueado, redirige siempre
    if (isAuthenticated && user?.role) {
      if (user.role === 'OWNER') {
        window.location.replace('/owner/dashboard');
      } else if (user.role === 'BUSINESS' || user.role === 'BUSINESS_SPECIALIST') {
        window.location.replace('/business/profile');
      } else if (user.role === 'BUSINESS_OWNER') {
        window.location.replace('/dashboard');
      }
      // Agrega más roles si es necesario
      return;
    }
    // Si no está logueado, abre el modal
    setShowLoginModal(true);
  }, [isAuthenticated, user]);

  // Handler para el botón Ingresar
  // (Solo una declaración, ya que la anterior es suficiente)

  // Eliminado: redirección automática al montar. Solo el botón 'Ingresar' redirige.

  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  // Features principales de la plataforma
  const platformFeatures = [
    {
      icon: ChartBarIcon,
      title: "Reportes Avanzados",
      description: "Analítica completa de tu negocio con reportes en tiempo real"
    },
    {
      icon: UsersIcon,
      title: "Gestión de Clientes",
      description: "Administra tu base de clientes y mejora la experiencia"
    },
    {
      icon: CreditCardIcon,
      title: "Pagos Integrados",
      description: "Procesa pagos de forma segura con múltiples métodos"
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "App Móvil",
      description: "Acceso completo desde cualquier dispositivo móvil"
    },
    {
      icon: CloudIcon,
      title: "En la Nube",
      description: "Datos seguros y accesibles desde cualquier lugar"
    },
    {
      icon: ShieldCheckIcon,
      title: "Seguridad Garantizada",
      description: "Protección de datos con los más altos estándares"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-nunito">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white">
        {/* Logo arriba a la izquierda */}
        <div className="absolute top-0 left-0 z-20 p-4">
          <a href="/">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto sm:h-14" />
          </a>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-cyan-400/20 backdrop-blur-sm rounded-full border border-yellow-400/30">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium text-yellow-100">Prueba gratis</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              La plataforma completa para
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-cyan-600">
                {" "}gestionar tu negocio
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Simplifica la gestión de tu negocio con herramientas profesionales, 
              reportes inteligentes y una experiencia que tus clientes amarán.
            </p>
            
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <a 
                href="/subscribe" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-cyan-400 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
              >
                Ver Planes
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <button
                type="button"
                onClick={handleIngresar}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-400 text-gray-300 font-semibold rounded-lg hover:bg-white/10 hover:border-gray-300 transition-all duration-200 text-sm sm:text-base"
              >
                Ingresar
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto text-center px-4">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-cyan-600">1000+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Negocios activos</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-cyan-600">50K+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Citas gestionadas</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-cyan-600">99.9%</div>
                <div className="text-gray-400 text-xs sm:text-sm">Tiempo activo</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-cyan-600">24/7</div>
                <div className="text-gray-400 text-xs sm:text-sm">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-3">
              ¿Por qué elegir Control de Negocios?
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto px-4">
              Herramientas diseñadas para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {platformFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group text-center p-4 sm:p-6 hover:bg-gray-50 rounded-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg mb-3 sm:mb-4 group-hover:bg-gray-200 transition-colors duration-300 mx-auto">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed hidden sm:block">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="py-20 sm:py-24 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-gray-900 text-sm font-semibold rounded-full mb-6">
              Prueba gratuita
            </div>
          </div>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Elige el plan perfecto para tu negocio
            </h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-yellow-400"></div>
            </div>
          ) : error && plans.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="text-red-400 mb-4 text-lg font-medium">Error cargando planes</div>
              <p className="text-gray-300">{error}</p>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet: máximo 3 planes */}
              <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                {(plans.length > 0 ? plans.slice(0, 3) : []).map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 flex flex-col h-full ${
                      plan.isPopular
                        ? 'ring-4 ring-yellow-400 scale-105 z-10'
                        : 'hover:scale-105'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                          <StarIcon className="h-4 w-4 mr-1" />
                          MÁS POPULAR
                        </div>
                      </div>
                    )}
                    <div className="p-8 sm:p-10 flex flex-col flex-1">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{plan.name}</h3>
                        <div className="mb-6">
                          <div className="flex items-baseline justify-center">
                            <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                              ${Math.floor((plan.displayPrice || plan.price) / 1000)}
                            </span>
                            <span className="text-2xl font-semibold text-gray-600 ml-1">/mes</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">{plan.description}</p>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {plan.features && plan.features.slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 mr-3 ${
                              index === 0 ? 'bg-cyan-400' : 
                              index === 1 ? 'bg-yellow-400' : 
                              'bg-red-400'
                            }`}>
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {(!plan.features || plan.features.length < 6) && (
                        <div style={{ flexGrow: 1 }}></div>
                      )}
                      <div className="space-y-3 mt-auto">
                        <a
                          href="/subscribe"
                          className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl inline-flex items-center justify-center ${
                            index === 0 ? 'bg-cyan-400 hover:bg-cyan-500 text-white' :
                            index === 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' :
                            'bg-red-400 hover:bg-red-500 text-white'
                          }`}
                        >
                          Probar gratis
                        </a>
                        <a
                          href="/subscribe"
                          className={`w-full py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 border-2 inline-flex items-center justify-center ${
                            index === 0 ? 'border-cyan-400 text-cyan-600 hover:bg-cyan-50' :
                            index === 1 ? 'border-yellow-400 text-yellow-600 hover:bg-yellow-50' :
                            'border-red-400 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Elegir Plan
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {plans.length > 3 && (
                <div className="text-center mt-8 sm:block hidden">
                  <a href="/subscribe" className="inline-block px-8 py-4 rounded-xl bg-cyan-400 text-white font-bold text-lg shadow-lg hover:bg-cyan-500 transition-all duration-200">
                    Ver más planes
                  </a>
                </div>
              )}
              {/* Mobile: solo el más popular y botón */}
              <div className="sm:hidden">
                {plans.length > 0 && (() => {
                  const popular = plans.find(p => p.isPopular) || plans[0];
                  return (
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative bg-white rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 flex flex-col h-full max-w-xs mx-auto ${
                          popular.isPopular
                            ? 'ring-4 ring-yellow-400 scale-105 z-10'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold rounded-full shadow-lg">
                            <StarIcon className="h-4 w-4 mr-1" />
                            MÁS POPULAR
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-1">
                          <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{popular.name}</h3>
                            <div className="mb-6">
                              <div className="flex items-baseline justify-center">
                                <span className="text-5xl font-bold text-gray-900">
                                  ${Math.floor((popular.displayPrice || popular.price) / 1000)}
                                </span>
                                <span className="text-2xl font-semibold text-gray-600 ml-1">/mes</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{popular.description}</p>
                          </div>
                          <ul className="space-y-4 mb-8">
                            {popular.features && popular.features.slice(0, 6).map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 mr-3 bg-cyan-400">
                                  <CheckCircleIcon className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {(!popular.features || popular.features.length < 6) && (
                            <div style={{ flexGrow: 1 }}></div>
                          )}
                          <div className="space-y-3 mt-auto">
                            <a
                              href="/subscribe"
                              className="w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl inline-flex items-center justify-center bg-cyan-400 hover:bg-cyan-500 text-white"
                            >
                              Probar gratis
                            </a>
                            <a
                              href="/subscribe"
                              className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 border-2 inline-flex items-center justify-center border-cyan-400 text-cyan-600 hover:bg-cyan-50"
                            >
                              Elegir Plan
                            </a>
                          </div>
                        </div>
                      </div>
                      {plans.length > 1 && (
                        <a href="/subscribe" className="mt-8 inline-block px-8 py-4 rounded-xl bg-cyan-400 text-white font-bold text-lg shadow-lg hover:bg-cyan-500 transition-all duration-200">
                          Ver más planes
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-gray-300 mb-6 text-sm sm:text-base px-4">
              ¿Necesitas un plan personalizado? 
            </p>
            <a 
              href="https://wa.me/573005555555" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-gray-400 text-gray-300 rounded-lg hover:bg-white/10 hover:border-gray-300 transition-all duration-200 text-sm sm:text-base"
            >
              Contacta con nosotros
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Plan Comparison Table */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Compara todos nuestros planes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra el plan perfecto según las necesidades de tu negocio
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-6 px-4 text-gray-900 font-semibold text-lg w-1/6">
                    Características
                  </th>
                  {plans.map((plan, idx) => (
                    <th 
                      key={plan.id} 
                      className={`py-6 px-4 text-center ${
                        plan.isPopular ? 'bg-yellow-50 border-l-4 border-r-4 border-t-4 border-yellow-400' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        {plan.isPopular && (
                          <div className="inline-flex items-center px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                            <StarIcon className="h-3 w-3 mr-1" />
                            MÁS POPULAR
                          </div>
                        )}
                        {plan.price === 0 && (
                          <div className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            ¡GRATIS!
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <div className="text-3xl font-bold text-gray-900">
                          {plan.price === 0 ? (
                            <span className="text-green-600">$0</span>
                          ) : (
                            <span>${Math.floor(plan.price / 1000)}k</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {plan.price === 0 ? 'Para siempre' : 'por mes'}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Límites */}
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Usuarios</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                      <span className="font-semibold text-gray-900">{plan.maxUsers || '∞'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-900">Clientes</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                      <span className="font-semibold text-gray-900">{plan.maxClients || '∞'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="py-4 px-4 font-semibold text-gray-900">Citas/mes</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                      <span className="font-semibold text-gray-900">{plan.maxAppointments || '∞'}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-semibold text-gray-900">Almacenamiento</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                      <span className="font-semibold text-gray-900">
                        {plan.storageGB ? `${plan.storageGB}GB` : '∞'}
                      </span>
                    </td>
                  ))}
                </tr>
                
                {/* Módulos Principales */}
                <tr className="border-b-2 border-gray-300 bg-gray-100">
                  <td colSpan={plans.length + 1} className="py-3 px-4 font-bold text-gray-900 text-sm uppercase">
                    Funcionalidades
                  </td>
                </tr>
                
                {[
                  { key: 'authentication', label: 'Autenticación y Seguridad' },
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'user-management', label: 'Gestión de Usuarios' },
                  { key: 'multi_branch', label: 'Multi-sucursal' },
                  { key: 'appointment-booking', label: 'Reserva de Citas' },
                  { key: 'appointment-reminders', label: 'Recordatorios de Citas' },
                  { key: 'inventory', label: 'Inventario' },
                  { key: 'stock-control', label: 'Control de Stock' },
                  { key: 'basic-payments', label: 'Pagos Básicos' },
                  { key: 'wompi_integration', label: 'Integración Wompi' },
                  { key: 'taxxa_integration', label: 'Integración Taxxa' },
                  { key: 'expenses', label: 'Gestión de Gastos' },
                  { key: 'balance', label: 'Balance y Reportes' },
                  { key: 'client_history', label: 'Historial de Clientes' },
                  { key: 'advanced-analytics', label: 'Analítica Avanzada' }
                ].map((module, idx) => (
                  <tr key={module.key} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="py-4 px-4 text-gray-700">{module.label}</td>
                    {plans.map(plan => {
                      const hasModule = plan.modules?.some(m => m.name === module.key);
                      return (
                        <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                          {hasModule ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300 text-2xl">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* CTA Row */}
                <tr className="border-t-2 border-gray-300">
                  <td className="py-6 px-4"></td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`py-6 px-4 text-center ${plan.isPopular ? 'bg-yellow-50' : ''}`}>
                      <a
                        href="/subscribe"
                        className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          plan.price === 0 
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : plan.isPopular 
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                            : 'bg-gray-700 hover:bg-gray-800 text-white'
                        }`}
                      >
                        {plan.price === 0 ? 'Empezar Gratis' : 'Elegir Plan'}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-6">
            {plans.map((plan, planIdx) => (
              <div key={plan.id} className={`border-2 rounded-xl overflow-hidden ${
                plan.isPopular ? 'border-yellow-400 shadow-lg' : 'border-gray-200'
              }`}>
                {/* Plan Header */}
                <div className={`p-6 ${plan.isPopular ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="text-center space-y-2">
                    {plan.isPopular && (
                      <div className="inline-flex items-center px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-2">
                        <StarIcon className="h-3 w-3 mr-1" />
                        MÁS POPULAR
                      </div>
                    )}
                    {plan.price === 0 && (
                      <div className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2">
                        ¡GRATIS!
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? (
                        <span className="text-green-600">$0</span>
                      ) : (
                        <span>${Math.floor(plan.price / 1000)}k</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.price === 0 ? 'Para siempre' : 'por mes'}
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600">Usuarios</div>
                      <div className="text-lg font-semibold text-gray-900">{plan.maxUsers || '∞'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Clientes</div>
                      <div className="text-lg font-semibold text-gray-900">{plan.maxClients || '∞'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Citas/mes</div>
                      <div className="text-lg font-semibold text-gray-900">{plan.maxAppointments || '∞'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Almacenamiento</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {plan.storageGB ? `${plan.storageGB}GB` : '∞'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Funcionalidades incluidas:</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'authentication', label: 'Autenticación' },
                        { key: 'dashboard', label: 'Dashboard' },
                        { key: 'user-management', label: 'Gestión de Usuarios' },
                        { key: 'multi_branch', label: 'Multi-sucursal' },
                        { key: 'appointment-booking', label: 'Reserva de Citas' },
                        { key: 'appointment-reminders', label: 'Recordatorios' },
                        { key: 'inventory', label: 'Inventario' },
                        { key: 'stock-control', label: 'Control de Stock' },
                        { key: 'basic-payments', label: 'Pagos Básicos' },
                        { key: 'wompi_integration', label: 'Wompi' },
                        { key: 'taxxa_integration', label: 'Taxxa' },
                        { key: 'expenses', label: 'Gastos' },
                        { key: 'balance', label: 'Balance' },
                        { key: 'client_history', label: 'Historial' },
                        { key: 'advanced-analytics', label: 'Analítica Avanzada' }
                      ].map(module => {
                        const hasModule = plan.modules?.some(m => m.name === module.key);
                        return (
                          <div key={module.key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{module.label}</span>
                            {hasModule ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <a
                    href="/subscribe"
                    className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      plan.price === 0 
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : plan.isPopular 
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                        : 'bg-gray-700 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Empezar Gratis' : 'Elegir Plan'}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Tienes dudas sobre qué plan elegir?
            </p>
            <a 
              href="https://wa.me/573005555555" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-gray-700 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Habla con nosotros
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-cyan-400">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700 mb-4 sm:mb-6">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Únete a miles de negocios que ya confían en nuestra plataforma
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto xs:max-w-none">
            <a 
              href="/subscribe" 
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Comenzar Prueba Gratuita
              <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a 
              href="https://wa.me/573005555555" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900/10 transition-all duration-200 text-sm sm:text-base"
            >
              Solicitar Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Control de Negocios</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              La plataforma completa para gestionar tu negocio
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-400 text-sm sm:text-base">
              <Link to="/terminos" className="hover:text-white transition-colors duration-200">Términos de Servicio</Link>
              <Link to="/privacidad" className="hover:text-white transition-colors duration-200">Política de Privacidad</Link>
              <a href="#" className="hover:text-white transition-colors duration-200">Soporte</a>
              <a href="https://wa.me/573005555555" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">Contacto</a>
            </div>
            <div className="mt-6 text-gray-500 text-xs sm:text-sm">
              © 2025 Control de Negocios. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;