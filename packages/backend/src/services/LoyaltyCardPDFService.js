const PDFDocument = require('pdfkit');
const axios = require('axios');
const QRCode = require('qrcode');
const { Business, Client, BusinessClient } = require('../models');
const BusinessRulesService = require('./BusinessRulesService');

/**
 * Servicio para generar tarjetas de fidelización en PDF
 * Tamaño estándar de tarjeta de crédito: 85.6mm x 53.98mm (3.375" x 2.125")
 * En puntos: 242.65 x 153 pts
 */
class LoyaltyCardPDFService {
  /**
   * Genera un PDF de tarjeta de fidelización
   * @param {UUID} businessId - ID del negocio
   * @param {UUID} clientId - ID del cliente
   * @param {Number} points - Puntos actuales del cliente
   * @returns {Promise<PDFDocument>} - Stream del PDF
   */
  static async generateLoyaltyCard(businessId, clientId, points) {
    // Obtener datos del negocio
    const business = await Business.findByPk(businessId);
    if (!business) {
      throw new Error('Negocio no encontrado');
    }

    // Obtener datos del cliente
    const businessClient = await BusinessClient.findOne({
      where: { businessId, clientId },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
      }]
    });

    if (!businessClient) {
      throw new Error('Cliente no encontrado en este negocio');
    }

    const client = businessClient.client;
    const clientName = `${client.firstName} ${client.lastName}`.trim();

    // Obtener configuración de branding del negocio
    const brandingConfig = await this.getBrandingConfig(businessId);

    // Crear documento PDF con tamaño de tarjeta de crédito
    // 85.6mm x 53.98mm = 242.65 x 153 puntos
    const doc = new PDFDocument({
      size: [242.65, 153],
      margins: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    });

    // Aplicar fondo con color primario
    await this.drawBackground(doc, brandingConfig);

    // Dibujar logo del negocio
    await this.drawLogo(doc, business.logo, brandingConfig);

    // Dibujar nombre del negocio
    this.drawBusinessName(doc, business.name, brandingConfig);

    // Dibujar información del cliente
    this.drawClientInfo(doc, clientName, businessClient.referralCode, brandingConfig);

    // Dibujar puntos
    this.drawPoints(doc, points, brandingConfig);

    // Dibujar QR code con link para consultar puntos
    await this.drawQRCode(doc, businessClient.referralCode, brandingConfig);

    // Dibujar footer/decoración
    this.drawFooter(doc, brandingConfig);

    // Finalizar documento
    doc.end();

    return doc;
  }

  /**
   * Obtiene la configuración de branding del negocio
   */
  static async getBrandingConfig(businessId) {
    const business = await Business.findByPk(businessId);
    
    // Obtener colores de las reglas de negocio si existen
    const rules = await BusinessRulesService.getBusinessRules(businessId);
    
    const primaryColor = rules.BRANDING_PRIMARY_COLOR || '#8B5CF6'; // Púrpura por defecto
    const secondaryColor = rules.BRANDING_SECONDARY_COLOR || '#EC4899'; // Rosa por defecto
    const accentColor = rules.BRANDING_ACCENT_COLOR || '#F59E0B'; // Ámbar por defecto
    const textColor = rules.BRANDING_TEXT_COLOR || '#1F2937'; // Gris oscuro por defecto
    const backgroundColor = rules.BRANDING_BACKGROUND_COLOR || '#FFFFFF'; // Blanco por defecto

    return {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      backgroundColor,
      useGradient: rules.BRANDING_USE_GRADIENT !== false // true por defecto
    };
  }

  /**
   * Dibuja el fondo de la tarjeta
   */
  static async drawBackground(doc, config) {
    // Si usa gradiente, aplicar gradiente de primario a secundario
    if (config.useGradient) {
      // PDFKit no soporta gradientes nativamente, así que usamos un degradado simulado con rectángulos
      const steps = 10;
      const height = 153 / steps;
      
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const color = this.interpolateColor(config.primaryColor, config.secondaryColor, ratio);
        doc.rect(0, i * height, 242.65, height)
           .fill(color);
      }
    } else {
      // Fondo sólido con color primario
      doc.rect(0, 0, 242.65, 153)
         .fill(config.primaryColor);
    }

    // Agregar overlay semi-transparente blanco para mejorar legibilidad
    doc.rect(0, 0, 242.65, 153)
       .fillOpacity(0.1)
       .fill('#FFFFFF')
       .fillOpacity(1); // Restaurar opacidad
  }

  /**
   * Dibuja el logo del negocio
   */
  static async drawLogo(doc, logoUrl, config) {
    if (!logoUrl) {
      return; // No hay logo
    }

    try {
      // Descargar logo desde URL
      const response = await axios.get(logoUrl, {
        responseType: 'arraybuffer',
        timeout: 5000
      });

      const logoBuffer = Buffer.from(response.data);

      // Dibujar logo en la esquina superior izquierda
      // Tamaño: 30x30 puntos
      doc.image(logoBuffer, 12, 12, {
        width: 30,
        height: 30,
        fit: [30, 30],
        align: 'center',
        valign: 'center'
      });
    } catch (error) {
      console.error('Error al cargar logo:', error.message);
      // Continuar sin logo
    }
  }

  /**
   * Dibuja el nombre del negocio
   */
  static drawBusinessName(doc, businessName, config) {
    doc.fontSize(9)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(businessName.toUpperCase(), 48, 15, {
         width: 180,
         align: 'left'
       });
  }

  /**
   * Dibuja información del cliente
   */
  static drawClientInfo(doc, clientName, referralCode, config) {
    // Nombre del cliente (centrado, parte media-alta)
    doc.fontSize(11)
       .fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .text(clientName.toUpperCase(), 12, 60, {
         width: 218.65,
         align: 'center'
       });

    // Código de referido (pequeño, debajo del nombre)
    if (referralCode) {
      doc.fontSize(7)
         .fillColor('#FFFFFF')
         .fillOpacity(0.8)
         .font('Helvetica')
         .text(`Código: ${referralCode}`, 12, 75, {
           width: 218.65,
           align: 'center'
         })
         .fillOpacity(1);
    }
  }

  /**
   * Dibuja los puntos del cliente
   */
  static drawPoints(doc, points, config) {
    // Fondo semi-transparente para los puntos
    doc.roundedRect(70, 95, 102.65, 38, 5)
       .fillOpacity(0.2)
       .fill('#000000')
       .fillOpacity(1);

    // Label "PUNTOS"
    doc.fontSize(7)
       .fillColor('#FFFFFF')
       .fillOpacity(0.9)
       .font('Helvetica')
       .text('PUNTOS ACUMULADOS', 70, 100, {
         width: 102.65,
         align: 'center'
       })
       .fillOpacity(1);

    // Cantidad de puntos (grande y destacado)
    doc.fontSize(18)
       .fillColor(config.accentColor || '#F59E0B')
       .font('Helvetica-Bold')
       .text(points.toLocaleString('es-CO'), 70, 112, {
         width: 102.65,
         align: 'center'
       });
  }

  /**
   * Dibuja código QR para consultar puntos
   */
  static async drawQRCode(doc, referralCode, config) {
    try {
      // Generar URL para consultar puntos
      // La URL debería apuntar a tu frontend o a una página pública
      const checkUrl = `${process.env.FRONTEND_URL || 'https://beautycontrol.vercel.app'}/check-points/${referralCode}`;
      
      // Generar QR code como data URL
      const qrDataUrl = await QRCode.toDataURL(checkUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Convertir data URL a buffer
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

      // Dibujar QR en esquina inferior izquierda
      // Tamaño: 35x35 puntos
      doc.image(qrBuffer, 12, 98, {
        width: 35,
        height: 35,
        fit: [35, 35]
      });

      // Label opcional debajo del QR
      doc.fontSize(5)
         .fillColor('#FFFFFF')
         .fillOpacity(0.7)
         .font('Helvetica')
         .text('Escanea para', 8, 135, {
           width: 43,
           align: 'center'
         })
         .text('ver puntos', 8, 140, {
           width: 43,
           align: 'center'
         })
         .fillOpacity(1);

    } catch (error) {
      console.error('Error generando QR code:', error.message);
      // Continuar sin QR
    }
  }

  /**
   * Dibuja el footer decorativo
   */
  static drawFooter(doc, config) {
    // Línea decorativa inferior
    doc.moveTo(12, 140)
       .lineTo(230.65, 140)
       .lineWidth(0.5)
       .strokeOpacity(0.3)
       .stroke('#FFFFFF')
       .strokeOpacity(1);

    // Texto del footer
    doc.fontSize(6)
       .fillColor('#FFFFFF')
       .fillOpacity(0.7)
       .font('Helvetica')
       .text('Programa de Fidelización', 12, 143, {
         width: 218.65,
         align: 'center'
       })
       .fillOpacity(1);
  }

  /**
   * Interpola entre dos colores hexadecimales
   */
  static interpolateColor(color1, color2, ratio) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Genera múltiples tarjetas en un solo PDF (hoja A4)
   * Útil para imprimir varias tarjetas a la vez
   */
  static async generateMultipleCards(businessId, clientsData) {
    // Tamaño A4: 595.28 x 841.89 puntos
    // Podemos poner 2 tarjetas por fila y 5 por columna = 10 tarjetas por página
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    });

    const cardWidth = 242.65;
    const cardHeight = 153;
    const spacing = 20;

    const cardsPerRow = 2;
    const cardsPerColumn = 5;
    const cardsPerPage = cardsPerRow * cardsPerColumn;

    for (let i = 0; i < clientsData.length; i++) {
      const { clientId, points } = clientsData[i];

      // Calcular posición en la página
      const row = Math.floor((i % cardsPerPage) / cardsPerRow);
      const col = (i % cardsPerPage) % cardsPerRow;

      const x = 30 + col * (cardWidth + spacing);
      const y = 30 + row * (cardHeight + spacing);

      // Guardar estado del documento
      doc.save();

      // Trasladar origen para dibujar la tarjeta
      doc.translate(x, y);

      // Generar tarjeta individual (sin crear nuevo documento)
      await this.drawSingleCard(doc, businessId, clientId, points);

      // Restaurar estado
      doc.restore();

      // Nueva página si completamos una página y hay más tarjetas
      if ((i + 1) % cardsPerPage === 0 && i + 1 < clientsData.length) {
        doc.addPage();
      }
    }

    doc.end();
    return doc;
  }

  /**
   * Dibuja una tarjeta individual en un documento existente
   */
  static async drawSingleCard(doc, businessId, clientId, points) {
    // Obtener datos
    const business = await Business.findByPk(businessId);
    const businessClient = await BusinessClient.findOne({
      where: { businessId, clientId },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    if (!business || !businessClient) {
      return;
    }

    const client = businessClient.client;
    const clientName = `${client.firstName} ${client.lastName}`.trim();
    const brandingConfig = await this.getBrandingConfig(businessId);

    // Dibujar tarjeta (similar a generateLoyaltyCard pero sin crear documento nuevo)
    await this.drawBackground(doc, brandingConfig);
    await this.drawLogo(doc, business.logo, brandingConfig);
    this.drawBusinessName(doc, business.name, brandingConfig);
    this.drawClientInfo(doc, clientName, businessClient.referralCode, brandingConfig);
    this.drawPoints(doc, points, brandingConfig);
    this.drawFooter(doc, brandingConfig);
  }
}

module.exports = LoyaltyCardPDFService;
