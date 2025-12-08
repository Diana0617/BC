'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('treatment_plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      specialistId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      planType: {
        type: Sequelize.ENUM('MULTI_SESSION', 'WITH_MAINTENANCE'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'),
        defaultValue: 'ACTIVE',
        allowNull: false
      },
      totalSessions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      completedSessions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paidAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      paymentPlan: {
        type: Sequelize.ENUM('FULL_UPFRONT', 'PER_SESSION', 'INSTALLMENTS'),
        defaultValue: 'FULL_UPFRONT',
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expectedEndDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actualEndDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // Índices para mejorar performance
    await queryInterface.addIndex('treatment_plans', ['clientId'], {
      name: 'idx_treatment_plans_client'
    });
    
    await queryInterface.addIndex('treatment_plans', ['businessId'], {
      name: 'idx_treatment_plans_business'
    });
    
    await queryInterface.addIndex('treatment_plans', ['specialistId'], {
      name: 'idx_treatment_plans_specialist'
    });
    
    await queryInterface.addIndex('treatment_plans', ['status'], {
      name: 'idx_treatment_plans_status'
    });
    
    await queryInterface.addIndex('treatment_plans', ['serviceId'], {
      name: 'idx_treatment_plans_service'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('treatment_plans');
    
    // Eliminar los ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_treatment_plans_planType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_treatment_plans_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_treatment_plans_paymentPlan";');
  }
};
