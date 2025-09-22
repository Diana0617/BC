import React, { useState } from 'react'
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const TaxxaConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [config, setConfig] = useState({
    enabled: false,
    username: '',
    password: '',
    environment: 'PRODUCTION', // SANDBOX, PRODUCTION
    invoicePrefix: 'FV',
    currentNumber: 1,
    establishmentCode: '',
    pointOfSale: '1',
    resolutionNumber: '',
    resolutionDate: '',
    authorizedFrom: '',
    authorizedTo: '',
    technicalKey: '',
    testSetId: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTestConnection = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implementar prueba de conexión con Taxxa
      console.log('Probando conexión con Taxxa:', config)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsConnected(true)
      
    } catch (error) {
      console.error('Error probando conexión:', error)
      setIsConnected(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implementar guardado en API
      console.log('Guardando configuración Taxxa:', config)
      
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

  const isBasicConfigValid = config.username && config.password && config.establishmentCode
  const isAdvancedConfigValid = config.resolutionNumber && config.resolutionDate && 
                               config.authorizedFrom && config.authorizedTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración Taxxa (Facturación)
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
      </div>

      {/* Estado del módulo */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Módulo de Facturación Electrónica
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Este módulo requiere una cuenta activa en Taxxa para generar facturas electrónicas válidas en Colombia.
            </p>
          </div>
        </div>
      </div>

      {/* Habilitar/Deshabilitar módulo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Activar Facturación Electrónica</h3>
            <p className="text-sm text-gray-500">Habilita la generación de facturas electrónicas con Taxxa</p>
          </div>
          <input
            type="checkbox"
            name="enabled"
            checked={config.enabled}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Configuración básica */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario Taxxa *
                </label>
                <input
                  type="text"
                  name="username"
                  value={config.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="usuario@empresa.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Taxxa *
                </label>
                <input
                  type="password"
                  name="password"
                  value={config.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="*********"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiente
                </label>
                <select
                  name="environment"
                  value={config.environment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SANDBOX">Pruebas (Sandbox)</option>
                  <option value="PRODUCTION">Producción</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Establecimiento *
                </label>
                <input
                  type="text"
                  name="establishmentCode"
                  value={config.establishmentCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0001"
                />
              </div>
            </div>
            
            {/* Test de conexión */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleTestConnection}
                disabled={!isBasicConfigValid || isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Probando...' : 'Probar Conexión'}
              </button>
              
              {isConnected && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Conexión exitosa</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuración de numeración */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Numeración de Facturas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefijo
                </label>
                <input
                  type="text"
                  name="invoicePrefix"
                  value={config.invoicePrefix}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="FV"
                  maxLength="4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Actual
                </label>
                <input
                  type="number"
                  name="currentNumber"
                  value={config.currentNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punto de Venta
                </label>
                <input
                  type="text"
                  name="pointOfSale"
                  value={config.pointOfSale}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">
                <strong>Próxima factura:</strong> {config.invoicePrefix}{config.currentNumber.toString().padStart(6, '0')}
              </p>
            </div>
          </div>

          {/* Resolución DIAN */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resolución DIAN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Resolución *
                </label>
                <input
                  type="text"
                  name="resolutionNumber"
                  value={config.resolutionNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="18764011001234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Resolución *
                </label>
                <input
                  type="date"
                  name="resolutionDate"
                  value={config.resolutionDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autorizado Desde *
                </label>
                <input
                  type="number"
                  name="authorizedFrom"
                  value={config.authorizedFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autorizado Hasta *
                </label>
                <input
                  type="number"
                  name="authorizedTo"
                  value={config.authorizedTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={!isBasicConfigValid || !isAdvancedConfigValid || isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Configuración de Facturación:</strong> Este módulo te permite generar facturas electrónicas válidas en Colombia. 
            Necesitas una cuenta activa en Taxxa y la resolución de facturación electrónica de la DIAN.
          </p>
        </div>
      )}
    </div>
  )
}

export default TaxxaConfigSection