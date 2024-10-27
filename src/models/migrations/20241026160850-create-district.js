'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('districts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      name_en: {
        allowNull: false,
        type: Sequelize.STRING
      },
      province_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'provinces',
          key: 'id'
        }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('districts');
  }
};
