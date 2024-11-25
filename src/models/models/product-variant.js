'use strict';

export default (sequelize, DataTypes) => {
  const productVariant = sequelize.define('productVariant', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id'
    },
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: DataTypes.STRING,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: 'is_deleted'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'product_variants',
    freezeTableName: true,
  });
  productVariant.associate = (db) => {
    productVariant.belongsTo(db.product, {
      foreignKey: 'productId',
      constraints: false
    });
    productVariant.belongsToMany(db.order, { 
      through: db.orderItem,
      foreignKey: 'productVariantId',
      constraints: false
    });
    productVariant.hasMany(db.cartItem, { 
      foreignKey: 'productVariantId',
      constraints: false
    });
  };
  return productVariant;
};