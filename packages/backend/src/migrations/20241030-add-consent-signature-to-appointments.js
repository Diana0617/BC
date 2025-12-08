'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'consentSignatureId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'consent_signatures',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Firma de consentimiento asociada a esta cita'
    });

    // Crear índice para mejorar performance de consultas
    await queryInterface.addIndex('appointments', ['consentSignatureId'], {
      name: 'appointments_consent_signature_id_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('appointments', 'appointments_consent_signature_id_idx');
    await queryInterface.removeColumn('appointments', 'consentSignatureId');
  }
};
