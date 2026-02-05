import React from 'react';
import { WrenchScrewdriverIcon, ClockIcon } from '@heroicons/react/24/outline';

const MaintenancePage = ({ message, estimatedEndTime }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="animate-bounce inline-block">
              <WrenchScrewdriverIcon className="w-20 h-20 text-purple-600 mx-auto" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Estamos en Mantenimiento
          </h1>

          <p className="text-gray-600 mb-6">
            {message || 'Estamos mejorando nuestro sistema para brindarte una mejor experiencia. Volveremos pronto.'}
          </p>

          {estimatedEndTime && (
            <div className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-lg mb-6">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">
                Tiempo estimado: <span className="font-semibold">{estimatedEndTime}</span>
              </span>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ¿Tienes alguna emergencia?
            </p>
            <a
              href="mailto:soporte@controldenegocios.com"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Contáctanos
            </a>
          </div>

          {/* Animación de loading */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        <div className="mt-6 text-center text-white text-sm">
          © 2026 Control de Negocios. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
