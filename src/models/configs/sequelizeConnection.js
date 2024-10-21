import { Sequelize } from 'sequelize';
import dbConfig from '../../config/config.js';

const { host, name, user, password } = dbConfig.databaseCf;

const sequelize = new Sequelize(name, user, password, {
  host: host,
  dialect: 'mysql',
  logging: (msg) => console.log(`SQL: ${msg}`)
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;
