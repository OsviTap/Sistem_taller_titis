const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Marca = require('./Marca');
const Modelo = require('./Modelo');

const Vehiculo = sequelize.define('Vehiculo', {
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marca_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Marca,
            key: 'id',
        },
    },
    modelo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Modelo,
            key: 'id',
        },
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

// Relación: Un Cliente tiene muchos Vehículos
Cliente.hasMany(Vehiculo, { foreignKey: 'clienteId' });
Vehiculo.belongsTo(Cliente, { foreignKey: 'clienteId' });
Vehiculo.belongsTo(Marca, { foreignKey: 'marcaId', as: 'marcas' });
Vehiculo.belongsTo(Modelo, { foreignKey: 'modeloId', as: 'modelo' });

module.exports = Vehiculo;
