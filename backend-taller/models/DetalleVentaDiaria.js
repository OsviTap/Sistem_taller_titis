const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVentaDiaria = sequelize.define('DetalleVentaDiaria', {
    ventaDiariaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ventas_diarias',
            key: 'id',
        },
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Productos',
            key: 'id',
        },
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    costoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    ganancia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'detalle_ventas_diarias',
    timestamps: true,
});

module.exports = DetalleVentaDiaria;
