'use strict';

import { AccountStatus, Gender, UserRole } from "../../utils/enums.js";

export default (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number'
    },
    gender: {
      type: DataTypes.ENUM,
      values: Object.values(Gender)
    },
    role: {
      type: DataTypes.ENUM,
      values: Object.values(UserRole)
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(AccountStatus)
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
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
      foreignKey: 'user_id',
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