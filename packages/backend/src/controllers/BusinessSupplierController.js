/**
 * Controlador para Gestión de Proveedores
 * 
 * Proporciona endpoints para:
 * - CRUD de proveedores y contactos
 * - Gestión de órdenes de compra
 * - Procesamiento de facturas
 * - Historial de compras y pagos
 * - Evaluación de proveedores
 * - Catálogo de productos por proveedor
 * - Reportes de compras y rendimiento
 */

const BusinessConfigService = require('../services/BusinessConfigService');

class BusinessSupplierController {

  // ================================
  // PROVEEDORES - CRUD
  // ================================

  /**
   * Obtener lista de proveedores
   * GET /business/config/suppliers
   */
  async getSuppliers(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        type: req.query.type,
        status: req.query.status || 'ACTIVE',
        category: req.query.category,
        search: req.query.search,
        country: req.query.country,
        city: req.query.city,
        hasActiveOrders: req.query.hasActiveOrders === 'true' ? true : 
                        req.query.hasActiveOrders === 'false' ? false : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'ASC'
      };

      const result = await BusinessConfigService.getSuppliers(businessId, filters);

      res.json({
        success: true,
        data: result,
        message: 'Proveedores obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener proveedores'
      });
    }
  }

  /**
   * Obtener proveedor específico
   * GET /business/config/suppliers/:id
   */
  async getSupplier(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;

      const supplier = await BusinessConfigService.getSupplier(businessId, id);

      res.json({
        success: true,
        data: supplier,
        message: 'Proveedor obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier:', error);
      const statusCode = error.message === 'Proveedor no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener proveedor'
      });
    }
  }

  /**
   * Crear nuevo proveedor
   * POST /business/config/suppliers
   */
  async createSupplier(req, res) {
    try {
      const businessId = req.business.id;
      const supplierData = req.body;

      // Validaciones básicas
      if (!supplierData.name || supplierData.name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del proveedor es obligatorio y debe tener al menos 2 caracteres'
        });
      }

      if (!supplierData.type) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de proveedor es obligatorio'
        });
      }

      const supplier = await BusinessConfigService.createSupplier(businessId, supplierData);

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Proveedor creado exitosamente'
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      const statusCode = error.message.includes('Ya existe') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al crear proveedor'
      });
    }
  }

  /**
   * Actualizar proveedor
   * PUT /business/config/suppliers/:id
   */
  async updateSupplier(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const supplierData = req.body;

      const supplier = await BusinessConfigService.updateSupplier(businessId, id, supplierData);

      res.json({
        success: true,
        data: supplier,
        message: 'Proveedor actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      const statusCode = error.message === 'Proveedor no encontrado' ? 404 : 
                         error.message.includes('Ya existe') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar proveedor'
      });
    }
  }

  /**
   * Eliminar proveedor
   * DELETE /business/config/suppliers/:id
   */
  async deleteSupplier(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;

      const result = await BusinessConfigService.deleteSupplier(businessId, id);

      res.json({
        success: true,
        data: result,
        message: 'Proveedor eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      const statusCode = error.message === 'Proveedor no encontrado' ? 404 : 
                         error.message.includes('No se puede eliminar') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar proveedor'
      });
    }
  }

  /**
   * Cambiar estado del proveedor
   * PATCH /business/config/suppliers/:id/status
   */
  async updateSupplierStatus(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El estado es obligatorio'
        });
      }

      const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED', 'UNDER_REVIEW'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const supplier = await BusinessConfigService.updateSupplierStatus(businessId, id, status);

      res.json({
        success: true,
        data: supplier,
        message: 'Estado del proveedor actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating supplier status:', error);
      const statusCode = error.message === 'Proveedor no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al cambiar estado del proveedor'
      });
    }
  }

  // ================================
  // GESTIÓN DE CONTACTOS
  // ================================

  /**
   * Obtener contactos del proveedor
   * GET /business/config/suppliers/:id/contacts
   */
  async getSupplierContacts(req, res) {
    try {
      const { id } = req.params;

      const contacts = await BusinessConfigService.getSupplierContacts(id);

      res.json({
        success: true,
        data: contacts,
        message: 'Contactos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier contacts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener contactos del proveedor'
      });
    }
  }

  /**
   * Agregar contacto al proveedor
   * POST /business/config/suppliers/:id/contacts
   */
  async addSupplierContact(req, res) {
    try {
      const { id } = req.params;
      const contactData = req.body;

      // Validaciones básicas
      if (!contactData.name || contactData.name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del contacto es obligatorio'
        });
      }

      if (!contactData.position) {
        return res.status(400).json({
          success: false,
          message: 'El cargo del contacto es obligatorio'
        });
      }

      const contact = await BusinessConfigService.addSupplierContact(id, contactData);

      res.status(201).json({
        success: true,
        data: contact,
        message: 'Contacto agregado exitosamente'
      });
    } catch (error) {
      console.error('Error adding supplier contact:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar contacto'
      });
    }
  }

  /**
   * Actualizar contacto del proveedor
   * PUT /business/config/suppliers/:id/contacts/:contactId
   */
  async updateSupplierContact(req, res) {
    try {
      const { id, contactId } = req.params;
      const contactData = req.body;

      const contact = await BusinessConfigService.updateSupplierContact(id, contactId, contactData);

      res.json({
        success: true,
        data: contact,
        message: 'Contacto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating supplier contact:', error);
      const statusCode = error.message === 'Contacto no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar contacto'
      });
    }
  }

  /**
   * Eliminar contacto del proveedor
   * DELETE /business/config/suppliers/:id/contacts/:contactId
   */
  async deleteSupplierContact(req, res) {
    try {
      const { id, contactId } = req.params;

      const result = await BusinessConfigService.deleteSupplierContact(id, contactId);

      res.json({
        success: true,
        data: result,
        message: 'Contacto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting supplier contact:', error);
      const statusCode = error.message === 'Contacto no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar contacto'
      });
    }
  }

  // ================================
  // ÓRDENES DE COMPRA
  // ================================

  /**
   * Obtener órdenes de compra
   * GET /business/config/suppliers/purchase-orders
   */
  async getPurchaseOrders(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        supplierId: req.query.supplierId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await BusinessConfigService.getPurchaseOrders(businessId, filters);

      res.json({
        success: true,
        data: result,
        message: 'Órdenes de compra obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting purchase orders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener órdenes de compra'
      });
    }
  }

  /**
   * Obtener orden de compra específica
   * GET /business/config/suppliers/purchase-orders/:id
   */
  async getPurchaseOrder(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;

      const order = await BusinessConfigService.getPurchaseOrder(businessId, id);

      res.json({
        success: true,
        data: order,
        message: 'Orden de compra obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error getting purchase order:', error);
      const statusCode = error.message === 'Orden de compra no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener orden de compra'
      });
    }
  }

  /**
   * Crear nueva orden de compra
   * POST /business/config/suppliers/purchase-orders
   */
  async createPurchaseOrder(req, res) {
    try {
      const businessId = req.business.id;
      const orderData = req.body;

      // Validaciones básicas
      if (!orderData.supplierId) {
        return res.status(400).json({
          success: false,
          message: 'El proveedor es obligatorio'
        });
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Los items de la orden son obligatorios'
        });
      }

      // Validar items
      for (const item of orderData.items) {
        if (!item.productName || !item.quantity || !item.unitPrice) {
          return res.status(400).json({
            success: false,
            message: 'Cada item debe tener nombre, cantidad y precio'
          });
        }
      }

      const order = await BusinessConfigService.createPurchaseOrder(businessId, orderData);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Orden de compra creada exitosamente'
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear orden de compra'
      });
    }
  }

  /**
   * Actualizar orden de compra
   * PUT /business/config/suppliers/purchase-orders/:id
   */
  async updatePurchaseOrder(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const orderData = req.body;

      const order = await BusinessConfigService.updatePurchaseOrder(businessId, id, orderData);

      res.json({
        success: true,
        data: order,
        message: 'Orden de compra actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating purchase order:', error);
      const statusCode = error.message === 'Orden de compra no encontrada' ? 404 : 
                         error.message.includes('No se puede modificar') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar orden de compra'
      });
    }
  }

  /**
   * Cambiar estado de orden de compra
   * PATCH /business/config/suppliers/purchase-orders/:id/status
   */
  async updatePurchaseOrderStatus(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const { status, ...metadata } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El estado es obligatorio'
        });
      }

      const validStatuses = ['DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const order = await BusinessConfigService.updatePurchaseOrderStatus(businessId, id, status, metadata);

      res.json({
        success: true,
        data: order,
        message: 'Estado de la orden actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      const statusCode = error.message === 'Orden de compra no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al cambiar estado de la orden'
      });
    }
  }

  /**
   * Marcar orden como recibida
   * POST /business/config/suppliers/purchase-orders/:id/receive
   */
  async receiveOrderItems(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const { receivedItems, ...receiptData } = req.body;

      if (!receivedItems || !Array.isArray(receivedItems) || receivedItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Los items recibidos son obligatorios'
        });
      }

      // Validar items recibidos
      for (const item of receivedItems) {
        if (!item.productId || !item.receivedQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Cada item debe tener ID del producto y cantidad recibida'
          });
        }
      }

      const order = await BusinessConfigService.receiveOrderItems(businessId, id, receivedItems, receiptData);

      res.json({
        success: true,
        data: order,
        message: 'Items recibidos registrados exitosamente'
      });
    } catch (error) {
      console.error('Error receiving order items:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al recibir items de la orden'
      });
    }
  }

  // ================================
  // GESTIÓN DE FACTURAS
  // ================================

  /**
   * Obtener facturas de proveedores
   * GET /business/config/suppliers/invoices
   */
  async getSupplierInvoices(req, res) {
    try {
      const businessId = req.business.id;
      const filters = {
        supplierId: req.query.supplierId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        overdue: req.query.overdue === 'true',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await BusinessConfigService.getSupplierInvoices(businessId, filters);

      res.json({
        success: true,
        data: result,
        message: 'Facturas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier invoices:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener facturas'
      });
    }
  }

  /**
   * Obtener factura específica
   * GET /business/config/suppliers/invoices/:id
   */
  async getSupplierInvoice(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;

      const invoice = await BusinessConfigService.getSupplierInvoice(businessId, id);

      res.json({
        success: true,
        data: invoice,
        message: 'Factura obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier invoice:', error);
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener factura'
      });
    }
  }

  /**
   * Crear factura de proveedor
   * POST /business/config/suppliers/invoices
   */
  async createSupplierInvoice(req, res) {
    try {
      const businessId = req.business.id;
      const invoiceData = req.body;

      // Validaciones básicas
      if (!invoiceData.supplierId) {
        return res.status(400).json({
          success: false,
          message: 'El proveedor es obligatorio'
        });
      }

      if (!invoiceData.invoiceNumber) {
        return res.status(400).json({
          success: false,
          message: 'El número de factura es obligatorio'
        });
      }

      if (!invoiceData.issueDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de emisión es obligatoria'
        });
      }

      if (!invoiceData.dueDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de vencimiento es obligatoria'
        });
      }

      if (!invoiceData.total || invoiceData.total <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El total debe ser mayor a cero'
        });
      }

      const invoice = await BusinessConfigService.createSupplierInvoice(businessId, invoiceData);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Factura creada exitosamente'
      });
    } catch (error) {
      console.error('Error creating supplier invoice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear factura'
      });
    }
  }

  /**
   * Actualizar factura de proveedor
   * PUT /business/config/suppliers/invoices/:id
   */
  async updateSupplierInvoice(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const invoiceData = req.body;

      const invoice = await BusinessConfigService.updateSupplierInvoice(businessId, id, invoiceData);

      res.json({
        success: true,
        data: invoice,
        message: 'Factura actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating supplier invoice:', error);
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar factura'
      });
    }
  }

  /**
   * Cambiar estado de factura
   * PATCH /business/config/suppliers/invoices/:id/status
   */
  async updateInvoiceStatus(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const { status, ...metadata } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El estado es obligatorio'
        });
      }

      const validStatuses = ['PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        });
      }

      const invoice = await BusinessConfigService.updateInvoiceStatus(businessId, id, status, metadata);

      res.json({
        success: true,
        data: invoice,
        message: 'Estado de la factura actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      const statusCode = error.message === 'Factura no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al cambiar estado de la factura'
      });
    }
  }

  /**
   * Registrar pago de factura
   * POST /business/config/suppliers/invoices/:id/payments
   */
  async recordInvoicePayment(req, res) {
    try {
      const businessId = req.business.id;
      const { id } = req.params;
      const paymentData = req.body;

      // Validaciones básicas
      if (!paymentData.amount || paymentData.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a cero'
        });
      }

      if (!paymentData.paymentDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de pago es obligatoria'
        });
      }

      if (!paymentData.paymentMethod) {
        return res.status(400).json({
          success: false,
          message: 'El método de pago es obligatorio'
        });
      }

      const payment = await BusinessConfigService.recordInvoicePayment(businessId, id, paymentData);

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Pago registrado exitosamente'
      });
    } catch (error) {
      console.error('Error recording invoice payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar pago'
      });
    }
  }

  // ================================
  // CATÁLOGO DE PRODUCTOS
  // ================================

  /**
   * Obtener catálogo del proveedor
   * GET /business/config/suppliers/:id/catalog
   */
  async getSupplierCatalog(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        category: req.query.category,
        search: req.query.search,
        available: req.query.available === 'true' ? true : 
                  req.query.available === 'false' ? false : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await BusinessConfigService.getSupplierCatalog(id, filters);

      res.json({
        success: true,
        data: result,
        message: 'Catálogo obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier catalog:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener catálogo del proveedor'
      });
    }
  }

  /**
   * Agregar producto al catálogo
   * POST /business/config/suppliers/:id/catalog
   */
  async addProductToCatalog(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      // Validaciones básicas
      if (!productData.supplierSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU del proveedor es obligatorio'
        });
      }

      if (!productData.name || productData.name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es obligatorio'
        });
      }

      if (!productData.price || productData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser mayor a cero'
        });
      }

      const product = await BusinessConfigService.addProductToCatalog(id, productData);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto agregado al catálogo exitosamente'
      });
    } catch (error) {
      console.error('Error adding product to catalog:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar producto al catálogo'
      });
    }
  }

  /**
   * Actualizar producto del catálogo
   * PUT /business/config/suppliers/:id/catalog/:catalogItemId
   */
  async updateCatalogProduct(req, res) {
    try {
      const { id, catalogItemId } = req.params;
      const productData = req.body;

      const product = await BusinessConfigService.updateCatalogProduct(id, catalogItemId, productData);

      res.json({
        success: true,
        data: product,
        message: 'Producto del catálogo actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating catalog product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar producto del catálogo'
      });
    }
  }

  /**
   * Eliminar producto del catálogo
   * DELETE /business/config/suppliers/:id/catalog/:catalogItemId
   */
  async removeCatalogProduct(req, res) {
    try {
      const { id, catalogItemId } = req.params;

      const result = await BusinessConfigService.removeCatalogProduct(id, catalogItemId);

      res.json({
        success: true,
        data: result,
        message: 'Producto eliminado del catálogo exitosamente'
      });
    } catch (error) {
      console.error('Error removing catalog product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar producto del catálogo'
      });
    }
  }

  // ================================
  // EVALUACIONES DE PROVEEDORES
  // ================================

  /**
   * Obtener evaluaciones del proveedor
   * GET /business/config/suppliers/:id/evaluations
   */
  async getSupplierEvaluations(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const evaluations = await BusinessConfigService.getSupplierEvaluations(id, filters);

      res.json({
        success: true,
        data: evaluations,
        message: 'Evaluaciones obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier evaluations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener evaluaciones del proveedor'
      });
    }
  }

  /**
   * Crear evaluación del proveedor
   * POST /business/config/suppliers/:id/evaluations
   */
  async createSupplierEvaluation(req, res) {
    try {
      const { id } = req.params;
      const evaluationData = req.body;

      // Validaciones básicas
      const requiredScores = ['qualityScore', 'deliveryScore', 'serviceScore', 'priceScore'];
      for (const score of requiredScores) {
        if (!evaluationData[score] || evaluationData[score] < 1 || evaluationData[score] > 5) {
          return res.status(400).json({
            success: false,
            message: `${score} debe ser un valor entre 1 y 5`
          });
        }
      }

      const evaluation = await BusinessConfigService.createSupplierEvaluation(id, evaluationData);

      res.status(201).json({
        success: true,
        data: evaluation,
        message: 'Evaluación creada exitosamente'
      });
    } catch (error) {
      console.error('Error creating supplier evaluation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear evaluación'
      });
    }
  }

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================

  /**
   * Obtener estadísticas de proveedores
   * GET /business/config/suppliers/stats
   */
  async getSuppliersStats(req, res) {
    try {
      const businessId = req.business.id;

      const stats = await BusinessConfigService.getSuppliersStats(businessId);

      res.json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting suppliers stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * Obtener reporte de compras
   * GET /business/config/suppliers/purchase-report
   */
  async getPurchaseReport(req, res) {
    try {
      const businessId = req.business.id;
      const params = {
        period: req.query.period,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        supplierId: req.query.supplierId
      };

      const report = await BusinessConfigService.getPurchaseReport(businessId, params);

      res.json({
        success: true,
        data: report,
        message: 'Reporte de compras generado exitosamente'
      });
    } catch (error) {
      console.error('Error getting purchase report:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar reporte de compras'
      });
    }
  }

  /**
   * Obtener análisis de rendimiento de proveedores
   * GET /business/config/suppliers/performance-analysis
   */
  async getSupplierPerformanceAnalysis(req, res) {
    try {
      const businessId = req.business.id;
      const params = {
        period: req.query.period,
        minOrders: parseInt(req.query.minOrders) || 1
      };

      const analysis = await BusinessConfigService.getSupplierPerformanceAnalysis(businessId, params);

      res.json({
        success: true,
        data: analysis,
        message: 'Análisis de rendimiento generado exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier performance analysis:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener análisis de rendimiento'
      });
    }
  }

  /**
   * Obtener facturas vencidas
   * GET /business/config/suppliers/overdue-invoices
   */
  async getOverdueInvoices(req, res) {
    try {
      const businessId = req.business.id;
      const days = parseInt(req.query.days) || 0;

      const invoices = await BusinessConfigService.getOverdueInvoices(businessId, days);

      res.json({
        success: true,
        data: invoices,
        message: 'Facturas vencidas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener facturas vencidas'
      });
    }
  }

  // ================================
  // GESTIÓN DE DOCUMENTOS
  // ================================

  /**
   * Subir documento del proveedor
   * POST /business/config/suppliers/:id/documents
   */
  async uploadSupplierDocument(req, res) {
    try {
      const { id } = req.params;
      const file = req.file;
      const { documentType, description } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'El archivo es obligatorio'
        });
      }

      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de documento es obligatorio'
        });
      }

      const document = await BusinessConfigService.uploadSupplierDocument(id, file, documentType, description);

      res.status(201).json({
        success: true,
        data: document,
        message: 'Documento subido exitosamente'
      });
    } catch (error) {
      console.error('Error uploading supplier document:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir documento'
      });
    }
  }

  /**
   * Obtener documentos del proveedor
   * GET /business/config/suppliers/:id/documents
   */
  async getSupplierDocuments(req, res) {
    try {
      const { id } = req.params;
      const documentType = req.query.documentType;

      const documents = await BusinessConfigService.getSupplierDocuments(id, documentType);

      res.json({
        success: true,
        data: documents,
        message: 'Documentos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error getting supplier documents:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener documentos'
      });
    }
  }

  /**
   * Eliminar documento del proveedor
   * DELETE /business/config/suppliers/:id/documents/:documentId
   */
  async deleteSupplierDocument(req, res) {
    try {
      const { id, documentId } = req.params;

      const result = await BusinessConfigService.deleteSupplierDocument(id, documentId);

      res.json({
        success: true,
        data: result,
        message: 'Documento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting supplier document:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar documento'
      });
    }
  }
}

module.exports = new BusinessSupplierController();