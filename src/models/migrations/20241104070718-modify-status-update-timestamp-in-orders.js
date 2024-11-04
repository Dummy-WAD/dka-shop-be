'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'ordered_at');
    await queryInterface.renameColumn('orders', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('orders', 'createdAt', 'created_at');
    await queryInterface.addColumn('orders', 'packaged_at', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('orders', 'delivered_at', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('orders', 'completed_at', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('orders', 'delivery_service_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'delivery_services',
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'ordered_at', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('orders', 'updatedAt', {
      type: Sequelize.DATE
    });
    await queryInterface.renameColumn('orders', 'created_at', 'createdAt');
    await queryInterface.removeColumn('orders', 'packaged_at');
    await queryInterface.removeColumn('orders', 'delivered_at');
    await queryInterface.removeColumn('orders', 'completed_at');
    await queryInterface.removeColumn('orders', 'delivery_service_id');
  }
};
