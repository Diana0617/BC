'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar columna required_module a la tabla rule_templates
    await queryInterface.addColumn('rule_templates', 'required_module', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Nombre del módulo requerido para usar esta regla (ej: facturacion_electronica, gestion_de_turnos)'
    });

    console.log('✅ Columna required_module agregada a rule_templates');
  },

  async down (queryInterface, Sequelize) {
    // Revertir: eliminar la columna required_module
    await queryInterface.removeColumn('rule_templates', 'required_module');
    
    console.log('✅ Columna required_module eliminada de rule_templates');
  }
};
