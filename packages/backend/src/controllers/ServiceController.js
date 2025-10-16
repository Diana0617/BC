const { Service, Business, User } = require('../models');
const { Op } = require('sequelize');

class ServiceController {
  // POST /api/services - Crear un nuevo servicio
  static async createService(req, res) {
    try {
      console.log('=== DEBUG SERVICE CREATION ===');
      console.log('req.user:', JSON.stringify(req.user, null, 2));
      console.log('req.user.business:', JSON.stringify(req.user.business, null, 2));
      console.log('================================');

      const businessId = req.user.businessId;
      const { 
        name, 
        description, 
        category, 
        duration, 
        price,
        color,
        preparationTime,
        cleanupTime,
        requiresConsent,
        consentTemplateId,
        isActive = true 
      } = req.body;

      // Validaciones básicas
      if (!name || !duration || !price) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, duración y precio son requeridos'
        });
      }

      if (duration <= 0 || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Duración debe ser mayor a 0 y precio no puede ser negativo'
        });
      }

      // Verificar que el negocio existe
      const business = await Business.findByPk(businessId);
      if (!business) {
        console.log('❌ Business not found with ID:', businessId);
        return res.status(404).json({
          success: false,
          message: 'Negocio no encontrado'
        });
      }

      console.log('✅ Business found:', business.name, 'Status:', business.status);

      // Crear el servicio
      const service = await Service.create({
        businessId,
        name: name.trim(),
        description: description?.trim(),
        category: category?.trim(),
        duration,
        price,
        color: color || '#3B82F6',
        preparationTime: preparationTime || 0,
        cleanupTime: cleanupTime || 0,
        requiresConsent: requiresConsent || false,
        consentTemplateId: requiresConsent ? consentTemplateId : null,
        isActive
      });

      res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear servicio',
        error: error.message
      });
    }
  }

  // GET /api/services - Obtener servicios del negocio
  static async getServices(req, res) {
    try {
      const businessId = req.user.businessId;
      const { category, search, page = 1, limit = 50 } = req.query;

      const whereClause = { businessId };

      if (category) {
        whereClause.category = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows: services } = await Service.findAndCountAll({
        where: whereClause,
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          services,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios',
        error: error.message
      });
    }
  }

  // GET /api/services/:id - Obtener un servicio específico
  static async getServiceById(req, res) {
    try {
      const businessId = req.user.businessId;
      const { id } = req.params;

      const service = await Service.findOne({
        where: {
          id,
          businessId
        }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicio',
        error: error.message
      });
    }
  }

  // PUT /api/services/:id - Actualizar un servicio
  static async updateService(req, res) {
    try {
      const businessId = req.user.businessId;
      const { id } = req.params;
      const { 
        name, 
        description, 
        category, 
        duration, 
        price, 
        color,
        preparationTime,
        cleanupTime,
        requiresConsent,
        consentTemplateId,
        images,
        isActive 
      } = req.body;

      console.log('📥 updateService received:', { 
        id, 
        businessId,
        name,
        images: images?.length ? `Array[${images.length}]` : images,
        body: req.body 
      });

      const service = await Service.findOne({
        where: { id, businessId }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      const updateData = {
        name: name?.trim(),
        description: description?.trim(),
        category: category?.trim(),
        duration,
        price,
        color,
        preparationTime,
        cleanupTime,
        requiresConsent,
        consentTemplateId: requiresConsent ? consentTemplateId : null,
        images: images !== undefined ? images : service.images, // Actualizar imágenes si se envían
        isActive
      };

      console.log('🔄 Updating service with:', updateData);

      await service.update(updateData);

      res.json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('❌ Error updating service:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Si es un error de validación de Sequelize
      if (error.name === 'SequelizeValidationError') {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
          }))
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al actualizar servicio',
        error: error.message
      });
    }
  }

  // DELETE /api/services/:id - Eliminar un servicio
  static async deleteService(req, res) {
    try {
      const businessId = req.user.businessId;
      const { id } = req.params;

      const service = await Service.findOne({
        where: { id, businessId }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      await service.update({ isActive: false });

      res.json({
        success: true,
        message: 'Servicio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar servicio',
        error: error.message
      });
    }
  }

  // GET /api/services/categories - Obtener categorías de servicios del negocio
  static async getCategories(req, res) {
    try {
      const businessId = req.user.businessId;

      const categories = await Service.findAll({
        where: {
          businessId,
          category: { [Op.ne]: null },
          isActive: true
        },
        attributes: ['category'],
        group: ['category'],
        raw: true
      });

      const categoryList = categories.map(c => c.category).filter(Boolean);

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
        error: error.message
      });
    }
  }

  // POST /api/services/:id/upload-image - Subir imagen del servicio
  static async uploadServiceImage(req, res) {
    try {
      const businessId = req.user.businessId;
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const service = await Service.findOne({
        where: { id, businessId }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado'
        });
      }

      // Subir a Cloudinary
      const cloudinary = require('../config/cloudinary');
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `beauty-control/services/${businessId}/${id}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      // Actualizar array de imágenes del servicio
      const currentImages = service.images || [];
      const newImages = [...currentImages, result.secure_url];

      await service.update({
        images: newImages
      });

      res.json({
        success: true,
        data: {
          imageUrl: result.secure_url,
          images: newImages
        },
        message: 'Imagen subida exitosamente'
      });

    } catch (error) {
      console.error('Error uploading service image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir imagen',
        error: error.message
      });
    }
  }
}

module.exports = ServiceController;
