import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPaymentMethods,
  createPaymentMethod as createPaymentMethodAction,
  updatePaymentMethod as updatePaymentMethodAction,
  togglePaymentMethod as togglePaymentMethodAction,
  deletePaymentMethod as deletePaymentMethodAction,
  selectPaymentMethods,
  selectPaymentMethodsLoading
} from '@shared'
import {
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ArrowsRightLeftIcon,
  QrCodeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { usePermissions } from '@shared/hooks'
import UpgradePlanModal from '../../../../components/common/UpgradePlanModal'
import toast from 'react-hot-toast'

// Mapeo de tipos de pago a iconos y colores
const PAYMENT_TYPE_CONFIG = {
  CASH: {
    icon: BanknotesIcon,
    label: 'Efectivo',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  CARD: {
    icon: CreditCardIcon,
    label: 'Tarjeta',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  TRANSFER: {
    icon: ArrowsRightLeftIcon,
    label: 'Transferencia',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  QR: {
    icon: QrCodeIcon,
    label: 'Código QR',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600'
  },
  ONLINE: {
    icon: GlobeAltIcon,
    label: 'Pago en Línea',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  OTHER: {
    icon: DevicePhoneMobileIcon,
    label: 'Otro',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600'
  }
}

const PaymentMethodsSection = ({ isSetupMode, onComplete }) => {
  const dispatch = useDispatch()
  const { isBusinessSpecialist } = usePermissions()
  const { currentBusiness } = useSelector(state => state.business)
  
  // Obtener la suscripción activa o la primera disponible
  const currentSubscription = currentBusiness?.subscriptions?.find(sub => 
    sub.status === 'ACTIVE' || sub.status === 'TRIAL'
  ) || currentBusiness?.subscriptions?.[0] || currentBusiness?.subscription

  // Determinar si el usuario tiene restricciones (por rol o por plan gratuito)
  const planPrice = currentSubscription?.plan?.price
  const isFreePlan = planPrice === 0 || planPrice === '0.00' || parseFloat(planPrice) === 0
  const isRestricted = isBusinessSpecialist || isFreePlan

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Redux state
  const paymentMethods = useSelector(selectPaymentMethods)
  const loading = useSelector(selectPaymentMethodsLoading)

  // Local state
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'CASH',
    requiresProof: false,
    bankInfo: {
      bankName: '',
      accountNumber: '',
      accountType: '',
      cci: '',
      holderName: '',
      phoneNumber: ''
    },
    description: ''
  })

  // Fetch payment methods on mount
  useEffect(() => {
    dispatch(fetchPaymentMethods())
  }, [dispatch])

  const handleCreate = () => {
    if (isRestricted) {
      setShowUpgradeModal(true)
      return
    }
    setEditingMethod(null)
    setFormData({
      name: '',
      type: 'CASH',
      requiresProof: false,
      bankInfo: {
        bankName: '',
        accountNumber: '',
        accountType: '',
        cci: '',
        holderName: '',
        phoneNumber: ''
      },
      description: ''
    })
    setShowModal(true)
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      requiresProof: method.requiresProof || false,
      bankInfo: method.bankInfo || {
        bankName: '',
        accountNumber: '',
        accountType: '',
        cci: '',
        holderName: '',
        phoneNumber: ''
      },
      description: method.metadata?.description || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      // Validaciones
      if (!formData.name.trim()) {
        toast.error('El nombre es requerido')
        return
      }

      if (formData.type === 'TRANSFER' && !formData.bankInfo.accountNumber) {
        toast.error('El número de cuenta es requerido para transferencias')
        return
      }

      if (formData.type === 'QR' && !formData.bankInfo.phoneNumber) {
        toast.error('El teléfono es requerido para métodos QR')
        return
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        requiresProof: formData.requiresProof,
        bankInfo: formData.bankInfo,
        metadata: {
          description: formData.description
        }
      }

      if (editingMethod) {
        // Actualizar
        await dispatch(updatePaymentMethodAction({
          methodId: editingMethod.id,
          methodData: payload
        })).unwrap()
        toast.success('Método actualizado correctamente')
      } else {
        // Crear
        await dispatch(createPaymentMethodAction(payload)).unwrap()
        toast.success('Método creado correctamente')
      }

      setShowModal(false)
    } catch (error) {
      console.error('Error saving payment method:', error)
      toast.error(error || 'Error al guardar')
    }
  }

  const handleToggle = async (method) => {
    try {
      const result = await dispatch(togglePaymentMethodAction(method.id)).unwrap()
      toast.success(result.data.isActive ? 'Método activado' : 'Método desactivado')
    } catch (error) {
      console.error('Error toggling method:', error)
      // Si es la validación del único método activo, mostrar warning en lugar de error
      if (error.includes('único método de pago activo')) {
        toast.warning('Debes tener al menos un método de pago activo')
      } else {
        toast.error(error || 'Error al cambiar estado')
      }
    }
  }

  const handleDelete = async (method) => {
    if (!confirm(`¿Eliminar permanentemente "${method.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await dispatch(deletePaymentMethodAction(method.id)).unwrap()
      toast.success('Método eliminado correctamente')
    } catch (error) {
      console.error('Error deleting method:', error)
      // Si es la validación del único método activo, mostrar warning
      if (error.includes('único método de pago activo')) {
        toast.warning('Debes tener al menos un método de pago activo')
      } else {
        toast.error(error || 'Error al eliminar')
      }
    }
  }

  const renderPaymentMethodCard = (method) => {
    const config = PAYMENT_TYPE_CONFIG[method.type] || PAYMENT_TYPE_CONFIG.OTHER
    const Icon = config.icon

    return (
      <div
        key={method.id}
        className={`bg-white border-2 rounded-xl p-6 transition-all ${
          method.isActive ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 opacity-60'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${config.gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{method.name}</h4>
              <p className="text-sm text-gray-500">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggle(method)}
              className={`p-2 rounded-lg transition-colors ${
                method.isActive
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
              title={method.isActive ? 'Desactivar' : 'Activar'}
            >
              {method.isActive ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {method.requiresProof && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              Requiere comprobante
            </span>
          )}
          <span className={`px-2 py-1 bg-${config.color}-50 text-${config.color}-700 text-xs rounded-full`}>
            Orden #{method.order || '?'}
          </span>
        </div>

        {/* Bank Info */}
        {method.bankInfo && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
            {method.bankInfo.phoneNumber && (
              <p className="text-sm text-gray-700">
                📱 {method.bankInfo.phoneNumber}
              </p>
            )}
            {method.bankInfo.bankName && (
              <p className="text-sm text-gray-700">
                🏦 {method.bankInfo.bankName}
              </p>
            )}
            {method.bankInfo.accountNumber && (
              <p className="text-sm text-gray-700">
                💳 {method.bankInfo.accountType || 'Cuenta'}: {method.bankInfo.accountNumber}
              </p>
            )}
            {method.bankInfo.cci && (
              <p className="text-sm text-gray-700">
                🔢 CCI: {method.bankInfo.cci}
              </p>
            )}
            {method.bankInfo.holderName && (
              <p className="text-sm text-gray-700">
                👤 {method.bankInfo.holderName}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(method)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => handleDelete(method)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCardIcon className="h-8 w-8 text-pink-600" />
            Métodos de Pago
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura los métodos de pago que aceptarás en tu negocio
          </p>
        </div>
        {isSetupMode && (
          <div className="flex items-center text-sm text-blue-600">
            <span>Paso opcional</span>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={handleCreate}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <PlusIcon className="h-5 w-5" />
        Agregar Método de Pago
      </button>

      {/* Payment Methods Grid */}
      {paymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map(method => renderPaymentMethodCard(method))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay métodos de pago configurados
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer método de pago para empezar a recibir pagos
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Crear Primer Método
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PaymentMethodModal
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
          isEditing={!!editingMethod}
        />
      )}

      {/* Modal de Upgrade */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Métodos de Pago Personalizados"
      />

      {/* Setup Mode Actions */}
      {isSetupMode && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => onComplete && onComplete()}
            className="text-gray-500 hover:text-gray-700"
          >
            Omitir
          </button>
          <button
            onClick={() => onComplete && onComplete()}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            disabled={paymentMethods.length === 0}
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}

// Modal Component
const PaymentMethodModal = ({ formData, setFormData, onSave, onCancel, isEditing }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBankInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [field]: value }
    }))
  }

  const showBankFields = formData.type === 'TRANSFER'
  const showPhoneField = formData.type === 'QR'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Método *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Ej: Yape, Plin, Efectivo"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pago *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia Bancaria</option>
              <option value="QR">Código QR (Yape, Plin)</option>
              <option value="ONLINE">Pago en Línea</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {/* Requiere Comprobante */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresProof"
              checked={formData.requiresProof}
              onChange={(e) => handleChange('requiresProof', e.target.checked)}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="requiresProof" className="text-sm font-medium text-gray-700">
              Requiere comprobante de pago
            </label>
          </div>

          {/* Bank Info - Transferencia */}
          {showBankFields && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900">Información Bancaria</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco *
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.bankName}
                    onChange={(e) => handleBankInfoChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="BCP, Interbank, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={formData.bankInfo.accountType}
                    onChange={(e) => handleBankInfoChange('accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                    <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.accountNumber}
                    onChange={(e) => handleBankInfoChange('accountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CCI
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.cci}
                    onChange={(e) => handleBankInfoChange('cci', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="00212300123456789012"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.holderName}
                  onChange={(e) => handleBankInfoChange('holderName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nombre completo"
                />
              </div>
            </div>
          )}

          {/* Phone - QR */}
          {showPhoneField && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900">Información de Pago QR</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Teléfono *
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.phoneNumber}
                  onChange={(e) => handleBankInfoChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+51987654321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titular
                </label>
                <input
                  type="text"
                  value={formData.bankInfo.holderName}
                  onChange={(e) => handleBankInfoChange('holderName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nombre del titular"
                />
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Información adicional sobre este método de pago"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsSection
