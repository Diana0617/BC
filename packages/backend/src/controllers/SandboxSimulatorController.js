/**
 * Controlador para simular automáticamente pagos en sandbox
 */

class SandboxSimulatorController {
  
  /**
   * Auto-simular pago aprobado después de un delay (solo desarrollo)
   * POST /api/sandbox/auto-approve/:transactionId
   */
  static async autoApprovePayment(req, res) {
    try {
      const { transactionId } = req.params;
      const { delaySeconds = 10 } = req.body;

      // Solo en ambiente de test/sandbox de Wompi
      if (process.env.WOMPI_ENVIRONMENT === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Endpoint solo disponible en ambiente de test/sandbox'
        });
      }

      console.log(`🤖 Auto-simulación programada para ${transactionId} en ${delaySeconds}s`);

      // Programar simulación automática
      setTimeout(async () => {
        try {
          const TestingController = require('./TestingController');
          
          // Simular request/response
          const mockReq = {
            params: { transactionId },
            body: {
              amount: 1200000,
              currency: 'COP',
              status: 'APPROVED'
            }
          };

          const mockRes = {
            status: (code) => ({
              json: (data) => {
                console.log(`🤖 Auto-simulación completada para ${transactionId}:`, data);
                return { statusCode: code, data };
              }
            }),
            json: (data) => {
              console.log(`🤖 Auto-simulación exitosa para ${transactionId}:`, data);
              return { statusCode: 200, data };
            }
          };

          await TestingController.simulateApprovedPayment(mockReq, mockRes);
          
        } catch (error) {
          console.error(`❌ Error en auto-simulación de ${transactionId}:`, error);
        }
      }, delaySeconds * 1000);

      res.json({
        success: true,
        message: `Auto-simulación programada para ${delaySeconds} segundos`,
        transactionId: transactionId
      });

    } catch (error) {
      console.error('Error programando auto-simulación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = SandboxSimulatorController;