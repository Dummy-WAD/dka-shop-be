'use strict';

export default (sequelize, DataTypes) => {
    const ward = sequelize.define('ward', {
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
        districtId: {
            allowNull: false,
            type: DataTypes.STRING,
            field: 'district_id'
        }
    });

    ward.associate = (db) => {
        ward.belongsTo(db.district, {
            foreignKey: 'districtId'
        });
    }

    return ward;
};