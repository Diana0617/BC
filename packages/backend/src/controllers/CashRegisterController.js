const { 
  CashRegisterShift,
  Appointment,
  User,
  Business,
  Branch,
  SpecialistProfile,
  Product,
  Client,
  Receipt
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const CashRegisterPDFService = require('../services/CashRegisterPDFService');
const ReceiptPDFService = require('../services/ReceiptPDFService');

/**
 * Controlador para gestión de caja (turnos)
 * Usado por recepcionistas y especialistas para registrar sus turnos de trabajo
 */
class CashRegisterController {

  /**
   * Verificar si el usuario debe usar gestión de caja
   * GET /api/cash-register/should-use?businessId={bizId}
   * 
   * LÓGICA:
   * - Si hay RECEPTIONIST o RECEPTIONIST_SPECIALIST -> Solo ellos usan caja
   * - Si solo hay SPECIALIST -> Ellos usan caja
   * - OWNER y BUSINESS nunca usan caja
   */
  static async shouldUseCashRegister(req, res) {
    try {
      const { businessId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // OWNER no tiene acceso a datos de negocios
      if (userRole === 'OWNER') {
        return res.status(403).json({
          success: false,
          error: 'Los propietarios de la plataforma no tienen acceso a datos de negocios'
        });
      }

      // BUSINESS puede gestionar caja (ver y cerrar turnos de todos)
      if (userRole === 'BUSINESS') {
        return res.json({
          success: true,
          data: {
            shouldUse: true,
            reason: 'Gestionas la caja de todos los especialistas',
            canManageAllShifts: true
          }
        });
      }

      // Contar usuarios por rol en el negocio
      const usersInBusiness = await User.findAll({
        where: {
          businessId,
          status: 'ACTIVE'
        },
        attributes: ['id', 'role']
      });

      const hasReceptionist = usersInBusiness.some(u => 
        u.role === 'RECEPTIONIST' || u.role === 'RECEPTIONIST_SPECIALIST'
      );

      const hasOnlySpecialists = usersInBusiness.every(u => 
        u.role === 'SPECIALIST' || u.role === 'BUSINESS' || u.role === 'BUSINESS_SPECIALIST'
      );

      // Determinar si el usuario actual debe usar caja
      let shouldUse = false;
      let reason = '';

      if (hasReceptionist) {
        // Si hay recepcionistas, solo ellos usan caja
        shouldUse = userRole === 'RECEPTIONIST' || userRole === 'RECEPTIONIST_SPECIALIST';
        reason = shouldUse 
          ? 'Gestionas la caja como recepcionista'
          : 'Solo los recepcionistas gestionan la caja';
      } else if (hasOnlySpecialists && (userRole === 'SPECIALIST' || userRole === 'BUSINESS_SPECIALIST')) {
        // Si solo hay especialistas, ellos usan caja
        shouldUse = true;
        reason = 'Gestionas la caja como especialista';
      }

      return res.json({
        success: true,
        data: {
          shouldUse,
          reason,
          userRole,
          hasReceptionist,
          hasOnlySpecialists
        }
      });

    } catch (error) {
      console.error('Error verificando uso de caja:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar uso de caja'
      });
    }
  }

  /**
   * Obtener turno activo del usuario
   * GET /api/cash-register/active-shift?businessId={bizId}&branchId={branchId}
   * BUSINESS puede ver el turno más reciente de cualquier usuario
   * Si branchId está presente, filtra por esa sucursal
   */
  static async getActiveShift(req, res) {
    try {
      const { businessId, branchId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // BUSINESS puede ver cualquier turno activo del negocio
      const whereClause = {
        businessId,
        status: 'OPEN'
      };
      
      // Filtrar por sucursal si se especifica
      if (branchId) {
        whereClause.branchId = branchId;
      }
      
      // Si no es BUSINESS, solo ver su propio turno
      if (userRole !== 'BUSINESS') {
        whereClause.userId = userId;
      }

      const activeShift = await CashRegisterShift.findOne({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [['openedAt', 'DESC']]
      });

      if (!activeShift) {
        return res.json({
          success: true,
          data: {
            hasActiveShift: false,
            shift: null
          }
        });
      }

      // Calcular resumen actualizado del turno
      const summary = await CashRegisterController._calculateShiftSummary(
        activeShift.id,
        businessId,
        userId,
        activeShift.openedAt,
        activeShift.branchId,
        req.user.role
      );

      return res.json({
        success: true,
        data: {
          hasActiveShift: true,
          shift: {
            ...activeShift.toJSON(),
            currentSummary: summary
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo turno activo:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener turno activo'
      });
    }
  }

  /**
   * Abrir nuevo turno
   * POST /api/cash-register/open-shift
   * Body: { businessId, branchId?, openingBalance, openingNotes? }
   */
  static async openShift(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const userId = req.user.id;
      const { businessId, branchId, openingBalance, openingNotes } = req.body;

      if (!businessId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      if (openingBalance === undefined || openingBalance < 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'El balance inicial debe ser mayor o igual a 0'
        });
      }

      // Verificar que no tenga un turno abierto en la misma sucursal
      const existingShiftWhere = {
        businessId,
        userId,
        status: 'OPEN'
      };
      
      // Si hay branchId, validar que no tenga turno abierto en ESA sucursal
      if (branchId) {
        existingShiftWhere.branchId = branchId;
      }

      const existingShift = await CashRegisterShift.findOne({
        where: existingShiftWhere,
        transaction
      });

      console.log('🔍 openShift - Verificando turno existente:', {
        businessId,
        branchId: branchId || 'SIN_SUCURSAL',
        userId,
        userEmail: req.user.email,
        userRole: req.user.role,
        existingShift: existingShift ? {
          id: existingShift.id,
          shiftNumber: existingShift.shiftNumber,
          branchId: existingShift.branchId,
          openedAt: existingShift.openedAt
        } : 'NINGUNO'
      });

      if (existingShift) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: branchId 
            ? 'Ya tienes un turno abierto en esta sucursal. Debes cerrarlo antes de abrir uno nuevo.' 
            : 'Ya tienes un turno abierto. Debes cerrarlo antes de abrir uno nuevo.',
          debug: {
            existingShiftId: existingShift.id,
            branchId: existingShift.branchId,
            openedAt: existingShift.openedAt
          }
        });
      }

      // Generar número de turno (secuencial del día por sucursal)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayShiftsWhere = {
        businessId,
        openedAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      };
      
      // Si hay sucursal, contar solo los turnos de esa sucursal
      if (branchId) {
        todayShiftsWhere.branchId = branchId;
      }

      const todayShifts = await CashRegisterShift.count({
        where: todayShiftsWhere,
        transaction
      });

      const shiftNumber = todayShifts + 1;

      // Crear nuevo turno
      const newShift = await CashRegisterShift.create({
        businessId,
        userId,
        branchId: branchId || null,
        shiftNumber,
        openingBalance: parseFloat(openingBalance),
        openingNotes: openingNotes || null,
        status: 'OPEN',
        openedAt: new Date(),
        summary: {
          appointments: {
            total: 0,
            completed: 0,
            totalAmount: 0
          },
          products: {
            total: 0,
            totalAmount: 0
          },
          paymentMethods: {}
        }
      }, { transaction });

      await transaction.commit();

      const shiftWithRelations = await CashRegisterShift.findByPk(newShift.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
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
        message: 'Turno abierto exitosamente',
        data: {
          shift: shiftWithRelations
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error abriendo turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al abrir turno'
      });
    }
  }

  /**
   * Cerrar turno actual
   * POST /api/cash-register/close-shift
   * Body: { businessId, actualClosingBalance, closingNotes? }
   * BUSINESS puede cerrar cualquier turno, otros solo el suyo
   */
  static async closeShift(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { businessId, actualClosingBalance, closingNotes } = req.body;

      if (!businessId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      if (actualClosingBalance === undefined || actualClosingBalance < 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'El balance final es requerido y debe ser mayor o igual a 0'
        });
      }

      // BUSINESS puede cerrar cualquier turno, otros solo el suyo
      const whereClause = {
        businessId,
        status: 'OPEN'
      };

      if (userRole !== 'BUSINESS') {
        whereClause.userId = userId;
      }

      // Buscar turno activo
      const activeShift = await CashRegisterShift.findOne({
        where: whereClause,
        transaction
      });

      if (!activeShift) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: userRole === 'BUSINESS' ? 'No hay turnos abiertos para cerrar' : 'No tienes un turno abierto'
        });
      }

      // Obtener el rol del usuario del turno
      const shiftUser = await User.findByPk(activeShift.userId, { transaction });
      
      // Calcular resumen final (usar el userId del turno, no del usuario que cierra)
      const summary = await CashRegisterController._calculateShiftSummary(
        activeShift.id,
        businessId,
        activeShift.userId, // Usar el userId del turno
        activeShift.openedAt,
        activeShift.branchId, // Filtrar por sucursal del turno
        shiftUser?.role, // Usar el rol del usuario del turno
        transaction
      );

      // Calcular balance esperado
      const expectedClosingBalance = 
        parseFloat(activeShift.openingBalance) + 
        parseFloat(summary.paymentMethods.CASH || 0);

      const actualBalance = parseFloat(actualClosingBalance);
      const difference = actualBalance - expectedClosingBalance;

      // Actualizar turno
      await activeShift.update({
        status: 'CLOSED',
        closedAt: new Date(),
        summary,
        expectedClosingBalance,
        actualClosingBalance: actualBalance,
        difference,
        closingNotes: closingNotes || null
      }, { transaction });

      await transaction.commit();

      const closedShift = await CashRegisterShift.findByPk(activeShift.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      return res.json({
        success: true,
        message: 'Turno cerrado exitosamente',
        data: {
          shift: closedShift,
          summary: {
            ...summary,
            expectedClosingBalance,
            actualClosingBalance: actualBalance,
            difference,
            hasDiscrepancy: Math.abs(difference) > 0.01
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error cerrando turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al cerrar turno'
      });
    }
  }

  /**
   * Generar PDF del turno antes del cierre
   * GET /api/cash-register/generate-closing-pdf?businessId={bizId}
   */
  static async generateClosingPDF(req, res) {
    try {
      const { businessId } = req.query;
      const userId = req.user.id;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      // Buscar turno activo
      const activeShift = await CashRegisterShift.findOne({
        where: {
          businessId,
          userId,
          status: 'OPEN'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!activeShift) {
        return res.status(404).json({
          success: false,
          error: 'No tienes un turno abierto'
        });
      }

      // Calcular resumen del turno
      const summary = await CashRegisterController._calculateShiftSummary(
        activeShift.id,
        businessId,
        userId,
        activeShift.openedAt,
        activeShift.branchId, // Filtrar por sucursal del turno
        req.user.role
      );

      // Calcular balance esperado (necesario para el PDF)
      const expectedClosingBalance = 
        parseFloat(activeShift.openingBalance) + 
        parseFloat(summary.totalCash || 0);

      // Obtener información del negocio
      const business = await Business.findByPk(businessId, {
        attributes: ['id', 'name', 'address', 'phone', 'email']
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        });
      }

      // Crear objeto shift temporal con balance esperado para el PDF
      const shiftForPDF = {
        ...activeShift.toJSON(),
        expectedClosingBalance,
        actualClosingBalance: null, // Aún no cerrado
        difference: null,
        closedAt: null
      };

      // Generar PDF
      const pdfBuffer = await CashRegisterPDFService.generateShiftSummaryPDF(
        shiftForPDF,
        summary,
        activeShift.user,
        business
      );

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="cierre-turno-${activeShift.shiftNumber}-${Date.now()}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (error) {
      console.error('Error generando PDF de cierre:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar PDF'
      });
    }
  }

  /**
   * Obtener resumen del turno actual
   * GET /api/cash-register/shift-summary?businessId={bizId}
   */
  static async getShiftSummary(req, res) {
    try {
      const { businessId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      console.log('🔍 getShiftSummary - Buscando turno con:', {
        businessId,
        userId,
        userEmail: req.user.email,
        userRole: req.user.role
      });

      // BUSINESS puede ver cualquier turno activo, otros solo el suyo
      const whereClause = {
        businessId,
        status: 'OPEN'
      };

      if (userRole !== 'BUSINESS') {
        whereClause.userId = userId;
      }

      const activeShift = await CashRegisterShift.findOne({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'role']
          }
        ]
      });

      console.log('🔍 getShiftSummary - Turno encontrado:', activeShift ? {
        id: activeShift.id,
        shiftNumber: activeShift.shiftNumber,
        status: activeShift.status,
        userId: activeShift.userId,
        businessId: activeShift.businessId
      } : 'NINGUNO');

      if (!activeShift) {
        // Buscar CUALQUIER turno abierto para el businessId
        const anyOpenShift = await CashRegisterShift.findAll({
          where: {
            businessId,
            status: 'OPEN'
          },
          attributes: ['id', 'userId', 'shiftNumber', 'openedAt'],
          limit: 5
        });

        console.log('⚠️ No se encontró turno para userId:', userId);
        console.log('⚠️ Turnos abiertos en este negocio:', anyOpenShift.map(s => ({
          id: s.id,
          userId: s.userId,
          shiftNumber: s.shiftNumber
        })));

        return res.status(404).json({
          success: false,
          error: userRole === 'BUSINESS' ? 'No hay turnos abiertos en el negocio' : 'No tienes un turno abierto',
          debug: {
            searchedUserId: userId,
            openShiftsFound: anyOpenShift.length
          }
        });
      }

      const summary = await CashRegisterController._calculateShiftSummary(
        activeShift.id,
        businessId,
        activeShift.userId, // Usar el userId del turno, no del que consulta
        activeShift.openedAt,
        activeShift.branchId, // Filtrar por sucursal del turno
        activeShift.user?.role || req.user.role // Usar el rol del usuario del turno
      );

      return res.json({
        success: true,
        data: {
          shiftId: activeShift.id,
          openedAt: activeShift.openedAt,
          openingBalance: activeShift.openingBalance,
          summary
        }
      });

    } catch (error) {
      console.error('Error obteniendo resumen de turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener resumen'
      });
    }
  }

  /**
   * Obtener historial de turnos
   * GET /api/cash-register/shifts-history?businessId={bizId}&branchId={branchId}&page=1&limit=20
   */
  static async getShiftsHistory(req, res) {
    try {
      const { businessId, branchId, page = 1, limit = 20, status, startDate, endDate } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      const offset = (page - 1) * limit;
      const where = { businessId };

      // Filtrar por sucursal si se especifica
      if (branchId) {
        where.branchId = branchId;
      }

      // Filtro de usuario según rol
      if (userRole === 'SPECIALIST' || userRole === 'BUSINESS_SPECIALIST' || userRole === 'RECEPTIONIST' || userRole === 'RECEPTIONIST_SPECIALIST') {
        where.userId = userId; // Solo ver sus propios turnos
      } else if (userRole === 'BUSINESS') {
        // BUSINESS puede ver todos los turnos del negocio (sin filtro adicional)
      } else if (userRole === 'OWNER') {
        return res.status(403).json({
          success: false,
          error: 'Los propietarios de la plataforma no tienen acceso a datos de negocios'
        });
      }
      // BUSINESS puede ver todos los turnos

      if (status) {
        where.status = status;
      }

      if (startDate && endDate) {
        where.openedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: shifts } = await CashRegisterShift.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'role']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [['openedAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      return res.json({
        success: true,
        data: {
          shifts,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de turnos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener historial'
      });
    }
  }

  /**
   * Obtener último turno cerrado (para obtener el cierre como balance inicial)
   * GET /api/cash-register/last-closed-shift?businessId={bizId}
   */
  static async getLastClosedShift(req, res) {
    try {
      const { businessId } = req.query;
      const userId = req.user.id;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      const lastShift = await CashRegisterShift.findOne({
        where: {
          businessId,
          userId,
          status: 'CLOSED'
        },
        order: [['closedAt', 'DESC']],
        attributes: ['id', 'closedAt', 'actualClosingBalance', 'difference']
      });

      return res.json({
        success: true,
        data: {
          lastShift: lastShift || null,
          suggestedOpeningBalance: lastShift?.actualClosingBalance || 0
        }
      });

    } catch (error) {
      console.error('Error obteniendo último turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener último turno'
      });
    }
  }

  /**
   * FUNCIÓN AUXILIAR: Calcular resumen del turno
   * Obtiene todas las transacciones desde que se abrió el turno
   * Si branchId está presente, filtra por esa sucursal
   * 
   * IMPORTANTE: Separa control de efectivo de totales por método de pago
   */
  static async _calculateShiftSummary(shiftId, businessId, userId, openedAt, branchId = null, userRole = null, transaction = null) {
    const summary = {
      appointments: {
        total: 0,
        completed: 0,
        cancelled: 0,
        totalAmount: 0,
        paidAmount: 0
      },
      products: {
        total: 0,
        totalAmount: 0
      },
      paymentMethods: {}, // Totales por método (CASH, CARD, TRANSFER, etc.)
      totalCash: 0,        // Solo efectivo (para control de caja)
      totalNonCash: 0,     // Todo lo demás (referencia)
      totalIncome: 0       // Total de todos los ingresos
    };

    // Construir filtros de citas
    const appointmentWhere = {
      businessId,
      startTime: {
        [Op.gte]: openedAt
      }
    };
    
    // Solo filtrar por specialistId si es SPECIALIST puro (no RECEPTIONIST_SPECIALIST)
    // RECEPTIONIST y RECEPTIONIST_SPECIALIST ven TODAS las citas del negocio
    if (userRole && userRole === 'SPECIALIST') {
      appointmentWhere.specialistId = userId;
    }
    
    // Si hay sucursal, filtrar por ella
    if (branchId) {
      appointmentWhere.branchId = branchId;
    }

    // Obtener citas del turno
    const appointments = await Appointment.findAll({
      where: appointmentWhere,
      attributes: ['id', 'status', 'totalAmount', 'paidAmount', 'paymentStatus'],
      transaction
    });

    summary.appointments.total = appointments.length;
    summary.appointments.completed = appointments.filter(a => a.status === 'COMPLETED').length;
    summary.appointments.cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    summary.appointments.totalAmount = appointments.reduce((sum, a) => sum + parseFloat(a.totalAmount || 0), 0);
    summary.appointments.paidAmount = appointments.reduce((sum, a) => sum + parseFloat(a.paidAmount || 0), 0);

    // Construir filtros de movimientos financieros
    const movementWhere = {
      businessId,
      type: 'INCOME',
      status: 'COMPLETED',
      createdAt: {
        [Op.gte]: openedAt
      }
    };
    
    // Si hay sucursal, filtrar por ella
    if (branchId) {
      movementWhere.branchId = branchId;
    }

    // Obtener movimientos financieros del turno (ingresos) CON DETALLES
    const FinancialMovement = require('../models/FinancialMovement');
    const movements = await FinancialMovement.findAll({
      where: movementWhere,
      attributes: ['id', 'amount', 'paymentMethod', 'category', 'description', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      transaction
    });

    // Agrupar por método de pago
    movements.forEach(movement => {
      const method = movement.paymentMethod || 'OTHER';
      const amount = parseFloat(movement.amount);
      
      if (!summary.paymentMethods[method]) {
        summary.paymentMethods[method] = {
          count: 0,
          total: 0
        };
      }
      
      summary.paymentMethods[method].count++;
      summary.paymentMethods[method].total += amount;
      summary.totalIncome += amount;

      // Control específico de efectivo (para balance de caja)
      if (method === 'CASH') {
        summary.totalCash += amount;
      } else {
        summary.totalNonCash += amount;
      }
    });

    // TODO: Agregar ventas de productos si tienes ese módulo
    // const productSales = await ProductSale.findAll({ ... });

    // Añadir movimientos detallados al summary
    summary.movements = movements.map(m => ({
      id: m.id,
      description: m.description,
      amount: parseFloat(m.amount),
      paymentMethod: m.paymentMethod,
      category: m.category,
      createdAt: m.createdAt,
      specialist: m.user ? `${m.user.firstName} ${m.user.lastName}` : null,
      client: m.client ? `${m.client.firstName} ${m.client.lastName}` : null
    }));

    return summary;
  }

  /**
   * Generar recibo PDF para una cita
   * GET /api/cash-register/generate-receipt-pdf/:appointmentId?businessId={bizId}
   */
  static async generateReceiptPDF(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;
      const userId = req.user.id;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          error: 'businessId es requerido'
        });
      }

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          error: 'appointmentId es requerido'
        });
      }

      // Buscar cita con datos relacionados
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          businessId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: User,
            as: 'specialist',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
          },
          {
            model: Service,
            as: 'services',
            through: { attributes: ['price', 'duration', 'order'] },
            attributes: ['id', 'name', 'duration', 'price']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'duration', 'price']
          },
          {
            model: AppointmentPayment,
            as: 'payments',
            where: { status: 'COMPLETED' },
            required: false
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Verificar si ya existe recibo para esta cita
      let receipt = await Receipt.findOne({
        where: {
          appointmentId,
          businessId,
          status: 'ACTIVE'
        }
      });

      // Si no existe, crear el recibo
      if (!receipt) {
        const payment = appointment.payments && appointment.payments.length > 0 
          ? appointment.payments[0] 
          : null;

        if (!payment) {
          return res.status(400).json({
            success: false,
            error: 'No hay pagos completados para esta cita'
          });
        }

        receipt = await Receipt.createFromAppointment(
          appointment.toJSON(),
          {
            method: payment.paymentMethodType,
            methodName: payment.paymentMethodName,
            methodId: payment.paymentMethodId,
            amount: payment.amount,
            transactionId: payment.transactionId,
            reference: payment.reference
          },
          { createdBy: userId }
        );
      }

      // Obtener información del negocio
      const business = await Business.findByPk(businessId, {
        attributes: ['id', 'name', 'address', 'phone', 'email']
      });

      // Generar PDF
      const pdfBuffer = await ReceiptPDFService.generateReceiptPDF(receipt, business);

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
        error: 'Error al generar recibo PDF'
      });
    }
  }

  /**
   * Obtener datos del recibo de una cita para envío por WhatsApp
   * GET /api/cash-register/receipt-data/:appointmentId?businessId={bizId}
   */
  static async getReceiptData(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;

      if (!businessId || !appointmentId) {
        return res.status(400).json({
          success: false,
          error: 'businessId y appointmentId son requeridos'
        });
      }

      // Buscar recibo existente
      const receipt = await Receipt.findOne({
        where: {
          appointmentId,
          businessId,
          status: 'ACTIVE'
        }
      });

      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: 'Recibo no encontrado'
        });
      }

      return res.json({
        success: true,
        data: {
          receipt: receipt.getSummary(),
          whatsappReady: {
            clientPhone: receipt.clientPhone,
            clientName: receipt.clientName,
            receiptNumber: receipt.receiptNumber,
            totalAmount: receipt.totalAmount,
            serviceDate: receipt.serviceDate,
            serviceName: receipt.serviceName
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo datos de recibo:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener datos del recibo'
      });
    }
  }

  /**
   * Marcar recibo como enviado por WhatsApp o Email
   * POST /api/cash-register/mark-receipt-sent/:receiptId
   */
  static async markReceiptSent(req, res) {
    try {
      const { receiptId } = req.params;
      const { method } = req.body; // 'email' o 'whatsapp'

      const receipt = await Receipt.findByPk(receiptId);

      if (!receipt) {
        return res.status(404).json({
          success: false,
          error: 'Recibo no encontrado'
        });
      }

      if (method === 'whatsapp') {
        await receipt.markSentViaWhatsApp();
      } else if (method === 'email') {
        await receipt.markSentViaEmail();
      }

      return res.json({
        success: true,
        data: {
          receiptId: receipt.id,
          sentViaWhatsApp: receipt.sentViaWhatsApp,
          sentViaEmail: receipt.sentViaEmail
        }
      });

    } catch (error) {
      console.error('Error marcando recibo como enviado:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al marcar recibo'
      });
    }
  }

  /**
   * Obtener movimientos del turno (recibos y gastos) con detalles de especialista y cliente
   * GET /api/cash-register/shift/:shiftId/movements?businessId={bizId}
   */
  static async getShiftMovements(req, res) {
    try {
      const { shiftId } = req.params;
      const { businessId } = req.query;

      if (!businessId || !shiftId) {
        return res.status(400).json({
          success: false,
          error: 'businessId y shiftId son requeridos'
        });
      }

      // Obtener el turno para conocer el período
      const shift = await CashRegisterShift.findOne({
        where: { id: shiftId, businessId }
      });

      if (!shift) {
        return res.status(404).json({
          success: false,
          error: 'Turno no encontrado'
        });
      }

      // Construir filtro de fechas
      const dateFilter = {
        [Op.gte]: shift.openedAt
      };
      
      if (shift.closedAt) {
        dateFilter[Op.lte] = shift.closedAt;
      }

      // Obtener recibos (ingresos) del turno con información del especialista
      const receipts = await Receipt.findAll({
        where: {
          businessId,
          status: 'ACTIVE',
          createdAt: dateFilter
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'specialistId'],
            include: [
              {
                model: User,
                as: 'specialist',
                attributes: ['id', 'firstName', 'lastName']
              },
              {
                model: Client,
                as: 'client',
                attributes: ['id', 'firstName', 'lastName', 'phone']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Obtener gastos del turno
      const BusinessExpense = require('../models/BusinessExpense');
      const BusinessExpenseCategory = require('../models/BusinessExpenseCategory');
      const expenses = await BusinessExpense.findAll({
        where: {
          businessId,
          isActive: true,
          createdAt: dateFilter
        },
        include: [
          {
            model: BusinessExpenseCategory,
            as: 'category',
            attributes: ['id', 'name', 'color', 'icon']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Obtener movimientos financieros manuales del turno
      // IMPORTANTE: Excluir movimientos de categoría APPOINTMENT para evitar duplicación con receipts
      const FinancialMovement = require('../models/FinancialMovement');
      const financialMovements = await FinancialMovement.findAll({
        where: {
          businessId,
          createdAt: dateFilter,
          category: { [Op.ne]: 'APPOINTMENT' } // Excluir movimientos de citas (ya incluidos en receipts)
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Formatear recibos como movimientos
      const receiptMovements = receipts.map(receipt => {
        // Intentar obtener el nombre personalizado del método de pago desde metadata
        const paymentMethodName = receipt.metadata?.paymentData?.methodName || null;
        const paymentMethodId = receipt.metadata?.paymentData?.methodId || null;
        
        return {
          id: receipt.id,
          type: 'INCOME',
          category: 'APPOINTMENT',
          description: `Pago de cita - ${receipt.serviceName}`,
          amount: receipt.totalAmount,
          paymentMethod: receipt.paymentMethod, // Enum (CASH, TRANSFER, etc.)
          paymentMethodName, // Nombre personalizado (ej: "transferencia" del negocio)
          paymentMethodId, // ID del método personalizado
          referenceId: receipt.appointmentId,
          clientName: receipt.clientName,
          clientPhone: receipt.appointment?.client?.phone || null,
          specialistName: receipt.appointment?.specialist 
            ? `${receipt.appointment.specialist.firstName} ${receipt.appointment.specialist.lastName}`
            : null,
          createdAt: receipt.createdAt,
          receiptNumber: receipt.receiptNumber,
          source: 'RECEIPT'
        };
      });

      // Formatear gastos como movimientos
      const expenseMovements = expenses.map(expense => ({
        id: expense.id,
        type: 'EXPENSE',
        category: expense.category?.name || 'Gasto',
        categoryColor: expense.category?.color,
        categoryIcon: expense.category?.icon,
        description: expense.description,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        vendor: expense.vendor,
        referenceId: expense.id,
        createdAt: expense.createdAt,
        expenseDate: expense.expenseDate,
        source: 'EXPENSE'
      }));

      // Formatear movimientos financieros manuales
      const manualMovements = financialMovements.map(fm => ({
        id: fm.id,
        type: fm.type,
        category: fm.category,
        description: fm.description,
        amount: parseFloat(fm.amount),
        paymentMethod: fm.paymentMethod,
        reference: fm.reference,
        referenceId: fm.referenceId,
        specialistName: fm.user ? `${fm.user.firstName} ${fm.user.lastName}` : null,
        createdAt: fm.createdAt,
        source: 'MANUAL'
      }));

      // Combinar y ordenar por fecha
      const allMovements = [...receiptMovements, ...expenseMovements, ...manualMovements]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calcular totales
      const totalIncome = receiptMovements.reduce((sum, m) => sum + parseFloat(m.amount), 0) +
                          manualMovements.filter(m => m.type === 'INCOME').reduce((sum, m) => sum + parseFloat(m.amount), 0);
      const totalExpenses = expenseMovements.reduce((sum, m) => sum + parseFloat(m.amount), 0) +
                            manualMovements.filter(m => m.type === 'EXPENSE').reduce((sum, m) => sum + parseFloat(m.amount), 0);

      return res.json({
        success: true,
        data: {
          movements: allMovements,
          summary: {
            totalIncome,
            totalExpenses,
            incomeCount: receiptMovements.length + manualMovements.filter(m => m.type === 'INCOME').length,
            expenseCount: expenseMovements.length + manualMovements.filter(m => m.type === 'EXPENSE').length,
            netBalance: totalIncome - totalExpenses
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo movimientos del turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener movimientos del turno'
      });
    }
  }

  /**
   * Obtener detalle de un turno específico
   * GET /api/cash-register/shift/:shiftId?businessId={bizId}
   */
  static async getShiftDetail(req, res) {
    try {
      const { shiftId } = req.params;
      const { businessId } = req.query;

      if (!businessId || !shiftId) {
        return res.status(400).json({
          success: false,
          error: 'businessId y shiftId son requeridos'
        });
      }

      const shift = await CashRegisterShift.findOne({
        where: { id: shiftId, businessId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!shift) {
        return res.status(404).json({
          success: false,
          error: 'Turno no encontrado'
        });
      }

      // Construir filtro de fechas
      const dateFilter = {
        [Op.gte]: shift.openedAt
      };
      
      if (shift.closedAt) {
        dateFilter[Op.lte] = shift.closedAt;
      }

      // Obtener recibos del turno
      const receipts = await Receipt.findAll({
        where: {
          businessId,
          status: 'ACTIVE',
          createdAt: dateFilter
        },
        attributes: ['id', 'totalAmount', 'paymentMethod', 'metadata']
      });

      // Obtener gastos del turno
      const BusinessExpense = require('../models/BusinessExpense');
      const expenses = await BusinessExpense.findAll({
        where: {
          businessId,
          isActive: true,
          createdAt: dateFilter
        },
        attributes: ['id', 'amount', 'paymentMethod']
      });

      // Calcular totales
      const totalIncome = receipts.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Calcular desglose por método de pago (solo ingresos)
      // IMPORTANTE: Usar el nombre personalizado del método si existe
      const paymentMethodsBreakdown = {};
      receipts.forEach(receipt => {
        // Intentar obtener el nombre personalizado desde metadata
        const customName = receipt.metadata?.paymentData?.methodName;
        const methodKey = customName || receipt.paymentMethod; // Usar nombre personalizado o enum
        
        if (!paymentMethodsBreakdown[methodKey]) {
          paymentMethodsBreakdown[methodKey] = {
            count: 0,
            total: 0,
            type: receipt.paymentMethod, // Guardar el enum para referencia
            isCustom: !!customName // Indicar si es método personalizado
          };
        }
        paymentMethodsBreakdown[methodKey].count++;
        paymentMethodsBreakdown[methodKey].total += parseFloat(receipt.totalAmount);
      });

      // Calcular total de efectivo para el balance esperado
      const totalCash = paymentMethodsBreakdown['CASH']?.total || 
                        Object.entries(paymentMethodsBreakdown)
                          .filter(([key, data]) => data.type === 'CASH')
                          .reduce((sum, [, data]) => sum + data.total, 0);
      const expectedClosingBalance = parseFloat(shift.openingBalance || 0) + totalCash;

      return res.json({
        success: true,
        data: {
          ...shift.toJSON(),
          openingBalance: parseFloat(shift.openingBalance || 0),
          totalIncome,
          totalExpenses,
          totalCash, // Solo efectivo
          incomeCount: receipts.length,
          expenseCount: expenses.length,
          movementsCount: receipts.length + expenses.length,
          expectedClosingBalance, // Solo basado en efectivo
          paymentMethodsBreakdown // Desglose por método
        }
      });

    } catch (error) {
      console.error('Error obteniendo detalle del turno:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener detalle del turno'
      });
    }
  }

}

module.exports = CashRegisterController;
