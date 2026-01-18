/**
 * Controlador para Gestión de Inventario
 * 
 * Proporciona endpoints para:
 * - CRUD de productos
 * - Gestión de categorías
 * - Control de stock y movimientos
 * - Alertas de stock mínimo
 * - Reportes de inventario
 * - Valorización de inventario
 */

const BusinessConfigService = require("../services/BusinessConfigService");
const { Product, InventoryMovement, User, BranchStock, Branch } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class BusinessInventoryController {

  // ================================
  // PRODUCTOS - CRUD
  // ================================

  /**
   * Obtener lista de productos
   * GET /business/config/inventory/products
   */
  async getProducts(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        category: req.query.category,
        subcategory: req.query.subcategory,
        brand: req.query.brand,
        supplier: req.query.supplier,
        status: req.query.status || "ACTIVE",
        search: req.query.search,
        lowStock: req.query.lowStock === "true",
        outOfStock: req.query.outOfStock === "true",
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "name",
        sortOrder: req.query.sortOrder || "ASC"
      };

      const result = await BusinessConfigService.getProducts(businessId, filters);

      res.json({
        success: true,
        data: result,
        message: "Productos obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos",
        error: error.message
      });
    }
  }

  /**
   * Obtener producto por ID
   * GET /business/config/inventory/products/:id
   */
  async getProduct(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;

      const product = await BusinessConfigService.getProduct(businessId, productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado"
        });
      }

      res.json({
        success: true,
        data: product,
        message: "Producto obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener producto",
        error: error.message
      });
    }
  }

  /**
   * Crear nuevo producto
   * POST /business/config/inventory/products
   */
  async createProduct(req, res) {
    try {
      const businessId = req.business.id;
      const productData = {
        ...req.body,
        businessId
      };

      const product = await BusinessConfigService.createProduct(businessId, productData);

      res.status(201).json({
        success: true,
        data: product,
        message: "Producto creado exitosamente"
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear producto",
        error: error.message
      });
    }
  }

  /**
   * Actualizar producto
   * PUT /business/config/inventory/products/:id
   */
  async updateProduct(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;
      const updateData = req.body;

      const product = await BusinessConfigService.updateProduct(businessId, productId, updateData);

      res.json({
        success: true,
        data: product,
        message: "Producto actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar producto",
        error: error.message
      });
    }
  }

  /**
   * Eliminar producto
   * DELETE /business/config/inventory/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;

      await BusinessConfigService.deleteProduct(businessId, productId);

      res.json({
        success: true,
        message: "Producto eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar producto",
        error: error.message
      });
    }
  }

  // ================================
  // CATEGORÍAS
  // ================================

  /**
   * Obtener categorías
   * GET /business/config/inventory/categories
   */
  async getCategories(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        status: req.query.status || "ACTIVE",
        search: req.query.search,
        includeProductCount: req.query.includeProductCount === "true"
      };

      const categories = await BusinessConfigService.getProductCategories(businessId, filters);

      res.json({
        success: true,
        data: categories,
        message: "Categorías obtenidas exitosamente"
      });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener categorías",
        error: error.message
      });
    }
  }

  /**
   * Crear categoría
   * POST /business/config/inventory/categories
   */
  async createCategory(req, res) {
    try {
      const businessId = req.business.id;
      const categoryData = {
        ...req.body,
        businessId
      };

      const category = await BusinessConfigService.createProductCategory(businessId, categoryData);

      res.status(201).json({
        success: true,
        data: category,
        message: "Categoría creada exitosamente"
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear categoría",
        error: error.message
      });
    }
  }

  /**
   * Actualizar categoría
   * PUT /business/config/inventory/categories/:id
   */
  async updateCategory(req, res) {
    try {
      const businessId = req.business.id;
      const categoryId = req.params.id;
      const updateData = req.body;

      const category = await BusinessConfigService.updateProductCategory(businessId, categoryId, updateData);

      res.json({
        success: true,
        data: category,
        message: "Categoría actualizada exitosamente"
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar categoría",
        error: error.message
      });
    }
  }

  // ================================
  // STOCK Y MOVIMIENTOS
  // ================================

  /**
   * Cambiar estado de producto
   * PATCH /business/config/inventory/products/:id/status
   */
  async toggleProductStatus(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;
      const { status } = req.body;

      const product = await BusinessConfigService.updateProduct(businessId, productId, { status });

      res.json({
        success: true,
        data: product,
        message: "Estado del producto actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar estado del producto",
        error: error.message
      });
    }
  }

  /**
   * Obtener niveles de stock
   * GET /business/config/inventory/stock-levels
   */
  async getStockLevels(req, res) {
    try {
      const businessId = req.business.id;
      const { lowStockOnly } = req.query;

      const stockLevels = await BusinessConfigService.getStockLevels(businessId, lowStockOnly === 'true');

      res.json({
        success: true,
        data: stockLevels,
        message: "Niveles de stock obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error getting stock levels:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener niveles de stock",
        error: error.message
      });
    }
  }

  /**
   * Ajustar stock
   * POST /business/config/inventory/products/:id/adjust-stock
   */
  async adjustStock(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;
      const { quantity, reason, notes } = req.body;

      const movement = await BusinessConfigService.adjustProductStock(businessId, productId, {
        quantity,
        reason,
        notes,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: movement,
        message: "Stock ajustado exitosamente"
      });
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({
        success: false,
        message: "Error al ajustar stock",
        error: error.message
      });
    }
  }

  /**
   * Establecer stock inicial
   * POST /business/config/inventory/products/:id/initial-stock
   */
  async setInitialStock(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;
      const { quantity, notes } = req.body;

      const movement = await BusinessConfigService.setInitialStock(businessId, productId, {
        quantity,
        notes,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: movement,
        message: "Stock inicial establecido exitosamente"
      });
    } catch (error) {
      console.error("Error setting initial stock:", error);
      res.status(500).json({
        success: false,
        message: "Error al establecer stock inicial",
        error: error.message
      });
    }
  }

  /**
   * Transferir stock
   * POST /business/config/inventory/transfer-stock
   */
  async transferStock(req, res) {
    try {
      const businessId = req.business.id;
      const { fromProductId, toProductId, quantity, reason, notes } = req.body;

      const transfer = await BusinessConfigService.transferStock(businessId, {
        fromProductId,
        toProductId,
        quantity,
        reason,
        notes,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: transfer,
        message: "Transferencia de stock completada exitosamente"
      });
    } catch (error) {
      console.error("Error transferring stock:", error);
      res.status(500).json({
        success: false,
        message: "Error al transferir stock",
        error: error.message
      });
    }
  }

  /**
   * Retirar productos del inventario (consumo por especialistas)
   * POST /business/config/inventory/withdraw-stock
   * 
   * Permite a especialistas/personal retirar productos del inventario
   * para consumo interno (ej: shampoo, tintes, etc.)
   * 
   * Roles permitidos: BUSINESS, SPECIALIST, RECEPTIONIST, RECEPTIONIST_SPECIALIST
   * Roles NO permitidos: OWNER, CLIENT
   */
  async withdrawStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const businessId = req.business.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Validar que el usuario tenga permisos para retirar stock
      const allowedRoles = ['BUSINESS', 'SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'];
      if (!allowedRoles.includes(userRole)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para retirar productos del inventario"
        });
      }

      const { productId, quantity, unit, notes, branchId } = req.body;

      // Validaciones
      if (!productId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "ID de producto requerido"
        });
      }

      if (!quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Cantidad debe ser mayor a 0"
        });
      }

      // Obtener producto
      const product = await Product.findOne({
        where: { id: productId, businessId, isActive: true },
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado o inactivo"
        });
      }

      // Verificar que el producto sea apto para procedimientos
      if (!['FOR_PROCEDURES', 'BOTH'].includes(product.productType)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `El producto "${product.name}" no está marcado como apto para uso en procedimientos`
        });
      }

      // Obtener usuario para incluir su nombre
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role'],
        transaction
      });

      let branchStock = null;
      let previousStock = 0;
      let newStock = 0;

      // Si se especifica sucursal, verificar stock por sucursal
      if (branchId) {
        // Verificar que la sucursal existe y pertenece al negocio
        const branch = await Branch.findOne({
          where: { id: branchId, businessId },
          transaction
        });

        if (!branch) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: "Sucursal no encontrada"
          });
        }

        // Obtener stock de la sucursal
        branchStock = await BranchStock.findOne({
          where: { productId, branchId },
          transaction
        });

        if (!branchStock) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `El producto "${product.name}" no tiene stock registrado en esta sucursal`
          });
        }

        previousStock = branchStock.currentStock || 0;

        // Verificar stock disponible
        if (product.trackInventory && previousStock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente en sucursal. Disponible: ${previousStock}, Requerido: ${quantity}`
          });
        }

        // Actualizar stock de sucursal
        newStock = previousStock - parseFloat(quantity);
        await branchStock.update({
          currentStock: newStock,
          lastMovementAt: new Date()
        }, { transaction });

      } else {
        // Stock general del producto
        previousStock = product.currentStock || 0;

        // Verificar stock disponible
        if (product.trackInventory && previousStock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente. Disponible: ${previousStock}, Requerido: ${quantity}`
          });
        }

        // Actualizar stock general
        newStock = previousStock - parseFloat(quantity);
        await product.update({
          currentStock: newStock
        }, { transaction });
      }

      // Crear movimiento de inventario
      const movement = await InventoryMovement.create({
        businessId,
        productId,
        userId,
        branchId: branchId || null,
        movementType: 'ADJUSTMENT',
        quantity: -parseFloat(quantity), // Negativo porque es retiro
        previousStock,
        newStock,
        reason: 'STAFF_CONSUMPTION',
        notes: notes || `Retiro por ${user?.name || 'personal'} - ${unit || 'unidad'}`,
        referenceType: 'WITHDRAWAL',
        unitCost: product.cost || 0,
        totalCost: (product.cost || 0) * parseFloat(quantity),
        metadata: {
          withdrawnBy: {
            userId: user.id,
            userName: user.name,
            userRole: user.role
          },
          unit: unit || 'unidad',
          quantity: parseFloat(quantity)
        }
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        data: {
          movement: {
            id: movement.id,
            productId,
            productName: product.name,
            quantity: parseFloat(quantity),
            unit: unit || 'unidad',
            previousStock,
            newStock,
            branchId: branchId || null,
            withdrawnBy: user.name,
            createdAt: movement.createdAt
          }
        },
        message: "Retiro de stock registrado exitosamente"
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error withdrawing stock:", error);
      res.status(500).json({
        success: false,
        message: "Error al retirar stock",
        error: error.message
      });
    }
  }

  /**
   * Obtener historial de retiros de stock
   * GET /business/config/inventory/withdrawals
   * 
   * Permite ver todos los retiros de stock por especialistas
   * Filtros: userId, productId, dateFrom, dateTo, branchId
   */
  async getWithdrawals(req, res) {
    try {
      const businessId = req.business.id;
      const {
        userId,
        productId,
        branchId,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const where = {
        businessId,
        movementType: 'ADJUSTMENT',
        reason: 'STAFF_CONSUMPTION',
        quantity: { [Op.lt]: 0 } // Solo retiros (cantidades negativas)
      };

      // Aplicar filtros
      if (userId) where.userId = userId;
      if (productId) where.productId = productId;
      if (branchId) where.branchId = branchId;

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = endDate;
        }
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: movements } = await InventoryMovement.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'category', 'unit', 'images']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]]
      });

      // Calcular totales
      const totalQuantityWithdrawn = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const totalCost = movements.reduce((sum, m) => sum + (m.totalCost || 0), 0);

      res.json({
        success: true,
        data: {
          withdrawals: movements.map(m => ({
            id: m.id,
            product: m.product,
            quantity: Math.abs(m.quantity), // Mostrar como positivo
            unit: m.metadata?.unit || 'unidad',
            previousStock: m.previousStock,
            newStock: m.newStock,
            totalCost: m.totalCost,
            withdrawnBy: m.user,
            branch: m.branch,
            notes: m.notes,
            createdAt: m.createdAt
          })),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          },
          summary: {
            totalWithdrawals: count,
            totalQuantityWithdrawn,
            totalCost
          }
        },
        message: "Historial de retiros obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error getting withdrawals:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener historial de retiros",
        error: error.message
      });
    }
  }

  /**
   * Obtener productos con stock bajo
   * GET /business/config/inventory/low-stock
   */
  async getLowStockProducts(req, res) {
    try {
      const businessId = req.business.id;

      const products = await BusinessConfigService.getLowStockProducts(businessId);

      res.json({
        success: true,
        data: products,
        message: "Productos con stock bajo obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error getting low stock products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos con stock bajo",
        error: error.message
      });
    }
  }

  /**
   * Obtener productos próximos a vencer
   * GET /business/config/inventory/expiring
   */
  async getExpiringProducts(req, res) {
    try {
      const businessId = req.business.id;
      const { days } = req.query;

      const products = await BusinessConfigService.getExpiringProducts(businessId, days ? parseInt(days) : 30);

      res.json({
        success: true,
        data: products,
        message: "Productos próximos a vencer obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error getting expiring products:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener productos próximos a vencer",
        error: error.message
      });
    }
  }

  /**
   * Obtener movimientos de inventario
   * GET /business/config/inventory/movements
   */
  async getInventoryMovements(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        productId: req.query.productId,
        type: req.query.type,
        userId: req.query.userId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      const result = await BusinessConfigService.getInventoryMovements(businessId, filters);

      res.json({
        success: true,
        data: result,
        message: "Movimientos de inventario obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error getting inventory movements:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener movimientos de inventario",
        error: error.message
      });
    }
  }

  /**
   * Obtener movimiento específico
   * GET /business/config/inventory/movements/:id
   */
  async getInventoryMovement(req, res) {
    try {
      const businessId = req.business.id;
      const movementId = req.params.id;

      const movement = await BusinessConfigService.getInventoryMovement(businessId, movementId);

      if (!movement) {
        return res.status(404).json({
          success: false,
          message: "Movimiento no encontrado"
        });
      }

      res.json({
        success: true,
        data: movement,
        message: "Movimiento obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error getting inventory movement:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener movimiento",
        error: error.message
      });
    }
  }

  /**
   * Crear movimiento de inventario
   * POST /business/config/inventory/movements
   */
  async createInventoryMovement(req, res) {
    try {
      const businessId = req.business.id;
      const movementData = {
        ...req.body,
        businessId,
        userId: req.user.id
      };

      const movement = await BusinessConfigService.createInventoryMovement(businessId, movementData);

      res.status(201).json({
        success: true,
        data: movement,
        message: "Movimiento creado exitosamente"
      });
    } catch (error) {
      console.error("Error creating inventory movement:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear movimiento",
        error: error.message
      });
    }
  }

  /**
   * Obtener categorías de productos (alias para compatibilidad)
   * GET /business/config/inventory/categories
   */
  async getProductCategories(req, res) {
    return await this.getCategories(req, res);
  }

  /**
   * Obtener resumen de inventario
   * GET /business/config/inventory/summary
   */
  async getInventorySummary(req, res) {
    try {
      const businessId = req.business.id;

      const summary = await BusinessConfigService.getInventorySummary(businessId);

      res.json({
        success: true,
        data: summary,
        message: "Resumen de inventario obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error getting inventory summary:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener resumen de inventario",
        error: error.message
      });
    }
  }

  /**
   * Obtener valorización de inventario
   * GET /business/config/inventory/valuation
   */
  async getInventoryValuation(req, res) {
    try {
      const businessId = req.business.id;
      const { method, date } = req.query;

      const valuation = await BusinessConfigService.getInventoryValuation(businessId, { method, date });

      res.json({
        success: true,
        data: valuation,
        message: "Valorización de inventario obtenida exitosamente"
      });
    } catch (error) {
      console.error("Error getting inventory valuation:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener valorización de inventario",
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de movimientos
   * GET /business/config/inventory/movement-stats
   */
  async getMovementStats(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        period: req.query.period || 'month',
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const stats = await BusinessConfigService.getMovementStats(businessId, filters);

      res.json({
        success: true,
        data: stats,
        message: "Estadísticas de movimientos obtenidas exitosamente"
      });
    } catch (error) {
      console.error("Error getting movement stats:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas de movimientos",
        error: error.message
      });
    }
  }

  /**
   * Obtener análisis ABC
   * GET /business/config/inventory/abc-analysis
   */
  async getABCAnalysis(req, res) {
    try {
      const businessId = req.business.id;

      const analysis = await BusinessConfigService.getABCAnalysis(businessId);

      res.json({
        success: true,
        data: analysis,
        message: "Análisis ABC obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error getting ABC analysis:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener análisis ABC",
        error: error.message
      });
    }
  }

  /**
   * Subir imagen de producto
   * POST /business/config/inventory/products/:id/images
   */
  async uploadProductImage(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ninguna imagen"
        });
      }

      const result = await BusinessConfigService.uploadProductImage(businessId, productId, req.file);

      res.json({
        success: true,
        data: result,
        message: "Imagen subida exitosamente"
      });
    } catch (error) {
      console.error("Error uploading product image:", error);
      res.status(500).json({
        success: false,
        message: "Error al subir imagen",
        error: error.message
      });
    }
  }

  /**
   * Eliminar imagen de producto
   * DELETE /business/config/inventory/products/:id/images/:imageId
   */
  async deleteProductImage(req, res) {
    try {
      const businessId = req.business.id;
      const productId = req.params.id;
      const imageId = req.params.imageId;

      const result = await BusinessConfigService.deleteProductImage(businessId, productId, imageId);

      res.json({
        success: true,
        data: result,
        message: "Imagen eliminada exitosamente"
      });
    } catch (error) {
      console.error("Error deleting product image:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar imagen",
        error: error.message
      });
    }
  }

  // ================================
  // ALERTAS Y CONFIGURACIÓN
  // ================================

  /**
   * Configurar alertas de inventario
   * PUT /business/config/inventory/alerts
   */
  async configureInventoryAlerts(req, res) {
    try {
      const businessId = req.business.id;
      const alertConfig = req.body;

      const config = await BusinessConfigService.configureInventoryAlerts(businessId, alertConfig);

      res.json({
        success: true,
        data: config,
        message: "Configuración de alertas actualizada exitosamente"
      });
    } catch (error) {
      console.error("Error configuring inventory alerts:", error);
      res.status(500).json({
        success: false,
        message: "Error al configurar alertas",
        error: error.message
      });
    }
  }

  /**
   * Obtener configuración de alertas
   * GET /business/config/inventory/alerts
   */
  async getInventoryAlertsConfig(req, res) {
    try {
      const businessId = req.business.id;

      const config = await BusinessConfigService.getInventoryAlerts(businessId);

      res.json({
        success: true,
        data: config,
        message: "Configuración de alertas obtenida exitosamente"
      });
    } catch (error) {
      console.error("Error getting inventory alerts config:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener configuración de alertas",
        error: error.message
      });
    }
  }
}

module.exports = new BusinessInventoryController();
