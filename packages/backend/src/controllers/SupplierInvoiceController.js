const {
  SupplierInvoice,
  Supplier,
  Product,
  BranchStock,
  SupplierCatalogItem,
  Business,
  SupplierInvoicePayment,
  sequelize
} = require('../models');
const { uploadDocument } = require('../config/cloudinary');
const { Op } = require('sequelize');

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
        supplierId,
        supplierData, // Datos para crear proveedor si no existe
        invoiceNumber,
        issueDate,
        dueDate,
        items, // [{ productId, productData, quantity, unitCost, total }]
        subtotal,
        tax,
        taxIncluded = false, // Si el IVA está incluido en los precios
        taxPercentage = 0, // Porcentaje de IVA (0, 5, 19, etc.)
        total,
        currency = 'COP',
        notes,
        attachments = [] // URLs de Cloudinary
      } = req.body;

      console.log('📎 Attachments recibidos:', attachments);

      // Validaciones
      if (!invoiceNumber || !issueDate || !dueDate || !items || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: invoiceNumber, issueDate, dueDate, items'
        });
      }

      let finalSupplierId = supplierId;

      // Si no existe el proveedor, crearlo
      if (!supplierId && supplierData) {
        const newSupplier = await Supplier.create({
          businessId,
          name: supplierData.name,
          email: supplierData.email,
          phone: supplierData.phone,
          taxId: supplierData.taxId,
          address: supplierData.address,
          city: supplierData.city,
          country: supplierData.country,
          contactPerson: supplierData.contactPerson,
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

      // Procesar items y crear productos si es necesario
      const processedItems = [];
      
      for (const item of items) {
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
            isActive: true
          }, { transaction });

          finalProductId = newProduct.id;
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
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total || (item.quantity * item.unitCost)
        });
      }

      // Crear la factura
      const invoice = await SupplierInvoice.create({
        businessId,
        supplierId: finalSupplierId,
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
        paidAmount: 0,
        remainingAmount: total
      }, { transaction });

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
        message: 'Factura creada exitosamente',
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
   * Aprobar factura y actualizar inventario
   * POST /api/business/:businessId/supplier-invoices/:invoiceId/approve
   */
  static async approveInvoice(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { businessId, invoiceId } = req.params;
      const { businessId: userBusinessId, id: userId } = req.user;
      const { branchId } = req.body; // Sucursal donde se recibirán los productos

      if (businessId !== userBusinessId) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este negocio'
        });
      }

      if (!branchId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Debes especificar la sucursal donde se recibirán los productos'
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

      // Actualizar stock de cada producto en la sucursal
           // Actualizar stock de cada producto en la sucursal
      for (const item of invoice.items) {
        if (!item.productId) continue;

        // Buscar o crear BranchStock
        const [branchStock, created] = await BranchStock.findOrCreate({
          where: {
            branchId,
            productId: item.productId
          },
          defaults: {
            businessId,
            branchId,
            productId: item.productId,
            currentStock: 0,
            minStock: 0,
            maxStock: 0
          },
          transaction
        });

        // Incrementar stock
        await branchStock.update({
          currentStock: branchStock.currentStock + item.quantity
        }, { transaction });

        // Obtener producto para actualizar costo y catálogo
        const product = await Product.findByPk(item.productId, { transaction });
        
        // Actualizar costo del producto
        await product.update(
          { cost: item.unitCost },
          { transaction }
        );

        // 🆕 AUTO-GENERAR CATÁLOGO DEL PROVEEDOR
        // Crear o actualizar item en el catálogo del proveedor
        const catalogItemData = {
          supplierId: invoice.supplierId,
          supplierSku: product.sku || `${invoice.supplierId}-${item.productId}`,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: item.unitCost, // Precio del proveedor
          currency: 'COP',
          unit: product.unit,
          available: true,
          images: product.images || [],
          lastUpdate: new Date()
        };

        // Buscar si ya existe en el catálogo
        const existingCatalogItem = await SupplierCatalogItem.findOne({
          where: {
            supplierId: invoice.supplierId,
            supplierSku: catalogItemData.supplierSku
          },
          transaction
        });

        if (existingCatalogItem) {
          // Actualizar precio y fecha
          await existingCatalogItem.update({
            price: catalogItemData.price,
            name: catalogItemData.name,
            description: catalogItemData.description,
            category: catalogItemData.category,
            brand: catalogItemData.brand,
            unit: catalogItemData.unit,
            images: catalogItemData.images,
            lastUpdate: catalogItemData.lastUpdate,
            available: true
          }, { transaction });
        } else {
          // Crear nuevo item en el catálogo
          await SupplierCatalogItem.create(catalogItemData, { transaction });
        }
      }

      // Actualizar estado de la factura
      await invoice.update({
        status: 'APPROVED'
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Factura aprobada e inventario actualizado exitosamente',
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

      // Obtener la factura
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

      // Validar que la factura esté aprobada
      if (invoice.status === 'PENDING') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'La factura debe estar aprobada antes de registrar pagos'
        });
      }

      // Validar que la factura no esté completamente pagada
      if (invoice.status === 'PAID') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'La factura ya está completamente pagada'
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

      // Actualizar la factura
      const newPaidAmount = parseFloat(invoice.paidAmount) + amountFloat;
      const newRemainingAmount = parseFloat(invoice.total) - newPaidAmount;

      await invoice.update({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? 'PAID' : invoice.status
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
}

module.exports = SupplierInvoiceController;
