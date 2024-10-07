import Sequelize from 'sequelize';
import sequelize from './configs/sequelizeConnection.js'; 

const db = {};

import userModel from './models/user.js';
import tokenModel from './models/token.js';
import categoryModel from './models/category.js';

db.User = userModel(sequelize, Sequelize.DataTypes);
db.Token = tokenModel(sequelize, Sequelize.DataTypes);
db.Category = categoryModel(sequelize, Sequelize.DataTypes);

export default db;
