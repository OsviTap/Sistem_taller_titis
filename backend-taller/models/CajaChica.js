const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CajaChica = sequelize.define('CajaChica', {
    fechaApertura: { type: DataTypes.DATE, allowNull: false },
    fechaCierre: { type: DataTypes.DATE },
    saldoInicial: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    saldoFinal: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'caja_chica', timestamps: true });

module.exports = CajaChica;
