const express = require('express');
const { Visita, DetalleVisita, Cliente, Vehiculo, Producto, HistorialVisita, Marca, Modelo } = require('../models');
const router = express.Router();
const { sequelize } = require('../models');
const { registrarSalidaInventarioFIFO } = require('../services/inventarioService');
const { getBoliviaDateString } = require('../utils/datetimeBolivia');

const normalizeRegistroMode = (value) => {
    const raw = String(value || '').trim().toUpperCase();
    if (raw === 'HISTORICO') return 'HISTORICO';
    return 'OPERATIVO';
};

const normalizeOrigenInventario = (value, modoRegistro) => {
    const raw = String(value || '').trim().toUpperCase();

    if (modoRegistro === 'HISTORICO') return 'HISTORICO';
    if (raw === 'COMPRA_DIRECTA') return 'COMPRA_DIRECTA';
    return 'INVENTARIO';
};

const normalizeText = (value) => String(value || '').trim();

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

let detalleVisitaColumnsCache = null;

const getDetalleVisitaColumns = async (transaction) => {
    if (detalleVisitaColumnsCache) return detalleVisitaColumnsCache;

    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('detalle_visitas', { transaction });
    detalleVisitaColumnsCache = new Set(Object.keys(tableDescription || {}));
    return detalleVisitaColumnsCache;
};

const createDetalleVisitaCompat = async (payload, transaction) => {
    const columns = await getDetalleVisitaColumns(transaction);

    const baseFields = ['visitaId', 'tipo', 'itemId', 'nombreProducto', 'precio', 'cantidad', 'subtotal', 'estado'];
    const optionalFields = ['origenInventario', 'afectaStock', 'costoCompraExterna', 'observacionInventario'];
    const fields = [
        ...baseFields,
        ...optionalFields.filter((field) => columns.has(field)),
    ];

    return DetalleVisita.create(payload, {
        transaction,
        fields,
    });
};

const normalizeDateInput = (value) => {
    if (!value) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
        return getBoliviaDateString(parsed);
    }

    return null;
};

const addDateRangeClause = ({ whereClause, fechaInicio, fechaFin, Op }) => {
    const inicio = normalizeDateInput(fechaInicio);
    const fin = normalizeDateInput(fechaFin);

    if (!inicio && !fin) return;

    const filters = whereClause[Op.and] || [];

    if (inicio && fin) {
        filters.push(
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('Visita.fecha')),
                { [Op.between]: [inicio, fin] }
            )
        );
    } else if (inicio) {
        filters.push(
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('Visita.fecha')),
                { [Op.gte]: inicio }
            )
        );
    } else {
        filters.push(
            sequelize.where(
                sequelize.fn('DATE', sequelize.col('Visita.fecha')),
                { [Op.lte]: fin }
            )
        );
    }

    whereClause[Op.and] = filters;
};

// Obtener todas las visitas
// Obtener todas las visitas con paginación
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', clienteId, vehiculoId, fechaInicio, fechaFin } = req.query;
        const offset = (page - 1) * limit;
        const { Op } = require('sequelize');

        const whereClause = {};

        if (clienteId) whereClause.clienteId = clienteId;
        if (vehiculoId) whereClause.vehiculoId = vehiculoId;

        addDateRangeClause({ whereClause, fechaInicio, fechaFin, Op });

        if (search) {
            const term = String(search).trim();
            const platePattern = term.replace(/[^a-zA-Z0-9]/g, '%');
            whereClause[Op.or] = [
                { '$Cliente.nombre$': { [Op.like]: `%${term}%` } },
                { '$Cliente.telefono$': { [Op.like]: `%${term}%` } },
                { '$Cliente.nit$': { [Op.like]: `%${term}%` } },
                { '$Cliente.direccion$': { [Op.like]: `%${term}%` } },
                { '$Vehiculo.placa$': { [Op.like]: `%${platePattern}%` } },
                { '$Vehiculo.marcaVehiculo.nombre$': { [Op.like]: `%${term}%` } },
                { '$Vehiculo.modeloVehiculo.nombre$': { [Op.like]: `%${term}%` } },
                sequelize.where(sequelize.cast(sequelize.col('Vehiculo.anio'), 'CHAR'), { [Op.like]: `%${term}%` }),
                { tipoPago: { [Op.like]: `%${term}%` } },
                sequelize.where(sequelize.cast(sequelize.col('Visita.kilometraje'), 'CHAR'), { [Op.like]: `%${term}%` }),
                sequelize.where(sequelize.cast(sequelize.col('Visita.proximoCambio'), 'CHAR'), { [Op.like]: `%${term}%` }),
                sequelize.where(sequelize.cast(sequelize.col('Visita.total'), 'CHAR'), { [Op.like]: `%${term}%` }),
            ];
        }

        const includeOptions = [
            { 
                model: Cliente,
            },
            { 
                model: Vehiculo,
                include: [
                    {
                        model: Marca,
                        as: 'marcaVehiculo',
                        attributes: ['id', 'nombre']
                    },
                    {
                        model: Modelo,
                        as: 'modeloVehiculo',
                        attributes: ['id', 'nombre']
                    }
                ]
            },
            { 
                model: DetalleVisita,
                as: 'detalles',
                separate: true // Optimización para evitar problemas con limit/offset y hasMany
            }
        ];

        const { count, rows } = await Visita.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']],
            distinct: true,
            subQuery: false // Necesario para filtrar por columnas de tablas incluidas (Cliente/Vehiculo)
        });

        // Enriquecer detalles con nombres de productos/servicios
        const { Servicio } = require('../models');
        const visitasEnriquecidas = await Promise.all(
            rows.map(async (visita) => {
                const visitaJSON = visita.toJSON();
                if (visitaJSON.detalles && visitaJSON.detalles.length > 0) {
                    visitaJSON.detalles = await Promise.all(
                        visitaJSON.detalles.map(async (detalle) => {
                            let nombre = 'N/A';
                            if (detalle.tipo === 'Producto') {
                                const producto = await Producto.findByPk(detalle.itemId, { attributes: ['nombre'] });
                                nombre = producto ? producto.nombre : (detalle.nombreProducto || 'Producto eliminado');
                            } else if (detalle.tipo === 'Servicio') {
                                const servicio = await Servicio.findByPk(detalle.itemId, { attributes: ['nombre'] });
                                nombre = servicio ? servicio.nombre : (detalle.nombreProducto || 'Servicio eliminado');
                            }
                            return { ...detalle, nombre };
                        })
                    );
                }
                return visitaJSON;
            })
        );

        res.json({
            data: visitasEnriquecidas,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error al obtener visitas:', error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

// Crear una visita
router.post('/', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const fechaVisita = normalizeDateInput(req.body.fecha) || getBoliviaDateString();
        const modoRegistroInventario = normalizeRegistroMode(req.body.modoRegistroInventario);
        const detalleMap = [];

        // 1. Crear la visita
        const visita = await Visita.create({
            clienteId: req.body.clienteId,
            vehiculoId: req.body.vehiculoId,
            fecha: fechaVisita,
            kilometraje: req.body.kilometraje,
            proximoCambio: req.body.proximoCambio,
            tipoPago: req.body.tipoPago,
            descuento: req.body.descuento || 0,
            total: req.body.total
        }, { transaction: t });

        // 2. Crear los detalles y actualizar stock
        if (req.body.detalles && req.body.detalles.length > 0) {
            for (let detalleIndex = 0; detalleIndex < req.body.detalles.length; detalleIndex += 1) {
                const detalle = req.body.detalles[detalleIndex];
                let nombreItem = null;
                let producto = null;
                let itemIdFinal = toNumber(detalle.itemId, 0);
                const origenInventario = normalizeOrigenInventario(detalle.origenInventario, modoRegistroInventario);
                const afectaStockSolicitado = modoRegistroInventario === 'OPERATIVO'
                    && origenInventario === 'INVENTARIO'
                    && detalle.afectaStock !== false;
                const costoCompraExterna = toNumber(detalle.costoCompraExterna, 0);
                const observacionInventario = detalle.observacionInventario || null;

                // Si es un producto, obtener datos y validar stock antes de crear el detalle
                if (detalle.tipo === 'Producto') {
                    if (itemIdFinal > 0) {
                        producto = await Producto.findByPk(itemIdFinal, { transaction: t });
                    }

                    const nombreProductoManual = normalizeText(detalle.nombreProductoManual);
                    const registrarProductoCatalogo = Boolean(detalle.registrarProductoCatalogo);

                    if (!producto && registrarProductoCatalogo) {
                        const nombreCatalogo = nombreProductoManual || `Producto externo visita ${visita.id}-${detalleIndex + 1}`;
                        const precioVentaCatalogo = Math.max(toNumber(detalle.precio, 0), 0);
                        const precioCostoCatalogo = Math.max(
                            toNumber(detalle.precioCostoRegistro, precioVentaCatalogo),
                            0
                        );

                        producto = await Producto.create({
                            nombre: nombreCatalogo,
                            sku: normalizeText(detalle.skuRegistro) || null,
                            stock: 0,
                            stockMinimo: 0,
                            precioCosto: precioCostoCatalogo,
                            precioVenta: precioVentaCatalogo,
                            fechaAdquisicion: fechaVisita,
                        }, { transaction: t });

                        itemIdFinal = producto.id;
                    }

                    if (producto) {
                        nombreItem = producto.nombre;
                        itemIdFinal = producto.id;

                        if (afectaStockSolicitado) {
                            const nuevoStock = producto.stock - detalle.cantidad;
                            if (nuevoStock < 0) {
                                throw new Error(`Stock insuficiente para el producto ${producto.nombre}. Marca el item como compra directa o usa registro historico.`);
                            }

                            await registrarSalidaInventarioFIFO({
                                productoId: producto.id,
                                cantidad: detalle.cantidad,
                                referenciaTipo: 'VISITA',
                                referenciaId: visita.id,
                                observaciones: `Salida por visita ${visita.id}`,
                                transaction: t,
                            });

                            await producto.update({ stock: nuevoStock }, { transaction: t });
                        }
                    } else {
                        if (!nombreProductoManual) {
                            throw new Error('Producto no registrado: ingrese nombre manual o seleccione un producto del catálogo.');
                        }

                        nombreItem = nombreProductoManual;
                        itemIdFinal = 0;
                    }
                } else if (detalle.tipo === 'Servicio') {
                    // Si es un servicio, obtener su nombre para el snapshot
                    const { Servicio } = require('../models');
                    const servicio = await Servicio.findByPk(detalle.itemId, { transaction: t });
                    if (servicio) {
                        nombreItem = servicio.nombre;
                    }
                }

                const afectaStock = detalle.tipo === 'Producto'
                    ? (afectaStockSolicitado && Boolean(producto && itemIdFinal > 0))
                    : false;

                await createDetalleVisitaCompat({
                    visitaId: visita.id,
                    tipo: detalle.tipo,
                    itemId: itemIdFinal,
                    nombreProducto: nombreItem, // Guardar snapshot del nombre (producto o servicio)
                    precio: detalle.precio,
                    cantidad: detalle.cantidad || 1,
                    subtotal: detalle.precio * (detalle.cantidad || 1),
                    origenInventario,
                    afectaStock,
                    costoCompraExterna: costoCompraExterna > 0 ? costoCompraExterna : null,
                    observacionInventario,
                    estado: 1
                }, t);

                detalleMap.push({
                    requestIndex: detalleIndex,
                    tipo: detalle.tipo,
                    itemIdOriginal: toNumber(detalle.itemId, 0),
                    itemIdFinal,
                    nombre: nombreItem,
                    registradoEnCatalogo: Boolean(producto && toNumber(detalle.itemId, 0) <= 0 && Boolean(detalle.registrarProductoCatalogo)),
                    afectaStock,
                });
            }
        }

        // 3. Crear el historial de visita con snapshots
        const cliente = await Cliente.findByPk(req.body.clienteId, { transaction: t });
        const vehiculo = await Vehiculo.findByPk(req.body.vehiculoId, { 
            include: [
                { model: Marca, as: 'marcaVehiculo' },
                { model: Modelo, as: 'modeloVehiculo' }
            ],
            transaction: t 
        });

        await HistorialVisita.create({
            clienteId: req.body.clienteId,
            vehiculoId: req.body.vehiculoId,
            visitaId: visita.id,
            fecha: visita.fecha,
            kilometraje: visita.kilometraje,
            proximoCambio: visita.proximoCambio,
            total: visita.total,
            tipoPago: visita.tipoPago,
            descuento: visita.descuento,
            // Snapshots para proteger historial
            nombreCliente: cliente ? cliente.nombre : null,
            placaVehiculo: vehiculo ? vehiculo.placa : null,
            marcaVehiculo: vehiculo && vehiculo.marcaVehiculo ? vehiculo.marcaVehiculo.nombre : null,
            modeloVehiculo: vehiculo && vehiculo.modeloVehiculo ? vehiculo.modeloVehiculo.nombre : null,
            anioVehiculo: vehiculo ? vehiculo.anio : null
        }, { transaction: t });

        // 4. Confirmar la transacción
        await t.commit();

        // 5. Emitir evento WebSocket sin bloquear la respuesta principal
        try {
            const io = req.app.get('io') || req.io;
            if (io && typeof io.emit === 'function') {
                io.emit('stockUpdated');
            } else {
                console.warn('[visitas] Socket.IO no disponible para emitir stockUpdated');
            }
        } catch (emitError) {
            console.warn('[visitas] Error al emitir stockUpdated:', emitError.message);
        }

        // 6. Obtener la visita completa con sus detalles
        let visitaCompleta = null;
        try {
            visitaCompleta = await Visita.findByPk(visita.id, {
                include: [
                    { model: Cliente },
                    { model: Vehiculo },
                    { model: DetalleVisita, as: 'detalles' }
                ]
            });
        } catch (fetchError) {
            console.warn('[visitas] No se pudo recuperar visita completa post-commit:', fetchError.message);
        }

        const responsePayload = visitaCompleta && typeof visitaCompleta.toJSON === 'function'
            ? visitaCompleta.toJSON()
            : (visitaCompleta || (typeof visita.toJSON === 'function' ? visita.toJSON() : visita));

        responsePayload.detalleMap = detalleMap;

        res.status(201).json(responsePayload);

    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        console.error('[visitas] Error al crear visita:', {
            message: error.message,
            stack: error.stack,
            payload: {
                clienteId: req.body?.clienteId,
                vehiculoId: req.body?.vehiculoId,
                fecha: req.body?.fecha,
                detallesCount: Array.isArray(req.body?.detalles) ? req.body.detalles.length : 0,
                total: req.body?.total,
            },
        });
        res.status(500).json({ 
            error: 'Error al crear la visita',
            details: error.message,
            code: 'VISIT_CREATE_ERROR'
        });
    }
});

// Obtener una visita por ID
router.get('/:id', async (req, res) => {
    try {
        const visita = await Visita.findByPk(req.params.id, {
            include: [
                {
                    model: Cliente,
                    attributes: ['id', 'nombre', 'telefono', 'direccion', 'nit']
                },
                {
                    model: Vehiculo,
                    attributes: ['id', 'placa', 'anio'],
                    include: [
                        {
                            model: Marca,
                            as: 'marcaVehiculo',
                            attributes: ['id', 'nombre']
                        },
                        {
                            model: Modelo,
                            as: 'modeloVehiculo',
                            attributes: ['id', 'nombre']
                        }
                    ]
                },
                {
                    model: DetalleVisita,
                    as: 'detalles',
                    attributes: ['id', 'tipo', 'itemId', 'nombreProducto', 'precio', 'cantidad', 'subtotal']
                }
            ]
        });

        if (!visita) {
            return res.status(404).json({ error: 'Visita no encontrada' });
        }

        // Enriquecer los detalles con nombres de productos/servicios
        const { Servicio } = require('../models');
        const detallesEnriquecidos = await Promise.all(
            visita.detalles.map(async (detalle) => {
                let nombre = 'N/A';
                if (detalle.tipo === 'Producto') {
                    const producto = await Producto.findByPk(detalle.itemId, { attributes: ['nombre'] });
                    nombre = producto ? producto.nombre : (detalle.nombreProducto || 'Producto eliminado');
                } else if (detalle.tipo === 'Servicio') {
                    const servicio = await Servicio.findByPk(detalle.itemId, { attributes: ['nombre'] });
                    nombre = servicio ? servicio.nombre : (detalle.nombreProducto || 'Servicio eliminado');
                }
                return {
                    ...detalle.toJSON(),
                    nombre
                };
            })
        );

        const visitaCompleta = visita.toJSON();
        visitaCompleta.detalles = detallesEnriquecidos;

        res.json(visitaCompleta);
    } catch (err) {
        console.error('Error al obtener visita:', err);
        res.status(500).json({ error: 'Error al obtener visita' });
    }
});

// Eliminar una visita
router.delete('/:id', async (req, res) => {
    try {
        const visita = await Visita.findByPk(req.params.id);
        if (!visita) return res.status(404).json({ error: 'Visita no encontrada' });

        await visita.destroy();
        res.json({ message: 'Visita eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar visita' });
    }
});

module.exports = router;
