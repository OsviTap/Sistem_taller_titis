const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Modelo = sequelize.define('Modelo', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    marca_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'modelos', timestamps: true });

module.exports = Modelo;
