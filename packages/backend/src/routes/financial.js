const express = require('express');
const router = express.Router();
const FinancialMovementController = require('../controllers/FinancialMovementController');
const { authenticateToken } = require('../middleware/auth');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas financieras requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener resumen financiero
router.get('/summary', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de resumen financiero aún no implementada'
  });
});

// Obtener resumen de movimientos financieros
router.get('/movements/summary', FinancialMovementController.getMovementsSummary);

// Obtener movimientos financieros
router.get('/movements', FinancialMovementController.getMovements);

// Registrar movimiento financiero
router.post('/movements', async (req, res) => {
  try {
    const { 
      shiftId,
      type, 
      category, 
      amount, 
      paymentMethodId, 
      description, 
      referenceId, 
      referenceType,
      notes,
      transactionDate
    } = req.body;
    
    const userId = req.user.id;
    const businessId = req.user.businessId;
    
    // Validaciones básicas
    if (!type || !amount || !description) {
      return res.status(400).json({
        success: false,
        error: 'type, amount y description son requeridos'
      });
    }
    
    // Obtener información del método de pago si se proporcionó
    let paymentMethod = 'CASH'; // Default
    let paymentMethodData = null;
    
    if (paymentMethodId) {
      const PaymentMethod = require('../models/PaymentMethod');
      const foundMethod = await PaymentMethod.findOne({
        where: {
          id: paymentMethodId,
          businessId,
          isActive: true
        }
      });
      
      if (foundMethod) {
        paymentMethod = foundMethod.name; // Usar nombre personalizado
        paymentMethodData = {
          id: foundMethod.id,
          name: foundMethod.name,
          type: foundMethod.type
        };
      }
    }
    
    const FinancialMovement = require('../models/FinancialMovement');
    
    const movementData = {
      businessId,
      userId,
      type,
      category: category || 'GENERAL',
      amount: parseFloat(amount),
      description,
      paymentMethod,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
      notes: notes || null,
      transactionDate: transactionDate || new Date(),
      status: 'COMPLETED',
      metadata: {
        paymentMethodId: paymentMethodId || null,
        paymentMethodData: paymentMethodData,
        shiftId: shiftId || null,
        createdFrom: 'cash-register'
      }
    };
    
    const movement = await FinancialMovement.create(movementData);
    
    return res.json({
      success: true,
      data: movement
    });
    
  } catch (error) {
    console.error('Error registrando movimiento financiero:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al registrar movimiento financiero'
    });
  }
});

// Obtener reportes financieros
router.get('/reports', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de reportes financieros aún no implementada'
  });
});

// Obtener balance del negocio
router.get('/balance', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de balance del negocio aún no implementada'
  });
});

// Configurar integraciones de pago
router.get('/payment-integrations', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de integraciones de pago aún no implementada'
  });
});

router.post('/payment-integrations', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear integración de pago aún no implementada'
  });
});

module.exports = router;