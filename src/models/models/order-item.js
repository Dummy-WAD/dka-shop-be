'use strict';

export default (sequelize, DataTypes) => {
  const orderItem = sequelize.define('orderItem', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    orderId: {
      type: DataTypes.INTEGER,
      field: 'order_id'
    },
    productVariantId: {
      type: DataTypes.INTEGER,
      field: 'product_variant_id'
    },
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
      foreignKey: 'orderId',
      constraints: false
    });
    orderItem.belongsTo(db.productVariant, {
      foreignKey: 'productVariantId',
      constraints: false
    })
  }
  return orderItem;
};