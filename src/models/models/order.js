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
    contactName: {
      type: DataTypes.STRING,
      field: 'contact_name'
    },
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number'
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
    cancelledAt: {
      type: DataTypes.DATE,
      field: 'cancelled_at'
    },
    deliveryServiceId: {
      type: DataTypes.INTEGER,
      field: 'delivery_service_id',
    },
    cancelReason: {
      type: DataTypes.STRING,
      field: 'cancel_reason'
    },
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
      foreignKey: 'orderId',
      constraints: false
    });
  }
  return order;
};