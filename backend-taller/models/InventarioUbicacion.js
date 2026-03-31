const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventarioUbicacion = sequelize.define('InventarioUbicacion', {
    codigo: {
        type: DataTypes.ENUM('TIENDA', 'ALMACEN'),
        allowNull: false,
        unique: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'inventario_ubicaciones',
    timestamps: true,
});

module.exports = InventarioUbicacion;
