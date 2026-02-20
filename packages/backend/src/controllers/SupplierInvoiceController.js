const {
  SupplierInvoice,
  Supplier,
  Product,
  BranchStock,
  SupplierCatalogItem,
  Business,
  SupplierInvoicePayment,
  InventoryMovement,
  FinancialMovement,
  Branch,
  sequelize
} = require('../models');
const { uploadDocument } = require('../config/cloudinary');
const { Op } = require('sequelize');
const SupplierCatalogService = require('../services/SupplierCatalogService');

/**
 * Controlador para gestión de facturas de proveedores
 * Maneja creación, aprobación y tracking de facturas que afectan el inventario
 */
class SupplierInvoiceController {

  /**
   * Obtener todas las facturas del negocio
   * GET /api/business/:businessId/supplier-invoices
   */
  static async getInvoices(req, res) {
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;

      // Validar que el usuario pertenece al negocio
      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const {
        supplierId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      const where = { businessId };

      // Filtros opcionales
      if (supplierId) where.supplierId = supplierId;
      if (status) where.status = status;
      if (startDate || endDate) {
        where.issueDate = {};
        if (startDate) where.issueDate[Op.gte] = new Date(startDate);
        if (endDate) where.issueDate[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { rows: invoices, count: total } = await SupplierInvoice.findAndCountAll({
        where,
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone', 'taxId']
          }
        ],
        order: [['issueDate', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting invoices:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas',
        error: error.message
      });
    }
  }

  /**
   * Obtener una factura específica
   * GET /api/business/:businessId/supplier-invoices/:invoiceId
   */
  static async getInvoice(req, res) {
    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId } = req.user;

      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const invoice = await SupplierInvoice.findOne({
        where: { id: invoiceId, businessId },
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone', 'taxId', 'address']
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error getting invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la factura',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva factura de proveedor
   * POST /api/business/:businessId/supplier-invoices
   */
  static async createInvoice(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId, id: userId } = req.user;

      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const {
        branchId, // Sucursal destino de la compra
        supplierId,
        supplierData, // Datos para crear proveedor si no existe
        invoiceNumber,
        issueDate,
        dueDate,
        items, // [{ productId, productData, quantity, unitCost, total, description }]
        subtotal,
        tax,
        taxIncluded = false, // Si el IVA está incluido en los precios
        taxPercentage = 0, // Porcentaje de IVA (0, 5, 19, etc.)
        total,
        currency = 'COP',
        notes,
        attachments = [], // URLs de Cloudinary
        receivedImmediately = false // Si la mercancía ya fue recibida
      } = req.body;

      console.log('📎 Attachments recibidos:', attachments);
      console.log('🏢 BranchId recibido:', branchId);

      // Validaciones
      if (!invoiceNumber || !issueDate || !dueDate || !items || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: invoiceNumber, issueDate, dueDate, items'
        });
      }

      if (!branchId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'branchId es requerido para asignar el stock a una sucursal'
        });
      }

      // Verificar que la sucursal existe y pertenece al negocio
      const branch = await Branch.findOne({
        where: { id: branchId, businessId },
        transaction
      });

      if (!branch) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada o no pertenece a este negocio'
        });
      }

      let finalSupplierId = supplierId;

      // Si no existe el proveedor, crearlo
      if (!supplierId && supplierData) {
        const newSupplier = await Supplier.create({
          businessId,
          name: supplierData.name,
          email: supplierData.email || null, // Convertir string vacío a null
          phone: supplierData.phone || null,
          taxId: supplierData.taxId || null,
          address: supplierData.address || null,
          city: supplierData.city || null,
          country: supplierData.country || null,
          contactPerson: supplierData.contactPerson || null,
          paymentTerms: supplierData.paymentTerms || 30,
          status: 'ACTIVE'
        }, { transaction });

        finalSupplierId = newSupplier.id;
      }

      if (!finalSupplierId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar un supplierId o supplierData para crear el proveedor'
        });
      }

      // Validar que el proveedor pertenece al negocio
      const supplier = await Supplier.findOne({
        where: { id: finalSupplierId, businessId },
        transaction
      });

      if (!supplier) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado o no pertenece a este negocio'
        });
      }

      // 🔥 VALIDAR ITEMS ANTES DE PROCESAR
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Validar que tiene productId o productData
        if (!item.productId && !item.productData) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Item ${i + 1}: Debes proporcionar productId o productData para crear el producto`
          });
        }
        
        // Validar quantity
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Item ${i + 1} (${item.productData?.name || item.productId}): quantity es requerida y debe ser un número mayor a 0`
          });
        }
        
        // Validar unitCost
        if (!item.unitCost || typeof item.unitCost !== 'number' || item.unitCost <= 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Item ${i + 1} (${item.productData?.name || item.productId}): unitCost es requerido y debe ser un número mayor a 0`
          });
        }
      }

      // Procesar items y crear productos si es necesario
      const processedItems = [];
      
      for (const item of items) {
        console.log('📦 Processing item:', JSON.stringify(item, null, 2));
        let finalProductId = item.productId;

        // Si no existe el producto, crearlo
        if (!item.productId && item.productData) {
          const newProduct = await Product.create({
            businessId,
            name: item.productData.name,
            sku: item.productData.sku,
            category: item.productData.category,
            brand: item.productData.brand,
            price: item.productData.price || item.unitCost * 1.3, // Margen del 30% por defecto
            cost: item.unitCost,
            unit: item.productData.unit || 'unidad',
            trackInventory: true,
            isActive: true,
            images: item.productData.images || [] // Incluir imágenes si se proporcionan
          }, { transaction });

          finalProductId = newProduct.id;

          // 🔥 Agregar al catálogo de proveedores
          console.log(`📋 Agregando producto ${newProduct.name} al catálogo del proveedor ${finalSupplierId}`);
          await SupplierCatalogItem.create({
            businessId,
            supplierId: finalSupplierId,
            productId: finalProductId,
            supplierSku: item.productData.sku,
            name: item.productData.name,
            price: item.unitCost,
            minimumOrder: 1,
            leadTime: 7,
            available: true,
            lastPurchaseDate: new Date(issueDate),
            lastPurchasePrice: item.unitCost,
            notes: `Agregado automáticamente desde factura ${invoiceNumber}`
          }, { transaction });
          console.log(`✅ Producto agregado al catálogo del proveedor`);
        }

        // Validar que el producto existe y pertenece al negocio
        if (finalProductId) {
          const product = await Product.findOne({
            where: { id: finalProductId, businessId },
            transaction
          });

          if (!product) {
            await transaction.rollback();
            return res.status(404).json({
              success: false,
              message: `Producto ${item.productData?.name || finalProductId} no encontrado`
            });
          }
        }

        processedItems.push({
          productId: finalProductId,
          productName: item.productData?.name || item.productName,
          sku: item.productData?.sku || item.sku,
          description: item.description || '', // Descripción del item
          quantityOrdered: item.quantity,
          quantityReceived: receivedImmediately ? item.quantity : 0,
          unitCost: item.unitCost,
          salePrice: item.salePrice, // Incluir precio de venta
          total: item.total || (item.quantity * item.unitCost)
        });
      }

      // Determinar estado de recepción
      const receiptStatus = receivedImmediately ? 'FULLY_RECEIVED' : 'PENDING_RECEIPT';
      
      // Crear la factura
      const invoice = await SupplierInvoice.create({
        businessId,
        supplierId: finalSupplierId,
        branchId, // Sucursal donde se recibirá/recibió la mercancía
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        items: processedItems,
        subtotal,
        tax,
        taxIncluded,
        taxPercentage,
        total,
        currency,
        notes,
        attachments,
        status: 'PENDING',
        receiptStatus,
        receivedAt: receivedImmediately ? new Date() : null,
        receivedBy: receivedImmediately ? userId : null,
        paidAmount: 0,
        remainingAmount: total,
        metadata: {
          stockDistributed: false,
          branchDistribution: null
        }
      }, { transaction });

      // Si se marcó como recibida inmediatamente, actualizar stock
      if (receivedImmediately) {
        console.log(`📦 Mercancía marcada como recibida, actualizando stock...`);
        
        for (const item of processedItems) {
          const product = await Product.findByPk(item.productId, { transaction });
          if (!product) continue;

          // Obtener o crear stock de sucursal
          const [branchStock, created] = await BranchStock.findOrCreate({
            where: { branchId, productId: item.productId },
            defaults: {
              businessId,
              branchId,
              productId: item.productId,
              currentStock: 0,
              minStock: 0,
              maxStock: null,
              lastCountDate: new Date()
            },
            transaction
          });

          const previousStock = branchStock.currentStock;
          const newStock = previousStock + item.quantityOrdered;

          // Crear movimiento de inventario
          await InventoryMovement.create({
            businessId,
            productId: item.productId,
            branchId,
            userId,
            movementType: 'PURCHASE',
            quantity: item.quantityOrdered,
            unitCost: item.unitCost,
            totalCost: item.unitCost * item.quantityOrdered,
            previousStock,
            newStock,
            reason: `Recepción inmediata - Factura ${invoiceNumber}`,
            notes: `Proveedor: ${supplier.name}`,
            referenceId: invoice.id,
            referenceType: 'SUPPLIER_INVOICE',
            supplierInfo: {
              supplierId: finalSupplierId,
              supplierName: supplier.name,
              invoiceNumber
            }
          }, { transaction });

          // Actualizar costo del producto
          await product.update({ cost: item.unitCost }, { transaction });

          // Actualizar stock de sucursal
          await branchStock.update({
            currentStock: newStock,
            lastCountDate: new Date()
          }, { transaction });

          console.log(`✅ Stock actualizado: ${item.productName} | ${previousStock} → ${newStock}`);
        }

        // Marcar stock como distribuido
        await invoice.update({
          metadata: {
            stockDistributed: true,
            branchDistribution: [{
              branchId,
              items: processedItems.map(i => ({
                productId: i.productId,
                quantity: i.quantityOrdered
              })),
              distributedAt: new Date(),
              distributedBy: userId
            }]
          }
        }, { transaction });
      }

      console.log(`✅ Factura creada: ${invoiceNumber} - Estado de recepción: ${receiptStatus}`);

      await transaction.commit();

      // Recargar con relaciones
      const createdInvoice = await SupplierInvoice.findByPk(invoice.id, {
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone', 'taxId']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: receivedImmediately 
          ? 'Factura creada y mercancía recibida exitosamente'
          : 'Factura creada exitosamente. Pendiente de recepción de mercancía.',
        data: createdInvoice
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la factura',
        error: error.message
      });
    }
  }

  /**
   * Distribuir stock de factura entre sucursales
   * POST /api/business/:businessId/supplier-invoices/:invoiceId/distribute-stock
   * 
   * Body: {
   *   distribution: [
   *     {
   *       branchId: 'uuid',
   *       items: [
   *         { productId: 'uuid', quantity: 10 },
   *         { productId: 'uuid', quantity: 5 }
   *       ]
   *     }
   *   ]
   * }
   */
  static async distributeStock(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId, id: userId } = req.user;
      const { distribution } = req.body;

      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Validar distribution
      if (!distribution || !Array.isArray(distribution) || distribution.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar la distribución de stock por sucursal'
        });
      }

      // Obtener factura
      const invoice = await SupplierInvoice.findOne({
        where: { id: invoiceId, businessId },
        include: [{
          model: Supplier,
          as: 'supplier'
        }],
        transaction
      });

      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Validar que la factura esté pendiente
      if (invoice.status !== 'PENDING') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `No se puede distribuir stock de una factura con status ${invoice.status}`
        });
      }

      // Validar que el stock no haya sido distribuido previamente
      if (invoice.metadata?.stockDistributed) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'El stock de esta factura ya ha sido distribuido'
        });
      }

      // Validar que todas las sucursales existan
      const branchIds = distribution.map(d => d.branchId);
      const branches = await Branch.findAll({
        where: { id: branchIds, businessId },
        transaction
      });

      if (branches.length !== branchIds.length) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Una o más sucursales no existen o no pertenecen al negocio'
        });
      }

      // Validar que las cantidades distribuidas coincidan con las de la factura
      const productQuantities = {};
      invoice.items.forEach(item => {
        productQuantities[item.productId] = item.quantityOrdered || item.quantity;
      });

      const distributedQuantities = {};
      distribution.forEach(dist => {
        dist.items.forEach(item => {
          if (!distributedQuantities[item.productId]) {
            distributedQuantities[item.productId] = 0;
          }
          distributedQuantities[item.productId] += item.quantity;
        });
      });

      // Verificar que cada producto tenga la cantidad correcta
      for (const [productId, invoiceQty] of Object.entries(productQuantities)) {
        const distributedQty = distributedQuantities[productId] || 0;
        if (distributedQty !== invoiceQty) {
          await transaction.rollback();
          const product = await Product.findByPk(productId);
          return res.status(400).json({
            success: false,
            message: `La cantidad distribuida de "${product?.name || productId}" (${distributedQty}) no coincide con la cantidad de la factura (${invoiceQty})`
          });
        }
      }

      console.log(`📦 Distribuyendo stock de factura ${invoice.invoiceNumber}`);

      // Aplicar distribución: crear movimientos y actualizar stock
      for (const dist of distribution) {
        const branch = branches.find(b => b.id === dist.branchId);
        
        for (const item of dist.items) {
          const invoiceItem = invoice.items.find(i => i.productId === item.productId);
          if (!invoiceItem) continue;

          const product = await Product.findByPk(item.productId, { transaction });
          if (!product) continue;

          // Obtener o crear stock de sucursal ANTES del movimiento
          const [branchStock, created] = await BranchStock.findOrCreate({
            where: { branchId: dist.branchId, productId: item.productId },
            defaults: {
              businessId,
              branchId: dist.branchId,
              productId: item.productId,
              currentStock: 0,
              minStock: 0,
              maxStock: null,
              lastCountDate: new Date()
            },
            transaction
          });

          const previousBranchStock = branchStock.currentStock;
          const newBranchStock = previousBranchStock + item.quantity;

          // Crear movimiento de inventario con valores correctos
          await InventoryMovement.create({
            businessId,
            productId: item.productId,
            branchId: dist.branchId,
            userId,
            movementType: 'PURCHASE',
            quantity: item.quantity,
            unitCost: invoiceItem.unitCost,
            totalCost: invoiceItem.unitCost * item.quantity,
            previousStock: previousBranchStock,
            newStock: newBranchStock,
            reason: `Entrada por factura ${invoice.invoiceNumber}`,
            notes: `Factura de proveedor: ${invoice.supplier.name} - Sucursal: ${branch.name}`,
            referenceId: invoice.id,
            referenceType: 'SUPPLIER_INVOICE',
            supplierInfo: {
              supplierId: invoice.supplierId,
              supplierName: invoice.supplier.name,
              invoiceNumber: invoice.invoiceNumber
            }
          }, { transaction });

          // Actualizar solo el costo en el producto (NO el stock global)
          await product.update({
            cost: invoiceItem.unitCost
          }, { transaction });

          // Actualizar stock de sucursal
          await branchStock.update({
            currentStock: newBranchStock,
            lastCountDate: new Date()
          }, { transaction });

          console.log(`✅ Stock de sucursal ${created ? 'creado' : 'actualizado'}: ${product.name} en ${branch.name} | ${previousBranchStock} → ${newBranchStock} (+${item.quantity})`);
        }
      }

      // Actualizar metadata de la factura
      await invoice.update({
        metadata: {
          stockDistributed: true,
          branchDistribution: distribution,
          distributedAt: new Date(),
          distributedBy: userId
        }
      }, { transaction });

      await transaction.commit();

      // Recargar factura con relaciones
      const updatedInvoice = await SupplierInvoice.findByPk(invoiceId, {
        include: [{
          model: Supplier,
          as: 'supplier'
        }]
      });

      res.json({
        success: true,
        message: 'Stock distribuido exitosamente',
        data: updatedInvoice
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error distributing stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error al distribuir stock',
        error: error.message
      });
    }
  }

  /**
   * Aprobar factura (requiere distribución previa de stock)
   * POST /api/business/:businessId/supplier-invoices/:invoiceId/approve
   */
  static async approveInvoice(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId } = req.user;

      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const invoice = await SupplierInvoice.findOne({
        where: { id: invoiceId, businessId },
        transaction
      });

      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      if (invoice.status === 'APPROVED') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'La factura ya ha sido aprobada'
        });
      }

      // Validar que el stock haya sido distribuido O distribuir automáticamente a sucursal principal
      if (!invoice.metadata?.stockDistributed) {
        console.log('⚠️ Stock no distribuido manualmente, distribuyendo a sucursal principal...');
        
        // Obtener sucursal principal del negocio
        const Business = require('../models').Business;
        const business = await Business.findByPk(businessId, {
          include: [{
            model: Branch,
            as: 'branches',
            where: { status: 'ACTIVE' },
            required: false
          }],
          transaction
        });

        if (!business || !business.branches || business.branches.length === 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'No hay sucursales activas para distribuir el stock'
          });
        }

        // Usar la primera sucursal activa como principal
        const mainBranch = business.branches[0];
        
        // Crear distribución automática con todos los items a la sucursal principal
        const autoDistribution = [{
          branchId: mainBranch.id,
          items: invoice.items.map(item => ({
            productId: item.productId,
            quantity: item.quantityOrdered // El campo guardado en la factura es quantityOrdered
          }))
        }];

        // Aplicar la distribución automática
        const userId = req.user.id;
        const Product = require('../models').Product;
        const BranchStock = require('../models').BranchStock;
        const InventoryMovement = require('../models').InventoryMovement;

        for (const item of invoice.items) {
          const product = await Product.findByPk(item.productId, { transaction });
          if (!product) continue;

          // Obtener o crear stock de sucursal
          const [branchStock, created] = await BranchStock.findOrCreate({
            where: { branchId: mainBranch.id, productId: item.productId },
            defaults: {
              businessId,
              branchId: mainBranch.id,
              productId: item.productId,
              currentStock: 0,
              minStock: 0,
              maxStock: null,
              lastCountDate: new Date()
            },
            transaction
          });

          const previousBranchStock = branchStock.currentStock;
          const newBranchStock = previousBranchStock + item.quantityOrdered; // El campo guardado es quantityOrdered

          // Crear movimiento de inventario
          await InventoryMovement.create({
            businessId,
            productId: item.productId,
            branchId: mainBranch.id,
            userId,
            movementType: 'PURCHASE',
            quantity: item.quantityOrdered, // El campo guardado es quantityOrdered
            unitCost: item.unitCost,
            totalCost: item.total,
            previousStock: previousBranchStock,
            newStock: newBranchStock,
            notes: `Compra automática desde factura ${invoice.invoiceNumber}`,
            reference: invoice.invoiceNumber,
            metadata: {
              source: 'supplier_invoice',
              invoiceId: invoice.id,
              autoDistributed: true
            }
          }, { transaction });

          // Actualizar stock de sucursal
          await branchStock.update({
            currentStock: newBranchStock
          }, { transaction });

          console.log(`✅ Stock actualizado: ${product.name} en ${mainBranch.name}: ${previousBranchStock} → ${newBranchStock}`);
        }

        // Marcar como distribuido
        await invoice.update({
          metadata: {
            ...invoice.metadata,
            stockDistributed: true,
            autoDistributed: true,
            distributionDate: new Date(),
            mainBranchId: mainBranch.id
          }
        }, { transaction });

        console.log(`✅ Distribución automática completada a sucursal ${mainBranch.name}`);
      }

      // Aprobar factura
      await invoice.update({
        status: 'APPROVED'
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Factura aprobada exitosamente',
        data: invoice
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error approving invoice:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aprobar la factura',
        error: error.message
      });
    }
  }

  /**
   * Obtener resumen de cuenta por proveedor
   * GET /api/business/:businessId/suppliers/:supplierId/account-summary
   */
  static async getSupplierAccountSummary(req, res) {
    try {
      const { businessId, supplierId } = req.params;
      const { businessId: userBusinessId } = req.user;

      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Validar que el proveedor existe y pertenece al negocio
      const supplier = await Supplier.findOne({
        where: { id: supplierId, businessId }
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Proveedor no encontrado'
        });
      }

      // Obtener todas las facturas del proveedor
      const invoices = await SupplierInvoice.findAll({
        where: { businessId, supplierId },
        order: [['issueDate', 'DESC']]
      });

      // Calcular totales
      const summary = {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          taxId: supplier.taxId,
          email: supplier.email,
          phone: supplier.phone
        },
        totalInvoices: invoices.length,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        invoicesByStatus: {
          PENDING: 0,
          APPROVED: 0,
          PAID: 0,
          OVERDUE: 0,
          DISPUTED: 0,
          CANCELLED: 0
        },
        invoices: invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          total: parseFloat(inv.total),
          paidAmount: parseFloat(inv.paidAmount),
          remainingAmount: parseFloat(inv.remainingAmount)
        }))
      };

      // Calcular totales
      invoices.forEach(inv => {
        const total = parseFloat(inv.total);
        const paid = parseFloat(inv.paidAmount);
        const remaining = parseFloat(inv.remainingAmount);

        summary.totalAmount += total;
        summary.totalPaid += paid;
        summary.totalPending += remaining;

        // Contar por estado
        summary.invoicesByStatus[inv.status]++;

        // Detectar vencidas
        if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
          const now = new Date();
          const dueDate = new Date(inv.dueDate);
          if (dueDate < now) {
            summary.totalOverdue += remaining;
          }
        }
      });

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting supplier account summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el resumen de cuenta',
        error: error.message
      });
    }
  }

  /**
   * Obtener todos los proveedores del negocio
   * GET /api/business/:businessId/suppliers
   */
  static async getSuppliers(req, res) {
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;

      // Validar que el usuario pertenece al negocio
      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      const {
        status = 'ACTIVE',
        search,
        page = 1,
        limit = 100
      } = req.query;

      const where = { businessId };

      // Filtro por status
      if (status) where.status = status;

      // Búsqueda por nombre o taxId
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { taxId: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Supplier.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'email', 'phone', 'taxId', 'status', 'paymentTerms']
      });

      res.json({
        success: true,
        data: {
          suppliers: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener proveedores',
        error: error.message
      });
    }
  }

  /**
   * Registrar un pago de factura
   * POST /api/business/:businessId/supplier-invoices/:invoiceId/pay
   */
  static async registerPayment(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId, id: userId } = req.user;
      const {
        amount,
        paymentDate,
        paymentMethod,
        reference,
        notes
      } = req.body;

      // Subir comprobante a Cloudinary si existe
      let receiptUrl = null;
      if (req.file) {
        try {
          const result = await uploadDocument(req.file.path, 'beauty-control', 'supplier-payments');
          receiptUrl = result.url;
        } catch (uploadError) {
          console.error('Error uploading receipt:', uploadError);
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: 'Error al subir el comprobante de pago'
          });
        }
      }

      // Validar permisos
      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Validar campos requeridos
      if (!amount || !paymentMethod) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: amount, paymentMethod'
        });
      }

      // Obtener la factura con supplier
      const invoice = await SupplierInvoice.findOne({
        where: { id: invoiceId, businessId },
        include: [{
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }],
        transaction
      });

      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Validar que la factura esté aprobada o parcialmente pagada
      if (invoice.status !== 'APPROVED' && invoice.status !== 'PARTIALLY_PAID') {
        await transaction.rollback();
        
        let errorMessage = 'La factura debe estar aprobada antes de registrar pagos';
        if (invoice.status === 'PENDING') {
          errorMessage = 'Debe aprobar la factura antes de registrar pagos';
        } else if (invoice.status === 'PAID') {
          errorMessage = 'La factura ya está completamente pagada';
        } else if (invoice.status === 'CANCELLED') {
          errorMessage = 'No se pueden registrar pagos en una factura cancelada';
        }
        
        return res.status(400).json({
          success: false,
          message: errorMessage,
          currentStatus: invoice.status
        });
      }

      // Validar que el monto no exceda lo pendiente
      const amountFloat = parseFloat(amount);
      const remainingFloat = parseFloat(invoice.remainingAmount);

      if (amountFloat > remainingFloat) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `El monto del pago ($${amountFloat}) excede el saldo pendiente ($${remainingFloat})`
        });
      }

      // Crear el registro de pago
      const payment = await SupplierInvoicePayment.create({
        invoiceId,
        businessId,
        amount: amountFloat,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod,
        reference,
        receipt: receiptUrl,
        notes,
        createdBy: userId
      }, { transaction});

      // Mapear paymentMethod al enum de FinancialMovement
      let financialPaymentMethod = paymentMethod;
      if (paymentMethod === 'TRANSFER') {
        financialPaymentMethod = 'BANK_TRANSFER';
      } else if (paymentMethod === 'CARD') {
        financialPaymentMethod = 'CREDIT_CARD';
      }

      // Crear movimiento financiero (GASTO)
      await FinancialMovement.create({
        businessId,
        userId,
        type: 'EXPENSE',
        category: 'Compra de Inventario',
        description: `Pago factura ${invoice.invoiceNumber} - ${invoice.supplier?.name || 'Proveedor'}`,
        amount: amountFloat,
        paymentMethod: financialPaymentMethod,
        status: 'COMPLETED',
        transactionDate: paymentDate ? new Date(paymentDate) : new Date(),
        reference,
        metadata: {
          source: 'supplier_invoice_payment',
          invoiceId: invoice.id,
          paymentId: payment.id,
          supplierId: invoice.supplierId
        }
      }, { transaction });

      // Actualizar la factura
      const newPaidAmount = parseFloat(invoice.paidAmount) + amountFloat;
      const newRemainingAmount = parseFloat(invoice.total) - newPaidAmount;

      // Determinar nuevo estado basado en el saldo
      let newStatus;
      if (newRemainingAmount <= 0) {
        newStatus = 'PAID'; // Totalmente pagado
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIALLY_PAID'; // Pago parcial
      } else {
        newStatus = invoice.status; // Mantener estado actual
      }

      await invoice.update({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus
      }, { transaction });

      await transaction.commit();

      // Recargar factura con relaciones
      const updatedInvoice = await SupplierInvoice.findByPk(invoiceId, {
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'name', 'email', 'phone', 'taxId']
          },
          {
            model: SupplierInvoicePayment,
            as: 'payments',
            order: [['paymentDate', 'DESC']]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: {
          payment,
          invoice: updatedInvoice
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error registering payment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el pago',
        error: error.message
      });
    }
  }

  /**
   * Subir imagen de producto temporal (para facturas)
   * POST /api/business/:businessId/upload/product-image
   */
  static async uploadProductImage(req, res) {
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;

      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir archivos a este negocio'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const { productName } = req.body;
      const cloudinary = require('cloudinary').v2;
      
      // Subir imagen principal (main)
      const uploadMainImage = () => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `beauty-control/products/main`,
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
            ],
            format: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      // Subir thumbnail
      const uploadThumbnail = () => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `beauty-control/products/thumbs`,
            transformation: [
              { width: 400, height: 300, crop: 'fill', quality: 'auto:good', gravity: 'auto' }
            ],
            format: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      // Subir ambas versiones en paralelo
      const [mainResult, thumbResult] = await Promise.all([
        uploadMainImage(),
        uploadThumbnail()
      ]);

      // Devolver en el formato esperado por el catálogo de productos
      res.json({
        success: true,
        data: {
          main: {
            url: mainResult.secure_url,
            width: mainResult.width,
            height: mainResult.height,
            public_id: mainResult.public_id
          },
          thumbnail: {
            url: thumbResult.secure_url,
            width: thumbResult.width,
            height: thumbResult.height,
            public_id: thumbResult.public_id
          }
        }
      });
    } catch (error) {
      console.error('Error uploading product image:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir la imagen del producto',
        error: error.message
      });
    }
  }

  /**
   * Subir archivo de factura (PDF o imagen)
   * POST /api/business/:businessId/upload/invoice
   */
  static async uploadInvoiceFile(req, res) {
    try {
      const { businessId } = req.params;
      const { businessId: userBusinessId } = req.user;

      if (businessId !== userBusinessId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para subir archivos a este negocio'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const { invoiceNumber } = req.body;
      const cloudinary = require('cloudinary').v2;
      
      // Subir directamente desde buffer usando upload_stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `beauty-control/businesses/${businessId}/supplier-invoices`,
            resource_type: 'auto', // Permite PDFs e imágenes
            format: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('Error uploading invoice file:', error);
              return res.status(500).json({
                success: false,
                message: 'Error al subir el archivo de la factura',
                error: error.message
              });
            }

            res.json({
              success: true,
              data: {
                url: result.secure_url,
                publicId: result.public_id,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                format: result.format
              }
            });
          }
        );

        // Escribir el buffer al stream
        uploadStream.end(req.file.buffer);
      });
    } catch (error) {
      console.error('Error uploading invoice file:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir el archivo de la factura',
        error: error.message
      });
    }
  }

  /**
   * Recibir mercancía de una factura
   * POST /api/business/:businessId/supplier-invoices/:invoiceId/receive-goods
   * 
   * Body: {
   *   itemsReceived: [
   *     { productId: 'uuid', quantityReceived: 10 },
   *     { productId: 'uuid', quantityReceived: 5 }
   *   ]
   * }
   */
  static async receiveGoods(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId, id: userId } = req.user;
      const { itemsReceived } = req.body;

      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      // Validar itemsReceived
      if (!itemsReceived || !Array.isArray(itemsReceived) || itemsReceived.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar los items recibidos'
        });
      }

      // Obtener factura
      const invoice = await SupplierInvoice.findOne({
        where: { id: invoiceId, businessId },
        include: [{
          model: Supplier,
          as: 'supplier'
        }],
        transaction
      });

      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
      }

      // Si no tiene branchId, asignar la sucursal principal automáticamente
      let targetBranchId = invoice.branchId;
      if (!targetBranchId) {
        const primaryBranch = await Branch.findOne({
          where: { 
            businessId,
            isMain: true
          },
          transaction
        });

        if (!primaryBranch) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'No se encontró una sucursal principal para recibir la mercancía'
          });
        }

        targetBranchId = primaryBranch.id;
        
        // Actualizar la factura con la sucursal principal
        await invoice.update({ branchId: targetBranchId }, { transaction });
        
        console.log(`📍 Asignada sucursal principal ${primaryBranch.name} a la factura ${invoice.invoiceNumber}`);
      }

      // Validar que la factura no esté completamente recibida
      if (invoice.receiptStatus === 'FULLY_RECEIVED') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'La mercancía de esta factura ya fue recibida completamente'
        });
      }

      console.log(`📦 Recibiendo mercancía de factura ${invoice.invoiceNumber}`);

      // Actualizar items de la factura
      const updatedItems = invoice.items.map(item => {
        const receivedItem = itemsReceived.find(r => r.productId === item.productId);
        if (receivedItem) {
          const currentReceived = item.quantityReceived || 0;
          const newReceived = currentReceived + receivedItem.quantityReceived;
          const quantityOrdered = item.quantityOrdered || item.quantity;

          // Validar que no se reciba más de lo ordenado
          if (newReceived > quantityOrdered) {
            throw new Error(`No puedes recibir ${newReceived} unidades de ${item.productName} cuando solo se ordenaron ${quantityOrdered}`);
          }

          return {
            ...item,
            quantityReceived: newReceived
          };
        }
        return item;
      });

      // Calcular nuevo estado de recepción
      let allReceived = true;
      let anyReceived = false;

      updatedItems.forEach(item => {
        const quantityOrdered = item.quantityOrdered || item.quantity;
        const quantityReceived = item.quantityReceived || 0;
        
        if (quantityReceived > 0) anyReceived = true;
        if (quantityReceived < quantityOrdered) allReceived = false;
      });

      const newReceiptStatus = allReceived 
        ? 'FULLY_RECEIVED' 
        : (anyReceived ? 'PARTIALLY_RECEIVED' : 'PENDING_RECEIPT');

      // Actualizar stock para los items recibidos
      for (const receivedItem of itemsReceived) {
        if (receivedItem.quantityReceived <= 0) continue;

        const invoiceItem = invoice.items.find(i => i.productId === receivedItem.productId);
        if (!invoiceItem) continue;

        const product = await Product.findByPk(receivedItem.productId, { transaction });
        if (!product) continue;

        // Obtener o crear stock de sucursal
        const [branchStock, created] = await BranchStock.findOrCreate({
          where: { branchId: targetBranchId, productId: receivedItem.productId },
          defaults: {
            businessId,
            branchId: targetBranchId,
            productId: receivedItem.productId,
            currentStock: 0,
            minStock: 0,
            maxStock: null,
            lastCountDate: new Date()
          },
          transaction
        });

        const previousStock = branchStock.currentStock;
        const newStock = previousStock + receivedItem.quantityReceived;

        // Crear movimiento de inventario
        await InventoryMovement.create({
          businessId,
          productId: receivedItem.productId,
          branchId: targetBranchId,
          userId,
          movementType: 'PURCHASE',
          quantity: receivedItem.quantityReceived,
          unitCost: invoiceItem.unitCost,
          totalCost: invoiceItem.unitCost * receivedItem.quantityReceived,
          previousStock,
          newStock,
          reason: `Recepción de mercancía - Factura ${invoice.invoiceNumber}`,
          notes: `Proveedor: ${invoice.supplier.name}`,
          referenceId: invoice.id,
          referenceType: 'SUPPLIER_INVOICE',
          supplierInfo: {
            supplierId: invoice.supplierId,
            supplierName: invoice.supplier.name,
            invoiceNumber: invoice.invoiceNumber
          }
        }, { transaction });

        // Actualizar costo del producto
        await product.update({ cost: invoiceItem.unitCost }, { transaction });

        // Actualizar stock de sucursal
        await branchStock.update({
          currentStock: newStock,
          lastCountDate: new Date()
        }, { transaction });

        console.log(`✅ Stock actualizado: ${invoiceItem.productName} | ${previousStock} → ${newStock} (+${receivedItem.quantityReceived})`);
      }

      // Actualizar factura
      const updateData = {
        items: updatedItems,
        receiptStatus: newReceiptStatus
      };

      // Si se completó la recepción, marcar fecha y usuario
      if (newReceiptStatus === 'FULLY_RECEIVED') {
        updateData.receivedAt = new Date();
        updateData.receivedBy = userId;
        updateData.metadata = {
          ...invoice.metadata,
          stockDistributed: true,
          fullyReceivedAt: new Date(),
          fullyReceivedBy: userId
        };
      }

      await invoice.update(updateData, { transaction });

      await transaction.commit();

      // Recargar factura con relaciones
      const updatedInvoice = await SupplierInvoice.findByPk(invoiceId, {
        include: [{
          model: Supplier,
          as: 'supplier'
        }]
      });

      res.json({
        success: true,
        message: newReceiptStatus === 'FULLY_RECEIVED'
          ? 'Mercancía recibida completamente'
          : 'Recepción parcial registrada exitosamente',
        data: updatedInvoice
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error receiving goods:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al recibir la mercancía',
        error: error.message
      });
    }
  }
}

module.exports = SupplierInvoiceController;
