import React, { useState } from 'react'
import { 
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const InventoryConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [config, setConfig] = useState({
    enabled: false,
    autoDeduct: true,
    lowStockAlert: true,
    lowStockThreshold: 10,
    trackExpiration: false,
    defaultUnit: 'UNIT'
  })
  
  const [categories, setCategories] = useState([
    { id: 1, name: 'Productos de Cabello', description: 'Shampoos, acondicionadores, etc.' },
    { id: 2, name: 'Herramientas', description: 'Tijeras, peines, etc.' }
  ])
  
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [isSaving, setIsSaving] = useState(false)

  const unitTypes = [
    { value: 'UNIT', label: 'Unidad' },
    { value: 'LITER', label: 'Litro' },
    { value: 'MILLILITER', label: 'Mililitro' },
    { value: 'GRAM', label: 'Gramo' },
    { value: 'KILOGRAM', label: 'Kilogramo' },
    { value: 'PACKAGE', label: 'Paquete' }
  ]

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddCategory = () => {
    if (newCategory.name) {
      const category = {
        id: Date.now(),
        ...newCategory
      }
      
      setCategories(prev => [...prev, category])
      setNewCategory({ name: '', description: '' })
      setIsAddingCategory(false)
    }
  }

  const handleDeleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implementar guardado en API
      console.log('Guardando configuración de inventario:', { config, categories })
      
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
        <div className="flex items-center">
          <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración de Inventario
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
      </div>

      {/* Habilitar/Deshabilitar módulo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Activar Gestión de Inventario</h3>
            <p className="text-sm text-gray-500">Controla el stock de productos y herramientas</p>
          </div>
          <input
            type="checkbox"
            name="enabled"
            checked={config.enabled}
            onChange={handleConfigChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Configuraciones generales */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuraciones Generales</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Descuento Automático</h4>
                  <p className="text-sm text-gray-500">Descontar productos automáticamente cuando se usen en servicios</p>
                </div>
                <input
                  type="checkbox"
                  name="autoDeduct"
                  checked={config.autoDeduct}
                  onChange={handleConfigChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alertas de Stock Bajo</h4>
                  <p className="text-sm text-gray-500">Recibir notificaciones cuando el stock esté bajo</p>
                </div>
                <input
                  type="checkbox"
                  name="lowStockAlert"
                  checked={config.lowStockAlert}
                  onChange={handleConfigChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              {config.lowStockAlert && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umbral de Stock Bajo
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={config.lowStockThreshold}
                    onChange={handleConfigChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <span className="ml-2 text-sm text-gray-500">unidades</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Control de Vencimientos</h4>
                  <p className="text-sm text-gray-500">Rastrear fechas de vencimiento de productos</p>
                </div>
                <input
                  type="checkbox"
                  name="trackExpiration"
                  checked={config.trackExpiration}
                  onChange={handleConfigChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad por Defecto
                </label>
                <select
                  name="defaultUnit"
                  value={config.defaultUnit}
                  onChange={handleConfigChange}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {unitTypes.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Categorías de productos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Categorías de Productos</h3>
              
              {!isAddingCategory && (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Agregar
                </button>
              )}
            </div>
            
            {/* Lista de categorías */}
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            
            {/* Formulario nueva categoría */}
            {isAddingCategory && (
              <div className="mt-4 p-4 border border-gray-200 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Categoría *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newCategory.name}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Productos de Cabello"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={newCategory.description}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción de la categoría"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.name}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Agregar
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsAddingCategory(false)
                      setNewCategory({ name: '', description: '' })
                    }}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
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
            <strong>Configuración de Inventario:</strong> Este módulo te permite controlar el stock de productos y herramientas. 
            Puedes configurar alertas automáticas y descuentos cuando uses productos en servicios.
          </p>
        </div>
      )}
    </div>
  )
}

export default InventoryConfigSection