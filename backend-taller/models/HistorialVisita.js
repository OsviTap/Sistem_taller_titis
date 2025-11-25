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
        allowNull: false,
        references: {
            model: 'visitas',
            key: 'id'
        }
    },
    // SNAPSHOTS: Protegen el historial de cambios futuros
    nombreCliente: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot del nombre del cliente al momento de la visita'
    },
    placaVehiculo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot de la placa del vehículo al momento de la visita'
    },
    marcaVehiculo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot de la marca del vehículo al momento de la visita'
    },
    modeloVehiculo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Snapshot del modelo del vehículo al momento de la visita'
    }
}, { 
    tableName: 'historial_visitas', 
    timestamps: true 
});

module.exports = HistorialVisita;