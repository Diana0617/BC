/**
 * Controlador para gestión del cache del sistema
 * Permite limpiar, consultar estadísticas y gestionar el cache
 */

const { dashboardCache } = require('../utils/cache');

class CacheController {

  /**
   * Obtener estadísticas del cache
   */
  static async getStats(req, res) {
    try {
      const stats = dashboardCache.getStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          message: 'Estadísticas del cache obtenidas correctamente'
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del cache'
      });
    }
  }

  /**
   * Limpiar todo el cache
   */
  static async clearAll(req, res) {
    try {
      const statsBefore = dashboardCache.getStats();
      dashboardCache.clear();
      
      res.json({
        success: true,
        data: {
          message: 'Cache limpiado completamente',
          clearedItems: statsBefore.size,
          memoryFreed: statsBefore.memory
        }
      });
    } catch (error) {
      console.error('Error limpiando cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar cache'
      });
    }
  }

  /**
   * Limpiar entrada específica del cache
   */
  static async clearKey(req, res) {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Clave requerida'
        });
      }

      const existed = dashboardCache.has(key);
      dashboardCache.delete(key);

      res.json({
        success: true,
        data: {
          message: existed 
            ? `Entrada '${key}' eliminada del cache`
            : `Entrada '${key}' no existía en cache`,
          keyFound: existed
        }
      });
    } catch (error) {
      console.error('Error eliminando clave del cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar clave del cache'
      });
    }
  }

  /**
   * Limpiar cache específico del dashboard
   */
  static async clearDashboard(req, res) {
    try {
      const dashboardKeys = [
        'dashboard_metrics_default',
        'dashboard_metrics_thisMonth',
        'dashboard_metrics_lastMonth',
        'dashboard_metrics_thisYear',
        'dashboard_revenue_trend',
        'dashboard_plan_distribution',
        'dashboard_payments_by_month_6',
        'dashboard_payments_by_month_12'
      ];

      let clearedCount = 0;
      dashboardKeys.forEach(key => {
        if (dashboardCache.has(key)) {
          dashboardCache.delete(key);
          clearedCount++;
        }
      });

      res.json({
        success: true,
        data: {
          message: 'Cache del dashboard limpiado',
          clearedItems: clearedCount,
          totalKeysChecked: dashboardKeys.length
        }
      });
    } catch (error) {
      console.error('Error limpiando cache del dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar cache del dashboard'
      });
    }
  }

  /**
   * Obtener todas las claves del cache
   */
  static async getKeys(req, res) {
    try {
      const stats = dashboardCache.getStats();
      
      res.json({
        success: true,
        data: {
          keys: stats.keys,
          total: stats.size,
          memory: stats.memory
        }
      });
    } catch (error) {
      console.error('Error obteniendo claves del cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener claves del cache'
      });
    }
  }

  /**
   * Verificar si una clave específica existe
   */
  static async checkKey(req, res) {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'Clave requerida'
        });
      }

      const exists = dashboardCache.has(key);
      const data = exists ? dashboardCache.get(key) : null;

      res.json({
        success: true,
        data: {
          key,
          exists,
          hasData: data !== null,
          dataPreview: data ? (typeof data === 'object' ? Object.keys(data) : typeof data) : null
        }
      });
    } catch (error) {
      console.error('Error verificando clave del cache:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar clave del cache'
      });
    }
  }
}

module.exports = CacheController;