const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioLoteHistorialCambio = sequelize.define('InventarioLoteHistorialCambio', {
    loteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inventario_lotes',
            key: 'id',
        },
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Productos',
            key: 'id',
        },
    },
    fechaVigencia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    tipoCambio: {
        type: DataTypes.ENUM('AJUSTE_COMERCIAL', 'CORRECCION_FECHA_INGRESO'),
        allowNull: false,
        defaultValue: 'AJUSTE_COMERCIAL',
    },
    costoAnterior: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    costoNuevo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    porcentajeGananciaAnterior: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
    porcentajeGananciaNuevo: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    },
    precioVentaAnterior: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    precioVentaNuevo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    fechaIngresoAnterior: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fechaIngresoNueva: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    usuarioResponsable: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'inventario_lote_historial_cambios',
    timestamps: true,
});

module.exports = InventarioLoteHistorialCambio;
