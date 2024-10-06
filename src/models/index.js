const Sequelize = require('sequelize');
const sequelize = require('./configs/sequelizeConnection'); 

const db = {};

db.User = require('./models/user')(sequelize, Sequelize.DataTypes);
db.Token = require('./models/token')(sequelize, Sequelize.DataTypes);
db.Category = require('./models/category')(sequelize, Sequelize.DataTypes);

module.exports = db;
