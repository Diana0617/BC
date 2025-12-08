'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Make supplierId nullable (for initial stock items)
    await queryInterface.changeColumn('supplier_catalog_items', 'supplierId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 2. Drop old unique constraint (supplierId + supplierSku)
    await queryInterface.removeConstraint(
      'supplier_catalog_items',
      'unique_supplier_sku'
    );

    // 3. Add new unique constraint (businessId + supplierSku)
    await queryInterface.addConstraint('supplier_catalog_items', {
      fields: ['businessId', 'supplierSku'],
      type: 'unique',
      name: 'supplier_catalog_items_businessId_supplierSku_key'
    });

    // 4. Add index on businessId for query performance (if not exists)
    const indexes = await queryInterface.showIndex('supplier_catalog_items');
    const hasBusinessIdIndex = indexes.some(idx => idx.name === 'supplier_catalog_items_businessId_idx');
    
    if (!hasBusinessIdIndex) {
      await queryInterface.addIndex('supplier_catalog_items', ['businessId'], {
        name: 'supplier_catalog_items_businessId_idx'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse operations
    const indexes = await queryInterface.showIndex('supplier_catalog_items');
    const hasBusinessIdIndex = indexes.some(idx => idx.name === 'supplier_catalog_items_businessId_idx');
    
    if (hasBusinessIdIndex) {
      await queryInterface.removeIndex('supplier_catalog_items', 'supplier_catalog_items_businessId_idx');
    }
    
    await queryInterface.removeConstraint(
      'supplier_catalog_items',
      'supplier_catalog_items_businessId_supplierSku_key'
    );

    await queryInterface.addConstraint('supplier_catalog_items', {
      fields: ['supplierId', 'supplierSku'],
      type: 'unique',
      name: 'unique_supplier_sku'
    });

    await queryInterface.changeColumn('supplier_catalog_items', 'supplierId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
