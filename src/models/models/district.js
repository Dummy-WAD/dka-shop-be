'use strict';

export default (sequelize, DataTypes) => {
    const district = sequelize.define('district', {
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
        provinceId: {
            allowNull: false,
            type: DataTypes.STRING,
            field: 'province_id'
        }
    });

    district.associate = (db) => {
        district.belongsTo(db.province, {
            foreignKey: 'provinceId'
        });
    }

    return district;
};