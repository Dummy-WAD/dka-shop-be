'use strict';

import { ConfirmationTokenStatus } from "../../utils/enums.js";

export default (sequelize, DataTypes) => {
  const confirmationToken = sequelize.define('confirmationToken', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    confirmationToken: {
      type: DataTypes.STRING,
      field: 'confirmation_token'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    status: {
        type: DataTypes.ENUM,
        values: Object.values(ConfirmationTokenStatus)
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
    }
  },
  {
    tableName: 'confirmation_tokens',
    freezeTableName: true,
  });
  confirmationToken.associate = (db) => {
    confirmationToken.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });
  }
  return confirmationToken;
};