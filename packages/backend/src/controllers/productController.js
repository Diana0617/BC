const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { uploadResponsiveImage } = require('../config/cloudinary');
const { v2: cloudinary } = require('cloudinary');
const SupplierCatalogService = require('../services/SupplierCatalogService');

class ProductController {
  /**
   * Obtener todos los productos del negocio
   */
  async getProducts(req, res) {
    try {
      const { businessId } = req.user;
      const { 
        category, 
        isActive, 
        search, 
        trackInventory,
        lowStock,
        page = 1, 
        limit = 50 
      } = req.query;

      const where = { businessId };

      // Filtros opcionales
      if (category) where.category = category;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (trackInventory !== undefined) where.trackInventory = trackInventory === 'true';
      
      // Búsqueda por nombre, SKU o barcode
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } },
          { barcode: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const products = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']]
      });

      // Filtro de stock bajo
      if (lowStock === 'true') {
        products.rows = products.rows.filter(p => 
          p.trackInventory && p.currentStock <= p.minStock
        );
      }

      // Agregar stock por sucursal
      try {
        console.log('📊 [ProductController] Aggregating branch stock for businessId:', businessId);
        const BranchStock = require('../models/BranchStock');
        // Usar raw:true para obtener resultados planos y nombres de columnas explícitos
        const branchSums = await BranchStock.findAll({
          attributes: [
            [sequelize.col('productId'), 'productId'],
            [sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock']
          ],
          where: { businessId: businessId },
          group: [sequelize.col('productId')],
          raw: true
        });
        console.log('✅ [ProductController] Branch stock aggregated successfully:', branchSums.length, 'products');

        const stockMap = {};
        branchSums.forEach(bs => {
          const pid = bs.productId;
          const total = parseInt(bs.totalStock || 0, 10);
          stockMap[pid] = total;
        });

        // Log de depuración para verificar agregación en runtime
        if (process.env.NODE_ENV === 'development') {
          console.debug('Branch stock sums for business', businessId, stockMap);
        }

        // Asignar currentStock calculado a los productos devueltos
        products.rows = products.rows.map(p => {
          const pid = p.id;
          const aggregated = stockMap[pid];
          if (typeof aggregated !== 'undefined') {
            p.currentStock = aggregated;
          }
          return p;
        });
      } catch (e) {
        console.warn('No se pudo agregar branch stock sums:', e.message || e);
      }

      res.json({
        success: true,
        data: products.rows,
        total: products.count,
        page: parseInt(page),
        totalPages: Math.ceil(products.count / limit)
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos'
      });
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(req, res) {
    try {
      const { businessId } = req.user;
      const { id } = req.params;

      const product = await Product.findOne({
        where: { id, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      // Agregar stock por sucursal
      try {
        const BranchStock = require('../models/BranchStock');
        const sums = await BranchStock.findAll({
          attributes: [[sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock']],
          where: { businessId: businessId, productId: id },
          raw: true
        });
        const total = sums && sums[0] && (sums[0].totalStock || 0);
        if (typeof total !== 'undefined') {
          product.currentStock = parseInt(total, 10) || 0;
        }
        if (process.env.NODE_ENV === 'development') {
          console.debug('Branch stock sum for product', id, 'business', businessId, '=>', product.currentStock);
        }
      } catch (e) {
        console.warn('No se pudo agregar branch stock al producto:', e.message || e);
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener producto'
      });
    }
  }

  /**
   * Crear nuevo producto
   */
  async createProduct(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, userId } = req.user;
      const productData = {
        ...req.body,
        businessId
      };

      // Validar SKU único si se proporciona
      if (productData.sku) {
        const existingSku = await Product.findOne({
          where: { sku: productData.sku, businessId }
        });
        if (existingSku) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Ya existe un producto con este SKU'
          });
        }
      }

      // Validar barcode único si se proporciona
      if (productData.barcode) {
        const existingBarcode = await Product.findOne({
          where: { barcode: productData.barcode }
        });
        if (existingBarcode) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Ya existe un producto con este código de barras'
          });
        }
      }

      const product = await Product.create(productData, { transaction });

      // Si tiene stock inicial, crear movimiento INITIAL_STOCK
      if (productData.currentStock && productData.currentStock > 0) {
        await InventoryMovement.create({
          businessId,
          productId: product.id,
          userId,
          movementType: 'INITIAL_STOCK',
          quantity: productData.currentStock,
          unitCost: productData.cost || 0,
          totalCost: (productData.cost || 0) * productData.currentStock,
          previousStock: 0,
          newStock: productData.currentStock,
          reason: 'Carga inicial de inventario',
          notes: 'Stock inicial al crear producto'
        }, { transaction });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear producto'
      });
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(req, res) {
    try {
      const { businessId } = req.user;
      const { id } = req.params;
      const updates = req.body;

      const product = await Product.findOne({
        where: { id, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      // Validar SKU único si se está actualizando
      if (updates.sku && updates.sku !== product.sku) {
        const existingSku = await Product.findOne({
          where: { sku: updates.sku, businessId, id: { [Op.ne]: id } }
        });
        if (existingSku) {
          return res.status(400).json({
            success: false,
            error: 'Ya existe un producto con este SKU'
          });
        }
      }

      // Validar barcode único si se está actualizando
      if (updates.barcode && updates.barcode !== product.barcode) {
        const existingBarcode = await Product.findOne({
          where: { barcode: updates.barcode, id: { [Op.ne]: id } }
        });
        if (existingBarcode) {
          return res.status(400).json({
            success: false,
            error: 'Ya existe un producto con este código de barras'
          });
        }
      }

      // No permitir actualizar currentStock directamente
      // Debe hacerse a través de movimientos de inventario
      if (updates.currentStock !== undefined) {
        delete updates.currentStock;
      }

      await product.update(updates);

      res.json({
        success: true,
        data: product,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar producto'
      });
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  async deleteProduct(req, res) {
    try {
      const { businessId } = req.user;
      const { id } = req.params;

      const product = await Product.findOne({
        where: { id, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      // Verificar si tiene movimientos
      const hasMovements = await InventoryMovement.count({
        where: { productId: id }
      });

      if (hasMovements > 0) {
        // No eliminar, solo desactivar
        await product.update({ isActive: false });
        return res.json({
          success: true,
          message: 'Producto desactivado (tiene movimientos de inventario)'
        });
      }

      // Si no tiene movimientos, eliminar físicamente
      await product.destroy();

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar producto'
      });
    }
  }

  /**
   * Obtener categorías de productos
   */
  async getCategories(req, res) {
    try {
      const { businessId } = req.user;

      const categories = await Product.findAll({
        where: { 
          businessId,
          category: { [Op.ne]: null }
        },
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category'],
        order: [[sequelize.col('category'), 'ASC']]
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener categorías'
      });
    }
  }

  /**
   * Carga masiva de stock inicial
   */
  async bulkInitialStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, userId } = req.user;
      const { products } = req.body; // Array de { productId, quantity, unitCost }

      if (!Array.isArray(products) || products.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de productos'
        });
      }

      const results = [];
      const errors = [];

      for (const item of products) {
        try {
          const { productId, quantity, unitCost } = item;

          if (!productId || !quantity || quantity <= 0) {
            errors.push({
              productId,
              error: 'Datos inválidos'
            });
            continue;
          }

          const product = await Product.findOne({
            where: { id: productId, businessId },
            transaction
          });

          if (!product) {
            errors.push({
              productId,
              error: 'Producto no encontrado'
            });
            continue;
          }

          // Verificar que no tenga stock previo
          if (product.currentStock > 0) {
            errors.push({
              productId,
              error: 'El producto ya tiene stock registrado'
            });
            continue;
          }

          const previousStock = product.currentStock;
          const newStock = previousStock + quantity;

          // Actualizar stock
          await product.update({ currentStock: newStock }, { transaction });

          // Crear movimiento
          const movement = await InventoryMovement.create({
            businessId,
            productId: product.id,
            userId,
            movementType: 'INITIAL_STOCK',
            quantity,
            unitCost: unitCost || product.cost || 0,
            totalCost: (unitCost || product.cost || 0) * quantity,
            previousStock,
            newStock,
            reason: 'Carga inicial de inventario',
            notes: 'Stock inicial - carga masiva'
          }, { transaction });

          // Agregar producto al catálogo
          try {
            await SupplierCatalogService.addFromInitialStock(
              businessId,
              product.id,
              quantity,
              unitCost || product.cost
            );
          } catch (catalogError) {
            console.error('Error adding to catalog:', catalogError);
            // No fallar si hay error en el catálogo
          }

          results.push({
            productId: product.id,
            productName: product.name,
            quantity,
            newStock,
            movementId: movement.id
          });
        } catch (itemError) {
          errors.push({
            productId: item.productId,
            error: itemError.message
          });
        }
      }

      await transaction.commit();

      res.json({
        success: true,
        data: {
          summary: {
            successful: results.length,
            failed: errors.length,
            total: products.length
          },
          results,
          errors
        },
        message: `Stock inicial cargado: ${results.length} exitosos, ${errors.length} errores`
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in bulk initial stock:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cargar stock inicial'
      });
    }
  }

  /**
   * Subir imagen de producto
   */
  async uploadProductImage(req, res) {
    try {
      const { businessId } = req.user;
      const { id } = req.params;

      console.log('📸 Uploading product image:', { businessId, productId: id, hasFile: !!req.file });

      const product = await Product.findOne({
        where: { id, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ninguna imagen'
        });
      }

      // Subir imagen a Cloudinary con versiones responsivas
      const imageData = await uploadResponsiveImage(
        req.file.path,
        'beauty-control',
        'products'
      );

      console.log('✅ Image uploaded to Cloudinary:', imageData);

      // Agregar nueva imagen al array de imágenes
      const currentImages = product.images || [];
      currentImages.push(imageData);

      // Marcar el campo como cambiado para que Sequelize detecte el cambio en JSONB
      product.changed('images', true);
      product.images = currentImages;
      await product.save();

      console.log('✅ Product updated with new image, total images:', currentImages.length);

      res.json({
        success: true,
        data: imageData,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error uploading product image:', error);
      res.status(500).json({
        success: false,
        error: 'Error al subir la imagen'
      });
    }
  }

  /**
   * Eliminar imagen de producto
   */
  async deleteProductImage(req, res) {
    try {
      const { businessId } = req.user;
      const { id, imageIndex } = req.params;

      const product = await Product.findOne({
        where: { id, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      const currentImages = product.images || [];
      const index = parseInt(imageIndex);

      if (index < 0 || index >= currentImages.length) {
        return res.status(400).json({
          success: false,
          error: 'Índice de imagen inválido'
        });
      }

      const imageToDelete = currentImages[index];

      // Eliminar de Cloudinary
      try {
        if (imageToDelete.main?.public_id) {
          await cloudinary.uploader.destroy(imageToDelete.main.public_id);
        }
        if (imageToDelete.thumbnail?.public_id) {
          await cloudinary.uploader.destroy(imageToDelete.thumbnail.public_id);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continuar aunque falle Cloudinary
      }

      // Eliminar del array
      currentImages.splice(index, 1);
      await product.update({ images: currentImages });

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar la imagen'
      });
    }
  }

  /**
   * Obtener movimientos de inventario de un producto
   */
  async getProductMovements(req, res) {
    try {
      const { businessId } = req.user;
      const { id } = req.params;
      const { 
        startDate, 
        endDate, 
        movementType,
        page = 1, 
        limit = 50 
      } = req.query;

      console.log('🔍 getProductMovements - req.user:', req.user);
      console.log('🔍 getProductMovements - businessId:', businessId);
      console.log('🔍 getProductMovements - productId:', id);

      const product = await Product.findOne({
        where: { id, businessId }
      });

      console.log('🔍 getProductMovements - product found:', product ? 'YES' : 'NO');

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      const where = { 
        businessId,
        productId: id 
      };

      // Filtro por tipo de movimiento (soporta múltiples valores separados por coma)
      if (movementType) {
        const types = movementType.includes(',') 
          ? movementType.split(',').map(t => t.trim())
          : [movementType];
        where.movementType = types.length > 1 ? { [Op.in]: types } : types[0];
      }

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const movements = await InventoryMovement.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            association: 'appointment',
            attributes: ['id', 'startTime', 'appointmentNumber'],
            required: false
          }
        ]
      });

      console.log('🔍 getProductMovements - movements found:', movements.count);
      console.log('🔍 getProductMovements - where filter:', JSON.stringify(where));

      // Calcular resumen por tipo
      const summary = await InventoryMovement.findAll({
        where: { businessId, productId: id },
        attributes: [
          'movementType',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['movementType']
      });

      res.json({
        success: true,
        data: {
          product: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            currentStock: product.currentStock
          },
          movements: movements.rows,
          total: movements.count,
          page: parseInt(page),
          totalPages: Math.ceil(movements.count / limit),
          summary
        }
      });
    } catch (error) {
      console.error('Error getting product movements:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener movimientos'
      });
    }
  }
}

module.exports = new ProductController();
