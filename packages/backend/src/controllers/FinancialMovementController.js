const { FinancialMovement, User, Client, BusinessExpense, BusinessExpenseCategory } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador para Movimientos Financieros
 */
class FinancialMovementController {
  
  /**
   * Obtener movimientos financieros con filtros
   * GET /api/financial/movements?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&type=INCOME|EXPENSE
   */
  async getMovements(req, res) {
    try {
      const { businessId } = req.query;
      const { startDate, endDate, type, category, status, paymentMethod } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // Construir filtros
      const where = { businessId };

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          where.createdAt[Op.gte] = start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = end;
        }
      }

      // Filtros adicionales
      if (type) where.type = type;
      if (category) where.category = category;
      if (status) where.status = status;
      if (paymentMethod) where.paymentMethod = paymentMethod;

      // Obtener movimientos con relaciones
      const movements = await FinancialMovement.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
            required: false
          },
          {
            model: BusinessExpense,
            as: 'expense',
            attributes: ['id', 'description', 'vendor', 'expenseDate'],
            required: false
          },
          {
            model: BusinessExpenseCategory,
            as: 'expenseCategory',
            attributes: ['id', 'name', 'color', 'icon'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 500 // Límite para no sobrecargar
      });

      // Calcular totales
      const totals = movements.reduce((acc, movement) => {
        const amount = parseFloat(movement.amount);
        
        if (movement.type === 'INCOME') {
          acc.totalIncome += amount;
        } else if (movement.type === 'EXPENSE') {
          acc.totalExpense += amount;
        }
        
        return acc;
      }, { totalIncome: 0, totalExpense: 0 });

      totals.netBalance = totals.totalIncome - totals.totalExpense;

      return res.json({
        success: true,
        data: {
          movements,
          totals,
          count: movements.length
        }
      });

    } catch (error) {
      console.error('Error al obtener movimientos financieros:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener movimientos financieros'
      });
    }
  }

  /**
   * Obtener resumen de movimientos financieros
   * GET /api/financial/movements/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  async getMovementsSummary(req, res) {
    try {
      const { businessId } = req.query;
      const { startDate, endDate } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // Construir filtros
      const where = { businessId };

      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          where.createdAt[Op.gte] = start;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = end;
        }
      }

      // Obtener todos los movimientos del período
      const movements = await FinancialMovement.findAll({
        where,
        attributes: ['type', 'amount', 'paymentMethod', 'category', 'status']
      });

      // Calcular resumen
      const summary = {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        byPaymentMethod: {},
        byCategory: {},
        byStatus: {
          COMPLETED: 0,
          PENDING: 0,
          FAILED: 0,
          CANCELLED: 0,
          REFUNDED: 0
        }
      };

      movements.forEach(movement => {
        const amount = parseFloat(movement.amount);

        // Totales por tipo
        if (movement.type === 'INCOME') {
          summary.totalIncome += amount;
        } else if (movement.type === 'EXPENSE') {
          summary.totalExpense += amount;
        }

        // Por método de pago
        if (!summary.byPaymentMethod[movement.paymentMethod]) {
          summary.byPaymentMethod[movement.paymentMethod] = {
            income: 0,
            expense: 0,
            count: 0
          };
        }
        
        if (movement.type === 'INCOME') {
          summary.byPaymentMethod[movement.paymentMethod].income += amount;
        } else {
          summary.byPaymentMethod[movement.paymentMethod].expense += amount;
        }
        summary.byPaymentMethod[movement.paymentMethod].count++;

        // Por categoría
        if (movement.category) {
          if (!summary.byCategory[movement.category]) {
            summary.byCategory[movement.category] = {
              income: 0,
              expense: 0,
              count: 0
            };
          }
          
          if (movement.type === 'INCOME') {
            summary.byCategory[movement.category].income += amount;
          } else {
            summary.byCategory[movement.category].expense += amount;
          }
          summary.byCategory[movement.category].count++;
        }

        // Por estado
        if (movement.status) {
          summary.byStatus[movement.status] += amount;
        }
      });

      summary.netBalance = summary.totalIncome - summary.totalExpense;

      return res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('Error al obtener resumen de movimientos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de movimientos'
      });
    }
  }
}

module.exports = new FinancialMovementController();
