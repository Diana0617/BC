const PDFDocument = require('pdfkit');

/**
 * Servicio para generar PDFs de recibos
 */
class ReceiptPDFService {

  /**
   * Generar PDF de recibo para cliente
   * @param {Object} receipt - Recibo del modelo Receipt
   * @param {Object} business - Negocio
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  static async generateReceiptPDF(receipt, business) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];

        // Capturar el PDF en memoria
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ============= ENCABEZADO =============
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('RECIBO DE PAGO', { align: 'center' })
          .moveDown(0.3);

        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(business.name || 'Beauty Control', { align: 'center' })
          .fontSize(10)
          .font('Helvetica')
          .text(business.address || '', { align: 'center' })
          .text(`Tel: ${business.phone || 'N/A'}`, { align: 'center' })
          .moveDown(0.5);

        // Número de recibo (destacado)
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#2563eb')
          .text(`N° ${receipt.receiptNumber}`, { align: 'center' })
          .fillColor('black')
          .moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(1);

        // ============= INFORMACIÓN DEL CLIENTE =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INFORMACIÓN DEL CLIENTE', { underline: true })
          .moveDown(0.5);

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Cliente: ${receipt.clientName}`, 100, doc.y)
          .text(`Teléfono: ${receipt.clientPhone || 'N/A'}`, 100, doc.y)
          .text(`Email: ${receipt.clientEmail || 'N/A'}`, 100, doc.y)
          .moveDown(1);

        // ============= INFORMACIÓN DEL SERVICIO =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('DETALLES DEL SERVICIO', { underline: true })
          .moveDown(0.5);

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Servicio: ${receipt.serviceName}`, 100, doc.y)
          .text(`Fecha: ${this._formatDate(receipt.serviceDate)}`, 100, doc.y)
          .text(`Hora: ${receipt.serviceTime}`, 100, doc.y)
          .text(`Especialista: ${receipt.specialistName}`, 100, doc.y);

        if (receipt.serviceDescription) {
          doc
            .moveDown(0.5)
            .text(`Descripción:`, 100, doc.y, { continued: false })
            .fontSize(9)
            .text(receipt.serviceDescription, 120, doc.y, { width: 400 });
        }

        doc.moveDown(1.5);

        // ============= DESGLOSE FINANCIERO =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('DESGLOSE DE PAGO', { underline: true })
          .moveDown(0.5);

        const subtotal = parseFloat(receipt.subtotal || 0);
        const discount = parseFloat(receipt.discount || 0);
        const tax = parseFloat(receipt.tax || 0);
        const tip = parseFloat(receipt.tip || 0);
        const total = parseFloat(receipt.totalAmount || 0);

        doc.font('Helvetica').fontSize(10);

        // Subtotal
        doc
          .text(`Subtotal:`, 100, doc.y, { continued: true, width: 300 })
          .text(`$${this._formatMoney(subtotal)}`, { align: 'right' });

        // Descuento (si aplica)
        if (discount > 0) {
          doc
            .fillColor('green')
            .text(`Descuento:`, 100, doc.y, { continued: true, width: 300 })
            .text(`-$${this._formatMoney(discount)}`, { align: 'right' })
            .fillColor('black');
        }

        // Impuestos (si aplica)
        if (tax > 0) {
          doc
            .text(`Impuestos:`, 100, doc.y, { continued: true, width: 300 })
            .text(`$${this._formatMoney(tax)}`, { align: 'right' });
        }

        // Propina (si aplica)
        if (tip > 0) {
          doc
            .fillColor('blue')
            .text(`Propina:`, 100, doc.y, { continued: true, width: 300 })
            .text(`$${this._formatMoney(tip)}`, { align: 'right' })
            .fillColor('black');
        }

        doc.moveDown(0.3);

        // Línea antes del total
        doc
          .moveTo(100, doc.y)
          .lineTo(500, doc.y)
          .stroke()
          .moveDown(0.3);

        // Total (destacado)
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(`TOTAL:`, 100, doc.y, { continued: true, width: 300 })
          .text(`$${this._formatMoney(total)}`, { align: 'right' })
          .moveDown(1.5);

        // ============= INFORMACIÓN DEL PAGO =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INFORMACIÓN DEL PAGO', { underline: true })
          .moveDown(0.5);

        const paymentMethodNames = {
          CASH: 'Efectivo',
          CARD: 'Tarjeta',
          TRANSFER: 'Transferencia',
          WOMPI: 'Pago en línea (Wompi)',
          OTHER: 'Otro'
        };

        const paymentStatusNames = {
          PENDING: 'Pendiente',
          PAID: 'Pagado',
          CANCELLED: 'Cancelado',
          REFUNDED: 'Reembolsado'
        };

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Método de Pago: ${paymentMethodNames[receipt.paymentMethod] || receipt.paymentMethod}`, 100, doc.y)
          .text(`Estado: ${paymentStatusNames[receipt.paymentStatus]}`, 100, doc.y);

        if (receipt.paymentReference) {
          doc.text(`Referencia: ${receipt.paymentReference}`, 100, doc.y);
        }

        doc
          .text(`Fecha de Emisión: ${this._formatDateTime(receipt.issueDate)}`, 100, doc.y)
          .moveDown(1.5);

        // ============= CÓDIGO QR (Opcional) =============
        // Aquí podrías agregar un código QR con la URL de verificación del recibo
        // doc.image(qrCodeBuffer, { width: 100, align: 'center' });

        // ============= NOTAS (Si existen) =============
        if (receipt.notes) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('NOTAS:', 100, doc.y)
            .font('Helvetica')
            .fontSize(9)
            .text(receipt.notes, 100, doc.y, { width: 450 })
            .moveDown(1);
        }

        // ============= PIE DE PÁGINA =============
        doc
          .moveDown(2)
          .fontSize(8)
          .fillColor('gray')
          .text('¡Gracias por tu preferencia!', { align: 'center' })
          .moveDown(0.3)
          .text(
            `Este recibo fue generado electrónicamente el ${this._formatDateTime(new Date())}`,
            { align: 'center' }
          )
          .text('Beauty Control - Sistema de Gestión', { align: 'center' });

        // Validación de autenticidad
        doc
          .moveDown(0.5)
          .fontSize(7)
          .text(
            `Código de verificación: ${receipt.id.substring(0, 8)}`,
            { align: 'center' }
          );

        // Finalizar el documento
        doc.end();

      } catch (error) {
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatear fecha y hora completa
   */
  static _formatDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
