'use strict';

export default (sequelize, DataTypes) => {
  const productImage = sequelize.define('productImage', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    product_id: DataTypes.INTEGER,
    image_url: DataTypes.TEXT,
    type: DataTypes.TEXT('medium'),
    is_primary: DataTypes.BOOLEAN
  },
  {
    tableName: 'product_images',
    freezeTableName: true,
  });
  productImage.associate = (db) => {
    productImage.belongsTo(db.product, {
      foreignKey: 'product_id',
      constraints: false
    });
  };
  return productImage;
};