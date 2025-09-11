const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Module = require('../models/Module');

/**
 * Rutas de Planes de Suscripción - Beauty Control
 * Obtener información de planes disponibles
 */

// Obtener todos los planes activos
router.get('/', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { status: 'ACTIVE' },
      include: [{
        model: Module,
        as: 'modules',
        through: { attributes: ['isIncluded', 'limitQuantity', 'additionalPrice'] }
      }],
      order: [['price', 'ASC']]
    });

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Obtener plan específico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id, {
      include: [{
        model: Module,
        as: 'modules',
        through: { attributes: ['isIncluded', 'limitQuantity', 'additionalPrice'] }
      }]
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    res.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Error obteniendo plan:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;