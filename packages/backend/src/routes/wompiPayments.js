/**
 * Rutas para integración con Wompi
 * Maneja pagos de suscripciones a través de Wompi
 */

const express = require('express');
const router = express.Router();
const WompiPaymentController = require('../controllers/WompiPaymentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Wompi Payments
 *     description: Integración con Wompi para procesamiento de pagos de suscripciones
 */

/**
 * @swagger
 * /api/wompi/initiate-subscription-payment:
 *   post:
 *     tags:
 *       - Wompi Payments
 *     summary: Iniciar proceso de pago de suscripción con Wompi
 *     description: Crea una transacción de pago en Wompi para que el negocio pueda pagar su suscripción a Beauty Control
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del plan de suscripción a pagar
 *                 example: "plan_001"
 *           example:
 *             planId: "plan_001"
 *     responses:
 *       200:
 *         description: Transacción de pago creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transacción de pago creada. Proceda a completar el pago."
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentReference:
 *                       type: string
 *                       description: Referencia única del pago en Wompi
 *                       example: "BC_PAY_20240120_001"
 *                     amount:
 *                       type: number
 *                       description: Monto a pagar en centavos (COP)
 *                       example: 4999000
 *                     publicKey:
 *                       type: string
 *                       description: Clave pública de Wompi para el frontend
 *                       example: "pub_test_xxxxxxxxxxxxx"
 *                     redirectUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL de redirección después del pago
 *                       example: "https://beautycontrol.com/payment/success"
 *                     planName:
 *                       type: string
 *                       description: Nombre del plan seleccionado
 *                       example: "Plan Pro"
 *             example:
 *               success: true
 *               message: "Transacción de pago creada. Proceda a completar el pago."
 *               data:
 *                 paymentReference: "BC_PAY_20240120_001"
 *                 amount: 4999000
 *                 publicKey: "pub_test_xxxxxxxxxxxxx"
 *                 redirectUrl: "https://beautycontrol.com/payment/success"
 *                 planName: "Plan Pro"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_plan:
 *                 summary: Plan ID faltante
 *                 value:
 *                   success: false
 *                   message: "ID del plan es requerido"
 *               invalid_plan:
 *                 summary: Plan no encontrado
 *                 value:
 *                   success: false
 *                   message: "Plan de suscripción no encontrado"
 *       409:
 *         description: Conflicto - suscripción existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya tienes una suscripción activa. No puedes crear otra."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Rutas protegidas que requieren autenticación
router.post('/initiate-subscription-payment', 
  authenticateToken, 
  WompiPaymentController.initiateSubscriptionPayment
);

/**
 * @swagger
 * /api/wompi/payment-status/{reference}:
 *   get:
 *     tags:
 *       - Wompi Payments
 *     summary: Verificar estado de un pago específico
 *     description: Consulta el estado actual de un pago en Wompi usando la referencia del pago, y actualiza el estado local si es necesario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Referencia única del pago en Wompi
 *         example: "BC_PAY_20240120_001"
 *     responses:
 *       200:
 *         description: Estado del pago obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       description: Referencia del pago
 *                       example: "BC_PAY_20240120_001"
 *                     status:
 *                       type: string
 *                       enum: [PENDING, APPROVED, DECLINED, VOIDED, ERROR]
 *                       description: Estado actual del pago
 *                       example: "APPROVED"
 *                     amount:
 *                       type: number
 *                       description: Monto del pago en centavos
 *                       example: 4999000
 *                     paymentDate:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de procesamiento del pago
 *                       example: "2024-01-20T14:30:00Z"
 *                     paymentMethod:
 *                       type: string
 *                       description: Método de pago utilizado
 *                       example: "CREDIT_CARD"
 *             example:
 *               success: true
 *               data:
 *                 reference: "BC_PAY_20240120_001"
 *                 status: "APPROVED"
 *                 amount: 4999000
 *                 paymentDate: "2024-01-20T14:30:00Z"
 *                 paymentMethod: "CREDIT_CARD"
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Pago no encontrado"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.get('/payment-status/:reference', 
  authenticateToken, 
  WompiPaymentController.checkPaymentStatus
);

/**
 * @swagger
 * /api/wompi/config:
 *   get:
 *     tags:
 *       - Wompi Payments
 *     summary: Obtener configuración pública de Wompi
 *     description: Proporciona la configuración necesaria para integrar Wompi en el frontend (clave pública, moneda, entorno). Endpoint público que no requiere autenticación.
 *     responses:
 *       200:
 *         description: Configuración de Wompi obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicKey:
 *                       type: string
 *                       description: Clave pública de Wompi para usar en el frontend
 *                       example: "pub_test_xxxxxxxxxxxxx"
 *                     currency:
 *                       type: string
 *                       description: Moneda utilizada para los pagos
 *                       example: "COP"
 *                     environment:
 *                       type: string
 *                       enum: [sandbox, production]
 *                       description: Entorno de Wompi (sandbox para pruebas, production para pagos reales)
 *                       example: "sandbox"
 *             example:
 *               success: true
 *               data:
 *                 publicKey: "pub_test_xxxxxxxxxxxxx"
 *                 currency: "COP"
 *                 environment: "sandbox"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

router.get('/config', 
  WompiPaymentController.getWompiConfig
);

/**
 * @swagger
 * /api/wompi/generate-signature:
 *   post:
 *     tags:
 *       - Wompi Payments
 *     summary: Generar firma de integridad para Wompi Widget
 *     description: Genera la firma SHA256 requerida por Wompi para validar la integridad de las transacciones. Este endpoint es público para permitir la integración del widget.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *               - amountInCents
 *               - currency
 *             properties:
 *               reference:
 *                 type: string
 *                 description: Referencia única de la transacción
 *                 example: "BC_1234567890_plan_001"
 *               amountInCents:
 *                 type: integer
 *                 description: Monto en centavos
 *                 example: 4950000
 *               currency:
 *                 type: string
 *                 description: Moneda de la transacción
 *                 example: "COP"
 *     responses:
 *       200:
 *         description: Firma generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 signature:
 *                   type: string
 *                   example: "37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5"
 *       400:
 *         description: Parámetros faltantes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/generate-signature', 
  WompiPaymentController.generateSignature
);

/**
 * @swagger
 * /api/wompi/webhook:
 *   post:
 *     tags:
 *       - Wompi Payments
 *     summary: Webhook para notificaciones de Wompi
 *     description: Endpoint público que recibe notificaciones automáticas de Wompi sobre cambios en el estado de las transacciones. No requiere autenticación ya que viene directamente de Wompi.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Tipo de evento de Wompi
 *                 example: "transaction.updated"
 *               data:
 *                 type: object
 *                 description: Datos de la transacción
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID de la transacción en Wompi
 *                     example: "54321-1579024991-12345"
 *                   reference:
 *                     type: string
 *                     description: Referencia de la transacción
 *                     example: "BC_PAY_20240120_001"
 *                   status:
 *                     type: string
 *                     enum: [PENDING, APPROVED, DECLINED, VOIDED, ERROR]
 *                     description: Nuevo estado de la transacción
 *                     example: "APPROVED"
 *                   amount_in_cents:
 *                     type: integer
 *                     description: Monto en centavos
 *                     example: 4999000
 *                   currency:
 *                     type: string
 *                     description: Moneda de la transacción
 *                     example: "COP"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                     example: "2024-01-20T14:30:00Z"
 *                   finalized_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de finalización
 *                     example: "2024-01-20T14:35:00Z"
 *                   payment_method:
 *                     type: object
 *                     description: Información del método de pago
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "CREDIT_CARD"
 *                       extra:
 *                         type: object
 *                         properties:
 *                           last_four:
 *                             type: string
 *                             example: "1234"
 *                           brand:
 *                             type: string
 *                             example: "VISA"
 *           example:
 *             event: "transaction.updated"
 *             data:
 *               id: "54321-1579024991-12345"
 *               reference: "BC_PAY_20240120_001"
 *               status: "APPROVED"
 *               amount_in_cents: 4999000
 *               currency: "COP"
 *               created_at: "2024-01-20T14:30:00Z"
 *               finalized_at: "2024-01-20T14:35:00Z"
 *               payment_method:
 *                 type: "CREDIT_CARD"
 *                 extra:
 *                   last_four: "1234"
 *                   brand: "VISA"
 *     parameters:
 *       - in: header
 *         name: x-wompi-signature
 *         schema:
 *           type: string
 *         description: Firma digital de Wompi para verificar la autenticidad del webhook
 *         example: "fb4f25c81b6e2d7c8c9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook procesado"
 *                 data:
 *                   type: object
 *                   description: Resultado del procesamiento
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       description: ID de la transacción procesada
 *                       example: "54321-1579024991-12345"
 *                     subscriptionUpdated:
 *                       type: boolean
 *                       description: Si se actualizó la suscripción
 *                       example: true
 *                     newStatus:
 *                       type: string
 *                       description: Nuevo estado de la suscripción
 *                       example: "ACTIVE"
 *             examples:
 *               success_processing:
 *                 summary: Procesamiento exitoso
 *                 value:
 *                   success: true
 *                   message: "Webhook procesado"
 *                   data:
 *                     transactionId: "54321-1579024991-12345"
 *                     subscriptionUpdated: true
 *                     newStatus: "ACTIVE"
 *               unhandled_event:
 *                 summary: Evento no manejado
 *                 value:
 *                   success: true
 *                   message: "Evento no manejado"
 *       401:
 *         description: Firma inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Firma inválida"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Webhook público (sin autenticación porque viene de Wompi)
router.post('/webhook', WompiPaymentController.handleWebhook);

/**
 * @swagger
 * /api/wompi/transaction/{transactionId}:
 *   get:
 *     tags:
 *       - Wompi Payments
 *     summary: Consultar estado de transacción
 *     description: Consulta el estado actual de una transacción específica en Wompi usando su ID. Este endpoint es público para permitir la verificación del estado del pago desde el frontend.
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la transacción en Wompi
 *         example: "01-1531231271-19365"
 *     responses:
 *       200:
 *         description: Estado de la transacción obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "01-1531231271-19365"
 *                     status:
 *                       type: string
 *                       enum: [APPROVED, DECLINED, PENDING, VOIDED]
 *                       example: "APPROVED"
 *                     reference:
 *                       type: string
 *                       example: "BC_1758121095353_xbcr8njdb"
 *                     amount_in_cents:
 *                       type: integer
 *                       example: 8990000
 *                     currency:
 *                       type: string
 *                       example: "COP"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-09T20:28:50.000Z"
 *       400:
 *         description: ID de transacción requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "ID de transacción requerido"
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error consultando transacción: Not Found"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Endpoint público para consultar transacciones (sin autenticación)
router.get('/transaction/:transactionId', WompiPaymentController.getTransactionStatus);

/**
 * @swagger
 * /api/wompi/confirm-payment/{transactionId}:
 *   post:
 *     summary: Confirmar pago manualmente
 *     description: Confirma un pago consultando el estado en Wompi y procesando el resultado
 *     tags: [Wompi Payments]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción en Wompi
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 transaction:
 *                   type: object
 *                 processResult:
 *                   type: object
 */
router.post('/confirm-payment/:transactionId', WompiPaymentController.confirmPayment);

/**
 * @swagger
 * /api/wompi/transaction-by-reference/{reference}:
 *   get:
 *     summary: Obtener transacción por referencia
 *     description: Busca una transacción de Wompi usando la referencia de pago (público, sin autenticación)
 *     tags: [Wompi Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Referencia del pago
 *         example: "BC_1758212258747_fmgtaski3"
 *     responses:
 *       200:
 *         description: Transacción encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "158187-1758212316-76838"
 *                     status:
 *                       type: string
 *                       enum: [APPROVED, DECLINED, PENDING, VOIDED]
 *                       example: "APPROVED"
 *                     reference:
 *                       type: string
 *                       example: "BC_1758212258747_fmgtaski3"
 *                     amount_in_cents:
 *                       type: integer
 *                       example: 8990000
 *                     currency:
 *                       type: string
 *                       example: "COP"
 *       404:
 *         description: Transacción no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint público para buscar transacción por referencia (sin autenticación)
router.get('/transaction-by-reference/:reference', WompiPaymentController.getTransactionByReference);

/**
 * @swagger
 * /api/wompi/renew-subscription:
 *   post:
 *     tags:
 *       - Wompi Payments
 *     summary: Renovar suscripción expirada (pago simulado 3DS)
 *     description: Permite a un negocio con suscripción expirada renovarla usando pago simulado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - planId
 *               - amount
 *             properties:
 *               businessId:
 *                 type: string
 *                 format: uuid
 *               planId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *               billingCycle:
 *                 type: string
 *                 enum: [MONTHLY, YEARLY]
 *     responses:
 *       200:
 *         description: Renovación procesada exitosamente
 *       403:
 *         description: No autorizado
 */
router.post('/renew-subscription', authenticateToken, async (req, res) => {
  try {
    const { businessId, planId, amount, billingCycle } = req.body;
    
    console.log('🔍 Validación de renovación:', {
      'req.user.businessId': req.user.businessId,
      'body.businessId': businessId,
      'req.user.role': req.user.role,
      'iguales': req.user.businessId === businessId,
      'esOwner': req.user.role === 'OWNER'
    });
    
    // Verificar que el usuario pertenece al negocio
    if (req.user.businessId !== businessId && req.user.role !== 'OWNER') {
      console.log('❌ Validación falló - rechazando renovación');
      return res.status(403).json({
        success: false,
        error: 'No autorizado para renovar esta suscripción'
      });
    }

    console.log('🔄 Procesando renovación para:', {
      businessId,
      planId,
      amount,
      billingCycle,
      userId: req.user.id
    });

    // Buscar el business y el plan
    const { Business, SubscriptionPlan, BusinessSubscription, SubscriptionPayment } = require('../models');
    const DataRetentionService = require('../services/DataRetentionService');

    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Negocio no encontrado'
      });
    }

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    // Simular transacción aprobada (como en 3DS testing)
    const transactionId = `sim-${Date.now()}`;
    const reference = `RENEWAL-${businessId}-${Date.now()}`;

    // Cancelar todas las suscripciones anteriores del negocio (excepto la que vamos a renovar)
    await BusinessSubscription.update(
      { 
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: 'Renovación con nuevo plan'
      },
      {
        where: {
          businessId: businessId,
          subscriptionPlanId: { [require('sequelize').Op.ne]: plan.id }, // No cancelar el plan que estamos renovando
          status: { [require('sequelize').Op.notIn]: ['CANCELED'] } // No re-cancelar las ya canceladas
        }
      }
    );
    console.log('🗑️ Suscripciones de otros planes canceladas');

    // Buscar suscripción existente para este negocio y plan (sin importar status)
    let subscription = await BusinessSubscription.findOne({
      where: {
        businessId: businessId,
        subscriptionPlanId: plan.id
      },
      order: [['updatedAt', 'DESC']] // La más reciente
    });

    if (subscription) {
      // Actualizar suscripción existente
      const newEndDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 días
      await subscription.update({
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: newEndDate,
        autoRenewal: true,
        billingCycle: billingCycle || 'MONTHLY',
        amount: parseFloat(amount),
        currency: 'COP',
        paymentStatus: 'PAID',
        lastPaymentDate: new Date(),
        nextPaymentDate: newEndDate,
        canceledAt: null,
        cancelReason: null
      });
      console.log('📝 Suscripción existente reactivada:', subscription.id);
    } else {
      // Crear nueva suscripción
      const newEndDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 días
      subscription = await BusinessSubscription.create({
        businessId: businessId,
        subscriptionPlanId: plan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: newEndDate,
        autoRenewal: true,
        billingCycle: billingCycle || 'MONTHLY',
        amount: parseFloat(amount),
        currency: 'COP',
        paymentStatus: 'PAID',
        lastPaymentDate: new Date(),
        nextPaymentDate: newEndDate // Próximo pago en 30 días
      });
      console.log('🆕 Nueva suscripción creada:', subscription.id);
    }

    // Crear SubscriptionPayment
    const payment = await SubscriptionPayment.create({
      subscriptionId: subscription.id,
      businessId: businessId,
      amount: parseFloat(amount),
      currency: 'COP',
      status: 'APPROVED',
      paymentMethod: 'WOMPI_CARD',
      wompiTransactionId: transactionId,
      wompiReference: reference,
      paidAt: new Date(),
      dueDate: new Date(), // Fecha de vencimiento = hoy (pago inmediato)
      netAmount: parseFloat(amount), // Sin comisiones en simulación
      commissionFee: 0,
      description: `Renovación suscripción - Plan ${plan.name}`
    });

    // IMPORTANTE: Limpiar fecha de retención de datos (renovación)
    await DataRetentionService.clearRetentionDate(businessId);
    
    // Actualizar status del business a ACTIVE
    await business.update({ 
      status: 'ACTIVE',
      currentPlanId: plan.id
    });

    console.log('✅ Suscripción renovada exitosamente:', subscription.id);
    console.log('🔓 Retención de datos limpiada - Datos restaurados');

    console.log('✅ Suscripción renovada exitosamente:', subscription.id);
    console.log('🔓 Retención de datos limpiada - Datos restaurados');

    res.json({
      success: true,
      data: {
        transactionId: transactionId,
        reference: reference,
        status: 'APPROVED',
        subscription: {
          id: subscription.id,
          planId: plan.id,
          planName: plan.name,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate
        },
        message: 'Renovación procesada exitosamente'
      }
    });

  } catch (error) {
    console.error('❌ Error en renovación:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error procesando renovación'
    });
  }
});

module.exports = router;