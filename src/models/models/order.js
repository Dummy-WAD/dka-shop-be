'use strict';

export default (sequelize, DataTypes) => {
  const order = sequelize.define('order', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    customer_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    ordered_at: DataTypes.DATE,
    total: DataTypes.DOUBLE,
    delivery_fee: DataTypes.DOUBLE,
    status: DataTypes.STRING
  });
  order.associate = (db) => {
    order.belongsTo(db.user, {
      foreignKey: 'customer_id',
      constraints: false
    });
    order.belongsTo(db.address, {
      foreignKey: 'address_id',
      constraints: false
    });
    order.belongsToMany(db.productVariant, { 
      through: db.orderItem,
      foreignKey: 'order_id',
      constraints: false
    });
  }
  return order;
};