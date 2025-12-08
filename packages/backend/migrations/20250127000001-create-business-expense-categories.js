'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Crear tabla business_expense_categories
    await queryInterface.createTable('business_expense_categories', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'business_id'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la categoría (ej: Arriendo, Servicios públicos)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la categoría'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color hexadecimal para UI (#RRGGBB)'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Nombre del ícono para UI'
      },
      requiresReceipt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'requires_receipt',
        comment: 'Indica si esta categoría requiere comprobante obligatorio'
      },
      isRecurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_recurring',
        comment: 'Indica si es un gasto recurrente (ej: arriendo mensual)'
      },
      defaultAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        field: 'default_amount',
        comment: 'Monto por defecto para gastos recurrentes'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        field: 'is_active'
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        field: 'created_by'
      },
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

    // Crear índice único para (businessId, name)
    await queryInterface.addIndex('business_expense_categories', ['business_id', 'name'], {
      unique: true,
      name: 'unique_business_category_name'
    });

    // Crear índice para business_id
    await queryInterface.addIndex('business_expense_categories', ['business_id'], {
      name: 'idx_business_expense_categories_business_id'
    });

    // Crear índice para is_active
    await queryInterface.addIndex('business_expense_categories', ['is_active'], {
      name: 'idx_business_expense_categories_is_active'
    });

    console.log('✅ Tabla business_expense_categories creada exitosamente');
  },

  async down (queryInterface, Sequelize) {
    // Eliminar tabla
    await queryInterface.dropTable('business_expense_categories');
    
    console.log('✅ Tabla business_expense_categories eliminada');
  }
};
