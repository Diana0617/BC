/**
 * Servicio básico de Wompi para pagos únicos
 */

const axios = require('axios');

class WompiService {

  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.baseURL = process.env.WOMPI_BASE_URL || 'https://production.wompi.co/v1';
    this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  }

  /**
   * Crear un pago único con Wompi
   */
  async createPayment(paymentData, privateKey = null) {
    try {
      console.log('💳 Creando pago con Wompi:', {
        amount: paymentData.amount_in_cents,
        reference: paymentData.reference,
        email: paymentData.customer_email
      });

      const response = await axios.post(`${this.baseURL}/transactions`, paymentData, {
        headers: {
          'Authorization': `Bearer ${privateKey || this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data.data;

      console.log('📨 Respuesta de Wompi:', {
        id: transaction.id,
        status: transaction.status,
        reference: transaction.reference
      });

      return {
        status: transaction.status,
        transaction_id: transaction.id,
        reference: transaction.reference,
        status_message: transaction.status_message || 'Transacción procesada',
        payment_method: transaction.payment_method,
        amount_in_cents: transaction.amount_in_cents
      };

    } catch (error) {
      console.error('❌ Error en WompiService.createPayment:', error.response?.data || error.message);
      throw new Error(`Error procesando pago: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Obtener información de una transacción
   */
  async getTransaction(transactionId) {
    try {
      const response = await axios.get(`${this.baseURL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Error obteniendo transacción:', error.response?.data || error.message);
      throw new Error(`Error obteniendo transacción: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = new WompiService();