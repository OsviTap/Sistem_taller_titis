const express = require('express');
const { Op, fn, col } = require('sequelize');
const {
    sequelize,
    Producto,
    InventarioUbicacion,
    InventarioLote,
    InventarioMovimiento,
    InventarioStockDiario,
} = require('../models');
const { generarSnapshotDiario } = require('../services/inventarioService');

const router = express.Router();

const UBICACIONES_BASE = [
    { codigo: 'TIENDA', nombre: 'Tienda', descripcion: 'Stock disponible para venta inmediata' },
    { codigo: 'ALMACEN', nombre: 'Almacen', descripcion: 'Stock de respaldo y reposicion' },
];

const MOV_SUMA_DESTINO = new Set(['INGRESO', 'TRASLADO_ENTRADA', 'AJUSTE_POSITIVO']);
const MOV_RESTA_ORIGEN = new Set(['SALIDA_VENTA', 'TRASLADO_SALIDA', 'AJUSTE_NEGATIVO']);

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const calcularPrecioSugerido = (costoUnitario, porcentajeGanancia) => {
    const costo = toNumber(costoUnitario, 0);
    const margen = toNumber(porcentajeGanancia, 0);
    return Number((costo * (1 + margen / 100)).toFixed(2));
};

const normalizarCodigoUbicacion = (codigo) => String(codigo || '').trim().toUpperCase();

const ensureUbicacionesBase = async (transaction) => {
    for (const ubicacion of UBICACIONES_BASE) {
        await InventarioUbicacion.findOrCreate({
            where: { codigo: ubicacion.codigo },
            defaults: ubicacion,
            transaction,
        });
    }
};

const getUbicacionByCodigo = async (codigo, transaction) => {
    const codigoNormalizado = normalizarCodigoUbicacion(codigo);
    const ubicacion = await InventarioUbicacion.findOne({
        where: { codigo: codigoNormalizado, estado: 1 },
        transaction,
    });

    if (!ubicacion) {
        throw new Error(`Ubicacion no encontrada: ${codigoNormalizado}`);
    }

    return ubicacion;
};

const calcularImpactoMovimiento = (movimiento, ubicacionFiltroId = null) => {
    const cantidad = toNumber(movimiento.cantidad, 0);

    if (!ubicacionFiltroId) {
        if (MOV_SUMA_DESTINO.has(movimiento.tipoMovimiento)) return cantidad;
        if (MOV_RESTA_ORIGEN.has(movimiento.tipoMovimiento)) return -cantidad;
        return 0;
    }

    let impacto = 0;
    if (movimiento.ubicacionDestinoId === ubicacionFiltroId && MOV_SUMA_DESTINO.has(movimiento.tipoMovimiento)) {
        impacto += cantidad;
    }
    if (movimiento.ubicacionOrigenId === ubicacionFiltroId && MOV_RESTA_ORIGEN.has(movimiento.tipoMovimiento)) {
        impacto -= cantidad;
    }
    return impacto;
};

router.get('/ubicaciones', async (req, res) => {
    try {
        await ensureUbicacionesBase();
        const ubicaciones = await InventarioUbicacion.findAll({
            where: { estado: 1 },
            order: [['id', 'ASC']],
        });
        res.json(ubicaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ubicaciones', details: error.message });
    }
});

router.get('/resumen', async (req, res) => {
    try {
        await ensureUbicacionesBase();

        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const whereProducto = {};
        if (search) {
            whereProducto[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { id: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Producto.findAndCountAll({
            where: whereProducto,
            attributes: ['id', 'nombre', 'stock', 'precioCosto', 'precioVenta', 'fechaAdquisicion'],
            limit: parseInt(limit, 10),
            offset,
            order: [['nombre', 'ASC']],
        });

        if (!rows.length) {
            return res.json({
                data: [],
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page, 10),
            });
        }

        const productoIds = rows.map((p) => p.id);
        const stockUbicaciones = await InventarioLote.findAll({
            where: {
                productoId: { [Op.in]: productoIds },
                estado: 1,
                cantidadDisponible: { [Op.gt]: 0 },
            },
            attributes: [
                'productoId',
                'ubicacionId',
                [fn('SUM', col('cantidadDisponible')), 'stockDisponible'],
            ],
            include: [{ model: InventarioUbicacion, as: 'ubicacion', attributes: ['codigo', 'nombre'] }],
            group: ['productoId', 'ubicacionId', 'ubicacion.id'],
            raw: true,
        });

        const stockMap = new Map();
        for (const row of stockUbicaciones) {
            const key = row.productoId;
            const current = stockMap.get(key) || { TIENDA: 0, ALMACEN: 0 };
            const codigo = row['ubicacion.codigo'];
            current[codigo] = toNumber(row.stockDisponible, 0);
            stockMap.set(key, current);
        }

        const data = rows.map((producto) => {
            const stockPorUbicacion = stockMap.get(producto.id) || { TIENDA: 0, ALMACEN: 0 };
            const stockLotes = toNumber(stockPorUbicacion.TIENDA, 0) + toNumber(stockPorUbicacion.ALMACEN, 0);
            const stockGlobal = toNumber(producto.stock, 0);
            return {
                ...producto.toJSON(),
                stockPorUbicacion,
                stockLotes,
                diferenciaControl: stockGlobal - stockLotes,
            };
        });

        res.json({
            data,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener resumen de inventario', details: error.message });
    }
});

router.get('/alertas-reposicion', async (req, res) => {
    try {
        await ensureUbicacionesBase();

        const {
            search = '',
            usarDefault = 'true',
            stockMinimoDefault = 5,
            incluirSinAlerta = 'false',
            limit = 500,
        } = req.query;

        const whereProducto = {};
        if (search) {
            whereProducto[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { id: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } },
            ];
        }

        const productos = await Producto.findAll({
            where: whereProducto,
            attributes: ['id', 'sku', 'nombre', 'stock', 'stockMinimo', 'precioCosto', 'precioVenta'],
            order: [['nombre', 'ASC']],
            limit: Math.min(parseInt(limit, 10) || 500, 5000),
        });

        if (!productos.length) {
            return res.json({
                resumen: {
                    totalProductos: 0,
                    conAlerta: 0,
                    urgentes: 0,
                    sinCoberturaAlmacen: 0,
                },
                alertas: [],
            });
        }

        const productoIds = productos.map((p) => p.id);
        const stockUbicaciones = await InventarioLote.findAll({
            where: {
                productoId: { [Op.in]: productoIds },
                estado: 1,
                cantidadDisponible: { [Op.gt]: 0 },
            },
            attributes: [
                'productoId',
                'ubicacionId',
                [fn('SUM', col('cantidadDisponible')), 'stockDisponible'],
            ],
            include: [{ model: InventarioUbicacion, as: 'ubicacion', attributes: ['codigo'] }],
            group: ['productoId', 'ubicacionId', 'ubicacion.id'],
            raw: true,
        });

        const stockMap = new Map();
        for (const row of stockUbicaciones) {
            const current = stockMap.get(row.productoId) || { TIENDA: 0, ALMACEN: 0 };
            const codigo = row['ubicacion.codigo'];
            current[codigo] = toNumber(row.stockDisponible, 0);
            stockMap.set(row.productoId, current);
        }

        const usarDefaultBool = usarDefault !== 'false';
        const minimoFallback = Math.max(parseInt(stockMinimoDefault, 10) || 0, 0);

        const alertas = productos.map((producto) => {
            const stockPorUbicacion = stockMap.get(producto.id) || { TIENDA: 0, ALMACEN: 0 };
            const stockTienda = toNumber(stockPorUbicacion.TIENDA, 0);
            const stockAlmacen = toNumber(stockPorUbicacion.ALMACEN, 0);

            const minimoConfigurado = Math.max(toNumber(producto.stockMinimo, 0), 0);
            const minimoObjetivo = minimoConfigurado > 0
                ? minimoConfigurado
                : (usarDefaultBool ? minimoFallback : 0);

            const deficit = Math.max(minimoObjetivo - stockTienda, 0);
            const sugerenciaTraslado = Math.min(deficit, stockAlmacen);
            const sinCobertura = Math.max(deficit - sugerenciaTraslado, 0);

            let estadoReposicion = 'OK';
            let prioridad = 0;
            if (deficit > 0 && stockTienda === 0) {
                estadoReposicion = 'URGENTE_SIN_STOCK_TIENDA';
                prioridad = 3;
            } else if (deficit > 0 && sugerenciaTraslado === 0) {
                estadoReposicion = 'BAJO_MINIMO_SIN_STOCK_ALMACEN';
                prioridad = 2;
            } else if (deficit > 0) {
                estadoReposicion = 'BAJO_MINIMO_REPONER';
                prioridad = 1;
            }

            return {
                productoId: producto.id,
                sku: producto.sku || null,
                nombre: producto.nombre,
                stockGlobal: toNumber(producto.stock, 0),
                stockTienda,
                stockAlmacen,
                stockMinimoConfigurado: minimoConfigurado,
                stockMinimoObjetivo: minimoObjetivo,
                deficitTienda: deficit,
                sugerenciaTraslado,
                sinCobertura,
                estadoReposicion,
                prioridad,
                costoReferencia: toNumber(producto.precioCosto, 0),
                precioReferencia: toNumber(producto.precioVenta, 0),
            };
        });

        const alertasFiltradas = incluirSinAlerta === 'true'
            ? alertas
            : alertas.filter((a) => a.deficitTienda > 0);

        alertasFiltradas.sort((a, b) => {
            if (b.prioridad !== a.prioridad) return b.prioridad - a.prioridad;
            if (b.deficitTienda !== a.deficitTienda) return b.deficitTienda - a.deficitTienda;
            return a.nombre.localeCompare(b.nombre);
        });

        const resumen = {
            totalProductos: productos.length,
            conAlerta: alertas.filter((a) => a.deficitTienda > 0).length,
            urgentes: alertas.filter((a) => a.estadoReposicion === 'URGENTE_SIN_STOCK_TIENDA').length,
            sinCoberturaAlmacen: alertas.filter((a) => a.deficitTienda > 0 && a.sugerenciaTraslado === 0).length,
        };

        res.json({ resumen, alertas: alertasFiltradas });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener alertas de reposicion', details: error.message });
    }
});

router.post('/ingresos', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        await ensureUbicacionesBase(t);

        const {
            productoId,
            ubicacionCodigo = 'ALMACEN',
            fechaIngreso,
            cantidad,
            costoUnitario,
            porcentajeGanancia = 0,
            precioVentaSugerido,
            documentoIngreso,
            proveedor,
            observaciones,
            usuarioResponsable,
            actualizarPreciosProducto = true,
        } = req.body;

        if (!productoId) {
            throw new Error('productoId es obligatorio');
        }

        const cantidadNum = parseInt(cantidad, 10);
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
            throw new Error('Cantidad no valida');
        }

        const costoNum = toNumber(costoUnitario, -1);
        if (costoNum < 0) {
            throw new Error('Costo unitario no valido');
        }

        const margenNum = toNumber(porcentajeGanancia, 0);
        if (margenNum < 0) {
            throw new Error('El porcentaje de ganancia no puede ser negativo');
        }

        const producto = await Producto.findByPk(productoId, { transaction: t });
        if (!producto) {
            throw new Error(`Producto no encontrado: ${productoId}`);
        }

        const ubicacion = await getUbicacionByCodigo(ubicacionCodigo, t);
        const precioSugeridoFinal = toNumber(precioVentaSugerido, 0) > 0
            ? toNumber(precioVentaSugerido, 0)
            : calcularPrecioSugerido(costoNum, margenNum);

        const lote = await InventarioLote.create({
            productoId: producto.id,
            ubicacionId: ubicacion.id,
            fechaIngreso: fechaIngreso || new Date(),
            documentoIngreso,
            proveedor,
            cantidadInicial: cantidadNum,
            cantidadDisponible: cantidadNum,
            costoUnitario: costoNum,
            porcentajeGanancia: margenNum,
            precioVentaSugerido: precioSugeridoFinal,
            observaciones,
        }, { transaction: t });

        await InventarioMovimiento.create({
            fechaMovimiento: new Date(),
            tipoMovimiento: 'INGRESO',
            productoId: producto.id,
            loteId: lote.id,
            ubicacionDestinoId: ubicacion.id,
            cantidad: cantidadNum,
            costoUnitario: costoNum,
            precioUnitario: precioSugeridoFinal,
            referenciaTipo: 'INGRESO_MANUAL',
            referenciaId: lote.id,
            usuarioResponsable,
            observaciones,
        }, { transaction: t });

        const payloadProducto = {
            stock: toNumber(producto.stock, 0) + cantidadNum,
        };

        if (actualizarPreciosProducto) {
            payloadProducto.precioCosto = costoNum;
            payloadProducto.precioVenta = precioSugeridoFinal;
            payloadProducto.fechaAdquisicion = fechaIngreso || new Date();
        }

        await producto.update(payloadProducto, { transaction: t });

        await t.commit();

        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdated');
        }

        res.status(201).json({
            message: 'Ingreso de inventario registrado correctamente',
            productoId: producto.id,
            loteId: lote.id,
            ubicacion: ubicacion.codigo,
            cantidad: cantidadNum,
            costoUnitario: costoNum,
            porcentajeGanancia: margenNum,
            precioVentaSugerido: precioSugeridoFinal,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Error al registrar ingreso', details: error.message });
    }
});

router.post('/traslados', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        await ensureUbicacionesBase(t);

        const {
            productoId,
            cantidad,
            ubicacionOrigenCodigo = 'ALMACEN',
            ubicacionDestinoCodigo = 'TIENDA',
            usuarioResponsable,
            observaciones,
        } = req.body;

        if (!productoId) {
            throw new Error('productoId es obligatorio');
        }

        const cantidadNum = parseInt(cantidad, 10);
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
            throw new Error('Cantidad no valida');
        }

        const origenCodigo = normalizarCodigoUbicacion(ubicacionOrigenCodigo);
        const destinoCodigo = normalizarCodigoUbicacion(ubicacionDestinoCodigo);
        if (origenCodigo === destinoCodigo) {
            throw new Error('La ubicacion origen y destino no pueden ser la misma');
        }

        const producto = await Producto.findByPk(productoId, { transaction: t });
        if (!producto) {
            throw new Error(`Producto no encontrado: ${productoId}`);
        }

        const ubicacionOrigen = await getUbicacionByCodigo(origenCodigo, t);
        const ubicacionDestino = await getUbicacionByCodigo(destinoCodigo, t);

        const lotesOrigen = await InventarioLote.findAll({
            where: {
                productoId,
                ubicacionId: ubicacionOrigen.id,
                estado: 1,
                cantidadDisponible: { [Op.gt]: 0 },
            },
            order: [['fechaIngreso', 'ASC'], ['id', 'ASC']],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        const stockDisponibleOrigen = lotesOrigen.reduce((acc, lote) => acc + toNumber(lote.cantidadDisponible, 0), 0);
        if (stockDisponibleOrigen < cantidadNum) {
            throw new Error(`Stock insuficiente en ${origenCodigo}. Disponible: ${stockDisponibleOrigen}`);
        }

        let restante = cantidadNum;
        const traslados = [];

        for (const loteOrigen of lotesOrigen) {
            if (restante <= 0) break;

            const disponible = toNumber(loteOrigen.cantidadDisponible, 0);
            if (disponible <= 0) continue;

            const mover = Math.min(restante, disponible);
            const costo = toNumber(loteOrigen.costoUnitario, 0);
            const margen = toNumber(loteOrigen.porcentajeGanancia, 0);
            const precioSugerido = toNumber(loteOrigen.precioVentaSugerido, 0);

            await loteOrigen.update({ cantidadDisponible: disponible - mover }, { transaction: t });

            const loteDestino = await InventarioLote.create({
                productoId,
                ubicacionId: ubicacionDestino.id,
                fechaIngreso: new Date(),
                documentoIngreso: `TRASLADO:${loteOrigen.id}`,
                proveedor: loteOrigen.proveedor,
                cantidadInicial: mover,
                cantidadDisponible: mover,
                costoUnitario: costo,
                porcentajeGanancia: margen,
                precioVentaSugerido: precioSugerido,
                observaciones: observaciones || `Traslado desde ${origenCodigo}`,
            }, { transaction: t });

            await InventarioMovimiento.create({
                fechaMovimiento: new Date(),
                tipoMovimiento: 'TRASLADO_SALIDA',
                productoId,
                loteId: loteOrigen.id,
                ubicacionOrigenId: ubicacionOrigen.id,
                ubicacionDestinoId: ubicacionDestino.id,
                cantidad: mover,
                costoUnitario: costo,
                precioUnitario: precioSugerido,
                referenciaTipo: 'TRASLADO_INTERNO',
                referenciaId: loteDestino.id,
                usuarioResponsable,
                observaciones,
            }, { transaction: t });

            await InventarioMovimiento.create({
                fechaMovimiento: new Date(),
                tipoMovimiento: 'TRASLADO_ENTRADA',
                productoId,
                loteId: loteDestino.id,
                ubicacionOrigenId: ubicacionOrigen.id,
                ubicacionDestinoId: ubicacionDestino.id,
                cantidad: mover,
                costoUnitario: costo,
                precioUnitario: precioSugerido,
                referenciaTipo: 'TRASLADO_INTERNO',
                referenciaId: loteOrigen.id,
                usuarioResponsable,
                observaciones,
            }, { transaction: t });

            traslados.push({
                loteOrigenId: loteOrigen.id,
                loteDestinoId: loteDestino.id,
                cantidad: mover,
                costoUnitario: costo,
                porcentajeGanancia: margen,
                precioVentaSugerido: precioSugerido,
            });

            restante -= mover;
        }

        await t.commit();

        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdated');
        }

        res.json({
            message: 'Traslado registrado correctamente',
            productoId,
            origen: origenCodigo,
            destino: destinoCodigo,
            cantidad: cantidadNum,
            tramos: traslados,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Error al registrar traslado', details: error.message });
    }
});

router.get('/productos/:productoId/lotes', async (req, res) => {
    try {
        const { productoId } = req.params;
        const { ubicacionCodigo, incluirAgotados = 'false' } = req.query;

        const where = { productoId };
        if (incluirAgotados !== 'true') {
            where.cantidadDisponible = { [Op.gt]: 0 };
            where.estado = 1;
        }

        if (ubicacionCodigo) {
            const ubicacion = await getUbicacionByCodigo(ubicacionCodigo);
            where.ubicacionId = ubicacion.id;
        }

        const lotes = await InventarioLote.findAll({
            where,
            include: [{ model: InventarioUbicacion, as: 'ubicacion', attributes: ['id', 'codigo', 'nombre'] }],
            order: [['fechaIngreso', 'ASC'], ['id', 'ASC']],
        });

        res.json(lotes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener lotes', details: error.message });
    }
});

router.get('/kardex', async (req, res) => {
    try {
        const { productoId, ubicacionCodigo, fechaInicio, fechaFin, limit = 200 } = req.query;

        if (!productoId) {
            return res.status(400).json({ error: 'productoId es obligatorio' });
        }

        const where = { productoId };
        if (fechaInicio || fechaFin) {
            where.fechaMovimiento = {};
            if (fechaInicio) where.fechaMovimiento[Op.gte] = new Date(`${fechaInicio} 00:00:00`);
            if (fechaFin) where.fechaMovimiento[Op.lte] = new Date(`${fechaFin} 23:59:59`);
        }

        if (ubicacionCodigo) {
            const ubicacion = await getUbicacionByCodigo(ubicacionCodigo);
            where[Op.or] = [
                { ubicacionOrigenId: ubicacion.id },
                { ubicacionDestinoId: ubicacion.id },
            ];
        }

        const movimientos = await InventarioMovimiento.findAll({
            where,
            include: [
                { model: InventarioLote, as: 'lote', attributes: ['id', 'fechaIngreso', 'costoUnitario', 'porcentajeGanancia', 'precioVentaSugerido'] },
                { model: InventarioUbicacion, as: 'ubicacionOrigen', attributes: ['id', 'codigo', 'nombre'] },
                { model: InventarioUbicacion, as: 'ubicacionDestino', attributes: ['id', 'codigo', 'nombre'] },
            ],
            order: [['fechaMovimiento', 'DESC'], ['id', 'DESC']],
            limit: parseInt(limit, 10),
        });

        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener kardex', details: error.message });
    }
});

router.get('/kardex-historico', async (req, res) => {
    try {
        const {
            productoId,
            ubicacionCodigo,
            fechaInicio,
            fechaFin,
            limit = 500,
        } = req.query;

        const limite = Math.min(parseInt(limit, 10) || 500, 2000);
        const fechaFinFiltro = fechaFin ? new Date(`${fechaFin} 23:59:59`) : new Date();
        const fechaInicioFiltro = fechaInicio
            ? new Date(`${fechaInicio} 00:00:00`)
            : new Date(fechaFinFiltro.getTime() - (30 * 24 * 60 * 60 * 1000));

        const whereBase = {};
        if (productoId) {
            whereBase.productoId = productoId;
        }

        let ubicacionFiltro = null;
        if (ubicacionCodigo) {
            ubicacionFiltro = await getUbicacionByCodigo(ubicacionCodigo);
            whereBase[Op.or] = [
                { ubicacionOrigenId: ubicacionFiltro.id },
                { ubicacionDestinoId: ubicacionFiltro.id },
            ];
        }

        const wherePrevio = {
            ...whereBase,
            fechaMovimiento: { [Op.lt]: fechaInicioFiltro },
        };

        const wherePeriodo = {
            ...whereBase,
            fechaMovimiento: {
                [Op.gte]: fechaInicioFiltro,
                [Op.lte]: fechaFinFiltro,
            },
        };

        const [movimientosPrevios, movimientosPeriodo] = await Promise.all([
            InventarioMovimiento.findAll({
                where: wherePrevio,
                attributes: ['id', 'tipoMovimiento', 'cantidad', 'ubicacionOrigenId', 'ubicacionDestinoId'],
                raw: true,
            }),
            InventarioMovimiento.findAll({
                where: wherePeriodo,
                include: [
                    { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'stockMinimo'] },
                    { model: InventarioLote, as: 'lote', attributes: ['id', 'fechaIngreso', 'costoUnitario', 'precioVentaSugerido'] },
                    { model: InventarioUbicacion, as: 'ubicacionOrigen', attributes: ['id', 'codigo', 'nombre'] },
                    { model: InventarioUbicacion, as: 'ubicacionDestino', attributes: ['id', 'codigo', 'nombre'] },
                ],
                order: [['fechaMovimiento', 'ASC'], ['id', 'ASC']],
                limit: limite,
            }),
        ]);

        const ubicacionFiltroId = ubicacionFiltro ? ubicacionFiltro.id : null;
        let saldo = movimientosPrevios.reduce((acc, mov) => acc + calcularImpactoMovimiento(mov, ubicacionFiltroId), 0);
        const saldoInicial = saldo;

        const resumenDiarioMap = new Map();
        const movimientos = movimientosPeriodo.map((mov) => {
            const movimiento = mov.toJSON();
            const impactoCantidad = calcularImpactoMovimiento(movimiento, ubicacionFiltroId);
            saldo += impactoCantidad;

            const fechaKey = new Date(movimiento.fechaMovimiento).toISOString().slice(0, 10);
            const resumenDia = resumenDiarioMap.get(fechaKey) || {
                fecha: fechaKey,
                entradas: 0,
                salidas: 0,
                neto: 0,
                saldoCierre: 0,
                movimientos: 0,
            };

            if (impactoCantidad > 0) resumenDia.entradas += impactoCantidad;
            if (impactoCantidad < 0) resumenDia.salidas += Math.abs(impactoCantidad);
            resumenDia.neto += impactoCantidad;
            resumenDia.saldoCierre = saldo;
            resumenDia.movimientos += 1;
            resumenDiarioMap.set(fechaKey, resumenDia);

            return {
                ...movimiento,
                impactoCantidad,
                saldoPosterior: saldo,
            };
        });

        const resumenDiario = Array.from(resumenDiarioMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));

        res.json({
            filtros: {
                productoId: productoId || null,
                ubicacionCodigo: ubicacionFiltro ? ubicacionFiltro.codigo : null,
                fechaInicio: fechaInicioFiltro.toISOString().slice(0, 10),
                fechaFin: fechaFinFiltro.toISOString().slice(0, 10),
                limit: limite,
            },
            saldoInicial,
            saldoFinal: saldo,
            totalMovimientos: movimientos.length,
            resumenDiario,
            movimientos,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener kardex historico', details: error.message });
    }
});

router.get('/stock-historico', async (req, res) => {
    try {
        const { fechaCorte, productoId, ubicacionCodigo } = req.query;
        const corte = fechaCorte || new Date().toISOString().slice(0, 10);
        const corteDateTime = new Date(`${corte} 23:59:59`);

        await ensureUbicacionesBase();

        const whereMov = { fechaMovimiento: { [Op.lte]: corteDateTime } };
        if (productoId) whereMov.productoId = productoId;

        let ubicacionFiltro = null;
        if (ubicacionCodigo) {
            ubicacionFiltro = await getUbicacionByCodigo(ubicacionCodigo);
            whereMov[Op.or] = [
                { ubicacionOrigenId: ubicacionFiltro.id },
                { ubicacionDestinoId: ubicacionFiltro.id },
            ];
        }

        const movimientos = await InventarioMovimiento.findAll({
            where: whereMov,
            attributes: [
                'productoId',
                'loteId',
                'tipoMovimiento',
                'cantidad',
                'ubicacionOrigenId',
                'ubicacionDestinoId',
            ],
            raw: true,
        });

        const idsProducto = [...new Set(movimientos.map((m) => m.productoId))];
        const idsUbicacion = [...new Set(
            movimientos.flatMap((m) => [m.ubicacionOrigenId, m.ubicacionDestinoId]).filter(Boolean)
        )];

        const [productos, ubicaciones] = await Promise.all([
            idsProducto.length
                ? Producto.findAll({ where: { id: { [Op.in]: idsProducto } }, attributes: ['id', 'nombre'] })
                : [],
            idsUbicacion.length
                ? InventarioUbicacion.findAll({ where: { id: { [Op.in]: idsUbicacion } }, attributes: ['id', 'codigo', 'nombre'] })
                : [],
        ]);

        const productoMap = new Map(productos.map((p) => [p.id, p.nombre]));
        const ubicacionMap = new Map(ubicaciones.map((u) => [u.id, `${u.codigo}`]));

        const balance = new Map();
        for (const mov of movimientos) {
            const qty = toNumber(mov.cantidad, 0);

            if (mov.ubicacionDestinoId && MOV_SUMA_DESTINO.has(mov.tipoMovimiento)) {
                const keyDestino = `${mov.productoId}|${mov.ubicacionDestinoId}`;
                balance.set(keyDestino, toNumber(balance.get(keyDestino), 0) + qty);
            }

            if (mov.ubicacionOrigenId && MOV_RESTA_ORIGEN.has(mov.tipoMovimiento)) {
                const keyOrigen = `${mov.productoId}|${mov.ubicacionOrigenId}`;
                balance.set(keyOrigen, toNumber(balance.get(keyOrigen), 0) - qty);
            }
        }

        const lotesWhere = { fechaIngreso: { [Op.lte]: corte } };
        if (productoId) lotesWhere.productoId = productoId;
        if (ubicacionFiltro) lotesWhere.ubicacionId = ubicacionFiltro.id;

        const lotes = await InventarioLote.findAll({
            where: lotesWhere,
            attributes: [
                'id',
                'productoId',
                'ubicacionId',
                'fechaIngreso',
                'documentoIngreso',
                'cantidadInicial',
                'costoUnitario',
                'porcentajeGanancia',
                'precioVentaSugerido',
            ],
            order: [['fechaIngreso', 'ASC'], ['id', 'ASC']],
            raw: true,
        });

        const loteIds = lotes.map((l) => l.id);
        const movLote = loteIds.length
            ? await InventarioMovimiento.findAll({
                where: {
                    loteId: { [Op.in]: loteIds },
                    fechaMovimiento: { [Op.lte]: corteDateTime },
                },
                attributes: ['loteId', 'tipoMovimiento', 'cantidad'],
                raw: true,
            })
            : [];

        const ajustesLote = new Map();
        for (const mov of movLote) {
            const key = mov.loteId;
            const actual = toNumber(ajustesLote.get(key), 0);
            const qty = toNumber(mov.cantidad, 0);

            if (mov.tipoMovimiento === 'SALIDA_VENTA' || mov.tipoMovimiento === 'TRASLADO_SALIDA' || mov.tipoMovimiento === 'AJUSTE_NEGATIVO') {
                ajustesLote.set(key, actual - qty);
            } else if (mov.tipoMovimiento === 'AJUSTE_POSITIVO') {
                ajustesLote.set(key, actual + qty);
            }
        }

        const detalleLotes = lotes.map((lote) => {
            const stockLote = Math.max(0, toNumber(lote.cantidadInicial, 0) + toNumber(ajustesLote.get(lote.id), 0));
            const valorLote = Number((stockLote * toNumber(lote.costoUnitario, 0)).toFixed(2));

            return {
                ...lote,
                stockFechaCorte: stockLote,
                valorLote,
                productoNombre: productoMap.get(lote.productoId) || `Producto ${lote.productoId}`,
                ubicacionCodigo: ubicacionMap.get(lote.ubicacionId) || `UBI-${lote.ubicacionId}`,
            };
        }).filter((l) => l.stockFechaCorte > 0);

        const resumenPorProductoUbicacion = Array.from(balance.entries()).map(([key, qty]) => {
            const [prodId, ubiId] = key.split('|').map((v) => parseInt(v, 10));
            return {
                productoId: prodId,
                productoNombre: productoMap.get(prodId) || `Producto ${prodId}`,
                ubicacionId: ubiId,
                ubicacionCodigo: ubicacionMap.get(ubiId) || `UBI-${ubiId}`,
                stockFechaCorte: qty,
            };
        }).filter((item) => item.stockFechaCorte > 0);

        res.json({
            fechaCorte: corte,
            resumenPorProductoUbicacion,
            detalleLotes,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al calcular stock historico', details: error.message });
    }
});

router.get('/snapshot-diario/estado', async (req, res) => {
    try {
        const ultimaFecha = await InventarioStockDiario.max('fecha');

        if (!ultimaFecha) {
            return res.json({
                ultimoSnapshot: null,
                registrosUltimoSnapshot: 0,
            });
        }

        const registrosUltimoSnapshot = await InventarioStockDiario.count({
            where: { fecha: ultimaFecha },
        });

        res.json({
            ultimoSnapshot: ultimaFecha,
            registrosUltimoSnapshot,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estado de snapshot', details: error.message });
    }
});

router.post('/snapshot-diario', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);
        const resultado = await generarSnapshotDiario({ fecha, transaction: t });

        await t.commit();
        res.json({
            message: 'Snapshot diario generado correctamente',
            fecha: resultado.fecha,
            registros: resultado.registros,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Error al generar snapshot diario', details: error.message });
    }
});

module.exports = router;
