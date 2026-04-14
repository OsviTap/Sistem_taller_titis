const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVisita = sequelize.define('DetalleVisita', {
    visitaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'visitas',
            key: 'id'
        }
    },
    tipo: {
        type: DataTypes.ENUM('Servicio', 'Producto'),
        allowNull: false
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot del nombre del producto/servicio al momento de la visita'
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    origenInventario: {
        type: DataTypes.ENUM('INVENTARIO', 'COMPRA_DIRECTA', 'HISTORICO'),
        allowNull: false,
        defaultValue: 'INVENTARIO',
        comment: 'Define si el item descuenta stock o fue compra directa/historica'
    },
    afectaStock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    costoCompraExterna: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    observacionInventario: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true,
    tableName: 'detalle_visitas'
});

module.exports = DetalleVisita;