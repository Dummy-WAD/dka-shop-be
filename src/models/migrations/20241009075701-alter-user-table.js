'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'createdAt', 'created_at');
    queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
    queryInterface.removeColumn('users', 'register_at');
  },

  async down (queryInterface, Sequelize) {
    queryInterface.renameColumn('users', 'created_at', 'createdAt');
    queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
    queryInterface.addColumn('users', 'register_at', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

  }
};
