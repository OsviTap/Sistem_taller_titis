const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stockMinimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    precioCosto: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    precioVenta: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fechaAdquisicion: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
    paranoid: true // Habilita soft deletes (agrega columna deletedAt)
});

module.exports = Producto;
