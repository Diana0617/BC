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
        doc.fontSize(20).text('Catálogo de Productos', { align: 'center' });
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

        // Layout de 2 columnas
        const pageWidth = 595; // A4 width in points
        const margin = 50;
        const columnGap = 20;
        const columnWidth = (pageWidth - (2 * margin) - columnGap) / 2;
        const imageSize = 80;
        const itemHeight = 140;
        
        let currentColumn = 0; // 0 = izquierda, 1 = derecha
        let startY = doc.y;

        // Items del catálogo en 2 columnas
        for (let index = 0; index < catalogItems.length; index++) {
          const item = catalogItems[index];
          
          // Verificar si necesitamos una nueva página
          if (startY > 700 - itemHeight) {
            doc.addPage();
            startY = 50;
            currentColumn = 0;
          }

          // Calcular posición X según la columna
          const columnX = currentColumn === 0 
            ? margin 
            : margin + columnWidth + columnGap;

          // Caja con borde sutil para cada producto
          doc.save();
          doc.strokeColor('#E5E7EB').lineWidth(1);
          doc.rect(columnX, startY, columnWidth, itemHeight).stroke();
          doc.restore();

          // Posiciones para imagen y texto
          const imageX = columnX + 10;
          const textX = columnX + 10;
          const contentWidth = columnWidth - 20;

          // Intentar cargar y mostrar imagen (centrada horizontalmente)
          let imageLoaded = false;
          const imageUrl = item.product?.images?.[0]?.thumbnail?.url || 
                          item.product?.images?.[0]?.main?.url || 
                          item.product?.images?.[0]?.url ||
                          item.images?.[0]?.thumbnail?.url || 
                          item.images?.[0]?.main?.url || 
                          item.images?.[0]?.url;

          const imageCenterX = columnX + (columnWidth - imageSize) / 2;

          if (imageUrl) {
            try {
              const imageBuffer = await this.downloadImage(imageUrl);
              if (imageBuffer) {
                doc.image(imageBuffer, imageCenterX, startY + 10, {
                  fit: [imageSize, imageSize],
                  align: 'center',
                  valign: 'center'
                });
                imageLoaded = true;
              }
            } catch (error) {
              console.error('Error loading image:', error);
            }
          }

          // Si no hay imagen, mostrar placeholder
          if (!imageLoaded) {
            doc.save();
            doc.fillColor('#F3F4F6');
            doc.rect(imageCenterX, startY + 10, imageSize, imageSize).fill();
            doc.fillColor('#9CA3AF').fontSize(30);
            doc.text('[IMG]', imageCenterX, startY + 35, {
              width: imageSize,
              align: 'center'
            });
            doc.restore();
          }

          // Contenido de texto debajo de la imagen
          let textY = startY + imageSize + 18;

          // Nombre del producto (negrita)
          doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827');
          const productName = item.product?.name || item.name;
          doc.text(productName, textX, textY, {
            width: contentWidth,
            align: 'center',
            ellipsis: true
          });
          textY = doc.y + 3;

          // SKU
          doc.font('Helvetica').fontSize(8).fillColor('#6B7280');
          doc.text(`SKU: ${item.supplierSku || item.product?.sku || 'N/A'}`, textX, textY, {
            width: contentWidth,
            align: 'center'
          });
          textY = doc.y + 2;

          // Categoría
          const category = item.product?.category || item.category;
          if (category && category !== 'Sin categoría') {
            doc.fillColor('#4B5563').fontSize(8);
            doc.text(category, textX, textY, {
              width: contentWidth,
              align: 'center'
            });
            textY = doc.y + 2;
          }

          // Marca
          if (item.brand) {
            doc.fillColor('#4B5563').fontSize(8);
            doc.text(`Marca: ${item.brand}`, textX, textY, {
              width: contentWidth,
              align: 'center'
            });
            textY = doc.y + 2;
          }

          // Precio destacado
          const price = parseFloat(item.product?.price || item.price || 0);
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#059669');
          doc.text(`$${price.toLocaleString('es-CO')}`, textX, textY + 3, {
            width: contentWidth,
            align: 'center'
          });

          // Cambiar a la siguiente columna o fila
          if (currentColumn === 0) {
            currentColumn = 1;
          } else {
            currentColumn = 0;
            startY += itemHeight + 10;
          }
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
