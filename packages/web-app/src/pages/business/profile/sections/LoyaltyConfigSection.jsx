import React, { useState, useEffect } from 'react'
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { getBusinessAssignedRules, customizeAssignedRule } from '@shared/api/businessRuleApi'

/**
 * LoyaltyConfigSection Component
 * 
 * Configuración del programa de fidelización/loyalty
 * Permite configurar las 20 reglas del sistema de puntos y recompensas
 */
const LoyaltyConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [rules, setRules] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    points: false,
    referrals: false,
    milestones: false,
    bonuses: false,
    redemption: false
  })

  // Configuración de secciones y sus reglas
  const sections = [
    {
      id: 'general',
      title: 'Configuración General',
      description: 'Activar programa y configurar reglas básicas',
      rules: ['LOYALTY_ENABLED']
    },
    {
      id: 'points',
      title: 'Puntos por Compras',
      description: 'Configurar acumulación de puntos por transacciones',
      rules: [
        'LOYALTY_POINTS_PER_CURRENCY_UNIT',
        'LOYALTY_APPOINTMENT_POINTS_ENABLED',
        'LOYALTY_PRODUCT_POINTS_ENABLED'
      ]
    },
    {
      id: 'referrals',
      title: 'Programa de Referidos',
      description: 'Recompensar clientes que traen nuevos clientes',
      rules: [
        'LOYALTY_REFERRAL_ENABLED',
        'LOYALTY_REFERRAL_POINTS',
        'LOYALTY_REFERRAL_FIRST_VISIT_BONUS'
      ]
    },
    {
      id: 'milestones',
      title: 'Hitos y Logros',
      description: 'Premios por alcanzar metas de visitas',
      rules: [
        'LOYALTY_MILESTONE_ENABLED',
        'LOYALTY_MILESTONE_COUNT',
        'LOYALTY_MILESTONE_POINTS'
      ]
    },
    {
      id: 'bonuses',
      title: 'Bonificaciones Especiales',
      description: 'Puntos extra por cumpleaños, aniversarios y puntualidad',
      rules: [
        'LOYALTY_ON_TIME_PAYMENT_BONUS',
        'LOYALTY_BIRTHDAY_BONUS_ENABLED',
        'LOYALTY_BIRTHDAY_BONUS_POINTS',
        'LOYALTY_ANNIVERSARY_BONUS_ENABLED',
        'LOYALTY_ANNIVERSARY_BONUS_POINTS'
      ]
    },
    {
      id: 'redemption',
      title: 'Canje y Expiración',
      description: 'Reglas para canjear puntos y validez de recompensas',
      rules: [
        'LOYALTY_MIN_POINTS_TO_REDEEM',
        'LOYALTY_POINTS_EXPIRY_DAYS',
        'LOYALTY_REWARD_EXPIRY_DAYS',
        'LOYALTY_DISCOUNT_PERCENTAGE_RATE',
        'LOYALTY_POINTS_FOR_DISCOUNT'
      ]
    }
  ]

  // Metadata de las reglas con descripciones y ejemplos
  const ruleMetadata = {
    LOYALTY_ENABLED: {
      label: 'Activar Programa',
      description: 'Habilitar sistema de puntos y recompensas',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_POINTS_PER_CURRENCY_UNIT: {
      label: 'Puntos por $1000 COP',
      description: 'Cuántos puntos otorgar por cada $1000 gastados',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 100,
      step: 0.1,
      suffix: 'puntos'
    },
    LOYALTY_APPOINTMENT_POINTS_ENABLED: {
      label: 'Puntos por Citas',
      description: 'Otorgar puntos cuando se paga una cita completada',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_PRODUCT_POINTS_ENABLED: {
      label: 'Puntos por Productos',
      description: 'Otorgar puntos por compra de productos',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_REFERRAL_ENABLED: {
      label: 'Activar Referidos',
      description: 'Permitir que clientes refieran nuevos clientes',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_REFERRAL_POINTS: {
      label: 'Puntos por Referir',
      description: 'Puntos otorgados al referir un cliente nuevo',
      type: 'number',
      defaultValue: 500,
      min: 0,
      max: 10000,
      step: 50,
      suffix: 'puntos'
    },
    LOYALTY_REFERRAL_FIRST_VISIT_BONUS: {
      label: 'Bonus Primera Visita',
      description: 'Puntos extra cuando el referido completa su primera cita',
      type: 'number',
      defaultValue: 200,
      min: 0,
      max: 5000,
      step: 50,
      suffix: 'puntos'
    },
    LOYALTY_MILESTONE_ENABLED: {
      label: 'Activar Hitos',
      description: 'Premiar clientes al completar cierta cantidad de visitas',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_MILESTONE_COUNT: {
      label: 'Visitas por Hito',
      description: 'Cantidad de citas necesarias para alcanzar el hito',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100,
      step: 1,
      suffix: 'citas'
    },
    LOYALTY_MILESTONE_POINTS: {
      label: 'Puntos por Hito',
      description: 'Puntos otorgados al alcanzar el hito',
      type: 'number',
      defaultValue: 300,
      min: 0,
      max: 10000,
      step: 50,
      suffix: 'puntos'
    },
    LOYALTY_ON_TIME_PAYMENT_BONUS: {
      label: 'Bonus Pago Puntual',
      description: 'Puntos extra por pagar sin deudas pendientes',
      type: 'number',
      defaultValue: 50,
      min: 0,
      max: 1000,
      step: 10,
      suffix: 'puntos'
    },
    LOYALTY_BIRTHDAY_BONUS_ENABLED: {
      label: 'Activar Regalo Cumpleaños',
      description: 'Otorgar puntos en el cumpleaños del cliente',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_BIRTHDAY_BONUS_POINTS: {
      label: 'Puntos de Cumpleaños',
      description: 'Puntos de regalo en la fecha de cumpleaños',
      type: 'number',
      defaultValue: 500,
      min: 0,
      max: 5000,
      step: 50,
      suffix: 'puntos'
    },
    LOYALTY_ANNIVERSARY_BONUS_ENABLED: {
      label: 'Activar Regalo Aniversario',
      description: 'Otorgar puntos por cada año como cliente',
      type: 'boolean',
      defaultValue: true
    },
    LOYALTY_ANNIVERSARY_BONUS_POINTS: {
      label: 'Puntos por Aniversario',
      description: 'Puntos por cada año de antigüedad',
      type: 'number',
      defaultValue: 1000,
      min: 0,
      max: 10000,
      step: 100,
      suffix: 'puntos'
    },
    LOYALTY_MIN_POINTS_TO_REDEEM: {
      label: 'Mínimo para Canjear',
      description: 'Puntos mínimos necesarios para poder canjear recompensas',
      type: 'number',
      defaultValue: 1000,
      min: 0,
      max: 50000,
      step: 100,
      suffix: 'puntos'
    },
    LOYALTY_POINTS_EXPIRY_DAYS: {
      label: 'Expiración de Puntos',
      description: 'Días de validez de los puntos (0 = nunca expiran)',
      type: 'number',
      defaultValue: 365,
      min: 0,
      max: 3650,
      step: 30,
      suffix: 'días'
    },
    LOYALTY_REWARD_EXPIRY_DAYS: {
      label: 'Expiración de Recompensas',
      description: 'Días de validez de las recompensas canjeadas',
      type: 'number',
      defaultValue: 30,
      min: 1,
      max: 365,
      step: 5,
      suffix: 'días'
    },
    LOYALTY_DISCOUNT_PERCENTAGE_RATE: {
      label: 'Porcentaje de Descuento',
      description: 'Descuento porcentual por canjear puntos',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100,
      step: 1,
      suffix: '%'
    },
    LOYALTY_POINTS_FOR_DISCOUNT: {
      label: 'Puntos para Descuento',
      description: 'Puntos necesarios para obtener el descuento configurado',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 50000,
      step: 100,
      suffix: 'puntos'
    }
  }

  const loadRules = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getBusinessAssignedRules(false)
      
      // La respuesta viene en formato { success: true, data: [...] }
      const rulesArray = response.data?.data || response.data || []
      
      console.log('📊 Loyalty rules response:', response.data)
      console.log('📊 Rules array:', rulesArray)
      
      // Convertir array de reglas a objeto con key como índice
      const rulesMap = {}
      
      if (Array.isArray(rulesArray)) {
        rulesArray.forEach(rule => {
          if (rule.ruleKey && rule.ruleKey.startsWith('LOYALTY_')) {
            rulesMap[rule.ruleKey] = {
              value: rule.customValue !== null ? rule.customValue : rule.defaultValue,
              isActive: rule.isActive
            }
          }
        })
      }
      
      // Completar con valores por defecto si faltan reglas
      Object.keys(ruleMetadata).forEach(key => {
        if (!rulesMap[key]) {
          rulesMap[key] = {
            value: ruleMetadata[key].defaultValue,
            isActive: true
          }
        }
      })
      
      setRules(rulesMap)
    } catch (err) {
      console.error('Error loading loyalty rules:', err)
      setError('Error al cargar la configuración. Por favor recarga la página.')
    } finally {
      setLoading(false)
    }
  }

  const handleRuleChange = (ruleKey, value) => {
    setRules(prev => ({
      ...prev,
      [ruleKey]: {
        ...prev[ruleKey],
        value: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Guardar cada regla modificada
      const savePromises = Object.entries(rules).map(([key, data]) => {
        return customizeAssignedRule(key, { customValue: data.value })
      })

      await Promise.all(savePromises)

      if (isSetupMode && onComplete) {
        onComplete()
      }

      alert('Configuración guardada exitosamente')
    } catch (err) {
      console.error('Error saving loyalty configuration:', err)
      setError('Error al guardar la configuración. Por favor intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const renderRuleField = (ruleKey) => {
    const metadata = ruleMetadata[ruleKey]
    const ruleData = rules[ruleKey]
    
    if (!metadata || !ruleData) return null

    if (metadata.type === 'boolean') {
      return (
        <div key={ruleKey} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{metadata.label}</h4>
            <p className="text-xs text-gray-500 mt-1">{metadata.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={ruleData.value}
              onChange={(e) => handleRuleChange(ruleKey, e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      )
    }

    if (metadata.type === 'number') {
      return (
        <div key={ruleKey} className="py-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{metadata.label}</h4>
              <p className="text-xs text-gray-500 mt-1">{metadata.description}</p>
            </div>
            <div className="flex items-center ml-4 space-x-2">
              <input
                type="number"
                value={ruleData.value}
                onChange={(e) => handleRuleChange(ruleKey, parseFloat(e.target.value) || 0)}
                min={metadata.min}
                max={metadata.max}
                step={metadata.step}
                disabled={saving}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
              />
              {metadata.suffix && (
                <span className="text-sm text-gray-500">{metadata.suffix}</span>
              )}
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    loadRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Programa de Fidelización
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configura puntos, recompensas y bonificaciones para tus clientes
              </p>
            </div>
          </div>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-2">Sistema completo de fidelización</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Acumula puntos automáticamente por pagos de citas y productos</li>
              <li>Programa de referidos con bonificaciones</li>
              <li>Premios por hitos y fechas especiales (cumpleaños, aniversarios)</li>
              <li>Canje flexible de puntos por descuentos</li>
              <li>Tarjetas digitales personalizadas para cada cliente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="space-y-4">
        {sections.map(section => {
          const isExpanded = expandedSections[section.id]
          const Icon = isExpanded ? ChevronUpIcon : ChevronDownIcon
          
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="mt-4 space-y-0">
                    {section.rules.map(ruleKey => renderRuleField(ruleKey))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Los cambios se aplicarán inmediatamente a todos los clientes
        </p>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            'Guardar Configuración'
          )}
        </button>
      </div>
    </div>
  )
}

export default LoyaltyConfigSection
