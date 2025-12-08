/**
 * Migración para crear tabla specialist_services
 * Fecha: 2025-09-27
 * Propósito: Permitir configuración personalizada de servicios por especialista
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    try {
      // Verificar si la tabla ya existe
      const tableExists = await queryInterface.tableExists('specialist_services');

      if (!tableExists) {
        console.log('🔧 Creando tabla specialist_services');

        // Crear la tabla specialist_services
        await queryInterface.createTable('specialist_services', {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
          },
          specialistId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          serviceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
              model: 'services',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
              min: 15,
              max: 480
            },
            comment: 'Duración en minutos'
          },
          price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
              min: 0
            },
            comment: 'Precio específico para este especialista'
          },
          isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas adicionales sobre la configuración'
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
          }
        });

        // Crear índices únicos y de búsqueda
        await queryInterface.addIndex('specialist_services', ['specialistId', 'serviceId'], {
          name: 'idx_specialist_services_unique',
          unique: true
        });

        await queryInterface.addIndex('specialist_services', ['specialistId'], {
          name: 'idx_specialist_services_specialist'
        });

        await queryInterface.addIndex('specialist_services', ['serviceId'], {
          name: 'idx_specialist_services_service'
        });

        await queryInterface.addIndex('specialist_services', ['isActive'], {
          name: 'idx_specialist_services_active'
        });

        console.log('✅ Tabla specialist_services creada correctamente');
      } else {
        console.log('✅ La tabla specialist_services ya existe');
      }

    } catch (error) {
      console.error('❌ Error creando tabla specialist_services:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔧 Eliminando tabla specialist_services');

      // Eliminar índices
      await queryInterface.removeIndex('specialist_services', 'idx_specialist_services_unique');
      await queryInterface.removeIndex('specialist_services', 'idx_specialist_services_specialist');
      await queryInterface.removeIndex('specialist_services', 'idx_specialist_services_service');
      await queryInterface.removeIndex('specialist_services', 'idx_specialist_services_active');

      // Eliminar tabla
      await queryInterface.dropTable('specialist_services');

      console.log('✅ Tabla specialist_services eliminada correctamente');
    } catch (error) {
      console.error('❌ Error eliminando tabla specialist_services:', error);
      throw error;
    }
  }
};