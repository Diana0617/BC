/**
 * Controlador para gestión de pagos desde el lado del negocio
 * Los negocios pueden ver su suscripción, subir comprobantes y hacer pagos
 */

const { BusinessSubscription, SubscriptionPayment, SubscriptionPlan, Business } = require('../models');
const SubscriptionStatusService = require('../services/SubscriptionStatusService');
const { uploadPaymentReceipt } = require('../config/cloudinary');

class BusinessPaymentController {
  /**
   * Cambiar el plan de suscripción del negocio
   * POST /api/business/subscription/change-plan
   */
  static async changePlan(req, res) {
    try {
  const businessId = req.user.businessId;
  const { newPlanId } = req.body;
  console.log('changePlan called - businessId:', businessId, 'newPlanId:', newPlanId);

  // Validar que el nuevo plan existe y no es el actual
  const currentSubscription = await BusinessSubscription.findOne({ where: { businessId } });
  console.log('changePlan - currentSubscription:', currentSubscription ? { id: currentSubscription.id, subscriptionPlanId: currentSubscription.subscriptionPlanId, status: currentSubscription.status } : null);
      if (!currentSubscription) {
        return res.status(404).json({ success: false, message: 'No se encontró suscripción activa.' });
      }
      if (currentSubscription.subscriptionPlanId === newPlanId) {
        // Si el plan es exactamente el mismo
        if (currentSubscription.status === 'ACTIVE') {
          // Idempotent: ya está activo, sincronizar Business.currentPlanId y devolver éxito en lugar de error.
          try {
            await Business.update({ currentPlanId: newPlanId }, { where: { id: businessId } });
            console.log('changePlan: requested same active plan; synced Business.currentPlanId and returning no-op success');
          } catch (err) {
            console.warn('changePlan: requested same active plan but failed to update Business.currentPlanId:', err);
          }
          return res.json({ success: true, message: 'El plan ya está activo. No se realizaron cambios.', data: { currentPlanId: newPlanId } });
        } else {
          console.log(`changePlan: selected same plan but subscription status is ${currentSubscription.status} - allowing reactivation flow`);
          // Mantener newPlanId pero actualizamos estado para procesar pago si aplica
          // No hacemos return; continuamos con el flujo para crear pago pendiente si aplica
        }
      }
      const newPlan = await SubscriptionPlan.findByPk(newPlanId);
      if (!newPlan) {
        return res.status(404).json({ success: false, message: 'El plan seleccionado no existe.' });
      }

      const isLifetimePlan =
        String(newPlan?.name || '').toUpperCase() === 'LIFETIME' ||
        String(newPlan?.billingCycle || '').toUpperCase() === 'LIFETIME';

      if (isLifetimePlan && req.user?.role !== 'OWNER') {
        return res.status(403).json({
          success: false,
          message: 'Solo un OWNER puede asignar un plan LIFETIME a un negocio.'
        });
      }

      // Calcular diferencia de precio/prorrateo si aplica
      const now = new Date();
      const expiresAt = currentSubscription.expiresAt || currentSubscription.endDate;
      let remainingDays = 0;
      if (expiresAt) {
        const diffMs = new Date(expiresAt) - now;
        remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      // Helper: parsear precios seguros (acepta strings con coma/espacios/pesos)
      const parsePrice = (v) => {
        if (v === null || typeof v === 'undefined') return 0;
        if (typeof v === 'number') return v || 0;
        // Eliminar cualquier carácter que no sea dígito, punto o signo menos
        const cleaned = String(v).replace(/[^0-9.-]+/g, '');
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
      };

      // Obtener el plan actual (si existe) y normalizar precios a Number
      const currentPlan = await SubscriptionPlan.findByPk(currentSubscription.subscriptionPlanId);
      const currentPlanPrice = currentPlan ? parsePrice(currentPlan.price) : 0;
      const newPlanPrice = parsePrice(newPlan.price);

      // Default: prorrateo por días restantes (suponemos mes de 30 días)
      // Usar el amount real de la suscripción si está presente (subAmount),
      // porque algunas suscripciones pueden tener un monto distinto al price del plan.
      const subAmount = parsePrice(currentSubscription.amount) || currentPlanPrice || 0;
      let credit = 0;
      if (subAmount > 0 && remainingDays > 0) {
        credit = (subAmount / 30) * remainingDays;
      }
      let newPlanCost = 0;
      if (newPlanPrice > 0 && remainingDays > 0) {
        newPlanCost = (newPlanPrice / 30) * remainingDays;
      }

      // Si la suscripción está en periodo de trial activo y aún no terminó,
      // el negocio suele esperar que al hacer upgrade pague la diferencia respecto
      // al monto real de la suscripción (por ejemplo, precio nuevo - amount actual).
      // Aquí aplicamos una regla práctica: durante trial cobramos la diferencia
      // directa entre el nuevo plan y el monto actual de la suscripción (no prorrateo).
      let difference = 0;
      try {
        const trialEnd = currentSubscription.trialEndDate ? new Date(currentSubscription.trialEndDate) : null;
        // Considerar también el estado 'TRIAL' por compatibilidad con datos existentes
        const inTrial = (trialEnd && now < trialEnd) || (currentSubscription.status && String(currentSubscription.status).toUpperCase() === 'TRIAL');
        if (inTrial) {
          difference = Math.max(0, newPlanPrice - subAmount);
          console.log('changePlan: upgrade during active trial detected. Using trial-difference calculation. subAmount:', subAmount, 'newPlanPrice:', newPlanPrice, 'difference:', difference);
        } else {
          // Normal: diferencia entre lo que cuesta la porción del nuevo plan y el crédito por la porción restante del actual
          difference = Math.max(0, newPlanCost - credit);
        }
      } catch (err) {
        console.warn('changePlan: error evaluating trial logic, falling back to proration', err);
        difference = Math.max(0, newPlanCost - credit);
      }

      // Logs diagnósticos para facilitar debugging
      console.log('changePlan debug:', {
        currentPlanPrice,
        newPlanPrice,
        remainingDays,
        credit: Number(credit.toFixed(2)),
        newPlanCost: Number(newPlanCost.toFixed(2)),
        difference: Number(difference.toFixed(2))
      });

      // Actualizar la suscripción
      currentSubscription.subscriptionPlanId = newPlanId;
      currentSubscription.status = difference > 0 ? 'PENDING' : 'ACTIVE';
      currentSubscription.expiresAt = expiresAt; // Mantener fecha de expiración
      await currentSubscription.save();

      // Sincronizar el plan actual en la entidad Business para que GET /api/business muestre el plan correcto
      try {
        await Business.update({ currentPlanId: newPlanId }, { where: { id: businessId } });
        console.log('changePlan: Business.currentPlanId actualizado para businessId:', businessId, '->', newPlanId);
      } catch (err) {
        console.warn('changePlan: no se pudo actualizar Business.currentPlanId:', err);
      }

      // Registrar pago pendiente si hay diferencia
      let payment = null;
      if (difference > 0) {
        // Ensure numeric and date values are not null to satisfy model validations
        const netAmount = Number(Number(difference).toFixed(2)) || 0;
        const amount = netAmount;
        // Por defecto el vencimiento será hoy; si quieres dar un plazo, ajusta aquí
        const due = now;

        payment = await SubscriptionPayment.create({
          businessSubscriptionId: currentSubscription.id,
          amount: amount,
          currency: newPlan.currency || 'COP',
          paymentDate: now,
          dueDate: due,
          netAmount: netAmount, // Asume que no hay comisión en el cambio de plan
          commissionFee: 0,
          // Use an allowed paymentMethod value from the enum
          paymentMethod: 'MANUAL',
          status: 'PENDING',
          notes: `Cambio de plan. Crédito aplicado: $${credit.toFixed(2)}`
        });
      }

      const inDevelopment = process.env.NODE_ENV === 'development';
      const message = difference > 0
        ? `Plan cambiado correctamente. Debes pagar la diferencia: $${difference.toFixed(2)}`
        : 'Plan cambiado correctamente. No hay diferencia a pagar.';

      const responseData = {
        newPlan: {
          id: newPlan.id,
          name: newPlan.name,
          price: newPlan.price
        },
        payment: payment ? {
          id: payment.id,
          amount: payment.amount,
          status: payment.status
        } : null
      };

      if (inDevelopment) {
        responseData.debug = {
          currentPlanPrice: currentPlanPrice,
          currentSubscriptionAmount: subAmount,
          newPlanPrice: newPlanPrice,
          remainingDays,
          credit: Number((typeof credit !== 'undefined' ? credit : 0).toFixed(2)),
          newPlanCost: Number((typeof newPlanCost !== 'undefined' ? newPlanCost : 0).toFixed(2)),
          difference: Number(difference.toFixed(2)),
          inTrial: (currentSubscription.trialEndDate && new Date() < new Date(currentSubscription.trialEndDate)) || (currentSubscription.status && String(currentSubscription.status).toUpperCase() === 'TRIAL')
        };
      }

      // Además, obtener y devolver el Business actualizado para que el cliente pueda sincronizarse inmediatamente
      try {
        const updatedBusiness = await Business.findByPk(businessId, {
          include: [
            {
              model: require('../models/SubscriptionPlan'),
              as: 'currentPlan'
            },
            {
              model: require('../models/BusinessSubscription'),
              as: 'subscriptions',
              include: [
                {
                  model: require('../models/SubscriptionPlan'),
                  as: 'plan'
                }
              ]
            }
          ]
        });

        if (updatedBusiness) {
          responseData.currentBusiness = updatedBusiness.toJSON();
        }
      } catch (err) {
        console.warn('changePlan: no se pudo cargar Business actualizado para incluir en la respuesta:', err);
      }

      return res.json({ success: true, message, data: responseData });
    } catch (error) {
      console.error('Error cambiando de plan:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
  }

  /**
   * Obtener información de la suscripción actual del negocio
   */
  static async getMySubscription(req, res) {
    try {
      const businessId = req.user.businessId;

      const subscription = await BusinessSubscription.findOne({
        where: { businessId },
        include: [
          {
            model: SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price', 'billingCycle', 'description']
          },
          {
            model: SubscriptionPayment,
            as: 'payments',
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'amount', 'status', 'paymentDate', 'receiptUrl', 'createdAt']
          }
        ]
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción activa para este negocio.'
        });
      }

      // Verificar estado actual
      const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        data: {
          subscription: {
            id: subscription.id,
            status: statusInfo.status,
            nextPaymentDate: subscription.nextPaymentDate,
            lastPaymentDate: subscription.lastPaymentDate,
            daysOverdue: statusInfo.daysOverdue || 0,
            accessLevel: statusInfo.level,
            hasAccess: statusInfo.access
          },
          plan: subscription.plan,
          recentPayments: subscription.payments
        }
      });

    } catch (error) {
      console.error('Error obteniendo suscripción del negocio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Subir comprobante de pago
   */
  static async uploadPaymentReceipt(req, res) {
    try {
      const businessId = req.user.businessId;
      const { amount, paymentDate, paymentMethod, notes } = req.body;

      // Validaciones
      if (!amount || !paymentDate) {
        return res.status(400).json({
          success: false,
          message: 'El monto y la fecha de pago son requeridos.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'El comprobante de pago es requerido.'
        });
      }

      // Verificar que existe la suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción para este negocio.'
        });
      }

      // Subir archivo a Cloudinary
      const uploadResult = await uploadPaymentReceipt(req.file.buffer, {
        businessId,
        paymentDate,
        amount
      });

      // Crear registro de pago
      const parsedAmount = parseFloat(amount) || 0;
      const parsedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

      const payment = await SubscriptionPayment.create({
        businessSubscriptionId: subscription.id,
        amount: parsedAmount,
        paymentDate: parsedPaymentDate,
        // Ensure required fields are present
        dueDate: parsedPaymentDate,
        netAmount: parsedAmount,
  paymentMethod: paymentMethod || 'BANK_TRANSFER',
        status: 'PENDING', // Pendiente de verificación OWNER
        receiptUrl: uploadResult.secure_url,
        receiptPublicId: uploadResult.public_id,
        receiptMetadata: uploadResult.metadata,
        receiptUploadedBy: req.user.id,
        notes: notes || null
      });

      res.status(201).json({
        success: true,
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            status: payment.status,
            receiptUrl: payment.receiptUrl
          }
        },
        message: 'Comprobante subido exitosamente. Será verificado por el administrador.'
      });

    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      res.status(500).json({
        success: false,
        message: 'Error subiendo el comprobante.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener historial de pagos del negocio
   */
  static async getMyPaymentHistory(req, res) {
    try {
      const businessId = req.user.businessId;
      const { page = 1, limit = 10, status } = req.query;

      const offset = (page - 1) * limit;

      // Obtener suscripción
      const subscription = await BusinessSubscription.findOne({
        where: { businessId }
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró suscripción para este negocio.'
        });
      }

      // Construir filtros
      const where = { businessSubscriptionId: subscription.id };
      if (status) {
        where.status = status;
      }

      const payments = await SubscriptionPayment.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'amount', 'paymentDate', 'paymentMethod', 'status', 
          'receiptUrl', 'notes', 'verificationNotes', 'createdAt'
        ]
      });

      res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            total: payments.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(payments.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener detalles de un pago específico
   */
  static async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const businessId = req.user.businessId;

      const payment = await SubscriptionPayment.findOne({
        where: { id: paymentId },
        include: [
          {
            model: BusinessSubscription,
            as: 'subscription',
            where: { businessId },
            attributes: ['id', 'businessId']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pago no encontrado o no pertenece a este negocio.'
        });
      }

      res.json({
        success: true,
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            receiptUrl: payment.receiptUrl,
            notes: payment.notes,
            verificationNotes: payment.verificationNotes,
            createdAt: payment.createdAt,
            verifiedAt: payment.verifiedAt
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo detalles del pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estado de acceso actual del negocio
   */
  static async getAccessStatus(req, res) {
    try {
      const businessId = req.user.businessId;

      const statusInfo = await SubscriptionStatusService.checkBusinessSubscription(businessId);

      res.json({
        success: true,
        data: {
          hasAccess: statusInfo.access,
          accessLevel: statusInfo.level,
          status: statusInfo.status,
          daysOverdue: statusInfo.daysOverdue || 0,
          restrictions: this.getAccessRestrictions(statusInfo.level)
        }
      });

    } catch (error) {
      console.error('Error verificando estado de acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener restricciones basadas en el nivel de acceso
   */
  static getAccessRestrictions(accessLevel) {
    const restrictions = {
      'FULL': [],
      'LIMITED': [
        'No se pueden crear nuevos servicios',
        'No se pueden agregar nuevos especialistas', 
        'Acceso limitado a reportes avanzados',
        'No se pueden usar módulos premium'
      ],
      'NONE': [
        'Sin acceso a la plataforma',
        'Solo vista de información básica',
        'No se pueden realizar operaciones'
      ]
    };

    return restrictions[accessLevel] || restrictions['NONE'];
  }
}

module.exports = BusinessPaymentController;