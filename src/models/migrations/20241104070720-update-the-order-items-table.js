'use strict';
/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_items', 'size', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('order_items', 'color', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('order_items', 'product_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.renameColumn('order_items', 'createdAt', 'created_at');
    await queryInterface.renameColumn('order_items', 'updatedAt', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_items', 'size');
    await queryInterface.removeColumn('order_items', 'color');
    await queryInterface.removeColumn('order_items', 'product_name');
    
    await queryInterface.renameColumn('order_items', 'created_at', 'createdAt');
    await queryInterface.renameColumn('order_items', 'updated_at', 'updatedAt');
  }
};
