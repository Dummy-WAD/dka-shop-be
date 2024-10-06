'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING(50), 
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50), 
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(50), 
        allowNull: false,
        unique: true 
      },
      password: {
        type: Sequelize.TEXT('medium'), 
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(15), 
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(20), 
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(10), 
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      register_at: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
