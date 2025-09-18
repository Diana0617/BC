/**
 * Sistema de caché simple en memoria para optimizar consultas frecuentes
 * Implementa TTL (Time To Live) para invalidación automática
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Guardar datos en cache con TTL
   * @param {string} key - Clave única para los datos
   * @param {any} data - Datos a guardar
   * @param {number} ttl - Tiempo de vida en milisegundos (default: 5 minutos)
   */
  set(key, data, ttl = 300000) { // 5 minutos por defecto
    // Limpiar timer existente si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Guardar datos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Configurar auto-limpieza
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Obtener datos del cache
   * @param {string} key - Clave de los datos
   * @returns {any|null} - Datos o null si no existen o expiraron
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si los datos han expirado
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Verificar si una clave existe en cache y no ha expirado
   * @param {string} key - Clave a verificar
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Eliminar entrada del cache
   * @param {string} key - Clave a eliminar
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Limpiar todo el cache
   */
  clear() {
    // Limpiar todos los timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: this.getMemoryUsage()
    };
  }

  /**
   * Estimar uso de memoria (aproximado)
   */
  getMemoryUsage() {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(value.data).length;
    }
    return `${Math.round(size / 1024)} KB`;
  }

  /**
   * Wrapper para funciones con cache automático
   * @param {string} key - Clave única
   * @param {Function} fn - Función a ejecutar si no hay cache
   * @param {number} ttl - TTL en milisegundos
   * @returns {Promise<any>}
   */
  async wrap(key, fn, ttl = 300000) {
    // Intentar obtener del cache primero
    const cached = this.get(key);
    if (cached !== null) {
      // console.log(`📦 Cache HIT: ${key}`);
      return cached;
    }

    // Ejecutar función y guardar resultado
    // console.log(`🔄 Cache MISS: ${key} - Ejecutando función...`);
    const result = await fn();
    this.set(key, result, ttl);
    
    return result;
  }
}

// Instancia singleton
const dashboardCache = new MemoryCache();

// Configuraciones específicas por tipo de dato
const CACHE_CONFIG = {
  DASHBOARD_METRICS: 300000,        // 5 minutos
  DASHBOARD_REVENUE: 600000,        // 10 minutos  
  DASHBOARD_PLANS: 900000,          // 15 minutos
  DASHBOARD_BUSINESSES: 300000,     // 5 minutos
  DASHBOARD_GROWTH: 600000,         // 10 minutos
  QUICK_SUMMARY: 180000,            // 3 minutos
  PLAN_STATS: 900000               // 15 minutos
};

module.exports = {
  MemoryCache,
  dashboardCache,
  CACHE_CONFIG
};