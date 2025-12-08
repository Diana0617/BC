'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'reminderSent', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Si se envió recordatorio de WhatsApp'
    });

    await queryInterface.addColumn('appointments', 'reminderSentAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha y hora de envío del recordatorio'
    });

    await queryInterface.addColumn('appointments', 'reminderMessageId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ID del mensaje de WhatsApp enviado'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'reminderSent');
    await queryInterface.removeColumn('appointments', 'reminderSentAt');
    await queryInterface.removeColumn('appointments', 'reminderMessageId');
  }
};
