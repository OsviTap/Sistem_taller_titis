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
    estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true,
    tableName: 'detalle_visitas'
});

module.exports = DetalleVisita;