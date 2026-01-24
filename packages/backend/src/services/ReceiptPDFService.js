const PDFDocument = require('pdfkit');
const axios = require('axios');

/**
 * Servicio para generar PDFs de recibos en formato ticket térmico 80mm
 */
class ReceiptPDFService {

  /**
   * Descargar imagen desde URL y retornar buffer
   * @param {string} imageUrl - URL de la imagen
   * @returns {Promise<Buffer|null>} - Buffer de la imagen o null si falla
   */
  static async _downloadImage(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 5000 // 5 segundos timeout
      });
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error('❌ Error descargando imagen:', error.message);
      return null;
    }
  }

  /**
   * Generar PDF de recibo estilo ticket de supermercado
   * @param {Object} receipt - Recibo del modelo Receipt
   * @param {Object} business - Negocio
   * @param {Array} items - Items/productos de la venta (opcional)
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  static async generateReceiptPDF(receipt, business, items = []) {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 [ReceiptPDFService] Iniciando generación de PDF formato ticket...');
        
        // Formato ticket térmico: 80mm width (226.77 points), altura automática
        const doc = new PDFDocument({ 
          margin: 10,
          size: [226.77, 841.89] // 80mm x ~297mm (se ajusta automáticamente)
        });
        
        const chunks = [];

        // Capturar el PDF en memoria
        doc.on('data', chunk => {
          chunks.push(chunk);
        });
        
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('✅ [ReceiptPDFService] PDF generado, tamaño:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });
        
        doc.on('error', (error) => {
          console.error('❌ [ReceiptPDFService] Error en generación de PDF:', error);
          reject(error);
        });

        const pageWidth = 226.77; // 80mm
        let yPosition = 15; // Posición vertical inicial

        // ============= LOGO DEL NEGOCIO (si existe) =============
        if (business.logo) {
          try {
            console.log('📷 Descargando logo desde:', business.logo);
            const logoBuffer = await this._downloadImage(business.logo);
            
            if (logoBuffer) {
              const logoWidth = 60;
              const logoHeight = 60;
              const logoX = (pageWidth - logoWidth) / 2; // Centrar

              doc.image(logoBuffer, logoX, yPosition, {
                width: logoWidth,
                height: logoHeight,
                fit: [logoWidth, logoHeight],
                align: 'center'
              });
              
              yPosition += logoHeight + 8; // Espacio después del logo
              console.log('✅ Logo agregado al recibo');
            } else {
              console.warn('⚠️ No se pudo descargar el logo, continuando sin él');
            }
          } catch (error) {
            console.error('❌ Error cargando logo del negocio:', error.message);
            // Continuar sin logo si falla
          }
        }

        // ============= NOMBRE DEL NEGOCIO =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(business.name || 'Beauty Control', 10, yPosition, { 
            width: pageWidth - 20, 
            align: 'center' 
          });
        
        yPosition = doc.y + 2; // Actualizar posición después del nombre

        // Info del negocio
        doc
          .fontSize(7)
          .font('Helvetica')
          .text(business.address || '', 10, yPosition, { 
            width: pageWidth - 20, 
            align: 'center' 
          });
        
        yPosition = doc.y + 2;
        
        doc.text(`Tel: ${business.phone || 'N/A'}`, 10, yPosition, { 
          width: pageWidth - 20, 
          align: 'center' 
        });

        yPosition = doc.y + 2;

        if (business.email) {
          doc.text(business.email, 10, yPosition, { 
            width: pageWidth - 20, 
            align: 'center' 
          });
          yPosition = doc.y + 2;
        }

        doc.moveDown(0.5);

        // Línea separadora
        doc
          .moveTo(10, doc.y)
          .lineTo(pageWidth - 10, doc.y)
          .lineWidth(0.5)
          .stroke()
          .moveDown(0.5);

        // ============= TITULO Y NUMERO DE RECIBO =============
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('RECIBO DE PAGO', { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .fontSize(8)
          .text(`N° ${receipt.receiptNumber}`, { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .moveDown(0.3);

        // Fecha y hora
        doc
          .fontSize(7)
          .font('Helvetica')
          .text(`Fecha: ${this._formatDate(receipt.createdAt || receipt.date)}`, { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .text(`Hora: ${this._formatTime(receipt.createdAt || receipt.date)}`, { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .moveDown(0.5);

        // Línea separadora
        doc
          .moveTo(10, doc.y)
          .lineTo(pageWidth - 10, doc.y)
          .lineWidth(0.5)
          .stroke()
          .moveDown(0.5);

        // ============= CLIENTE =============
        doc
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CLIENTE', 10, doc.y)
          .moveDown(0.2);

        doc
          .font('Helvetica')
          .fontSize(7)
          .text(`${receipt.clientName}`, 10, doc.y)
          .text(`${receipt.clientPhone || 'N/A'}`, 10, doc.y);

        if (receipt.clientEmail) {
          doc.text(receipt.clientEmail, 10, doc.y);
        }

        doc.moveDown(0.5);

        // ============= SERVICIO/PRODUCTO =============
        if (receipt.serviceName) {
          doc
            .fontSize(7)
            .font('Helvetica-Bold')
            .text('SERVICIO', 10, doc.y)
            .moveDown(0.2);

          doc
            .font('Helvetica')
            .fontSize(7)
            .text(receipt.serviceName, 10, doc.y);

          if (receipt.specialistName) {
            doc.text(`Atendido por: ${receipt.specialistName}`, 10, doc.y);
          }

          doc.moveDown(0.5);
        }

        // Línea separadora
        doc
          .moveTo(10, doc.y)
          .lineTo(pageWidth - 10, doc.y)
          .lineWidth(0.5)
          .stroke()
          .moveDown(0.5);

        // ============= DETALLE =============
        const leftMargin = 10;
        const rightMargin = pageWidth - 10;

        doc
          .fontSize(7)
          .font('Helvetica');

        // Si hay items/productos
        if (items && items.length > 0) {
          items.forEach(item => {
            const name = item.product?.name || item.productName || 'Producto';
            const qty = item.quantity || 1;
            const price = parseFloat(item.unitPrice || 0);
            const itemTotal = parseFloat(item.total || 0);

            // Nombre del producto
            doc.text(`${name}`, leftMargin, doc.y);
            // Cantidad y precio
            doc.text(`  ${qty} x $${this._formatMoney(price)}`, leftMargin, doc.y);
            // Total alineado a la derecha
            doc.text(`$${this._formatMoney(itemTotal)}`, rightMargin - 40, doc.y - 14, { 
              width: 40, 
              align: 'right' 
            });
            doc.moveDown(0.3);
          });
        }

        doc.moveDown(0.3);

        // Línea punteada
        doc
          .fontSize(7)
          .text('- - - - - - - - - - - - - - - - - -', { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .moveDown(0.3);

        // ============= TOTALES =============
        const subtotal = parseFloat(receipt.subtotal || receipt.totalAmount || 0);
        const discount = parseFloat(receipt.discount || 0);
        const tax = parseFloat(receipt.tax || 0);
        const tip = parseFloat(receipt.tip || 0);
        const total = parseFloat(receipt.totalAmount || 0);

        doc.fontSize(7).font('Helvetica');

        // Subtotal
        if (items && items.length > 0) {
          doc.text(`Subtotal:`, leftMargin, doc.y);
          doc.text(`$${this._formatMoney(subtotal)}`, rightMargin - 50, doc.y - 7, { 
            width: 50, 
            align: 'right' 
          });
          doc.moveDown(0.2);
        }

        // Descuento
        if (discount > 0) {
          doc.text(`Descuento:`, leftMargin, doc.y);
          doc.text(`-$${this._formatMoney(discount)}`, rightMargin - 50, doc.y - 7, { 
            width: 50, 
            align: 'right' 
          });
          doc.moveDown(0.2);
        }

        // Propina
        if (tip > 0) {
          doc.text(`Propina:`, leftMargin, doc.y);
          doc.text(`$${this._formatMoney(tip)}`, rightMargin - 50, doc.y - 7, { 
            width: 50, 
            align: 'right' 
          });
          doc.moveDown(0.2);
        }

        doc.moveDown(0.3);

        // TOTAL (destacado)
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(`TOTAL:`, leftMargin, doc.y);
        
        doc.text(`$${this._formatMoney(total)}`, rightMargin - 60, doc.y - 9, { 
          width: 60, 
          align: 'right' 
        });

        doc.moveDown(0.5);

        // Línea separadora
        doc
          .moveTo(10, doc.y)
          .lineTo(pageWidth - 10, doc.y)
          .lineWidth(0.5)
          .stroke()
          .moveDown(0.5);

        // ============= METODO DE PAGO Y USUARIO =============
        doc
          .fontSize(7)
          .font('Helvetica')
          .text(`Método de pago: ${receipt.paymentMethod || 'Efectivo'}`, { 
            width: pageWidth - 20, 
            align: 'center' 
          });

        // Usuario que registró el pago
        if (receipt.user) {
          const userName = `${receipt.user.firstName || ''} ${receipt.user.lastName || ''}`.trim();
          
          doc
            .text(`Recibido por: ${userName}`, { 
              width: pageWidth - 20, 
              align: 'center' 
            });
        }

        doc.moveDown(0.5);

        // Línea separadora
        doc
          .moveTo(10, doc.y)
          .lineTo(pageWidth - 10, doc.y)
          .lineWidth(0.5)
          .stroke()
          .moveDown(0.5);

        // ============= MENSAJE FINAL =============
        doc
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('¡Gracias por tu preferencia!', { 
            width: pageWidth - 20, 
            align: 'center' 
          })
          .moveDown(0.3);

        doc
          .fontSize(6)
          .font('Helvetica')
          .text('Conserve este recibo como comprobante de pago', { 
            width: pageWidth - 20, 
            align: 'center' 
          });

        doc.moveDown(1);

        // Finalizar documento
        doc.end();

      } catch (error) {
        console.error('❌ [ReceiptPDFService] Error durante generación:', error);
        reject(error);
      }
    });
  }

  /**
   * Formatear fecha (solo día)
   */
  static _formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatear hora
   */
  static _formatTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Formatear dinero
   */
  static _formatMoney(amount) {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

}

module.exports = ReceiptPDFService;
