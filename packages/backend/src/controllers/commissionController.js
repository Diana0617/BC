const { 
  BusinessCommissionConfig, 
  ServiceCommission, 
  Service, 
  Business 
} = require('../models');
const { BusinessRule } = require('../models');

/**
 * @controller CommissionController
 * @description Gestión de comisiones a nivel de negocio y servicios
 */

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
        attributes: ['id', 'name', 'slug']
      }]
    });

    // Si no existe, crear configuración por defecto basada en reglas
    if (!config) {
      const rules = await BusinessRule.findAll({
        where: { 
          businessId,
          ruleKey: ['COMISIONES_HABILITADAS', 'COMISIONES_TIPO_CALCULO', 'COMISIONES_PORCENTAJE_GENERAL']
        }
      });

      const rulesMap = rules.reduce((acc, rule) => {
        acc[rule.ruleKey] = rule.value;
        return acc;
      }, {});

      config = await BusinessCommissionConfig.create({
        businessId,
        commissionsEnabled: rulesMap.COMISIONES_HABILITADAS ?? true,
        calculationType: rulesMap.COMISIONES_TIPO_CALCULO ?? 'GENERAL',
        generalPercentage: rulesMap.COMISIONES_PORCENTAJE_GENERAL ?? 50
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

    // Sincronizar con BusinessRules
    await BusinessRule.update(
      { value: commissionsEnabled },
      { where: { businessId, ruleKey: 'COMISIONES_HABILITADAS' } }
    );
    await BusinessRule.update(
      { value: calculationType },
      { where: { businessId, ruleKey: 'COMISIONES_TIPO_CALCULO' } }
    );
    await BusinessRule.update(
      { value: generalPercentage },
      { where: { businessId, ruleKey: 'COMISIONES_PORCENTAJE_GENERAL' } }
    );

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
