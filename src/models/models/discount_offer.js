'use strict';

export default (sequelize, DataTypes) => {
  const discountOffer = sequelize.define('discountOffer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    discountValue: {
      type: DataTypes.DOUBLE,
      field: 'discount_value'
    },
    discountType: {
      type: DataTypes.STRING,
      field: 'discount_type'
    },
    startDate: {
      type: DataTypes.DATE,
      field: 'start_date'
    },
    expirationDate: {
      type: DataTypes.DATE,
      field: 'expiration_date'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: 'is_deleted'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'discount_offers',
    freezeTableName: true,
  });
  discountOffer.associate = (db) => {
    discountOffer.belongsToMany(db.product, { 
      through: db.productDiscountOffer,
      foreignKey: 'discountOfferId',
      constraints: false
    });
  }
  return discountOffer;
};