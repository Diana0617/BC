const { SubscriptionPayment, BusinessSubscription } = require('../models');
const SubscriptionController = require('./SubscriptionController');

class TestingController {
  /**
   * Simular pago aprobado y crear negocio automáticamente
   * POST /api/testing/simulate-approved-payment/:transactionId
   */
  static async simulateApprovedPayment(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'transactionId es requerido'
        });
      }

      console.log('🧪 Simulando pago aprobado para:', transactionId);

      // Buscar el pago temporal
      const payment = await SubscriptionPayment.findOne({
        where: { transactionId: transactionId }
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada'
        });
      }

      // Simular datos de Wompi aprobados
      const simulatedWompiData = {
        id: transactionId,
        status: 'APPROVED',
        status_message: 'Transacción aprobada (simulada)',
        created_at: payment.createdAt,
        finalized_at: new Date(),
        amount_in_cents: parseInt(payment.amount) * 100,
        currency: payment.currency,
        reference: payment.reference
      };

      // Actualizar el pago como aprobado
      await payment.update({
        status: 'APPROVED',
        wompiData: simulatedWompiData,
        updatedAt: new Date()
      });

      console.log('✅ Pago marcado como APROBADO');

      // Crear el negocio usando los datos de registro
      if (payment.metadata && payment.metadata.registrationData) {
        const registrationData = payment.metadata.registrationData;
        
        // Asegurar que tenemos todos los campos requeridos
        const businessData = {
          name: registrationData.businessData.businessCode || 'Negocio ' + registrationData.businessData.businessCode, // Generar name si no existe
          businessCode: registrationData.businessData.businessCode,
          type: registrationData.businessData.type || 'SERVICE',
          phone: registrationData.businessData.phone,
          email: registrationData.businessData.email,
          address: registrationData.businessData.address,
          city: registrationData.businessData.city,
          country: registrationData.businessData.country
        };

        const userData = {
          firstName: registrationData.userData.firstName,
          lastName: registrationData.userData.lastName,
          email: registrationData.userData.email,
          password: registrationData.userData.password
        };
        
        const subscriptionData = {
          planId: payment.metadata.subscriptionPlanId,
          businessData: businessData,
          userData: userData,
          paymentData: {
            transactionId: transactionId,
            amount: payment.amount,
            currency: payment.currency,
            method: 'WOMPI_3DS', // Corregir: usar valor válido del enum
            status: 'APPROVED',
            wompiData: simulatedWompiData
          }
        };

        console.log('🏢 Creando negocio con datos completos:', {
          businessName: businessData.name,
          businessCode: businessData.businessCode,
          userEmail: userData.email,
          planId: payment.metadata.subscriptionPlanId
        });

        // Simular req/res para usar el método existente
        const mockReq = { body: subscriptionData };
        let businessResult = null;
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              businessResult = { statusCode: code, data };
              return businessResult;
            }
          }),
          json: (data) => {
            businessResult = { statusCode: 200, data };
            return businessResult;
          }
        };

        const creationResult = await SubscriptionController.createSubscription(mockReq, mockRes);
        
        console.log('🔍 DEBUG businessResult:', JSON.stringify(businessResult, null, 2));
        
        if (businessResult && businessResult.statusCode === 201) {
          console.log('✅ Negocio creado exitosamente después del pago simulado');
          
          // Actualizar el pago con la suscripción creada (FUERA de la transacción de createSubscription)
          const businessSubscriptionId = businessResult.data?.data?.subscription?.id;
          console.log('🔍 Buscando businessSubscriptionId:', businessSubscriptionId);
          
          if (businessSubscriptionId) {
            // Usar update sin transacción ya que createSubscription ya terminó
            await payment.reload(); // Recargar el payment para evitar conflictos
            
            // Actualizar metadata correctamente para JSONB
            const updatedMetadata = {
              ...payment.metadata,
              businessCreated: true,
              businessCreatedAt: new Date().toISOString(),
              simulatedApproval: true
            };
            
            await payment.update({
              businessSubscriptionId: businessSubscriptionId,
              metadata: updatedMetadata
            });

            console.log('✅ Pago actualizado con businessSubscriptionId:', businessSubscriptionId);
            console.log('✅ Metadata actualizado:', JSON.stringify(updatedMetadata, null, 2));
            
            // Recargar para confirmar
            await payment.reload();
            console.log('🔍 Verificando metadata después de update:', payment.metadata?.businessCreated);
          }

          return res.json({
            success: true,
            message: 'Pago simulado como aprobado y negocio creado exitosamente',
            data: {
              payment: {
                id: payment.id,
                transactionId: payment.transactionId,
                status: payment.status,
                businessSubscriptionId: businessSubscriptionId
              },
              business: businessResult.data?.data?.business,
              subscription: businessResult.data?.data?.subscription,
              user: businessResult.data?.data?.user
            }
          });
        } else {
          throw new Error('Error creando el negocio: ' + JSON.stringify(businessResult));
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'No se encontraron datos de registro en el pago'
        });
      }

    } catch (error) {
      console.error('Error simulando pago aprobado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear negocio directamente sin transacción previa (para testing fácil)
   * POST /api/testing/create-business-direct
   */
  static async createBusinessDirect(req, res) {
    try {
      const { businessData } = req.body;

      if (!businessData) {
        return res.status(400).json({
          success: false,
          error: 'businessData es requerido'
        });
      }

      console.log('🧪 Creando negocio directamente para testing');

      // Simular datos de pago aprobado
      const paymentData = {
        transactionId: `test-direct-${Date.now()}`,
        amount: 39900,
        currency: 'COP',
        status: 'APPROVED',
        method: 'WOMPI_3DS'
      };

      // Usar el controlador de suscripciones para crear el negocio completo
      const result = await SubscriptionController.createCompleteSubscription({
        businessData,
        paymentData,
        invitationToken: `test-token-${Date.now()}`,
        acceptedTerms: true
      });

      res.status(201).json({
        success: true,
        message: 'Negocio creado exitosamente para testing',
        data: result
      });

    } catch (error) {
      console.error('Error creando negocio directo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = TestingController;