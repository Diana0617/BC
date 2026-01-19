const { 
  BranchStock, 
  Product, 
  Branch, 
  InventoryMovement,
  Business,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador para gestión de inventario por sucursal
 * Maneja stock independiente por cada sucursal del negocio
 */
class BranchInventoryController {

  /**
   * Obtener todos los productos con su stock en una sucursal
   * GET /api/branches/:branchId/inventory/products
   */
  static async getBranchProducts(req, res) {
    try {
      const { branchId } = req.params;
      const { businessId } = req.user;
      const { 
        search, 
        category, 
        productType,
        stockStatus, // 'LOW_STOCK', 'OUT_OF_STOCK', 'OK', 'OVERSTOCK'
        page = 1, 
        limit = 50 
      } = req.query;

      // Verificar que la sucursal pertenezca al negocio
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      // Construir filtros para productos
      const productWhere = { businessId, isActive: true };
      
      if (search) {
        productWhere[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (category) {
        productWhere.category = category;
      }

      if (productType) {
        productWhere.productType = productType;
      }

      const offset = (page - 1) * limit;

      // Obtener productos con su stock en la sucursal
      const { count, rows: products } = await Product.findAndCountAll({
        where: productWhere,
        include: [{
          model: BranchStock,
          as: 'branchStocks',
          where: { branchId },
          required: false // LEFT JOIN para incluir productos sin stock
        }],
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']]
      });

      // Formatear respuesta con información de stock
      let formattedProducts = products.map(product => {
        const stock = product.branchStocks && product.branchStocks[0];
        const currentStock = stock ? stock.currentStock : 0;
        const minStock = stock ? stock.minStock : 0;
        const maxStock = stock ? stock.maxStock : null;

        let stockStatus = 'OK';
        if (currentStock === 0) stockStatus = 'OUT_OF_STOCK';
        else if (currentStock <= minStock) stockStatus = 'LOW_STOCK';
        else if (maxStock && currentStock >= maxStock) stockStatus = 'OVERSTOCK';

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
          brand: product.brand,
          price: product.price,
          cost: product.cost,
          unit: product.unit,
          productType: product.productType,
          requiresSpecialistTracking: product.requiresSpecialistTracking,
          images: product.images,
          currentStock,
          minStock,
          maxStock,
          stockStatus,
          stockId: stock ? stock.id : null,
          lastCountDate: stock ? stock.lastCountDate : null
        };
      });

      // Filtrar por estado de stock si se especifica
      if (stockStatus) {
        formattedProducts = formattedProducts.filter(p => p.stockStatus === stockStatus);
      }

      return res.json({
        success: true,
        data: {
          products: formattedProducts,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          },
          branch: {
            id: branch.id,
            name: branch.name
          }
        }
      });

    } catch (error) {
      console.error('Error getting branch products:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener productos de la sucursal',
        details: error.message
      });
    }
  }

  /**
   * Obtener stock de un producto específico en una sucursal
   * GET /api/branches/:branchId/inventory/products/:productId
   */
  static async getBranchProductStock(req, res) {
    try {
      const { branchId, productId } = req.params;
      const { businessId } = req.user;

      // Verificar permisos
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      const product = await Product.findOne({
        where: { id: productId, businessId }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      // Buscar stock
      const stock = await BranchStock.findOne({
        where: { branchId, productId },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit', 'productType']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!stock) {
        return res.json({
          success: true,
          data: {
            hasStock: false,
            product: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              unit: product.unit
            },
            branch: {
              id: branch.id,
              name: branch.name
            },
            currentStock: 0,
            minStock: 0,
            maxStock: null,
            stockStatus: 'OUT_OF_STOCK'
          }
        });
      }

      return res.json({
        success: true,
        data: {
          hasStock: true,
          id: stock.id,
          product: stock.product,
          branch: stock.branch,
          currentStock: stock.currentStock,
          minStock: stock.minStock,
          maxStock: stock.maxStock,
          stockStatus: stock.getStockStatus(),
          lastCountDate: stock.lastCountDate,
          notes: stock.notes
        }
      });

    } catch (error) {
      console.error('Error getting product stock:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener stock del producto',
        details: error.message
      });
    }
  }

  /**
   * Ajustar stock de un producto en una sucursal
   * POST /api/branches/:branchId/inventory/adjust-stock
   */
  static async adjustBranchStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { branchId } = req.params;
      const { businessId, id: userId } = req.user;
      const { 
        productId, 
        quantity, // puede ser positivo o negativo
        reason, 
        notes,
        unitCost 
      } = req.body;

      // Validaciones
      if (!productId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Se requiere el ID del producto'
        });
      }

      if (quantity === undefined || quantity === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'La cantidad debe ser diferente de cero'
        });
      }

      // Verificar permisos
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      const product = await Product.findOne({
        where: { id: productId, businessId }
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      // Buscar o crear registro de stock
      let stock = await BranchStock.findOne({
        where: { branchId, productId }
      });

      if (!stock) {
        // Crear nuevo registro si no existe
        stock = await BranchStock.create({
          businessId,
          branchId,
          productId,
          currentStock: 0,
          minStock: 0,
          maxStock: null
        }, { transaction });
      }

      // Guardar stock anterior
      const previousStock = stock.currentStock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente. Stock actual: ${previousStock}, cantidad solicitada: ${Math.abs(quantity)}`
        });
      }

      // Actualizar stock
      stock.currentStock = newStock;
      stock.lastCountDate = new Date();
      if (notes) stock.notes = notes;
      await stock.save({ transaction });

      // Crear movimiento de inventario
      const movement = await InventoryMovement.create({
        businessId,
        productId,
        branchId,
        userId,
        movementType: 'ADJUSTMENT',
        quantity: Math.abs(quantity),
        unitCost: unitCost || product.cost,
        totalCost: unitCost ? unitCost * Math.abs(quantity) : product.cost * Math.abs(quantity),
        previousStock,
        newStock,
        reason: reason || 'Ajuste manual de inventario',
        notes: notes || `Ajuste ${quantity > 0 ? 'positivo' : 'negativo'}: ${quantity > 0 ? '+' : ''}${quantity} unidades`
      }, { transaction });

      await transaction.commit();

      return res.json({
        success: true,
        message: 'Stock ajustado correctamente',
        data: {
          stock: {
            id: stock.id,
            productId: stock.productId,
            branchId: stock.branchId,
            previousStock,
            currentStock: stock.currentStock,
            minStock: stock.minStock,
            maxStock: stock.maxStock,
            stockStatus: stock.getStockStatus()
          },
          movement: {
            id: movement.id,
            type: movement.movementType,
            quantity: movement.quantity,
            date: movement.createdAt
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error adjusting stock:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al ajustar stock',
        details: error.message
      });
    }
  }

  /**
   * Cargar stock inicial de múltiples productos en una sucursal
   * POST /api/branches/:branchId/inventory/initial-stock
   */
  static async loadInitialStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { branchId } = req.params;
      const { businessId, id: userId } = req.user;
      const { products } = req.body; // Array de { productId, quantity, unitCost, newProduct? }

      if (!products || !Array.isArray(products) || products.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de productos'
        });
      }

      // Verificar sucursal
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      const results = {
        success: [],
        errors: [],
        created: []
      };

      for (const item of products) {
        try {
          let { productId, quantity, unitCost, newProduct } = item;

          // Si viene newProduct, verificar primero si ya existe un producto con ese SKU
          if (newProduct && productId.startsWith('temp_')) {
            try {
              // Buscar si ya existe un producto con ese SKU
              const existingProduct = await Product.findOne({
                where: { 
                  businessId,
                  sku: newProduct.sku 
                },
                transaction
              });

              if (existingProduct) {
                // Si ya existe, usar ese producto en lugar de crear uno nuevo
                productId = existingProduct.id;
                console.log(`♻️ Usando producto existente: ${existingProduct.name} (${existingProduct.sku})`);
              } else {
                // Si no existe, crear el producto
                const createdProduct = await Product.create({
                  businessId,
                  name: newProduct.name,
                  sku: newProduct.sku,
                  description: newProduct.description || null,
                  barcode: newProduct.barcode || null,
                  category: newProduct.category || 'Sin categoría',
                  price: newProduct.price,
                  cost: newProduct.cost || unitCost,
                  unit: newProduct.unit || 'unidad',
                  trackInventory: true,
                  isActive: true,
                  currentStock: 0,
                  minStock: 0
                }, { transaction });

                productId = createdProduct.id;
                results.created.push({
                  id: createdProduct.id,
                  name: createdProduct.name,
                  sku: createdProduct.sku
                });
                
                console.log(`✅ Producto creado: ${createdProduct.name} (${createdProduct.sku})`);
              }
            } catch (createError) {
              results.errors.push({
                sku: newProduct.sku,
                productName: newProduct.name,
                error: `Error al crear producto: ${createError.message}`
              });
              continue;
            }
          }

          // Verificar producto (ahora debería existir)
          const product = await Product.findOne({
            where: { id: productId, businessId },
            transaction
          });

          if (!product) {
            results.errors.push({
              productId,
              error: 'Producto no encontrado'
            });
            continue;
          }

          // Verificar si ya existe stock
          const existingStock = await BranchStock.findOne({
            where: { branchId, productId },
            transaction
          });

          if (existingStock) {
            results.errors.push({
              productId,
              productName: product.name,
              error: 'Ya existe stock para este producto en esta sucursal'
            });
            continue;
          }

          // Crear registro de stock
          const stock = await BranchStock.create({
            businessId,
            branchId,
            productId,
            currentStock: quantity,
            minStock: 0,
            maxStock: null,
            lastCountDate: new Date()
          }, { transaction });

          // Crear movimiento inicial
          await InventoryMovement.create({
            businessId,
            productId,
            branchId,
            userId,
            movementType: 'INITIAL_STOCK',
            quantity,
            unitCost: unitCost || product.cost,
            totalCost: (unitCost || product.cost) * quantity,
            previousStock: 0,
            newStock: quantity,
            reason: 'Stock inicial',
            notes: `Carga inicial de inventario - ${branch.name}`
          }, { transaction });

          results.success.push({
            productId,
            productName: product.name,
            quantity,
            stockId: stock.id
          });

        } catch (itemError) {
          results.errors.push({
            productId: item.productId,
            error: itemError.message
          });
        }
      }

      await transaction.commit();

      return res.json({
        success: true,
        message: 'Carga de stock inicial completada',
        data: {
          branch: {
            id: branch.id,
            name: branch.name
          },
          summary: {
            total: products.length,
            successful: results.success.length,
            failed: results.errors.length
          },
          results
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error loading initial stock:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al cargar stock inicial',
        details: error.message
      });
    }
  }

  /**
   * Obtener productos con stock bajo en una sucursal
   * GET /api/branches/:branchId/inventory/low-stock
   */
  static async getLowStockProducts(req, res) {
    try {
      const { branchId } = req.params;
      const { businessId } = req.user;

      // Verificar sucursal
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      // Buscar productos con stock bajo
      const lowStockProducts = await BranchStock.findAll({
        where: {
          branchId,
          [Op.and]: [
            sequelize.where(
              sequelize.col('current_stock'),
              '<=',
              sequelize.col('min_stock')
            )
          ]
        },
        include: [{
          model: Product,
          as: 'product',
          where: { isActive: true }
        }],
        order: [[sequelize.col('current_stock'), 'ASC']]
      });

      const formattedProducts = lowStockProducts.map(stock => ({
        stockId: stock.id,
        product: {
          id: stock.product.id,
          name: stock.product.name,
          sku: stock.product.sku,
          category: stock.product.category,
          unit: stock.product.unit
        },
        currentStock: stock.currentStock,
        minStock: stock.minStock,
        deficit: stock.minStock - stock.currentStock,
        stockStatus: stock.getStockStatus(),
        lastCountDate: stock.lastCountDate
      }));

      return res.json({
        success: true,
        data: {
          branch: {
            id: branch.id,
            name: branch.name
          },
          lowStockProducts: formattedProducts,
          total: formattedProducts.length
        }
      });

    } catch (error) {
      console.error('Error getting low stock products:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener productos con stock bajo',
        details: error.message
      });
    }
  }

  /**
   * Actualizar configuración de stock (min/max) para un producto en sucursal
   * PUT /api/branches/:branchId/inventory/products/:productId/config
   */
  static async updateStockConfig(req, res) {
    try {
      const { branchId, productId } = req.params;
      const { businessId } = req.user;
      const { minStock, maxStock, notes } = req.body;

      // Verificar permisos
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      // Buscar o crear stock
      let stock = await BranchStock.findOne({
        where: { branchId, productId }
      });

      if (!stock) {
        // Crear si no existe
        stock = await BranchStock.create({
          businessId,
          branchId,
          productId,
          currentStock: 0,
          minStock: minStock || 0,
          maxStock: maxStock || null,
          notes
        });
      } else {
        // Actualizar configuración
        if (minStock !== undefined) stock.minStock = minStock;
        if (maxStock !== undefined) stock.maxStock = maxStock;
        if (notes !== undefined) stock.notes = notes;
        await stock.save();
      }

      return res.json({
        success: true,
        message: 'Configuración de stock actualizada',
        data: {
          id: stock.id,
          productId: stock.productId,
          branchId: stock.branchId,
          currentStock: stock.currentStock,
          minStock: stock.minStock,
          maxStock: stock.maxStock,
          stockStatus: stock.getStockStatus(),
          notes: stock.notes
        }
      });

    } catch (error) {
      console.error('Error updating stock config:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar configuración de stock',
        details: error.message
      });
    }
  }

  /**
   * Obtener historial de movimientos de un producto en una sucursal
   * GET /api/branches/:branchId/inventory/products/:productId/movements
   */
  static async getProductMovements(req, res) {
    try {
      const { branchId, productId } = req.params;
      const { businessId } = req.user;
      const { 
        startDate, 
        endDate, 
        movementType,
        page = 1, 
        limit = 50 
      } = req.query;

      // Verificar permisos
      const branch = await Branch.findOne({
        where: { id: branchId, businessId }
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          error: 'Sucursal no encontrada'
        });
      }

      const where = {
        branchId,
        productId
      };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      if (movementType) {
        where.movementType = movementType;
      }

      const offset = (page - 1) * limit;

      const { count, rows: movements } = await InventoryMovement.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit']
          },
          {
            model: require('../models/User'),
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      return res.json({
        success: true,
        data: {
          movements,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting product movements:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener movimientos del producto',
        details: error.message
      });
    }
  }
}

module.exports = BranchInventoryController;
