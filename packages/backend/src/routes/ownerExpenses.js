const express = require('express');
const router = express.Router();
const OwnerExpenseController = require('../controllers/OwnerExpenseController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const { uploadExpenseReceipt } = require('../middleware/uploadMiddleware');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * components:
 *   schemas:
 *     OwnerExpense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del gasto
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Descripción detallada del gasto
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           description: Monto del gasto
 *         currency:
 *           type: string
 *           maxLength: 3
 *           default: "COP"
 *           description: Moneda del gasto (ISO 4217)
 *         category:
 *           type: string
 *           enum: [INFRASTRUCTURE, MARKETING, PERSONNEL, OFFICE, TECHNOLOGY, LEGAL, TRAVEL, TRAINING, MAINTENANCE, UTILITIES, INSURANCE, TAXES, OTHER]
 *           description: Categoría del gasto
 *         subcategory:
 *           type: string
 *           maxLength: 100
 *           description: Subcategoría específica del gasto
 *         expenseDate:
 *           type: string
 *           format: date
 *           description: Fecha en que se realizó el gasto
 *         dueDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Fecha de vencimiento del pago
 *         vendor:
 *           type: string
 *           maxLength: 200
 *           description: Nombre del proveedor o empresa
 *         vendorTaxId:
 *           type: string
 *           maxLength: 50
 *           description: NIT o identificación tributaria del proveedor
 *         vendorEmail:
 *           type: string
 *           format: email
 *           maxLength: 100
 *           description: Email del proveedor
 *         receiptUrl:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           description: URL del comprobante en Cloudinary
 *         receiptType:
 *           type: string
 *           enum: [IMAGE, PDF, NONE]
 *           default: "NONE"
 *           description: Tipo de comprobante subido
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, REJECTED, PAID]
 *           default: "PENDING"
 *           description: Estado del gasto
 *         taxAmount:
 *           type: number
 *           format: decimal
 *           default: 0.00
 *           description: Monto de impuestos incluidos
 *         taxRate:
 *           type: number
 *           format: decimal
 *           default: 0.00
 *           description: Tasa de impuesto aplicada (%)
 *         isRecurring:
 *           type: boolean
 *           default: false
 *           description: Indica si es un gasto recurrente
 *         recurringFrequency:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, YEARLY]
 *           nullable: true
 *           description: Frecuencia del gasto recurrente
 *         notes:
 *           type: string
 *           description: Notas adicionales sobre el gasto
 *         internalReference:
 *           type: string
 *           maxLength: 100
 *           description: Referencia interna o número de orden
 *         projectCode:
 *           type: string
 *           maxLength: 50
 *           description: Código de proyecto asociado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       required:
 *         - description
 *         - amount
 *         - category
 *         - expenseDate
 *     
 *     ExpenseCategory:
 *       type: object
 *       properties:
 *         value:
 *           type: string
 *           description: Valor de la categoría
 *         label:
 *           type: string
 *           description: Etiqueta mostrada al usuario
 *         description:
 *           type: string
 *           description: Descripción de la categoría
 *     
 *     ExpenseStats:
 *       type: object
 *       properties:
 *         byStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               count:
 *                 type: integer
 *               total:
 *                 type: number
 *         byCategory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               count:
 *                 type: integer
 *               total:
 *                 type: number
 *         monthly:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *               count:
 *                 type: integer
 *               total:
 *                 type: number
 *         general:
 *           type: object
 *           properties:
 *             totalExpenses:
 *               type: integer
 *             totalAmount:
 *               type: number
 *             averageAmount:
 *               type: number
 */

/**
 * @swagger
 * /api/owner/expenses:
 *   post:
 *     tags:
 *       - Owner Expenses
 *     summary: Crear un nuevo gasto
 *     description: Crea un nuevo gasto del Owner con posibilidad de adjuntar comprobante (imagen o PDF) que se almacena en Cloudinary
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción detallada del gasto
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *                 description: Monto del gasto
 *               currency:
 *                 type: string
 *                 maxLength: 3
 *                 default: "COP"
 *                 description: Moneda del gasto
 *               category:
 *                 type: string
 *                 enum: [INFRASTRUCTURE, MARKETING, PERSONNEL, OFFICE, TECHNOLOGY, LEGAL, TRAVEL, TRAINING, MAINTENANCE, UTILITIES, INSURANCE, TAXES, OTHER]
 *                 description: Categoría del gasto
 *               subcategory:
 *                 type: string
 *                 maxLength: 100
 *                 description: Subcategoría específica del gasto
 *               expenseDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha en que se realizó el gasto
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento del pago (opcional)
 *               vendor:
 *                 type: string
 *                 maxLength: 200
 *                 description: Nombre del proveedor o empresa
 *               vendorTaxId:
 *                 type: string
 *                 maxLength: 50
 *                 description: NIT o identificación tributaria del proveedor
 *               vendorEmail:
 *                 type: string
 *                 format: email
 *                 description: Email del proveedor
 *               taxAmount:
 *                 type: number
 *                 format: decimal
 *                 default: 0.00
 *                 description: Monto de impuestos incluidos
 *               taxRate:
 *                 type: number
 *                 format: decimal
 *                 default: 0.00
 *                 description: Tasa de impuesto aplicada (%)
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *                 description: Indica si es un gasto recurrente
 *               recurringFrequency:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *                 description: Frecuencia del gasto recurrente
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre el gasto
 *               internalReference:
 *                 type: string
 *                 maxLength: 100
 *                 description: Referencia interna o número de orden
 *               projectCode:
 *                 type: string
 *                 maxLength: 50
 *                 description: Código de proyecto asociado
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de comprobante (imagen o PDF) - se sube a Cloudinary
 *             required:
 *               - description
 *               - amount
 *               - category
 *               - expenseDate
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
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
 *                   example: "Gasto creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
// Middleware condicional: si el Content-Type es multipart/form-data, usa multer; si es application/json, omite multer
router.post('/', (req, res, next) => {
	if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
		uploadExpenseReceipt(req, res, next);
	} else {
		next();
	}
}, OwnerExpenseController.createExpense);

/**
 * @swagger
 * /api/owner/expenses:
 *   get:
 *     tags:
 *       - Owner Expenses
 *     summary: Obtener lista de gastos con filtros
 *     description: Recupera una lista paginada de gastos del Owner con múltiples opciones de filtrado y ordenamiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [INFRASTRUCTURE, MARKETING, PERSONNEL, OFFICE, TECHNOLOGY, LEGAL, TRAVEL, TRAINING, MAINTENANCE, UTILITIES, INSURANCE, TAXES, OTHER]
 *         description: Filtrar por categoría de gasto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, REJECTED, PAID]
 *         description: Filtrar por estado del gasto
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del proveedor (búsqueda parcial)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para filtrar gastos
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para filtrar gastos
 *       - in: query
 *         name: isRecurring
 *         schema:
 *           type: boolean
 *         description: Filtrar por gastos recurrentes
 *       - in: query
 *         name: projectCode
 *         schema:
 *           type: string
 *         description: Filtrar por código de proyecto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [expenseDate, amount, category, status, vendor, createdAt]
 *           default: "expenseDate"
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: "DESC"
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de gastos obtenida exitosamente
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
 *                     expenses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OwnerExpense'
 *                     stats:
 *                       $ref: '#/components/schemas/ExpenseStats'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.get('/', OwnerExpenseController.getExpenses);

/**
 * @swagger
 * /api/owner/expenses/{id}:
 *   get:
 *     tags:
 *       - Owner Expenses
 *     summary: Obtener un gasto específico
 *     description: Recupera los detalles completos de un gasto específico incluyendo información del creador y aprobador
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     responses:
 *       200:
 *         description: Gasto encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
// Ruta de categorías debe ir antes de cualquier ruta con parámetro :id
router.get('/categories', OwnerExpenseController.getCategories);
router.get('/:id', OwnerExpenseController.getExpenseById);

/**
 * @swagger
 * /api/owner/expenses/{id}:
 *   put:
 *     tags:
 *       - Owner Expenses
 *     summary: Actualizar un gasto existente
 *     description: Actualiza la información de un gasto existente. Permite cambiar el comprobante adjunto. No se pueden editar gastos pagados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 maxLength: 3
 *               category:
 *                 type: string
 *                 enum: [INFRASTRUCTURE, MARKETING, PERSONNEL, OFFICE, TECHNOLOGY, LEGAL, TRAVEL, TRAINING, MAINTENANCE, UTILITIES, INSURANCE, TAXES, OTHER]
 *               subcategory:
 *                 type: string
 *                 maxLength: 100
 *               expenseDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               vendor:
 *                 type: string
 *                 maxLength: 200
 *               vendorTaxId:
 *                 type: string
 *                 maxLength: 50
 *               vendorEmail:
 *                 type: string
 *                 format: email
 *               taxAmount:
 *                 type: number
 *                 format: decimal
 *               taxRate:
 *                 type: number
 *                 format: decimal
 *               isRecurring:
 *                 type: boolean
 *               recurringFrequency:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, YEARLY]
 *               notes:
 *                 type: string
 *               internalReference:
 *                 type: string
 *                 maxLength: 100
 *               projectCode:
 *                 type: string
 *                 maxLength: 50
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de comprobante (reemplaza el anterior)
 *     responses:
 *       200:
 *         description: Gasto actualizado exitosamente
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
 *                   example: "Gasto actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       400:
 *         description: Datos inválidos o gasto no editable
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.put('/:id', uploadExpenseReceipt, OwnerExpenseController.updateExpense);

/**
 * @swagger
 * /api/owner/expenses/{id}:
 *   delete:
 *     tags:
 *       - Owner Expenses
 *     summary: Eliminar un gasto
 *     description: Realiza eliminación lógica de un gasto. No se pueden eliminar gastos pagados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     responses:
 *       200:
 *         description: Gasto eliminado exitosamente
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
 *                   example: "Gasto eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar este gasto
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.delete('/:id', OwnerExpenseController.deleteExpense);

/**
 * @swagger
 * /api/owner/expenses/{id}/approve:
 *   patch:
 *     tags:
 *       - Owner Expenses
 *     summary: Aprobar un gasto
 *     description: Cambia el estado de un gasto pendiente a aprobado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notas adicionales de aprobación
 *     responses:
 *       200:
 *         description: Gasto aprobado exitosamente
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
 *                   example: "Gasto aprobado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       400:
 *         description: Solo se pueden aprobar gastos pendientes
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.patch('/:id/approve', OwnerExpenseController.approveExpense);

/**
 * @swagger
 * /api/owner/expenses/{id}/reject:
 *   patch:
 *     tags:
 *       - Owner Expenses
 *     summary: Rechazar un gasto
 *     description: Cambia el estado de un gasto pendiente a rechazado con razón obligatoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: Razón del rechazo (obligatoria)
 *             required:
 *               - rejectionReason
 *     responses:
 *       200:
 *         description: Gasto rechazado exitosamente
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
 *                   example: "Gasto rechazado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       400:
 *         description: Razón de rechazo requerida o estado inválido
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.patch('/:id/reject', OwnerExpenseController.rejectExpense);

/**
 * @swagger
 * /api/owner/expenses/{id}/mark-paid:
 *   patch:
 *     tags:
 *       - Owner Expenses
 *     summary: Marcar gasto como pagado
 *     description: Cambia el estado de un gasto aprobado a pagado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentNotes:
 *                 type: string
 *                 description: Notas sobre el pago realizado
 *     responses:
 *       200:
 *         description: Gasto marcado como pagado exitosamente
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
 *                   example: "Gasto marcado como pagado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/OwnerExpense'
 *       400:
 *         description: Solo se pueden marcar como pagados los gastos aprobados
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.patch('/:id/mark-paid', OwnerExpenseController.markAsPaid);

/**
 * @swagger
 * /api/owner/expenses/{id}/receipt:
 *   delete:
 *     tags:
 *       - Owner Expenses
 *     summary: Eliminar comprobante de un gasto
 *     description: Elimina el comprobante adjunto de un gasto (tanto de Cloudinary como de la base de datos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del gasto
 *     responses:
 *       200:
 *         description: Comprobante eliminado exitosamente
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
 *                   example: "Comprobante eliminado exitosamente"
 *       400:
 *         description: Este gasto no tiene comprobante
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.delete('/:id/receipt', OwnerExpenseController.removeReceipt);

/**
 * @swagger
 * /api/owner/expenses/categories:
 *   get:
 *     tags:
 *       - Owner Expenses
 *     summary: Obtener categorías de gastos disponibles
 *     description: Recupera la lista de todas las categorías de gastos disponibles con sus descripciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExpenseCategory'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */

/**
 * @swagger
 * /api/owner/expenses/stats:
 *   get:
 *     tags:
 *       - Owner Expenses
 *     summary: Obtener estadísticas de gastos
 *     description: Recupera estadísticas detalladas de gastos incluyendo totales por estado, categoría, tendencias mensuales y resúmenes generales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Fecha de inicio para las estadísticas
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         description: Fecha de fin para las estadísticas
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [INFRASTRUCTURE, MARKETING, PERSONNEL, OFFICE, TECHNOLOGY, LEGAL, TRAVEL, TRAINING, MAINTENANCE, UTILITIES, INSURANCE, TAXES, OTHER]
 *         description: Filtrar estadísticas por categoría específica
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [thisMonth, lastMonth, thisYear]
 *           default: "thisMonth"
 *         description: Período predefinido para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExpenseStats'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - Solo para Owner
 */
router.get('/stats', OwnerExpenseController.getExpenseStats);

module.exports = router;