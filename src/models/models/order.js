'use strict';

export default (sequelize, DataTypes) => {
  const order = sequelize.define('order', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    customerId: {
      type: DataTypes.INTEGER,
      field: 'customer_id'
    },
    address: DataTypes.STRING,
    total: DataTypes.DOUBLE,
    deliveryFee: {
      type: DataTypes.DOUBLE,
      field: 'delivery_fee'
    },
    status: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    },
    packagedAt: {
      type: DataTypes.DATE,
      field: 'packaged_at'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      field: 'delivered_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    deliveryServiceId: {
      type: DataTypes.INTEGER,
      field: 'delivery_service_id',
    }
  });
  order.associate = (db) => {
    order.belongsTo(db.user, {
      foreignKey: 'customerId',
      constraints: false
    });
    order.belongsTo(db.deliveryService, {
      foreignKey: 'deliveryServiceId',
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