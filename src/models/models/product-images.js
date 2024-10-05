'use strict';

module.exports = (sequelize, DataTypes) => {
  const productImage = sequelize.define('productImage', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
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