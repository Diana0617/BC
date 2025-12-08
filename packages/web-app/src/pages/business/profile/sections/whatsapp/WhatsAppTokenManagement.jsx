import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  storeToken,
  rotateToken,
  deleteToken,
  selectTokenInfo,
  selectIsStoring,
  selectIsRotating,
  selectIsDeleting,
  selectStoreError,
  selectRotateError,
  selectDeleteError,
  selectSuccessMessage,
  clearSuccessMessage
} from '@shared/store/slices/whatsappTokenSlice'
import {
  KeyIcon,
  ArrowPathIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * WhatsAppTokenManagement Component
 * 
 * Componente para gestión manual de tokens de WhatsApp Business API.
 * Permite:
 * - Almacenar token manualmente
 * - Rotar token existente
 * - Eliminar token (desconectar)
 */
const WhatsAppTokenManagement = () => {
  const dispatch = useDispatch()
  
  const tokenInfo = useSelector(selectTokenInfo)
  const isStoring = useSelector(selectIsStoring)
  const isRotating = useSelector(selectIsRotating)
  const isDeleting = useSelector(selectIsDeleting)
  const storeError = useSelector(selectStoreError)
  const rotateError = useSelector(selectRotateError)
  const deleteError = useSelector(selectDeleteError)
  const successMessage = useSelector(selectSuccessMessage)

  const [formData, setFormData] = useState({
    accessToken: '',
    phoneNumberId: '',
    wabaId: ''
  })

  const [rotateFormData, setRotateFormData] = useState({
    newAccessToken: ''
  })

  const [showRotateForm, setShowRotateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Clear success message after 5 seconds
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  const handleStoreToken = async (e) => {
    e.preventDefault()

    // Validations
    if (!formData.accessToken || !formData.phoneNumberId) {
      toast.error('Todos los campos son requeridos')
      return
    }

    const result = await dispatch(storeToken({
      accessToken: formData.accessToken,
      phoneNumberId: formData.phoneNumberId,
      wabaId: formData.wabaId || undefined
    }))

    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Token almacenado correctamente')
      setFormData({ accessToken: '', phoneNumberId: '', wabaId: '' })
    } else {
      toast.error('❌ Error al almacenar el token')
    }
  }

  const handleRotateToken = async (e) => {
    e.preventDefault()

    if (!rotateFormData.newAccessToken) {
      toast.error('El nuevo token es requerido')
      return
    }

    const result = await dispatch(rotateToken(rotateFormData.newAccessToken))

    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Token rotado correctamente')
      setRotateFormData({ newAccessToken: '' })
      setShowRotateForm(false)
    } else {
      toast.error('❌ Error al rotar el token')
    }
  }

  const handleDeleteToken = async () => {
    const result = await dispatch(deleteToken())

    if (result.type.endsWith('/fulfilled')) {
      toast.success('✅ Token eliminado correctamente')
      setShowDeleteConfirm(false)
    } else {
      toast.error('❌ Error al eliminar el token')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <KeyIcon className="h-6 w-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Gestión Manual de Token
          </h3>
          <p className="text-sm text-gray-600">
            Configura o actualiza manualmente tu token de acceso a WhatsApp Business API
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Nota importante:</p>
            <p>
              Los tokens manuales pueden expirar. Se recomienda usar <strong>Embedded Signup</strong> para
              obtener tokens permanentes y configuración automática.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Store Token Form (if no token exists) */}
      {!tokenInfo.hasToken && (
        <form onSubmit={handleStoreToken} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Access Token */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token *
              </label>
              <input
                type="password"
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token de acceso permanente de Meta Business
              </p>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                value={formData.phoneNumberId}
                onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                placeholder="123456789012345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID del número de teléfono en Meta
              </p>
            </div>

            {/* WABA ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WABA ID (Opcional)
              </label>
              <input
                type="text"
                value={formData.wabaId}
                onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                placeholder="123456789012345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                WhatsApp Business Account ID
              </p>
            </div>
          </div>

          {/* Error Message */}
          {storeError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{storeError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isStoring}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStoring ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Almacenando Token...
              </>
            ) : (
              <>
                <KeyIcon className="h-5 w-5 mr-2" />
                Almacenar Token
              </>
            )}
          </button>
        </form>
      )}

      {/* Token Actions (if token exists) */}
      {tokenInfo.hasToken && (
        <div className="space-y-4">
          {/* Rotate Token */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Rotar Token</h4>
              </div>
              <button
                onClick={() => setShowRotateForm(!showRotateForm)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showRotateForm ? 'Cancelar' : 'Rotar'}
              </button>
            </div>
            
            {showRotateForm && (
              <form onSubmit={handleRotateToken} className="space-y-3">
                <input
                  type="password"
                  value={rotateFormData.newAccessToken}
                  onChange={(e) => setRotateFormData({ newAccessToken: e.target.value })}
                  placeholder="Nuevo Access Token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                
                {rotateError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {rotateError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isRotating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRotating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rotando...
                    </>
                  ) : (
                    'Actualizar Token'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Delete Token */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrashIcon className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-semibold text-red-900">Desconectar WhatsApp</h4>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {showDeleteConfirm ? 'Cancelar' : 'Eliminar'}
              </button>
            </div>
            
            {showDeleteConfirm && (
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    <strong>¿Estás seguro?</strong> Esto eliminará el token y desconectará WhatsApp Business.
                    No se podrán enviar mensajes hasta que reconectes.
                  </p>
                </div>
                
                {deleteError && (
                  <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-900">
                    {deleteError}
                  </div>
                )}
                
                <button
                  onClick={handleDeleteToken}
                  disabled={isDeleting}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </>
                  ) : (
                    'Confirmar Eliminación'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Links */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">¿Cómo obtener estos datos?</h4>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            • <a href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              Obtener Access Token
            </a>
          </li>
          <li>
            • <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#phone-number-id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              Encontrar Phone Number ID
            </a>
          </li>
          <li>
            • <a href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#business-id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
              Encontrar WABA ID
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default WhatsAppTokenManagement
