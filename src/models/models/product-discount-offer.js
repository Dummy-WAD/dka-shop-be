'use strict';

export default (sequelize, DataTypes) => {
  const productDiscountOffer = sequelize.define('productDiscountOffer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    discount_offer_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });
  productDiscountOffer.associate = (db) => {
    productDiscountOffer.belongsTo(db.product, {
      foreignKey: 'product_id',
      constraints: false
    });
    productDiscountOffer.belongsTo(db.discountOffer, {
      foreignKey: 'discount_offer_id',
      constraints: false
    });
  };
  return productDiscountOffer;
};