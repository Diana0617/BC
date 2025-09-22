import React, { useState } from 'react'
import { 
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const SpecialistsSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [specialists, setSpecialists] = useState([])
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false)
  const [editingSpecialist, setEditingSpecialist] = useState(null)
  const [newSpecialist, setNewSpecialist] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialties: '',
    schedule: 'FULL_TIME'
  })

  const scheduleOptions = [
    { value: 'FULL_TIME', label: 'Tiempo Completo' },
    { value: 'PART_TIME', label: 'Medio Tiempo' },
    { value: 'ON_DEMAND', label: 'Por Demanda' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewSpecialist(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddSpecialist = () => {
    if (newSpecialist.firstName && newSpecialist.lastName) {
      const specialist = {
        id: Date.now(),
        ...newSpecialist,
        createdAt: new Date().toISOString()
      }
      
      setSpecialists(prev => [...prev, specialist])
      setNewSpecialist({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialties: '',
        schedule: 'FULL_TIME'
      })
      setIsAddingSpecialist(false)
      
      // Si estamos en modo setup y es el primer especialista, completar paso
      if (isSetupMode && specialists.length === 0 && onComplete) {
        onComplete()
      }
    }
  }

  const handleEditSpecialist = (specialist) => {
    setEditingSpecialist(specialist)
    setNewSpecialist(specialist)
    setIsAddingSpecialist(true)
  }

  const handleUpdateSpecialist = () => {
    setSpecialists(prev => prev.map(s => 
      s.id === editingSpecialist.id ? { ...newSpecialist, id: s.id } : s
    ))
    setEditingSpecialist(null)
    setNewSpecialist({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialties: '',
      schedule: 'FULL_TIME'
    })
    setIsAddingSpecialist(false)
  }

  const handleDeleteSpecialist = (id) => {
    setSpecialists(prev => prev.filter(s => s.id !== id))
  }

  const handleCancel = () => {
    setIsAddingSpecialist(false)
    setEditingSpecialist(null)
    setNewSpecialist({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialties: '',
      schedule: 'FULL_TIME'
    })
  }

  const isFormValid = newSpecialist.firstName && newSpecialist.lastName

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Especialistas
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isAddingSpecialist && (
          <button
            onClick={() => setIsAddingSpecialist(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Especialista
          </button>
        )}
      </div>

      {/* Lista de especialistas */}
      {specialists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialists.map((specialist) => (
            <div key={specialist.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {specialist.firstName} {specialist.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scheduleOptions.find(opt => opt.value === specialist.schedule)?.label}
                  </p>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditSpecialist(specialist)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSpecialist(specialist.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {specialist.specialties && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Especialidades:</strong> {specialist.specialties}
                </p>
              )}
              
              {specialist.email && (
                <p className="text-xs text-gray-500">{specialist.email}</p>
              )}
              
              {specialist.phone && (
                <p className="text-xs text-gray-500">{specialist.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar/editar especialista */}
      {isAddingSpecialist && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSpecialist ? 'Editar Especialista' : 'Nuevo Especialista'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="firstName"
                value={newSpecialist.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="lastName"
                value={newSpecialist.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apellido"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={newSpecialist.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@ejemplo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={newSpecialist.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+57 300 123 4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario
              </label>
              <select
                name="schedule"
                value={newSpecialist.schedule}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {scheduleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidades
              </label>
              <input
                type="text"
                name="specialties"
                value={newSpecialist.specialties}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Corte, Peinado, Coloración"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingSpecialist ? handleUpdateSpecialist : handleAddSpecialist}
              disabled={!isFormValid}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingSpecialist ? 'Actualizar' : 'Agregar'} Especialista
            </button>
            
            <button
              onClick={handleCancel}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {specialists.length === 0 && !isAddingSpecialist && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin especialistas registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega a tu equipo de trabajo para comenzar a programar citas
          </p>
          <button
            onClick={() => setIsAddingSpecialist(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 inline mr-2" />
            Agregar Primer Especialista
          </button>
        </div>
      )}

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 2 de la configuración:</strong> Agrega a tu equipo de trabajo. 
            Puedes agregar más especialistas después y configurar sus horarios individuales.
          </p>
        </div>
      )}
    </div>
  )
}

export default SpecialistsSection