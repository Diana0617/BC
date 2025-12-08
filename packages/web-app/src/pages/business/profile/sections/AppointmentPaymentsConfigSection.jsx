import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

import {
  fetchWompiConfig,
  saveWompiConfig,
  verifyWompiCredentials,
  toggleWompiMode,
  toggleWompiStatus,
  clearError,
  selectWompiConfig,
  selectWompiLoading,
  selectWompiSaving,
  selectWompiVerifying,
  selectWompiError,
  selectWompiVerificationResult,
  selectWompiIsTestMode,
  selectWompiIsActive,
  selectWompiHasProdCredentials
} from '@shared/store/slices/businessWompiPaymentSlice'

import BusinessWompiSetupGuide from './wompi/BusinessWompiSetupGuide'
import BusinessWompiStatusCard from './wompi/BusinessWompiStatusCard'
import BusinessWompiModeToggle from './wompi/BusinessWompiModeToggle'
import BusinessWompiCredentialsForm from './wompi/BusinessWompiCredentialsForm'

const AppointmentPaymentsConfigSection = ({ isSetupMode, onComplete }) => {
  const dispatch = useDispatch()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const config = useSelector(selectWompiConfig)
  const loading = useSelector(selectWompiLoading)
  const saving = useSelector(selectWompiSaving)
  const verifying = useSelector(selectWompiVerifying)
  const error = useSelector(selectWompiError)
  const verificationResult = useSelector(selectWompiVerificationResult)
  const isTestMode = useSelector(selectWompiIsTestMode)
  const isActive = useSelector(selectWompiIsActive)
  const hasProdCredentials = useSelector(selectWompiHasProdCredentials)

  const business = useSelector(state => state.business?.currentBusiness)
  const businessId = business?.id

  useEffect(() => {
    if (businessId) {
      dispatch(fetchWompiConfig(businessId))
    }
  }, [dispatch, businessId])

  useEffect(() => {
    if (verificationResult && verificationResult.success) {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [verificationResult])

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true)
      setTimeout(() => {
        setShowErrorMessage(false)
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleSaveCredentials = async (formData) => {
    if (!businessId) return

    const result = await dispatch(saveWompiConfig({
      businessId,
      configData: formData
    }))

    if (saveWompiConfig.fulfilled.match(result)) {
      dispatch(fetchWompiConfig(businessId))
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }

  const handleVerifyCredentials = async () => {
    if (!businessId) return

    const result = await dispatch(verifyWompiCredentials(businessId))
    
    if (verifyWompiCredentials.fulfilled.match(result)) {
      dispatch(fetchWompiConfig(businessId))
    }
  }

  const handleToggleMode = async (newIsTestMode) => {
    if (!businessId) return

    const result = await dispatch(toggleWompiMode({
      businessId,
      isTestMode: newIsTestMode
    }))

    if (toggleWompiMode.fulfilled.match(result)) {
      dispatch(fetchWompiConfig(businessId))
    }
  }

  const handleToggleStatus = async (newIsActive) => {
    if (!businessId) return

    const result = await dispatch(toggleWompiStatus({
      businessId,
      isActive: newIsActive
    }))

    if (toggleWompiStatus.fulfilled.match(result)) {
      dispatch(fetchWompiConfig(businessId))
      
      if (isSetupMode && newIsActive && onComplete) {
        onComplete()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración de pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <CreditCardIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pagos de Turnos Online
          </h2>
        </div>
        <p className="text-gray-600">
          Configura Wompi para recibir pagos de tus clientes cuando reserven turnos online
        </p>
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-900">
              {verificationResult?.verified 
                ? '¡Credenciales verificadas exitosamente!' 
                : '¡Configuración guardada!'}
            </h3>
            <p className="text-sm text-green-700 mt-1">
              {verificationResult?.verified 
                ? 'Tu conexión con Wompi está funcionando correctamente' 
                : 'Tus credenciales han sido guardadas de forma segura'}
            </p>
          </div>
        </div>
      )}

      {showErrorMessage && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">
              Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      <BusinessWompiSetupGuide />

      <BusinessWompiStatusCard config={config} />

      {config && config.exists && (
        <BusinessWompiModeToggle
          isTestMode={isTestMode}
          hasProdCredentials={hasProdCredentials}
          onToggle={handleToggleMode}
          disabled={saving || verifying}
        />
      )}

      <BusinessWompiCredentialsForm
        config={config}
        onSave={handleSaveCredentials}
        onVerify={handleVerifyCredentials}
        saving={saving}
        verifying={verifying}
      />

      {config && config.exists && config.verificationStatus === 'verified' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Estado de la Configuración
              </h3>
              <p className="text-sm text-gray-600">
                {isActive 
                  ? 'Tu configuración está activa y lista para recibir pagos' 
                  : 'Activa tu configuración para empezar a recibir pagos'}
              </p>
            </div>
            <button
              onClick={() => handleToggleStatus(!isActive)}
              disabled={saving}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                ${isActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'}
                ${saving ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {saving ? 'Procesando...' : (isActive ? 'Desactivar' : 'Activar')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentPaymentsConfigSection
