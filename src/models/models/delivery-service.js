export default (sequelize, DataTypes) => {
  const deliveryService = sequelize.define('deliveryService', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      deliveryFee: {
        type: DataTypes.DOUBLE,
        field: 'delivery_fee'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: 'is_active'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    },
    {
      tableName: 'delivery_services',
      freezeTableName: true,
    });
  deliveryService.associate = (db) => {
    deliveryService.hasMany(db.order, {
      foreignKey: 'deliveryServiceId',
      constraints: false
    });
  }
  return deliveryService;
};