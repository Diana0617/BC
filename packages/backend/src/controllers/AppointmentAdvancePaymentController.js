const { 
  Appointment, 
  Service, 
  Client, 
  Business,
  BusinessPaymentConfig 
} = require('../models');
const { sequelize } = require('../config/database');
const axios = require('axios');

/**
 * Controlador para manejar pagos adelantados de citas con Wompi
 * Maneja el flujo completo de depósitos requeridos para agendar citas
 */
class AppointmentAdvancePaymentController {

  /**
   * Verificar si una cita requiere pago adelantado
   * GET /api/appointments/{appointmentId}/advance-payment/check
   */
  static async checkAdvancePaymentRequired(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;

      // Verificar que la cita existe y pertenece al negocio
      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId, 
          businessId 
        },
        include: [
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'price', 'duration']
          },
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Obtener configuración de pagos del negocio
      const paymentConfig = await BusinessPaymentConfig.findOne({
        where: { businessId }
      });

      if (!paymentConfig || !paymentConfig.depositSettings?.requireDeposit) {
        return res.status(200).json({
          success: true,
          data: {
            required: false,
            message: 'No se requiere pago adelantado para esta cita'
          }
        });
      }

      // Calcular monto del depósito
      const servicePrice = parseFloat(appointment.service.price);
      const depositPercentage = paymentConfig.depositSettings.depositPercentage || 50;
      const minimumDeposit = paymentConfig.depositSettings.depositMinAmount || 10000;
      
      let depositAmount = Math.ceil((servicePrice * depositPercentage) / 100);
      depositAmount = Math.max(depositAmount, minimumDeposit);

      // Verificar estado actual del depósito
      let depositStatus = 'PENDING';
      let paymentData = null;

      if (appointment.advancePayment) {
        depositStatus = appointment.advancePayment.status || 'PENDING';
        paymentData = appointment.advancePayment;
      }

      return res.status(200).json({
        success: true,
        data: {
          required: true,
          amount: depositAmount,
          percentage: depositPercentage,
          servicePrice: servicePrice,
          status: depositStatus,
          appointment: {
            id: appointment.id,
            startTime: appointment.startTime,
            service: appointment.service,
            client: appointment.client
          },
          paymentData
        }
      });

    } catch (error) {
      console.error('Error checking advance payment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar pago adelantado'
      });
    }
  }

  /**
   * Iniciar proceso de pago adelantado con Wompi
   * POST /api/appointments/{appointmentId}/advance-payment/initiate
   */
  static async initiateAdvancePayment(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { appointmentId } = req.params;
      const { businessId } = req.body;

      // Verificar que la cita existe
      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId, 
          businessId 
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
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        transaction
      });

      if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Verificar que no se haya pagado ya
      if (appointment.depositStatus === 'PAID') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'El depósito ya ha sido pagado para esta cita'
        });
      }

      // Obtener configuración del negocio
      const business = await Business.findByPk(businessId, { transaction });
      const paymentConfig = await BusinessPaymentConfig.findOne({
        where: { businessId },
        transaction
      });

      if (!paymentConfig?.depositSettings?.requireDeposit) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Este negocio no requiere pagos adelantados'
        });
      }

      // Calcular monto del depósito
      const servicePrice = parseFloat(appointment.service.price);
      const depositPercentage = paymentConfig.depositSettings.depositPercentage || 50;
      const minimumDeposit = paymentConfig.depositSettings.depositMinAmount || 10000;
      
      let depositAmount = Math.ceil((servicePrice * depositPercentage) / 100);
      depositAmount = Math.max(depositAmount, minimumDeposit);

      // Generar referencia única para Wompi
      const paymentReference = `APT_${appointmentId.substring(0, 8)}_${Date.now()}`;

      // Preparar datos para Wompi
      const wompiPayload = {
        amount_in_cents: depositAmount,
        currency: 'COP',
        reference: paymentReference,
        customer_email: appointment.client.email,
        customer_data: {
          phone_number: appointment.client.phone,
          full_name: `${appointment.client.firstName} ${appointment.client.lastName}`
        },
        redirect_url: `${process.env.FRONTEND_URL}/appointments/${appointmentId}/payment-success`,
        description: `Depósito para cita de ${appointment.service.name} en ${business.name}`
      };

      // Llamar a Wompi para crear la transacción
      const wompiResponse = await axios.post(
        `${process.env.WOMPI_API_URL}/transactions`,
        wompiPayload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!wompiResponse.data || !wompiResponse.data.data) {
        await transaction.rollback();
        return res.status(500).json({
          success: false,
          error: 'Error al crear transacción de pago'
        });
      }

      const wompiTransaction = wompiResponse.data.data;

      // Actualizar la cita con información del pago
      const advancePaymentData = {
        required: true,
        amount: depositAmount,
        percentage: depositPercentage,
        wompiReference: paymentReference,
        wompiTransactionId: wompiTransaction.id,
        status: 'PENDING',
        createdAt: new Date(),
        transactionData: wompiTransaction
      };

      await appointment.update({
        depositStatus: 'PENDING',
        wompiPaymentReference: paymentReference,
        advancePayment: advancePaymentData
      }, { transaction });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Transacción de pago adelantado creada exitosamente',
        data: {
          paymentReference,
          amount: depositAmount,
          paymentUrl: wompiTransaction.payment_link?.href,
          wompiPublicKey: process.env.WOMPI_PUBLIC_KEY,
          transactionId: wompiTransaction.id,
          appointment: {
            id: appointment.id,
            startTime: appointment.startTime,
            service: appointment.service.name
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error initiating advance payment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al iniciar pago adelantado'
      });
    }
  }

  /**
   * Webhook para recibir confirmaciones de pago desde Wompi
   * POST /api/appointments/advance-payment/wompi-webhook
   */
  static async handleWompiWebhook(req, res) {
    try {
      const { data, timestamp, signature } = req.body;

      // Verificar signature de Wompi (por seguridad)
      const expectedSignature = require('crypto')
        .createHmac('sha256', process.env.WOMPI_WEBHOOK_SECRET)
        .update(`${timestamp}.${JSON.stringify(data)}`)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      const transaction = await sequelize.transaction();

      try {
        // Buscar la cita por referencia de Wompi
        const appointment = await Appointment.findOne({
          where: { 
            wompiPaymentReference: data.reference 
          },
          transaction
        });

        if (!appointment) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            error: 'Appointment not found'
          });
        }

        // Actualizar estado según el evento de Wompi
        let newDepositStatus = appointment.depositStatus;
        let updatedAdvancePayment = { ...appointment.advancePayment };

        switch (data.status) {
          case 'APPROVED':
            newDepositStatus = 'PAID';
            updatedAdvancePayment.status = 'PAID';
            updatedAdvancePayment.paidAt = new Date();
            break;
          case 'DECLINED':
          case 'ERROR':
            newDepositStatus = 'FAILED';
            updatedAdvancePayment.status = 'FAILED';
            break;
          case 'VOIDED':
            newDepositStatus = 'REFUNDED';
            updatedAdvancePayment.status = 'REFUNDED';
            updatedAdvancePayment.refundedAt = new Date();
            break;
        }

        // Actualizar la cita
        await appointment.update({
          depositStatus: newDepositStatus,
          advancePayment: updatedAdvancePayment
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: 'Webhook processed successfully'
        });

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error processing Wompi webhook:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing webhook'
      });
    }
  }

  /**
   * Verificar estado del pago adelantado
   * GET /api/appointments/{appointmentId}/advance-payment/status
   */
  static async checkAdvancePaymentStatus(req, res) {
    try {
      const { appointmentId } = req.params;
      const { businessId } = req.query;

      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId, 
          businessId 
        },
        attributes: ['id', 'depositStatus', 'advancePayment', 'wompiPaymentReference']
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Cita no encontrada'
        });
      }

      // Si hay referencia de Wompi, consultar estado actual
      if (appointment.wompiPaymentReference && appointment.depositStatus === 'PENDING') {
        try {
          const wompiResponse = await axios.get(
            `${process.env.WOMPI_API_URL}/transactions/${appointment.wompiPaymentReference}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`
              }
            }
          );

          const wompiTransaction = wompiResponse.data.data;
          
          // Actualizar estado si ha cambiado en Wompi
          if (wompiTransaction.status === 'APPROVED' && appointment.depositStatus !== 'PAID') {
            const updatedAdvancePayment = { 
              ...appointment.advancePayment, 
              status: 'PAID', 
              paidAt: new Date() 
            };

            await appointment.update({
              depositStatus: 'PAID',
              advancePayment: updatedAdvancePayment
            });

            appointment.depositStatus = 'PAID';
            appointment.advancePayment = updatedAdvancePayment;
          }
        } catch (wompiError) {
          console.error('Error checking Wompi status:', wompiError);
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          depositStatus: appointment.depositStatus,
          advancePayment: appointment.advancePayment,
          isPaid: appointment.depositStatus === 'PAID',
          canProceedWithAppointment: appointment.depositStatus === 'PAID' || appointment.depositStatus === 'NOT_REQUIRED'
        }
      });

    } catch (error) {
      console.error('Error checking advance payment status:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al verificar estado del pago'
      });
    }
  }

}

module.exports = AppointmentAdvancePaymentController;