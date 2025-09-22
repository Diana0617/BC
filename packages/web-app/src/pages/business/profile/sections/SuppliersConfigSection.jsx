import React, { useState } from 'react'
import { 
  UserCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const SuppliersConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [config, setConfig] = useState({
    enabled: false,
    autoApprovalLimit: 0,
    requirePurchaseOrders: true,
    defaultPaymentTerms: 30
  })
  
  const [suppliers, setSuppliers] = useState([])
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 30,
    category: 'GENERAL',
    isActive: true
  })
  const [isSaving, setIsSaving] = useState(false)

  const supplierCategories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'BEAUTY_PRODUCTS', label: 'Productos de Belleza' },
    { value: 'EQUIPMENT', label: 'Equipos y Herramientas' },
    { value: 'CLEANING', label: 'Productos de Limpieza' },
    { value: 'OFFICE', label: 'Oficina y Administración' }
  ]

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSupplierChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewSupplier(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.email) {
      const supplier = {
        id: Date.now(),
        ...newSupplier,
        createdAt: new Date().toISOString()
      }
      
      setSuppliers(prev => [...prev, supplier])
      resetSupplierForm()
      
      if (isSetupMode && suppliers.length === 0 && onComplete) {
        onComplete()
      }
    }
  }

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setNewSupplier(supplier)
    setIsAddingSupplier(true)
  }

  const handleUpdateSupplier = () => {
    setSuppliers(prev => prev.map(s => 
      s.id === editingSupplier.id ? { ...newSupplier, id: s.id } : s
    ))
    resetSupplierForm()
  }

  const handleDeleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }

  const resetSupplierForm = () => {
    setNewSupplier({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 30,
      category: 'GENERAL',
      isActive: true
    })
    setIsAddingSupplier(false)
    setEditingSupplier(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implementar guardado en API
      console.log('Guardando configuración de proveedores:', { config, suppliers })
      
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

  const isFormValid = newSupplier.name && newSupplier.email

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración de Proveedores
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
            <h3 className="text-lg font-medium text-gray-900">Activar Gestión de Proveedores</h3>
            <p className="text-sm text-gray-500">Gestiona proveedores y órdenes de compra</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuraciones de Compras</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Auto-aprobación
                </label>
                <input
                  type="number"
                  name="autoApprovalLimit"
                  value={config.autoApprovalLimit}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Compras hasta este monto se aprueban automáticamente (0 = sin límite)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Términos de Pago por Defecto (días)
                </label>
                <input
                  type="number"
                  name="defaultPaymentTerms"
                  value={config.defaultPaymentTerms}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="365"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requirePurchaseOrders"
                  checked={config.requirePurchaseOrders}
                  onChange={handleConfigChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Requerir Órdenes de Compra</h4>
                  <p className="text-sm text-gray-500">Todas las compras deben tener una orden previa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de proveedores */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Proveedores</h3>
              
              {!isAddingSupplier && (
                <button
                  onClick={() => setIsAddingSupplier(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Proveedor
                </button>
              )}
            </div>
            
            {/* Lista de proveedores */}
            {suppliers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                        <p className="text-sm text-gray-500">
                          {supplierCategories.find(cat => cat.value === supplier.category)?.label}
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {supplier.contactName && (
                        <p><strong>Contacto:</strong> {supplier.contactName}</p>
                      )}
                      <p><strong>Email:</strong> {supplier.email}</p>
                      {supplier.phone && (
                        <p><strong>Teléfono:</strong> {supplier.phone}</p>
                      )}
                      <p><strong>Pago:</strong> {supplier.paymentTerms} días</p>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Formulario para agregar/editar proveedor */}
            {isAddingSupplier && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newSupplier.name}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Distribuidora XYZ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Persona de Contacto
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={newSupplier.contactName}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newSupplier.email}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contacto@proveedor.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newSupplier.phone}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      name="category"
                      value={newSupplier.category}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {supplierCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Términos de Pago (días)
                    </label>
                    <input
                      type="number"
                      name="paymentTerms"
                      value={newSupplier.paymentTerms}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={newSupplier.address}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dirección completa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIT/RUT
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={newSupplier.taxId}
                      onChange={handleSupplierChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456789-0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={newSupplier.isActive}
                      onChange={handleSupplierChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Proveedor activo
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
                    disabled={!isFormValid}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingSupplier ? 'Actualizar' : 'Agregar'} Proveedor
                  </button>
                  
                  <button
                    onClick={resetSupplierForm}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            
            {/* Estado vacío */}
            {suppliers.length === 0 && !isAddingSupplier && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Sin proveedores registrados
                </h4>
                <p className="text-gray-500 mb-4">
                  Agrega proveedores para gestionar compras
                </p>
                <button
                  onClick={() => setIsAddingSupplier(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Agregar Primer Proveedor
                </button>
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
            <strong>Configuración de Proveedores:</strong> Este módulo te permite gestionar proveedores y órdenes de compra. 
            Puedes configurar límites de auto-aprobación y términos de pago por defecto.
          </p>
        </div>
      )}
    </div>
  )
}

export default SuppliersConfigSection