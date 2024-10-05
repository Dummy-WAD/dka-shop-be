'use strict';

module.exports = (sequelize, DataTypes) => {
  const cartItem = sequelize.define('cartItem', {
    user_id: DataTypes.INTEGER,
    product_variant_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  });
  user.associate = (db) => {
    user.belongsTo(db.user, {
      foreignKey: 'user_id',
      constraints: false
    });
  }
  return cartItem;
};