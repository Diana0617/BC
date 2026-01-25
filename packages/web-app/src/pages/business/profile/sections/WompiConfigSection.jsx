/**
 * WompiConfigSection.jsx
 * 
 * Sección de configuración de Wompi para recibir pagos en línea
 * Solo visible si el negocio tiene el módulo wompi_integration
 */

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CreditCardIcon } from '@heroicons/react/24/outline'
import BusinessWompiStatusCard from './wompi/BusinessWompiStatusCard'
import BusinessWompiSetupGuide from './wompi/BusinessWompiSetupGuide'
import BusinessWompiCredentialsForm from './wompi/BusinessWompiCredentialsForm'
import BusinessWompiModeToggle from './wompi/BusinessWompiModeToggle'
import { businessWompiPaymentApi } from '@shared/api'
import toast from 'react-hot-toast'

const WompiConfigSection = ({ isSetupMode, onComplete }) => {
  const { user } = useSelector(state => state.auth)
  const currentBusiness = useSelector(state => state.business?.currentBusiness)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    loadWompiConfig()
  }, [])

  const loadWompiConfig = async () => {
    try {
      setLoading(true)
      const response = await businessWompiPaymentApi.getWompiConfig(user.businessId)
      
      if (response.success) {
        setConfig(response.data || { exists: false })
      }
    } catch (error) {
      console.error('Error loading Wompi config:', error)
      setConfig({ exists: false })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCredentials = async (credentials) => {
    try {
      setSaving(true)
      
      const response = await businessWompiPaymentApi.saveWompiConfig(
        user.businessId,
        credentials
      )

      if (response.success) {
        toast.success('Credenciales guardadas correctamente')
        await loadWompiConfig()
      } else {
        toast.error(response.error || 'Error al guardar credenciales')
      }
    } catch (error) {
      console.error('Error saving credentials:', error)
      toast.error(error.message || 'Error al guardar credenciales')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyCredentials = async () => {
    try {
      setVerifying(true)
      
      const response = await businessWompiPaymentApi.verifyWompiCredentials(user.businessId)

      if (response.success && response.data?.verified) {
        toast.success('¡Credenciales verificadas correctamente!')
        await loadWompiConfig()
      } else {
        toast.error(response.data?.error || 'No se pudieron verificar las credenciales')
      }
    } catch (error) {
      console.error('Error verifying credentials:', error)
      toast.error(error.message || 'Error al verificar credenciales')
    } finally {
      setVerifying(false)
    }
  }

  const handleToggleMode = async (isTestMode) => {
    try {
      const response = await businessWompiPaymentApi.toggleWompiMode(user.businessId, isTestMode)

      if (response.success) {
        toast.success(`Modo ${isTestMode ? 'prueba' : 'producción'} activado`)
        await loadWompiConfig()
      } else {
        toast.error('Error al cambiar el modo')
      }
    } catch (error) {
      console.error('Error toggling mode:', error)
      toast.error('Error al cambiar el modo')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CreditCardIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Pagos en Línea con Wompi
            </h2>
          </div>
          <p className="text-gray-600">
            Configura tu cuenta de Wompi para recibir pagos con tarjeta, PSE, Nequi y más métodos de pago en línea.
          </p>
        </div>
      </div>

      {/* Status Card */}
      <BusinessWompiStatusCard config={config} />

      {/* Mode Toggle (solo si ya tiene configuración) */}
      {config && config.exists && config.verificationStatus === 'verified' && (
        <BusinessWompiModeToggle
          isTestMode={config.isTestMode}
          hasProdCredentials={!!(config.prodPublicKey && config.prodPublicKey.length > 0)}
          onToggle={handleToggleMode}
          disabled={false}
        />
      )}

      {/* Setup Guide - siempre visible para ayudar */}
      <BusinessWompiSetupGuide />

      {/* Credentials Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <BusinessWompiCredentialsForm
          config={config}
          onSave={handleSaveCredentials}
          onVerify={handleVerifyCredentials}
          saving={saving}
          verifying={verifying}
        />
      </div>

      {/* Setup Mode Actions */}
      {isSetupMode && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => onComplete && onComplete()}
            className="text-gray-500 hover:text-gray-700"
          >
            Omitir por ahora
          </button>
          <button
            onClick={() => onComplete && onComplete()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={!config || !config.exists}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">💡 ¿Por qué usar Wompi?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold mt-0.5">✓</span>
            <span><strong>Múltiples métodos de pago:</strong> Tarjetas de crédito/débito, PSE, Nequi, Bancolombia, etc.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold mt-0.5">✓</span>
            <span><strong>Seguridad PCI DSS:</strong> Wompi maneja toda la información sensible de forma segura</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold mt-0.5">✓</span>
            <span><strong>Pagos recurrentes:</strong> Cobra suscripciones y pagos automáticos a tus clientes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold mt-0.5">✓</span>
            <span><strong>Comisiones competitivas:</strong> Wompi cobra comisiones por transacción solo cuando recibes pagos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default WompiConfigSection
