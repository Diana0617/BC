const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Servicio para generar PDFs de turnos de caja
 */
class CashRegisterPDFService {

  /**
   * Generar PDF del resumen de turno
   * @param {Object} shift - Turno de caja
   * @param {Object} summary - Resumen calculado del turno
   * @param {Object} user - Usuario que cerró el turno
   * @param {Object} business - Negocio
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  static async generateShiftSummaryPDF(shift, summary, user, business) {
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
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('CIERRE DE CAJA', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(business.name || 'Beauty Control', { align: 'center' })
          .fontSize(10)
          .text(business.address || '', { align: 'center' })
          .moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(1);

        // ============= INFORMACIÓN DEL TURNO =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('INFORMACIÓN DEL TURNO', { underline: true })
          .moveDown(0.5);

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Turno Nº: ${shift.shiftNumber}`)
          .text(`Usuario: ${user.firstName} ${user.lastName}`)
          .text(`Apertura: ${this._formatDate(shift.openedAt)}`)
          .text(`Cierre: ${this._formatDate(shift.closedAt || new Date())}`)
          .moveDown(1);

        // ============= RESUMEN DE DINERO (CONTROL DE EFECTIVO) =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('CONTROL DE EFECTIVO', { underline: true })
          .moveDown(0.5);

        const openingBalance = parseFloat(shift.openingBalance || 0);
        const expectedClosing = parseFloat(shift.expectedClosingBalance || 0);
        const actualClosing = parseFloat(shift.actualClosingBalance || 0);
        const difference = parseFloat(shift.difference || 0);

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Balance Inicial (Efectivo):`, 100, doc.y, { continued: true, width: 250 })
          .text(`$${this._formatMoney(openingBalance)}`, { align: 'right' })
          .text(`Efectivo Cobrado en Turno:`, 100, doc.y, { continued: true, width: 250 })
          .text(`$${this._formatMoney(summary.totalCash || 0)}`, { align: 'right' })
          .moveDown(0.3);

        // Línea antes del total
        doc
          .moveTo(100, doc.y)
          .lineTo(450, doc.y)
          .stroke()
          .moveDown(0.3);

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(`Balance Esperado (Efectivo):`, 100, doc.y, { continued: true, width: 250 })
          .text(`$${this._formatMoney(expectedClosing)}`, { align: 'right' })
          .font('Helvetica')
          .fontSize(10)
          .text(`Balance Real Contado:`, 100, doc.y, { continued: true, width: 250 })
          .text(`$${this._formatMoney(actualClosing)}`, { align: 'right' })
          .moveDown(0.3);

        // Diferencia (destacada)
        const diffColor = difference === 0 ? 'green' : difference > 0 ? 'blue' : 'red';
        const diffLabel = difference === 0 ? 'Sin Diferencia' : 
                          difference > 0 ? 'Sobrante' : 'Faltante';

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(diffColor)
          .text(`${diffLabel}:`, 100, doc.y, { continued: true, width: 250 })
          .text(`$${this._formatMoney(Math.abs(difference))}`, { align: 'right' })
          .fillColor('black')
          .moveDown(1.5);

        // ============= DESGLOSE POR MÉTODO DE PAGO (TODOS LOS PAGOS) =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('DESGLOSE POR MÉTODO DE PAGO', { underline: true })
          .moveDown(0.5);

        const paymentMethods = summary.paymentMethods || {};
        const methodNames = {
          CASH: 'Efectivo',
          CARD: 'Tarjeta',
          TRANSFER: 'Transferencia',
          QR: 'Código QR',
          ONLINE: 'Pago en línea',
          OTHER: 'Otro'
        };

        doc.font('Helvetica').fontSize(10);

        if (Object.keys(paymentMethods).length > 0) {
          let totalAllPayments = 0;
          
          // Líneas de tabla
          doc
            .font('Helvetica-Bold')
            .text('Método', 100, doc.y, { width: 150, continued: true })
            .text('Cantidad', { width: 80, align: 'center', continued: true })
            .text('Total', { align: 'right' })
            .moveDown(0.3);

          doc
            .moveTo(100, doc.y)
            .lineTo(450, doc.y)
            .stroke()
            .moveDown(0.3);

          // Cada método
          doc.font('Helvetica');
          Object.entries(paymentMethods).forEach(([method, data]) => {
            const methodName = methodNames[method] || method;
            totalAllPayments += data.total;
            
            doc
              .text(methodName, 100, doc.y, { width: 150, continued: true })
              .text(`${data.count}`, { width: 80, align: 'center', continued: true })
              .text(`$${this._formatMoney(data.total)}`, { align: 'right' });
          });

          // Total general
          doc
            .moveDown(0.3)
            .moveTo(100, doc.y)
            .lineTo(450, doc.y)
            .stroke()
            .moveDown(0.3);

          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('TOTAL GENERAL:', 100, doc.y, { width: 230, continued: true })
            .text(`$${this._formatMoney(totalAllPayments)}`, { align: 'right' })
            .font('Helvetica')
            .fontSize(10);

        } else {
          doc.text('No hay pagos registrados');
        }

        doc.moveDown(1.5);

        // ============= RESUMEN DE CITAS =============
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('RESUMEN DE CITAS', { underline: true })
          .moveDown(0.5);

        const appointments = summary.appointments || {};

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Total de Citas: ${appointments.total || 0}`)
          .text(`Completadas: ${appointments.completed || 0}`)
          .text(`Canceladas: ${appointments.cancelled || 0}`)
          .text(`Monto Total: $${this._formatMoney(appointments.totalAmount || 0)}`)
          .text(`Monto Pagado: $${this._formatMoney(appointments.paidAmount || 0)}`)
          .moveDown(1.5);

        // ============= NOTAS =============
        if (shift.openingNotes || shift.closingNotes) {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('NOTAS', { underline: true })
            .moveDown(0.5);

          doc.font('Helvetica').fontSize(10);

          if (shift.openingNotes) {
            doc
              .font('Helvetica-Bold')
              .text('Apertura:')
              .font('Helvetica')
              .text(shift.openingNotes, { indent: 20 })
              .moveDown(0.5);
          }

          if (shift.closingNotes) {
            doc
              .font('Helvetica-Bold')
              .text('Cierre:')
              .font('Helvetica')
              .text(shift.closingNotes, { indent: 20 })
              .moveDown(0.5);
          }
        }

        // ============= PIE DE PÁGINA =============
        doc
          .moveDown(2)
          .fontSize(8)
          .fillColor('gray')
          .text(
            `Generado el ${this._formatDate(new Date())}`,
            { align: 'center' }
          )
          .text('Beauty Control - Sistema de Gestión', { align: 'center' });

        // Finalizar el documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Formatear fecha
   */
  static _formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

module.exports = CashRegisterPDFService;
