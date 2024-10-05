'use strict';

module.exports = (sequelize, DataTypes) => {
  const discountOffer = sequelize.define('discountOffer', {
    discount_value: DataTypes.DOUBLE,
    discount_type: DataTypes.STRING,
    start_date: DataTypes.DATE,
    expiration_date: DataTypes.DATE,
    is_deleted: DataTypes.BOOLEAN
  });
  discountOffer.associate((db) => {
    discountOffer.belongsToMany(db.product, { 
      through: productDiscountOffer,
      foreignKey: 'discount_offer_id',
      constraints: false
    });
  })
  return discount - offer;
};