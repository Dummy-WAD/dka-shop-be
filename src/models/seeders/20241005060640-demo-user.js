'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      id: '1',
      first_name: 'Diem',
      last_name: 'Nguyen Hong',
      email: 'hongdiem@gmail.com',
      password: '$2y$10$JoUk3CksW9J.b6OOBF21PeN8JyeIh/fNxTM5qwHBc/0qu/DnNHXDu', //hongdiem@123
      phone_number: '0353905691',
      gender: false,
      role: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '2',
      first_name: 'Ha',
      last_name: 'Nguyen Phuong',
      email: 'phuongha@gmail.com',
      password: '$2y$10$NVdVT5fdzPLiHpUK9c95geYV3L51IzrgnRuDIoHus.TalwidmFfzW', //phuongha@123
      phone_number: '0353905692',
      gender: false,
      role: 'Staff',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '3',
      first_name: 'Nhi',
      last_name: 'Le Nguyen Yen',
      email: 'yanni@gmail.com',
      password: '$2y$10$oivvL6JAp42cZudm5ztqQOHMM0cAfYX910GnMwE404svhM7Z4gvEu', //yanni@123
      phone_number: '0353903691',
      gender: false,
      role: 'Staff',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
