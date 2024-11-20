'use strict';

export default (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    customerId: {
      type: DataTypes.INTEGER,
      field: 'customer_id',
      defaultValue: 1
    },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    type: DataTypes.STRING,
    artifactId: {
      type: DataTypes.INTEGER,
      field: 'artifact_id'
    },
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt'
    }
  });
  notification.associate = (db) => {
    notification.belongsTo(db.user, {
      foreignKey: 'customerId',
      container: false
    });
  }
  return notification;
};