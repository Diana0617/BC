const { ProcedureSupply, Product, BranchStock, InventoryMovement, Appointment, User, Branch } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * ProcedureSupplyController
 * Gestiona el registro de consumo de productos/insumos durante procedimientos
 * Esto es diferente a las ventas - aquí se registra el uso interno de productos
 */
class ProcedureSupplyController {
  /**
   * Registrar consumo de producto en un procedimiento
   * POST /api/procedure-supplies
   */
  static async createSupply(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('📦 ProcedureSupply - createSupply - Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('📦 ProcedureSupply - createSupply - Usuario:', {
        userId: req.user.id,
        businessId: req.user.businessId,
        role: req.user.role
      });

      const {
        branchId,
        appointmentId,
        shiftId,
        specialistId, // ID del especialista que realizó el procedimiento
        productId,
        quantity,
        unit = 'unit', // unit | ml | gr | kg
        reason,
        notes
      } = req.body;

      const userId = req.user.id;
      const businessId = req.user.businessId;

      // Validar campos requeridos
      if (!productId) {
        await transaction.rollback();
        console.log('❌ Error: productId es requerido');
        return res.status(400).json({
          success: false,
          error: 'productId es requerido'
        });
      }

      // Validar que se provea cantidad
      if (!quantity || quantity <= 0) {
        await transaction.rollback();
        console.log('❌ Error: Cantidad inválida:', quantity);
        return res.status(400).json({
          success: false,
          error: 'La cantidad debe ser mayor a 0'
        });
      }

      // Validar producto
      console.log('🔍 Buscando producto:', { productId, businessId });
      const product = await Product.findOne({
        where: {
          id: productId,
          businessId,
          isActive: true,
          productType: { [Op.in]: ['FOR_PROCEDURES', 'BOTH'] }
        }
      });

      if (!product) {
        await transaction.rollback();
        console.log('❌ Error: Producto no encontrado o no disponible');
        return res.status(400).json({
          success: false,
          error: 'Producto no encontrado o no disponible para procedimientos'
        });
      }

      console.log('✅ Producto encontrado:', { id: product.id, name: product.name, trackInventory: product.trackInventory });

      // Validar stock si el producto lo requiere
      if (product.trackInventory) {
        console.log('📊 Validando stock - trackInventory: true');
        let availableStock;
        
        if (branchId) {
          console.log('🏢 Buscando stock por sucursal:', { branchId, productId: product.id });
          // Stock por sucursal
          const branchStock = await BranchStock.findOne({
            where: { branchId, productId: product.id }
          });
          
          console.log('📦 BranchStock encontrado:', branchStock ? {
            id: branchStock.id,
            currentStock: branchStock.currentStock,
            minStock: branchStock.minStock
          } : 'NO EXISTE');
          
          availableStock = branchStock ? branchStock.currentStock : 0;
        } else {
          console.log('🌍 Usando stock global');
          // Stock global
          availableStock = product.currentStock;
        }

        console.log('📊 Stock disponible:', availableStock, '- Cantidad solicitada:', quantity);

        if (availableStock < quantity) {
          await transaction.rollback();
          console.log('❌ Error: Stock insuficiente');
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente de ${product.name}. Disponible: ${availableStock}, Solicitado: ${quantity}`
          });
        }

        console.log('✅ Stock suficiente, continuando...');
      }

      // Validar especialista si se proporciona
      if (specialistId) {
        const specialist = await User.findOne({
          where: {
            id: specialistId,
            businessId,
            role: { [Op.in]: ['SPECIALIST', 'BUSINESS_SPECIALIST', 'BUSINESS', 'RECEPTIONIST_SPECIALIST'] },
            status: 'ACTIVE'
          }
        });

        if (!specialist) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Especialista no encontrado'
          });
        }
      }

      // Validar turno si se proporciona
      if (appointmentId) {
        const appointment = await Appointment.findOne({
          where: { id: appointmentId, businessId }
        });

        if (!appointment) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Turno no encontrado'
          });
        }
      }

      // Calcular costo
      const unitCost = product.cost || 0;
      const totalCost = quantity * unitCost;

      // Crear movimiento de inventario
      let inventoryMovement = null;
      
      if (product.trackInventory) {
        const previousStock = branchId 
          ? (await BranchStock.findOne({ where: { branchId, productId }}))?.currentStock || 0
          : product.currentStock;

        inventoryMovement = await InventoryMovement.create({
          businessId,
          productId,
          userId: specialistId || userId,
          branchId: branchId || null,
          movementType: 'SALE', // Usa SALE para registrar salida de stock
          quantity,
          unitCost,
          totalCost,
          previousStock,
          newStock: 0, // Se calculará después
          reason: reason || `Consumo en procedimiento`,
          referenceType: 'PROCEDURE'
        }, { transaction });

        // Actualizar stock
        if (branchId) {
          // Stock por sucursal
          const branchStock = await BranchStock.findOne({
            where: { branchId, productId },
            transaction
          });
          
          if (branchStock) {
            branchStock.currentStock -= quantity;
            await branchStock.save({ transaction });
            
            inventoryMovement.newStock = branchStock.currentStock;
            await inventoryMovement.save({ transaction });
          }
        } else {
          // Stock global
          product.currentStock -= quantity;
          await product.save({ transaction });
          
          inventoryMovement.newStock = product.currentStock;
          await inventoryMovement.save({ transaction });
        }
      }

      // Crear registro de consumo
      const supply = await ProcedureSupply.create({
        businessId,
        branchId: branchId || null,
        appointmentId: appointmentId || null,
        shiftId: shiftId || null,
        specialistId: specialistId || userId,
        productId,
        quantity,
        unit,
        unitCost,
        totalCost,
        reason,
        notes,
        inventoryMovementId: inventoryMovement ? inventoryMovement.id : null,
        registeredBy: userId,
        registeredAt: new Date()
      }, { transaction });

      await transaction.commit();

      // Cargar registro completo con relaciones (fuera de la transacción)
      const completeSupply = await ProcedureSupply.findByPk(supply.id, {
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit', 'images']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'role']
          },
          {
            model: User,
            as: 'registeredByUser',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'appointmentNumber', 'date', 'startTime']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Consumo registrado exitosamente',
        data: completeSupply
      });

    } catch (error) {
      // Solo hacer rollback si la transacción no ha sido commiteada
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Error registrando consumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al registrar el consumo',
        details: error.message
      });
    }
  }

  /**
   * Obtener consumos con filtros
   * GET /api/procedure-supplies
   */
  static async getSupplies(req, res) {
    try {
      const {
        businessId,
        branchId,
        specialistId,
        productId,
        appointmentId,
        shiftId,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const userBusinessId = req.user.businessId;

      // Construir filtros
      const where = {
        businessId: businessId || userBusinessId
      };

      if (branchId) where.branchId = branchId;
      if (specialistId) where.specialistId = specialistId;
      if (productId) where.productId = productId;
      if (appointmentId) where.appointmentId = appointmentId;
      if (shiftId) where.shiftId = shiftId;

      if (startDate || endDate) {
        where.registeredAt = {};
        if (startDate) where.registeredAt[Op.gte] = new Date(startDate);
        if (endDate) where.registeredAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows: supplies } = await ProcedureSupply.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'appointmentNumber', 'date', 'startTime']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ],
        order: [['registeredAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: supplies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error obteniendo consumos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener consumos'
      });
    }
  }

  /**
   * Obtener detalle de un consumo
   * GET /api/procedure-supplies/:id
   */
  static async getSupplyById(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;

      const supply = await ProcedureSupply.findOne({
        where: { id, businessId },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit', 'images', 'cost']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'role', 'email']
          },
          {
            model: User,
            as: 'registeredByUser',
            attributes: ['id', 'firstName', 'lastName', 'role']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'appointmentNumber', 'date', 'startTime', 'endTime']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address']
          },
          {
            model: InventoryMovement,
            as: 'inventoryMovement',
            attributes: ['id', 'movementType', 'quantity', 'previousStock', 'newStock']
          }
        ]
      });

      if (!supply) {
        return res.status(404).json({
          success: false,
          error: 'Consumo no encontrado'
        });
      }

      res.json({
        success: true,
        data: supply
      });

    } catch (error) {
      console.error('Error obteniendo consumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el consumo'
      });
    }
  }

  /**
   * Obtener estadísticas de consumo
   * GET /api/procedure-supplies/stats
   */
  static async getSupplyStats(req, res) {
    try {
      const {
        businessId,
        branchId,
        specialistId,
        productId,
        startDate,
        endDate,
        groupBy = 'specialist' // specialist | product | day | month
      } = req.query;

      const userBusinessId = req.user.businessId;

      const where = {
        businessId: businessId || userBusinessId
      };

      if (branchId) where.branchId = branchId;
      if (specialistId) where.specialistId = specialistId;
      if (productId) where.productId = productId;

      if (startDate || endDate) {
        where.registeredAt = {};
        if (startDate) where.registeredAt[Op.gte] = new Date(startDate);
        if (endDate) where.registeredAt[Op.lte] = new Date(endDate);
      }

      let groupByFields = [];
      let includeModels = [];

      switch (groupBy) {
        case 'specialist':
          groupByFields = ['specialistId'];
          includeModels = [{
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          }];
          break;
        
        case 'product':
          groupByFields = ['productId'];
          includeModels = [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit']
          }];
          break;
        
        case 'day':
          // Agrupar por día
          break;
        
        case 'month':
          // Agrupar por mes
          break;
      }

      const stats = await ProcedureSupply.findAll({
        where,
        attributes: [
          ...groupByFields,
          [sequelize.fn('COUNT', sequelize.col('ProcedureSupply.id')), 'totalRecords'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('SUM', sequelize.col('total_cost')), 'totalCost']
        ],
        include: includeModels,
        group: groupByFields.map(f => `ProcedureSupply.${f}`),
        raw: false
      });

      // También obtener totales generales
      const totals = await ProcedureSupply.findAll({
        where,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRecords'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('SUM', sequelize.col('total_cost')), 'totalCost']
        ],
        raw: true
      });

      res.json({
        success: true,
        data: {
          stats,
          totals: totals[0]
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de consumo'
      });
    }
  }

  /**
   * Obtener consumos por turno
   * GET /api/procedure-supplies/appointment/:appointmentId
   */
  static async getSuppliesByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const businessId = req.user.businessId;

      const supplies = await ProcedureSupply.findAll({
        where: {
          appointmentId,
          businessId
        },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku', 'unit', 'cost']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['registeredAt', 'DESC']]
      });

      // Calcular totales
      const totalCost = supplies.reduce((sum, s) => sum + parseFloat(s.totalCost), 0);
      const totalItems = supplies.length;

      res.json({
        success: true,
        data: {
          supplies,
          summary: {
            totalItems,
            totalCost
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo consumos del turno:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener consumos del turno'
      });
    }
  }
}

module.exports = ProcedureSupplyController;
