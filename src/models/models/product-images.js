'use strict';

module.exports = (sequelize, DataTypes) => {
  const productImage = sequelize.define('productImage', {
    product_id: DataTypes.INTEGER,
    type: DataTypes.TEXT('medium'),
    is_primary: DataTypes.BOOLEAN
  });
  productImage.associate = (db) => {
    productImage.belongsTo(db.product, {
      foreignKey: 'product_id',
      constraints: false
    });
  };
  return productImage;
};