const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleServicio = sequelize.define('DetalleServicio', {
    cantidad: { 
        type: DataTypes.INTEGER, 
        allowNull: false },

    precio: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false },
    tipoPago: { 
        type: DataTypes.STRING, 
        allowNull: false },
}, { tableName: 'detalles_servicios', timestamps: false });

module.exports = DetalleServicio;
