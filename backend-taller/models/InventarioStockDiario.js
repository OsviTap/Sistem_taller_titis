const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioStockDiario = sequelize.define('InventarioStockDiario', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
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
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    costoPromedio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    precioReferencia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    valorInventario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'inventario_stock_diario',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['fecha', 'productoId', 'ubicacionId'],
            name: 'ux_stock_diario_fecha_producto_ubicacion',
        },
    ],
});

module.exports = InventarioStockDiario;
