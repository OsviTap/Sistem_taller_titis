const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductHistory = sequelize.define('ProductHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechaSalida: {
        type: DataTypes.DATE,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombreProducto: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot del nombre del producto al momento de la venta - protege historial de cambios futuros'
    },
    precioCosto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    precioVenta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    ganancia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Productos',
            key: 'id'
        }
    },
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clientes',
            key: 'id'
        }
    },
    vehiculoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vehiculos',
            key: 'id'
        }
    },
    visitaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'visitas',
            key: 'id'
        }
    }
}, {
    tableName: 'product_history',
    timestamps: true
});

module.exports = ProductHistory;