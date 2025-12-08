/**
 * Corrección de sintaxis SQL para wompiPaymentReference
 * Separa la modificación de tipo y la restricción unique
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    
    try {
      // Verificar si la columna existe
      const tableInfo = await queryInterface.describeTable('appointments');
      
      if (tableInfo.wompiPaymentReference) {
        console.log('✅ La columna wompiPaymentReference ya existe');
        
        // Verificar si ya tiene la restricción unique
        const indexes = await queryInterface.showIndex('appointments');
        const hasUniqueIndex = indexes.some(index => 
          index.unique && index.fields.some(field => field.attribute === 'wompiPaymentReference')
        );
        
        if (!hasUniqueIndex) {
          console.log('🔧 Añadiendo restricción unique a wompiPaymentReference');
          await queryInterface.addIndex('appointments', ['wompiPaymentReference'], {
            unique: true,
            name: 'appointments_wompi_payment_reference_unique'
          });
        } else {
          console.log('✅ La restricción unique ya existe para wompiPaymentReference');
        }
      } else {
        console.log('🔧 Creando columna wompiPaymentReference');
        await queryInterface.addColumn('appointments', 'wompiPaymentReference', {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
          comment: 'Referencia única del pago adelantado en Wompi'
        });
      }
      
      console.log('✅ Migración wompiPaymentReference completada correctamente');
    } catch (error) {
      console.error('❌ Error en migración wompiPaymentReference:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Eliminar la restricción unique
      await queryInterface.removeIndex('appointments', 'appointments_wompi_payment_reference_unique');
      console.log('✅ Restricción unique eliminada de wompiPaymentReference');
    } catch (error) {
      console.log('⚠️ Error eliminando restricción unique (puede que no exista):', error.message);
    }
  }
};