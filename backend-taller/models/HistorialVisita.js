const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialVisita = sequelize.define('HistorialVisita', {
    fechaVisita: { type: DataTypes.DATE, allowNull: false },
    kilometrajeActual: { type: DataTypes.INTEGER, allowNull: false },
    kilometrajeProximo: { type: DataTypes.INTEGER, allowNull: false },
    totalPagar: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'historial_visitas', timestamps: true });

module.exports = HistorialVisita;
