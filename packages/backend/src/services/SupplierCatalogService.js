const SupplierCatalogItem = require('../models/SupplierCatalogItem');
const SupplierInvoice = require('../models/SupplierInvoice');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
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
   * Agregar producto de stock inicial al catálogo
   * Se ejecuta cuando se carga stock inicial de un producto
   */
  static async addFromInitialStock(businessId, productId, quantity, unitCost) {
    try {
      const product = await Product.findOne({
        where: { id: productId, businessId }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Buscar si ya existe en el catálogo
      const existingItem = await SupplierCatalogItem.findOne({
        where: {
          businessId,
          supplierSku: product.sku || `STOCK-${productId.substring(0, 8)}`
        }
      });

      const catalogData = {
        businessId,
        supplierId: null, // Sin proveedor (stock propio)
        supplierSku: product.sku || `STOCK-${productId.substring(0, 8)}`,
        name: product.name,
        description: product.description || 'Producto de inventario inicial',
        category: product.category || 'Sin categoría',
        brand: product.brand || null,
        price: unitCost || product.cost || product.price || 0,
        currency: 'COP',
        unit: product.unit || 'unidad',
        available: true,
        lastUpdate: new Date(),
        images: product.images || [],
        specifications: {
          source: 'initial_stock',
          initialQuantity: quantity
        }
      };

      if (existingItem) {
        // Actualizar item existente
        await existingItem.update(catalogData);
        return {
          success: true,
          item: existingItem,
          updated: true
        };
      } else {
        // Crear nuevo item en el catálogo
        const newItem = await SupplierCatalogItem.create(catalogData);
        return {
          success: true,
          item: newItem,
          updated: false
        };
      }
    } catch (error) {
      console.error('Error adding product from initial stock to catalog:', error);
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
        maxPrice
      } = filters;

      // Validar y parsear page y limit
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;

      console.log('🔍 Catalog Service - Input:', { businessId, filters, parsedPage: page, parsedLimit: limit });

      const where = { businessId }; // Siempre filtrar por businessId

      // Filtrar por proveedor
      if (supplierId) {
        where.supplierId = supplierId;
      } else if (supplierId !== undefined) {
        // Si supplierId es explícitamente null, mostrar solo items sin proveedor
        // Si no se especifica, mostrar todos (con y sin proveedor)
      }

      // Filtros adicionales
      if (category) where.category = category;
      if (available !== undefined && available !== null && available !== '') {
        where.available = available === 'true' || available === true;
      }
      
      console.log('🔍 Catalog Service - Where clause:', JSON.stringify(where, null, 2));
      
      // Búsqueda por nombre o SKU
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { supplierSku: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtro por rango de precio
      if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum)) {
          where.price = { ...where.price, [Op.gte]: minPriceNum };
        }
      }
      if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum)) {
          where.price = { ...where.price, [Op.lte]: maxPriceNum };
        }
      }

      const offset = (page - 1) * limit;

      const result = await SupplierCatalogItem.findAndCountAll({
        where,
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'price', 'cost', 'images', 'category', 'brand', 'currentStock']
          }
        ],
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
   * Busca en la tabla Product para obtener todas las categorías reales
   */
  static async getCategories(businessId) {
    try {
      const categories = await Product.findAll({
        where: { 
          businessId,
          category: { [Op.ne]: null }
        },
        attributes: ['category'],
        group: ['category'],
        order: [['category', 'ASC']],
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
