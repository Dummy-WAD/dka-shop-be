'use strict';

export default (sequelize, DataTypes) => {
  const cartItem = sequelize.define('cartItem', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: DataTypes.INTEGER,
    product_variant_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  });
  cartItem.associate = (db) => {
    cartItem.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });
  }
  return cartItem;
};