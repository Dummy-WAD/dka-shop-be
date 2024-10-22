'use strict';

export default (sequelize, DataTypes) => {
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
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: 'is_deleted'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  product.associate = (db) => {
    product.belongsTo(db.category, {
      foreignKey: 'categoryId',
      targetKey: 'id',
    });
    product.hasMany(db.productVariant, {
      foreignKey: 'productId',
      constraints: false
    });
    product.belongsToMany(db.discountOffer, { 
      through: db.productDiscountOffer,
      foreignKey: 'productId',
      constraints: false
    });
    product.hasMany(db.productImage, {
      foreignKey: 'productId',
      constraints: false
    });
  }
  return product;
};