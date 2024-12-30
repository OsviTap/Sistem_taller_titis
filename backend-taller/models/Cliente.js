const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Cliente = sequelize.define('Cliente', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING, // Cambiado a STRING
        allowNull: true,
    },
    nit: {
        type: DataTypes.STRING, // Cambiado a STRING
        allowNull: true,
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER (0 o 1)
        allowNull: false,
        defaultValue: 1, // Estado activo por defecto
    },
}, {
    tableName: 'clientes',
    timestamps: true, // createdAt y updatedAt automáticos
});
// Asegúrate de que estas líneas estén en el archivo
Cliente.associate = (models) => {
    Cliente.hasMany(models.Vehiculo, {
        foreignKey: 'clienteId',
        as: 'Vehiculos'  // Nota: este nombre es importante
    });
};

module.exports = Cliente;