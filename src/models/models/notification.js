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
      field: 'customer_id'
    },
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    type: DataTypes.STRING,
    artifactId: {
      type: DataTypes.INTEGER,
      field: 'artifact_id'
    },
    seen: DataTypes.BOOLEAN,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  });
  notification.associate = (db) => {
    notification.belongsTo(db.user, {
      foreignKey: 'customer_id',
      as: 'customer'
    });
  }
  return notification;
};