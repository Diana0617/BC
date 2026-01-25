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
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadConsentDocument } = require('../config/cloudinary');

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
    const clientFullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    const clientAge = customer.dateOfBirth ? Math.floor((Date.now() - new Date(customer.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)) : '';
    const clientDocumentType = customer.documentType ? customer.documentType : '';
    const clientDocumentFull = customer.documentType && customer.documentNumber 
      ? `${customer.documentType}: ${customer.documentNumber}` 
      : customer.documentNumber || '';
    const clientDateOfBirth = customer.dateOfBirth 
      ? new Date(customer.dateOfBirth).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';

    processedContent = processedContent
      .replace(/\{\{cliente_nombre_completo\}\}/g, clientFullName)
      .replace(/\{\{cliente_nombre\}\}/g, customer.firstName || '')
      .replace(/\{\{cliente_apellido\}\}/g, customer.lastName || '')
      .replace(/\{\{cliente_email\}\}/g, customer.email || '')
      .replace(/\{\{cliente_telefono\}\}/g, customer.phone || '')
      .replace(/\{\{cliente_tipo_documento\}\}/g, clientDocumentType)
      .replace(/\{\{cliente_numero_documento\}\}/g, customer.documentNumber || '')
      .replace(/\{\{cliente_documento_completo\}\}/g, clientDocumentFull)
      .replace(/\{\{cliente_fecha_nacimiento\}\}/g, clientDateOfBirth)
      .replace(/\{\{cliente_edad\}\}/g, clientAge ? `${clientAge} años` : '');

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

    // Si hay appointmentId, actualizar hasConsent en el appointment
    if (appointmentId) {
      await Appointment.update(
        { hasConsent: true },
        { where: { id: appointmentId, businessId } }
      );
      console.log(`✅ Actualizado hasConsent=true para appointment ${appointmentId}`);
    }

    // Cargar relaciones necesarias para generar el PDF
    await signature.reload({
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

    // Generar PDF automáticamente (en background, no esperar)
    generateConsentPDFBuffer(signature).then(buffer => {
      // PDF generado exitosamente en background
      console.log('✅ PDF generado en background para firma:', signature.id);
    }).catch(error => {
      console.error('Error generando PDF en background:', error);
    });

    return res.status(201).json({
      success: true,
      message: 'Consentimiento firmado exitosamente. PDF en generación.',
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
    console.log('📄 getSignaturePDF llamado - businessId:', businessId, 'signatureId:', signatureId);

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
          as: 'business',
          attributes: ['id', 'name', 'address', 'phone', 'email', 'logo']
        }
      ]
    });

    if (!signature) {
      console.error('❌ Firma no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Firma no encontrada'
      });
    }

    console.log('✅ Firma encontrada');

    // Generar PDF como buffer (igual que los recibos - siempre se genera en tiempo real)
    console.log('📄 Generando PDF de consentimiento para:', signatureId);
    const pdfBuffer = await generateConsentPDFBuffer(signature);
    
    // Actualizar registro indicando que el PDF fue generado
    await signature.update({
      pdfGeneratedAt: new Date()
    });

    console.log('✅ PDF generado exitosamente');

    // Establecer headers y enviar buffer directamente (igual que los recibos)
    const filename = `consentimiento-${signature.customer?.name || 'cliente'}-${signatureId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al obtener PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener PDF',
      error: error.message
    });
  }
};

/**
 * Función helper para generar PDF del consentimiento como Buffer
 * @param {Object} signature - Objeto ConsentSignature con todos los datos
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generateConsentPDFBuffer(signature) {
  return new Promise(async (resolve, reject) => {
    try {
      // Agregar axios si no está importado
      const axios = require('axios');
      
      const chunks = [];
      
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Capturar PDF en memoria (no crear archivo temporal)
      doc.on('data', chunk => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ PDF generado en memoria, tamaño:', pdfBuffer.length, 'bytes');
        resolve(pdfBuffer);
      });
      
      doc.on('error', (error) => {
        console.error('❌ Error generando PDF:', error);
        reject(error);
      });

      // ============= LOGO DEL NEGOCIO (si existe) =============
      let currentY = 50;
      
      if (signature.business && signature.business.logo) {
        try {
          console.log('🖼️ Descargando logo del negocio para consentimiento:', signature.business.logo);
          const logoResponse = await axios.get(signature.business.logo, {
            responseType: 'arraybuffer',
            timeout: 5000
          });
          const logoBuffer = Buffer.from(logoResponse.data, 'binary');
          
          if (logoBuffer) {
            const logoSize = 80;
            const logoX = (595 - logoSize) / 2; // Centrar en A4
            
            doc.image(logoBuffer, logoX, currentY, {
              width: logoSize,
              height: logoSize,
              fit: [logoSize, logoSize],
              align: 'center'
            });
            
            currentY += logoSize + 15;
            console.log('✅ Logo agregado al consentimiento');
          }
        } catch (logoError) {
          console.error('❌ Error cargando logo para consentimiento:', logoError.message);
        }
      }

      // Encabezado con información del negocio
      doc.y = currentY;
      if (signature.business) {
        doc.fontSize(18).font('Helvetica-Bold').text(signature.business.name || 'Beauty Control', { align: 'center' });
        doc.moveDown(0.5);
        
        if (signature.business.address || signature.business.phone) {
          doc.fontSize(10).font('Helvetica');
          if (signature.business.address) doc.text(signature.business.address, { align: 'center' });
          if (signature.business.phone) doc.text(`Tel: ${signature.business.phone}`, { align: 'center' });
          doc.moveDown(1);
        }
      }

      // Título del consentimiento
      doc.fontSize(16).font('Helvetica-Bold')
        .text('CONSENTIMIENTO INFORMADO', { align: 'center', underline: true });
      doc.moveDown(1);

      // Información del template
      if (signature.template) {
        doc.fontSize(12).font('Helvetica-Bold').text(`Tipo: ${signature.template.name}`, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`Versión: ${signature.templateVersion}`, { align: 'center' });
        doc.moveDown(1);
      }

      // Línea separadora
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Información del paciente
      doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL PACIENTE');
      doc.fontSize(10).font('Helvetica');
      if (signature.customer) {
        const fullName = `${signature.customer.firstName || ''} ${signature.customer.lastName || ''}`.trim();
        doc.text(`Nombre Completo: ${fullName || 'N/A'}`);
        
        if (signature.customer.email) doc.text(`Email: ${signature.customer.email}`);
        if (signature.customer.phone) doc.text(`Teléfono: ${signature.customer.phone}`);
        
        // Documento con tipo y número
        if (signature.customer.documentType || signature.customer.documentNumber) {
          const docText = signature.customer.documentType 
            ? `${signature.customer.documentType}: ${signature.customer.documentNumber || 'N/A'}`
            : signature.customer.documentNumber;
          doc.text(`Documento de Identidad: ${docText}`);
        }
        
        // Fecha de nacimiento y edad
        if (signature.customer.dateOfBirth) {
          const birthDate = new Date(signature.customer.dateOfBirth);
          const formattedDate = birthDate.toLocaleDateString('es-CO', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          doc.text(`Fecha de Nacimiento: ${formattedDate} (${age} años)`);
        }
      }
      doc.moveDown(1);

      // Contenido del consentimiento (extraer texto del HTML)
      doc.fontSize(12).font('Helvetica-Bold').text('CONSENTIMIENTO');
      doc.fontSize(10).font('Helvetica');
      
      // Convertir HTML a texto plano (remover tags)
      let textContent = signature.templateContent
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Limitar longitud y agregar al PDF
      const maxLength = 2000;
      if (textContent.length > maxLength) {
        textContent = textContent.substring(0, maxLength) + '...';
      }
      
      doc.text(textContent, { align: 'justify' });
      doc.moveDown(1.5);

      // Campos editables completados
      if (signature.editableFieldsData && Object.keys(signature.editableFieldsData).length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('INFORMACIÓN ADICIONAL');
        doc.fontSize(10).font('Helvetica');
        
        Object.entries(signature.editableFieldsData).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`);
        });
        doc.moveDown(1);
      }

      // Fecha y firma
      doc.moveDown(2);
      doc.fontSize(12).font('Helvetica-Bold').text('FIRMA Y ACEPTACIÓN');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Fecha de firma: ${new Date(signature.signedAt).toLocaleString('es-AR')}`);
      doc.text(`Firmado por: ${signature.signedBy}`);
      doc.moveDown(1);

      // Agregar imagen de la firma si existe
      if (signature.signatureData) {
        try {
          // Convertir base64 a buffer
          const base64Data = signature.signatureData.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          
          // Agregar imagen al PDF
          doc.image(imageBuffer, {
            fit: [200, 100],
            align: 'left'
          });
          doc.moveDown(0.5);
        } catch (imgError) {
          console.error('Error al agregar firma al PDF:', imgError);
          doc.text('[Firma digital registrada]');
        }
      }

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text(`Documento generado el ${new Date().toLocaleString('es-AR')}`, 50, doc.page.height - 50, {
          align: 'center'
        });

      // Finalizar documento (el evento 'end' manejará la resolución)
      doc.end();

    } catch (error) {
      console.error('Error generando PDF:', error);
      reject(error);
    }
  });
}

/**
 * Regenerar PDFs antiguos con rutas locales (migración a Cloudinary)
 * POST /api/business/:businessId/consent-signatures/migrate-pdfs
 * Solo para admin/owner
 */
exports.migratePDFsToCloudinary = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    console.log('🔄 Iniciando migración de PDFs a base64 para negocio:', businessId);

    // Buscar todos los consentimientos con PDFs legacy (no base64)
    const signaturesWithLegacyPDFs = await ConsentSignature.findAll({
      where: {
        businessId,
        pdfUrl: {
          [Op.not]: null,
          [Op.notLike]: 'data:application/pdf;base64%' // Cualquier cosa que NO sea base64
        }
      },
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
          as: 'business',
          attributes: ['id', 'name', 'address', 'phone', 'email', 'logo']
        }
      ],
      limit: 100 // Procesar máximo 100 a la vez
    });

    console.log(`📊 Encontrados ${signaturesWithLegacyPDFs.length} PDFs para migrar`);

    const results = {
      total: signaturesWithLegacyPDFs.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Procesar cada firma
    for (const signature of signaturesWithLegacyPDFs) {
      try {
        console.log(`🔄 Regenerando PDF para firma ${signature.id}`);
        
        const pdfBuffer = await generateConsentPDFBuffer(signature);
        const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
        
        await signature.update({
          pdfUrl: pdfBase64,
          pdfGeneratedAt: new Date()
        });
        
        results.success++;
        console.log(`✅ PDF migrado: ${signature.id} → [base64 data]`);
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          signatureId: signature.id,
          error: error.message
        });
        console.error(`❌ Error migrando ${signature.id}:`, error.message);
      }
    }

    console.log(`✅ Migración completada: ${results.success} exitosos, ${results.failed} fallidos`);

    return res.json({
      success: true,
      message: 'Migración de PDFs completada',
      data: results
    });

  } catch (error) {
    console.error('Error en migración de PDFs:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en migración de PDFs',
      error: error.message
    });
  }
};

module.exports = {
  ...exports,
  generateConsentPDFBuffer
};
