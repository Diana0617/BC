import React, { useState } from 'react'
import {
  CreditCardIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const AppointmentPaymentsConfigSection = ({ isSetupMode, onComplete }) => {
  const [config, setConfig] = useState({
    wompiPublicKey: '',
    wompiPrivateKey: '',
    requirePaymentForBooking: false,
    paymentPercentage: 100,
    allowInstallments: false,
    maxInstallments: 1,
    enableTestMode: true,
    currency: 'COP',
    paymentMethods: {
      creditCard: true,
      debitCard: true,
      pse: false,
      nequi: false
    },
    bookingSettings: {
      allowFreeBookings: true,
      requirePaymentToConfirm: false,
      paymentDeadlineHours: 24,
      refundPolicy: 'flexible' // flexible, moderate, strict
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [testConnection, setTestConnection] = useState(null)

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePaymentMethodChange = (method, enabled) => {
    setConfig(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: enabled
      }
    }))
  }

  const handleBookingSettingChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      bookingSettings: {
        ...prev.bookingSettings,
        [field]: value
      }
    }))
  }

  const testWompiConnection = async () => {
    if (!config.wompiPublicKey || !config.wompiPrivateKey) {
      setTestConnection({ success: false, message: 'Las claves de Wompi son requeridas' })
      return
    }

    setTestConnection({ loading: true })

    try {
      // TODO: Implementar test real de conexión con Wompi
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular respuesta exitosa
      setTestConnection({
        success: true,
        message: 'Conexión exitosa con Wompi'
      })
    } catch (error) {
      setTestConnection({
        success: false,
        message: 'Error conectando con Wompi: ' + error.message
      })
    }
  }

  const handleSave = async () => {
    // Validaciones básicas
    if (!config.wompiPublicKey || !config.wompiPrivateKey) {
      alert('Las claves de Wompi son obligatorias')
      return
    }

    setIsSaving(true)

    try {
      // TODO: Implementar guardado real en API
      console.log('Guardando configuración de pagos de turnos:', config)

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (isSetupMode && onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error guardando configuración:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pagos de Turnos Online
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura los pagos en línea para reservas de turnos con Wompi
          </p>
        </div>
        {isSetupMode && (
          <div className="flex items-center text-sm text-blue-600">
            <span>Paso opcional</span>
          </div>
        )}
      </div>

      {/* Configuración de Wompi */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-blue-600" />
          Configuración de Wompi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave Pública de Wompi *
            </label>
            <input
              type="password"
              value={config.wompiPublicKey}
              onChange={(e) => handleConfigChange('wompiPublicKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="pub_..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave Privada de Wompi *
            </label>
            <input
              type="password"
              value={config.wompiPrivateKey}
              onChange={(e) => handleConfigChange('wompiPrivateKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="prv_..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={testWompiConnection}
            disabled={!config.wompiPublicKey || !config.wompiPrivateKey}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Probar Conexión
          </button>

          {testConnection && (
            <div className={`flex items-center text-sm ${
              testConnection.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {testConnection.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Probando...
                </>
              ) : testConnection.success ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {testConnection.message}
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {testConnection.message}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuración de Pagos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2 text-blue-600" />
          Configuración de Pagos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requirePaymentForBooking"
                checked={config.requirePaymentForBooking}
                onChange={(e) => handleConfigChange('requirePaymentForBooking', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requirePaymentForBooking" className="ml-2 text-sm text-gray-700">
                Requerir pago para confirmar reserva
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowInstallments"
                checked={config.allowInstallments}
                onChange={(e) => handleConfigChange('allowInstallments', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowInstallments" className="ml-2 text-sm text-gray-700">
                Permitir pagos en cuotas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableTestMode"
                checked={config.enableTestMode}
                onChange={(e) => handleConfigChange('enableTestMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableTestMode" className="ml-2 text-sm text-gray-700">
                Modo de pruebas activado
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {!config.requirePaymentForBooking && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de pago requerido (%)
                </label>
                <input
                  type="number"
                  value={config.paymentPercentage}
                  onChange={(e) => handleConfigChange('paymentPercentage', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            )}

            {config.allowInstallments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de cuotas
                </label>
                <input
                  type="number"
                  value={config.maxInstallments}
                  onChange={(e) => handleConfigChange('maxInstallments', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="36"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Métodos de Pago Disponibles
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'creditCard', label: 'Tarjeta de Crédito', icon: '💳' },
            { key: 'debitCard', label: 'Tarjeta de Débito', icon: '💳' },
            { key: 'pse', label: 'PSE', icon: '🏦' },
            { key: 'nequi', label: 'Nequi', icon: '📱' }
          ].map(method => (
            <div key={method.key} className="flex items-center">
              <input
                type="checkbox"
                id={method.key}
                checked={config.paymentMethods[method.key]}
                onChange={(e) => handlePaymentMethodChange(method.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={method.key} className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="mr-1">{method.icon}</span>
                {method.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración de Reservas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Reservas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowFreeBookings"
                checked={config.bookingSettings.allowFreeBookings}
                onChange={(e) => handleBookingSettingChange('allowFreeBookings', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowFreeBookings" className="ml-2 text-sm text-gray-700">
                Permitir reservas sin pago
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requirePaymentToConfirm"
                checked={config.bookingSettings.requirePaymentToConfirm}
                onChange={(e) => handleBookingSettingChange('requirePaymentToConfirm', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requirePaymentToConfirm" className="ml-2 text-sm text-gray-700">
                Requerir pago para confirmar turno
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plazo para pago (horas)
              </label>
              <input
                type="number"
                value={config.bookingSettings.paymentDeadlineHours}
                onChange={(e) => handleBookingSettingChange('paymentDeadlineHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Política de reembolso
              </label>
              <select
                value={config.bookingSettings.refundPolicy}
                onChange={(e) => handleBookingSettingChange('refundPolicy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="flexible">Flexible (reembolso completo)</option>
                <option value="moderate">Moderada (reembolso parcial)</option>
                <option value="strict">Estricta (sin reembolso)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AppointmentPaymentsConfigSection