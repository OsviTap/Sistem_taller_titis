const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Marca = sequelize.define('Marca', {
    id: {  // Clave primaria explícita
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: { // Nombre de la marca
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'marcas', // Nombre de la tabla en la base de datos
    timestamps: true     // createdAt y updatedAt habilitados
});

module.exports = Marca;
