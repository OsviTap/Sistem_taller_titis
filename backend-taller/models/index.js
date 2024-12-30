const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Configuración de la base de datos

// Importar modelos
const CajaChica = require('./CajaChica');
const Cliente = require('./Cliente');
const DetalleServicio = require('./DetalleServicio');
const HistorialVisita = require('./HistorialVisita');
const Marca = require('./Marca');
const Modelo = require('./Modelo');
const Producto = require('./Producto');
const Servicio = require('./Servicio');
const Usuario = require('./Usuario');
const Vehiculo = require('./Vehiculo');
const Visita = require('./Visita');

// Configurar las relaciones
// Cliente y Vehículo
Cliente.hasMany(Vehiculo, { 
    foreignKey: 'clienteId',
    as: 'Vehiculos'
});
Vehiculo.belongsTo(Cliente, { foreignKey: 'clienteId' });

// Marca y Modelo
Marca.hasMany(Modelo, { 
    foreignKey: 'marcaId', // Usa el ID como referencia
    as: 'modelos' 
});
Modelo.belongsTo(Marca, {
    foreignKey: 'marcaId',
    as: 'marcaModelo'  // Cambiado el alias
});

// Vehículo, Marca y Modelo
Vehiculo.belongsTo(Marca, {
    foreignKey: 'marcaId',
    as: 'marcaVehiculo' // Cambiado el alias
});
Vehiculo.belongsTo(Modelo, { 
    foreignKey: 'modeloId', 
    as: 'modeloVehiculo' // Cambiar el alias a uno único
});

// Historial de Visitas y Cliente/Vehículo
HistorialVisita.belongsTo(Cliente, { foreignKey: 'clienteId' });
HistorialVisita.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });

// Detalles de Servicio y Visita
Visita.hasMany(DetalleServicio, { foreignKey: 'visitaId' });
DetalleServicio.belongsTo(Visita, { foreignKey: 'visitaId' });

// Detalles de Servicio y Producto/Servicio
DetalleServicio.belongsTo(Producto, { foreignKey: 'productoId' });
DetalleServicio.belongsTo(Servicio, { foreignKey: 'servicioId' });

// Usuario y Caja Chica
Usuario.hasMany(CajaChica, { foreignKey: 'usuarioId' });
CajaChica.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Exportar modelos y conexión Sequelize
module.exports = {
    sequelize,
    Sequelize,
    CajaChica,
    Cliente,
    DetalleServicio,
    HistorialVisita,
    Marca,
    Modelo,
    Producto,
    Servicio,
    Usuario,
    Vehiculo,
    Visita
};
