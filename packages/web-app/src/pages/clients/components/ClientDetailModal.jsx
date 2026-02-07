import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  XMarkIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@shared/api/client'
import { formatInTimezone } from '../../../utils/timezone'

const ClientDetailModal = ({ isOpen, onClose, client, onEdit }) => {
  const { currentBusiness } = useSelector(state => state.business)
  const timezone = currentBusiness?.timezone || 'America/Bogota'
  const [activeTab, setActiveTab] = useState('info') // 'info', 'history', 'medical'
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (isOpen && activeTab === 'history' && history.length === 0) {
      loadClientHistory()
    }
  }, [isOpen, activeTab])

  const loadClientHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await apiClient.get(`/api/business/${currentBusiness.id}/clients/${client.id}/history`)
      setHistory(response.data.data || [])
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'No especificada'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} años`
  }

  const getGenderText = (gender) => {
    const texts = {
      MALE: 'Masculino',
      FEMALE: 'Femenino',
      OTHER: 'Otro',
      PREFER_NOT_TO_SAY: 'Prefiere no decir'
    }
    return texts[gender] || 'No especificado'
  }

  const getAppointmentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getAppointmentStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELED: 'Cancelada',
      NO_SHOW: 'No Asistió'
    }
    return texts[status] || status
  }

  if (!isOpen || !client) return null
  
  // Extraer nombres - manejar tanto {firstName, lastName} como {name}
  const firstName = client.firstName || client.name?.split(' ')[0] || 'C'
  const lastName = client.lastName || client.name?.split(' ')[1] || 'L'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {firstName?.[0]}{lastName?.[0]}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar cliente"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'medical'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Información Médica
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Historial de Citas
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {/* Información General */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Contacto</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <span>{client.phone || 'No especificado'}</span>
                      </div>
                      {client.phoneSecondary && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <span>{client.phoneSecondary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-600">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <span>{client.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                        <span className="font-medium">
                          {client.dateOfBirth 
                            ? formatInTimezone(client.dateOfBirth, timezone, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'No especificada'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium">{calculateAge(client.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Género:</span>
                        <span className="font-medium">{getGenderText(client.gender)}</span>
                      </div>
                    </div>
                  </div>

                  {(client.address || client.city || client.state) && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Dirección</h4>
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          {client.address && <p>{client.address}</p>}
                          {(client.city || client.state) && (
                            <p>{[client.city, client.state].filter(Boolean).join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {client.emergencyContact?.name && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Contacto de Emergencia</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-600">Nombre</span>
                            <p className="font-medium">{client.emergencyContact.name}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Teléfono</span>
                            <p className="font-medium">{client.emergencyContact.phone}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Parentesco</span>
                            <p className="font-medium">{client.emergencyContact.relationship}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información Médica */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                {client.medicalInfo?.allergies?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      Alergias
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {client.medicalInfo?.medications?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <HeartIcon className="w-5 h-5 text-blue-500" />
                      Medicamentos
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.medications.map((medication, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {client.medicalInfo?.conditions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Condiciones Médicas</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {client.medicalInfo.conditions.map((condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {client.medicalInfo?.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Notas Adicionales</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{client.medicalInfo.notes}</p>
                    </div>
                  </div>
                )}

                {(!client.medicalInfo || 
                  (!client.medicalInfo.allergies?.length && 
                   !client.medicalInfo.medications?.length && 
                   !client.medicalInfo.conditions?.length && 
                   !client.medicalInfo.notes)) && (
                  <div className="text-center py-12 text-gray-500">
                    <HeartIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay información médica registrada</p>
                  </div>
                )}
              </div>
            )}

            {/* Historial de Citas */}
            {activeTab === 'history' && (
              <div>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay citas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-gray-900">
                                {appointment.service?.name || 'Servicio'}
                              </h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAppointmentStatusColor(appointment.status)}`}>
                                {getAppointmentStatusText(appointment.status)}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {formatInTimezone(appointment.startTime, timezone, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                {formatInTimezone(appointment.startTime, timezone, {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {appointment.specialist && (
                                <div className="text-gray-700">
                                  Especialista: {appointment.specialist.firstName} {appointment.specialist.lastName}
                                </div>
                              )}
                            </div>
                          </div>
                          {appointment.totalAmount && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${appointment.totalAmount.toLocaleString('es-CO')}
                              </div>
                            </div>
                          )}
                        </div>
                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDetailModal
