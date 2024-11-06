'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'contact_name', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('orders', 'phone_number', {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'contact_name');
    await queryInterface.removeColumn('orders', 'phone_number');
  }
};
