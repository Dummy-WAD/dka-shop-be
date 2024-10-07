'use strict';

export default (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: DataTypes.STRING,
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    seen: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  notification.associate = (db) => {
    notification.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });
  }
  return notification;
};