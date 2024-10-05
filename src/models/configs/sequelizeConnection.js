const { Sequelize } = require('sequelize');
const dbConfig = require('../../config/config')

const { host, name, user, password } = dbConfig.databaseCf;

const sequelize = new Sequelize(name, user, password, {
  host: host,
  dialect: 'mysql',
  logging: (msg) => console.log(`SQL: ${msg}`),
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = sequelize;
