const { Op } = require('sequelize');
const { OwnerPaymentConfiguration } = require('../models');
const PaginationService = require('../services/PaginationService');

class OwnerPaymentConfigurationController {

  /**
   * Obtener todas las configuraciones de pago del OWNER
   */
  static async getAllConfigurations(req, res) {
    try {
      const { 
        provider, 
        isActive, 
        environment,
        page = 1, 
        limit = 20 
      } = req.query;

      // Construir filtros
      const where = {};
      
      if (provider) {
        where.provider = provider;
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      
      if (environment) {
        where.environment = environment;
      }

      const result = await PaginationService.paginate(OwnerPaymentConfiguration, {
        page: parseInt(page),
        limit: parseInt(limit),
        where,
        order: [
          ['isDefault', 'DESC'],
          ['isActive', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error obteniendo configuraciones de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener una configuración específica por ID
   */
  static async getConfigurationById(req, res) {
    try {
      const { id } = req.params;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      res.json({
        success: true,
        data: configuration
      });

    } catch (error) {
      console.error('Error obteniendo configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nueva configuración de pago
   */
  static async createConfiguration(req, res) {
    try {
      const {
        provider,
        name,
        environment = 'SANDBOX',
        configuration = {},
        credentials = {},
        webhookUrl,
        webhookSecret,
        supportedCurrencies = ['COP'],
        commissionRate = 0,
        fixedFee = 0,
        maxAmount,
        minAmount,
        isActive = false,
        isDefault = false
      } = req.body;

      // Validaciones
      if (!provider || !name) {
        return res.status(400).json({
          success: false,
          message: 'Provider y name son requeridos'
        });
      }

      // Si se marca como default, quitar default de las demás
      if (isDefault) {
        await OwnerPaymentConfiguration.update(
          { isDefault: false },
          { where: { isDefault: true } }
        );
      }

      const newConfiguration = await OwnerPaymentConfiguration.create({
        provider,
        name,
        environment,
        configuration,
        credentials,
        webhookUrl,
        webhookSecret,
        supportedCurrencies,
        commissionRate,
        fixedFee,
        maxAmount,
        minAmount,
        isActive,
        isDefault
      });

      res.status(201).json({
        success: true,
        message: 'Configuración de pago creada exitosamente',
        data: newConfiguration
      });

    } catch (error) {
      console.error('Error creando configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar configuración de pago
   */
  static async updateConfiguration(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      // Si se marca como default, quitar default de las demás
      if (updateData.isDefault && !configuration.isDefault) {
        await OwnerPaymentConfiguration.update(
          { isDefault: false },
          { where: { isDefault: true, id: { [Op.ne]: id } } }
        );
      }

      await configuration.update(updateData);

      res.json({
        success: true,
        message: 'Configuración de pago actualizada exitosamente',
        data: configuration
      });

    } catch (error) {
      console.error('Error actualizando configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar configuración de pago
   */
  static async deleteConfiguration(req, res) {
    try {
      const { id } = req.params;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      // Verificar que no sea la configuración por defecto
      if (configuration.isDefault) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la configuración por defecto'
        });
      }

      // TODO: Verificar que no tenga pagos asociados
      // const paymentsCount = await SubscriptionPayment.count({
      //   where: { paymentConfigurationId: id }
      // });

      // if (paymentsCount > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'No se puede eliminar una configuración con pagos asociados'
      //   });
      // }

      await configuration.destroy();

      res.json({
        success: true,
        message: 'Configuración de pago eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando configuración de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Activar/Desactivar configuración de pago
   */
  static async toggleStatus(req, res) {
    try {
      const { id } = req.params;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      await configuration.update({
        isActive: !configuration.isActive
      });

      res.json({
        success: true,
        message: `Configuración ${configuration.isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: configuration
      });

    } catch (error) {
      console.error('Error cambiando estado de configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Establecer como configuración por defecto
   */
  static async setAsDefault(req, res) {
    try {
      const { id } = req.params;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      if (!configuration.isActive) {
        return res.status(400).json({
          success: false,
          message: 'No se puede establecer como default una configuración inactiva'
        });
      }

      // Quitar default de todas las demás
      await OwnerPaymentConfiguration.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );

      // Establecer esta como default
      await configuration.update({ isDefault: true });

      res.json({
        success: true,
        message: 'Configuración establecida como default exitosamente',
        data: configuration
      });

    } catch (error) {
      console.error('Error estableciendo configuración como default:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener configuraciones activas (para dropdown)
   */
  static async getActiveConfigurations(req, res) {
    try {
      const configurations = await OwnerPaymentConfiguration.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'provider', 'environment', 'isDefault'],
        order: [
          ['isDefault', 'DESC'],
          ['name', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: configurations
      });

    } catch (error) {
      console.error('Error obteniendo configuraciones activas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Probar configuración de pago (webhook test)
   */
  static async testConfiguration(req, res) {
    try {
      const { id } = req.params;

      const configuration = await OwnerPaymentConfiguration.findByPk(id);

      if (!configuration) {
        return res.status(404).json({
          success: false,
          message: 'Configuración de pago no encontrada'
        });
      }

      // TODO: Implementar test específico por proveedor
      // Por ahora solo verificamos que la configuración esté completa
      const requiredFields = ['provider', 'name'];
      const missingFields = requiredFields.filter(field => !configuration[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        });
      }

      res.json({
        success: true,
        message: 'Configuración válida',
        data: {
          provider: configuration.provider,
          environment: configuration.environment,
          status: 'valid'
        }
      });

    } catch (error) {
      console.error('Error probando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = OwnerPaymentConfigurationController;