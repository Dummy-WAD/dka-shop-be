'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('addresses', 'phone_number', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('addresses', 'contact_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('addresses', 'phone_number');
    await queryInterface.removeColumn('addresses', 'contact_name');
  }
};
