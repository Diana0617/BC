const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Genera un PDF de consentimiento informado con firma digital
 * @param {Object} consentSignature - Registro de ConsentSignature con includes
 * @param {Object} options - Opciones adicionales para el PDF
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
const generateConsentPDF = async (consentSignature, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        },
        info: {
          Title: `Consentimiento Informado - ${consentSignature.signedBy}`,
          Author: consentSignature.business?.name || 'Beauty Control',
          Subject: 'Consentimiento Informado',
          Keywords: 'consentimiento, firma digital, tratamiento estético',
          CreationDate: new Date(consentSignature.signedAt)
        }
      });

      // Buffer para almacenar el PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- ENCABEZADO ---
      renderHeader(doc, consentSignature);

      // --- INFORMACIÓN DEL CLIENTE ---
      doc.moveDown(1);
      renderClientInfo(doc, consentSignature);

      // --- INFORMACIÓN DEL SERVICIO ---
      doc.moveDown(1);
      renderServiceInfo(doc, consentSignature);

      // --- CAMPOS DINÁMICOS (Alergias, medicamentos, etc.) ---
      if (consentSignature.editableFieldsData && consentSignature.template?.editableFields) {
        doc.moveDown(1);
        renderDynamicFields(doc, consentSignature);
      }

      // --- TEXTO DEL CONSENTIMIENTO ---
      doc.moveDown(1);
      renderConsentText(doc, consentSignature);

      // --- AUTORIZACIONES (Checkboxes) ---
      doc.moveDown(1);
      renderAuthorizations(doc, consentSignature);

      // --- FIRMA DIGITAL ---
      doc.moveDown(1);
      renderSignature(doc, consentSignature);

      // --- PIE DE PÁGINA ---
      renderFooter(doc, consentSignature);

      // Finalizar documento
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Renderiza el encabezado del PDF con logo y datos del negocio
 */
const renderHeader = (doc, consentSignature) => {
  const business = consentSignature.business;
  
  // Logo (si existe)
  // @TODO: Agregar logo desde business.logoUrl
  
  // Título principal
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('CONSENTIMIENTO INFORMADO', { align: 'center' })
    .moveDown(0.5);

  // Nombre del negocio
  doc
    .fontSize(14)
    .font('Helvetica')
    .text(business?.name || 'Beauty Control', { align: 'center' })
    .moveDown(0.3);

  // Dirección y contacto
  if (business?.address || business?.phone) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        [business?.address, business?.phone].filter(Boolean).join(' • '),
        { align: 'center' }
      )
      .moveDown(0.5);
  }

  // Línea separadora
  doc
    .moveTo(50, doc.y)
    .lineTo(562, doc.y)
    .stroke()
    .moveDown(0.5);
};

/**
 * Renderiza la información del cliente
 */
const renderClientInfo = (doc, consentSignature) => {
  const customer = consentSignature.customer;
  const editableFields = consentSignature.editableFieldsData || {};
  
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('DATOS DEL PACIENTE', { underline: true })
    .moveDown(0.5);

  doc.fontSize(10).font('Helvetica');

  // Nombre completo
  doc.text(`Nombre completo: ${consentSignature.signedBy}`, { continued: false });
  
  // Documento de identidad
  if (editableFields.clientIdNumber || customer?.identificationNumber) {
    doc.text(`Documento de identidad: ${editableFields.clientIdNumber || customer?.identificationNumber}`);
  }

  // Edad (si está disponible)
  if (customer?.dateOfBirth) {
    const age = calculateAge(customer.dateOfBirth);
    doc.text(`Edad: ${age} años`);
  }

  // Email y teléfono
  if (customer?.email) {
    doc.text(`Email: ${customer.email}`);
  }
  if (customer?.phone) {
    doc.text(`Teléfono: ${customer.phone}`);
  }

  // Fecha del consentimiento
  const signedDate = new Date(consentSignature.signedAt);
  doc.text(`Fecha: ${signedDate.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`);
};

/**
 * Renderiza la información del servicio/tratamiento
 */
const renderServiceInfo = (doc, consentSignature) => {
  const service = consentSignature.service;
  
  if (!service) return;

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('INFORMACIÓN DEL TRATAMIENTO', { underline: true })
    .moveDown(0.5);

  doc.fontSize(10).font('Helvetica');

  doc.text(`Servicio: ${service.name}`);
  
  if (service.description) {
    doc.text(`Descripción: ${service.description}`);
  }
  
  if (service.duration) {
    doc.text(`Duración aproximada: ${service.duration} minutos`);
  }
};

/**
 * Renderiza campos dinámicos del template (alergias, medicamentos, etc.)
 */
const renderDynamicFields = (doc, consentSignature) => {
  const editableFields = consentSignature.template.editableFields || [];
  const fieldValues = consentSignature.editableFieldsData || {};

  // Filtrar solo los campos del template (excluir campos fijos como clientIdNumber)
  const dynamicFields = editableFields.filter(field => 
    fieldValues[field.name] !== undefined
  );

  if (dynamicFields.length === 0) return;

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('INFORMACIÓN MÉDICA', { underline: true })
    .moveDown(0.5);

  doc.fontSize(10).font('Helvetica');

  dynamicFields.forEach((field) => {
    const value = fieldValues[field.name] || 'No especificado';
    
    doc
      .font('Helvetica-Bold')
      .text(`${field.label}:`, { continued: true })
      .font('Helvetica')
      .text(` ${value}`)
      .moveDown(0.3);
  });
};

/**
 * Renderiza el texto del consentimiento informado
 */
const renderConsentText = (doc, consentSignature) => {
  const consentText = consentSignature.templateContent || 
                      consentSignature.template?.content ||
                      'Consentimiento informado no disponible.';

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('CONSENTIMIENTO INFORMADO', { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(9)
    .font('Helvetica')
    .text(consentText, {
      align: 'justify',
      lineGap: 2
    });
};

/**
 * Renderiza las autorizaciones con checkboxes
 */
const renderAuthorizations = (doc, consentSignature) => {
  const fieldValues = consentSignature.editableFieldsData || {};

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('AUTORIZACIONES', { underline: true })
    .moveDown(0.5);

  doc.fontSize(10);

  // Checkbox helper
  const renderCheckbox = (label, checked) => {
    const x = doc.x;
    const y = doc.y;

    // Dibujar checkbox
    doc
      .rect(x, y, 12, 12)
      .stroke();

    // Si está marcado, dibujar checkmark
    if (checked) {
      doc
        .moveTo(x + 2, y + 6)
        .lineTo(x + 5, y + 9)
        .lineTo(x + 10, y + 3)
        .stroke();
    }

    // Texto al lado del checkbox
    doc
      .font('Helvetica')
      .text(label, x + 18, y, { width: 500 })
      .moveDown(0.5);
  };

  renderCheckbox(
    'Acepto los términos y condiciones del servicio',
    fieldValues.agreedToTerms === true
  );

  renderCheckbox(
    'Autorizo la realización del tratamiento descrito',
    fieldValues.agreedToTreatment === true
  );

  renderCheckbox(
    'Autorizo la toma de fotografías para fines médicos y de seguimiento',
    fieldValues.agreedToPhotos === true
  );
};

/**
 * Renderiza la firma digital del paciente
 */
const renderSignature = (doc, consentSignature) => {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('FIRMA DEL PACIENTE', { underline: true })
    .moveDown(0.5);

  const signatureData = consentSignature.signatureData;

  if (signatureData) {
    try {
      // Convertir base64 a buffer
      const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Insertar imagen de firma
      doc.image(imageBuffer, {
        fit: [200, 80],
        align: 'left'
      });

      doc.moveDown(0.5);
    } catch (error) {
      console.error('Error al procesar firma:', error);
      doc.text('[Firma digital no disponible]');
    }
  } else {
    doc.text('[Sin firma]');
  }

  // Línea para firma
  doc
    .moveTo(50, doc.y + 10)
    .lineTo(250, doc.y + 10)
    .stroke()
    .moveDown(0.3);

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(consentSignature.signedBy, 50, doc.y)
    .moveDown(0.2);

  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Firmado digitalmente el ${new Date(consentSignature.signedAt).toLocaleString('es-CO', {
      timeZone: 'America/Bogota'
    })}`);

  // Información de verificación
  if (consentSignature.ipAddress) {
    doc
      .fontSize(8)
      .fillColor('#666')
      .text(`IP: ${consentSignature.ipAddress}`, { continued: true })
      .text(` • ID: ${consentSignature.id.substring(0, 8)}`)
      .fillColor('#000');
  }
};

/**
 * Renderiza el pie de página con información legal
 */
const renderFooter = (doc, consentSignature) => {
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 80;

  doc
    .fontSize(8)
    .fillColor('#666')
    .text(
      'Este documento ha sido generado electrónicamente y cuenta con firma digital. ' +
      'Para verificar su autenticidad, contacte con el establecimiento.',
      50,
      footerY,
      {
        width: 512,
        align: 'center',
        lineGap: 1
      }
    );

  doc
    .moveDown(0.3)
    .text(
      `Versión del template: ${consentSignature.templateVersion} • ` +
      `Generado: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`,
      {
        align: 'center'
      }
    )
    .fillColor('#000');
};

/**
 * Calcula la edad a partir de la fecha de nacimiento
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = {
  generateConsentPDF
};
