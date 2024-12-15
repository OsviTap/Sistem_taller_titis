const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Vehiculo = require('./Vehiculo');
const Servicio = require('./Servicio');

const Visita = sequelize.define('Visita', {
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    proximaFecha: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// Relación: Una Visita pertenece a un Cliente y un Vehículo
Cliente.hasMany(Visita, { foreignKey: 'clienteId' });
Visita.belongsTo(Cliente, { foreignKey: 'clienteId' });

Vehiculo.hasMany(Visita, { foreignKey: 'vehiculoId' });
Visita.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });

// Relación: Una Visita tiene muchos Servicios
Visita.belongsToMany(Servicio, { through: 'VisitaServicios' });
Servicio.belongsToMany(Visita, { through: 'VisitaServicios' });

module.exports = Visita;