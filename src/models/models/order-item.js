'use strict';

module.exports = (sequelize, DataTypes) => {
  const orderItem = sequelize.define('orderItem', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    order_id: DataTypes.INTEGER,
    product_variant_id: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    quantity: DataTypes.INTEGER
  });
  orderItem.associate = (db) => {
    orderItem.belongsTo(db.order, {
      foreignKey: 'order_id',
      constraints: false
    });
    orderItem.belongsTo(db.productVariant, {
      foreignKey: 'product_variant_id',
      constraints: false
    })
  }
  return orderItem;
};