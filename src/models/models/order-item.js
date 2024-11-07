'use strict';

export default (sequelize, DataTypes) => {
  const orderItem = sequelize.define('orderItem', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    order_id: DataTypes.INTEGER,
    product_variant_id: DataTypes.INTEGER,
    productName: {
      type: DataTypes.STRING,
      field: 'product_name'
    },
    price: DataTypes.DOUBLE,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  }, {
    tableName: 'order_items',
    freezeTableName: true,
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