/**
 * BusinessWompiSetupGuide.jsx
 * 
 * Guía educativa para configurar Wompi
 * Muestra paso a paso cómo obtener las credenciales de Wompi
 */

import React from 'react'
import {
  InformationCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const BusinessWompiSetupGuide = () => {
  const steps = [
    {
      number: 1,
      title: 'Crear cuenta en Wompi',
      description: 'Si aún no tienes cuenta, regístrate en Wompi como comercio',
      link: 'https://comercios.wompi.co/signup',
      linkText: 'Ir a Wompi'
    },
    {
      number: 2,
      title: 'Acceder al Dashboard',
      description: 'Inicia sesión en tu cuenta de Wompi y ve al Dashboard',
      link: 'https://comercios.wompi.co/login',
      linkText: 'Iniciar sesión'
    },
    {
      number: 3,
      title: 'Obtener credenciales de Prueba',
      description: 'En Configuración → Credenciales, copia tu Llave Pública, Llave Privada y Secret de Integridad del ambiente de prueba',
      icon: KeyIcon
    },
    {
      number: 4,
      title: 'Configurar y probar',
      description: 'Pega las credenciales aquí abajo y haz clic en "Verificar Credenciales" para probar la conexión',
      icon: ShieldCheckIcon
    },
    {
      number: 5,
      title: 'Obtener credenciales de Producción (Opcional)',
      description: 'Una vez que hayas probado todo, obtén tus credenciales de producción para empezar a recibir pagos reales',
      icon: CheckCircleIcon
    }
  ]

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            ¿Cómo obtener mis credenciales de Wompi?
          </h3>
          <p className="text-sm text-blue-700">
            Sigue estos pasos para configurar tu cuenta de Wompi y empezar a recibir pagos de tus clientes:
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {steps.map((step) => {
          const Icon = step.icon || CheckCircleIcon
          return (
            <div key={step.number} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {step.description}
                </p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                    {step.linkText}
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-200">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
          Importante
        </h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Las credenciales de <strong>prueba</strong> son obligatorias para empezar</li>
          <li>Las credenciales de <strong>producción</strong> son opcionales inicialmente</li>
          <li>Nunca compartas tus claves privadas con nadie</li>
          <li>Puedes cambiar entre modo prueba y producción en cualquier momento</li>
        </ul>
      </div>
    </div>
  )
}

export default BusinessWompiSetupGuide
