const express = require('express');
const router = express.Router();
const TestingController = require('../controllers/TestingController');

/**
 * @swagger
 * /api/testing/simulate-approved-payment/{transactionId}:
 *   post:
 *     summary: Simular pago aprobado y crear negocio (SOLO PARA TESTING)
 *     tags: [Testing]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción 3DS
 *     responses:
 *       200:
 *         description: Pago simulado como aprobado y negocio creado
 *       404:
 *         description: Transacción no encontrada
 *       400:
 *         description: Datos de registro no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.post('/simulate-approved-payment/:transactionId', TestingController.simulateApprovedPayment);
router.post('/create-business-direct', TestingController.createBusinessDirect);

module.exports = router;