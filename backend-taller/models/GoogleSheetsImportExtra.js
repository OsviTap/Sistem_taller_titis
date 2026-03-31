const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GoogleSheetsImportExtra = sequelize.define('GoogleSheetsImportExtra', {
    hoja: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entidadTipo: {
        type: DataTypes.ENUM('VentaDiaria', 'GastoDiario', 'PlanillaRegistro', 'CajaTurno'),
        allowNull: false,
    },
    entidadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rowNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    columnasExtra: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    tableName: 'google_sheets_import_extras',
    timestamps: true,
    indexes: [
        {
            fields: ['hoja', 'entidadTipo', 'entidadId'],
        },
    ],
});

module.exports = GoogleSheetsImportExtra;