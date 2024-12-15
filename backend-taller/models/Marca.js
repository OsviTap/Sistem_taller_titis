const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Marca = sequelize.define('Marca', {
    nombre: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'marcas', timestamps: true });

module.exports = Marca;
