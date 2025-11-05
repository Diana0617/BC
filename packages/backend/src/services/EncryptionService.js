const crypto = require('crypto');

/**
 * EncryptionService
 * 
 * Provides AES-256-GCM encryption/decryption for sensitive data like WhatsApp tokens.
 * 
 * Key features:
 * - AES-256-GCM authenticated encryption
 * - Unique IV (Initialization Vector) for each encryption
 * - Authentication tag to detect tampering
 * - Base64 encoding for database storage
 * 
 * Security notes:
 * - The encryption key MUST be stored securely (e.g., environment variable)
 * - Key should be 32 bytes (256 bits) for AES-256
 * - Never commit the key to version control
 * - Implement key rotation strategy for production
 */

class EncryptionService {
  constructor() {
    // Get encryption key from environment variable
    const encryptionKey = process.env.WHATSAPP_ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('WHATSAPP_ENCRYPTION_KEY environment variable is required');
    }

    // Ensure key is exactly 32 bytes for AES-256
    if (Buffer.from(encryptionKey, 'hex').length !== 32) {
      throw new Error('WHATSAPP_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }

    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    this.algorithm = 'aes-256-gcm';
  }

  /**
   * Encrypt plaintext data
   * 
   * @param {string} plaintext - Data to encrypt
   * @returns {string} Encrypted data in format: iv:tag:ciphertext (base64)
   * @throws {Error} If encryption fails
   */
  encrypt(plaintext) {
    try {
      // Generate a random IV (12 bytes is standard for GCM)
      const iv = crypto.randomBytes(12);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      // Encrypt the plaintext
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');

      // Get authentication tag (16 bytes)
      const tag = cipher.getAuthTag();

      // Return combined format: iv:tag:ciphertext (all base64 encoded)
      return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt encrypted data
   * 
   * @param {string} encryptedData - Encrypted data in format: iv:tag:ciphertext
   * @returns {string} Decrypted plaintext
   * @throws {Error} If decryption fails or data is tampered
   */
  decrypt(encryptedData) {
    try {
      // Split the encrypted data
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format. Expected iv:tag:ciphertext');
      }

      const [ivBase64, tagBase64, ciphertext] = parts;

      // Decode from base64
      const iv = Buffer.from(ivBase64, 'base64');
      const tag = Buffer.from(tagBase64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);

      // Decrypt the ciphertext
      let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');

      return plaintext;
    } catch (error) {
      // Authentication tag verification failed = data was tampered with
      if (error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('Decryption failed: Data has been tampered with or key is incorrect');
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a new encryption key (32 bytes for AES-256)
   * Use this to generate a key for WHATSAPP_ENCRYPTION_KEY environment variable
   * 
   * @returns {string} Random 32-byte key as hex string
   */
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate that encrypted data can be decrypted
   * 
   * @param {string} encryptedData - Encrypted data to validate
   * @returns {boolean} True if data is valid and can be decrypted
   */
  validateEncryptedData(encryptedData) {
    try {
      this.decrypt(encryptedData);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EncryptionService();

// Also export class for testing
module.exports.EncryptionService = EncryptionService;
