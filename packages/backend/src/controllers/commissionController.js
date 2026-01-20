const { 
  BusinessCommissionConfig, 
  ServiceCommission, 
  Service, 
  Business,
  BusinessRule,
  RuleTemplate,
  Appointment,
  CommissionDetail,
  CommissionPaymentRequest,
  User,
  Client,
  BusinessExpense,
  BusinessExpenseCategory,
  FinancialMovement
} = require('../models');
const { Op } = require('sequelize');
const { startOfMonth, endOfMonth, format } = require('date-fns');
const BusinessExpenseController = require('./BusinessExpenseController');

/**
 * @controller CommissionController
 * @description Gestión de comisiones a nivel de negocio y servicios
 */

/**
 * Obtener resumen de comisiones del especialista (para dashboard)
 * GET /api/commissions/summary?specialistId=xxx&businessId=xxx
 */
exports.getSpecialistCommissionSummary = async (req, res) => {
  try {
    const { specialistId, businessId } = req.query;

    if (!specialistId) {
      return res.status(400).json({
        success: false,
        message: 'specialistId es requerido'
      });
    }

    // Período: mes actual
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);

    // Obtener turnos completados en el mes
    const completedAppointments = await Appointment.findAll({
      where: {
        specialistId,
        ...(businessId && { businessId }),
        status: 'COMPLETED',
        completedAt: {
          [Op.between]: [periodStart, periodEnd]
        }
      },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    // Calcular comisiones generadas
    let pending = 0;
    let thisMonth = 0;
    const appointmentsWithCommission = [];
    
    completedAppointments.forEach(appointment => {
      const price = parseFloat(appointment.totalAmount || appointment.service?.price || 0);
      const commissionRate = 50; // Por defecto 50%, después se puede obtener de config
      const commission = (price * commissionRate) / 100;
      
      pending += commission;
      thisMonth += commission;

      // Agregar información del appointment con comisión calculada
      appointmentsWithCommission.push({
        id: appointment.id,
        date: appointment.date,
        completedAt: appointment.completedAt,
        serviceName: appointment.service?.name,
        clientName: appointment.client 
          ? `${appointment.client.firstName} ${appointment.client.lastName}` 
          : 'Cliente no registrado',
        totalAmount: price,
        commissionRate: commissionRate,
        commissionAmount: Math.round(commission * 100) / 100,
        status: 'PENDING' // Por defecto, se puede verificar con CommissionDetail
      });
    });

    // Obtener comisiones ya pagadas (si existen)
    const paidCommissions = await CommissionDetail.sum('commissionAmount', {
      where: {
        serviceDate: {
          [Op.between]: [periodStart, periodEnd]
        },
        paymentStatus: 'PAID'
      },
      include: [
        {
          model: Appointment,
          as: 'appointment',
          where: { specialistId },
          required: true,
          attributes: []
        }
      ]
    }) || 0;

    const paid = paidCommissions;
    pending = pending - paid;

    // Obtener solicitudes pendientes
    const requestedPayments = await CommissionPaymentRequest.findAll({
      where: {
        specialistId,
        status: {
          [Op.in]: ['SUBMITTED', 'APPROVED']
        }
      }
    });

    const requested = requestedPayments.reduce((sum, req) => sum + parseFloat(req.totalAmount), 0);

    // Último pago
    const lastPayment = await CommissionPaymentRequest.findOne({
      where: {
        specialistId,
        status: 'PAID'
      },
      order: [['paidAt', 'DESC']],
      attributes: ['paidAt', 'totalAmount']
    });

    res.json({
      success: true,
      data: {
        pending: Math.round(pending * 100) / 100,
        requested: Math.round(requested * 100) / 100,
        paid: Math.round(paid * 100) / 100,
        total: Math.round((pending + paid) * 100) / 100,
        thisMonth: Math.round(thisMonth * 100) / 100,
        lastPayment: lastPayment ? {
          date: lastPayment.paidAt,
          amount: lastPayment.totalAmount
        } : null,
        appointments: appointmentsWithCommission
      }
    });

  } catch (error) {
    console.error('Error obteniendo resumen de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de comisiones',
      error: error.message
    });
  }
};

/**
 * Obtener historial de comisiones paginado
 * GET /api/commissions/history?specialistId=xxx&businessId=xxx&page=1&limit=20
 */
exports.getCommissionHistory = async (req, res) => {
  try {
    const { specialistId, businessId, page = 1, limit = 20, status, startDate, endDate, search } = req.query;

    if (!specialistId) {
      return res.status(400).json({
        success: false,
        message: 'specialistId es requerido'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {
      specialistId,
      ...(businessId && { businessId })
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.paidAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Obtener solicitudes de pago con paginación
    const { rows: payments, count } = await CommissionPaymentRequest.findAndCountAll({
      where,
      include: [
        {
          model: CommissionDetail,
          as: 'details',
          include: [
            {
              model: Appointment,
              as: 'appointment',
              include: [
                {
                  model: Service,
                  as: 'service',
                  attributes: ['id', 'name']
                },
                {
                  model: Client,
                  as: 'client',
                  attributes: ['id', 'firstName', 'lastName']
                }
              ]
            }
          ]
        }
      ],
      order: [['paidAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        commissions: payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de comisiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de comisiones',
      error: error.message
    });
  }
};

/**
 * Obtener configuración de comisiones del negocio
 * GET /api/business/:businessId/commission-config
 */
exports.getBusinessCommissionConfig = async (req, res) => {
  try {
    const { businessId } = req.params;

    let config = await BusinessCommissionConfig.findOne({
      where: { businessId },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name']
      }]
    });

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await BusinessCommissionConfig.create({
        businessId,
        commissionsEnabled: true,
        calculationType: 'GENERAL',
        generalPercentage: 50
      });
    }

    return res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error al obtener configuración de comisiones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de comisiones',
      error: error.message
    });
  }
};

/**
 * Actualizar configuración de comisiones del negocio
 * PUT /api/business/:businessId/commission-config
 */
exports.updateBusinessCommissionConfig = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { commissionsEnabled, calculationType, generalPercentage, notes } = req.body;

    // Validaciones
    if (commissionsEnabled && !calculationType) {
      return res.status(400).json({
        success: false,
        message: 'Si las comisiones están habilitadas, debe especificar el tipo de cálculo'
      });
    }

    if (calculationType === 'GENERAL' && !generalPercentage) {
      return res.status(400).json({
        success: false,
        message: 'Si el tipo de cálculo es GENERAL, debe especificar el porcentaje general'
      });
    }

    if (generalPercentage && (generalPercentage < 0 || generalPercentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje general debe estar entre 0 y 100'
      });
    }

    // Buscar o crear configuración
    let [config, created] = await BusinessCommissionConfig.findOrCreate({
      where: { businessId },
      defaults: {
        businessId,
        commissionsEnabled: commissionsEnabled ?? true,
        calculationType: calculationType ?? 'GENERAL',
        generalPercentage: generalPercentage ?? 50,
        notes
      }
    });

    if (!created) {
      await config.update({
        commissionsEnabled,
        calculationType,
        generalPercentage,
        notes
      });
    }

    // Sincronizar con BusinessRules usando RuleTemplate
    // Buscar los templates de reglas por su key
    const ruleTemplates = await RuleTemplate.findAll({
      where: {
        key: ['COMISIONES_HABILITADAS', 'COMISIONES_TIPO_CALCULO', 'COMISIONES_PORCENTAJE_GENERAL']
      }
    });

    // Crear un mapa de key -> templateId
    const templateMap = {};
    ruleTemplates.forEach(template => {
      templateMap[template.key] = template.id;
    });

    // Actualizar o crear BusinessRules
    if (templateMap.COMISIONES_HABILITADAS) {
      await BusinessRule.upsert({
        businessId,
        ruleTemplateId: templateMap.COMISIONES_HABILITADAS,
        customValue: commissionsEnabled,
        isActive: true
      });
    }

    if (templateMap.COMISIONES_TIPO_CALCULO) {
      await BusinessRule.upsert({
        businessId,
        ruleTemplateId: templateMap.COMISIONES_TIPO_CALCULO,
        customValue: calculationType,
        isActive: true
      });
    }

    if (templateMap.COMISIONES_PORCENTAJE_GENERAL) {
      await BusinessRule.upsert({
        businessId,
        ruleTemplateId: templateMap.COMISIONES_PORCENTAJE_GENERAL,
        customValue: generalPercentage,
        isActive: true
      });
    }

    return res.json({
      success: true,
      message: created ? 'Configuración de comisiones creada exitosamente' : 'Configuración de comisiones actualizada exitosamente',
      data: config
    });

  } catch (error) {
    console.error('Error al actualizar configuración de comisiones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración de comisiones',
      error: error.message
    });
  }
};

/**
 * Obtener comisión de un servicio específico
 * GET /api/business/:businessId/services/:serviceId/commission
 */
exports.getServiceCommission = async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;

    // Verificar que el servicio pertenece al negocio
    const service = await Service.findOne({
      where: { id: serviceId, businessId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Obtener configuración de comisiones del negocio
    const businessConfig = await BusinessCommissionConfig.findOne({
      where: { businessId }
    });

    // Obtener comisión específica del servicio (si existe)
    const serviceCommission = await ServiceCommission.findOne({
      where: { serviceId },
      include: [{
        model: Service,
        as: 'service',
        attributes: ['id', 'name', 'price']
      }]
    });

    // Determinar la comisión aplicable
    let effectiveCommission = null;

    if (!businessConfig || !businessConfig.commissionsEnabled) {
      // Comisiones deshabilitadas
      effectiveCommission = {
        enabled: false,
        source: 'business_config',
        message: 'Las comisiones están deshabilitadas para este negocio'
      };
    } else if (serviceCommission) {
      // Tiene comisión específica
      effectiveCommission = {
        enabled: true,
        source: 'service',
        type: serviceCommission.type,
        specialistPercentage: serviceCommission.specialistPercentage,
        businessPercentage: serviceCommission.businessPercentage,
        fixedAmount: serviceCommission.fixedAmount,
        notes: serviceCommission.notes
      };
    } else if (businessConfig.calculationType === 'GENERAL' || businessConfig.calculationType === 'MIXTO') {
      // Usa comisión general del negocio
      effectiveCommission = {
        enabled: true,
        source: 'business_general',
        type: 'PERCENTAGE',
        specialistPercentage: businessConfig.generalPercentage,
        businessPercentage: 100 - businessConfig.generalPercentage,
        message: 'Usando configuración general del negocio'
      };
    } else {
      // POR_SERVICIO pero no tiene comisión específica
      effectiveCommission = {
        enabled: true,
        source: 'none',
        message: 'El negocio requiere configuración por servicio, pero este servicio no tiene comisión configurada'
      };
    }

    return res.json({
      success: true,
      data: {
        service: {
          id: service.id,
          name: service.name,
          price: service.price
        },
        businessConfig: {
          commissionsEnabled: businessConfig?.commissionsEnabled ?? false,
          calculationType: businessConfig?.calculationType ?? null,
          generalPercentage: businessConfig?.generalPercentage ?? null
        },
        serviceCommission,
        effectiveCommission
      }
    });

  } catch (error) {
    console.error('Error al obtener comisión del servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener comisión del servicio',
      error: error.message
    });
  }
};

/**
 * Crear o actualizar comisión específica de un servicio
 * PUT /api/business/:businessId/services/:serviceId/commission
 */
exports.upsertServiceCommission = async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;
    const { type, specialistPercentage, businessPercentage, fixedAmount, notes } = req.body;

    // Verificar que el servicio pertenece al negocio
    const service = await Service.findOne({
      where: { id: serviceId, businessId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Verificar configuración del negocio
    const businessConfig = await BusinessCommissionConfig.findOne({
      where: { businessId }
    });

    if (!businessConfig || !businessConfig.commissionsEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Las comisiones están deshabilitadas para este negocio'
      });
    }

    if (businessConfig.calculationType === 'GENERAL') {
      return res.status(400).json({
        success: false,
        message: 'El negocio usa un porcentaje general de comisión. No se pueden configurar comisiones por servicio.'
      });
    }

    // Validaciones
    if (!type || !['PERCENTAGE', 'FIXED'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de comisión inválido. Debe ser PERCENTAGE o FIXED'
      });
    }

    if (type === 'PERCENTAGE') {
      if (!specialistPercentage) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar el porcentaje del especialista'
        });
      }

      if (specialistPercentage < 0 || specialistPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje del especialista debe estar entre 0 y 100'
        });
      }

      // El businessPercentage se calcula automáticamente en el hook
    }

    if (type === 'FIXED' && !fixedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el monto fijo de la comisión'
      });
    }

    // Crear o actualizar
    const [commission, created] = await ServiceCommission.findOrCreate({
      where: { serviceId },
      defaults: {
        serviceId,
        type,
        specialistPercentage,
        businessPercentage,
        fixedAmount,
        notes
      }
    });

    if (!created) {
      await commission.update({
        type,
        specialistPercentage,
        businessPercentage,
        fixedAmount,
        notes
      });
    }

    return res.json({
      success: true,
      message: created ? 'Comisión del servicio creada exitosamente' : 'Comisión del servicio actualizada exitosamente',
      data: commission
    });

  } catch (error) {
    console.error('Error al actualizar comisión del servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar comisión del servicio',
      error: error.message
    });
  }
};

/**
 * Eliminar comisión específica de un servicio (volver a usar la general)
 * DELETE /api/business/:businessId/services/:serviceId/commission
 */
exports.deleteServiceCommission = async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;

    // Verificar que el servicio pertenece al negocio
    const service = await Service.findOne({
      where: { id: serviceId, businessId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    const deleted = await ServiceCommission.destroy({
      where: { serviceId }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'El servicio no tiene una comisión específica configurada'
      });
    }

    return res.json({
      success: true,
      message: 'Comisión del servicio eliminada. Ahora usará la configuración general del negocio.'
    });

  } catch (error) {
    console.error('Error al eliminar comisión del servicio:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar comisión del servicio',
      error: error.message
    });
  }
};

/**
 * Calcular comisión para un monto específico
 * POST /api/business/:businessId/services/:serviceId/commission/calculate
 */
exports.calculateCommission = async (req, res) => {
  try {
    const { businessId, serviceId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un monto válido'
      });
    }

    // Verificar servicio
    const service = await Service.findOne({
      where: { id: serviceId, businessId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Obtener configuración
    const businessConfig = await BusinessCommissionConfig.findOne({
      where: { businessId }
    });

    const serviceCommission = await ServiceCommission.findOne({
      where: { serviceId }
    });

    // Calcular
    let calculation = {
      amount,
      commissionsEnabled: false,
      specialistAmount: amount,
      businessAmount: 0,
      specialistPercentage: 0,
      businessPercentage: 0
    };

    if (businessConfig && businessConfig.commissionsEnabled) {
      calculation.commissionsEnabled = true;

      if (serviceCommission) {
        // Comisión específica del servicio
        if (serviceCommission.type === 'PERCENTAGE') {
          calculation.specialistPercentage = serviceCommission.specialistPercentage;
          calculation.businessPercentage = serviceCommission.businessPercentage;
          calculation.specialistAmount = (amount * serviceCommission.specialistPercentage / 100);
          calculation.businessAmount = (amount * serviceCommission.businessPercentage / 100);
        } else if (serviceCommission.type === 'FIXED') {
          calculation.specialistAmount = serviceCommission.fixedAmount;
          calculation.businessAmount = amount - serviceCommission.fixedAmount;
          calculation.specialistPercentage = (serviceCommission.fixedAmount / amount * 100);
          calculation.businessPercentage = 100 - calculation.specialistPercentage;
        }
      } else if (businessConfig.calculationType === 'GENERAL' || businessConfig.calculationType === 'MIXTO') {
        // Comisión general del negocio
        calculation.specialistPercentage = businessConfig.generalPercentage;
        calculation.businessPercentage = 100 - businessConfig.generalPercentage;
        calculation.specialistAmount = (amount * businessConfig.generalPercentage / 100);
        calculation.businessAmount = (amount * (100 - businessConfig.generalPercentage) / 100);
      }
    }

    // Redondear a 2 decimales
    calculation.specialistAmount = Math.round(calculation.specialistAmount * 100) / 100;
    calculation.businessAmount = Math.round(calculation.businessAmount * 100) / 100;
    calculation.specialistPercentage = Math.round(calculation.specialistPercentage * 100) / 100;
    calculation.businessPercentage = Math.round(calculation.businessPercentage * 100) / 100;

    return res.json({
      success: true,
      data: calculation
    });

  } catch (error) {
    console.error('Error al calcular comisión:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al calcular comisión',
      error: error.message
    });
  }
};

// ==================== NUEVOS MÉTODOS PARA GESTIÓN DE PAGOS ====================

/**
 * Obtener resumen de comisiones por especialista
 * GET /api/business/:businessId/commissions/specialists-summary
 */
exports.getSpecialistsSummary = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { month, year } = req.query;

    // Determinar período (por defecto mes actual)
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const periodStart = startOfMonth(new Date(targetYear, targetMonth));
    const periodEnd = endOfMonth(new Date(targetYear, targetMonth));

    // Obtener todos los especialistas del negocio
    const specialists = await User.findAll({
      where: {
        businessId,
        role: {
          [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST', 'BUSINESS_SPECIALIST']
        },
        status: 'ACTIVE'
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'role'],
      include: [
        {
          model: Service,
          as: 'specialistServices',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    // Para cada especialista, calcular sus estadísticas
    const specialistsWithStats = await Promise.all(
      specialists.map(async (specialist) => {
        // Comisiones generadas (servicios completados)
        const completedAppointments = await Appointment.findAll({
          where: {
            businessId,
            specialistId: specialist.id,
            status: 'COMPLETED',
            startTime: {
              [Op.between]: [periodStart, periodEnd]
            }
          },
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'price']
            }
          ]
        });

        let generated = 0;
        let servicesCount = 0;

        completedAppointments.forEach(appointment => {
          const price = parseFloat(appointment.finalPrice || appointment.service?.price || 0);
          // Obtener la tasa de comisión de la configuración del negocio o usar 50% por defecto
          const commissionRate = 50; // Puede venir de specialist_services o configuración del negocio
          const commissionAmount = (price * commissionRate) / 100;
          generated += commissionAmount;
          servicesCount++;
        });

        // Comisiones pagadas
        const paidCommissions = await CommissionDetail.sum('commissionAmount', {
          where: {
            serviceDate: {
              [Op.between]: [periodStart, periodEnd]
            },
            paymentStatus: 'PAID'
          },
          include: [
            {
              model: Appointment,
              as: 'appointment',
              where: { specialistId: specialist.id },
              required: true,
              attributes: []
            }
          ]
        });

        const paid = paidCommissions || 0;
        const pending = generated - paid;

        return {
          specialistId: specialist.id,
          name: `${specialist.firstName} ${specialist.lastName}`,
          email: specialist.email,
          avatar: specialist.profilePicture,
          role: specialist.role,
          services: specialist.services.map(s => s.name),
          stats: {
            generated: Math.round(generated * 100) / 100,
            paid: Math.round(paid * 100) / 100,
            pending: Math.round(pending * 100) / 100,
            servicesCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        period: {
          start: periodStart,
          end: periodEnd,
          month: targetMonth + 1,
          year: targetYear
        },
        specialists: specialistsWithStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo resumen de especialistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen de especialistas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener detalle de comisiones de un especialista
 * GET /api/business/:businessId/commissions/specialist/:specialistId/details
 */
exports.getSpecialistDetails = async (req, res) => {
  try {
    const { businessId, specialistId } = req.params;
    const { startDate, endDate } = req.query;

    // Validar que el especialista pertenezca al negocio
    const specialist = await User.findOne({
      where: {
        id: specialistId,
        businessId,
        role: {
          [Op.in]: ['SPECIALIST_LEVEL_1', 'SPECIALIST_LEVEL_2']
        }
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
    });

    if (!specialist) {
      return res.status(404).json({
        success: false,
        message: 'Especialista no encontrado'
      });
    }

    // Determinar período
    const periodStart = startDate ? new Date(startDate) : startOfMonth(new Date());
    const periodEnd = endDate ? new Date(endDate) : endOfMonth(new Date());

    // Obtener turnos completados con comisiones
    const appointments = await Appointment.findAll({
      where: {
        businessId,
        specialistId,
        status: 'COMPLETED',
        startTime: {
          [Op.between]: [periodStart, periodEnd]
        }
      },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price', 'commissionPercentage']
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: CommissionDetail,
          as: 'commissionDetails',
          required: false
        }
      ],
      order: [['startTime', 'DESC']]
    });

    // Calcular detalles de comisiones
    const commissionDetails = appointments.map(appointment => {
      const price = parseFloat(appointment.finalPrice || appointment.service?.price || 0);
      const commissionRate = 50; // Tasa por defecto, puede venir de configuración del negocio
      const commissionAmount = (price * commissionRate) / 100;
      const isPaid = appointment.commissionDetails && appointment.commissionDetails.length > 0 
        && appointment.commissionDetails[0].paymentStatus === 'PAID';

      return {
        appointmentId: appointment.id,
        date: appointment.startTime,
        client: appointment.client ? {
          id: appointment.client.id,
          name: appointment.client.name,
          phone: appointment.client.phone
        } : null,
        service: appointment.service ? {
          id: appointment.service.id,
          name: appointment.service.name,
          price
        } : null,
        commissionRate,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        status: isPaid ? 'PAID' : 'PENDING',
        commissionDetailId: appointment.commissionDetails?.[0]?.id || null
      };
    });

    // Calcular totales
    const totals = commissionDetails.reduce((acc, detail) => {
      acc.generated += detail.commissionAmount;
      if (detail.status === 'PAID') {
        acc.paid += detail.commissionAmount;
      } else {
        acc.pending += detail.commissionAmount;
      }
      return acc;
    }, { generated: 0, paid: 0, pending: 0 });

    // Obtener histórico de pagos
    const paymentHistory = await CommissionPaymentRequest.findAll({
      where: {
        businessId,
        specialistId,
        status: {
          [Op.in]: ['PAID', 'APPROVED']
        }
      },
      order: [['paidAt', 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'paidByUser',
          attributes: ['firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        specialist: {
          id: specialist.id,
          name: `${specialist.firstName} ${specialist.lastName}`,
          email: specialist.email,
          avatar: specialist.profilePicture
        },
        period: {
          start: periodStart,
          end: periodEnd
        },
        commissionDetails,
        totals: {
          generated: Math.round(totals.generated * 100) / 100,
          paid: Math.round(totals.paid * 100) / 100,
          pending: Math.round(totals.pending * 100) / 100
        },
        paymentHistory: paymentHistory.map(payment => ({
          id: payment.id,
          requestNumber: payment.requestNumber,
          amount: payment.totalAmount,
          periodFrom: payment.periodFrom,
          periodTo: payment.periodTo,
          paidAt: payment.paidAt,
          paidBy: payment.paidByUser ? 
            `${payment.paidByUser.firstName} ${payment.paidByUser.lastName}` : 
            null,
          paymentMethod: payment.paymentMethod,
          status: payment.status
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo detalles del especialista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del especialista',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Registrar pago de comisión
 * POST /api/business/:businessId/commissions/pay
 */
exports.payCommission = async (req, res) => {
  const transaction = await require('../config/database').sequelize.transaction();

  try {
    const { businessId } = req.params;
    const {
      specialistId,
      periodFrom,
      periodTo,
      amount,
      paymentMethod,
      paymentReference,
      bankAccount,
      paidDate,
      notes,
      appointmentIds // IDs de los turnos cuyas comisiones se están pagando
    } = req.body;

    // Validar especialista
    const specialist = await User.findOne({
      where: { id: specialistId, businessId }
    });

    if (!specialist) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Especialista no encontrado'
      });
    }

    // Generar número de solicitud
    const requestCount = await CommissionPaymentRequest.count({
      where: { businessId }
    });
    const requestNumber = `CPR-${new Date().getFullYear()}-${String(requestCount + 1).padStart(4, '0')}`;

    // 1. Crear CommissionPaymentRequest
    const paymentRequest = await CommissionPaymentRequest.create({
      requestNumber,
      specialistId,
      businessId,
      periodFrom: new Date(periodFrom),
      periodTo: new Date(periodTo),
      totalAmount: parseFloat(amount),
      status: 'PAID',
      paymentMethod,
      paymentReference,
      bankAccount,
      paidAt: paidDate ? new Date(paidDate) : new Date(),
      paidBy: req.user.id,
      specialistNotes: notes,
      submittedAt: new Date()
    }, { transaction });

    // 2. Crear CommissionDetails para cada turno
    const appointments = await Appointment.findAll({
      where: {
        id: { [Op.in]: appointmentIds },
        businessId,
        specialistId
      },
      include: [
        {
          model: Service,
          as: 'service'
        },
        {
          model: Client,
          as: 'client'
        }
      ]
    });

    const commissionDetailsCreated = [];
    for (const appointment of appointments) {
      const price = parseFloat(appointment.finalPrice || appointment.service?.price || 0);
      const commissionRate = 50; // Tasa por defecto, puede venir de configuración del negocio
      const commissionAmount = (price * commissionRate) / 100;

      const detail = await CommissionDetail.create({
        paymentRequestId: paymentRequest.id,
        appointmentId: appointment.id,
        serviceId: appointment.serviceId,
        clientId: appointment.clientId,
        serviceDate: appointment.startTime,
        serviceName: appointment.service?.name || 'Servicio',
        servicePrice: price,
        commissionRate,
        commissionAmount,
        clientName: appointment.client?.name || 'Cliente',
        paymentStatus: 'PAID'
      }, { transaction });

      commissionDetailsCreated.push(detail);
    }

    // 3. Obtener o crear categoría "Comisiones a Especialistas"
    const category = await BusinessExpenseController.getOrCreateCommissionCategory(
      businessId, 
      req.user.id
    );

    // 4. Crear BusinessExpense
    const expense = await BusinessExpense.create({
      businessId,
      categoryId: category.id,
      description: `Comisión ${specialist.firstName} ${specialist.lastName} - ${format(new Date(periodFrom), 'MMM yyyy')}`,
      amount: parseFloat(amount),
      expenseDate: paidDate ? new Date(paidDate) : new Date(),
      paidDate: paidDate ? new Date(paidDate) : new Date(),
      status: 'PAID',
      paymentMethod,
      transactionReference: paymentReference,
      notes: `Pago de comisión. Solicitud: ${requestNumber}. ${notes || ''}`,
      createdBy: req.user.id
    }, { transaction });

    // 5. Crear FinancialMovement
    const movement = await FinancialMovement.create({
      businessId,
      userId: req.user.id,
      type: 'EXPENSE',
      category: 'Comisiones a Especialistas',
      businessExpenseCategoryId: category.id,
      businessExpenseId: expense.id,
      amount: parseFloat(amount),
      description: `Comisión ${specialist.firstName} ${specialist.lastName} - ${format(new Date(periodFrom), 'MMM yyyy')}`,
      notes: notes || null,
      paymentMethod,
      transactionId: paymentReference,
      referenceId: paymentRequest.id,
      referenceType: 'CommissionPaymentRequest',
      status: 'COMPLETED',
      paidDate: paidDate ? new Date(paidDate) : new Date()
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Pago de comisión registrado exitosamente',
      data: {
        paymentRequest,
        commissionDetails: commissionDetailsCreated,
        expense,
        movement
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error registrando pago de comisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago de comisión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
