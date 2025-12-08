'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointment_payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      appointmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      paymentMethodId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'ID del método de pago de BusinessPaymentConfig.paymentMethods'
      },
      paymentMethodName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del método de pago (snapshot para historial)'
      },
      paymentMethodType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tipo del método de pago (CASH, CARD, TRANSFER, etc.)'
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Número de referencia o transacción'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre el pago'
      },
      proofUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL del comprobante de pago en Cloudinary'
      },
      proofType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Tipo MIME del comprobante (image/jpeg, application/pdf, etc.)'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'),
        defaultValue: 'COMPLETED',
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      registeredBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que registró el pago'
      },
      registeredByRole: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Rol del usuario que registró el pago (OWNER, RECEPTIONIST, SPECIALIST)'
      },
      receiptId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'receipts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Recibo generado automáticamente cuando el pago se completa'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Metadatos adicionales (IP, dispositivo, ubicación, etc.)'
      },
      onlinePaymentData: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Datos del pago online (Wompi, Stripe, etc.) si aplica'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para mejorar el rendimiento de las consultas
    await queryInterface.addIndex('appointment_payments', ['appointmentId'], {
      name: 'idx_appointment_payments_appointmentId'
    });

    await queryInterface.addIndex('appointment_payments', ['businessId'], {
      name: 'idx_appointment_payments_businessId'
    });

    await queryInterface.addIndex('appointment_payments', ['clientId'], {
      name: 'idx_appointment_payments_clientId'
    });

    await queryInterface.addIndex('appointment_payments', ['paymentDate'], {
      name: 'idx_appointment_payments_paymentDate'
    });

    await queryInterface.addIndex('appointment_payments', ['status'], {
      name: 'idx_appointment_payments_status'
    });

    await queryInterface.addIndex('appointment_payments', ['registeredBy'], {
      name: 'idx_appointment_payments_registeredBy'
    });

    // Índice compuesto para consultas de pagos por cita
    await queryInterface.addIndex('appointment_payments', ['appointmentId', 'status'], {
      name: 'idx_appointment_payments_appointment_status'
    });

    // Índice compuesto para reportes de pagos por negocio y fecha
    await queryInterface.addIndex('appointment_payments', ['businessId', 'paymentDate'], {
      name: 'idx_appointment_payments_business_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices primero
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_business_date');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_appointment_status');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_registeredBy');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_status');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_paymentDate');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_clientId');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_businessId');
    await queryInterface.removeIndex('appointment_payments', 'idx_appointment_payments_appointmentId');

    // Eliminar la tabla
    await queryInterface.dropTable('appointment_payments');
  }
};
