const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanillaRegistro = sequelize.define('PlanillaRegistro', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    tipoPlanilla: {
        type: DataTypes.ENUM('TIENDA', 'SUELDOS_SERVICIOS'),
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    concepto: {
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
    tableName: 'planillas_registros',
    timestamps: true,
});

module.exports = PlanillaRegistro;
