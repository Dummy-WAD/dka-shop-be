'use strict';

export default (sequelize, DataTypes) => {
    const province = sequelize.define('province', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        nameEn: {
            allowNull: false,
            type: DataTypes.STRING,
            field: 'name_en'
        },
        regionId: {
            allowNull: false,
            type: DataTypes.STRING,
            field: 'region_id'
        }
    });

    province.associate = (db) => {
        province.belongsTo(db.administrativeRegion, {
            foreignKey: 'regionId'
        });
    }

    return province;
};