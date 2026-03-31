const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CajaTurno = sequelize.define('CajaTurno', {
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    turno: {
        type: DataTypes.ENUM('Manana', 'Tarde', 'Noche'),
        allowNull: false,
    },
    responsable: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    saldoInicial: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    fechaApertura: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    fechaCierre: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ventasEfectivo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    ingresosExtra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    gastosEfectivo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    saldoTeorico: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    saldoArqueo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    diferencia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    estado: {
        type: DataTypes.ENUM('ABIERTO', 'CERRADO'),
        allowNull: false,
        defaultValue: 'ABIERTO',
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'caja_turnos',
    timestamps: true,
});

module.exports = CajaTurno;
