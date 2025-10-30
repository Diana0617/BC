/**
 * Rutas de Administración del Sistema
 * 
 * Endpoints protegidos solo para SUPER_ADMIN para tareas de mantenimiento
 * como carga de datos iniciales, migraciones, etc.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/seed/modules:
 *   post:
 *     tags: [Admin]
 *     summary: Cargar módulos del sistema
 *     description: Ejecuta el script de seed de módulos (solo SUPER_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Módulos cargados exitosamente
 *       403:
 *         description: No autorizado (requiere rol SUPER_ADMIN)
 */
router.post('/seed/modules', 
  authenticateToken,
  async (req, res) => {
    try {
      // Verificar que sea SUPER_ADMIN o OWNER
      if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo SUPER_ADMIN u OWNER pueden ejecutar esta acción.'
        });
      }

      console.log('🔧 Ejecutando seed de módulos...');
      
      // Ejecutar script de módulos
      const seedModules = require('../../scripts/seed-modules');
      const result = await seedModules();

      res.json({
        success: true,
        message: 'Módulos cargados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error ejecutando seed de módulos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar módulos',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/seed/plans:
 *   post:
 *     tags: [Admin]
 *     summary: Cargar planes del sistema
 *     description: Ejecuta el script de seed de planes (solo SUPER_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Planes cargados exitosamente
 *       403:
 *         description: No autorizado (requiere rol SUPER_ADMIN)
 */
router.post('/seed/plans', 
  authenticateToken,
  async (req, res) => {
    try {
      // Verificar que sea SUPER_ADMIN o OWNER
      if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo SUPER_ADMIN u OWNER pueden ejecutar esta acción.'
        });
      }

      console.log('💳 Ejecutando seed de planes...');
      
      // Ejecutar script de planes
      const seedPlans = require('../../scripts/seed-plans');
      const result = await seedPlans();

      res.json({
        success: true,
        message: 'Planes cargados exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error ejecutando seed de planes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar planes',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/seed/rule-templates:
 *   post:
 *     tags: [Admin]
 *     summary: Cargar plantillas de reglas del sistema
 *     description: Ejecuta el script de seed de plantillas de reglas (solo SUPER_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plantillas de reglas cargadas exitosamente
 *       403:
 *         description: No autorizado (requiere rol SUPER_ADMIN)
 */
router.post('/seed/rule-templates', 
  authenticateToken,
  async (req, res) => {
    try {
      // Verificar que sea SUPER_ADMIN o OWNER
      if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo SUPER_ADMIN u OWNER pueden ejecutar esta acción.'
        });
      }

      console.log('📋 Ejecutando seed de plantillas de reglas...');
      
      // Ejecutar script de plantillas de reglas
      const seedRuleTemplates = require('../../scripts/seed-rule-templates');
      const result = await seedRuleTemplates();

      res.json({
        success: true,
        message: 'Plantillas de reglas cargadas exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ Error ejecutando seed de plantillas de reglas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar plantillas de reglas',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/seed/all:
 *   post:
 *     tags: [Admin]
 *     summary: Cargar todos los datos iniciales
 *     description: Ejecuta todos los scripts de seed en orden (solo SUPER_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los datos cargados exitosamente
 *       403:
 *         description: No autorizado (requiere rol SUPER_ADMIN)
 */
router.post('/seed/all', 
  authenticateToken,
  async (req, res) => {
    try {
      // Verificar que sea SUPER_ADMIN o OWNER
      if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo SUPER_ADMIN u OWNER pueden ejecutar esta acción.'
        });
      }

      console.log('🚀 Ejecutando seed completo del sistema...');
      
      const results = {
        modules: null,
        plans: null,
        ruleTemplates: null
      };

      // 1. Módulos primero
      console.log('1️⃣ Cargando módulos...');
      const seedModules = require('../../scripts/seed-modules');
      results.modules = await seedModules();

      // 2. Planes (dependen de módulos)
      console.log('2️⃣ Cargando planes...');
      const seedPlans = require('../../scripts/seed-plans');
      results.plans = await seedPlans();

      // 3. Plantillas de reglas
      console.log('3️⃣ Cargando plantillas de reglas...');
      const seedRuleTemplates = require('../../scripts/seed-rule-templates');
      results.ruleTemplates = await seedRuleTemplates();

      console.log('✅ Seed completo finalizado exitosamente');

      res.json({
        success: true,
        message: 'Todos los datos iniciales cargados exitosamente',
        data: results
      });
    } catch (error) {
      console.error('❌ Error ejecutando seed completo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar datos iniciales',
        error: error.message
      });
    }
  }
);

module.exports = router;
