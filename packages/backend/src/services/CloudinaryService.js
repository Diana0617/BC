const {
  uploadBusinessLogo,
  uploadUserAvatar,
  uploadAppointmentEvidence,
  uploadConsentDocument,
  uploadServiceImage,
  uploadProductImage,
  uploadPaymentReceipt,
  deleteResponsiveImages,
  deleteVideo,
  deleteDocument
} = require('../config/cloudinary');

class CloudinaryService {
  /**
   * Subir logo de negocio
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} businessId - ID del negocio
   * @returns {Object} URLs y datos de la imagen
   */
  static async uploadBusinessLogo(filePath, businessId) {
    try {
      const result = await uploadBusinessLogo(filePath, businessId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo logo del negocio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir avatar de usuario
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} userId - ID del usuario
   * @returns {Object} URLs y datos de la imagen
   */
  static async uploadUserAvatar(filePath, userId) {
    try {
      const result = await uploadUserAvatar(filePath, userId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo avatar del usuario:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir evidencia de cita (fotos antes/después, videos)
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} appointmentId - ID de la cita
   * @param {String} type - Tipo de evidencia ('before', 'after', 'during')
   * @returns {Object} URLs y datos del archivo
   */
  static async uploadAppointmentEvidence(filePath, appointmentId, type = 'before') {
    try {
      const result = await uploadAppointmentEvidence(filePath, appointmentId, type);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo evidencia de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir documento de consentimiento
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} appointmentId - ID de la cita
   * @returns {Object} URL y datos del documento
   */
  static async uploadConsentDocument(filePath, appointmentId) {
    try {
      const result = await uploadConsentDocument(filePath, appointmentId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo documento de consentimiento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir imagen de servicio
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} businessId - ID del negocio
   * @param {String} serviceId - ID del servicio
   * @returns {Object} URLs y datos de la imagen
   */
  static async uploadServiceImage(filePath, businessId, serviceId) {
    try {
      const result = await uploadServiceImage(filePath, businessId, serviceId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo imagen del servicio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir imagen de producto
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} businessId - ID del negocio
   * @param {String} productId - ID del producto
   * @returns {Object} URLs y datos de la imagen
   */
  static async uploadProductImage(filePath, businessId, productId) {
    try {
      const result = await uploadProductImage(filePath, businessId, productId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error subiendo imagen del producto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Procesar múltiples archivos de evidencia para una cita
   * @param {Array} files - Array de archivos temporales
   * @param {String} appointmentId - ID de la cita
   * @param {String} type - Tipo de evidencia
   * @returns {Object} Array de resultados
   */
  static async uploadMultipleEvidence(files, appointmentId, type = 'before') {
    try {
      const uploadPromises = files.map(file => 
        this.uploadAppointmentEvidence(file.path, appointmentId, type)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      return {
        success: true,
        data: {
          uploaded: successfulUploads.map(result => result.data),
          failed: failedUploads.length,
          total: files.length
        }
      };
    } catch (error) {
      console.error('Error subiendo múltiples evidencias:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar imagen responsiva (main + thumbnail)
   * @param {Object} imageData - Datos de la imagen con public_ids
   * @returns {Object} Resultado de la eliminación
   */
  static async deleteImage(imageData) {
    try {
      const result = await deleteResponsiveImages(imageData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar video
   * @param {String} publicId - Public ID del video en Cloudinary
   * @returns {Object} Resultado de la eliminación
   */
  static async deleteVideo(publicId) {
    try {
      const result = await deleteVideo(publicId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error eliminando video:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar documento
   * @param {String} publicId - Public ID del documento en Cloudinary
   * @returns {Object} Resultado de la eliminación
   */
  static async deleteDocument(publicId) {
    try {
      const result = await deleteDocument(publicId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error eliminando documento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar múltiples archivos de evidencia
   * @param {Array} evidenceArray - Array de evidencias con sus public_ids
   * @returns {Object} Resultado de las eliminaciones
   */
  static async deleteMultipleEvidence(evidenceArray) {
    try {
      const deletePromises = evidenceArray.map(evidence => {
        if (evidence.type === 'image') {
          return this.deleteImage(evidence);
        } else if (evidence.type === 'video') {
          return this.deleteVideo(evidence.public_id);
        } else if (evidence.type === 'document') {
          return this.deleteDocument(evidence.public_id);
        }
      });

      const results = await Promise.all(deletePromises);
      const successful = results.filter(result => result.success).length;
      const failed = results.filter(result => !result.success).length;

      return {
        success: true,
        data: {
          deleted: successful,
          failed,
          total: evidenceArray.length
        }
      };
    } catch (error) {
      console.error('Error eliminando múltiples evidencias:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener información de un archivo por su public_id
   * @param {String} publicId - Public ID en Cloudinary
   * @param {String} resourceType - Tipo de recurso ('image', 'video', 'raw')
   * @returns {Object} Información del archivo
   */
  static async getFileInfo(publicId, resourceType = 'image') {
    try {
      const { cloudinary } = require('../config/cloudinary');
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      return {
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          created_at: result.created_at
        }
      };
    } catch (error) {
      console.error('Error obteniendo información del archivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir comprobante de pago del OWNER
   * @param {String} filePath - Ruta del archivo temporal
   * @param {String} paymentId - ID del pago
   * @returns {Object} URLs y datos del comprobante
   */
  static async uploadPaymentReceipt(filePath, paymentId) {
    try {
      const result = await uploadPaymentReceipt(filePath, paymentId);
      return result; // Ya retorna el formato { success, data/error }
    } catch (error) {
      console.error('Error subiendo comprobante de pago:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CloudinaryService;