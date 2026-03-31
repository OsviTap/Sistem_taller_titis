const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioMovimiento = sequelize.define('InventarioMovimiento', {
    fechaMovimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    tipoMovimiento: {
        type: DataTypes.ENUM(
            'INGRESO',
            'SALIDA_VENTA',
            'TRASLADO_SALIDA',
            'TRASLADO_ENTRADA',
            'AJUSTE_POSITIVO',
            'AJUSTE_NEGATIVO'
        ),
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
    loteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'inventario_lotes',
            key: 'id',
        },
    },
    ubicacionOrigenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'inventario_ubicaciones',
            key: 'id',
        },
    },
    ubicacionDestinoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'inventario_ubicaciones',
            key: 'id',
        },
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    costoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    referenciaTipo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    referenciaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    usuarioResponsable: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'inventario_movimientos',
    timestamps: true,
});

module.exports = InventarioMovimiento;
