import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { UserIcon, UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import userRoleApi from '@shared/api/userRoleApi'
import { updateUserData } from '@shared/store/slices/authSlice'

const RoleConfigSection = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  // Solo mostrar para BUSINESS o BUSINESS_SPECIALIST
  if (!['BUSINESS', 'BUSINESS_SPECIALIST'].includes(user?.role)) {
    return null
  }

  const currentRole = user?.role
  const isBusiness = currentRole === 'BUSINESS'
  const isBusinessSpecialist = currentRole === 'BUSINESS_SPECIALIST'

  const roleOptions = [
    {
      value: 'BUSINESS',
      title: 'Solo gestiono el negocio',
      description: 'Administro pero no realizo servicios',
      icon: UsersIcon,
      color: 'blue',
      isCurrent: isBusiness
    },
    {
      value: 'BUSINESS_SPECIALIST',
      title: 'Soy dueño y especialista',
      description: 'Gestiono mi negocio Y atiendo a los clientes',
      icon: UserIcon,
      color: 'purple',
      isCurrent: isBusinessSpecialist
    }
  ]

  const handleRoleChange = async () => {
    if (!selectedRole) return

    try {
      setLoading(true)
      const response = await userRoleApi.updateRole(selectedRole)
      
      if (response.success) {
        // Actualizar usuario en Redux
        dispatch(updateUserData(response.data.user))
        
        toast.success('Rol actualizado exitosamente')
        setShowConfirm(false)
        
        // Recargar para aplicar cambios en toda la app
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Error actualizando rol:', error)
      toast.error(error.response?.data?.error || 'Error al actualizar el rol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mi Rol en el Negocio
        </h3>
        <p className="text-sm text-gray-600">
          Define cómo participas en tu negocio. Esto afecta las funcionalidades que verás.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {roleOptions.map((option) => (
          <div
            key={option.value}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              option.isCurrent
                ? `border-${option.color}-500 bg-${option.color}-50`
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Current Badge */}
            {option.isCurrent && (
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-${option.color}-500 text-white`}>
                  Actual
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={`w-12 h-12 bg-${option.color}-100 rounded-xl flex items-center justify-center mb-4`}>
              <option.icon className={`w-6 h-6 text-${option.color}-600`} />
            </div>

            {/* Title */}
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {option.title}
            </h4>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {option.description}
            </p>

            {/* Change Button */}
            {!option.isCurrent && (
              <button
                onClick={() => {
                  setSelectedRole(option.value)
                  setShowConfirm(true)
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors bg-${option.color}-500 text-white hover:bg-${option.color}-600`}
              >
                Cambiar a este rol
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-blue-900 text-sm mb-1">
              ¿Cuál elegir?
            </h5>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>Solo gestiono:</strong> Si tienes empleados que atienden clientes</li>
              <li>• <strong>Dueño y especialista:</strong> Si trabajas solo o también atiendes clientes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Confirmar cambio de rol
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas cambiar tu rol? Esto afectará las funcionalidades que verás en el sistema.
              La página se recargará para aplicar los cambios.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setSelectedRole(null)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleRoleChange}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? 'Cambiando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleConfigSection
