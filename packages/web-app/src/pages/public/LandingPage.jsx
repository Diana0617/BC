import React, { useState } from 'react';
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
import { usePublicPlans, usePlanPurchase } from '../../../../shared/src/hooks/usePublicPlans';

const LandingPage = () => {
  // Usar los hooks directamente
  const { plans, loading, error } = usePublicPlans();
  const { initiatePurchase, loading: purchaseLoading } = usePlanPurchase();

  const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePlanPurchase = async (plan) => {
    try {
      console.log('🛒 Iniciando compra del plan:', plan.name);
      const result = await initiatePurchase(plan.id);
      
      if (result.success) {
        // Redirigir a URL proporcionada
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        alert('Error procesando la compra. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Error procesando la compra. Intenta nuevamente.');
    }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-nunito">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-yellow-300" />
                <span className="text-xs sm:text-sm font-medium">Transforma tu negocio hoy</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              La plataforma completa para
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                {" "}gestionar tu negocio
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
              Simplifica la gestión de tu negocio con herramientas profesionales, 
              reportes inteligentes y una experiencia que tus clientes amarán.
            </p>
            
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <a 
                href="#planes" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
              >
                Ver Planes
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a 
                href="#demo" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 text-sm sm:text-base"
              >
                Ver Demo
              </a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto text-center px-4">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold">1000+</div>
                <div className="text-blue-200 text-xs sm:text-sm">Negocios activos</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold">50K+</div>
                <div className="text-blue-200 text-xs sm:text-sm">Citas gestionadas</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold">99.9%</div>
                <div className="text-blue-200 text-xs sm:text-sm">Tiempo activo</div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xl sm:text-2xl font-bold">24/7</div>
                <div className="text-blue-200 text-xs sm:text-sm">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Todo lo que necesitas para hacer crecer tu negocio
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Herramientas profesionales diseñadas específicamente para negocios de belleza y bienestar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {platformFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="py-16 sm:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Elige el plan perfecto para tu negocio
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Sin compromisos a largo plazo. Cancela cuando quieras. Soporte incluido en todos los planes.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : error && plans.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="text-red-500 mb-4 text-lg font-medium">Error cargando planes</div>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    plan.isPopular
                      ? 'border-blue-500 ring-2 sm:ring-4 ring-blue-100 scale-100 lg:scale-105'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                      <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-full">
                        <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Más Popular
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{plan.description}</p>
                      
                      <div className="mb-4 sm:mb-6">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                          {formatPrice(plan.displayPrice || plan.price)}
                        </span>
                        <span className="text-gray-600 ml-1 sm:ml-2 text-sm sm:text-base">
                          / {plan.displayDuration} {plan.durationType === 'MONTHS' ? 'mes' : 'día'}
                          {plan.displayDuration > 1 ? (plan.durationType === 'MONTHS' ? 'es' : 's') : ''}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {plan.features && plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanPurchase(plan)}
                      disabled={purchaseLoading}
                      className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl'
                      } ${purchaseLoading ? 'opacity-50 cursor-not-allowed' : ''} disabled:transform-none`}
                    >
                      {purchaseLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </div>
                      ) : (
                        'Comenzar Ahora'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
              ¿Necesitas un plan personalizado? ¿Tienes más de 10 negocios?
            </p>
            <a 
              href="#contacto" 
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
            >
              Contacta con nosotros
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Únete a miles de negocios que ya confían en nuestra plataforma
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto xs:max-w-none">
            <a 
              href="#planes" 
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Comenzar Prueba Gratuita
              <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a 
              href="#demo" 
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 text-sm sm:text-base"
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
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Beauty Control</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              La plataforma completa para gestionar tu negocio de belleza
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-400 text-sm sm:text-base">
              <a href="#" className="hover:text-white transition-colors duration-200">Términos</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Soporte</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;