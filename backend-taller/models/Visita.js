const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visita = sequelize.define('Visita', {
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
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    kilometraje: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    proximoCambio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipoPago: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Efectivo'
    },
    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'visitas',
    timestamps: true
});

module.exports = Visita;
