const WhatsAppToken = require('../models/WhatsAppToken');
const encryptionService = require('./EncryptionService');
const logger = require('../utils/logger');

/**
 * WhatsAppTokenManager
 * 
 * Manages encrypted storage and retrieval of WhatsApp Business Platform tokens.
 * 
 * Features:
 * - Secure token storage with AES-256-GCM encryption
 * - Token expiration tracking
 * - Token rotation support
 * - Automatic expiration checks
 */

class WhatsAppTokenManager {
  /**
   * Store a new token for a business (or update existing)
   * 
   * @param {string} businessId - Business UUID
   * @param {string} token - Plain WhatsApp access token
   * @param {Object} options - Additional token metadata
   * @param {string} options.tokenType - Type of token (USER_ACCESS_TOKEN, SYSTEM_USER_TOKEN)
   * @param {Date} options.expiresAt - Token expiration date (optional)
   * @param {Object} options.metadata - Additional metadata (WABA ID, permissions, etc.)
   * @returns {Promise<Object>} Created/updated token record
   */
  async storeToken(businessId, token, options = {}) {
    try {
      if (!businessId || !token) {
        throw new Error('businessId and token are required');
      }

      // Encrypt the token
      const encryptedToken = encryptionService.encrypt(token);

      const tokenData = {
        businessId,
        encryptedToken,
        tokenType: options.tokenType || 'USER_ACCESS_TOKEN',
        expiresAt: options.expiresAt || null,
        metadata: options.metadata || {},
        isActive: true,
        lastRotatedAt: new Date()
      };

      // Upsert token (update if exists, create if not)
      const [tokenRecord, created] = await WhatsAppToken.upsert(tokenData, {
        returning: true
      });

      logger.info(`WhatsApp token ${created ? 'created' : 'updated'} for business ${businessId}`);

      return {
        id: tokenRecord.id,
        businessId: tokenRecord.businessId,
        tokenType: tokenRecord.tokenType,
        expiresAt: tokenRecord.expiresAt,
        isActive: tokenRecord.isActive,
        created
      };
    } catch (error) {
      logger.error('Error storing WhatsApp token:', error);
      throw new Error(`Failed to store token: ${error.message}`);
    }
  }

  /**
   * Get decrypted token for a business
   * 
   * @param {string} businessId - Business UUID
   * @param {boolean} checkExpiry - Whether to check if token is expired (default: true)
   * @returns {Promise<Object|null>} Token data with decrypted token, or null if not found
   */
  async getToken(businessId, checkExpiry = true) {
    try {
      if (!businessId) {
        throw new Error('businessId is required');
      }

      // Find active token for business
      const tokenRecord = await WhatsAppToken.findOne({
        where: {
          businessId,
          isActive: true
        }
      });

      if (!tokenRecord) {
        logger.warn(`No active WhatsApp token found for business ${businessId}`);
        return null;
      }

      // Check expiration if requested
      if (checkExpiry && tokenRecord.expiresAt) {
        const now = new Date();
        if (now > tokenRecord.expiresAt) {
          logger.warn(`WhatsApp token for business ${businessId} has expired`);
          
          // Mark token as inactive
          await tokenRecord.update({ isActive: false });
          
          return null;
        }
      }

      // Decrypt the token
      const decryptedToken = encryptionService.decrypt(tokenRecord.encryptedToken);

      return {
        token: decryptedToken,
        tokenType: tokenRecord.tokenType,
        expiresAt: tokenRecord.expiresAt,
        metadata: tokenRecord.metadata,
        lastRotatedAt: tokenRecord.lastRotatedAt
      };
    } catch (error) {
      logger.error('Error getting WhatsApp token:', error);
      throw new Error(`Failed to get token: ${error.message}`);
    }
  }

  /**
   * Check if a business has a valid active token
   * 
   * @param {string} businessId - Business UUID
   * @returns {Promise<boolean>} True if business has valid token
   */
  async hasValidToken(businessId) {
    try {
      const tokenData = await this.getToken(businessId, true);
      return tokenData !== null;
    } catch (error) {
      logger.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Rotate token for a business
   * 
   * @param {string} businessId - Business UUID
   * @param {string} newToken - New plain WhatsApp access token
   * @param {Object} options - Token options (same as storeToken)
   * @returns {Promise<Object>} Updated token record
   */
  async rotateToken(businessId, newToken, options = {}) {
    try {
      logger.info(`Rotating WhatsApp token for business ${businessId}`);
      
      // Store the new token (will update existing record)
      return await this.storeToken(businessId, newToken, options);
    } catch (error) {
      logger.error('Error rotating WhatsApp token:', error);
      throw new Error(`Failed to rotate token: ${error.message}`);
    }
  }

  /**
   * Deactivate token for a business
   * 
   * @param {string} businessId - Business UUID
   * @returns {Promise<boolean>} True if token was deactivated
   */
  async deactivateToken(businessId) {
    try {
      const result = await WhatsAppToken.update(
        { isActive: false },
        {
          where: {
            businessId,
            isActive: true
          }
        }
      );

      const deactivated = result[0] > 0;
      
      if (deactivated) {
        logger.info(`WhatsApp token deactivated for business ${businessId}`);
      } else {
        logger.warn(`No active token found to deactivate for business ${businessId}`);
      }

      return deactivated;
    } catch (error) {
      logger.error('Error deactivating WhatsApp token:', error);
      throw new Error(`Failed to deactivate token: ${error.message}`);
    }
  }

  /**
   * Delete token for a business
   * 
   * @param {string} businessId - Business UUID
   * @returns {Promise<boolean>} True if token was deleted
   */
  async deleteToken(businessId) {
    try {
      const result = await WhatsAppToken.destroy({
        where: { businessId }
      });

      const deleted = result > 0;
      
      if (deleted) {
        logger.info(`WhatsApp token deleted for business ${businessId}`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting WhatsApp token:', error);
      throw new Error(`Failed to delete token: ${error.message}`);
    }
  }

  /**
   * Get all expired tokens
   * 
   * @returns {Promise<Array>} List of expired token records
   */
  async getExpiredTokens() {
    try {
      const { Op } = require('sequelize');
      
      const expiredTokens = await WhatsAppToken.findAll({
        where: {
          isActive: true,
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      });

      return expiredTokens;
    } catch (error) {
      logger.error('Error getting expired tokens:', error);
      throw new Error(`Failed to get expired tokens: ${error.message}`);
    }
  }

  /**
   * Clean up expired tokens (mark as inactive)
   * 
   * @returns {Promise<number>} Number of tokens cleaned up
   */
  async cleanupExpiredTokens() {
    try {
      const { Op } = require('sequelize');
      
      const result = await WhatsAppToken.update(
        { isActive: false },
        {
          where: {
            isActive: true,
            expiresAt: {
              [Op.lt]: new Date()
            }
          }
        }
      );

      const count = result[0];
      
      if (count > 0) {
        logger.info(`Cleaned up ${count} expired WhatsApp tokens`);
      }

      return count;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new WhatsAppTokenManager();

// Also export class for testing
module.exports.WhatsAppTokenManager = WhatsAppTokenManager;
