const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GastoDiario = sequelize.define('GastoDiario', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    metodoPago: {
        type: DataTypes.ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'QR', 'Mixto'),
        allowNull: false,
        defaultValue: 'Efectivo',
    },
    comprobante: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: 'gastos_diarios',
    timestamps: true,
});

module.exports = GastoDiario;
