'use strict';

module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('category', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  category.associate = ((db) => {
    category.hasMany(db.productVariant, {
      foreignKey: 'product_id',
      constraints: false
    })
  })
  return category;
};