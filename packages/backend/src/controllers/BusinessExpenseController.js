const { Op } = require('sequelize');
const { BusinessExpense, BusinessExpenseCategory, FinancialMovement, User, Business, Branch } = require('../models');
const { uploadPaymentReceipt, deleteDocument } = require('../config/cloudinary');
const PaginationService = require('../services/PaginationService');
const { validatePaginationParams, generatePaginationMeta } = PaginationService;
const PermissionService = require('../services/PermissionService');
const fs = require('fs').promises;

/**
 * Controlador para gestión de gastos del negocio
 * Permite a cada negocio gestionar sus gastos con categorías personalizadas
 */
class BusinessExpenseController {

  // ==================== CATEGORÍAS ====================

  /**
   * Obtener categorías de gastos del negocio
   * GET /api/business/expenses/categories
   */
  static async getCategories(req, res) {
    try {
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.view'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver categorías de gastos'
        });
      }

      const categories = await BusinessExpenseCategory.findAll({
        where: { businessId, isActive: true },
        order: [['sortOrder', 'ASC'], ['name', 'ASC']],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      // Si no tiene categorías, crear las por defecto
      if (categories.length === 0) {
        const defaultCategories = await BusinessExpenseController._createDefaultCategories(businessId, req.user.id);
        return res.json({
          success: true,
          data: defaultCategories,
          message: 'Se crearon categorías por defecto'
        });
      }

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear nueva categoría de gasto
   * POST /api/business/expenses/categories
   */
  static async createCategory(req, res) {
    try {
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.categories'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para crear categorías de gastos'
        });
      }

      const {
        name,
        description,
        color,
        icon,
        requiresReceipt,
        isRecurring,
        defaultAmount
      } = req.body;

      // Validar que el nombre no exista
      const existingCategory = await BusinessExpenseCategory.findOne({
        where: { businessId, name, isActive: true }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }

      const category = await BusinessExpenseCategory.create({
        businessId,
        name,
        description,
        color: color || '#6B7280',
        icon,
        requiresReceipt: requiresReceipt || false,
        isRecurring: isRecurring || false,
        defaultAmount: defaultAmount || null,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: category
      });

    } catch (error) {
      console.error('Error creando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar categoría
   * PUT /api/business/expenses/categories/:id
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      const category = await BusinessExpenseCategory.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      await category.update({
        ...req.body,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category
      });

    } catch (error) {
      console.error('Error actualizando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar categoría (soft delete)
   * DELETE /api/business/expenses/categories/:id
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      const category = await BusinessExpenseCategory.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar que no tenga gastos asociados
      const expensesCount = await BusinessExpense.count({
        where: { categoryId: id, isActive: true }
      });

      if (expensesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene gastos asociados'
        });
      }

      await category.update({
        isActive: false,
        updatedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar categoría',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==================== GASTOS ====================

  /**
   * Obtener lista de gastos con filtros
   * GET /api/business/expenses
   */
  static async getExpenses(req, res) {
    try {
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.view'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver gastos'
        });
      }

      const {
        categoryId,
        branchId,
        status,
        vendor,
        startDate,
        endDate,
        isRecurring,
        page = 1,
        limit = 20,
        sortBy = 'expenseDate',
        sortOrder = 'DESC'
      } = req.query;

      const where = { businessId, isActive: true };

      if (categoryId) where.categoryId = categoryId;
      if (branchId) where.branchId = branchId; // 🆕 Filtro por sucursal
      if (status) where.status = status;
      if (vendor) where.vendor = { [Op.iLike]: `%${vendor}%` };
      if (isRecurring !== undefined) where.isRecurring = isRecurring === 'true';

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate[Op.gte] = new Date(startDate);
        if (endDate) where.expenseDate[Op.lte] = new Date(endDate);
      }

      const { page: validPage, limit: validLimit, offset } = validatePaginationParams({ page, limit });

      const expenses = await BusinessExpense.findAndCountAll({
        where,
        include: [
          {
            model: BusinessExpenseCategory,
            as: 'category',
            attributes: ['id', 'name', 'color', 'icon', 'requiresReceipt']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code'],
            required: false
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: validLimit,
        offset,
        distinct: true
      });

      // Calcular estadísticas
      const stats = await BusinessExpenseController._calculateStats(businessId, where);

      const pagination = generatePaginationMeta(expenses.count, { page: validPage, limit: validLimit });

      res.json({
        success: true,
        data: {
          expenses: expenses.rows,
          stats,
          pagination
        }
      });

    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener gastos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear nuevo gasto
   * POST /api/business/expenses
   */
  static async createExpense(req, res) {
    try {
      console.log('📝 [createExpense] req.body:', req.body);
      console.log('📝 [createExpense] req.file:', req.file);
      
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.create'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para crear gastos'
        });
      }

      const {
        categoryId,
        description,
        amount,
        expenseDate,
        vendor,
        vendorTaxId,
        vendorPhone,
        vendorEmail,
        paymentMethod,
        transactionReference,
        taxAmount,
        taxRate,
        dueDate,
        notes,
        internalReference,
        isRecurring,
        recurringFrequency
      } = req.body;

      // Verificar que la categoría exista y pertenezca al negocio
      const category = await BusinessExpenseCategory.findOne({
        where: { id: categoryId, businessId, isActive: true }
      });

      if (!category) {
        console.log('❌ Categoría no encontrada:', categoryId);
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      console.log('✅ Categoría encontrada:', category.name, '| requiresReceipt:', category.requiresReceipt, '| req.file:', !!req.file);

      // Advertir si la categoría recomienda comprobante pero no se proporcionó
      // (no bloqueamos la creación, solo advertencia)
      if (category.requiresReceipt && !req.file) {
        console.log('⚠️ La categoría recomienda comprobante pero no se proporcionó (permitiendo continuar)');
      }

      const expenseData = {
        businessId,
        categoryId,
        description,
        amount: parseFloat(amount),
        expenseDate,
        vendor,
        vendorTaxId,
        vendorPhone,
        vendorEmail,
        paymentMethod,
        transactionReference,
        taxAmount: taxAmount || 0,
        taxRate: taxRate || 0,
        dueDate,
        notes,
        internalReference,
        isRecurring: isRecurring || false,
        recurringFrequency,
        createdBy: req.user.id
      };

      // Subir comprobante si existe
      if (req.file) {
        try {
          const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
          const result = await uploadPaymentReceipt(
            req.file.path,
            {
              folder: `beauty-control/businesses/${businessId}/expenses`,
              resource_type: resourceType,
              public_id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          );

          expenseData.receiptUrl = result.secure_url;
          expenseData.receiptPublicId = result.public_id;
          expenseData.receiptType = req.file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE';
          expenseData.receiptOriginalName = req.file.originalname;

          await fs.unlink(req.file.path);
        } catch (uploadError) {
          console.error('Error subiendo comprobante:', uploadError);
        }
      }

      const expense = await BusinessExpense.create(expenseData);

      // Crear movimiento financiero asociado
      console.log('🔄 Intentando crear FinancialMovement con datos:', {
        businessId,
        userId: req.user.id,
        type: 'EXPENSE',
        category: 'BUSINESS_EXPENSE',
        businessExpenseCategoryId: categoryId,
        businessExpenseId: expense.id,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'CASH'
      });

      try {
        const financialMovement = await FinancialMovement.create({
          businessId,
          userId: req.user.id,
          type: 'EXPENSE',
          category: 'BUSINESS_EXPENSE',
          businessExpenseCategoryId: categoryId,
          businessExpenseId: expense.id,
          transactionDate: expenseDate || new Date().toISOString().split('T')[0],
          amount: parseFloat(amount),
          currency: 'COP',
          description: description,
          notes: notes,
          paymentMethod: paymentMethod || 'CASH',
          transactionId: transactionReference,
          status: 'PENDING', // Cambiar a PENDING hasta que se pague
          dueDate: dueDate,
          receiptUrl: expenseData.receiptUrl,
          taxAmount: expenseData.taxAmount || 0,
          taxRate: expenseData.taxRate || 0
        });

        console.log('✅ FinancialMovement creado para gasto:', {
          id: financialMovement.id,
          type: financialMovement.type,
          category: financialMovement.category,
          amount: financialMovement.amount,
          businessId: financialMovement.businessId
        });
      } catch (fmError) {
        console.error('❌ Error creando FinancialMovement:', fmError);
        console.error('❌ Error details:', {
          message: fmError.message,
          name: fmError.name,
          errors: fmError.errors
        });
      }

      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error creando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear gasto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener gasto específico
   * GET /api/business/expenses/:id
   */
  static async getExpenseById(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      const expense = await BusinessExpense.findOne({
        where: { id, businessId, isActive: true },
        include: [
          {
            model: BusinessExpenseCategory,
            as: 'category'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ]
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      res.json({
        success: true,
        data: expense
      });

    } catch (error) {
      console.error('Error obteniendo gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener gasto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar gasto
   * PUT /api/business/expenses/:id
   */
  static async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.edit'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar gastos'
        });
      }

      const expense = await BusinessExpense.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      // No permitir editar gastos pagados
      if (expense.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'No se puede editar un gasto que ya ha sido pagado'
        });
      }

      // Actualizar comprobante si se proporciona uno nuevo
      if (req.file) {
        // Eliminar anterior si existe
        if (expense.receiptPublicId) {
          try {
            await deleteDocument(expense.receiptPublicId);
          } catch (err) {
            console.error('Error eliminando comprobante anterior:', err);
          }
        }

        const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
        const result = await uploadPaymentReceipt(
          req.file.path,
          {
            folder: `beauty-control/businesses/${businessId}/expenses`,
            resource_type: resourceType
          }
        );

        req.body.receiptUrl = result.secure_url;
        req.body.receiptPublicId = result.public_id;
        req.body.receiptType = req.file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE';
        req.body.receiptOriginalName = req.file.originalname;

        await fs.unlink(req.file.path);
      }

      await expense.update({
        ...req.body,
        updatedBy: req.user.id
      });

      // Actualizar movimiento financiero asociado si cambió el monto o descripción
      if (req.body.amount || req.body.description || req.body.paymentMethod) {
        await FinancialMovement.update(
          {
            amount: req.body.amount ? parseFloat(req.body.amount) : expense.amount,
            description: req.body.description || expense.description,
            paymentMethod: req.body.paymentMethod || expense.paymentMethod,
            notes: req.body.notes || expense.notes
          },
          {
            where: { businessExpenseId: expense.id }
          }
        );
      }

      res.json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error actualizando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar gasto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar gasto (soft delete)
   * DELETE /api/business/expenses/:id
   */
  static async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.delete'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar gastos'
        });
      }

      const expense = await BusinessExpense.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      if (expense.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un gasto que ya ha sido pagado'
        });
      }

      await expense.update({
        isActive: false,
        updatedBy: req.user.id
      });

      // Cancelar movimiento financiero asociado
      await FinancialMovement.update(
        {
          status: 'CANCELLED'
        },
        {
          where: { businessExpenseId: expense.id }
        }
      );

      res.json({
        success: true,
        message: 'Gasto eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar gasto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Aprobar gasto
   * PATCH /api/business/expenses/:id/approve
   */
  static async approveExpense(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;

      // Verificar permiso
      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        businessId,
        'expenses.approve'
      );
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para aprobar gastos'
        });
      }

      const { notes } = req.body;

      const expense = await BusinessExpense.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      if (expense.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden aprobar gastos con estado PENDING'
        });
      }

      await expense.update({
        status: 'APPROVED',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        notes: notes || expense.notes,
        updatedBy: req.user.id
      });

      // Actualizar movimiento financiero asociado
      await FinancialMovement.update(
        {
          status: 'COMPLETED'
        },
        {
          where: { businessExpenseId: expense.id }
        }
      );

      res.json({
        success: true,
        message: 'Gasto aprobado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error aprobando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aprobar gasto',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Marcar gasto como pagado
   * PATCH /api/business/expenses/:id/mark-paid
   */
  static async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.tenancy.businessId || req.user.businessId;
      const { paidDate, paymentMethod, transactionReference } = req.body;

      const expense = await BusinessExpense.findOne({
        where: { id, businessId, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      await expense.update({
        status: 'PAID',
        paidDate: paidDate || new Date(),
        paymentMethod,
        transactionReference,
        updatedBy: req.user.id
      });

      // Actualizar movimiento financiero
      await FinancialMovement.update(
        {
          status: 'COMPLETED',
          paidDate: paidDate || new Date(),
          paymentMethod: paymentMethod || expense.paymentMethod,
          transactionId: transactionReference || expense.transactionReference
        },
        {
          where: { businessExpenseId: expense.id }
        }
      );

      res.json({
        success: true,
        message: 'Gasto marcado como pagado',
        data: expense
      });

    } catch (error) {
      console.error('Error marcando gasto como pagado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar gasto como pagado',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas de gastos
   * GET /api/business/expenses/stats
   */
  static async getStats(req, res) {
    try {
      const businessId = req.tenancy.businessId || req.user.businessId;
      const { startDate, endDate, categoryId } = req.query;

      const where = { businessId, isActive: true };

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate[Op.gte] = new Date(startDate);
        if (endDate) where.expenseDate[Op.lte] = new Date(endDate);
      }

      if (categoryId) where.categoryId = categoryId;

      const stats = await BusinessExpenseController._calculateStats(businessId, where);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Crear categorías por defecto para un negocio
   */
  static async _createDefaultCategories(businessId, userId) {
    const defaultCategories = [
      {
        name: 'Arriendo',
        description: 'Pago de arriendo del local',
        color: '#EF4444',
        icon: 'home',
        requiresReceipt: true,
        isRecurring: true
      },
      {
        name: 'Servicios públicos',
        description: 'Agua, luz, gas, internet',
        color: '#F59E0B',
        icon: 'bolt',
        requiresReceipt: true,
        isRecurring: true
      },
      {
        name: 'Nómina',
        description: 'Pago de salarios',
        color: '#10B981',
        icon: 'users',
        requiresReceipt: false,
        isRecurring: true
      },
      {
        name: 'Comisiones a Especialistas',
        description: 'Pago de comisiones a especialistas por servicios realizados',
        color: '#8B5CF6',
        icon: 'currency-dollar',
        requiresReceipt: false,
        isRecurring: true
      },
      {
        name: 'Insumos y productos',
        description: 'Compra de productos y materiales',
        color: '#A855F7',
        icon: 'shopping-cart',
        requiresReceipt: true,
        isRecurring: false
      },
      {
        name: 'Marketing',
        description: 'Publicidad y promoción',
        color: '#EC4899',
        icon: 'megaphone',
        requiresReceipt: false,
        isRecurring: false
      },
      {
        name: 'Mantenimiento',
        description: 'Reparaciones y mantenimiento',
        color: '#6366F1',
        icon: 'wrench',
        requiresReceipt: true,
        isRecurring: false
      },
      {
        name: 'Impuestos',
        description: 'Impuestos y contribuciones',
        color: '#DC2626',
        icon: 'document-text',
        requiresReceipt: true,
        isRecurring: false
      },
      {
        name: 'Otros gastos',
        description: 'Gastos varios',
        color: '#6B7280',
        icon: 'dots-horizontal',
        requiresReceipt: false,
        isRecurring: false
      }
    ];

    const createdCategories = [];
    for (let i = 0; i < defaultCategories.length; i++) {
      const category = await BusinessExpenseCategory.create({
        ...defaultCategories[i],
        businessId,
        createdBy: userId,
        sortOrder: i
      });
      createdCategories.push(category);
    }

    return createdCategories;
  }

  /**
   * Calcular estadísticas de gastos
   */
  static async _calculateStats(businessId, whereCondition = {}) {
    const { fn, col } = require('sequelize');

    // Totales por estado
    const byStatus = await BusinessExpense.findAll({
      where: whereCondition,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    // Totales por categoría
    const byCategory = await BusinessExpense.findAll({
      where: whereCondition,
      attributes: [
        'categoryId',
        [fn('COUNT', col('BusinessExpense.id')), 'count'],
        [fn('SUM', col('amount')), 'total']
      ],
      include: [
        {
          model: BusinessExpenseCategory,
          as: 'category',
          attributes: ['name', 'color']
        }
      ],
      group: ['categoryId', 'category.id', 'category.name', 'category.color'],
      raw: true
    });

    // Totales generales
    const general = await BusinessExpense.findOne({
      where: whereCondition,
      attributes: [
        [fn('COUNT', col('BusinessExpense.id')), 'totalExpenses'],
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('AVG', col('amount')), 'averageAmount']
      ],
      raw: true
    });

    return {
      byStatus,
      byCategory,
      general
    };
  }

  /**
   * Obtener o crear la categoría "Comisiones a Especialistas"
   * Útil para cuando se registra un pago de comisión
   */
  static async getOrCreateCommissionCategory(businessId, userId) {
    let category = await BusinessExpenseCategory.findOne({
      where: { 
        businessId, 
        name: 'Comisiones a Especialistas',
        isActive: true 
      }
    });

    if (!category) {
      category = await BusinessExpenseCategory.create({
        businessId,
        name: 'Comisiones a Especialistas',
        description: 'Pago de comisiones a especialistas por servicios realizados',
        color: '#8B5CF6',
        icon: 'currency-dollar',
        requiresReceipt: false,
        isRecurring: true,
        createdBy: userId,
        sortOrder: 3 // Después de Nómina
      });
    }

    return category;
  }
}

module.exports = BusinessExpenseController;
