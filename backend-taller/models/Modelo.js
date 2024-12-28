const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marca = require('./Marca'); // Cambiado de Marcas a Marca

const Modelo = sequelize.define('Modelo', { // Cambiado de Modelos a Modelo
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    marcaId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Marca,
            key: 'nombre',
        },
        validate: {
            notNull: {
                msg: 'La marca es requerida'
            },
            notEmpty: {
                msg: 'La marca no puede estar vacía'
            }
        }
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El nombre es requerido'
            },
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            }
        }
    },
}, {
    tableName: 'modelos',
    timestamps: true,
});

// Definir la relación
Modelo.belongsTo(Marca, { 
    foreignKey: 'marcaId',
    targetKey: 'nombre',
    as: 'marca'
});

module.exports = Modelo;