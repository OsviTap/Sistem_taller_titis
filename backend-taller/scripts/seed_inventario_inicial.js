require('dotenv').config();

const {
    sequelize,
    Producto,
    InventarioUbicacion,
    InventarioLote,
    InventarioMovimiento,
} = require('../models');
const { ensureUbicacionesBase } = require('../services/inventarioService');

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const calcularMargen = (costo, venta) => {
    const c = toNumber(costo, 0);
    const v = toNumber(venta, 0);
    if (c <= 0) return 0;
    return Number((((v - c) / c) * 100).toFixed(2));
};

async function main() {
    const t = await sequelize.transaction();
    try {
        await ensureUbicacionesBase(t);

        const almacen = await InventarioUbicacion.findOne({
            where: { codigo: 'ALMACEN', estado: 1 },
            transaction: t,
        });

        if (!almacen) {
            throw new Error('No se encontro la ubicacion ALMACEN');
        }

        const productos = await Producto.findAll({ transaction: t, order: [['id', 'ASC']] });

        let creados = 0;
        let omitidos = 0;

        for (const producto of productos) {
            const stock = parseInt(producto.stock, 10);
            if (Number.isNaN(stock) || stock <= 0) {
                omitidos += 1;
                continue;
            }

            const lotesExistentes = await InventarioLote.count({
                where: { productoId: producto.id, estado: 1 },
                transaction: t,
            });

            if (lotesExistentes > 0) {
                omitidos += 1;
                continue;
            }

            const costo = toNumber(producto.precioCosto, 0);
            const venta = toNumber(producto.precioVenta, 0);
            const margen = calcularMargen(costo, venta);
            const fechaIngreso = producto.fechaAdquisicion || new Date();

            const lote = await InventarioLote.create({
                productoId: producto.id,
                ubicacionId: almacen.id,
                fechaIngreso,
                documentoIngreso: 'MIGRACION_STOCK_INICIAL',
                proveedor: null,
                cantidadInicial: stock,
                cantidadDisponible: stock,
                costoUnitario: costo,
                porcentajeGanancia: margen,
                precioVentaSugerido: venta,
                observaciones: 'Carga inicial desde stock historico de productos',
                estado: 1,
            }, { transaction: t });

            await InventarioMovimiento.create({
                fechaMovimiento: new Date(),
                tipoMovimiento: 'INGRESO',
                productoId: producto.id,
                loteId: lote.id,
                ubicacionDestinoId: almacen.id,
                cantidad: stock,
                costoUnitario: costo,
                precioUnitario: venta,
                referenciaTipo: 'MIGRACION_INICIAL',
                referenciaId: lote.id,
                usuarioResponsable: 'SISTEMA',
                observaciones: 'Inicializacion de inventario por lotes',
            }, { transaction: t });

            creados += 1;
        }

        await t.commit();

        console.log('Seed inventario inicial completado');
        console.log(`Productos con lote inicial creado: ${creados}`);
        console.log(`Productos omitidos: ${omitidos}`);
    } catch (error) {
        await t.rollback();
        console.error('Error en seed inventario inicial:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

main();
