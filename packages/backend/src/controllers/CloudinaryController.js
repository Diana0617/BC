const { v2: cloudinary } = require('cloudinary');
const fs = require('fs').promises;
const path = require('path');

/**
 * Controlador para manejo de uploads a Cloudinary
 */
class CloudinaryController {

  /**
   * Subir archivo de factura de proveedor (imagen o PDF)
   * POST /api/business/:businessId/upload/invoice
   */
  static async uploadInvoiceFile(req, res) {
    let tempFilePath = null;
    
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;
      
      // Validar que el usuario pertenece al negocio
      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir archivos a este negocio'
        });
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      tempFilePath = req.file.path;
      const { invoiceNumber } = req.body;

      // Determinar el tipo de archivo
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const isPdf = fileExtension === '.pdf';
      const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExtension);

      if (!isPdf && !isImage) {
        return res.status(400).json({
          success: false,
          message: 'Solo se permiten archivos PDF o imágenes (JPG, PNG, WEBP)'
        });
      }

      // Construir el folder path con businessId para aislar archivos por negocio
      const folder = `beauty-control/${businessId}/invoices`;
      
      // Configurar el public_id con el número de factura si está disponible
      const publicIdSuffix = invoiceNumber ? `_${invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_')}` : '';

      // Opciones de upload según tipo de archivo
      const uploadOptions = {
        folder,
        resource_type: isPdf ? 'raw' : 'image',
        public_id_suffix: publicIdSuffix,
        use_filename: true,
        unique_filename: true
      };

      // Si es imagen, agregar transformaciones
      if (isImage) {
        uploadOptions.transformation = [
          { 
            width: 2000, 
            height: 2000, 
            crop: 'limit',
            quality: 'auto:good', 
            format: 'webp'
          }
        ];
      }

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, uploadOptions);

      // Limpiar archivo temporal
      await fs.unlink(tempFilePath);

      return res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
          createdAt: result.created_at
        }
      });

    } catch (error) {
      console.error('❌ Error uploading invoice file:', error);
      
      // Intentar limpiar archivo temporal si existe
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (unlinkError) {
          console.error('Error deleting temp file:', unlinkError);
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Error al subir el archivo',
        error: error.message
      });
    }
  }

  /**
   * Eliminar archivo de Cloudinary
   * DELETE /api/business/:businessId/upload/file
   */
  static async deleteFile(req, res) {
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;
      const { publicId } = req.body;

      // Validar que el usuario pertenece al negocio
      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar archivos de este negocio'
        });
      }

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el publicId del archivo'
        });
      }

      // Verificar que el publicId contiene el businessId para seguridad adicional
      if (!publicId.includes(businessId)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este archivo'
        });
      }

      // Determinar el resource_type (raw para PDFs, image para imágenes)
      const resourceType = publicId.includes('.pdf') ? 'raw' : 'image';

      // Eliminar de Cloudinary
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      if (result.result === 'ok' || result.result === 'not found') {
        return res.status(200).json({
          success: true,
          message: 'Archivo eliminado exitosamente'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar el archivo',
          result: result.result
        });
      }

    } catch (error) {
      console.error('❌ Error deleting file:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el archivo',
        error: error.message
      });
    }
  }
}

module.exports = CloudinaryController;
