/**
 * Servicio de Pagos con Wompi para Auto-renovación
 * Maneja específicamente los pagos automáticos con tokens guardados
 */

const axios = require('axios');

class WompiPaymentService {
  
  constructor() {
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.baseURL = process.env.WOMPI_BASE_URL || 'https://production.wompi.co/v1';
    this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  }

  /**
   * Procesar pago usando token de tarjeta guardada
   */
  async processPayment(paymentData) {
    try {
      console.log('💳 Procesando pago con Wompi:', {
        amount: paymentData.amount,
        reference: paymentData.reference,
        email: paymentData.customer_email
      });

      const response = await axios.post(`${this.baseURL}/transactions`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
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
        status_message: transaction.status_message || 'Transacción procesada'
      };
      
    } catch (error) {
      console.error('❌ Error procesando pago con Wompi:', error.response?.data || error.message);
      
      // Devolver estructura consistente en caso de error
      return {
        status: 'DECLINED',
        transaction_id: null,
        reference: paymentData.reference,
        status_message: error.response?.data?.error?.reason || error.message
      };
    }
  }

  /**
   * Crear token de tarjeta para pagos futuros
   */
  async createCardToken(cardData) {
    try {
      const tokenData = {
        number: cardData.number,
        cvc: cardData.cvc,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        card_holder: cardData.card_holder
      };

      const response = await axios.post(`${this.baseURL}/tokens/cards`, tokenData, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        token: response.data.data.id,
        status: response.data.data.status
      };
      
    } catch (error) {
      console.error('❌ Error creando token de tarjeta:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.reason || error.message
      };
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

      return {
        success: true,
        data: response.data.data
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo transacción:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.reason || error.message
      };
    }
  }

  /**
   * Validar que los datos de pago estén completos
   */
  validatePaymentData(paymentData) {
    const required = ['amount', 'currency', 'customer_email', 'reference'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    if (paymentData.amount <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    return true;
  }
}

module.exports = WompiPaymentService;