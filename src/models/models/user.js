'use strict';

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    gender: DataTypes.BOOLEAN,
    role: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    register_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  user.associate = (db) => {
    user.hasMany(db.address, {
      foreignKey: 'customer_id',
      constraints: false
    });
    user.hasMany(db.order, {
        foreignKey: 'customer_id',
        constraints: false
    });
    user.hasMany(db.cartItem, {
      foreignKey: 'customer_id',
      constraints: false
    });
    user.hasMany(db.notification, {
        foreignKey: 'customer_id',
        constraints: false
    });
    user.hasMany(db.token, {
        foreignKey: 'user_id',
        constraints: false
    });
  }
  return user;
};