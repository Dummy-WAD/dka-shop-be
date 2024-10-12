'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      id: '1',
      first_name: 'Diem',
      last_name: 'Nguyen Hong',
      email: 'hongdiem@gmail.com',
      password: '$2y$10$Yt.Sr23ztKnR9mpSDWiTlOVrtUqfHnBL78GzRWWS2aNxAMOyH/po6', //Hongdiem@123
      phone_number: '0353905691',
      gender: false,
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      first_name: 'Ha',
      last_name: 'Nguyen Phuong',
      email: 'phuongha@gmail.com',
      password: '$2y$10$GG1tU1gW604acjiqVox9teUzSWWJnVTwbkz5vP1/6ju9W4bSGsrrm', //Phuongha@123
      phone_number: '0353905692',
      gender: false,
      role: 'CUSTOMER',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '3',
      first_name: 'Nhi',
      last_name: 'Le Nguyen Yen',
      email: 'yanni@gmail.com',
      password: '$2y$10$EEkNLeeVwtAZmMnN2s8Zl.Z28tvzfYM6WUa4Y703QdwbVgVZmP4Oe', //Yanni@123
      phone_number: '0353903691',
      gender: false,
      role: 'CUSTOMER',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
