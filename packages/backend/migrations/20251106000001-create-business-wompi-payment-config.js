'use strict';

/**
 * Migration: Create business_wompi_payment_config table
 * 
 * Esta tabla almacena la configuración de Wompi para cada Business,
 * permitiéndoles recibir pagos de sus clientes por turnos online.
 * 
 * IMPORTANTE: Completamente separado del sistema de suscripciones BC.
 * Cada Business tiene sus propias credenciales de Wompi.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_wompi_payment_configs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      
      // Relación con Business
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // Un Business solo puede tener una configuración
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Si se elimina el Business, se elimina su config
        field: 'business_id'
      },
      
      // ==========================================
      // CREDENCIALES DE TEST (Sandbox)
      // ==========================================
      
      testPublicKey: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Clave pública de Wompi para ambiente de pruebas (sin encriptar)',
        field: 'test_public_key'
      },
      
      testPrivateKeyEncrypted: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Clave privada de Wompi para ambiente de pruebas (ENCRIPTADA con AES-256-GCM)',
        field: 'test_private_key_encrypted'
      },
      
      testIntegritySecretEncrypted: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Secreto de integridad de Wompi para ambiente de pruebas (ENCRIPTADO)',
        field: 'test_integrity_secret_encrypted'
      },
      
      // ==========================================
      // CREDENCIALES DE PRODUCCIÓN
      // ==========================================
      
      prodPublicKey: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Clave pública de Wompi para ambiente de producción (sin encriptar)',
        field: 'prod_public_key'
      },
      
      prodPrivateKeyEncrypted: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Clave privada de Wompi para ambiente de producción (ENCRIPTADA)',
        field: 'prod_private_key_encrypted'
      },
      
      prodIntegritySecretEncrypted: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Secreto de integridad de Wompi para ambiente de producción (ENCRIPTADO)',
        field: 'prod_integrity_secret_encrypted'
      },
      
      // ==========================================
      // CONFIGURACIÓN
      // ==========================================
      
      isTestMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Por defecto inicia en modo test
        comment: 'true = modo test (sandbox), false = modo producción',
        field: 'is_test_mode'
      },
      
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Por defecto inactivo hasta verificar
        comment: 'true = configuración activa y lista para recibir pagos',
        field: 'is_active'
      },
      
      webhookUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL del webhook para recibir notificaciones de Wompi',
        field: 'webhook_url'
      },
      
      // ==========================================
      // VERIFICACIÓN
      // ==========================================
      
      verificationStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la última verificación de credenciales',
        field: 'verification_status'
      },
      
      verificationError: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error de la última verificación (si falló)',
        field: 'verification_error'
      },
      
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de la última verificación exitosa',
        field: 'verified_at'
      },
      
      // ==========================================
      // AUDITORÍA
      // ==========================================
      
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    // ==========================================
    // ÍNDICES
    // ==========================================
    
    // Índice único en businessId para búsquedas rápidas y garantizar unicidad
    await queryInterface.addIndex('business_wompi_payment_configs', ['business_id'], {
      name: 'idx_business_wompi_payment_config_business_id',
      unique: true
    });
    
    // Índice para búsquedas por estado de verificación
    await queryInterface.addIndex('business_wompi_payment_configs', ['verification_status'], {
      name: 'idx_business_wompi_payment_config_verification_status'
    });
    
    // Índice para búsquedas de configuraciones activas
    await queryInterface.addIndex('business_wompi_payment_configs', ['is_active'], {
      name: 'idx_business_wompi_payment_config_is_active'
    });
    
    // Índice compuesto para búsquedas de configs activas y verificadas
    await queryInterface.addIndex('business_wompi_payment_configs', ['business_id', 'is_active', 'verification_status'], {
      name: 'idx_business_wompi_payment_config_active_verified'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices primero
    await queryInterface.removeIndex('business_wompi_payment_configs', 'idx_business_wompi_payment_config_business_id');
    await queryInterface.removeIndex('business_wompi_payment_configs', 'idx_business_wompi_payment_config_verification_status');
    await queryInterface.removeIndex('business_wompi_payment_configs', 'idx_business_wompi_payment_config_is_active');
    await queryInterface.removeIndex('business_wompi_payment_configs', 'idx_business_wompi_payment_config_active_verified');
    
    // Eliminar tabla
    await queryInterface.dropTable('business_wompi_payment_configs');
  }
};
