'use strict';

module.exports = (sequelize, DataTypes) => {
  const discountOffer = sequelize.define('discountOffer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    discount_value: DataTypes.DOUBLE,
    discount_type: DataTypes.STRING,
    start_date: DataTypes.DATE,
    expiration_date: DataTypes.DATE,
    is_deleted: DataTypes.BOOLEAN
  });
  discountOffer.associate = (db) => {
    discountOffer.belongsToMany(db.product, { 
      through: db.productDiscountOffer,
      foreignKey: 'discount_offer_id',
      constraints: false
    });
  }
  return discount - offer;
};