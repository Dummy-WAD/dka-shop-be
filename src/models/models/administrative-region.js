'use strict';

export default (sequelize, DataTypes) => {
    const administrativeRegion = sequelize.define('administrativeRegion', {
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
    },
    {
        tableName: 'administrative_regions',
        freezeTableName: true,
    });

    return administrativeRegion;
};