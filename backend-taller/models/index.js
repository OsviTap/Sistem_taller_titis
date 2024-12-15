const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Configuración de la base de datos

// Importar los modelos
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
Cliente.hasMany(Vehiculo, { foreignKey: 'clienteId' });
Vehiculo.belongsTo(Cliente, { foreignKey: 'clienteId' });

// Marca y Modelo
Marca.hasMany(Modelo, { foreignKey: 'marcaId' });
Modelo.belongsTo(Marca, { foreignKey: 'marcaId' });

// Vehículo, Marca y Modelo
Vehiculo.belongsTo(Marca, { foreignKey: 'marcaId' });
Vehiculo.belongsTo(Modelo, { foreignKey: 'modeloId' });

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
    Visita,
};

