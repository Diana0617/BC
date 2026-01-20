/**
 * Utilidades para manejo de zonas horarias
 * Convierte entre UTC y la zona horaria local del negocio
 */

/**
 * Convierte una fecha y hora local a UTC para enviar al backend
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @param {string} timezone - Zona horaria IANA (ej: 'America/Bogota')
 * @returns {Date} Fecha en UTC
 */
export const localToUTC = (date, time, timezone) => {
  try {
    // Crear el string de fecha/hora local
    const dateTimeString = `${date}T${time}:00`
    
    // Parsear la fecha interpretándola como UTC primero
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    
    // Crear una fecha temporal en UTC para obtener el timestamp base
    const utcBase = Date.UTC(year, month - 1, day, hour, minute, 0)
    
    // Formatear esta fecha en la zona horaria objetivo para ver el offset
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'longOffset'
    })
    
    // Obtener el offset
    const testDate = new Date(utcBase)
    const parts = formatter.formatToParts(testDate)
    
    // Extraer el offset de la zona horaria (ej: GMT-5 -> -5)
    const offsetPart = parts.find(p => p.type === 'timeZoneName')
    if (!offsetPart) {
      console.warn('No se pudo obtener offset, usando fecha local del navegador')
      return new Date(dateTimeString)
    }
    
    // Parsear el offset (ej: "GMT-5" o "GMT+2")
    const offsetMatch = offsetPart.value.match(/GMT([+-]\d+)/)
    if (!offsetMatch) {
      console.warn('No se pudo parsear offset, usando fecha local del navegador')
      return new Date(dateTimeString)
    }
    
    const offsetHours = parseInt(offsetMatch[1])
    
    // Convertir: si es GMT-5, la hora local 10:00 es 15:00 UTC
    // Restamos el offset de la hora local para obtener UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour - offsetHours, minute, 0))
    
    console.log('localToUTC conversion:', {
      input: { date, time, timezone },
      offsetHours,
      result: utcDate.toISOString()
    })
    
    return utcDate
  } catch (error) {
    console.error('Error convirtiendo local a UTC:', error, { date, time, timezone })
    // Fallback: crear fecha asumiendo zona horaria del navegador
    return new Date(`${date}T${time}:00`)
  }
}

/**
 * Convierte una fecha UTC del backend a la zona horaria local
 * @param {Date|string} utcDate - Fecha en UTC
 * @param {string} timezone - Zona horaria IANA (ej: 'America/Bogota')
 * @returns {Object} { date: 'YYYY-MM-DD', time: 'HH:MM' }
 */
export const utcToLocal = (utcDate, timezone) => {
  try {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    
    // Formatear en la zona horaria especificada
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const formatted = formatter.format(date)
    const [datePart, timePart] = formatted.split(', ')
    
    return {
      date: datePart, // YYYY-MM-DD
      time: timePart  // HH:MM
    }
  } catch (error) {
    console.error('Error convirtiendo UTC a local:', error)
    // Fallback: usar hora local del navegador
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().substring(0, 5)
    }
  }
}

/**
 * Obtiene la fecha y hora actual en la zona horaria especificada
 * @param {string} timezone - Zona horaria IANA
 * @returns {Object} { date: 'YYYY-MM-DD', time: 'HH:MM', datetime: Date }
 */
export const getCurrentInTimezone = (timezone) => {
  const now = new Date()
  const local = utcToLocal(now, timezone)
  
  return {
    ...local,
    datetime: now
  }
}

/**
 * Formatea una fecha para mostrar en la UI con la zona horaria
 * @param {Date|string} date - Fecha a formatear
 * @param {string} timezone - Zona horaria IANA
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatInTimezone = (date, timezone, options = {}) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    }
    
    return new Intl.DateTimeFormat('es-CO', defaultOptions).format(dateObj)
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return date.toString()
  }
}

/**
 * Calcula la diferencia en minutos entre dos horarios
 * @param {string} startTime - Hora inicio HH:MM
 * @param {string} endTime - Hora fin HH:MM
 * @returns {number} Minutos de diferencia
 */
export const getMinutesBetween = (startTime, endTime) => {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes - startMinutes
}

/**
 * Valida que una fecha/hora no esté en el pasado según la zona horaria
 * @param {string} date - Fecha YYYY-MM-DD
 * @param {string} time - Hora HH:MM
 * @param {string} timezone - Zona horaria IANA
 * @returns {boolean} true si es válida (futura o presente)
 */
export const isValidFutureDateTime = (date, time, timezone) => {
  try {
    const appointmentUTC = localToUTC(date, time, timezone)
    const now = new Date()
    
    return appointmentUTC >= now
  } catch (error) {
    console.error('Error validando fecha futura:', error)
    return false
  }
}

/**
 * Convierte un rango de fechas local a UTC para consultas
 * @param {string} startDate - Fecha inicio YYYY-MM-DD
 * @param {string} endDate - Fecha fin YYYY-MM-DD
 * @param {string} timezone - Zona horaria IANA
 * @returns {Object} { startDateUTC: ISO string, endDateUTC: ISO string }
 */
export const dateRangeToUTC = (startDate, endDate, timezone) => {
  try {
    // Inicio del día en hora local (00:00:00)
    const startUTC = localToUTC(startDate, '00:00', timezone)
    
    // Fin del día en hora local (23:59:59)
    const endUTC = localToUTC(endDate, '23:59', timezone)
    
    return {
      startDateUTC: startUTC.toISOString(),
      endDateUTC: endUTC.toISOString()
    }
  } catch (error) {
    console.error('Error convirtiendo rango de fechas:', error)
    // Fallback: usar fechas como están
    return {
      startDateUTC: `${startDate}T00:00:00Z`,
      endDateUTC: `${endDate}T23:59:59Z`
    }
  }
}

export default {
  localToUTC,
  utcToLocal,
  getCurrentInTimezone,
  formatInTimezone,
  getMinutesBetween,
  isValidFutureDateTime,
  dateRangeToUTC
}
