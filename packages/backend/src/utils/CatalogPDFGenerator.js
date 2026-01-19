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

        // Items del catálogo
        for (let index = 0; index < catalogItems.length; index++) {
          const item = catalogItems[index];
          
          // Calcular altura necesaria para el item (mínimo 140px para la imagen)
          const minItemHeight = 150;
          
          // Verificar si necesitamos una nueva página
          if (doc.y > 700 - minItemHeight) {
            doc.addPage();
          }

          const startY = doc.y;
          const leftMargin = 50;
          const imageSize = 120;
          const imageX = leftMargin;
          const textX = imageX + imageSize + 15; // Texto al lado de la imagen
          const contentWidth = 495 - imageSize - 15; // Ancho para el texto

          // Caja con borde sutil para cada producto
          doc.save();
          doc.strokeColor('#E5E7EB').lineWidth(1);
          doc.rect(leftMargin, startY, 495, minItemHeight).stroke();
          doc.restore();

          // Intentar cargar y mostrar imagen
          let imageLoaded = false;
          const imageUrl = item.product?.images?.[0]?.thumbnail?.url || 
                          item.product?.images?.[0]?.main?.url || 
                          item.product?.images?.[0]?.url ||
                          item.images?.[0]?.thumbnail?.url || 
                          item.images?.[0]?.main?.url || 
                          item.images?.[0]?.url;

          if (imageUrl) {
            try {
              const imageBuffer = await this.downloadImage(imageUrl);
              if (imageBuffer) {
                doc.image(imageBuffer, imageX + 10, startY + 15, {
                  fit: [imageSize - 20, imageSize - 20],
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
            doc.rect(imageX + 10, startY + 15, imageSize - 20, imageSize - 20).fill();
            doc.fillColor('#9CA3AF').fontSize(40);
            doc.text('📦', imageX + 10, startY + 45, {
              width: imageSize - 20,
              align: 'center'
            });
            doc.restore();
          }

          // Contenido de texto
          let textY = startY + 15;

          // Nombre del producto (negrita, más grande)
          doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827');
          const productName = item.product?.name || item.name;
          doc.text(productName, textX, textY, {
            width: contentWidth,
            ellipsis: true,
            lineBreak: false
          });
          textY += 18;

          // SKU
          doc.font('Helvetica').fontSize(9).fillColor('#6B7280');
          doc.text(`SKU: ${item.supplierSku || item.product?.sku || 'N/A'}`, textX, textY);
          textY += 12;

          // Categoría
          const category = item.product?.category || item.category;
          if (category && category !== 'Sin categoría') {
            doc.fillColor('#4B5563');
            doc.text(`🏷️  ${category}`, textX, textY);
            textY += 12;
          }

          // Marca
          if (item.brand) {
            doc.fillColor('#4B5563');
            doc.text(`Marca: ${item.brand}`, textX, textY);
            textY += 12;
          }

          textY += 5;

          // Precio destacado
          const price = parseFloat(item.product?.price || item.price || 0);
          doc.font('Helvetica-Bold').fontSize(16).fillColor('#059669');
          doc.text(`$${price.toLocaleString('es-CO')}`, textX, textY);
          textY += 22;

          // Disponibilidad con badge
          const availText = item.available ? '✓ Disponible' : '✗ No disponible';
          const badgeColor = item.available ? '#10B981' : '#EF4444';
          const badgeX = textX;
          const badgeY = textY;
          
          doc.save();
          doc.fillColor(badgeColor).opacity(0.1);
          doc.roundedRect(badgeX, badgeY, 80, 16, 3).fill();
          doc.restore();
          
          doc.font('Helvetica-Bold').fontSize(8).fillColor(badgeColor);
          doc.text(availText, badgeX + 5, badgeY + 4);
          doc.fillColor('black');

          // Descripción si hay espacio
          if (item.description && textY < startY + minItemHeight - 30) {
            textY += 20;
            doc.font('Helvetica').fontSize(8).fillColor('#4B5563');
            const descText = item.description.length > 150 
              ? item.description.substring(0, 147) + '...' 
              : item.description;
            doc.text(descText, textX, textY, {
              width: contentWidth,
              lineGap: 2
            });
          }

          // Mover a la siguiente posición
          doc.y = startY + minItemHeight + 10;
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
