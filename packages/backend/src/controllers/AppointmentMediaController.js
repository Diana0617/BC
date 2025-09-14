const { Appointment, Service, Business } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { cloudinary } = require('../config/cloudinary');

/**
 * Controlador para gestión de medios y consentimientos en citas
 * Permite subir imágenes, videos y PDFs de consentimiento
 */
class AppointmentMediaController {

  /**
   * Configuración de multer para diferentes tipos de archivos
   */
  static getMulterConfig(allowedTypes = ['image', 'video', 'pdf']) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/temp');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedMimes = [];
      
      if (allowedTypes.includes('image')) {
        allowedMimes.push('image/jpeg', 'image/jpg', 'image/png', 'image/webp');
      }
      if (allowedTypes.includes('video')) {
        allowedMimes.push('video/mp4', 'video/mpeg', 'video/quicktime');
      }
      if (allowedTypes.includes('pdf')) {
        allowedMimes.push('application/pdf');
      }

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
      }
    };

    return multer({
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo
      },
      fileFilter
    });
  }

  /**
   * Subir evidencia del procedimiento (imágenes/videos)
   * POST /api/appointments/:appointmentId/media
   */
  static async uploadEvidence(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.body;
      
      // Verificar que el especialista tenga acceso a la cita
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se han proporcionado archivos'
        });
      }

      const { type = 'after', notes } = req.body; // 'before' o 'after'
      
      if (!['before', 'after'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de evidencia debe ser "before" o "after"'
        });
      }

      const uploadedFiles = [];

      // Subir cada archivo a Cloudinary
      for (const file of req.files) {
        try {
          let resourceType = 'auto';
          if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
          } else if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
          }

          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: resourceType,
            folder: `beauty-control/appointments/${appointmentId}/evidence`,
            public_id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            quality: 'auto:good',
            fetch_format: 'auto'
          });

          uploadedFiles.push({
            url: result.secure_url,
            publicId: result.public_id,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            originalName: file.originalname,
            uploadedAt: new Date(),
            notes: notes || ''
          });

          // Eliminar archivo temporal
          await fs.unlink(file.path).catch(console.error);

        } catch (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          // Continuar con otros archivos
        }
      }

      if (uploadedFiles.length === 0) {
        return res.status(500).json({
          success: false,
          error: 'Error subiendo archivos'
        });
      }

      // Actualizar la evidencia en la cita
      const currentEvidence = appointment.evidence || { before: [], after: [], documents: [] };
      currentEvidence[type] = [...(currentEvidence[type] || []), ...uploadedFiles];

      await appointment.update({
        evidence: currentEvidence
      });

      res.json({
        success: true,
        message: `Evidencia ${type} subida exitosamente`,
        data: {
          appointmentId,
          type,
          filesUploaded: uploadedFiles.length,
          files: uploadedFiles
        }
      });

    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Subir consentimiento informado
   * POST /api/appointments/:appointmentId/consent
   */
  static async uploadConsent(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.body;
      
      // Verificar que el especialista tenga acceso a la cita
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        },
        include: [{
          model: Service,
          attributes: ['id', 'name', 'requiresConsent']
        }]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Archivo de consentimiento requerido'
        });
      }

      // Verificar que sea un PDF
      if (req.file.mimetype !== 'application/pdf') {
        await fs.unlink(req.file.path).catch(console.error);
        return res.status(400).json({
          success: false,
          error: 'El consentimiento debe ser un archivo PDF'
        });
      }

      try {
        // Subir PDF a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw',
          folder: `beauty-control/appointments/${appointmentId}/consent`,
          public_id: `consent-${Date.now()}`,
          format: 'pdf'
        });

        // Actualizar la cita con el consentimiento
        await appointment.update({
          hasConsent: true,
          consentSignedAt: new Date(),
          consentDocument: result.secure_url
        });

        // Eliminar archivo temporal
        await fs.unlink(req.file.path).catch(console.error);

        res.json({
          success: true,
          message: 'Consentimiento subido exitosamente',
          data: {
            appointmentId,
            consentUrl: result.secure_url,
            signedAt: new Date()
          }
        });

      } catch (uploadError) {
        console.error('Error subiendo consentimiento:', uploadError);
        await fs.unlink(req.file.path).catch(console.error);
        
        res.status(500).json({
          success: false,
          error: 'Error subiendo consentimiento'
        });
      }

    } catch (error) {
      console.error('Error en upload de consentimiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener medios de una cita
   * GET /api/appointments/:appointmentId/media
   */
  static async getAppointmentMedia(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      const where = {
        id: appointmentId,
        businessId
      };

      // Aplicar filtros de acceso según el rol
      if (req.specialist) {
        where.specialistId = req.specialist.id;
      }

      const appointment = await Appointment.findOne({
        where,
        attributes: ['id', 'evidence', 'hasConsent', 'consentDocument', 'consentSignedAt'],
        include: [{
          model: Service,
          attributes: ['name', 'requiresConsent']
        }]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          appointmentId,
          evidence: appointment.evidence || { before: [], after: [], documents: [] },
          consent: {
            hasConsent: appointment.hasConsent,
            consentDocument: appointment.consentDocument,
            signedAt: appointment.consentSignedAt,
            required: appointment.Service?.requiresConsent || false
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo medios de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar evidencia específica
   * DELETE /api/appointments/:appointmentId/media/:mediaId
   */
  static async deleteEvidence(req, res) {
    try {
      const { appointmentId, mediaId } = req.params;
      const { businessId } = req.query;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const evidence = appointment.evidence || { before: [], after: [], documents: [] };
      let mediaFound = false;
      let mediaToDelete = null;

      // Buscar el medio en todas las categorías
      ['before', 'after', 'documents'].forEach(category => {
        if (evidence[category]) {
          const mediaIndex = evidence[category].findIndex(media => media.publicId === mediaId);
          if (mediaIndex !== -1) {
            mediaToDelete = evidence[category][mediaIndex];
            evidence[category].splice(mediaIndex, 1);
            mediaFound = true;
          }
        }
      });

      if (!mediaFound) {
        return res.status(404).json({
          success: false,
          error: 'Medio no encontrado'
        });
      }

      try {
        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(mediaToDelete.publicId);
      } catch (cloudinaryError) {
        console.error('Error eliminando de Cloudinary:', cloudinaryError);
        // Continuar aunque falle la eliminación de Cloudinary
      }

      // Actualizar la cita
      await appointment.update({ evidence });

      res.json({
        success: true,
        message: 'Evidencia eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando evidencia:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Validar si una cita puede ser completada
   * Verifica si tiene consentimiento cuando es requerido
   */
  static async validateAppointmentCompletion(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        },
        include: [{
          model: Service,
          attributes: ['name', 'requiresConsent']
        }]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const validationResult = {
        canComplete: true,
        requirements: [],
        warnings: []
      };

      // Verificar consentimiento si es requerido
      if (appointment.Service?.requiresConsent && !appointment.hasConsent) {
        validationResult.canComplete = false;
        validationResult.requirements.push('Consentimiento informado requerido');
      }

      // Verificar evidencia (recomendación)
      const evidence = appointment.evidence || { before: [], after: [] };
      if (evidence.before.length === 0) {
        validationResult.warnings.push('Se recomienda subir fotos del antes del procedimiento');
      }
      if (evidence.after.length === 0) {
        validationResult.warnings.push('Se recomienda subir fotos del después del procedimiento');
      }

      res.json({
        success: true,
        data: validationResult
      });

    } catch (error) {
      console.error('Error validando completación de cita:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = AppointmentMediaController;