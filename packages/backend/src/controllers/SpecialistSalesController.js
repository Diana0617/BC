const { 
  Product, 
  Client, 
  InventoryMovement, 
  SpecialistProfile 
} = require('../models');
const { Op, sequelize } = require('sequelize');

/**
 * Controlador para ventas directas realizadas por especialistas
 * Permite registrar productos vendidos directamente al cliente
 */
class SpecialistSalesController {

  /**
   * Crear una nueva venta directa
   * POST /api/sales
   */
  static async createDirectSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId } = req.body;
      const specialistId = req.specialist.id;
      
      const {
        clientId,
        products,
        paymentMethod = 'CASH',
        notes,
        discountAmount = 0,
        discountReason
      } = req.body;

      // Validar cliente
      if (clientId) {
        const client = await Client.findOne({
          where: { id: clientId }
        });

        if (!client) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Cliente no encontrado'
          });
        }
      }

      // Validar productos
      if (!products || !Array.isArray(products) || products.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Lista de productos requerida'
        });
      }

      const saleItems = [];
      let subtotal = 0;

      // Procesar cada producto
      for (const item of products) {
        const { productId, quantity, customPrice } = item;

        if (!productId || !quantity || quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'ProductId y cantidad válida requeridos'
          });
        }

        // Verificar producto
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

        // Verificar stock disponible
        if (product.trackInventory && product.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Requerido: ${quantity}`
          });
        }

        // Usar precio personalizado o precio de venta
        const unitPrice = customPrice || product.salePrice;
        const itemTotal = unitPrice * quantity;

        const saleItem = {
          productId,
          productName: product.name,
          sku: product.sku,
          quantity: parseFloat(quantity),
          unitPrice,
          totalPrice: itemTotal,
          costPrice: product.costPrice || 0,
          margin: itemTotal - (product.costPrice || 0) * quantity
        };

        saleItems.push(saleItem);
        subtotal += itemTotal;

        // Actualizar stock si el producto lo trackea
        if (product.trackInventory) {
          await product.update({
            stock: product.stock - quantity
          }, { transaction });

          // Crear movimiento de inventario
          await InventoryMovement.create({
            businessId,
            productId,
            type: 'SALE',
            quantity: -quantity, // Negativo porque es salida
            reason: 'DIRECT_SALE',
            referenceType: 'SPECIALIST_SALE',
            referenceId: null, // Se actualizará después de crear la venta
            notes: `Venta directa por especialista`,
            userId: specialistId
          }, { transaction });
        }
      }

      // Calcular totales
      const discountApplied = Math.min(discountAmount, subtotal);
      const total = subtotal - discountApplied;
      const totalCost = saleItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      const totalMargin = total - totalCost;

      // Crear registro de venta
      const saleNumber = `SALE-${Date.now()}`;
      
      // Como no tenemos un modelo Sale separado, usar metadata en un registro especial
      // O podríamos crear un modelo Sale, pero por simplicidad usaremos inventoryMovements con metadata
      const saleRecord = {
        saleNumber,
        businessId,
        specialistId,
        clientId: clientId || null,
        saleDate: new Date(),
        items: saleItems,
        subtotal,
        discountAmount: discountApplied,
        discountReason: discountReason || '',
        total,
        totalCost,
        totalMargin,
        paymentMethod,
        notes: notes || '',
        status: 'COMPLETED'
      };

      // Para este ejemplo, guardar la venta en una tabla de metadatos o crear una tabla específica
      // Por ahora, retornar la información para que el frontend la maneje
      
      await transaction.commit();

      // Obtener perfil del especialista para calcular comisión
      const specialistProfile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId }
      });

      let commission = 0;
      if (specialistProfile && specialistProfile.commissionType === 'PERCENTAGE') {
        commission = (totalMargin * specialistProfile.commissionRate) / 100;
      }

      res.status(201).json({
        success: true,
        message: 'Venta registrada exitosamente',
        data: {
          ...saleRecord,
          commission,
          specialistCommissionRate: specialistProfile?.commissionRate || 0
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error creando venta directa:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener ventas realizadas por el especialista
   * GET /api/specialists/me/sales?businessId={bizId}
   */
  static async getMySales(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        clientId
      } = req.query;

      const offset = (page - 1) * limit;

      // Como estamos usando InventoryMovement para ventas, buscar movimientos de tipo SALE
      const where = {
        businessId,
        userId: specialistId,
        type: 'SALE',
        reason: 'DIRECT_SALE'
      };

      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: movements } = await InventoryMovement.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'sku', 'salePrice', 'costPrice']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      // Agrupar movimientos por fecha/venta para simular ventas individuales
      const salesMap = {};
      
      movements.forEach(movement => {
        const saleKey = movement.createdAt.toISOString().split('T')[0]; // Agrupar por día
        
        if (!salesMap[saleKey]) {
          salesMap[saleKey] = {
            saleDate: movement.createdAt,
            items: [],
            total: 0,
            totalCost: 0,
            totalMargin: 0
          };
        }

        const quantity = Math.abs(movement.quantity);
        const unitPrice = movement.Product.salePrice;
        const itemTotal = unitPrice * quantity;
        const itemCost = (movement.Product.costPrice || 0) * quantity;

        salesMap[saleKey].items.push({
          productId: movement.productId,
          productName: movement.Product.name,
          sku: movement.Product.sku,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
          costPrice: movement.Product.costPrice || 0
        });

        salesMap[saleKey].total += itemTotal;
        salesMap[saleKey].totalCost += itemCost;
        salesMap[saleKey].totalMargin += (itemTotal - itemCost);
      });

      const sales = Object.values(salesMap);

      // Calcular estadísticas
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalMargin = sales.reduce((sum, sale) => sum + sale.totalMargin, 0);

      res.json({
        success: true,
        data: {
          sales,
          stats: {
            totalSales,
            totalRevenue,
            totalMargin,
            averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0
          },
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo ventas del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener productos disponibles para venta
   * GET /api/specialists/me/products?businessId={bizId}
   */
  static async getAvailableProducts(req, res) {
    try {
      const { businessId } = req.query;
      
      const {
        category,
        search,
        onlyInStock = true
      } = req.query;

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
          'salePrice',
          'description'
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          products: products.map(product => ({
            ...product.toJSON(),
            available: !product.trackInventory || product.stock > 0,
            margin: product.salePrice - (product.costPrice || 0),
            marginPercent: product.costPrice > 0 ? 
              ((product.salePrice - product.costPrice) / product.costPrice * 100).toFixed(2) : 0
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo productos para venta:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reporte de ventas del especialista
   * GET /api/specialists/me/sales/report?businessId={bizId}
   */
  static async getSalesReport(req, res) {
    try {
      const { businessId } = req.query;
      const specialistId = req.specialist.id;
      
      const {
        startDate,
        endDate,
        groupBy = 'day' // day, week, month
      } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else {
        // Por defecto, último mes
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter.createdAt = {
          [Op.gte]: lastMonth
        };
      }

      // Obtener movimientos de venta
      const movements = await InventoryMovement.findAll({
        where: {
          businessId,
          userId: specialistId,
          type: 'SALE',
          reason: 'DIRECT_SALE',
          ...dateFilter
        },
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'salePrice', 'costPrice', 'category']
          }
        ],
        order: [['createdAt', 'ASC']]
      });

      // Obtener perfil para comisión
      const profile = await SpecialistProfile.findOne({
        where: { userId: specialistId, businessId }
      });

      // Procesar datos para reporte
      const salesData = movements.map(movement => {
        const quantity = Math.abs(movement.quantity);
        const revenue = movement.Product.salePrice * quantity;
        const cost = (movement.Product.costPrice || 0) * quantity;
        const margin = revenue - cost;
        
        let commission = 0;
        if (profile && profile.commissionType === 'PERCENTAGE') {
          commission = (margin * profile.commissionRate) / 100;
        }

        return {
          date: movement.createdAt,
          productId: movement.productId,
          productName: movement.Product.name,
          category: movement.Product.category,
          quantity,
          revenue,
          cost,
          margin,
          commission
        };
      });

      // Agrupar datos según el parámetro groupBy
      const groupedData = {};
      salesData.forEach(sale => {
        let groupKey;
        const date = new Date(sale.date);
        
        switch (groupBy) {
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          default: // day
            groupKey = date.toISOString().split('T')[0];
        }

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            period: groupKey,
            totalSales: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalMargin: 0,
            totalCommission: 0,
            categories: {}
          };
        }

        const group = groupedData[groupKey];
        group.totalSales += sale.quantity;
        group.totalRevenue += sale.revenue;
        group.totalCost += sale.cost;
        group.totalMargin += sale.margin;
        group.totalCommission += sale.commission;

        // Agrupar por categoría
        if (!group.categories[sale.category]) {
          group.categories[sale.category] = {
            revenue: 0,
            margin: 0,
            sales: 0
          };
        }
        group.categories[sale.category].revenue += sale.revenue;
        group.categories[sale.category].margin += sale.margin;
        group.categories[sale.category].sales += sale.quantity;
      });

      const reportData = Object.values(groupedData);

      // Calcular totales generales
      const totals = {
        totalSales: salesData.reduce((sum, sale) => sum + sale.quantity, 0),
        totalRevenue: salesData.reduce((sum, sale) => sum + sale.revenue, 0),
        totalMargin: salesData.reduce((sum, sale) => sum + sale.margin, 0),
        totalCommission: salesData.reduce((sum, sale) => sum + sale.commission, 0)
      };

      res.json({
        success: true,
        data: {
          period: {
            startDate: startDate || dateFilter.createdAt[Op.gte],
            endDate: endDate || new Date(),
            groupBy
          },
          totals,
          specialist: {
            commissionRate: profile?.commissionRate || 0,
            commissionType: profile?.commissionType || 'PERCENTAGE'
          },
          reportData
        }
      });

    } catch (error) {
      console.error('Error generando reporte de ventas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

}

module.exports = SpecialistSalesController;