const express = require('express');
const router = express.Router({ mergeParams: true });
const consentController = require('../controllers/consentController');
// const { authenticate } = require('../middleware/auth'); // Descomentar cuando esté listo

/**
 * @route Consent Routes
 * @baseURL /api/business/:businessId
 */

// ================== PLANTILLAS DE CONSENTIMIENTO ==================

/**
 * Listar plantillas de consentimiento
 * GET /api/business/:businessId/consent-templates
 * Query params: category, activeOnly, search
 */
router.get(
  '/consent-templates',
  // authenticate,
  consentController.getTemplates
);

/**
 * Obtener una plantilla específica
 * GET /api/business/:businessId/consent-templates/:templateId
 */
router.get(
  '/consent-templates/:templateId',
  // authenticate,
  consentController.getTemplate
);

/**
 * Crear plantilla de consentimiento
 * POST /api/business/:businessId/consent-templates
 * Body: { name, code, content, version?, editableFields?, pdfConfig?, category?, metadata? }
 */
router.post(
  '/consent-templates',
  // authenticate,
  consentController.createTemplate
);

/**
 * Actualizar plantilla de consentimiento
 * PUT /api/business/:businessId/consent-templates/:templateId
 * Body: { name?, code?, content?, version?, editableFields?, pdfConfig?, category?, isActive?, metadata? }
 */
router.put(
  '/consent-templates/:templateId',
  // authenticate,
  consentController.updateTemplate
);

/**
 * Eliminar (desactivar) plantilla de consentimiento
 * DELETE /api/business/:businessId/consent-templates/:templateId
 * Query params: hardDelete (true para eliminar permanentemente)
 */
router.delete(
  '/consent-templates/:templateId',
  // authenticate,
  consentController.deleteTemplate
);

// ================== FIRMAS DE CONSENTIMIENTO ==================

/**
 * Firmar consentimiento
 * POST /api/business/:businessId/consent-signatures
 * Body: {
 *   consentTemplateId, customerId, appointmentId?, serviceId?,
 *   editableFieldsData, signatureData, signatureType?, signedBy,
 *   ipAddress?, userAgent?, location?, device?
 * }
 */
router.post(
  '/consent-signatures',
  // authenticate, // Podría ser público para que clientes firmen desde webapp
  consentController.signConsent
);

/**
 * Obtener firmas de un cliente
 * GET /api/business/:businessId/consent-signatures/customer/:customerId
 * Query params: status (ACTIVE, REVOKED, EXPIRED)
 */
router.get(
  '/consent-signatures/customer/:customerId',
  // authenticate,
  consentController.getCustomerSignatures
);

/**
 * Obtener una firma específica
 * GET /api/business/:businessId/consent-signatures/:signatureId
 */
router.get(
  '/consent-signatures/:signatureId',
  // authenticate,
  consentController.getSignature
);

/**
 * Revocar una firma
 * POST /api/business/:businessId/consent-signatures/:signatureId/revoke
 * Body: { reason, revokedBy? }
 */
router.post(
  '/consent-signatures/:signatureId/revoke',
  // authenticate,
  consentController.revokeSignature
);

/**
 * Generar/obtener PDF de firma
 * GET /api/business/:businessId/consent-signatures/:signatureId/pdf
 */
router.get(
  '/consent-signatures/:signatureId/pdf',
  // authenticate,
  consentController.getSignaturePDF
);

module.exports = router;
