/**
 * Rutas para manejo de pagos con 3D Secure v2 y pagos recurrentes
 * 
 * Endpoints v2:
 * - POST /create - Crear transacción 3DS v2 con browser info
 * - GET /status/:transactionId - Consultar estado de transacción 3DS v2
 * - POST /complete/:transactionId - Finalizar proceso 3DS después del challenge
 * - POST /renewal/:businessSubscriptionId - Procesar renovación con 3RI
 * - GET /payment-methods - Listar métodos de pago guardados
 * - PUT /disable-renewal/:paymentId - Deshabilitar auto-renovación
 * - GET /stats - Estadísticas de pagos 3DS
 */

const express = require('express');
const router = express.Router();
const Payment3DSController = require('../controllers/Payment3DSController');
const { authenticateToken } = require('../middleware/auth');

// Middleware para todas las rutas - solo usuarios autenticados
router.use(authenticateToken);

// POST /create - Crear transacción 3DS v2 con browser info
router.post('/create', Payment3DSController.create3DSPayment);

// GET /status/:transactionId - Consultar estado de transacción 3DS v2
router.get('/status/:transactionId', Payment3DSController.get3DSTransactionStatus);

// GET /stats - Obtener estadísticas de pagos 3DS
router.get('/stats', Payment3DSController.getPaymentStats);

module.exports = router;