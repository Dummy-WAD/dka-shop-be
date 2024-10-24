'use strict';

export default (sequelize, DataTypes) => {
  const productImage = sequelize.define('productImage', {
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
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url'
    },
    // type: DataTypes.TEXT('medium'),
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    }
  },
  {
    tableName: 'product_images',
    freezeTableName: true,
  });
  productImage.associate = (db) => {
    productImage.belongsTo(db.product, {
      foreignKey: 'productId',
      constraints: false
    });
  };
  return productImage;
};