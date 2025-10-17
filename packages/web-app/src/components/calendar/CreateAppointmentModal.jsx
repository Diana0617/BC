import React, { useState, useEffect } from 'react'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

/**
 * CreateAppointmentModal - Modal para crear una nueva cita
 * 
 * @param {Boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onCreate - Callback para crear la cita
 * @param {Object} initialData - Datos iniciales (fecha preseleccionada, etc.)
 * @param {Array} branches - Lista de sucursales
 * @param {Array} specialists - Lista de especialistas
 * @param {Array} services - Lista de servicios
 */
const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onCreate,
  initialData = {},
  branches = [],
  specialists = [],
  services = []
}) => {
  const [formData, setFormData] = useState({
    // Datos del cliente
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    
    // Datos de la cita
    branchId: initialData.branchId || '',
    specialistId: initialData.specialistId || '',
    serviceId: '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '10:00',
    
    // Otros
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        branchId: initialData.branchId || '',
        specialistId: initialData.specialistId || '',
        serviceId: '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '10:00',
        notes: ''
      })
      setErrors({})
    }
  }, [isOpen, initialData])

  // Auto-calcular endTime cuando cambia servicio
  useEffect(() => {
    const selectedService = services.find(s => s.id === formData.serviceId)
    if (selectedService && selectedService.duration && formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + selectedService.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      setFormData(prev => ({
        ...prev,
        endTime: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
      }))
    }
  }, [formData.serviceId, formData.startTime, services])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nombre del cliente es requerido'
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Teléfono es requerido'
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Sucursal es requerida'
    }

    if (!formData.specialistId) {
      newErrors.specialistId = 'Especialista es requerido'
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Servicio es requerido'
    }

    if (!formData.date) {
      newErrors.date = 'Fecha es requerida'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Hora de inicio es requerida'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Hora de fin es requerida'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Hora de fin debe ser posterior a hora de inicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate(formData)
      onClose()
    } catch (error) {
      console.error('Error creando cita:', error)
      alert('Error al crear la cita. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
              Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.clientPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="3001234567"
                />
                {errors.clientPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="juan@example.com"
                />
              </div>
            </div>
          </div>

          {/* Datos de la Cita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
              Datos de la Cita
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal *
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.branchId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar sucursal</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialista *
                </label>
                <select
                  name="specialistId"
                  value={formData.specialistId}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.specialistId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar especialista</option>
                  {specialists.map(specialist => (
                    <option key={specialist.id} value={specialist.id}>
                      {specialist.firstName} {specialist.lastName}
                    </option>
                  ))}
                </select>
                {errors.specialistId && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialistId}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio *
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price?.toLocaleString('es-CO')} ({service.duration} min)
                    </option>
                  ))}
                </select>
                {errors.serviceId && (
                  <p className="text-red-500 text-xs mt-1">{errors.serviceId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agregar notas adicionales sobre la cita..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAppointmentModal
