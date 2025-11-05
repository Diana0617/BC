/**
 * Unit Tests for EncryptionService
 * 
 * Tests AES-256-GCM encryption/decryption functionality
 */

const { EncryptionService } = require('../../../src/services/EncryptionService');

describe('EncryptionService', () => {
  let encryptionService;

  beforeAll(() => {
    // Set test encryption key (32 bytes = 64 hex chars)
    process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    encryptionService = new EncryptionService();
  });

  afterAll(() => {
    delete process.env.WHATSAPP_ENCRYPTION_KEY;
  });

  describe('Constructor', () => {
    it('should throw error if WHATSAPP_ENCRYPTION_KEY is not set', () => {
      delete process.env.WHATSAPP_ENCRYPTION_KEY;
      
      expect(() => {
        new EncryptionService();
      }).toThrow('WHATSAPP_ENCRYPTION_KEY environment variable is required');

      // Restore for other tests
      process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    });

    it('should throw error if WHATSAPP_ENCRYPTION_KEY is not 32 bytes', () => {
      process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef'; // Only 16 hex chars
      
      expect(() => {
        new EncryptionService();
      }).toThrow('WHATSAPP_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');

      // Restore for other tests
      process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    });
  });

  describe('encrypt()', () => {
    it('should encrypt plaintext successfully', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);

      // Should return a string with format iv:tag:ciphertext
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should produce different ciphertexts for same plaintext (unique IV)', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);

      // Different IVs should result in different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should encrypt empty string', () => {
      const encrypted = encryptionService.encrypt('');
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });

    it('should encrypt long text', () => {
      const longText = 'a'.repeat(10000);
      const encrypted = encryptionService.encrypt(longText);
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);
    });
  });

  describe('decrypt()', () => {
    it('should decrypt encrypted data successfully', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt empty string', () => {
      const plaintext = '';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt long text', () => {
      const longText = 'a'.repeat(10000);
      const encrypted = encryptionService.encrypt(longText);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(longText);
    });

    it('should decrypt special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt unicode characters', () => {
      const plaintext = 'Hola! 你好 مرحبا 🚀';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        encryptionService.decrypt('invalid-format');
      }).toThrow('Invalid encrypted data format');
    });

    it('should throw error for tampered data', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);
      
      // Tamper with the ciphertext
      const parts = encrypted.split(':');
      parts[2] = parts[2].substring(0, parts[2].length - 1) + 'X'; // Change last char
      const tampered = parts.join(':');

      expect(() => {
        encryptionService.decrypt(tampered);
      }).toThrow('Data has been tampered with');
    });

    it('should throw error for wrong key', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);

      // Create new service with different key
      process.env.WHATSAPP_ENCRYPTION_KEY = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
      const wrongKeyService = new EncryptionService();

      expect(() => {
        wrongKeyService.decrypt(encrypted);
      }).toThrow('Decryption failed');

      // Restore original key
      process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    });
  });

  describe('generateKey()', () => {
    it('should generate a valid 32-byte key', () => {
      const key = EncryptionService.generateKey();
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(64); // 32 bytes = 64 hex characters
      expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
    });

    it('should generate unique keys', () => {
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('validateEncryptedData()', () => {
    it('should return true for valid encrypted data', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);
      
      expect(encryptionService.validateEncryptedData(encrypted)).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(encryptionService.validateEncryptedData('invalid-format')).toBe(false);
    });

    it('should return false for tampered data', () => {
      const plaintext = 'my-secret-whatsapp-token';
      const encrypted = encryptionService.encrypt(plaintext);
      
      const parts = encrypted.split(':');
      parts[2] = parts[2].substring(0, parts[2].length - 1) + 'X';
      const tampered = parts.join(':');

      expect(encryptionService.validateEncryptedData(tampered)).toBe(false);
    });
  });

  describe('Roundtrip tests', () => {
    it('should successfully roundtrip multiple different values', () => {
      const testValues = [
        'simple-token',
        'EAABsbCS1iHgBO7ZCZBfK8...',
        '{"token":"abc123","expires":1234567890}',
        'token-with-special-chars-!@#$%',
        'very-long-token-' + 'x'.repeat(1000)
      ];

      testValues.forEach(value => {
        const encrypted = encryptionService.encrypt(value);
        const decrypted = encryptionService.decrypt(encrypted);
        expect(decrypted).toBe(value);
      });
    });
  });
});
