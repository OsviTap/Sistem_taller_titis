const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marca = require('./Marca');

const Modelo = sequelize.define('Modelo', {
    id: {  // Clave primaria explícita
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marcaId: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'marcas',  // Nombre de la tabla referenciada
            key: 'id'         // Clave primaria de Marca
        }
    }
}, {
    tableName: 'modelos',
    timestamps: true
});

// Relación con Marca
Modelo.belongsTo(Marca, {
    foreignKey: 'marcaId',
    as: 'marca'
});

module.exports = Modelo;