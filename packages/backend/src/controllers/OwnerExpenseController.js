const { Op, literal, fn, col } = require('sequelize');
const { OwnerExpense, User } = require('../models');
const PaginationService = require('../services/PaginationService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

class OwnerExpenseController {

  /**
   * Crear un nuevo gasto
   */
  static async createExpense(req, res) {
    try {
      const {
        description,
        amount,
        currency = 'COP',
        category,
        subcategory,
        expenseDate,
        dueDate,
        vendor,
        vendorTaxId,
        vendorEmail,
        taxAmount = 0,
        taxRate = 0,
        isRecurring = false,
        recurringFrequency,
        notes,
        internalReference,
        projectCode
      } = req.body;

      const createdBy = req.user.id;

      // Validaciones
      if (!description || !amount || !category || !expenseDate) {
        return res.status(400).json({
          success: false,
          message: 'Los campos description, amount, category y expenseDate son obligatorios'
        });
      }

      // Crear el gasto
      const expenseData = {
        description,
        amount: parseFloat(amount),
        currency,
        category,
        subcategory,
        expenseDate: new Date(expenseDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        vendor,
        vendorTaxId,
        vendorEmail,
        taxAmount: parseFloat(taxAmount),
        taxRate: parseFloat(taxRate),
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        notes,
        internalReference,
        projectCode,
        createdBy,
        status: 'PENDING'
      };

      // Manejar comprobante si existe
      if (req.file) {
        try {
          const cloudinaryResult = await uploadToCloudinary(
            req.file.path,
            {
              folder: 'beauty-control/owner/expenses',
              resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
              public_id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          );

          expenseData.receiptUrl = cloudinaryResult.secure_url;
          expenseData.receiptPublicId = cloudinaryResult.public_id;
          expenseData.receiptType = req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF';
          expenseData.receiptOriginalName = req.file.originalname;

          // Eliminar archivo temporal
          await fs.unlink(req.file.path);
        } catch (cloudinaryError) {
          console.error('Error subiendo a Cloudinary:', cloudinaryError);
          // No fallar si hay error con cloudinary, solo continuar sin comprobante
        }
      }

      const expense = await OwnerExpense.create(expenseData);
      
      res.status(201).json({
        success: true,
        message: 'Gasto creado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error creando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener lista de gastos con filtros
   */
  static async getExpenses(req, res) {
    try {
      const { 
        category,
        status,
        vendor,
        startDate,
        endDate,
        isRecurring,
        projectCode,
        page = 1, 
        limit = 20,
        sortBy = 'expenseDate',
        sortOrder = 'DESC'
      } = req.query;

      // Construir filtros
      const where = { isActive: true };
      
      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      if (vendor) {
        where.vendor = { [Op.iLike]: `%${vendor}%` };
      }

      if (projectCode) {
        where.projectCode = projectCode;
      }

      if (isRecurring !== undefined) {
        where.isRecurring = isRecurring === 'true';
      }

      // Filtro por fechas
      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) {
          where.expenseDate[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.expenseDate[Op.lte] = new Date(endDate);
        }
      }

      // Paginación
      const paginationOptions = PaginationService.getPaginationOptions(page, limit);

      const expenses = await OwnerExpense.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'createdBy'
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'approvedBy',
            required: false
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        ...paginationOptions
      });

      // Calcular estadísticas
      const stats = await OwnerExpenseController._calculateExpenseStats(where);

      const pagination = PaginationService.formatPagination(
        expenses.count, 
        page, 
        limit
      );

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
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener un gasto específico
   */
  static async getExpenseById(req, res) {
    try {
      const { id } = req.params;

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'createdBy'
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'approvedBy',
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
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar un gasto
   */
  static async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      const updatedBy = req.user.id;

      // Buscar el gasto
      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      // Validar que se pueda editar
      if (expense.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'No se puede editar un gasto que ya ha sido pagado'
        });
      }

      // Manejar nuevo comprobante
      if (req.file) {
        try {
          // Eliminar comprobante anterior si existe
          if (expense.receiptPublicId) {
            await deleteFromCloudinary(expense.receiptPublicId);
          }

          // Subir nuevo comprobante
          const cloudinaryResult = await uploadToCloudinary(
            req.file.path,
            {
              folder: 'beauty-control/owner/expenses',
              resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
              public_id: `expense_${id}_${Date.now()}`
            }
          );

          updateData.receiptUrl = cloudinaryResult.secure_url;
          updateData.receiptPublicId = cloudinaryResult.public_id;
          updateData.receiptType = req.file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF';
          updateData.receiptOriginalName = req.file.originalname;

          // Eliminar archivo temporal
          await fs.unlink(req.file.path);
        } catch (cloudinaryError) {
          console.error('Error actualizando comprobante:', cloudinaryError);
        }
      }

      // Procesar fechas
      if (updateData.expenseDate) {
        updateData.expenseDate = new Date(updateData.expenseDate);
      }
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      // Agregar metadatos
      updateData.updatedBy = updatedBy;

      // Actualizar
      await expense.update(updateData);

      // Obtener el gasto actualizado con relaciones
      const updatedExpense = await OwnerExpense.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'createdBy'
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            foreignKey: 'approvedBy',
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Gasto actualizado exitosamente',
        data: updatedExpense
      });

    } catch (error) {
      console.error('Error actualizando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar (soft delete) un gasto
   */
  static async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      const updatedBy = req.user.id;

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      // Validar que se pueda eliminar
      if (expense.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar un gasto que ya ha sido pagado'
        });
      }

      // Soft delete
      await expense.update({
        isActive: false,
        updatedBy
      });

      res.json({
        success: true,
        message: 'Gasto eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Aprobar un gasto
   */
  static async approveExpense(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const approvedBy = req.user.id;

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
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
        approvedBy,
        approvedAt: new Date(),
        notes: notes || expense.notes,
        updatedBy: approvedBy
      });

      res.json({
        success: true,
        message: 'Gasto aprobado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error aprobando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Rechazar un gasto
   */
  static async rejectExpense(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const updatedBy = req.user.id;

      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'La razón del rechazo es obligatoria'
        });
      }

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
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
          message: 'Solo se pueden rechazar gastos con estado PENDING'
        });
      }

      await expense.update({
        status: 'REJECTED',
        rejectionReason,
        updatedBy
      });

      res.json({
        success: true,
        message: 'Gasto rechazado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error rechazando gasto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Marcar gasto como pagado
   */
  static async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const { paymentNotes } = req.body;
      const updatedBy = req.user.id;

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      if (expense.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden marcar como pagados los gastos aprobados'
        });
      }

      await expense.update({
        status: 'PAID',
        notes: paymentNotes ? `${expense.notes || ''}\n\nPago: ${paymentNotes}` : expense.notes,
        updatedBy
      });

      res.json({
        success: true,
        message: 'Gasto marcado como pagado exitosamente',
        data: expense
      });

    } catch (error) {
      console.error('Error marcando gasto como pagado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener categorías disponibles
   */
  static async getCategories(req, res) {
    try {
      const categories = OwnerExpense.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de gastos
   */
  static async getExpenseStats(req, res) {
    try {
      const { 
        startDate, 
        endDate,
        category,
        period = 'thisMonth'
      } = req.query;

      let dateFilter = {};
      
      // Configurar filtro de fechas basado en período
      if (period === 'thisMonth') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateFilter = {
          expenseDate: {
            [Op.gte]: firstDay,
            [Op.lte]: lastDay
          }
        };
      } else if (period === 'lastMonth') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        dateFilter = {
          expenseDate: {
            [Op.gte]: firstDay,
            [Op.lte]: lastDay
          }
        };
      } else if (period === 'thisYear') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        dateFilter = {
          expenseDate: {
            [Op.gte]: firstDay,
            [Op.lte]: lastDay
          }
        };
      } else if (startDate && endDate) {
        dateFilter = {
          expenseDate: {
            [Op.gte]: new Date(startDate),
            [Op.lte]: new Date(endDate)
          }
        };
      }

      const baseWhere = { 
        isActive: true,
        ...dateFilter
      };

      if (category) {
        baseWhere.category = category;
      }

      const stats = await OwnerExpenseController._calculateExpenseStats(baseWhere);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar comprobante de un gasto
   */
  static async removeReceipt(req, res) {
    try {
      const { id } = req.params;
      const updatedBy = req.user.id;

      const expense = await OwnerExpense.findOne({
        where: { id, isActive: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Gasto no encontrado'
        });
      }

      if (!expense.receiptPublicId) {
        return res.status(400).json({
          success: false,
          message: 'Este gasto no tiene comprobante'
        });
      }

      // Eliminar de Cloudinary
      try {
        await deleteFromCloudinary(expense.receiptPublicId);
      } catch (cloudinaryError) {
        console.error('Error eliminando de Cloudinary:', cloudinaryError);
      }

      // Actualizar el gasto
      await expense.update({
        receiptUrl: null,
        receiptPublicId: null,
        receiptType: 'NONE',
        receiptOriginalName: null,
        updatedBy
      });

      res.json({
        success: true,
        message: 'Comprobante eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Calcular estadísticas de gastos
   */
  static async _calculateExpenseStats(whereCondition = {}) {
    try {
      // Totales por estado
      const statusStats = await OwnerExpense.findAll({
        where: whereCondition,
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('amount')), 'total']
        ],
        group: ['status']
      });

      // Totales por categoría
      const categoryStats = await OwnerExpense.findAll({
        where: whereCondition,
        attributes: [
          'category',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('amount')), 'total']
        ],
        group: ['category']
      });

      // Gastos por mes (últimos 6 meses)
      const monthlyStats = await OwnerExpense.findAll({
        where: {
          ...whereCondition,
          expenseDate: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('expenseDate')), 'month'],
          [fn('SUM', col('amount')), 'total'],
          [fn('COUNT', col('id')), 'count']
        ],
        group: [fn('DATE_TRUNC', 'month', col('expenseDate'))],
        order: [[fn('DATE_TRUNC', 'month', col('expenseDate')), 'ASC']]
      });

      // Totales generales
      const generalStats = await OwnerExpense.findOne({
        where: whereCondition,
        attributes: [
          [fn('COUNT', col('id')), 'totalExpenses'],
          [fn('SUM', col('amount')), 'totalAmount'],
          [fn('AVG', col('amount')), 'averageAmount']
        ]
      });

      return {
        byStatus: statusStats,
        byCategory: categoryStats,
        monthly: monthlyStats,
        general: generalStats
      };

    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      throw error;
    }
  }
}

module.exports = OwnerExpenseController;