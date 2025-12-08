import React, { useState } from 'react'
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

/**
 * AppointmentDetailModal - Modal para ver y gestionar detalles de una cita
 * 
 * @param {Object} appointment - Datos de la cita
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onUpdate - Callback para actualizar la cita
 * @param {Function} onCancel - Callback para cancelar la cita
 * @param {Function} onComplete - Callback para completar la cita
 */
const AppointmentDetailModal = ({
  appointment,
  onClose,
  onUpdate,
  onCancel,
  onComplete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState(appointment?.notes || '')

  if (!appointment) return null

  // Colores por estado
  const statusColors = {
    PENDING: 'bg-orange-100 text-orange-800 border-orange-300',
    CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
    CANCELED: 'bg-red-100 text-red-800 border-red-300',
    NO_SHOW: 'bg-red-100 text-red-800 border-red-300',
    RESCHEDULED: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }

  const statusLabels = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada',
    CANCELED: 'Cancelada',
    NO_SHOW: 'No Asistió',
    RESCHEDULED: 'Reprogramada'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const handleSaveNotes = () => {
    if (onUpdate) {
      onUpdate(appointment.id, { notes: editedNotes })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    const reason = prompt('¿Por qué deseas cancelar esta cita?')
    if (reason && onCancel) {
      onCancel(appointment.id, reason)
    }
  }

  const handleComplete = () => {
    if (confirm('¿Confirmas que esta cita ha sido completada?')) {
      if (onComplete) {
        onComplete(appointment.id)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalles de la Cita</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Cliente</h3>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{appointment.clientName || 'Sin nombre'}</p>
              {appointment.clientPhone && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{appointment.clientPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Fecha</h3>
              </div>
              <p className="text-sm text-gray-700 capitalize">
                {formatDate(appointment.startTime)}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Horario</h3>
              </div>
              <p className="text-sm text-gray-700">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </p>
            </div>
          </div>

          {/* Servicio */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Servicio</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-900">{appointment.serviceName || 'Sin servicio'}</p>
              {appointment.servicePrice && (
                <div className="flex items-center text-purple-700 font-medium">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  {appointment.servicePrice.toLocaleString('es-CO')}
                </div>
              )}
            </div>
          </div>

          {/* Especialista */}
          {appointment.specialistName && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Especialista</h3>
              <p className="text-gray-900">{appointment.specialistName}</p>
            </div>
          )}

          {/* Sucursal */}
          {appointment.branchName && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <h3 className="font-semibold text-gray-900">Sucursal</h3>
                  <p className="text-sm text-gray-700">{appointment.branchName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monto Total */}
          {appointment.totalAmount && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Monto Total</h3>
                <div className="flex items-center text-2xl font-bold text-green-700">
                  <CurrencyDollarIcon className="h-6 w-6 mr-1" />
                  {appointment.totalAmount.toLocaleString('es-CO')}
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Notas</h3>
              </div>
              {!isEditing && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELED' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agrega notas sobre esta cita..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveNotes}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditedNotes(appointment.notes || '')
                      setIsEditing(false)
                    }}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {appointment.notes || 'Sin notas adicionales'}
              </p>
            )}
          </div>
        </div>

        {/* Footer - Acciones */}
        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELED' && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              {appointment.status === 'CONFIRMED' && (
                <button
                  onClick={handleComplete}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Completar Cita
                </button>
              )}
              
              <button
                onClick={handleCancel}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Cancelar Cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentDetailModal
