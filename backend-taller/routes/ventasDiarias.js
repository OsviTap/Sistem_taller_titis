const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { google } = require('googleapis');
const {
    sequelize,
    Producto,
    VentaDiaria,
    DetalleVentaDiaria,
    GastoDiario,
    PlanillaRegistro,
    CajaTurno,
} = require('../models');
const { registrarSalidaInventarioFIFO } = require('../services/inventarioService');

const router = express.Router();

const toDateRange = (fechaInicio, fechaFin) => {
    const where = {};
    if (fechaInicio && fechaFin) {
        where[Op.between] = [fechaInicio, fechaFin];
    } else if (fechaInicio) {
        where[Op.gte] = fechaInicio;
    } else if (fechaFin) {
        where[Op.lte] = fechaFin;
    }
    return where;
};

const buildMonthRange = (year, month) => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (Number.isNaN(y) || Number.isNaN(m) || m < 1 || m > 12) {
        throw new Error('Parámetros de año/mes no válidos');
    }

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
};

const toRows = (records) => records.map((item) => item.toJSON ? item.toJSON() : item);

const getTopProductos = async (fechaInicio, fechaFin) => {
    const whereVenta = { estado: 1, fecha: { [Op.between]: [fechaInicio, fechaFin] } };

    const rows = await DetalleVentaDiaria.findAll({
        attributes: [
            'nombreProducto',
            [fn('SUM', col('DetalleVentaDiaria.cantidad')), 'cantidadTotal'],
            [fn('SUM', col('DetalleVentaDiaria.subtotal')), 'montoTotal'],
            [fn('SUM', col('DetalleVentaDiaria.ganancia')), 'gananciaTotal'],
        ],
        include: [{ model: VentaDiaria, as: 'venta', attributes: [], where: whereVenta }],
        group: ['DetalleVentaDiaria.nombreProducto'],
        order: [[literal('cantidadTotal'), 'DESC']],
        limit: 20,
        raw: true,
    });

    return rows.map((item) => ({
        nombreProducto: item.nombreProducto,
        cantidadTotal: Number(item.cantidadTotal || 0),
        montoTotal: Number(item.montoTotal || 0),
        gananciaTotal: Number(item.gananciaTotal || 0),
    }));
};

const getResumenGeneral = async (fechaInicio, fechaFin) => {
    const whereVentas = { estado: 1, fecha: { [Op.between]: [fechaInicio, fechaFin] } };
    const whereGastos = { estado: 1, fecha: { [Op.between]: [fechaInicio, fechaFin] } };
    const wherePlanillas = { estado: 1, fecha: { [Op.between]: [fechaInicio, fechaFin] } };

    const [ventas, gastos, planillas] = await Promise.all([
        VentaDiaria.findAll({ where: whereVentas }),
        GastoDiario.findAll({ where: whereGastos }),
        PlanillaRegistro.findAll({ where: wherePlanillas }),
    ]);

    const totalVentas = ventas.reduce((acc, item) => acc + Number(item.total || 0), 0);
    const totalDescuentos = ventas.reduce((acc, item) => acc + Number(item.descuento || 0), 0);
    const totalGastosOperativos = gastos.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalPlanillas = planillas.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalGastos = totalGastosOperativos + totalPlanillas;

    const totalSueldosServicios = planillas
        .filter((item) => item.tipoPlanilla === 'SUELDOS_SERVICIOS')
        .reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalInsumosTienda = planillas
        .filter((item) => item.tipoPlanilla === 'TIENDA')
        .reduce((acc, item) => acc + Number(item.monto || 0), 0);

    const totalProductosVendidos = await DetalleVentaDiaria.sum('cantidad', {
        include: [{ model: VentaDiaria, as: 'venta', where: whereVentas, attributes: [] }],
    });

    return {
        totalVentas,
        totalDescuentos,
        totalGastosOperativos,
        totalPlanillas,
        totalGastos,
        utilidadNeta: totalVentas - totalGastos,
        totalProductosVendidos: Number(totalProductosVendidos || 0),
        totalRegistrosVentas: ventas.length,
        totalRegistrosGastos: gastos.length,
        totalRegistrosPlanillas: planillas.length,
        totalSueldosServicios,
        totalInsumosTienda,
    };
};

const getReporteMensualData = async (year, month) => {
    const { startDate, endDate } = buildMonthRange(year, month);
    const whereRange = { [Op.between]: [startDate, endDate] };

    const [
        ventas,
        gastos,
        planillas,
        cajaTurnos,
        resumen,
        topProductos,
    ] = await Promise.all([
        VentaDiaria.findAll({
            where: { estado: 1, fecha: whereRange },
            include: [{ model: DetalleVentaDiaria, as: 'detalles' }],
            order: [['fecha', 'ASC'], ['id', 'ASC']],
        }),
        GastoDiario.findAll({
            where: { estado: 1, fecha: whereRange },
            order: [['fecha', 'ASC'], ['id', 'ASC']],
        }),
        PlanillaRegistro.findAll({
            where: { estado: 1, fecha: whereRange },
            order: [['fecha', 'ASC'], ['id', 'ASC']],
        }),
        CajaTurno.findAll({
            where: { fecha: whereRange },
            order: [['fecha', 'ASC'], ['id', 'ASC']],
        }),
        getResumenGeneral(startDate, endDate),
        getTopProductos(startDate, endDate),
    ]);

    return {
        periodo: { year: parseInt(year, 10), month: parseInt(month, 10), startDate, endDate },
        resumen,
        ventas: toRows(ventas),
        gastos: toRows(gastos),
        planillas: toRows(planillas),
        cajaTurnos: toRows(cajaTurnos),
        topProductos,
    };
};

router.post('/ventas', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            fecha,
            numeroVenta,
            clienteNombre,
            metodoPago,
            descuento = 0,
            observaciones,
            items = [],
        } = req.body;

        if (!items.length) {
            await t.rollback();
            return res.status(400).json({ error: 'Debe agregar al menos un producto.' });
        }

        const descuentoNum = Number(descuento || 0);
        const venta = await VentaDiaria.create({
            fecha: fecha || new Date(),
            numeroVenta,
            clienteNombre,
            metodoPago: metodoPago || 'Efectivo',
            subtotal: 0,
            descuento: descuentoNum,
            total: 0,
            observaciones,
        }, { transaction: t });

        const detalleRows = [];
        let subtotal = 0;
        let totalGanancia = 0;

        for (const item of items) {
            const producto = await Producto.findByPk(item.productoId, { transaction: t });
            if (!producto) {
                throw new Error(`Producto no encontrado: ${item.productoId}`);
            }

            const cantidad = parseInt(item.cantidad, 10);
            if (Number.isNaN(cantidad) || cantidad <= 0) {
                throw new Error(`Cantidad no válida para producto ${producto.nombre}`);
            }

            if (producto.stock < cantidad) {
                throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
            }

            const precioUnitario = Number(item.precioUnitario ?? producto.precioVenta);
            const costoUnitario = Number(producto.precioCosto || 0);
            const subtotalItem = precioUnitario * cantidad;
            const gananciaItem = (precioUnitario - costoUnitario) * cantidad;

            subtotal += subtotalItem;
            totalGanancia += gananciaItem;

            await registrarSalidaInventarioFIFO({
                productoId: producto.id,
                cantidad,
                referenciaTipo: 'VENTA_DIARIA',
                referenciaId: venta.id,
                observaciones: numeroVenta || observaciones || null,
                transaction: t,
            });

            detalleRows.push({
                productoId: producto.id,
                nombreProducto: producto.nombre,
                precioUnitario,
                costoUnitario,
                cantidad,
                subtotal: subtotalItem,
                ganancia: gananciaItem,
            });

            await producto.update({ stock: producto.stock - cantidad }, { transaction: t });
        }

        const total = Math.max(subtotal - descuentoNum, 0);

        await venta.update({ subtotal, total }, { transaction: t });

        await DetalleVentaDiaria.bulkCreate(
            detalleRows.map((d) => ({ ...d, ventaDiariaId: venta.id })),
            { transaction: t }
        );

        await t.commit();

        const ventaCompleta = await VentaDiaria.findByPk(venta.id, {
            include: [{ model: DetalleVentaDiaria, as: 'detalles' }],
        });

        res.status(201).json({
            venta: ventaCompleta,
            gananciaTotal: totalGanancia,
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: 'Error al registrar venta diaria', details: error.message });
    }
});

router.get('/ventas', async (req, res) => {
    try {
        const { page = 1, limit = 10, fechaInicio, fechaFin } = req.query;
        const offset = (page - 1) * limit;

        const where = { estado: 1 };
        const rango = toDateRange(fechaInicio, fechaFin);
        if (Object.keys(rango).length) {
            where.fecha = rango;
        }

        const { count, rows } = await VentaDiaria.findAndCountAll({
            where,
            include: [{ model: DetalleVentaDiaria, as: 'detalles' }],
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['fecha', 'DESC'], ['id', 'DESC']],
            distinct: true,
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas diarias', details: error.message });
    }
});

router.post('/gastos', async (req, res) => {
    try {
        const {
            fecha,
            categoria,
            descripcion,
            monto,
            metodoPago,
            comprobante,
            observaciones,
        } = req.body;

        if (!categoria || !descripcion) {
            return res.status(400).json({ error: 'Categoría y descripción son obligatorias.' });
        }

        const montoNum = Number(monto);
        if (Number.isNaN(montoNum) || montoNum <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor a 0.' });
        }

        const gasto = await GastoDiario.create({
            fecha: fecha || new Date(),
            categoria,
            descripcion,
            monto: montoNum,
            metodoPago: metodoPago || 'Efectivo',
            comprobante,
            observaciones,
        });

        res.status(201).json(gasto);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar gasto diario', details: error.message });
    }
});

router.get('/gastos', async (req, res) => {
    try {
        const { page = 1, limit = 10, fechaInicio, fechaFin } = req.query;
        const offset = (page - 1) * limit;

        const where = { estado: 1 };
        const rango = toDateRange(fechaInicio, fechaFin);
        if (Object.keys(rango).length) {
            where.fecha = rango;
        }

        const { count, rows } = await GastoDiario.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['fecha', 'DESC'], ['id', 'DESC']],
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener gastos diarios', details: error.message });
    }
});

router.get('/resumen', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const hoy = new Date().toISOString().split('T')[0];
        const inicio = fechaInicio || hoy;
        const fin = fechaFin || hoy;

        const resumen = await getResumenGeneral(inicio, fin);
        res.json(resumen);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener resumen diario', details: error.message });
    }
});

router.post('/planillas', async (req, res) => {
    try {
        const {
            fecha,
            tipoPlanilla,
            categoria,
            concepto,
            monto,
            metodoPago,
            observaciones,
        } = req.body;

        if (!tipoPlanilla || !categoria || !concepto) {
            return res.status(400).json({ error: 'Tipo, categoría y concepto son obligatorios.' });
        }

        const montoNum = Number(monto);
        if (Number.isNaN(montoNum) || montoNum <= 0) {
            return res.status(400).json({ error: 'El monto debe ser mayor a 0.' });
        }

        const registro = await PlanillaRegistro.create({
            fecha: fecha || new Date(),
            tipoPlanilla,
            categoria,
            concepto,
            monto: montoNum,
            metodoPago: metodoPago || 'Efectivo',
            observaciones,
        });

        res.status(201).json(registro);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar planilla', details: error.message });
    }
});

router.get('/planillas', async (req, res) => {
    try {
        const { page = 1, limit = 20, fechaInicio, fechaFin, tipoPlanilla } = req.query;
        const offset = (page - 1) * limit;

        const where = { estado: 1 };
        const rango = toDateRange(fechaInicio, fechaFin);
        if (Object.keys(rango).length) {
            where.fecha = rango;
        }
        if (tipoPlanilla) {
            where.tipoPlanilla = tipoPlanilla;
        }

        const { count, rows } = await PlanillaRegistro.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['fecha', 'DESC'], ['id', 'DESC']],
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener planillas', details: error.message });
    }
});

router.post('/caja-turnos/apertura', async (req, res) => {
    try {
        const { fecha, turno, responsable, saldoInicial, observaciones } = req.body;

        const saldoInicialNum = Number(saldoInicial);
        if (Number.isNaN(saldoInicialNum) || saldoInicialNum < 0) {
            return res.status(400).json({ error: 'Saldo inicial no válido.' });
        }

        const fechaTurno = fecha || new Date().toISOString().split('T')[0];

        const existente = await CajaTurno.findOne({
            where: {
                fecha: fechaTurno,
                turno,
                estado: 'ABIERTO',
            },
        });

        if (existente) {
            return res.status(400).json({ error: 'Ya existe un turno abierto para esa fecha y turno.' });
        }

        const caja = await CajaTurno.create({
            fecha: fechaTurno,
            turno,
            responsable,
            saldoInicial: saldoInicialNum,
            observaciones,
        });

        res.status(201).json(caja);
    } catch (error) {
        res.status(500).json({ error: 'Error al abrir turno de caja', details: error.message });
    }
});

router.post('/caja-turnos/cierre/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { saldoArqueo, ingresosExtra = 0, observaciones } = req.body;

        const caja = await CajaTurno.findByPk(id);
        if (!caja || caja.estado !== 'ABIERTO') {
            return res.status(404).json({ error: 'Turno de caja no encontrado o ya cerrado.' });
        }

        const arqueoNum = Number(saldoArqueo);
        const ingresosExtraNum = Number(ingresosExtra || 0);
        if (Number.isNaN(arqueoNum) || arqueoNum < 0) {
            return res.status(400).json({ error: 'Saldo arqueo no válido.' });
        }

        const fechaCierre = new Date();
        const rangoCierre = {
            [Op.between]: [caja.fechaApertura, fechaCierre],
        };

        const [ventasEfectivo, gastosDiariosEfectivo, planillasEfectivo] = await Promise.all([
            VentaDiaria.sum('total', {
                where: {
                    estado: 1,
                    metodoPago: 'Efectivo',
                    createdAt: rangoCierre,
                },
            }),
            GastoDiario.sum('monto', {
                where: {
                    estado: 1,
                    metodoPago: 'Efectivo',
                    createdAt: rangoCierre,
                },
            }),
            PlanillaRegistro.sum('monto', {
                where: {
                    estado: 1,
                    metodoPago: 'Efectivo',
                    createdAt: rangoCierre,
                },
            }),
        ]);

        const ventasEf = Number(ventasEfectivo || 0);
        const gastosEf = Number(gastosDiariosEfectivo || 0) + Number(planillasEfectivo || 0);
        const saldoTeorico = Number(caja.saldoInicial || 0) + ingresosExtraNum + ventasEf - gastosEf;
        const diferencia = arqueoNum - saldoTeorico;

        await caja.update({
            fechaCierre,
            ventasEfectivo: ventasEf,
            ingresosExtra: ingresosExtraNum,
            gastosEfectivo: gastosEf,
            saldoTeorico,
            saldoArqueo: arqueoNum,
            diferencia,
            estado: 'CERRADO',
            observaciones: observaciones || caja.observaciones,
        });

        res.json(caja);
    } catch (error) {
        res.status(500).json({ error: 'Error al cerrar turno de caja', details: error.message });
    }
});

router.get('/caja-turnos', async (req, res) => {
    try {
        const { page = 1, limit = 20, fechaInicio, fechaFin, estado } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        const rango = toDateRange(fechaInicio, fechaFin);
        if (Object.keys(rango).length) {
            where.fecha = rango;
        }
        if (estado) {
            where.estado = estado;
        }

        const { count, rows } = await CajaTurno.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['fecha', 'DESC'], ['id', 'DESC']],
        });

        res.json({
            data: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener caja por turnos', details: error.message });
    }
});

router.get('/reporte-ejecutivo/mensual', async (req, res) => {
    try {
        const now = new Date();
        const year = req.query.year || now.getFullYear();
        const month = req.query.month || now.getMonth() + 1;

        const reporte = await getReporteMensualData(year, month);
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reporte mensual', details: error.message });
    }
});

router.post('/google-sheets/sync', async (req, res) => {
    try {
        const now = new Date();
        const year = req.body.year || now.getFullYear();
        const month = req.body.month || now.getMonth() + 1;
        const spreadsheetId = req.body.spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

        if (!spreadsheetId) {
            return res.status(400).json({ error: 'Debe proporcionar spreadsheetId o configurar GOOGLE_SHEETS_SPREADSHEET_ID.' });
        }

        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
            ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
            : null;

        if (!clientEmail || !privateKey) {
            return res.status(400).json({
                error: 'Integración no configurada. Defina GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.',
            });
        }

        const reporte = await getReporteMensualData(year, month);

        const auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        const metadata = await sheets.spreadsheets.get({ spreadsheetId });
        const existing = new Set((metadata.data.sheets || []).map((s) => s.properties.title));
        const required = ['Resumen', 'Ventas', 'GastosPlanillas', 'CajaTurnos', 'TopProductos'];
        const addRequests = required
            .filter((name) => !existing.has(name))
            .map((name) => ({ addSheet: { properties: { title: name } } }));

        if (addRequests.length) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: { requests: addRequests },
            });
        }

        const resumenValues = [
            ['Metrica', 'Valor'],
            ['Periodo', `${reporte.periodo.year}-${String(reporte.periodo.month).padStart(2, '0')}`],
            ['Total Ventas', reporte.resumen.totalVentas],
            ['Total Descuentos', reporte.resumen.totalDescuentos],
            ['Gastos Operativos', reporte.resumen.totalGastosOperativos],
            ['Planillas', reporte.resumen.totalPlanillas],
            ['Gastos Totales', reporte.resumen.totalGastos],
            ['Utilidad Neta', reporte.resumen.utilidadNeta],
            ['Productos Vendidos', reporte.resumen.totalProductosVendidos],
            ['Planilla Tienda', reporte.resumen.totalInsumosTienda],
            ['Planilla Sueldos/Servicios', reporte.resumen.totalSueldosServicios],
        ];

        const ventasValues = [
            ['Fecha', 'Nro Venta', 'Cliente', 'Metodo Pago', 'Subtotal', 'Descuento', 'Total', 'Observaciones'],
            ...reporte.ventas.map((v) => [v.fecha, v.numeroVenta || '', v.clienteNombre || 'Mostrador', v.metodoPago, v.subtotal, v.descuento, v.total, v.observaciones || '']),
        ];

        const gastosPlanillasValues = [
            ['Tipo', 'Fecha', 'Categoria', 'Concepto/Descripcion', 'Metodo Pago', 'Monto', 'Observaciones'],
            ...reporte.gastos.map((g) => ['GASTO', g.fecha, g.categoria, g.descripcion, g.metodoPago, g.monto, g.observaciones || '']),
            ...reporte.planillas.map((p) => [p.tipoPlanilla, p.fecha, p.categoria, p.concepto, p.metodoPago, p.monto, p.observaciones || '']),
        ];

        const cajaTurnosValues = [
            ['Fecha', 'Turno', 'Responsable', 'Estado', 'Saldo Inicial', 'Ventas Efectivo', 'Ingresos Extra', 'Gastos Efectivo', 'Saldo Teorico', 'Saldo Arqueo', 'Diferencia', 'Observaciones'],
            ...reporte.cajaTurnos.map((c) => [c.fecha, c.turno, c.responsable || '', c.estado, c.saldoInicial, c.ventasEfectivo, c.ingresosExtra, c.gastosEfectivo, c.saldoTeorico, c.saldoArqueo || '', c.diferencia, c.observaciones || '']),
        ];

        const topProductosValues = [
            ['Producto', 'Cantidad Total', 'Monto Total', 'Ganancia Total'],
            ...reporte.topProductos.map((p) => [p.nombreProducto, p.cantidadTotal, p.montoTotal, p.gananciaTotal]),
        ];

        const datasets = [
            { range: 'Resumen!A1', values: resumenValues },
            { range: 'Ventas!A1', values: ventasValues },
            { range: 'GastosPlanillas!A1', values: gastosPlanillasValues },
            { range: 'CajaTurnos!A1', values: cajaTurnosValues },
            { range: 'TopProductos!A1', values: topProductosValues },
        ];

        for (const ds of datasets) {
            const sheetName = ds.range.split('!')[0];
            await sheets.spreadsheets.values.clear({ spreadsheetId, range: `${sheetName}!A:Z` });
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: ds.range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: ds.values },
            });
        }

        res.json({ message: 'Sincronización con Google Sheets completada.', periodo: reporte.periodo });
    } catch (error) {
        res.status(500).json({ error: 'Error al sincronizar Google Sheets', details: error.message });
    }
});

module.exports = router;
