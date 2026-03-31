const { Op } = require('sequelize');
const {
    InventarioUbicacion,
    InventarioLote,
    InventarioMovimiento,
    InventarioStockDiario,
} = require('../models');

const UBICACIONES_BASE = [
    { codigo: 'TIENDA', nombre: 'Tienda', descripcion: 'Stock disponible para venta inmediata' },
    { codigo: 'ALMACEN', nombre: 'Almacen', descripcion: 'Stock de respaldo y reposicion' },
];

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const ensureUbicacionesBase = async (transaction) => {
    for (const ubicacion of UBICACIONES_BASE) {
        await InventarioUbicacion.findOrCreate({
            where: { codigo: ubicacion.codigo },
            defaults: ubicacion,
            transaction,
        });
    }
};

const registrarSalidaInventarioFIFO = async ({
    productoId,
    cantidad,
    referenciaTipo,
    referenciaId = null,
    usuarioResponsable = null,
    observaciones = null,
    transaction,
}) => {
    await ensureUbicacionesBase(transaction);

    const cantidadNum = parseInt(cantidad, 10);
    if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
        throw new Error('Cantidad no valida para salida de inventario');
    }

    const lotesProducto = await InventarioLote.count({
        where: { productoId, estado: 1 },
        transaction,
    });

    // Fallback para no romper operacion mientras se cargan lotes iniciales.
    if (lotesProducto === 0) {
        return {
            modo: 'LEGACY_SIN_LOTES',
            tramos: [],
            cantidadTotal: cantidadNum,
        };
    }

    const tienda = await InventarioUbicacion.findOne({
        where: { codigo: 'TIENDA', estado: 1 },
        transaction,
    });

    if (!tienda) {
        throw new Error('No existe ubicacion TIENDA para control de inventario');
    }

    const lotesTienda = await InventarioLote.findAll({
        where: {
            productoId,
            ubicacionId: tienda.id,
            estado: 1,
            cantidadDisponible: { [Op.gt]: 0 },
        },
        order: [['fechaIngreso', 'ASC'], ['id', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const stockTienda = lotesTienda.reduce((acc, lote) => acc + toNumber(lote.cantidadDisponible, 0), 0);
    if (stockTienda < cantidadNum) {
        throw new Error(`Stock insuficiente en TIENDA. Disponible: ${stockTienda}`);
    }

    let restante = cantidadNum;
    const tramos = [];

    for (const lote of lotesTienda) {
        if (restante <= 0) break;

        const disponible = toNumber(lote.cantidadDisponible, 0);
        if (disponible <= 0) continue;

        const salida = Math.min(restante, disponible);
        await lote.update({ cantidadDisponible: disponible - salida }, { transaction });

        await InventarioMovimiento.create({
            fechaMovimiento: new Date(),
            tipoMovimiento: 'SALIDA_VENTA',
            productoId,
            loteId: lote.id,
            ubicacionOrigenId: tienda.id,
            cantidad: salida,
            costoUnitario: toNumber(lote.costoUnitario, 0),
            precioUnitario: toNumber(lote.precioVentaSugerido, 0),
            referenciaTipo,
            referenciaId,
            usuarioResponsable,
            observaciones,
        }, { transaction });

        tramos.push({
            loteId: lote.id,
            cantidad: salida,
            costoUnitario: toNumber(lote.costoUnitario, 0),
            precioUnitario: toNumber(lote.precioVentaSugerido, 0),
        });

        restante -= salida;
    }

    return {
        modo: 'FIFO_TIENDA',
        tramos,
        cantidadTotal: cantidadNum,
    };
};

const generarSnapshotDiario = async ({ fecha, transaction }) => {
    const fechaSnapshot = fecha || new Date().toISOString().slice(0, 10);
    await ensureUbicacionesBase(transaction);

    const lotes = await InventarioLote.findAll({
        where: { estado: 1, cantidadDisponible: { [Op.gt]: 0 } },
        attributes: ['productoId', 'ubicacionId', 'cantidadDisponible', 'costoUnitario', 'precioVentaSugerido'],
        transaction,
        raw: true,
    });

    const agrupado = new Map();
    for (const lote of lotes) {
        const key = `${lote.productoId}|${lote.ubicacionId}`;
        const actual = agrupado.get(key) || {
            productoId: lote.productoId,
            ubicacionId: lote.ubicacionId,
            stock: 0,
            totalCosto: 0,
            totalPrecio: 0,
        };

        const qty = toNumber(lote.cantidadDisponible, 0);
        actual.stock += qty;
        actual.totalCosto += qty * toNumber(lote.costoUnitario, 0);
        actual.totalPrecio += qty * toNumber(lote.precioVentaSugerido, 0);
        agrupado.set(key, actual);
    }

    for (const data of agrupado.values()) {
        const costoPromedio = data.stock > 0 ? data.totalCosto / data.stock : 0;
        const precioReferencia = data.stock > 0 ? data.totalPrecio / data.stock : 0;
        const valorInventario = data.stock * costoPromedio;

        await InventarioStockDiario.upsert({
            fecha: fechaSnapshot,
            productoId: data.productoId,
            ubicacionId: data.ubicacionId,
            stock: data.stock,
            costoPromedio,
            precioReferencia,
            valorInventario,
        }, { transaction });
    }

    return {
        fecha: fechaSnapshot,
        registros: agrupado.size,
    };
};

module.exports = {
    ensureUbicacionesBase,
    registrarSalidaInventarioFIFO,
    generarSnapshotDiario,
};
