/**
 * BusinessWompiCredentialsForm.jsx
 * 
 * Formulario para ingresar y editar credenciales de Wompi
 * Maneja credenciales de TEST y PRODUCCIÓN por separado
 */

import React, { useState, useEffect } from 'react'
import {
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const BusinessWompiCredentialsForm = ({
  config,
  onSave,
  onVerify,
  saving,
  verifying
}) => {
  const [showTestPrivate, setShowTestPrivate] = useState(false)
  const [showTestSecret, setShowTestSecret] = useState(false)
  const [showProdPrivate, setShowProdPrivate] = useState(false)
  const [showProdSecret, setShowProdSecret] = useState(false)

  const [formData, setFormData] = useState({
    testPublicKey: '',
    testPrivateKey: '',
    testIntegritySecret: '',
    prodPublicKey: '',
    prodPrivateKey: '',
    prodIntegritySecret: ''
  })

  // Cargar datos existentes si hay
  useEffect(() => {
    if (config && config.exists) {
      setFormData({
        testPublicKey: config.testPublicKey || '',
        testPrivateKey: '', // No prellenamos las privadas por seguridad
        testIntegritySecret: '',
        prodPublicKey: config.prodPublicKey || '',
        prodPrivateKey: '',
        prodIntegritySecret: ''
      })
    }
  }, [config])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleVerify = () => {
    onVerify()
  }

  const hasTestCredentials = formData.testPublicKey && formData.testPrivateKey && formData.testIntegritySecret
  const hasProdCredentials = formData.prodPublicKey && formData.prodPrivateKey && formData.prodIntegritySecret
  const hasAnyCredentials = hasTestCredentials || hasProdCredentials

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Credenciales de PRUEBA */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <KeyIcon className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Credenciales de Prueba
          </h3>
          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
            Obligatorio
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Usa estas credenciales para probar tu integración sin realizar pagos reales
        </p>

        <div className="space-y-4">
          {/* Public Key TEST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Llave Pública (Test) *
            </label>
            <input
              type="text"
              value={formData.testPublicKey}
              onChange={(e) => handleChange('testPublicKey', e.target.value)}
              placeholder="pub_test_xxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Comienza con "pub_test_"
            </p>
          </div>

          {/* Private Key TEST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Llave Privada (Test) *
            </label>
            <div className="relative">
              <input
                type={showTestPrivate ? 'text' : 'password'}
                value={formData.testPrivateKey}
                onChange={(e) => handleChange('testPrivateKey', e.target.value)}
                placeholder="prv_test_xxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowTestPrivate(!showTestPrivate)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showTestPrivate ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Comienza con "prv_test_"
            </p>
          </div>

          {/* Integrity Secret TEST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret de Integridad (Test) *
            </label>
            <div className="relative">
              <input
                type={showTestSecret ? 'text' : 'password'}
                value={formData.testIntegritySecret}
                onChange={(e) => handleChange('testIntegritySecret', e.target.value)}
                placeholder="test_integrity_xxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowTestSecret(!showTestSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showTestSecret ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usado para validar webhooks de Wompi
            </p>
          </div>
        </div>
      </div>

      {/* Credenciales de PRODUCCIÓN */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Credenciales de Producción
          </h3>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
            Opcional
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Configura estas credenciales cuando estés listo para recibir pagos reales
        </p>

        <div className="space-y-4">
          {/* Public Key PROD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Llave Pública (Producción)
            </label>
            <input
              type="text"
              value={formData.prodPublicKey}
              onChange={(e) => handleChange('prodPublicKey', e.target.value)}
              placeholder="pub_prod_xxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comienza con "pub_prod_"
            </p>
          </div>

          {/* Private Key PROD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Llave Privada (Producción)
            </label>
            <div className="relative">
              <input
                type={showProdPrivate ? 'text' : 'password'}
                value={formData.prodPrivateKey}
                onChange={(e) => handleChange('prodPrivateKey', e.target.value)}
                placeholder="prv_prod_xxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowProdPrivate(!showProdPrivate)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showProdPrivate ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Comienza con "prv_prod_"
            </p>
          </div>

          {/* Integrity Secret PROD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret de Integridad (Producción)
            </label>
            <div className="relative">
              <input
                type={showProdSecret ? 'text' : 'password'}
                value={formData.prodIntegritySecret}
                onChange={(e) => handleChange('prodIntegritySecret', e.target.value)}
                placeholder="prod_integrity_xxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowProdSecret(!showProdSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showProdSecret ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usado para validar webhooks de Wompi
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-3">
        {config && config.exists && config.verificationStatus !== 'verified' && (
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || !hasAnyCredentials}
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Verificando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Verificar Credenciales
              </>
            )}
          </button>
        )}

        <button
          type="submit"
          disabled={saving || !hasTestCredentials}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <KeyIcon className="h-5 w-5 mr-2" />
              Guardar Credenciales
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BusinessWompiCredentialsForm
