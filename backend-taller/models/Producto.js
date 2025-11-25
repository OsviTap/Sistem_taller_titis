const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
