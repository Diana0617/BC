const express = require('express');
const router = express.Router();
const OwnerFinancialReportController = require('../controllers/OwnerFinancialReportController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @route GET /api/owner/financial-reports
 * @desc Obtener todos los reportes financieros
 * @access Private (OWNER only)
 * @queryParams {string} reportType - Filtrar por tipo de reporte
 * @queryParams {string} startDate - Fecha inicio para filtrar
 * @queryParams {string} endDate - Fecha fin para filtrar
 * @queryParams {string} status - Filtrar por estado del reporte
 * @queryParams {number} page - Página (default: 1)
 * @queryParams {number} limit - Elementos por página (default: 20)
 */
router.get('/', OwnerFinancialReportController.getAllReports);

/**
 * @route GET /api/owner/financial-reports/executive-summary
 * @desc Obtener resumen ejecutivo de métricas actuales
 * @access Private (OWNER only)
 * @queryParams {string} period - Período del resumen (month, quarter, year)
 */
router.get('/executive-summary', OwnerFinancialReportController.getExecutiveSummary);

/**
 * @route GET /api/owner/financial-reports/:id
 * @desc Obtener un reporte específico por ID
 * @access Private (OWNER only)
 * @params {string} id - ID del reporte
 */
router.get('/:id', OwnerFinancialReportController.getReportById);

/**
 * @route POST /api/owner/financial-reports/generate
 * @desc Generar un nuevo reporte financiero
 * @access Private (OWNER only)
 * @bodyParams {string} reportType - Tipo de reporte (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM)
 * @bodyParams {string} startDate - Fecha de inicio del reporte
 * @bodyParams {string} endDate - Fecha de fin del reporte
 * @bodyParams {string} currency - Moneda del reporte (default: COP)
 */
router.post('/generate', OwnerFinancialReportController.generateReport);

/**
 * @route DELETE /api/owner/financial-reports/:id
 * @desc Eliminar un reporte financiero
 * @access Private (OWNER only)
 * @params {string} id - ID del reporte
 */
router.delete('/:id', OwnerFinancialReportController.deleteReport);

module.exports = router;