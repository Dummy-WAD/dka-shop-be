'use strict';

export default (sequelize, DataTypes) => {
  const productDiscountOffer = sequelize.define('productDiscountOffer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    discountOfferId: {
      type: DataTypes.INTEGER,
      field: 'discount_offer_id'
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },{
    tableName: 'product_discount_offers',
    freezeTableName: true,
  });
  productDiscountOffer.associate = (db) => {
    productDiscountOffer.belongsTo(db.product, {
      foreignKey: 'productId',
      constraints: false
    });
    productDiscountOffer.belongsTo(db.discountOffer, {
      foreignKey: 'discountOfferId',
      constraints: false
    });
  };
  return productDiscountOffer;
};