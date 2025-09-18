import React, { useState, useEffect } from 'react'
import { X, Save, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useRuleTemplates from '../../../../../../shared/src/hooks/useRuleTemplates'
import { useOwnerPlans } from '../../../../../../shared/src/hooks/useOwnerPlans'

const CreateTemplateModal = ({ isOpen, onClose }) => {
  const { createTemplate, loading } = useRuleTemplates()
  const { 
    plans: ownerPlans, 
    loading: plansLoading, 
    actions: plansActions 
  } = useOwnerPlans()

  // ================================
  // STATE
  // ================================
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    ruleKey: '',
    ruleValue: {
      enabled: true,
      description: ''
    },
    businessTypes: [],
    planTypes: [],
    isActive: true
  })

  const [errors, setErrors] = useState({})

  // ================================
  // EFFECTS
  // ================================
  
  // Load plans when modal opens
  useEffect(() => {
    if (isOpen && (!ownerPlans || ownerPlans.length === 0)) {
      plansActions.fetchPlans({ isActive: true, limit: 100 })
    }
  }, [isOpen, ownerPlans, plansActions])

  // ================================
  // CONSTANTS
  // ================================
  
  const categories = [
    { value: 'PAYMENT_POLICY', label: 'Política de Pago' },
    { value: 'CANCELLATION_POLICY', label: 'Política de Cancelación' },
    { value: 'BOOKING_POLICY', label: 'Política de Reservas' },
    { value: 'SERVICE_POLICY', label: 'Política de Servicios' },
    { value: 'SCHEDULING_POLICY', label: 'Política de Horarios' },
    { value: 'CUSTOMER_POLICY', label: 'Política de Clientes' },
    { value: 'PROMOTIONAL_POLICY', label: 'Política Promocional' },
    { value: 'OPERATIONAL_POLICY', label: 'Política Operacional' }
  ]

  const businessTypes = [
    { value: 'BEAUTY_SALON', label: 'Salón de Belleza' },
    { value: 'BARBERSHOP', label: 'Barbería' },
    { value: 'SPA', label: 'Spa' },
    { value: 'NAIL_SALON', label: 'Salón de Uñas' },
    { value: 'MEDICAL_SPA', label: 'Spa Médico' },
    { value: 'FITNESS_CENTER', label: 'Centro de Fitness' },
    { value: 'MASSAGE_CENTER', label: 'Centro de Masajes' },
    { value: 'AESTHETICS_CENTER', label: 'Centro de Estética' }
  ]

  // Dynamic plan types from backend - use plan names directly as types
  const planTypes = ownerPlans?.map(plan => ({
    value: plan.name, // Use plan name directly as the type value
    label: plan.name,
    price: plan.price,
    currency: plan.currency,
    planId: plan.id // Keep original ID for reference
  })) || []

  // ================================
  // HANDLERS
  // ================================
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleRuleValueChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      ruleValue: {
        ...prev.ruleValue,
        [field]: value
      }
    }))
  }

  const handleMultiSelectChange = (field, value) => {
    const currentValues = formData[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    setFormData(prev => ({ ...prev, [field]: newValues }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (!formData.ruleKey.trim()) {
      newErrors.ruleKey = 'La clave de regla es requerida'
    }

    if (formData.businessTypes.length === 0) {
      newErrors.businessTypes = 'Selecciona al menos un tipo de negocio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const success = await createTemplate(formData)
    if (success) {
      toast.success('Plantilla creada exitosamente')
      handleClose()
    } else {
      toast.error('Error al crear plantilla')
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      ruleKey: '',
      ruleValue: {
        enabled: true,
        description: ''
      },
      businessTypes: [],
      planTypes: [],
      isActive: true
    })
    setErrors({})
    onClose()
  }

  // ================================
  // RENDER
  // ================================
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Crear Nueva Plantilla de Regla
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Política de cancelación 24h"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de la Plantilla *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Explica qué hace esta plantilla de regla y cuándo aplicarla
              </p>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe el propósito y funcionamiento de esta regla"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Rule Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave de Regla *
              </label>
              <input
                type="text"
                value={formData.ruleKey}
                onChange={(e) => handleInputChange('ruleKey', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono ${
                  errors.ruleKey ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: CANCELLATION_24H_POLICY"
              />
              {errors.ruleKey && (
                <p className="mt-1 text-sm text-red-600">{errors.ruleKey}</p>
              )}
            </div>

            {/* Rule Definition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuración de la Regla
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Detalles técnicos de cómo funcionará esta regla cuando sea aplicada
              </p>
              <textarea
                value={formData.ruleValue.description}
                onChange={(e) => handleRuleValueChange('description', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe cómo funciona esta regla en detalle (ej: permitir cancelaciones hasta 2 horas antes)"
              />
            </div>

            {/* Business Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de Negocio *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {businessTypes.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.businessTypes.includes(type.value)}
                      onChange={() => handleMultiSelectChange('businessTypes', type.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.businessTypes && (
                <p className="mt-1 text-sm text-red-600">{errors.businessTypes}</p>
              )}
            </div>

            {/* Plan Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de Plan (Opcional)
              </label>
              
              {plansLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  <span className="ml-2 text-sm text-gray-500">Cargando planes...</span>
                </div>
              ) : planTypes.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">
                  No hay planes disponibles
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                  {planTypes.map((plan) => (
                    <label key={plan.value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.planTypes.includes(plan.value)}
                        onChange={() => handleMultiSelectChange('planTypes', plan.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={plan.label}>
                          {plan.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {plan.price > 0 ? `$${Number(plan.price).toLocaleString()} ${plan.currency}` : 'Gratuito'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Plantilla activa
              </label>
            </div>

            {/* Preview Section */}
            {(formData.name || formData.description) && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {formData.name && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre:</span>
                      <p className="text-sm text-gray-900 font-medium">{formData.name}</p>
                    </div>
                  )}
                  
                  {formData.category && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría:</span>
                      <p className="text-sm text-gray-700">
                        {categories.find(cat => cat.value === formData.category)?.label}
                      </p>
                    </div>
                  )}
                  
                  {formData.description && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción:</span>
                      <p className="text-sm text-gray-700">{formData.description}</p>
                    </div>
                  )}
                  
                  {formData.ruleKey && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clave:</span>
                      <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded border">
                        {formData.ruleKey}
                      </p>
                    </div>
                  )}
                  
                  {formData.businessTypes.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipos de Negocio:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.businessTypes.map(type => {
                          const businessType = businessTypes.find(bt => bt.value === type)
                          return (
                            <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {businessType?.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {formData.planTypes.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Planes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.planTypes.map(planName => (
                          <span key={planName} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {planName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading.create}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.create ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Plantilla
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTemplateModal