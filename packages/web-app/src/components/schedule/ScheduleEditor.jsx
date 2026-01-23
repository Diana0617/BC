import React, { useState, useCallback, useEffect } from 'react'
import {
  ClockIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

/**
 * Componente principal para editar horarios con soporte para:
 * - Múltiples turnos por día
 * - Breaks/descansos configurables
 * - Plantillas predefinidas
 * - Copiar horarios entre días
 */
const ScheduleEditor = ({ 
  initialSchedule = {},
  onChange,
  readOnly = false,
  showTemplates = true,
  compactMode = false
}) => {
  // Estado del horario semanal
  const [weekSchedule, setWeekSchedule] = useState(() => {
    // Estructura por defecto si no hay datos
    const defaultDay = {
      enabled: false,
      shifts: []
    }
    
    return {
      monday: initialSchedule?.monday || defaultDay,
      tuesday: initialSchedule?.tuesday || defaultDay,
      wednesday: initialSchedule?.wednesday || defaultDay,
      thursday: initialSchedule?.thursday || defaultDay,
      friday: initialSchedule?.friday || defaultDay,
      saturday: initialSchedule?.saturday || defaultDay,
      sunday: initialSchedule?.sunday || defaultDay
    }
  })

  const [expandedDays, setExpandedDays] = useState(() => {
    // Expandir automáticamente los días que tienen horarios configurados
    const expanded = {}
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    days.forEach(day => {
      const daySchedule = initialSchedule?.[day]
      // Expandir si el día está habilitado y tiene turnos
      expanded[day] = daySchedule?.enabled && daySchedule?.shifts?.length > 0
    })
    
    // Si ningún día está expandido, expandir el lunes por defecto
    const hasAnyExpanded = Object.values(expanded).some(v => v)
    if (!hasAnyExpanded) {
      expanded.monday = true
    }
    
    return expanded
  })

  // Sincronizar con initialSchedule cuando cambie (por ejemplo, después de cargar desde el backend)
  useEffect(() => {
    if (initialSchedule && Object.keys(initialSchedule).length > 0) {
      const defaultDay = {
        enabled: false,
        shifts: []
      }
      
      setWeekSchedule({
        monday: initialSchedule?.monday || defaultDay,
        tuesday: initialSchedule?.tuesday || defaultDay,
        wednesday: initialSchedule?.wednesday || defaultDay,
        thursday: initialSchedule?.thursday || defaultDay,
        friday: initialSchedule?.friday || defaultDay,
        saturday: initialSchedule?.saturday || defaultDay,
        sunday: initialSchedule?.sunday || defaultDay
      })
    }
  }, [initialSchedule])

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes', short: 'Lun', emoji: '📅' },
    { key: 'tuesday', label: 'Martes', short: 'Mar', emoji: '📅' },
    { key: 'wednesday', label: 'Miércoles', short: 'Mié', emoji: '📅' },
    { key: 'thursday', label: 'Jueves', short: 'Jue', emoji: '📅' },
    { key: 'friday', label: 'Viernes', short: 'Vie', emoji: '📅' },
    { key: 'saturday', label: 'Sábado', short: 'Sáb', emoji: '📅' },
    { key: 'sunday', label: 'Domingo', short: 'Dom', emoji: '📅' }
  ]

  // Plantillas predefinidas
  const templates = [
    {
      id: 'corrido',
      name: 'Horario Corrido',
      description: '9:00 - 18:00 sin breaks',
      icon: '⏰',
      schedule: {
        shifts: [{ start: '09:00', end: '18:00' }]
      }
    },
    {
      id: 'con-almuerzo',
      name: 'Con Almuerzo',
      description: '9:00 - 18:00 con break 12:00-13:00',
      icon: '🍽️',
      schedule: {
        shifts: [{ start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' }]
      }
    },
    {
      id: 'jornada-partida',
      name: 'Jornada Partida',
      description: 'Mañana 8:00-13:00 / Tarde 15:00-20:00',
      icon: '⏰',
      schedule: {
        shifts: [
          { start: '08:00', end: '13:00' },
          { start: '15:00', end: '20:00' }
        ]
      }
    },
    {
      id: 'medio-tiempo',
      name: 'Medio Tiempo',
      description: '9:00 - 14:00',
      icon: '🕐',
      schedule: {
        shifts: [{ start: '09:00', end: '14:00' }]
      }
    }
  ]

  // Notificar cambios al padre
  const notifyChange = useCallback((newSchedule) => {
    if (onChange) {
      onChange(newSchedule)
    }
  }, [onChange])

  // Toggle día habilitado/deshabilitado
  const toggleDay = (dayKey) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const newSchedule = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          enabled: !prev[dayKey].enabled
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
  }

  // Agregar turno a un día
  const addShift = (dayKey) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const currentShifts = prev[dayKey].shifts || []
      const newShift = {
        start: '09:00',
        end: '18:00'
      }
      
      const newSchedule = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          enabled: true,
          shifts: [...currentShifts, newShift]
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
    
    // Expandir el día automáticamente
    setExpandedDays(prev => ({ ...prev, [dayKey]: true }))
  }

  // Eliminar turno
  const removeShift = (dayKey, shiftIndex) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const newShifts = prev[dayKey].shifts.filter((_, idx) => idx !== shiftIndex)
      const newSchedule = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          shifts: newShifts,
          enabled: newShifts.length > 0
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
  }

  // Actualizar turno
  const updateShift = (dayKey, shiftIndex, field, value) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const newShifts = [...prev[dayKey].shifts]
      newShifts[shiftIndex] = {
        ...newShifts[shiftIndex],
        [field]: value
      }
      
      const newSchedule = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          shifts: newShifts
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
  }

  // Agregar break a un turno
  const addBreak = (dayKey, shiftIndex) => {
    if (readOnly) return
    
    const shift = weekSchedule[dayKey].shifts[shiftIndex]
    const startTime = parseTime(shift.start)
    const endTime = parseTime(shift.end)
    const midpoint = Math.floor((startTime + endTime) / 2)
    
    const breakStart = formatTime(midpoint - 30) // 30 min antes del medio
    const breakEnd = formatTime(midpoint + 30)   // 30 min después del medio
    
    updateShift(dayKey, shiftIndex, 'breakStart', breakStart)
    updateShift(dayKey, shiftIndex, 'breakEnd', breakEnd)
  }

  // Eliminar break
  const removeBreak = (dayKey, shiftIndex) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const newShifts = [...prev[dayKey].shifts]
      const shift = { ...newShifts[shiftIndex] }
      delete shift.breakStart
      delete shift.breakEnd
      newShifts[shiftIndex] = shift
      
      const newSchedule = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          shifts: newShifts
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
  }

  // Aplicar plantilla a un día
  const applyTemplate = (dayKey, template) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const newSchedule = {
        ...prev,
        [dayKey]: {
          enabled: true,
          shifts: template.schedule.shifts
        }
      }
      notifyChange(newSchedule)
      return newSchedule
    })
    
    setExpandedDays(prev => ({ ...prev, [dayKey]: true }))
  }

  // Copiar horario a otros días
  const copyToOtherDays = (sourceDayKey, targetDays) => {
    if (readOnly) return
    
    setWeekSchedule(prev => {
      const sourceSchedule = prev[sourceDayKey]
      const newSchedule = { ...prev }
      
      targetDays.forEach(dayKey => {
        newSchedule[dayKey] = {
          enabled: sourceSchedule.enabled,
          shifts: JSON.parse(JSON.stringify(sourceSchedule.shifts)) // Deep clone
        }
      })
      
      notifyChange(newSchedule)
      return newSchedule
    })
  }

  // Toggle expandir/colapsar día
  const toggleExpanded = (dayKey) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }))
  }

  // Utilidades de tiempo
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  // Validar turno
  const validateShift = (shift) => {
    const errors = []
    
    if (!shift.start || !shift.end) {
      errors.push('Debe especificar hora de inicio y fin')
    }
    
    const start = parseTime(shift.start)
    const end = parseTime(shift.end)
    
    if (start >= end) {
      errors.push('La hora de fin debe ser después de la hora de inicio')
    }
    
    if (shift.breakStart && shift.breakEnd) {
      const breakStart = parseTime(shift.breakStart)
      const breakEnd = parseTime(shift.breakEnd)
      
      if (breakStart >= breakEnd) {
        errors.push('El break debe tener hora de fin después de inicio')
      }
      
      if (breakStart < start || breakEnd > end) {
        errors.push('El break debe estar dentro del turno')
      }
      
      if (breakEnd - breakStart < 15) {
        errors.push('El break debe ser de al menos 15 minutos')
      }
      
      if (breakEnd - breakStart > 180) {
        errors.push('El break no puede ser mayor a 3 horas')
      }
    }
    
    return errors
  }

  // Renderizar un turno individual
  const renderShift = (dayKey, shift, shiftIndex) => {
    const errors = validateShift(shift)
    const hasErrors = errors.length > 0
    const hasBreak = shift.breakStart && shift.breakEnd
    
    return (
      <div 
        key={shiftIndex}
        className={`border rounded-lg p-4 space-y-3 transition-all ${
          hasErrors 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
      >
        {/* Header del turno */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              Turno {shiftIndex + 1}
            </span>
          </div>
          
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeShift(dayKey, shiftIndex)}
              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
              title="Eliminar turno"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Horarios del turno */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Inicio
            </label>
            <input
              type="time"
              value={shift.start}
              onChange={(e) => updateShift(dayKey, shiftIndex, 'start', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fin
            </label>
            <input
              type="time"
              value={shift.end}
              onChange={(e) => updateShift(dayKey, shiftIndex, 'end', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Break */}
        {hasBreak ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">
                ☕ Descanso / Almuerzo
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeBreak(dayKey, shiftIndex)}
                  className="text-xs text-amber-700 hover:text-amber-800 underline"
                >
                  Eliminar break
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-amber-700 mb-1">
                  Inicio break
                </label>
                <input
                  type="time"
                  value={shift.breakStart}
                  onChange={(e) => updateShift(dayKey, shiftIndex, 'breakStart', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-2 py-1 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-amber-100"
                />
              </div>
              
              <div>
                <label className="block text-xs text-amber-700 mb-1">
                  Fin break
                </label>
                <input
                  type="time"
                  value={shift.breakEnd}
                  onChange={(e) => updateShift(dayKey, shiftIndex, 'breakEnd', e.target.value)}
                  disabled={readOnly}
                  className="w-full px-2 py-1 border border-amber-300 rounded text-sm focus:ring-2 focus:ring-amber-500 disabled:bg-amber-100"
                />
              </div>
            </div>
          </div>
        ) : (
          !readOnly && (
            <button
              type="button"
              onClick={() => addBreak(dayKey, shiftIndex)}
              className="w-full py-2 border-2 border-dashed border-amber-300 rounded-lg text-sm text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-colors"
            >
              ☕ Agregar descanso / almuerzo
            </button>
          )
        )}

        {/* Errores de validación */}
        {hasErrors && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            {errors.map((error, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-red-700">
                <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Renderizar un día completo
  const renderDay = (day) => {
    const daySchedule = weekSchedule[day.key]
    const isExpanded = expandedDays[day.key]
    const hasShifts = daySchedule.shifts && daySchedule.shifts.length > 0
    
    return (
      <div key={day.key} className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header del día */}
        <div 
          className={`p-4 cursor-pointer transition-colors ${
            daySchedule.enabled 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' 
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => toggleExpanded(day.key)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label 
                className="flex items-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={daySchedule.enabled}
                  onChange={() => toggleDay(day.key)}
                  disabled={readOnly}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{day.emoji}</span>
                  <span className={`font-semibold ${
                    daySchedule.enabled ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {compactMode ? day.short : day.label}
                  </span>
                </div>
                
                {daySchedule.enabled && hasShifts && (
                  <div className="text-xs text-gray-600 mt-1">
                    {daySchedule.shifts.map((shift, idx) => (
                      <span key={idx} className="mr-2">
                        {shift.start} - {shift.end}
                        {shift.breakStart && shift.breakEnd && (
                          <span className="text-amber-600"> (break {shift.breakStart}-{shift.breakEnd})</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {daySchedule.enabled && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  {hasShifts ? `${daySchedule.shifts.length} turno${daySchedule.shifts.length > 1 ? 's' : ''}` : 'Sin turnos'}
                </span>
              )}
              
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Contenido expandido */}
        {isExpanded && daySchedule.enabled && (
          <div className="p-4 bg-white space-y-3">
            {/* Plantillas rápidas */}
            {showTemplates && !readOnly && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  ⚡ Plantillas rápidas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplate(day.key, template)}
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      title={template.description}
                    >
                      {template.icon} {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de turnos */}
            {hasShifts ? (
              <div className="space-y-3">
                {daySchedule.shifts.map((shift, idx) => renderShift(day.key, shift, idx))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay turnos configurados para este día
              </div>
            )}

            {/* Botones de acción */}
            {!readOnly && (
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => addShift(day.key)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Agregar turno
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const otherDays = daysOfWeek
                      .map(d => d.key)
                      .filter(k => k !== day.key)
                    copyToOtherDays(day.key, otherDays)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  title="Copiar este horario a todos los demás días"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  Copiar a todos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {daysOfWeek.map(day => renderDay(day))}
    </div>
  )
}

export default ScheduleEditor
