const SystemConfig = require('../models/SystemConfig');
const { Op } = require('sequelize');

/**
 * Controlador de Panel de Desarrollador
 * Solo accesible para usuarios con rol OWNER
 */
class DeveloperController {
  
  /**
   * Obtener estado del modo mantenimiento
   * GET /api/developer/maintenance-mode
   */
  async getMaintenanceMode(req, res) {
    try {
      const config = await SystemConfig.findOne({
        where: { key: 'maintenance_mode' }
      });

      if (!config) {
        return res.json({
          success: true,
          data: {
            enabled: false,
            message: null,
            estimatedEndTime: null
          }
        });
      }

      return res.json({
        success: true,
        data: config.value
      });
    } catch (error) {
      console.error('Error getting maintenance mode:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estado de mantenimiento'
      });
    }
  }

  /**
   * Activar/desactivar modo mantenimiento
   * POST /api/developer/maintenance-mode
   */
  async setMaintenanceMode(req, res) {
    try {
      const { enabled, message, estimatedEndTime } = req.body;
      const userId = req.user.id;

      const [config, created] = await SystemConfig.findOrCreate({
        where: { key: 'maintenance_mode' },
        defaults: {
          key: 'maintenance_mode',
          value: { enabled, message, estimatedEndTime },
          description: 'Controla el modo de mantenimiento del sistema',
          updatedBy: userId
        }
      });

      if (!created) {
        config.value = { enabled, message, estimatedEndTime };
        config.updatedBy = userId;
        await config.save();
      }

      console.log(`${enabled ? '🔒' : '🔓'} Modo mantenimiento ${enabled ? 'ACTIVADO' : 'DESACTIVADO'} por usuario ${userId}`);
      
      return res.json({
        success: true,
        message: enabled ? 'Modo mantenimiento activado' : 'Modo mantenimiento desactivado',
        data: config.value
      });
    } catch (error) {
      console.error('Error setting maintenance mode:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al configurar modo de mantenimiento'
      });
    }
  }

  /**
   * Eliminar datos específicos (con confirmación)
   * DELETE /api/developer/data/:table/:id
   */
  async deleteData(req, res) {
    try {
      const { table, id } = req.params;
      const { confirmationCode } = req.body;
      const userId = req.user.id;

      // Validar código de confirmación
      const expectedCode = `DELETE-${id.slice(0, 8).toUpperCase()}`;
      if (confirmationCode !== expectedCode) {
        return res.status(400).json({
          success: false,
          error: 'Código de confirmación inválido'
        });
      }

      // Lista de tablas permitidas para eliminación manual
      const allowedTables = [
        'users',
        'clients',
        'appointments',
        'receipts',
        'financial_movements',
        'business_expenses',
        'commission_payment_requests'
      ];

      if (!allowedTables.includes(table)) {
        return res.status(400).json({
          success: false,
          error: 'Tabla no permitida para eliminación manual'
        });
      }

      // Obtener el modelo dinámicamente
      const Model = require(`../models/${table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`);
      
      const record = await Model.findByPk(id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Registro no encontrado'
        });
      }

      // Guardar información antes de borrar
      const recordInfo = JSON.stringify(record.toJSON());
      
      await record.destroy();

      console.log(`🗑️ DEVELOPER DELETE - Usuario ${userId} eliminó registro de ${table}:`, recordInfo);

      return res.json({
        success: true,
        message: 'Registro eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar datos'
      });
    }
  }

  /**
   * Ejecutar query SQL personalizado (solo lectura)
   * POST /api/developer/query
   */
  async executeQuery(req, res) {
    try {
      const { query } = req.body;
      const userId = req.user.id;

      // Validar que sea solo SELECT
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery.startsWith('select')) {
        return res.status(400).json({
          success: false,
          error: 'Solo se permiten queries SELECT'
        });
      }

      // Prevenir queries peligrosos
      const dangerousKeywords = ['drop', 'delete', 'update', 'insert', 'truncate', 'alter', 'create'];
      for (const keyword of dangerousKeywords) {
        if (normalizedQuery.includes(keyword)) {
          return res.status(400).json({
            success: false,
            error: `Query contiene palabra clave no permitida: ${keyword}`
          });
        }
      }

      const { sequelize } = require('../config/database');
      const [results] = await sequelize.query(query);

      console.log(`📊 DEVELOPER QUERY - Usuario ${userId} ejecutó query: ${query.substring(0, 100)}...`);

      return res.json({
        success: true,
        data: results,
        rowCount: results.length
      });
    } catch (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas del sistema
   * GET /api/developer/stats
   */
  async getSystemStats(req, res) {
    try {
      const { sequelize } = require('../config/database');
      
      // Stats de base de datos
      const [tableStats] = await sequelize.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          n_tup_ins AS inserts,
          n_tup_upd AS updates,
          n_tup_del AS deletes
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20;
      `);

      // Conteos rápidos
      const Business = require('../models/Business');
      const User = require('../models/User');
      const Appointment = require('../models/Appointment');
      const Client = require('../models/Client');

      const [businessCount, userCount, appointmentCount, clientCount] = await Promise.all([
        Business.count(),
        User.count(),
        Appointment.count(),
        Client.count()
      ]);

      return res.json({
        success: true,
        data: {
          tables: tableStats,
          counts: {
            businesses: businessCount,
            users: userCount,
            appointments: appointmentCount,
            clients: clientCount
          }
        }
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }
}

module.exports = new DeveloperController();
