import React, { useState } from 'react'
import { 
  ClipboardDocumentListIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ServicesSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [services, setServices] = useState([])
  const [isAddingService, setIsAddingService] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    category: 'GENERAL'
  })

  const serviceCategories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'HAIR', label: 'Cabello' },
    { value: 'NAILS', label: 'Uñas' },
    { value: 'FACIAL', label: 'Facial' },
    { value: 'BODY', label: 'Corporal' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewService(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddService = () => {
    if (newService.name && newService.price) {
      const service = {
        id: Date.now(),
        ...newService,
        price: parseFloat(newService.price),
        createdAt: new Date().toISOString()
      }
      
      setServices(prev => [...prev, service])
      setNewService({
        name: '',
        description: '',
        duration: 30,
        price: '',
        category: 'GENERAL'
      })
      setIsAddingService(false)
      
      if (isSetupMode && services.length === 0 && onComplete) {
        onComplete()
      }
    }
  }

  const isFormValid = newService.name && newService.price

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Servicios
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isAddingService && (
          <button
            onClick={() => setIsAddingService(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Servicio
          </button>
        )}
      </div>

      {/* Lista de servicios */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{service.duration} min</span>
                <span className="font-semibold text-green-600">
                  ${service.price.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar servicio */}
      {isAddingService && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Servicio</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Corte de cabello"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duration"
                value={newService.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="15"
                step="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={newService.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50000"
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del servicio..."
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddService}
              disabled={!isFormValid}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar Servicio
            </button>
            
            <button
              onClick={() => setIsAddingService(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {services.length === 0 && !isAddingService && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin servicios registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega los servicios que ofreces en tu negocio
          </p>
          <button
            onClick={() => setIsAddingService(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 inline mr-2" />
            Agregar Primer Servicio
          </button>
        </div>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 3 de la configuración:</strong> Define los servicios que ofreces. 
            Puedes agregar más servicios después y configurar precios especiales.
          </p>
        </div>
      )}
    </div>
  )
}

export default ServicesSection