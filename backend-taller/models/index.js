const { Sequelize } = require('sequelize');
const sequelize = require('../config/database'); // Configuración de la base de datos

// Importar modelos
const CajaChica = require('./CajaChica');
const Cliente = require('./Cliente');
const DetalleServicio = require('./DetalleServicio');
const DetalleVisita = require('./DetalleVisita');
const HistorialVisita = require('./HistorialVisita');
const Marca = require('./Marca');
const Modelo = require('./Modelo');
const Producto = require('./Producto');
const Servicio = require('./Servicio');
const Usuario = require('./Usuario');
const Vehiculo = require('./Vehiculo');
const Visita = require('./Visita');
const ProductHistory = require('./ProductHistory');


// Configurar las relaciones
// Relaciones de Visita
Visita.belongsTo(Cliente, { foreignKey: 'clienteId' });
Visita.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });
Visita.hasMany(DetalleVisita, { 
    foreignKey: {
        name: 'visitaId',
        allowNull: true
    },
    as: 'detalles',
    onDelete: 'CASCADE'  // Esto eliminará los detalles cuando se elimine la visita
});

// Relaciones de DetalleVisita
DetalleVisita.belongsTo(Visita, {
    foreignKey: {
        name: 'visitaId',
        allowNull: true
    }
});

// DetalleVisita.belongsTo(Servicio, {
//     foreignKey: 'itemId',
//     constraints: false,
//     as: 'servicio',
//     scope: {
//         tipo: 'Servicio'
//     }
// });

DetalleVisita.belongsTo(Servicio, {
    foreignKey: 'itemId',
    constraints: false,
    as: 'servicio'
});
DetalleVisita.belongsTo(Producto, {
    foreignKey: 'itemId',
    constraints: false,
    as: 'producto'
});
// DetalleVisita.belongsTo(Producto, {
//     foreignKey: 'itemId',
//     constraints: false,
//     as: 'producto',
//     scope: {
//         tipo: 'Producto'
//     }
// });

DetalleVisita.belongsTo(HistorialVisita, {
    foreignKey: 'visitaId',
    as: 'historial'
});


// Cliente y Vehículo
Cliente.hasMany(Vehiculo, { 
    foreignKey: 'clienteId',
    as: 'Vehiculos'
});
Cliente.hasMany(Visita, { foreignKey: 'clienteId' });

// Añadir estas relaciones junto con las demás
ProductHistory.belongsTo(Producto, { foreignKey: 'productoId' });
ProductHistory.belongsTo(Cliente, { foreignKey: 'clienteId' });
ProductHistory.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });
ProductHistory.belongsTo(Visita, { foreignKey: 'visitaId' });


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
Vehiculo.belongsTo(Cliente, { foreignKey: 'clienteId' });
Vehiculo.belongsTo(Marca, {
    foreignKey: 'marcaId',
    as: 'marcaVehiculo' // Cambiado el alias
});
Vehiculo.belongsTo(Modelo, { 
    foreignKey: 'modeloId', 
    as: 'modeloVehiculo' // Cambiar el alias a uno único
});
Vehiculo.hasMany(Visita, { foreignKey: 'vehiculoId' });

// Historial de Visitas y Cliente/Vehículo
HistorialVisita.belongsTo(Cliente, { foreignKey: 'clienteId' });
HistorialVisita.belongsTo(Vehiculo, { foreignKey: 'vehiculoId' });
HistorialVisita.belongsTo(Visita, { 
    foreignKey: 'visitaId',
    as: 'visita'
});
HistorialVisita.hasMany(DetalleVisita, {
    foreignKey: 'visitaId',
    sourceKey: 'visitaId',
    as: 'detalles'
});

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
    DetalleVisita,
    HistorialVisita,
    Marca,
    Modelo,
    Producto,
    ProductHistory,
    Servicio,
    Usuario,
    Vehiculo,
    Visita
};
