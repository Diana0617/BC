const express = require('express');
const router = express.Router({ mergeParams: true });
const BusinessExpenseController = require('../controllers/BusinessExpenseController');
const { authenticateToken } = require('../middleware/auth');
const tenancyMiddleware = require('../middleware/tenancy');
const { uploadExpenseReceipt } = require('../middleware/uploadMiddleware');

// Middleware: autenticación y tenancy
router.use(authenticateToken);
router.use(tenancyMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     BusinessExpenseCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Arriendo"
 *         description:
 *           type: string
 *           example: "Pago de arriendo del local"
 *         color:
 *           type: string
 *           example: "#EF4444"
 *         icon:
 *           type: string
 *           example: "home"
 *         requiresReceipt:
 *           type: boolean
 *           example: true
 *         isRecurring:
 *           type: boolean
 *           example: true
 *         defaultAmount:
 *           type: number
 *           example: 1500000
 * 
 *     BusinessExpense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         categoryId:
 *           type: string
 *           format: uuid
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *           default: "COP"
 *         expenseDate:
 *           type: string
 *           format: date
 *         vendor:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, PAID, REJECTED, CANCELLED]
 *         receiptUrl:
 *           type: string
 */

// ==================== CATEGORÍAS ====================

/**
 * @swagger
 * /api/business/expenses/categories:
 *   get:
 *     tags: [Business Expenses]
 *     summary: Obtener categorías de gastos del negocio
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/categories', BusinessExpenseController.getCategories);

/**
 * @swagger
 * /api/business/expenses/categories:
 *   post:
 *     tags: [Business Expenses]
 *     summary: Crear nueva categoría de gasto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               requiresReceipt:
 *                 type: boolean
 *               isRecurring:
 *                 type: boolean
 *               defaultAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/categories', BusinessExpenseController.createCategory);

/**
 * @swagger
 * /api/business/expenses/categories/{id}:
 *   put:
 *     tags: [Business Expenses]
 *     summary: Actualizar categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/categories/:id', BusinessExpenseController.updateCategory);

/**
 * @swagger
 * /api/business/expenses/categories/{id}:
 *   delete:
 *     tags: [Business Expenses]
 *     summary: Eliminar categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.delete('/categories/:id', BusinessExpenseController.deleteCategory);

// ==================== GASTOS ====================

/**
 * @swagger
 * /api/business/expenses/stats:
 *   get:
 *     tags: [Business Expenses]
 *     summary: Obtener estadísticas de gastos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas de gastos
 */
router.get('/stats', BusinessExpenseController.getStats);

/**
 * @swagger
 * /api/business/expenses:
 *   get:
 *     tags: [Business Expenses]
 *     summary: Obtener lista de gastos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de gastos con paginación y estadísticas
 */
router.get('/', BusinessExpenseController.getExpenses);

/**
 * @swagger
 * /api/business/expenses:
 *   post:
 *     tags: [Business Expenses]
 *     summary: Crear nuevo gasto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - description
 *               - amount
 *               - expenseDate
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *               vendorTaxId:
 *                 type: string
 *               vendorPhone:
 *                 type: string
 *               vendorEmail:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, CHECK, DIGITAL_WALLET, OTHER]
 *               transactionReference:
 *                 type: string
 *               taxAmount:
 *                 type: number
 *               taxRate:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Comprobante de pago (imagen o PDF)
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 */
router.post('/', uploadExpenseReceipt, BusinessExpenseController.createExpense);

/**
 * @swagger
 * /api/business/expenses/{id}:
 *   get:
 *     tags: [Business Expenses]
 *     summary: Obtener gasto específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del gasto
 */
router.get('/:id', BusinessExpenseController.getExpenseById);

/**
 * @swagger
 * /api/business/expenses/{id}:
 *   put:
 *     tags: [Business Expenses]
 *     summary: Actualizar gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               vendor:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Gasto actualizado
 */
router.put('/:id', uploadExpenseReceipt, BusinessExpenseController.updateExpense);

/**
 * @swagger
 * /api/business/expenses/{id}:
 *   delete:
 *     tags: [Business Expenses]
 *     summary: Eliminar gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gasto eliminado
 */
router.delete('/:id', BusinessExpenseController.deleteExpense);

/**
 * @swagger
 * /api/business/expenses/{id}/approve:
 *   patch:
 *     tags: [Business Expenses]
 *     summary: Aprobar gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasto aprobado
 */
router.patch('/:id/approve', BusinessExpenseController.approveExpense);

/**
 * @swagger
 * /api/business/expenses/{id}/mark-paid:
 *   patch:
 *     tags: [Business Expenses]
 *     summary: Marcar gasto como pagado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paidDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               transactionReference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasto marcado como pagado
 */
router.patch('/:id/mark-paid', BusinessExpenseController.markAsPaid);

module.exports = router;
