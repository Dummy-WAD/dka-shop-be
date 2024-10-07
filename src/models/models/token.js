'use strict';

export default (sequelize, DataTypes) => {
  const token = sequelize.define('token', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    refresh_token: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  token.associate = (db) => {
    token.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });
  }
  return token;
};