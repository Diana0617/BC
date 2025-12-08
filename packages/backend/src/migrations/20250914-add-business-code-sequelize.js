/**
 * Migración para agregar businessCode a la tabla businesses
 * Fecha: 2025-09-14
 * Propósito: Habilitar login móvil con código de negocio
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    try {
      // Verificar si la columna ya existe
      const tableInfo = await queryInterface.describeTable('businesses');
      
      if (!tableInfo.businessCode) {
        console.log('🔧 Agregando columna business_code a la tabla businesses');
        
        // Agregar la columna businessCode
        await queryInterface.addColumn('businesses', 'businessCode', {
          type: DataTypes.STRING(8),
          allowNull: true,
          unique: true,
          comment: 'Código único de 6-8 caracteres para login móvil (ej: ABC123)'
        });

        // Crear índice para búsquedas rápidas
        await queryInterface.addIndex('businesses', ['businessCode'], {
          name: 'idx_businesses_business_code',
          unique: true
        });

        console.log('✅ Columna businessCode agregada correctamente');
      } else {
        console.log('✅ La columna businessCode ya existe');
      }

      // Función para generar código único
      const generateBusinessCode = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        
        let code = '';
        // 3 letras
        for (let i = 0; i < 3; i++) {
          code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        // 3 números
        for (let i = 0; i < 3; i++) {
          code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return code;
      };

      // Obtener negocios sin código
      const [businesses] = await queryInterface.sequelize.query(
        'SELECT id FROM businesses WHERE "businessCode" IS NULL'
      );

      if (businesses.length > 0) {
        console.log(`🔧 Generando códigos para ${businesses.length} negocios existentes`);

        for (const business of businesses) {
          let attempts = 0;
          let success = false;

          while (!success && attempts < 10) {
            const newCode = generateBusinessCode();
            
            try {
              await queryInterface.sequelize.query(
                'UPDATE businesses SET "businessCode" = :code WHERE id = :id',
                {
                  replacements: { code: newCode, id: business.id },
                  type: queryInterface.sequelize.QueryTypes.UPDATE
                }
              );
              success = true;
              console.log(`✅ Código ${newCode} asignado al negocio ${business.id}`);
            } catch (error) {
              if (error.name === 'SequelizeUniqueConstraintError') {
                attempts++;
                console.log(`⚠️ Código ${newCode} ya existe, reintentando (${attempts}/10)`);
              } else {
                throw error;
              }
            }
          }

          if (!success) {
            console.error(`❌ No se pudo generar código único para el negocio ${business.id}`);
          }
        }
      } else {
        console.log('✅ Todos los negocios ya tienen códigos asignados');
      }

      console.log('✅ Migración businessCode completada correctamente');
    } catch (error) {
      console.error('❌ Error en migración businessCode:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Eliminar índice
      await queryInterface.removeIndex('businesses', 'idx_businesses_business_code');
      console.log('✅ Índice business_code eliminado');
    } catch (error) {
      console.log('⚠️ Error eliminando índice (puede que no exista):', error.message);
    }

    try {
      // Eliminar columna
      await queryInterface.removeColumn('businesses', 'businessCode');
      console.log('✅ Columna businessCode eliminada');
    } catch (error) {
      console.log('⚠️ Error eliminando columna:', error.message);
    }
  }
};