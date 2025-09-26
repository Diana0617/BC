import React, { useState } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const AppointmentsConfigSection = ({ isSetupMode, onComplete }) => {
  const [config, setConfig] = useState({
    allowOnlineBooking: true,
    requireApproval: false,
    allowCancellations: true,
    cancellationHours: 24,
    allowRescheduling: true,
    rescheduleHours: 24,
    maxAdvanceBooking: 30, // días
    minAdvanceBooking: 1, // horas
    bufferTime: 15, // minutos entre citas
    workingHours: {
      monday: { enabled: true, start: '08:00', end: '18:00' },
      tuesday: { enabled: true, start: '08:00', end: '18:00' },
      wednesday: { enabled: true, start: '08:00', end: '18:00' },
      thursday: { enabled: true, start: '08:00', end: '18:00' },
      friday: { enabled: true, start: '08:00', end: '18:00' },
      saturday: { enabled: true, start: '08:00', end: '17:00' },
      sunday: { enabled: false, start: '08:00', end: '17:00' }
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleWorkingHoursChange = (day, field, value) => {
    setConfig(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // TODO: Implementar guardado en API
      console.log('Guardando configuración de citas:', config)

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

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Turnos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura las opciones avanzadas para la gestión de citas y turnos
          </p>
        </div>
        {isSetupMode && (
          <div className="flex items-center text-sm text-blue-600">
            <span>Paso opcional</span>
          </div>
        )}
      </div>

      {/* Configuración General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
          Configuración General
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowOnlineBooking"
                checked={config.allowOnlineBooking}
                onChange={(e) => handleConfigChange('allowOnlineBooking', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowOnlineBooking" className="ml-2 text-sm text-gray-700">
                Permitir reservas en línea
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireApproval"
                checked={config.requireApproval}
                onChange={(e) => handleConfigChange('requireApproval', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
                Requiere aprobación manual
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowCancellations"
                checked={config.allowCancellations}
                onChange={(e) => handleConfigChange('allowCancellations', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowCancellations" className="ml-2 text-sm text-gray-700">
                Permitir cancelaciones
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas mínimas para cancelar
              </label>
              <input
                type="number"
                value={config.cancellationHours}
                onChange={(e) => handleConfigChange('cancellationHours', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="168"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días máximo de anticipación
              </label>
              <input
                type="number"
                value={config.maxAdvanceBooking}
                onChange={(e) => handleConfigChange('maxAdvanceBooking', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo buffer entre citas (min)
              </label>
              <input
                type="number"
                value={config.bufferTime}
                onChange={(e) => handleConfigChange('bufferTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="120"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horarios de Trabajo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
          Horarios de Trabajo
        </h3>

        <div className="space-y-3">
          {Object.entries(config.workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-20">
                <span className="text-sm font-medium text-gray-700">{dayNames[day]}</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={hours.enabled}
                  onChange={(e) => handleWorkingHoursChange(day, 'enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Habilitado</label>
              </div>

              {hours.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Desde:</label>
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Hasta:</label>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
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

export default AppointmentsConfigSection