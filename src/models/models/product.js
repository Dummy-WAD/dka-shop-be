'use strict';

module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define('product', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    description: DataTypes.TEXT,
    category_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  product.associate = (db) => {
    product.belongsTo(db.category);
    product.hasMany(db.productVariant, {
      foreignKey: 'product_id',
      constraints: false
    });
    product.belongsToMany(db.discountOffer, { 
      through: db.productDiscountOffer,
      foreignKey: 'product_id',
      constraints: false
    });
  }
  return product;
};