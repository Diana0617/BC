const { 
  ConsentTemplate, 
  ConsentSignature, 
  Business, 
  Client,
  Service,
  Appointment,
  User
} = require('../models');
const { Op } = require('sequelize');

/**
 * @controller ConsentController
 * @description Gestión de plantillas de consentimiento y firmas
 */

/**
 * Listar plantillas de consentimiento
 * GET /api/business/:businessId/consent-templates
 */
exports.getTemplates = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { category, activeOnly, search } = req.query;

    const where = { businessId };

    if (category) {
      where.category = category;
    }

    if (activeOnly === 'true') {
      where.isActive = true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const templates = await ConsentTemplate.findAll({
      where,
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: templates,
      count: templates.length
    });

  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de consentimiento',
      error: error.message
    });
  }
};

/**
 * Obtener una plantilla específica
 * GET /api/business/:businessId/consent-templates/:templateId
 */
exports.getTemplate = async (req, res) => {
  try {
    const { businessId, templateId } = req.params;

    const template = await ConsentTemplate.findOne({
      where: { id: templateId, businessId },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'address', 'phone', 'email']
      }]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    return res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener plantilla',
      error: error.message
    });
  }
};

/**
 * Crear plantilla de consentimiento
 * POST /api/business/:businessId/consent-templates
 */
exports.createTemplate = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      name, 
      code, 
      content, 
      version, 
      editableFields, 
      pdfConfig, 
      category, 
      metadata 
    } = req.body;

    // Validaciones
    if (!name || !code || !content) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, código y contenido son requeridos'
      });
    }

    // Verificar si el código ya existe en este negocio
    const existing = await ConsentTemplate.findOne({
      where: { businessId, code }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una plantilla con el código "${code}" en este negocio`
      });
    }

    const template = await ConsentTemplate.create({
      businessId,
      name,
      code,
      content,
      version: version || '1.0.0',
      editableFields: editableFields || [],
      pdfConfig: pdfConfig || {},
      category,
      metadata: metadata || {},
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      data: template
    });

  } catch (error) {
    console.error('Error al crear plantilla:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear plantilla de consentimiento',
      error: error.message
    });
  }
};

/**
 * Actualizar plantilla de consentimiento
 * PUT /api/business/:businessId/consent-templates/:templateId
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { businessId, templateId } = req.params;
    const { 
      name, 
      code, 
      content, 
      version, 
      editableFields, 
      pdfConfig, 
      category, 
      isActive,
      metadata 
    } = req.body;

    const template = await ConsentTemplate.findOne({
      where: { id: templateId, businessId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Si el código cambió, verificar que no exista otro con ese código
    if (code && code !== template.code) {
      const existing = await ConsentTemplate.findOne({
        where: { 
          businessId, 
          code,
          id: { [Op.ne]: templateId }
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Ya existe otra plantilla con el código "${code}"`
        });
      }
    }

    // Si el contenido cambió, incrementar versión automáticamente
    let newVersion = version || template.version;
    if (content && content !== template.content) {
      const [major, minor, patch] = template.version.split('.').map(Number);
      newVersion = `${major}.${minor}.${patch + 1}`;
    }

    await template.update({
      name: name || template.name,
      code: code || template.code,
      content: content || template.content,
      version: newVersion,
      editableFields: editableFields !== undefined ? editableFields : template.editableFields,
      pdfConfig: pdfConfig !== undefined ? pdfConfig : template.pdfConfig,
      category: category || template.category,
      isActive: isActive !== undefined ? isActive : template.isActive,
      metadata: metadata !== undefined ? metadata : template.metadata
    });

    return res.json({
      success: true,
      message: 'Plantilla actualizada exitosamente',
      data: template
    });

  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar plantilla',
      error: error.message
    });
  }
};

/**
 * Eliminar (desactivar) plantilla de consentimiento
 * DELETE /api/business/:businessId/consent-templates/:templateId
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { businessId, templateId } = req.params;
    const { hardDelete } = req.query;

    const template = await ConsentTemplate.findOne({
      where: { id: templateId, businessId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada'
      });
    }

    // Verificar si tiene firmas asociadas
    const signaturesCount = await ConsentSignature.count({
      where: { consentTemplateId: templateId }
    });

    if (signaturesCount > 0 && hardDelete === 'true') {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar permanentemente. Esta plantilla tiene ${signaturesCount} firma(s) asociada(s).`
      });
    }

    if (hardDelete === 'true') {
      await template.destroy();
      return res.json({
        success: true,
        message: 'Plantilla eliminada permanentemente'
      });
    } else {
      // Soft delete
      await template.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Plantilla desactivada exitosamente'
      });
    }

  } catch (error) {
    console.error('Error al eliminar plantilla:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar plantilla',
      error: error.message
    });
  }
};

/**
 * Firmar consentimiento
 * POST /api/business/:businessId/consent-signatures
 */
exports.signConsent = async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      consentTemplateId,
      customerId,
      appointmentId,
      serviceId,
      editableFieldsData,
      signatureData,
      signatureType,
      signedBy,
      ipAddress,
      userAgent,
      location,
      device
    } = req.body;

    // Validaciones
    if (!consentTemplateId || !customerId || !signatureData || !signedBy) {
      return res.status(400).json({
        success: false,
        message: 'Template, cliente, firma y nombre del firmante son requeridos'
      });
    }

    // Verificar que la plantilla existe y está activa
    const template = await ConsentTemplate.findOne({
      where: { id: consentTemplateId, businessId, isActive: true }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Plantilla no encontrada o inactiva'
      });
    }

    // Verificar que el cliente existe
    const customer = await Client.findOne({
      where: { id: customerId, businessId }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Validar campos editables si existen
    if (template.editableFields && template.editableFields.length > 0) {
      const requiredFields = template.editableFields.filter(f => f.required);
      
      for (const field of requiredFields) {
        if (!editableFieldsData || !editableFieldsData[field.name]) {
          return res.status(400).json({
            success: false,
            message: `El campo "${field.label}" es requerido`
          });
        }
      }
    }

    // Reemplazar placeholders en el contenido
    let processedContent = template.content;

    // Placeholders del negocio
    const business = await Business.findByPk(businessId);
    if (business) {
      processedContent = processedContent
        .replace(/\{\{negocio_nombre\}\}/g, business.name || '')
        .replace(/\{\{negocio_direccion\}\}/g, business.address || '')
        .replace(/\{\{negocio_telefono\}\}/g, business.phone || '')
        .replace(/\{\{negocio_email\}\}/g, business.email || '');
    }

    // Placeholders del cliente
    processedContent = processedContent
      .replace(/\{\{cliente_nombre\}\}/g, customer.name || '')
      .replace(/\{\{cliente_email\}\}/g, customer.email || '')
      .replace(/\{\{cliente_telefono\}\}/g, customer.phone || '')
      .replace(/\{\{cliente_documento\}\}/g, customer.documentNumber || '')
      .replace(/\{\{cliente_fecha_nacimiento\}\}/g, customer.birthDate || '');

    // Placeholders del servicio
    if (serviceId) {
      const service = await Service.findByPk(serviceId);
      if (service) {
        processedContent = processedContent.replace(/\{\{servicio_nombre\}\}/g, service.name || '');
      }
    }

    // Placeholders de fecha
    const now = new Date();
    processedContent = processedContent
      .replace(/\{\{fecha_firma\}\}/g, now.toLocaleDateString('es-CO'))
      .replace(/\{\{fecha_cita\}\}/g, appointmentId ? 'Ver cita' : now.toLocaleDateString('es-CO'));

    // Crear firma
    const signature = await ConsentSignature.create({
      businessId,
      consentTemplateId,
      customerId,
      appointmentId,
      serviceId,
      templateVersion: template.version,
      templateContent: processedContent, // Snapshot con placeholders reemplazados
      signatureData,
      signatureType: signatureType || 'DIGITAL',
      signedAt: new Date(),
      signedBy,
      editableFieldsData: editableFieldsData || {},
      ipAddress,
      userAgent,
      location,
      device,
      status: 'ACTIVE'
    });

    return res.status(201).json({
      success: true,
      message: 'Consentimiento firmado exitosamente',
      data: signature
    });

  } catch (error) {
    console.error('Error al firmar consentimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al firmar consentimiento',
      error: error.message
    });
  }
};

/**
 * Obtener firmas de un cliente
 * GET /api/business/:businessId/consent-signatures/customer/:customerId
 */
exports.getCustomerSignatures = async (req, res) => {
  try {
    const { businessId, customerId } = req.params;
    const { status } = req.query;

    const where = { businessId, customerId };

    if (status) {
      where.status = status;
    }

    const signatures = await ConsentSignature.findAll({
      where,
      include: [
        {
          model: ConsentTemplate,
          as: 'template',
          attributes: ['id', 'name', 'code', 'category']
        },
        {
          model: Client,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'date', 'startTime', 'status']
        }
      ],
      order: [['signedAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: signatures,
      count: signatures.length
    });

  } catch (error) {
    console.error('Error al obtener firmas del cliente:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener firmas del cliente',
      error: error.message
    });
  }
};

/**
 * Obtener una firma específica
 * GET /api/business/:businessId/consent-signatures/:signatureId
 */
exports.getSignature = async (req, res) => {
  try {
    const { businessId, signatureId } = req.params;

    const signature = await ConsentSignature.findOne({
      where: { id: signatureId, businessId },
      include: [
        {
          model: ConsentTemplate,
          as: 'template',
          attributes: ['id', 'name', 'code', 'category', 'version']
        },
        {
          model: Client,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'documentNumber', 'birthDate']
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'date', 'startTime', 'status']
        },
        {
          model: User,
          as: 'revoker',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Firma no encontrada'
      });
    }

    return res.json({
      success: true,
      data: signature
    });

  } catch (error) {
    console.error('Error al obtener firma:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener firma',
      error: error.message
    });
  }
};

/**
 * Revocar una firma
 * POST /api/business/:businessId/consent-signatures/:signatureId/revoke
 */
exports.revokeSignature = async (req, res) => {
  try {
    const { businessId, signatureId } = req.params;
    const { reason, revokedBy } = req.body;
    const userId = req.user?.id; // Asumiendo que viene del middleware de autenticación

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar una razón para revocar la firma'
      });
    }

    const signature = await ConsentSignature.findOne({
      where: { id: signatureId, businessId }
    });

    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Firma no encontrada'
      });
    }

    if (signature.status === 'REVOKED') {
      return res.status(400).json({
        success: false,
        message: 'Esta firma ya ha sido revocada'
      });
    }

    await signature.update({
      status: 'REVOKED',
      revokedAt: new Date(),
      revokedReason: reason,
      revokedBy: revokedBy || userId
    });

    return res.json({
      success: true,
      message: 'Firma revocada exitosamente',
      data: signature
    });

  } catch (error) {
    console.error('Error al revocar firma:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al revocar firma',
      error: error.message
    });
  }
};

/**
 * Generar/obtener PDF de firma
 * GET /api/business/:businessId/consent-signatures/:signatureId/pdf
 * @TODO: Implementar generación real de PDF con PDFKit o pdfmake
 */
exports.getSignaturePDF = async (req, res) => {
  try {
    const { businessId, signatureId } = req.params;

    const signature = await ConsentSignature.findOne({
      where: { id: signatureId, businessId },
      include: [
        {
          model: ConsentTemplate,
          as: 'template'
        },
        {
          model: Client,
          as: 'customer'
        },
        {
          model: Business,
          as: 'business'
        }
      ]
    });

    if (!signature) {
      return res.status(404).json({
        success: false,
        message: 'Firma no encontrada'
      });
    }

    // Si ya existe el PDF, devolverlo
    if (signature.pdfUrl) {
      // @TODO: Implementar descarga del archivo desde storage
      return res.json({
        success: true,
        message: 'PDF ya generado',
        data: {
          pdfUrl: signature.pdfUrl,
          pdfGeneratedAt: signature.pdfGeneratedAt
        }
      });
    }

    // @TODO: Implementar generación de PDF
    // Por ahora, responder con placeholder
    return res.status(501).json({
      success: false,
      message: 'Generación de PDF pendiente de implementación',
      data: {
        templateContent: signature.templateContent,
        editableFieldsData: signature.editableFieldsData,
        signatureData: signature.signatureData
      }
    });

  } catch (error) {
    console.error('Error al obtener PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener PDF',
      error: error.message
    });
  }
};
