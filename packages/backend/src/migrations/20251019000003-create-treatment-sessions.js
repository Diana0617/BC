'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('treatment_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      treatmentPlanId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'treatment_plans',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      appointmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'appointments',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      sessionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'),
        defaultValue: 'PENDING',
        allowNull: false
      },
      scheduledDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedDate: {
        type: Sequelize.DATE,
        allowNull: true
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
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      photosUrls: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      metadata: {
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
    await queryInterface.addIndex('treatment_sessions', ['treatmentPlanId'], {
      name: 'idx_treatment_sessions_plan'
    });
    
    await queryInterface.addIndex('treatment_sessions', ['appointmentId'], {
      name: 'idx_treatment_sessions_appointment'
    });
    
    await queryInterface.addIndex('treatment_sessions', ['status'], {
      name: 'idx_treatment_sessions_status'
    });
    
    await queryInterface.addIndex('treatment_sessions', ['specialistId'], {
      name: 'idx_treatment_sessions_specialist'
    });
    
    // Índice compuesto para búsquedas frecuentes
    await queryInterface.addIndex('treatment_sessions', ['treatmentPlanId', 'sessionNumber'], {
      name: 'idx_treatment_sessions_plan_number',
      unique: true // Asegura que no haya sesiones duplicadas en un plan
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('treatment_sessions');
    
    // Eliminar el ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_treatment_sessions_status";');
  }
};
