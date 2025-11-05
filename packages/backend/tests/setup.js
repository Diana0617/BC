/**
 * Jest Setup
 * Configuración global para todos los tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.WHATSAPP_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Silence console.log in tests (optional)
// global.console.log = jest.fn();
