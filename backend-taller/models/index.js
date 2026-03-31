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
const VentaDiaria = require('./VentaDiaria');
const DetalleVentaDiaria = require('./DetalleVentaDiaria');
const GastoDiario = require('./GastoDiario');
const PlanillaRegistro = require('./PlanillaRegistro');
const CajaTurno = require('./CajaTurno');
const InventarioUbicacion = require('./InventarioUbicacion');
const InventarioLote = require('./InventarioLote');
const InventarioMovimiento = require('./InventarioMovimiento');
const InventarioStockDiario = require('./InventarioStockDiario');
const InventarioLoteHistorialCambio = require('./InventarioLoteHistorialCambio');
const GoogleSheetsImportExtra = require('./GoogleSheetsImportExtra');


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

// Ventas diarias
VentaDiaria.hasMany(DetalleVentaDiaria, {
    foreignKey: 'ventaDiariaId',
    as: 'detalles',
    onDelete: 'CASCADE'
});
DetalleVentaDiaria.belongsTo(VentaDiaria, {
    foreignKey: 'ventaDiariaId',
    as: 'venta'
});
DetalleVentaDiaria.belongsTo(Producto, {
    foreignKey: 'productoId',
    as: 'producto',
    constraints: false
});

// Inventario profesional (ubicaciones, lotes, movimientos, snapshots diarios)
Producto.hasMany(InventarioLote, {
    foreignKey: 'productoId',
    as: 'lotesInventario'
});
InventarioLote.belongsTo(Producto, {
    foreignKey: 'productoId',
    as: 'producto'
});

InventarioUbicacion.hasMany(InventarioLote, {
    foreignKey: 'ubicacionId',
    as: 'lotes'
});
InventarioLote.belongsTo(InventarioUbicacion, {
    foreignKey: 'ubicacionId',
    as: 'ubicacion'
});

Producto.hasMany(InventarioMovimiento, {
    foreignKey: 'productoId',
    as: 'movimientosInventario'
});
InventarioMovimiento.belongsTo(Producto, {
    foreignKey: 'productoId',
    as: 'producto'
});

InventarioLote.hasMany(InventarioMovimiento, {
    foreignKey: 'loteId',
    as: 'movimientos'
});
InventarioMovimiento.belongsTo(InventarioLote, {
    foreignKey: 'loteId',
    as: 'lote'
});

InventarioLote.hasMany(InventarioLoteHistorialCambio, {
    foreignKey: 'loteId',
    as: 'historialCambios'
});
InventarioLoteHistorialCambio.belongsTo(InventarioLote, {
    foreignKey: 'loteId',
    as: 'lote'
});

Producto.hasMany(InventarioLoteHistorialCambio, {
    foreignKey: 'productoId',
    as: 'historialCambiosInventario'
});
InventarioLoteHistorialCambio.belongsTo(Producto, {
    foreignKey: 'productoId',
    as: 'producto'
});

InventarioMovimiento.belongsTo(InventarioUbicacion, {
    foreignKey: 'ubicacionOrigenId',
    as: 'ubicacionOrigen'
});
InventarioMovimiento.belongsTo(InventarioUbicacion, {
    foreignKey: 'ubicacionDestinoId',
    as: 'ubicacionDestino'
});

Producto.hasMany(InventarioStockDiario, {
    foreignKey: 'productoId',
    as: 'snapshotsInventario'
});
InventarioStockDiario.belongsTo(Producto, {
    foreignKey: 'productoId',
    as: 'producto'
});

InventarioUbicacion.hasMany(InventarioStockDiario, {
    foreignKey: 'ubicacionId',
    as: 'snapshotsInventario'
});
InventarioStockDiario.belongsTo(InventarioUbicacion, {
    foreignKey: 'ubicacionId',
    as: 'ubicacion'
});


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
    VentaDiaria,
    DetalleVentaDiaria,
    GastoDiario,
    PlanillaRegistro,
    CajaTurno,
    InventarioUbicacion,
    InventarioLote,
    InventarioMovimiento,
    InventarioStockDiario,
    InventarioLoteHistorialCambio,
    GoogleSheetsImportExtra,
    Servicio,
    Usuario,
    Vehiculo,
    Visita
};
