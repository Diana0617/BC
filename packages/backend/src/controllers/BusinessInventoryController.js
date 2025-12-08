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
