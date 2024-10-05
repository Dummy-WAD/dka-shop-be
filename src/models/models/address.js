'use strict';

module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define('address', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    customer_id: DataTypes.INTEGER,
    local_address: DataTypes.STRING,
    commune: DataTypes.STRING,
    district: DataTypes.STRING,
    province: DataTypes.STRING,
    is_default: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  address.associate = (db) => {
    address.belongsTo(db.user, {
      foreignKey: 'customer_id',
      constraints: false
    });
  }
  return address;
};