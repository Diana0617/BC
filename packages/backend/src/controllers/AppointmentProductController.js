const { 
  Appointment, 
  Product, 
  InventoryMovement, 
  Service, 
  Client 
} = require('../models');
const { Op, sequelize } = require('sequelize');

/**
 * Controlador para gestión de productos utilizados en procedimientos
 * Permite registrar insumos consumidos durante citas
 */
class AppointmentProductController {

  /**
   * Registrar productos utilizados en un procedimiento
   * POST /api/appointments/:appointmentId/used-products
   */
  static async recordUsedProducts(req, res) {
    const transaction = await sequelize.transaction();
    
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
          attributes: ['id', 'name']
        }]
      });

      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const { products, notes } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Lista de productos requerida'
        });
      }

      const usedProducts = [];
      const inventoryMovements = [];

      // Procesar cada producto
      for (const productUsage of products) {
        const { productId, quantity, unit, notes: productNotes } = productUsage;

        if (!productId || !quantity || quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'ProductId y cantidad válida requeridos para todos los productos'
          });
        }

        // Verificar que el producto pertenezca al negocio y esté activo
        const product = await Product.findOne({
          where: {
            id: productId,
            businessId,
            isActive: true
          }
        });

        if (!product) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Producto ${productId} no encontrado o inactivo`
          });
        }

        // Verificar stock disponible si el producto trackea inventario
        if (product.trackInventory && product.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${quantity}`
          });
        }

        // Registrar uso del producto
        const usedProduct = {
          productId,
          productName: product.name,
          quantity: parseFloat(quantity),
          unit: unit || 'unidades',
          costPrice: product.costPrice || 0,
          totalCost: (product.costPrice || 0) * parseFloat(quantity),
          notes: productNotes || '',
          usedAt: new Date(),
          usedBy: req.specialist.id
        };

        usedProducts.push(usedProduct);

        // Si el producto trackea inventario, crear movimiento de inventario
        if (product.trackInventory) {
          const movementData = {
            businessId,
            productId,
            type: 'USAGE',
            quantity: -parseFloat(quantity), // Negativo porque es consumo
            reason: 'PROCEDURE_USAGE',
            referenceType: 'APPOINTMENT',
            referenceId: appointmentId,
            notes: `Usado en procedimiento: ${appointment.Service.name}`,
            userId: req.specialist.id
          };

          const movement = await InventoryMovement.create(movementData, { transaction });
          inventoryMovements.push(movement);

          // Actualizar stock del producto
          await product.update({
            stock: product.stock - parseFloat(quantity)
          }, { transaction });
        }
      }

      // Actualizar la cita con los productos utilizados
      const currentUsedProducts = appointment.metadata?.usedProducts || [];
      const metadata = appointment.metadata || {};
      metadata.usedProducts = [...currentUsedProducts, ...usedProducts];

      // Calcular costo total de productos utilizados
      const totalProductCost = usedProducts.reduce((sum, product) => sum + product.totalCost, 0);
      metadata.totalProductCost = (metadata.totalProductCost || 0) + totalProductCost;

      await appointment.update({
        metadata,
        specialistNotes: appointment.specialistNotes + 
          (appointment.specialistNotes ? '\n\n' : '') + 
          `Productos utilizados: ${usedProducts.map(p => `${p.productName} (${p.quantity} ${p.unit})`).join(', ')}`
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Productos utilizados registrados exitosamente',
        data: {
          appointmentId,
          usedProducts,
          inventoryMovements: inventoryMovements.length,
          totalCost: totalProductCost
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error registrando productos utilizados:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener productos utilizados en una cita
   * GET /api/appointments/:appointmentId/used-products
   */
  static async getUsedProducts(req, res) {
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
        attributes: ['id', 'metadata'],
        include: [{
          model: Service,
          attributes: ['id', 'name']
        }]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const usedProducts = appointment.metadata?.usedProducts || [];
      const totalProductCost = appointment.metadata?.totalProductCost || 0;

      // Obtener información actualizada de los productos
      const productIds = [...new Set(usedProducts.map(p => p.productId))];
      const products = await Product.findAll({
        where: {
          id: { [Op.in]: productIds },
          businessId
        },
        attributes: ['id', 'name', 'sku', 'stock', 'trackInventory']
      });

      const productMap = {};
      products.forEach(product => {
        productMap[product.id] = product;
      });

      // Enriquecer datos de productos utilizados
      const enrichedUsedProducts = usedProducts.map(usedProduct => ({
        ...usedProduct,
        currentStock: productMap[usedProduct.productId]?.stock || 0,
        trackInventory: productMap[usedProduct.productId]?.trackInventory || false,
        sku: productMap[usedProduct.productId]?.sku || ''
      }));

      res.json({
        success: true,
        data: {
          appointmentId,
          service: appointment.Service,
          usedProducts: enrichedUsedProducts,
          summary: {
            totalProducts: usedProducts.length,
            totalCost: totalProductCost,
            uniqueProducts: productIds.length
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo productos utilizados:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar registro de producto utilizado
   * PUT /api/appointments/:appointmentId/used-products/:productIndex
   */
  static async updateUsedProduct(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { appointmentId, productIndex } = req.params;
      const { businessId } = req.body;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const usedProducts = appointment.metadata?.usedProducts || [];
      const index = parseInt(productIndex);

      if (index < 0 || index >= usedProducts.length) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Producto utilizado no encontrado'
        });
      }

      const { quantity, notes } = req.body;
      const originalProduct = usedProducts[index];
      const originalQuantity = originalProduct.quantity;

      // Validar nueva cantidad
      if (quantity && (isNaN(quantity) || quantity <= 0)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Cantidad debe ser un número positivo'
        });
      }

      // Obtener información del producto
      const product = await Product.findOne({
        where: {
          id: originalProduct.productId,
          businessId
        }
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
      }

      let quantityDifference = 0;
      if (quantity && quantity !== originalQuantity) {
        quantityDifference = parseFloat(quantity) - originalQuantity;

        // Verificar stock si aumenta la cantidad y el producto trackea inventario
        if (quantityDifference > 0 && product.trackInventory && product.stock < quantityDifference) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para aumentar cantidad. Disponible: ${product.stock}`
          });
        }
      }

      // Actualizar el registro
      if (quantity) {
        usedProducts[index].quantity = parseFloat(quantity);
        usedProducts[index].totalCost = (product.costPrice || 0) * parseFloat(quantity);
      }
      if (notes !== undefined) {
        usedProducts[index].notes = notes;
      }
      usedProducts[index].updatedAt = new Date();
      usedProducts[index].updatedBy = req.specialist.id;

      // Si hay cambio en cantidad y el producto trackea inventario
      if (quantityDifference !== 0 && product.trackInventory) {
        // Crear movimiento de ajuste
        await InventoryMovement.create({
          businessId,
          productId: originalProduct.productId,
          type: 'ADJUSTMENT',
          quantity: -quantityDifference, // Negativo porque es consumo adicional
          reason: 'USAGE_ADJUSTMENT',
          referenceType: 'APPOINTMENT',
          referenceId: appointmentId,
          notes: `Ajuste en uso de procedimiento: ${originalQuantity} → ${quantity}`,
          userId: req.specialist.id
        }, { transaction });

        // Actualizar stock
        await product.update({
          stock: product.stock - quantityDifference
        }, { transaction });
      }

      // Recalcular costo total
      const totalProductCost = usedProducts.reduce((sum, p) => sum + p.totalCost, 0);

      // Actualizar metadata
      const metadata = appointment.metadata || {};
      metadata.usedProducts = usedProducts;
      metadata.totalProductCost = totalProductCost;

      await appointment.update({ metadata }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Producto utilizado actualizado exitosamente',
        data: {
          updatedProduct: usedProducts[index],
          newTotalCost: totalProductCost
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error actualizando producto utilizado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar registro de producto utilizado
   * DELETE /api/appointments/:appointmentId/used-products/:productIndex
   */
  static async deleteUsedProduct(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { appointmentId, productIndex } = req.params;
      const { businessId } = req.query;
      
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId,
          specialistId: req.specialist.id
        }
      });

      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      const usedProducts = appointment.metadata?.usedProducts || [];
      const index = parseInt(productIndex);

      if (index < 0 || index >= usedProducts.length) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Producto utilizado no encontrado'
        });
      }

      const productToDelete = usedProducts[index];

      // Obtener información del producto
      const product = await Product.findOne({
        where: {
          id: productToDelete.productId,
          businessId
        }
      });

      // Si el producto trackea inventario, devolver stock
      if (product && product.trackInventory) {
        await InventoryMovement.create({
          businessId,
          productId: productToDelete.productId,
          type: 'ADJUSTMENT',
          quantity: productToDelete.quantity, // Positivo porque devolvemos stock
          reason: 'USAGE_REVERSAL',
          referenceType: 'APPOINTMENT',
          referenceId: appointmentId,
          notes: `Reversión de uso en procedimiento`,
          userId: req.specialist.id
        }, { transaction });

        await product.update({
          stock: product.stock + productToDelete.quantity
        }, { transaction });
      }

      // Remover del array
      usedProducts.splice(index, 1);

      // Recalcular costo total
      const totalProductCost = usedProducts.reduce((sum, p) => sum + p.totalCost, 0);

      // Actualizar metadata
      const metadata = appointment.metadata || {};
      metadata.usedProducts = usedProducts;
      metadata.totalProductCost = totalProductCost;

      await appointment.update({ metadata }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Producto utilizado eliminado exitosamente',
        data: {
          deletedProduct: productToDelete,
          newTotalCost: totalProductCost
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error eliminando producto utilizado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener productos disponibles para usar en procedimiento
   * GET /api/appointments/:appointmentId/available-products
   */
  static async getAvailableProducts(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      
      // Verificar acceso a la cita
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

      const { category, search, onlyInStock = false } = req.query;

      const where = {
        businessId,
        isActive: true
      };

      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (onlyInStock === 'true') {
        where[Op.and] = [
          {
            [Op.or]: [
              { trackInventory: false },
              { stock: { [Op.gt]: 0 } }
            ]
          }
        ];
      }

      const products = await Product.findAll({
        where,
        attributes: [
          'id', 
          'name', 
          'sku', 
          'category', 
          'subcategory',
          'stock', 
          'trackInventory', 
          'costPrice',
          'salePrice'
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          appointmentId,
          products: products.map(product => ({
            ...product.toJSON(),
            available: !product.trackInventory || product.stock > 0
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = AppointmentProductController;