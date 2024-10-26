'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
        queryInterface.removeColumn('addresses', 'commune'),
        queryInterface.removeColumn('addresses', 'district'),
        queryInterface.removeColumn('addresses', 'province'),

        queryInterface.addColumn('addresses', 'ward_id', {
            type: Sequelize.STRING
        }),

        queryInterface.renameColumn('addresses', 'createdAt', 'created_at'),
        queryInterface.renameColumn('addresses', 'updatedAt', 'updated_at')
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
        queryInterface.addColumn('addresses', 'commune', {
            type: Sequelize.STRING
        }),
        queryInterface.addColumn('addresses', 'district', {
            type: Sequelize.STRING
        }),
        queryInterface.addColumn('addresses', 'province', {
            type: Sequelize.STRING
        }),

        queryInterface.removeColumn('addresses', 'ward_id'),

        queryInterface.renameColumn('addresses', 'created_at', 'createdAt'),
        queryInterface.renameColumn('addresses', 'updated_at', 'updatedAt')
    ]);
  }
};
