'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del método de pago (ej: "Efectivo", "Yape", "Transferencia Bancolombia")'
      },
      type: {
        type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'QR', 'ONLINE', 'OTHER'),
        allowNull: false,
        comment: 'Tipo de método de pago'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      requiresProof: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si requiere comprobante de pago'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Nombre del ícono'
      },
      bankInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Información bancaria para transferencias',
        defaultValue: {}
      },
      qrInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Información para pagos QR (Yape, Plin, etc)',
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Información adicional del método',
        defaultValue: {}
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden de visualización'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices
    await queryInterface.addIndex('payment_methods', ['businessId'], {
      name: 'idx_payment_methods_business_id'
    });

    await queryInterface.addIndex('payment_methods', ['businessId', 'isActive'], {
      name: 'idx_payment_methods_business_active'
    });

    await queryInterface.addIndex('payment_methods', ['type'], {
      name: 'idx_payment_methods_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_methods');
  }
};
