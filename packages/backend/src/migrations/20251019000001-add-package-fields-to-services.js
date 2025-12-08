'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('services', 'isPackage', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('services', 'packageType', {
      type: Sequelize.ENUM('SINGLE', 'MULTI_SESSION', 'WITH_MAINTENANCE'),
      defaultValue: 'SINGLE',
      allowNull: false
    });

    await queryInterface.addColumn('services', 'packageConfig', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('services', 'totalPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('services', 'allowPartialPayment', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('services', 'pricePerSession', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('services', 'pricePerSession');
    await queryInterface.removeColumn('services', 'allowPartialPayment');
    await queryInterface.removeColumn('services', 'totalPrice');
    await queryInterface.removeColumn('services', 'packageConfig');
    await queryInterface.removeColumn('services', 'packageType');
    await queryInterface.removeColumn('services', 'isPackage');
    
    // Eliminar el ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_services_packageType";');
  }
};
