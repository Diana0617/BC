const SupplierCatalogItem = require('../models/SupplierCatalogItem');
const SupplierInvoice = require('../models/SupplierInvoice');
const Supplier = require('../models/Supplier');
const { Op } = require('sequelize');

class SupplierCatalogService {
  /**
   * Poblar catálogo desde items de factura
   * Se ejecuta cuando una factura es aprobada
   */
  static async populateFromInvoice(invoiceId) {
    try {
      const invoice = await SupplierInvoice.findByPk(invoiceId);
      
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      const items = invoice.items || [];
      const createdItems = [];

      for (const item of items) {
        // Buscar si ya existe el item en el catálogo
        const existingItem = await SupplierCatalogItem.findOne({
          where: {
            supplierId: invoice.supplierId,
            supplierSku: item.sku || item.code || `ITEM-${item.name.substring(0, 20)}`
          }
        });

        const catalogData = {
          supplierId: invoice.supplierId,
          supplierSku: item.sku || item.code || `ITEM-${item.name.substring(0, 20)}`,
          name: item.name || item.description,
          description: item.description || item.name,
          category: item.category || 'Sin categoría',
          brand: item.brand || null,
          price: parseFloat(item.price) || 0,
          currency: invoice.currency || 'COP',
          unit: item.unit || 'unidad',
          available: true,
          lastUpdate: new Date(),
          specifications: item.specifications || {}
        };

        if (existingItem) {
          // Actualizar item existente con nueva información
          await existingItem.update({
            ...catalogData,
            // Mantener imágenes existentes si las hay
            images: existingItem.images || []
          });
          createdItems.push(existingItem);
        } else {
          // Crear nuevo item en el catálogo
          const newItem = await SupplierCatalogItem.create(catalogData);
          createdItems.push(newItem);
        }
      }

      return {
        success: true,
        itemsProcessed: createdItems.length,
        items: createdItems
      };
    } catch (error) {
      console.error('Error populating catalog from invoice:', error);
      throw error;
    }
  }

  /**
   * Obtener catálogo con filtros
   */
  static async getCatalog(businessId, filters = {}) {
    try {
      const { 
        supplierId, 
        category, 
        available, 
        search,
        minPrice,
        maxPrice,
        page = 1, 
        limit = 50 
      } = filters;

      const where = {};

      // Filtrar por proveedor
      if (supplierId) {
        where.supplierId = supplierId;
      } else {
        // Solo traer items de proveedores del negocio
        const suppliers = await Supplier.findAll({
          where: { businessId },
          attributes: ['id']
        });
        where.supplierId = {
          [Op.in]: suppliers.map(s => s.id)
        };
      }

      // Filtros adicionales
      if (category) where.category = category;
      if (available !== undefined) where.available = available === 'true';
      
      // Búsqueda por nombre o SKU
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { supplierSku: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtro por rango de precio
      if (minPrice) where.price = { ...where.price, [Op.gte]: minPrice };
      if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };

      const offset = (page - 1) * limit;

      const result = await SupplierCatalogItem.findAndCountAll({
        where,
        include: [{
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'email', 'phone']
        }],
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit)
      };
    } catch (error) {
      console.error('Error getting catalog:', error);
      throw error;
    }
  }

  /**
   * Obtener categorías disponibles en el catálogo
   */
  static async getCategories(businessId) {
    try {
      const suppliers = await Supplier.findAll({
        where: { businessId },
        attributes: ['id']
      });

      const categories = await SupplierCatalogItem.findAll({
        where: {
          supplierId: {
            [Op.in]: suppliers.map(s => s.id)
          }
        },
        attributes: ['category'],
        group: ['category'],
        raw: true
      });

      return categories
        .map(c => c.category)
        .filter(c => c && c !== 'Sin categoría')
        .sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Actualizar imágenes de un item del catálogo
   */
  static async updateImages(itemId, imageData) {
    try {
      const item = await SupplierCatalogItem.findByPk(itemId);
      
      if (!item) {
        throw new Error('Item no encontrado');
      }

      const currentImages = item.images || [];
      currentImages.push(imageData);

      item.changed('images', true);
      item.images = currentImages;
      await item.save();

      return {
        success: true,
        data: item
      };
    } catch (error) {
      console.error('Error updating catalog item images:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen de un item del catálogo
   */
  static async deleteImage(itemId, imageIndex) {
    try {
      const item = await SupplierCatalogItem.findByPk(itemId);
      
      if (!item) {
        throw new Error('Item no encontrado');
      }

      const currentImages = item.images || [];
      const index = parseInt(imageIndex);

      if (index < 0 || index >= currentImages.length) {
        throw new Error('Índice de imagen inválido');
      }

      currentImages.splice(index, 1);

      item.changed('images', true);
      item.images = currentImages;
      await item.save();

      return {
        success: true,
        data: item
      };
    } catch (error) {
      console.error('Error deleting catalog item image:', error);
      throw error;
    }
  }
}

module.exports = SupplierCatalogService;
