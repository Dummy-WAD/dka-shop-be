'use strict';

export default (sequelize, DataTypes) => {
  const address = sequelize.define('address', {
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
    localAddress: {
      type: DataTypes.STRING,
      field: 'local_address'
    },
    wardId: {
      type: DataTypes.STRING,
      field: 'ward_id'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
        field: 'is_default'
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
  address.associate = (db) => {
    address.belongsTo(db.user, {
      foreignKey: 'customerId',
      constraints: false
    });
    address.belongsTo(db.ward, {
      foreignKey: 'wardId',
      constraints: false
    });
  }

  return address;
};