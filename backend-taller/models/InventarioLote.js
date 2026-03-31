const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioLote = sequelize.define('InventarioLote', {
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Productos',
            key: 'id',
        },
    },
    ubicacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inventario_ubicaciones',
            key: 'id',
        },
    },
    fechaIngreso: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    documentoIngreso: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    proveedor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cantidadInicial: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cantidadDisponible: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    costoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    porcentajeGanancia: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
    precioVentaSugerido: {
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
    tableName: 'inventario_lotes',
    timestamps: true,
});

module.exports = InventarioLote;
