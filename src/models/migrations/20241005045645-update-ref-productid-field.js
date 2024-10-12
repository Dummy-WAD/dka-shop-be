'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_images', 'product_id');

    await queryInterface.addColumn('product_images', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_images', 'product_id');

    await queryInterface.addColumn('product_images', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'product_variants',
        key: 'id',
      },
    });
  },
};
