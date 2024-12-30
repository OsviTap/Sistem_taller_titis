const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marca = require('./Marca');
const Modelo = require('./Modelo');
const Cliente = require('./Cliente');

const Vehiculo = sequelize.define('Vehiculo', {
    clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field:'clienteId',
        references: {
            model: Cliente,
            key: 'id',
        },
    },
    marcaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field:'marcaId',
        references: {
            model: Marca,
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    modeloId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field:'modeloId',
        references: {
            model: Modelo,
            key: 'id',
        },
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'vehiculos',
    timestamps: true,
});

module.exports = Vehiculo;