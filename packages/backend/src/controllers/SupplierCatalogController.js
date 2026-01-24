const SupplierCatalogService = require('../services/SupplierCatalogService');
const { uploadResponsiveImage } = require('../config/cloudinary');
const Supplier = require('../models/Supplier');
const CatalogPDFGenerator = require('../utils/CatalogPDFGenerator');

class SupplierCatalogController {
  /**
   * Obtener catálogo de productos de proveedores
   */
  async getCatalog(req, res) {
    try {
      const { businessId } = req.params;
      const filters = req.query;

      console.log('📋 Getting supplier catalog for business:', businessId, 'with filters:', filters);

      const result = await SupplierCatalogService.getCatalog(businessId, filters);

      res.json(result);
    } catch (error) {
      console.error('Error getting supplier catalog:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener catálogo de proveedores',
        error: error.message
      });
    }
  }

  /**
   * Obtener categorías del catálogo
   */
  async getCategories(req, res) {
    try {
      const { businessId } = req.params;

      const categories = await SupplierCatalogService.getCategories(businessId);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting catalog categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
        error: error.message
      });
    }
  }

  /**
   * Obtener proveedores para filtro
   */
  async getSuppliers(req, res) {
    try {
      const { businessId } = req.params;

      const suppliers = await Supplier.findAll({
        where: { businessId },
        attributes: ['id', 'name', 'email', 'phone'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener proveedores',
        error: error.message
      });
    }
  }

  /**
   * Subir imagen a item del catálogo
   */
  async uploadImage(req, res) {
    try {
      const { businessId } = req.params;
      const { id } = req.params;

      console.log('📸 Uploading catalog item image:', { businessId, itemId: id, hasFile: !!req.file });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      // Subir imagen a Cloudinary
      const imageData = await uploadResponsiveImage(
        req.file.path,
        'beauty-control',
        'supplier-catalog'
      );

      console.log('✅ Image uploaded to Cloudinary:', imageData);

      // Actualizar item del catálogo
      const result = await SupplierCatalogService.updateImages(id, imageData);

      console.log('✅ Catalog item updated with new image');

      res.json({
        success: true,
        data: result.data,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error uploading catalog item image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir imagen',
        error: error.message
      });
    }
  }

  /**
   * Eliminar imagen de item del catálogo
   */
  async deleteImage(req, res) {
    try {
      const { id, imageIndex } = req.params;

      const result = await SupplierCatalogService.deleteImage(id, imageIndex);

      res.json({
        success: true,
        data: result.data,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting catalog item image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen',
        error: error.message
      });
    }
  }

  /**
   * Generar PDF del catálogo
   */
  async generatePDF(req, res) {
    try {
      const { businessId } = req.params;
      const filters = req.query;

      console.log('📄 Generating catalog PDF for business:', businessId);

      // Obtener items del catálogo con los filtros aplicados
      const catalogData = await SupplierCatalogService.getCatalog(businessId, {
        ...filters,
        limit: 1000 // Sin paginación para el PDF
      });

      if (!catalogData.success || catalogData.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron items en el catálogo'
        });
      }

      // Obtener información del negocio
      const Business = require('../models/Business');
      const business = await Business.findByPk(businessId, {
        attributes: ['id', 'name', 'address', 'phone', 'email', 'logo']
      });

      // Generar PDF
      const pdfBuffer = await CatalogPDFGenerator.generate(
        catalogData.data,
        business,
        {
          supplierName: filters.supplierName,
          category: filters.category
        }
      );

      console.log('✅ PDF generated successfully, size:', pdfBuffer.length);

      // Enviar PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="catalogo-proveedores-${new Date().toISOString().split('T')[0]}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating catalog PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar PDF',
        error: error.message
      });
    }
  }
}

module.exports = new SupplierCatalogController();
