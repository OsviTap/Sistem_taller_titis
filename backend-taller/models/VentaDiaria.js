const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VentaDiaria = sequelize.define('VentaDiaria', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    numeroVenta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clienteNombre: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    metodoPago: {
        type: DataTypes.ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'QR', 'Mixto'),
        allowNull: false,
        defaultValue: 'Efectivo',
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'ventas_diarias',
    timestamps: true,
});

module.exports = VentaDiaria;
