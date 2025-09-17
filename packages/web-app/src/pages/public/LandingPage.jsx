import React, { useState } from 'react';
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
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-cyan-400/20 backdrop-blur-sm rounded-full border border-yellow-400/30">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium text-yellow-100">Prueba gratis 14 días</span>
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
                onClick={() => setShowLoginModal(true)}
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
              ¿Por qué elegir Business Control?
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
          {/* Header con badge de prueba gratis */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-gray-900 text-sm font-semibold rounded-full mb-6">
              Prueba gratuita de 14 días
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
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
                    {/* Plan Header */}
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

                    {/* Features List */}
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

                    {/* Relleno para igualar altura si hay pocas features */}
                    {(!plan.features || plan.features.length < 6) && (
                      <div style={{ flexGrow: 1 }}></div>
                    )}

                    {/* Action Buttons */}
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
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Business Control</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              La plataforma completa para gestionar tu negocio
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-400 text-sm sm:text-base">
              <a href="#" className="hover:text-white transition-colors duration-200">Términos</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Soporte</a>
              <a href="https://wa.me/573005555555" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;