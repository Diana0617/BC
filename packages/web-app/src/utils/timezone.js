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
    const dateTimeString = `${date}T${time}:00`
    
    // Crear dos fechas: una interpretada como local del navegador,
    // otra formateada en la zona horaria del negocio
    const tempDate = new Date(dateTimeString)
    
    // Obtener cómo se ve esta fecha en la zona horaria del negocio
    const tzString = tempDate.toLocaleString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    // Obtener cómo se ve en UTC
    const utcString = tempDate.toLocaleString('en-US', { 
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    // Calcular el offset en milisegundos
    const tzDate = new Date(tzString)
    const utcDate = new Date(utcString)
    const offset = utcDate.getTime() - tzDate.getTime()
    
    // Aplicar el offset a la fecha original interpretada como hora del negocio
    const result = new Date(new Date(`${date}T${time}:00Z`).getTime() - offset)
    
    console.log('localToUTC conversion:', {
      input: { date, time, timezone },
      offset: offset / 3600000 + ' hours',
      result: result.toISOString()
    })
    
    if (isNaN(result.getTime())) {
      throw new Error('Fecha inválida generada')
    }
    
    return result
  } catch (error) {
    console.error('Error convirtiendo local a UTC:', error, { date, time, timezone })
    // Fallback más seguro: interpretar como UTC
    const fallback = new Date(`${date}T${time}:00Z`)
    return fallback
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
    
    // Validar que las fechas sean válidas
    if (isNaN(startUTC.getTime()) || isNaN(endUTC.getTime())) {
      console.error('Fechas inválidas generadas en dateRangeToUTC:', { startDate, endDate, timezone, startUTC, endUTC })
      throw new Error('Fechas inválidas')
    }
    
    const result = {
      startDateUTC: startUTC.toISOString(),
      endDateUTC: endUTC.toISOString()
    }
    
    console.log('[dateRangeToUTC]', {
      input: { startDate, endDate, timezone },
      output: result
    })
    
    return result
  } catch (error) {
    console.error('Error convirtiendo rango de fechas:', error, { startDate, endDate, timezone })
    // Fallback: usar fechas como están pero asegurando formato válido
    return {
      startDateUTC: `${startDate}T00:00:00.000Z`,
      endDateUTC: `${endDate}T23:59:59.999Z`
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
