'use strict';

export default (sequelize, DataTypes) => {
  const review = sequelize.define('review', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    orderItemId: {
      type: DataTypes.INTEGER,
      field: 'order_item_id'
    },
    rating: DataTypes.INTEGER,
    reviewText: {
      type: DataTypes.STRING(255),
      field: 'review_text'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    },
  });
  review.associate = (db) => {
    review.belongsTo(db.orderItem, {
      foreignKey: 'orderItemId',
      constraints: false
    });
  };

  return review;
};