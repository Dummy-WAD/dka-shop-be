'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'type', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('notifications', 'artifact_id', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('notifications', 'type');
    await queryInterface.removeColumn('notifications', 'artifact_id');
  }
};
