const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const seedModules = require('../../scripts/seed-modules');
const seedPlans = require('../../scripts/seed-plans');
const seedRuleTemplates = require('../../scripts/seed-rule-templates');

/**
 * Endpoint protegido para ejecutar seeding en producción
 * Solo accesible por OWNER con clave secreta
 */

// Middleware de verificación de clave secreta
const verifySecretKey = (req, res, next) => {
  const secretKey = req.headers['x-seed-secret'];
  const expectedKey = process.env.SEED_SECRET_KEY;

  if (!expectedKey) {
    return res.status(503).json({
      success: false,
      error: 'Seeding no configurado en este entorno'
    });
  }

  if (secretKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Clave de seeding inválida'
    });
  }

  next();
};

/**
 * POST /api/seed/modules
 * Ejecuta el seeding de módulos
 */
router.post('/modules', authenticate, verifySecretKey, async (req, res) => {
  try {
    // Solo OWNER puede ejecutar seeding
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: 'Solo el OWNER puede ejecutar seeding'
      });
    }

    console.log(`🔒 Seeding de módulos iniciado por usuario: ${req.user.email}`);
    
    const result = await seedModules(false); // No cerrar conexión
    
    res.json({
      success: true,
      message: 'Seeding de módulos completado',
      data: result
    });

  } catch (error) {
    console.error('Error en seeding de módulos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seed/plans
 * Ejecuta el seeding de planes
 */
router.post('/plans', authenticate, verifySecretKey, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: 'Solo el OWNER puede ejecutar seeding'
      });
    }

    console.log(`🔒 Seeding de planes iniciado por usuario: ${req.user.email}`);
    
    const result = await seedPlans(false);
    
    res.json({
      success: true,
      message: 'Seeding de planes completado',
      data: result
    });

  } catch (error) {
    console.error('Error en seeding de planes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seed/rules
 * Ejecuta el seeding de plantillas de reglas
 */
router.post('/rules', authenticate, verifySecretKey, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: 'Solo el OWNER puede ejecutar seeding'
      });
    }

    console.log(`🔒 Seeding de reglas iniciado por usuario: ${req.user.email}`);
    
    const result = await seedRuleTemplates(false);
    
    res.json({
      success: true,
      message: 'Seeding de reglas completado',
      data: result
    });

  } catch (error) {
    console.error('Error en seeding de reglas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seed/all
 * Ejecuta todos los seedings en orden
 */
router.post('/all', authenticate, verifySecretKey, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        error: 'Solo el OWNER puede ejecutar seeding'
      });
    }

    console.log(`🔒 Seeding completo iniciado por usuario: ${req.user.email}`);
    
    const results = {
      modules: null,
      plans: null,
      rules: null
    };

    // Ejecutar en orden: módulos → planes → reglas
    results.modules = await seedModules(false);
    results.plans = await seedPlans(false);
    results.rules = await seedRuleTemplates(false);
    
    res.json({
      success: true,
      message: 'Seeding completo ejecutado exitosamente',
      data: results
    });

  } catch (error) {
    console.error('Error en seeding completo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
