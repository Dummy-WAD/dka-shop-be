'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'address_id');
    await queryInterface.addColumn('orders', 'address', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'address_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id'
      }
    });
    await queryInterface.removeColumn('orders', 'address');
  }
};
