const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialVisita = sequelize.define('HistorialVisita', {
    fecha: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    kilometraje: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    proximoCambio: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    total: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    tipoPago: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    visitaId: {
        type: DataTypes.INTEGER,
        allowNull: false,  // Si quieres que sea obligatorio
        references: {
            model: 'Visitas',  // Asegúrate que este es el nombre correcto de tu tabla
            key: 'id'
        }
    }
}, { 
    tableName: 'historial_visitas', 
    timestamps: true 
});

module.exports = HistorialVisita;