'use strict';

export default (sequelize, DataTypes) => {
  const cartItem = sequelize.define('cartItem', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    productVariantId: {
      type: DataTypes.INTEGER,
      field: 'product_variant_id'
    },
    quantity: DataTypes.INTEGER
  }, {
    tableName: 'cart_items',
    freezeTableName: true,
  });
  cartItem.associate = (db) => {
    cartItem.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });

    cartItem.belongsTo(db.productVariant, {
      foreignKey: 'productVariantId',
      constraints: false
    });
  }
  return cartItem;
};