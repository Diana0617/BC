import React, { useState, useEffect } from 'react'
import { XMarkIcon, CheckCircleIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline'

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole, userName }) => {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      console.log('🎭 RoleSelectionModal abierto:', {
        isOpen,
        userName,
        hasOnClose: !!onClose,
        hasOnSelectRole: !!onSelectRole
      });
    }
  }, [isOpen, userName, onClose, onSelectRole]);

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!selected) return
    
    setLoading(true)
    await onSelectRole(selected)
    setLoading(false)
  }

  const roleOptions = [
    {
      id: 'BUSINESS_SPECIALIST',
      title: 'Soy dueño y especialista',
      description: 'Gestiono mi negocio Y atiendo a los clientes',
      icon: UserIcon,
      color: 'purple',
      benefits: [
        'Gestión completa del negocio',
        'Atención directa a clientes',
        'Control de agenda y servicios',
        'Cobros y facturación',
        'Firmar consentimientos'
      ]
    },
    {
      id: 'BUSINESS',
      title: 'Solo gestiono el negocio',
      description: 'Administro pero no realizo servicios',
      icon: UsersIcon,
      color: 'blue',
      benefits: [
        'Gestión administrativa',
        'Contratar especialistas',
        'Supervisar operaciones',
        'Ver reportes y estadísticas',
        'Configurar el negocio'
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                ¡Bienvenido, {userName}! 👋
              </h2>
              <p className="text-pink-100">
                Para personalizar tu experiencia, cuéntanos cómo vas a usar la plataforma
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={loading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Cómo vas a trabajar en tu negocio?
            </h3>
            <p className="text-gray-600 text-sm">
              Esta configuración afecta qué funcionalidades verás y cómo se organiza tu panel de control.
              Puedes cambiar esto después en tu perfil.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`relative text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                  selected === option.id
                    ? `border-${option.color}-500 bg-${option.color}-50 shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selected Badge */}
                {selected === option.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircleIcon className={`w-8 h-8 text-${option.color}-500`} />
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 bg-${option.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <option.icon className={`w-8 h-8 text-${option.color}-600`} />
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {option.title}
                </h4>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {option.description}
                </p>

                {/* Benefits */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Podrás:
                  </p>
                  {option.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className={`w-4 h-4 text-${option.color}-500 mt-0.5 flex-shrink-0`} />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-blue-900 text-sm mb-1">
                  ¿No estás seguro?
                </h5>
                <p className="text-blue-800 text-sm">
                  No te preocupes, puedes cambiar esto en cualquier momento desde <strong>Configuración → Mi Perfil</strong>.
                  Si más adelante contratas especialistas o empiezas a atender tú mismo, solo actualiza tu rol.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Decidir después
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selected
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelectionModal
