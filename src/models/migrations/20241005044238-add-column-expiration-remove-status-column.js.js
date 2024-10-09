'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tokens', 'expiration_date', {
      type: Sequelize.DATE,
    });

    await queryInterface.removeColumn('tokens', 'status');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tokens', 'status', {
      type: Sequelize.STRING(30),
      allowNull: true
    });

    await queryInterface.removeColumn('tokens', 'expiration');
  }
};
