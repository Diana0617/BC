const encryptionService = require('./EncryptionService');
const axios = require('axios');

/**
 * BusinessWompiPaymentService
 * 
 * Servicio para manejar la configuración de pagos Wompi para cada Business.
 * 
 * SEPARACIÓN CRÍTICA:
 * - Este servicio es para pagos de CLIENTES → NEGOCIOS (turnos online)
 * - NO está relacionado con pagos de NEGOCIOS → BC (suscripciones)
 * - Usa credenciales del BUSINESS, no de BC
 * 
 * Funcionalidades:
 * - Encriptar/desencriptar claves privadas y secretos
 * - Verificar credenciales contra API de Wompi
 * - Generar URLs de webhook
 * - Validar firmas de webhook
 */

class BusinessWompiPaymentService {
  constructor() {
    this.encryptionService = encryptionService;
    
    // URLs de Wompi según el ambiente
    this.wompiBaseUrls = {
      test: 'https://sandbox.wompi.co',
      production: 'https://production.wompi.co'
    };
  }

  // ========================================
  // ENCRIPTACIÓN DE CREDENCIALES
  // ========================================

  /**
   * Encripta una clave privada o secret para guardar en BD
   * @param {string} plaintext - Clave en texto plano
   * @returns {string} Clave encriptada
   */
  encryptCredential(plaintext) {
    if (!plaintext) {
      throw new Error('No se puede encriptar un valor vacío');
    }
    return this.encryptionService.encrypt(plaintext);
  }

  /**
   * Desencripta una clave privada o secret desde BD
   * @param {string} encrypted - Clave encriptada
   * @returns {string} Clave en texto plano
   */
  decryptCredential(encrypted) {
    if (!encrypted) {
      throw new Error('No se puede desencriptar un valor vacío');
    }
    return this.encryptionService.decrypt(encrypted);
  }

  /**
   * Procesa y encripta credenciales completas para guardar
   * @param {Object} credentials - { publicKey, privateKey, integritySecret }
   * @returns {Object} { publicKey, privateKeyEncrypted, integritySecretEncrypted }
   */
  encryptCredentials({ publicKey, privateKey, integritySecret }) {
    return {
      publicKey, // La clave pública NO se encripta (es pública)
      privateKeyEncrypted: this.encryptCredential(privateKey),
      integritySecretEncrypted: this.encryptCredential(integritySecret)
    };
  }

  /**
   * Desencripta credenciales completas para usar
   * @param {Object} credentials - { publicKey, privateKeyEncrypted, integritySecretEncrypted }
   * @returns {Object} { publicKey, privateKey, integritySecret }
   */
  decryptCredentials({ publicKey, privateKeyEncrypted, integritySecretEncrypted }) {
    return {
      publicKey,
      privateKey: this.decryptCredential(privateKeyEncrypted),
      integritySecret: this.decryptCredential(integritySecretEncrypted)
    };
  }

  // ========================================
  // VERIFICACIÓN DE CREDENCIALES CON WOMPI
  // ========================================

  /**
   * Verifica que las credenciales sean válidas llamando a la API de Wompi
   * @param {Object} credentials - { publicKey, privateKey }
   * @param {string} mode - 'test' o 'production'
   * @returns {Promise<Object>} { valid: boolean, error?: string, merchantInfo?: Object }
   */
  async verifyCredentials({ publicKey, privateKey }, mode = 'test') {
    try {
      // Validar formato de las claves
      const expectedPrefix = mode === 'test' ? 'pub_test_' : 'pub_prod_';
      if (!publicKey?.startsWith(expectedPrefix)) {
        return {
          valid: false,
          error: `La clave pública debe comenzar con "${expectedPrefix}" para modo ${mode}`
        };
      }

      const privatePrefix = mode === 'test' ? 'prv_test_' : 'prv_prod_';
      if (!privateKey?.startsWith(privatePrefix)) {
        return {
          valid: false,
          error: `La clave privada debe comenzar con "${privatePrefix}" para modo ${mode}`
        };
      }

      // Intentar obtener información del comercio usando la clave privada
      const baseUrl = this.wompiBaseUrls[mode];
      
      // Wompi usa autenticación Bearer con la clave privada
      const response = await axios.get(`${baseUrl}/v1/merchants`, {
        headers: {
          'Authorization': `Bearer ${privateKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });

      // Si llegamos aquí, las credenciales son válidas
      return {
        valid: true,
        merchantInfo: response.data?.data || response.data
      };

    } catch (error) {
      // Errores de autenticación (401) = credenciales inválidas
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Credenciales inválidas. Verifica tu clave privada.'
        };
      }

      // Otros errores de Wompi
      if (error.response?.data?.error?.messages) {
        return {
          valid: false,
          error: error.response.data.error.messages.join(', ')
        };
      }

      // Errores de red o timeout
      if (error.code === 'ECONNABORTED') {
        return {
          valid: false,
          error: 'Timeout al conectar con Wompi. Intenta nuevamente.'
        };
      }

      // Error genérico
      return {
        valid: false,
        error: error.message || 'Error al verificar credenciales con Wompi'
      };
    }
  }

  // ========================================
  // WEBHOOK UTILITIES
  // ========================================

  /**
   * Genera la URL del webhook para un Business específico
   * @param {string} businessId - UUID del negocio
   * @param {string} baseUrl - URL base de la aplicación (ej: https://app.beautycontrol.com)
   * @returns {string} URL completa del webhook
   */
  generateWebhookUrl(businessId, baseUrl) {
    // Asegurar que baseUrl no termine con /
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/api/webhooks/wompi/payments/${businessId}`;
  }

  /**
   * Valida la firma de un webhook de Wompi
   * @param {Object} event - Evento recibido del webhook
   * @param {string} signature - Firma recibida en el header
   * @param {string} integritySecret - Secret para validar
   * @returns {boolean} true si la firma es válida
   */
  validateWebhookSignature(event, signature, integritySecret) {
    try {
      const crypto = require('crypto');
      
      // Wompi usa HMAC-SHA256 para firmar los eventos
      // El payload debe ser el JSON stringificado del evento
      const payload = JSON.stringify(event);
      
      const expectedSignature = crypto
        .createHmac('sha256', integritySecret)
        .update(payload)
        .digest('hex');

      // Comparación segura para prevenir timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Valida que las credenciales tengan el formato correcto
   * @param {Object} credentials - { publicKey, privateKey, integritySecret }
   * @param {string} mode - 'test' o 'production'
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validateCredentialsFormat({ publicKey, privateKey, integritySecret }, mode = 'test') {
    const errors = [];

    // Validar public key
    const pubPrefix = mode === 'test' ? 'pub_test_' : 'pub_prod_';
    if (!publicKey) {
      errors.push('La clave pública es obligatoria');
    } else if (!publicKey.startsWith(pubPrefix)) {
      errors.push(`La clave pública debe comenzar con "${pubPrefix}"`);
    }

    // Validar private key
    const prvPrefix = mode === 'test' ? 'prv_test_' : 'prv_prod_';
    if (!privateKey) {
      errors.push('La clave privada es obligatoria');
    } else if (!privateKey.startsWith(prvPrefix)) {
      errors.push(`La clave privada debe comenzar con "${prvPrefix}"`);
    }

    // Validar integrity secret
    if (!integritySecret) {
      errors.push('El integrity secret es obligatorio');
    } else if (integritySecret.length < 20) {
      errors.push('El integrity secret parece ser muy corto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Determina el modo (test/production) basado en las claves
   * @param {string} publicKey - Clave pública de Wompi
   * @returns {string|null} 'test', 'production' o null si no se puede determinar
   */
  detectMode(publicKey) {
    if (!publicKey) return null;
    if (publicKey.startsWith('pub_test_')) return 'test';
    if (publicKey.startsWith('pub_prod_')) return 'production';
    return null;
  }
}

module.exports = new BusinessWompiPaymentService();
