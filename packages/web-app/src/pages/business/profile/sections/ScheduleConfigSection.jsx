import React, { useState } from 'react'
import { 
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ScheduleConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: '08:00', end: '18:00' },
    tuesday: { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday: { enabled: true, start: '08:00', end: '18:00' },
    friday: { enabled: true, start: '08:00', end: '18:00' },
    saturday: { enabled: true, start: '08:00', end: '17:00' },
    sunday: { enabled: false, start: '08:00', end: '17:00' }
  })
  
  const [appointmentDuration, setAppointmentDuration] = useState(30)
  const [bufferTime, setBufferTime] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const handleDayChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Implementar guardado en API
      console.log('Guardando horarios:', { schedule, appointmentDuration, bufferTime })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isSetupMode && onComplete) {
        onComplete()
      }
      
    } catch (error) {
      console.error('Error guardando horarios:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Horarios de Atención
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
      </div>

      {/* Configuración por día */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Horarios por Día</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(schedule).map(([day, config]) => (
            <div key={day} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleDayChange(day, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-900 w-20">
                    {dayNames[day]}
                  </span>
                </div>
                
                {config.enabled && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Desde:</span>
                      <input
                        type="time"
                        value={config.start}
                        onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Hasta:</span>
                      <input
                        type="time"
                        value={config.end}
                        onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {!config.enabled && (
                  <span className="text-sm text-gray-500">Cerrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuraciones adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Duración de Citas</h3>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Duración por defecto (minutos)
            </label>
            <select
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
              <option value={120}>120 minutos</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Tiempo de Limpieza</h3>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tiempo entre citas (minutos)
            </label>
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Sin tiempo adicional</option>
              <option value={5}>5 minutos</option>
              <option value={10}>10 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
            </select>
          </div>
        </div>
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
            'Guardar Horarios'
          )}
        </button>
      </div>

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 4 de la configuración:</strong> Define los horarios de atención de tu negocio. 
            Puedes configurar horarios diferentes para cada especialista después.
          </p>
        </div>
      )}
    </div>
  )
}

export default ScheduleConfigSection