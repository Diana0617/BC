const PDFDocument = require('pdfkit');
const axios = require('axios');
const { PassThrough } = require('stream');

class CatalogPDFGenerator {
  /**
   * Generar PDF del catálogo con imágenes
   */
  static async generate(catalogItems, business, filters = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = new PassThrough();
        const chunks = [];

        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Catálogo de Proveedores', { align: 'center' });
        doc.fontSize(12).text(business.name || 'Mi Negocio', { align: 'center' });
        doc.moveDown();

        // Filtros aplicados
        if (filters.supplierId || filters.category) {
          doc.fontSize(10).text('Filtros aplicados:', { underline: true });
          if (filters.supplierName) doc.text(`Proveedor: ${filters.supplierName}`);
          if (filters.category) doc.text(`Categoría: ${filters.category}`);
          doc.moveDown();
        }

        // Fecha de generación
        doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
        doc.moveDown();

        // Items del catálogo
        for (let index = 0; index < catalogItems.length; index++) {
          const item = catalogItems[index];
          // Verificar si necesitamos una nueva página
          if (doc.y > 650) {
            doc.addPage();
          }

          // Línea separadora
          if (index > 0) {
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
          }

          const startY = doc.y;

          // Nombre del producto (negrita)
          doc.fontSize(14).font('Helvetica-Bold').text(item.name, 50, startY);
          doc.font('Helvetica');

          // SKU y proveedor
          doc.fontSize(10).text(`SKU: ${item.supplierSku}`, 50, doc.y + 5);
          if (item.supplier) {
            doc.text(`Proveedor: ${item.supplier.name}`, 50, doc.y + 3);
          }

          // Categoría y marca
          if (item.category) {
            doc.text(`Categoría: ${item.category}`, 50, doc.y + 3);
          }
          if (item.brand) {
            doc.text(`Marca: ${item.brand}`, 50, doc.y + 3);
          }

          // Precio
          const price = parseFloat(item.price);
          doc.fontSize(12).font('Helvetica-Bold')
            .text(`$${price.toLocaleString('es-CO')} ${item.currency}`, 50, doc.y + 5);
          doc.font('Helvetica').fontSize(10);

          // Descripción
          if (item.description) {
            doc.text(item.description, 50, doc.y + 3, {
              width: 300,
              align: 'justify'
            });
          }

          // Disponibilidad
          const availText = item.available ? '✓ Disponible' : '✗ No disponible';
          doc.fillColor(item.available ? 'green' : 'red')
            .text(availText, 50, doc.y + 3);
          doc.fillColor('black');

          // Agregar imagen si existe
          if (item.images && item.images.length > 0) {
            try {
              const imageUrl = item.images[0].thumbnail?.url || item.images[0].main?.url;
              if (imageUrl) {
                // Descargar imagen
                const imageBuffer = await this.downloadImage(imageUrl);
                if (imageBuffer) {
                  // Agregar imagen al PDF (máximo 150x150)
                  doc.image(imageBuffer, 380, startY, {
                    fit: [150, 150],
                    align: 'center',
                    valign: 'center'
                  });
                }
              }
            } catch (error) {
              console.error('Error adding image to PDF:', error);
              // Si falla, mostrar placeholder
              doc.fontSize(8).text('[Imagen no disponible]', 380, startY, {
                width: 150,
                align: 'center'
              });
            }
          }

          doc.moveDown(1.5);
        }

        // Footer
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).text(
            `Página ${i + 1} de ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Descargar imagen desde URL
   * TODO: Implementar descarga de imágenes para incluir en PDF
   */
  static async downloadImage(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  }
}

module.exports = CatalogPDFGenerator;
