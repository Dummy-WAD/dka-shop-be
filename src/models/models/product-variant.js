'use strict';

module.exports = (sequelize, DataTypes) => {
  const productVariant = sequelize.define('productVariant', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    product_id: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  productVariant.associate = (db) => {
    productVariant.belongsTo(db.product, {
      foreignKey: 'product_id',
      constraints: false
    });
    productVariant.belongsToMany(db.order, { 
      through: db.orderItem,
			foreignKey: 'product_variant_id',
      constraints: false
    });
  };
  return productVariant;
};