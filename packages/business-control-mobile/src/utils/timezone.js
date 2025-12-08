/**
 * Utilidades para manejo de zona horaria de Colombia (UTC-5)
 */

// Zona horaria de Colombia
export const COLOMBIA_TIMEZONE = 'America/Bogota';
export const COLOMBIA_OFFSET_HOURS = -5; // UTC-5

/**
 * Convierte una fecha UTC a hora de Colombia restando 5 horas
 * @param {Date|string} date - Fecha en UTC
 * @returns {Date} Fecha ajustada a Colombia
 */
export const toColombiaTime = (date) => {
  const d = new Date(date);
  // Restar 5 horas para convertir de UTC a Colombia
  const colombiaTime = new Date(d.getTime() + (COLOMBIA_OFFSET_HOURS * 60 * 60 * 1000));
  return colombiaTime;
};

/**
 * Formatea una fecha en formato YYYY-MM-DD en hora de Colombia
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateColombia = (date) => {
  const colombiaDate = toColombiaTime(date);
  
  const year = colombiaDate.getUTCFullYear();
  const month = String(colombiaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(colombiaDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual en Colombia en formato YYYY-MM-DD
 * @returns {string} Fecha actual en Colombia
 */
export const getTodayColombia = () => {
  const now = new Date();
  return formatDateColombia(now);
};

/**
 * Verifica si una fecha es hoy en hora de Colombia
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
export const isToday = (date) => {
  const dateStr = formatDateColombia(date);
  const todayStr = getTodayColombia();
  return dateStr === todayStr;
};

/**
 * Verifica si una fecha es mañana en hora de Colombia
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si es mañana
 */
export const isTomorrow = (date) => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  const dateStr = formatDateColombia(date);
  const tomorrowStr = formatDateColombia(tomorrow);
  return dateStr === tomorrowStr;
};

/**
 * Formatea hora en formato HH:MM en zona horaria de Colombia
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Hora en formato HH:MM
 */
export const formatTimeColombia = (date) => {
  const colombiaDate = toColombiaTime(date);
  const hours = String(colombiaDate.getUTCHours()).padStart(2, '0');
  const minutes = String(colombiaDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

