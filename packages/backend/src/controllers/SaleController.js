const { Sale, SaleItem, Product, BranchStock, InventoryMovement, Receipt, User, Client, Branch, CashRegisterShift, FinancialMovement, Business } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * SaleController
 * Gestiona las operaciones de ventas directas de productos
 * Puede estar asociadas a un turno (CashRegisterShift) o ser independientes
 */
class SaleController {
  /**
   * Crear una nueva venta
   * POST /api/sales
   */
  static async createSale(req, res) {
    console.log('\n🛒 ===== INICIO CREATESAL E =====');
    console.log('📥 req.body:', JSON.stringify(req.body, null, 2));
    console.log('👤 req.user:', {
      id: req.user?.id,
      businessId: req.user?.businessId,
      role: req.user?.role
    });
    
    const transaction = await sequelize.transaction();
    console.log('✅ Transacción creada');
    
    try {
      const {
        branchId,
        clientId,
        items, // Array de { productId, quantity, discount?, discountType? }
        discount = 0,
        discountType = 'NONE',
        discountValue,
        taxPercentage = 0,
        paymentMethod = 'CASH',
        paymentDetails = {},
        paidAmount,
        mixedPayments, // Nuevo: array de { method, amount }
        loyaltyPointsUsed = 0, // Nuevo: puntos de fidelidad usados
        voucherCode = null, // Nuevo: código de voucher aplicado
        notes,
        shiftId // Opcional: si está en turno activo
      } = req.body;

      console.log('📦 Datos extraídos:', {
        branchId,
        clientId,
        itemsCount: items?.length,
        paymentMethod,
        paidAmount,
        shiftId
      });

      const userId = req.user.id;
      const businessId = req.user.businessId;

      // Validar rol (no permitir OWNER)
      if (req.user.role === 'OWNER') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Los propietarios de la plataforma no pueden realizar ventas'
        });
      }

      // Validar items
      if (!items || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Debe incluir al menos un producto en la venta'
        });
      }

      // Procesar cada item y validar stock
      const processedItems = [];
      let subtotal = 0;

      console.log(`\n📦 ===== PROCESANDO ${items.length} ITEMS =====`);

      for (const item of items) {
        console.log(`\n🔍 Validando item:`, {
          productId: item.productId,
          quantity: item.quantity
        });

        // Obtener producto
        const product = await Product.findOne({
          where: {
            id: item.productId,
            businessId,
            isActive: true,
            productType: { [Op.in]: ['FOR_SALE', 'BOTH'] }
          }
        });

        console.log(`📝 Resultado búsqueda producto:`, product ? {
          id: product.id,
          name: product.name,
          sku: product.sku,
          isActive: product.isActive,
          productType: product.productType,
          trackInventory: product.trackInventory,
          currentStock: product.currentStock,
          price: product.price
        } : '❌ NO ENCONTRADO');

        if (!product) {
          console.log(`\n❌ PRODUCTO NO VÁLIDO - productId: ${item.productId}`);
          console.log('   Posibles razones:');
          console.log('   1. No existe en la DB');
          console.log('   2. businessId no coincide');
          console.log('   3. isActive = false');
          console.log('   4. productType no es FOR_SALE ni BOTH');
          
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: `Producto ${item.productId} no encontrado o no disponible para venta`
          });
        }

        // Validar stock si el producto lo requiere
        if (product.trackInventory) {
          let availableStock;
          
          if (branchId) {
            // Stock por sucursal
            const branchStock = await BranchStock.findOne({
              where: { branchId, productId: product.id }
            });
            
            // Si no hay registro de stock por sucursal, usar el stock global del producto
            availableStock = branchStock ? branchStock.currentStock : product.currentStock;
            
            console.log(`📊 [Stock Sucursal] ${product.name}:`, {
              branchId,
              stockSucursal: branchStock?.currentStock || 'Sin registro',
              stockGlobal: product.currentStock,
              stockUsado: availableStock,
              solicitado: item.quantity,
              suficiente: availableStock >= item.quantity
            });
          } else {
            // Stock global
            availableStock = product.currentStock;
            console.log(`📊 [Stock Global] ${product.name}:`, {
              disponible: availableStock,
              solicitado: item.quantity,
              suficiente: availableStock >= item.quantity
            });
          }

          if (availableStock < item.quantity) {
            console.log(`\n❌ STOCK INSUFICIENTE:`, {
              producto: product.name,
              disponible: availableStock,
              solicitado: item.quantity,
              faltante: item.quantity - availableStock
            });
            
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              error: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}, Solicitado: ${item.quantity}`
            });
          }
          
          console.log(`✅ Stock OK para ${product.name}`);
        } else {
          console.log(`⏭️  ${product.name} - Sin control inventario (permitido)`);
        }

        // Calcular subtotal del item
        const itemSubtotal = item.quantity * product.price;
        
        // Calcular descuento del item si aplica
        let itemDiscount = 0;
        if (item.discountType === 'PERCENTAGE' && item.discountValue) {
          itemDiscount = (itemSubtotal * item.discountValue) / 100;
        } else if (item.discountType === 'FIXED' && item.discountValue) {
          itemDiscount = item.discountValue;
        }

        // Calcular impuesto del item
        const taxableAmount = itemSubtotal - itemDiscount;
        const itemTax = product.taxable ? (taxableAmount * (product.taxRate || taxPercentage)) / 100 : 0;
        
        // Calcular total del item
        const itemTotal = itemSubtotal - itemDiscount + itemTax;

        processedItems.push({
          productId: product.id,
          product: product,
          quantity: item.quantity,
          unitPrice: product.price,
          unitCost: product.cost,
          subtotal: itemSubtotal,
          discount: itemDiscount,
          discountType: item.discountType || 'NONE',
          discountValue: item.discountValue || null,
          tax: itemTax,
          taxPercentage: product.taxRate || taxPercentage,
          total: itemTotal,
          profit: (product.price - product.cost) * item.quantity - itemDiscount
        });

        subtotal += itemSubtotal;
      }

      // Calcular descuento general de la venta
      let saleDiscount = 0;
      if (discountType === 'PERCENTAGE' && discountValue) {
        saleDiscount = (subtotal * discountValue) / 100;
      } else if (discountType === 'FIXED' && discountValue) {
        saleDiscount = discountValue;
      } else if (typeof discount === 'number') {
        saleDiscount = discount;
      }

      // Calcular impuesto sobre (subtotal - descuento)
      const taxableAmount = subtotal - saleDiscount;
      const saleTax = processedItems.reduce((sum, item) => sum + item.tax, 0);

      // Total de la venta
      const total = subtotal - saleDiscount + saleTax;

      // Validar pago
      const finalPaidAmount = paidAmount || total;
      if (finalPaidAmount < total) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: `Monto insuficiente. Total: $${total}, Pagado: $${finalPaidAmount}`
        });
      }

      const changeAmount = finalPaidAmount - total;

      // Generar número de venta
      const saleNumber = `VENTA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Crear la venta
      const sale = await Sale.create({
        businessId,
        branchId: branchId || null,
        saleNumber,
        userId,
        clientId: clientId || null,
        shiftId: shiftId || null,
        subtotal,
        discount: saleDiscount,
        discountType,
        discountValue,
        tax: saleTax,
        taxPercentage,
        total,
        paymentMethod,
        paymentDetails,
        paidAmount: finalPaidAmount,
        changeAmount,
        status: 'COMPLETED',
        notes
      }, { transaction });

      // Crear items de la venta y movimientos de inventario
      for (const itemData of processedItems) {
        // Crear movimiento de inventario
        let inventoryMovement = null;
        
        if (itemData.product.trackInventory) {
          inventoryMovement = await InventoryMovement.create({
            businessId,
            productId: itemData.productId,
            userId,
            branchId: branchId || null,
            movementType: 'SALE',
            quantity: itemData.quantity,
            unitCost: itemData.unitCost,
            totalCost: itemData.unitCost * itemData.quantity,
            previousStock: branchId 
              ? (await BranchStock.findOne({ where: { branchId, productId: itemData.productId }, transaction }))?.currentStock || 0
              : itemData.product.currentStock,
            newStock: 0, // Se calculará después
            reason: `Venta ${saleNumber}`,
            referenceId: sale.id,
            referenceType: 'SALE'
          }, { transaction });

          // Actualizar stock
          if (branchId) {
            // Stock por sucursal
            const branchStock = await BranchStock.findOne({
              where: { branchId, productId: itemData.productId },
              transaction
            });
            
            if (branchStock) {
              branchStock.currentStock -= itemData.quantity;
              await branchStock.save({ transaction });
              
              inventoryMovement.newStock = branchStock.currentStock;
              await inventoryMovement.save({ transaction });
            } else {
              // No hay registro de stock por sucursal: descontar del stock global del producto
              // (puede ocurrir si el stock fue cargado globalmente antes de activar sucursales)
              itemData.product.currentStock -= itemData.quantity;
              await itemData.product.save({ transaction });

              inventoryMovement.newStock = itemData.product.currentStock;
              await inventoryMovement.save({ transaction });
            }
          } else {
            // Stock global
            itemData.product.currentStock -= itemData.quantity;
            await itemData.product.save({ transaction });
            
            inventoryMovement.newStock = itemData.product.currentStock;
            await inventoryMovement.save({ transaction });
          }
        }

        // Crear el item de venta
        await SaleItem.create({
          saleId: sale.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          unitPrice: itemData.unitPrice,
          unitCost: itemData.unitCost,
          subtotal: itemData.subtotal,
          discount: itemData.discount,
          discountType: itemData.discountType,
          discountValue: itemData.discountValue,
          tax: itemData.tax,
          taxPercentage: itemData.taxPercentage,
          total: itemData.total,
          profit: itemData.profit,
          inventoryMovementId: inventoryMovement ? inventoryMovement.id : null
        }, { transaction });
      }

      // Obtener información del cliente si existe (antes de crear el movimiento financiero)
      let clientInfo = null;
      if (clientId) {
        clientInfo = await Client.findByPk(clientId, { transaction });
      }

      // Crear movimiento financiero (ingreso por venta)
      // Mapear método de pago correctamente
      let financialPaymentMethod = 'CASH';
      if (paymentMethod === 'CARD') {
        financialPaymentMethod = 'CREDIT_CARD'; // o DEBIT_CARD según el caso
      } else if (paymentMethod === 'TRANSFER') {
        financialPaymentMethod = 'BANK_TRANSFER';
      } else if (paymentMethod === 'CASH') {
        financialPaymentMethod = 'CASH';
      } else if (paymentMethod === 'MIXED') {
        // Para pago mixto, usar el método principal o CASH por defecto
        financialPaymentMethod = 'CASH'; // Podríamos mejorarlo para crear múltiples movimientos
      }

      await FinancialMovement.create({
        businessId,
        userId,
        type: 'INCOME',
        category: 'SALES',
        amount: total,
        currency: 'COP',
        description: `Venta ${saleNumber}${clientInfo ? ` - ${clientInfo.firstName} ${clientInfo.lastName}` : ''}`,
        notes: notes || null,
        paymentMethod: financialPaymentMethod,
        status: 'COMPLETED',
        referenceId: sale.id,
        referenceType: 'SALE',
        clientId: clientId || null
      }, { transaction });

      // Crear recibo para la venta (con transacción para evitar duplicados)
      const { receiptNumber, sequenceNumber } = await Receipt.generateReceiptNumber(businessId, transaction);
      
      // Obtener información del usuario que registra la venta
      const userInfo = await User.findByPk(userId, { 
        attributes: ['id', 'firstName', 'lastName', 'email'],
        transaction 
      });
      
      const receipt = await Receipt.create({
        receiptNumber,
        sequenceNumber,
        businessId,
        saleId: sale.id, // Vinculamos con la venta
        appointmentId: null, // No hay cita asociada
        specialistId: userId, // Usuario que realiza la venta (vendedor)
        userId: userId, // Usuario que registró la venta (debe ser de tabla Users)
        
        // Información del cliente
        clientName: clientInfo ? 
          `${clientInfo.firstName} ${clientInfo.lastName}` : 
          'Cliente General',
        clientPhone: clientInfo?.phone || null,
        clientEmail: clientInfo?.email || null,
        
        // Información del vendedor
        specialistName: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Vendedor',
        
        // Fechas
        serviceDate: new Date(),
        serviceTime: new Date().toTimeString().substring(0, 5),
        issueDate: new Date(),
        
        // Información del servicio/productos
        serviceName: `Venta de ${processedItems.length} producto(s)`,
        serviceDescription: notes || `Venta ${saleNumber}`,
        
        // Información financiera
        subtotal,
        tax: saleTax,
        discount: saleDiscount,
        tip: 0,
        totalAmount: total,
        
        // Información del pago
        paymentMethod: paymentMethod === 'CARD' ? 'CARD' : paymentMethod === 'TRANSFER' ? 'TRANSFER' : 'CASH',
        paymentReference: saleNumber,
        paymentStatus: 'PAID',
        
        // Metadatos
        metadata: {
          saleItems: processedItems.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          })),
          paymentMethod,
          changeAmount
        },
        
        status: 'ACTIVE',
        createdBy: userId
      }, { transaction });

      // Si hay turno activo, podría generarse un recibo automáticamente
      // (esto es opcional, depende de tu lógica de negocio)

      await transaction.commit();

      // Cargar venta completa con relaciones
      const completeSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'unit']
            }]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'role']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Venta registrada exitosamente',
        data: {
          sale: completeSale,
          receipt: {
            id: receipt.id,
            receiptNumber: receipt.receiptNumber,
            totalAmount: receipt.totalAmount
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ===== ERROR EN CREATESAL E =====');
      console.error('❌ Error type:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('===== FIN ERROR =====\n');
      
      res.status(500).json({
        success: false,
        error: 'Error al registrar la venta',
        details: error.message,
        errorType: error.name
      });
    }
  }

  /**
   * Obtener ventas con filtros
   * GET /api/sales
   */
  static async getSales(req, res) {
    try {
      const {
        businessId,
        branchId,
        userId,
        clientId,
        shiftId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      const userBusinessId = req.user.businessId;

      // Construir filtros
      const where = {
        businessId: businessId || userBusinessId
      };

      if (branchId) where.branchId = branchId;
      if (userId) where.userId = userId;
      if (clientId) where.clientId = clientId;
      if (shiftId) where.shiftId = shiftId;
      if (status) where.status = status;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows: sales } = await Sale.findAndCountAll({
        where,
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku']
            }]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: sales,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener ventas'
      });
    }
  }

  /**
   * Obtener detalle de una venta
   * GET /api/sales/:id
   */
  static async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;

      const sale = await Sale.findOne({
        where: { id, businessId },
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'unit', 'images']
            }, {
              model: InventoryMovement,
              as: 'inventoryMovement',
              attributes: ['id', 'movementType', 'quantity', 'previousStock', 'newStock']
            }]
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'role', 'email']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'address']
          },
          {
            model: CashRegisterShift,
            as: 'shift',
            attributes: ['id', 'shiftNumber', 'openedAt', 'closedAt']
          },
          {
            model: Receipt,
            as: 'receipt',
            attributes: ['id', 'receiptNumber', 'totalAmount', 'createdAt']
          }
        ]
      });

      if (!sale) {
        return res.status(404).json({
          success: false,
          error: 'Venta no encontrada'
        });
      }

      res.json({
        success: true,
        data: sale
      });

    } catch (error) {
      console.error('Error obteniendo venta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener la venta'
      });
    }
  }

  /**
   * Cancelar una venta
   * PATCH /api/sales/:id/cancel
   */
  static async cancelSale(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const businessId = req.user.businessId;
      const userId = req.user.id;

      const sale = await Sale.findOne({
        where: { id, businessId },
        include: [{
          model: SaleItem,
          as: 'items',
          include: [{
            model: InventoryMovement,
            as: 'inventoryMovement'
          }]
        }],
        transaction
      });

      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Venta no encontrada'
        });
      }

      if (sale.status !== 'COMPLETED') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Solo se pueden cancelar ventas completadas'
        });
      }

      // Revertir movimientos de inventario
      for (const item of sale.items) {
        if (item.inventoryMovement) {
          const product = await Product.findByPk(item.productId, { transaction });
          
          if (product && product.trackInventory) {
            if (sale.branchId) {
              // Revertir en sucursal
              const branchStock = await BranchStock.findOne({
                where: { branchId: sale.branchId, productId: item.productId },
                transaction
              });
              
              if (branchStock) {
                branchStock.currentStock += item.quantity;
                await branchStock.save({ transaction });
              }
            } else {
              // Revertir stock global
              product.currentStock += item.quantity;
              await product.save({ transaction });
            }

            // Crear movimiento de devolución
            await InventoryMovement.create({
              businessId,
              productId: item.productId,
              userId,
              branchId: sale.branchId || null,
              movementType: 'RETURN',
              quantity: item.quantity,
              previousStock: item.inventoryMovement.newStock,
              newStock: item.inventoryMovement.newStock + item.quantity,
              reason: `Cancelación de venta ${sale.saleNumber}`,
              referenceId: sale.id,
              referenceType: 'SALE_CANCELLATION'
            }, { transaction });
          }
        }
      }

      // Actualizar venta
      sale.status = 'CANCELLED';
      sale.cancelledAt = new Date();
      sale.cancelledBy = userId;
      sale.cancellationReason = reason;
      await sale.save({ transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Venta cancelada exitosamente',
        data: sale
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error cancelando venta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cancelar la venta'
      });
    }
  }

  /**
   * Obtener resumen de ventas
   * GET /api/sales/summary
   */
  static async getSalesSummary(req, res) {
    try {
      const { businessId, branchId, startDate, endDate } = req.query;
      const userBusinessId = req.user.businessId;

      const where = {
        businessId: businessId || userBusinessId,
        status: 'COMPLETED'
      };

      if (branchId) where.branchId = branchId;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const sales = await Sale.findAll({
        where,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Sale.id')), 'totalSales'],
          [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
          [sequelize.fn('AVG', sequelize.col('total')), 'averageTicket'],
          [sequelize.fn('SUM', sequelize.col('subtotal')), 'subtotalSum'],
          [sequelize.fn('SUM', sequelize.col('discount')), 'totalDiscount'],
          [sequelize.fn('SUM', sequelize.col('tax')), 'totalTax']
        ],
        raw: true
      });

      // Resumen por método de pago
      const paymentMethodSummary = await Sale.findAll({
        where,
        attributes: [
          'paymentMethod',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total')), 'total']
        ],
        group: ['paymentMethod'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          summary: sales[0],
          byPaymentMethod: paymentMethodSummary
        }
      });

    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de ventas'
      });
    }
  }

  /**
   * Generar recibo PDF de una venta
   * GET /api/sales/:saleId/receipt-pdf
   */
  static async generateReceiptPDF(req, res) {
    try {
      const { saleId } = req.params;
      const businessId = req.user.businessId;

      // Buscar recibo de la venta
      const receipt = await Receipt.findOne({
        where: {
          saleId,
          businessId,
          status: 'ACTIVE'
        }
      });

      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: 'Recibo no encontrado para esta venta'
        });
      }

      // Obtener información del negocio
      const business = await Business.findByPk(businessId, {
        attributes: ['id', 'name', 'address', 'phone', 'email', 'logo']
      });

      // Obtener los productos de la venta
      const sale = await Sale.findByPk(saleId, {
        include: [
          {
            model: SaleItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description']
            }]
          }
        ]
      });

      const items = sale?.items || [];

      // Importar servicio de PDF
      const ReceiptPDFService = require('../services/ReceiptPDFService');
      
      // Generar PDF con los productos
      const pdfBuffer = await ReceiptPDFService.generateReceiptPDF(receipt, business, items);

      // Configurar headers para descarga del PDF
      const timestamp = Date.now();
      const filename = `recibo-${receipt.receiptNumber}-${timestamp}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (error) {
      console.error('Error generando recibo PDF:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar recibo PDF',
        details: error.message
      });
    }
  }
}

module.exports = SaleController;
