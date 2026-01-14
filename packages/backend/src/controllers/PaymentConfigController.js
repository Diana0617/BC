/**
 * Controlador para gestión de métodos de pago que el negocio acepta de sus clientes
 * (Efectivo, Yape, Transferencias bancarias, QR, etc.)
 */

const { PaymentMethod } = require('../models');
const { Op } = require('sequelize');

class PaymentConfigController {
  /**
   * Obtener todos los métodos de pago de un negocio
   * GET /api/business/:businessId/payment-methods
   * GET /api/business/:businessId/payment-methods/all (incluye inactivos)
   */
  static async getPaymentMethods(req, res) {
    try {
      const { businessId } = req.params;
      const includeInactive = req.path.endsWith('/all');

      const where = { businessId };
      if (!includeInactive) {
        where.isActive = true;
      }

      const methods = await PaymentMethod.findAll({
        where,
        order: [
          ['order', 'ASC'],
          ['createdAt', 'ASC']
        ]
      });

      res.json({
        success: true,
        data: methods
      });

    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métodos de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener un método de pago específico
   * GET /api/business/:businessId/payment-methods/:methodId
   */
  static async getPaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;

      const method = await PaymentMethod.findOne({
        where: {
          id: methodId,
          businessId
        }
      });

      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado'
        });
      }

      res.json({
        success: true,
        data: method
      });

    } catch (error) {
      console.error('Error obteniendo método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un nuevo método de pago
   * POST /api/business/:businessId/payment-methods
   */
  static async createPaymentMethod(req, res) {
    try {
      const { businessId } = req.params;
      const { name, type, requiresProof, icon, bankInfo, qrInfo, metadata, order } = req.body;

      // Validaciones
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y tipo son requeridos'
        });
      }

      // Validar tipos permitidos
      const allowedTypes = ['CASH', 'CARD', 'TRANSFER', 'QR', 'ONLINE', 'OTHER'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Tipo no válido. Tipos permitidos: ${allowedTypes.join(', ')}`
        });
      }

      // Verificar que no exista un método activo con el mismo nombre
      const existing = await PaymentMethod.findOne({
        where: {
          businessId,
          name: {
            [Op.iLike]: name // Case-insensitive
          },
          isActive: true
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un método de pago activo con ese nombre'
        });
      }

      // Validaciones específicas por tipo
      if (type === 'TRANSFER' && bankInfo) {
        const requiredBankFields = ['bankName', 'accountNumber'];
        const missingFields = requiredBankFields.filter(field => !bankInfo[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Campos requeridos para transferencia: ${missingFields.join(', ')}`
          });
        }
      }

      if (type === 'QR' && qrInfo) {
        if (!qrInfo.phoneNumber && !qrInfo.qrImage) {
          return res.status(400).json({
            success: false,
            message: 'Para métodos QR se requiere phoneNumber o qrImage'
          });
        }
      }

      // Crear método de pago
      const method = await PaymentMethod.create({
        businessId,
        name,
        type,
        isActive: true,
        requiresProof: requiresProof || false,
        icon: icon || null,
        bankInfo: (type === 'TRANSFER' && bankInfo) ? bankInfo : null,
        qrInfo: (type === 'QR' && qrInfo) ? qrInfo : null,
        metadata: metadata || null,
        order: order || null
      });

      res.status(201).json({
        success: true,
        data: method,
        message: 'Método de pago creado exitosamente'
      });

    } catch (error) {
      console.error('Error creando método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar un método de pago
   * PUT /api/business/:businessId/payment-methods/:methodId
   */
  static async updatePaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;
      const { name, type, requiresProof, icon, bankInfo, qrInfo, metadata, order } = req.body;

      const method = await PaymentMethod.findOne({
        where: {
          id: methodId,
          businessId
        }
      });

      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado'
        });
      }

      // Si cambia el nombre, verificar que no exista otro con ese nombre
      if (name && name !== method.name) {
        const existing = await PaymentMethod.findOne({
          where: {
            businessId,
            name: {
              [Op.iLike]: name
            },
            isActive: true,
            id: {
              [Op.ne]: methodId
            }
          }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un método de pago activo con ese nombre'
          });
        }
      }

      // Validar tipo si se está cambiando
      if (type && type !== method.type) {
        const allowedTypes = ['CASH', 'CARD', 'TRANSFER', 'QR', 'ONLINE', 'OTHER'];
        if (!allowedTypes.includes(type)) {
          return res.status(400).json({
            success: false,
            message: `Tipo no válido. Tipos permitidos: ${allowedTypes.join(', ')}`
          });
        }
      }

      // Actualizar campos
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (type !== undefined) updates.type = type;
      if (requiresProof !== undefined) updates.requiresProof = requiresProof;
      if (icon !== undefined) updates.icon = icon;
      if (bankInfo !== undefined) updates.bankInfo = bankInfo;
      if (qrInfo !== undefined) updates.qrInfo = qrInfo;
      if (metadata !== undefined) updates.metadata = metadata;
      if (order !== undefined) updates.order = order;

      await method.update(updates);

      res.json({
        success: true,
        data: method,
        message: 'Método de pago actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Activar/Desactivar método de pago
   * PATCH /api/business/:businessId/payment-methods/:methodId/toggle
   */
  static async togglePaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;

      const method = await PaymentMethod.findOne({
        where: {
          id: methodId,
          businessId
        }
      });

      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado'
        });
      }

      // Verificar que no sea el único método activo
      if (method.isActive) {
        const activeCount = await PaymentMethod.count({
          where: {
            businessId,
            isActive: true
          }
        });

        if (activeCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'No puedes desactivar el único método de pago activo'
          });
        }
      }

      await method.update({
        isActive: !method.isActive
      });

      res.json({
        success: true,
        data: method,
        message: `Método de pago ${method.isActive ? 'activado' : 'desactivado'} exitosamente`
      });

    } catch (error) {
      console.error('Error cambiando estado del método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error cambiando estado del método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar método de pago
   * DELETE /api/business/:businessId/payment-methods/:methodId
   */
  static async deletePaymentMethod(req, res) {
    try {
      const { businessId, methodId } = req.params;

      const method = await PaymentMethod.findOne({
        where: {
          id: methodId,
          businessId
        }
      });

      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Método de pago no encontrado'
        });
      }

      // Verificar que no sea el único método activo
      if (method.isActive) {
        const activeCount = await PaymentMethod.count({
          where: {
            businessId,
            isActive: true
          }
        });

        if (activeCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'No puedes eliminar el único método de pago activo'
          });
        }
      }

      await method.destroy();

      res.json({
        success: true,
        message: 'Método de pago eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando método de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando método de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Reordenar métodos de pago
   * PATCH /api/business/:businessId/payment-methods/reorder
   */
  static async reorderPaymentMethods(req, res) {
    try {
      const { businessId } = req.params;
      const { methodIds } = req.body; // Array de IDs en el orden deseado

      if (!Array.isArray(methodIds) || methodIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de IDs de métodos'
        });
      }

      // Verificar que todos los métodos pertenecen al negocio
      const methods = await PaymentMethod.findAll({
        where: {
          id: methodIds,
          businessId
        }
      });

      if (methods.length !== methodIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunos métodos no pertenecen a este negocio'
        });
      }

      // Actualizar orden
      const updates = methodIds.map((id, index) => {
        return PaymentMethod.update(
          { order: index + 1 },
          { where: { id, businessId } }
        );
      });

      await Promise.all(updates);

      // Obtener métodos actualizados
      const updatedMethods = await PaymentMethod.findAll({
        where: { businessId },
        order: [['order', 'ASC']]
      });

      res.json({
        success: true,
        data: updatedMethods,
        message: 'Orden actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error reordenando métodos de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error reordenando métodos de pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = PaymentConfigController;
