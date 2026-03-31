const { Op } = require('sequelize');
const { google } = require('googleapis');
const {
    sequelize,
    VentaDiaria,
    GastoDiario,
    PlanillaRegistro,
    CajaTurno,
    GoogleSheetsImportExtra,
} = require('../models');
const { getBoliviaDateString, getBoliviaCurrentTurno } = require('../utils/datetimeBolivia');

const DEFAULT_IMPORT_SHEETS = ['Ventas', 'GastosPlanillas', 'CajaTurnos'];
const SUPPORTED_IMPORT_SHEETS = new Set(DEFAULT_IMPORT_SHEETS);

const SHEET_FIELD_ALIASES = {
    Ventas: {
        fecha: ['fecha'],
        numeroVenta: ['nro venta', 'numero venta'],
        clienteNombre: ['cliente'],
        metodoPago: ['metodo pago'],
        subtotal: ['subtotal'],
        descuento: ['descuento'],
        total: ['total'],
        observaciones: ['observaciones'],
    },
    GastosPlanillas: {
        tipo: ['tipo'],
        fecha: ['fecha'],
        categoria: ['categoria'],
        concepto: ['concepto descripcion', 'concepto'],
        metodoPago: ['metodo pago'],
        monto: ['monto'],
        observaciones: ['observaciones'],
    },
    CajaTurnos: {
        fecha: ['fecha'],
        turno: ['turno'],
        responsable: ['responsable'],
        estado: ['estado'],
        saldoInicial: ['saldo inicial'],
        ventasEfectivo: ['ventas efectivo'],
        ingresosExtra: ['ingresos extra'],
        gastosEfectivo: ['gastos efectivo'],
        saldoTeorico: ['saldo teorico'],
        saldoArqueo: ['saldo arqueo'],
        diferencia: ['diferencia'],
        observaciones: ['observaciones'],
    },
};

const cleanText = (value) => String(value ?? '').trim();

const toBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return fallback;
    const normalized = cleanText(value).toLowerCase();
    return !['0', 'false', 'no', 'off'].includes(normalized);
};

const normalizeHeader = (value) => cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizePaymentMethod = (value) => {
    const normalized = normalizeHeader(value);
    const map = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia',
        qr: 'QR',
        mixto: 'Mixto',
    };
    return map[normalized] || 'Efectivo';
};

const normalizePlanType = (value) => {
    const normalized = normalizeHeader(value).replace(/\s+/g, '_');
    if (normalized === 'tienda') return 'TIENDA';
    if (normalized === 'sueldos_servicios') return 'SUELDOS_SERVICIOS';

    const raw = cleanText(value).toUpperCase();
    if (raw === 'TIENDA' || raw === 'SUELDOS_SERVICIOS') return raw;
    return null;
};

const normalizeShift = (value) => {
    const normalized = normalizeHeader(value);
    if (normalized === 'manana' || normalized === 'manana turno') return 'Manana';
    if (normalized === 'tarde') return 'Tarde';
    if (normalized === 'noche') return 'Noche';
    return getBoliviaCurrentTurno();
};

const normalizeCajaState = (value) => {
    const normalized = normalizeHeader(value);
    if (normalized === 'cerrado') return 'CERRADO';
    return 'ABIERTO';
};

const parseDecimal = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

    const cleaned = cleanText(value)
        .replace(/bs\.?/gi, '')
        .replace(/\s+/g, '')
        .replace(/,/g, '.');

    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const parseDateCell = (value) => {
    if (value === undefined || value === null || value === '') return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        const epoch = new Date(Date.UTC(1899, 11, 30));
        const date = new Date(epoch.getTime() + (value * 24 * 60 * 60 * 1000));
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString().slice(0, 10);
        }
    }

    const text = cleanText(value);

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return text.slice(0, 10);
    }

    const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const day = String(parseInt(slash[1], 10)).padStart(2, '0');
        const month = String(parseInt(slash[2], 10)).padStart(2, '0');
        const year = slash[3];
        return `${year}-${month}-${day}`;
    }

    const dash = text.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dash) {
        const day = String(parseInt(dash[1], 10)).padStart(2, '0');
        const month = String(parseInt(dash[2], 10)).padStart(2, '0');
        const year = dash[3];
        return `${year}-${month}-${day}`;
    }

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    return null;
};

const toRowObjects = (rows) => {
    if (!Array.isArray(rows) || rows.length <= 1) return [];

    const headers = (rows[0] || []).map((header) => normalizeHeader(header));

    return rows
        .slice(1)
        .map((row, index) => {
            const payload = { __rowNumber: index + 2 };
            headers.forEach((header, colIndex) => {
                if (!header) return;
                payload[header] = row[colIndex];
            });
            return payload;
        })
        .filter((row) => Object.entries(row)
            .some(([key, value]) => key !== '__rowNumber' && cleanText(value) !== ''));
};

const getAliasesForField = (sheetName, fieldKey, columnMappings = {}) => {
    const custom = columnMappings?.[sheetName]?.[fieldKey];
    if (custom !== undefined && custom !== null && custom !== '') {
        const list = Array.isArray(custom) ? custom : [custom];
        const normalizedList = list.map((item) => normalizeHeader(item)).filter(Boolean);
        if (normalizedList.length) return normalizedList;
    }

    return (SHEET_FIELD_ALIASES[sheetName]?.[fieldKey] || []).map((item) => normalizeHeader(item));
};

const getMappedValue = (row, sheetName, fieldKey, columnMappings = {}) => {
    const aliases = getAliasesForField(sheetName, fieldKey, columnMappings);
    return pickField(row, aliases);
};

const getExpectedFieldsSpec = () => SHEET_FIELD_ALIASES;

const analyzeSheetStructure = ({ rows, sheetName, columnMappings = {} }) => {
    const rawHeaders = (rows[0] || []).map((header) => cleanText(header));
    const normalizedHeaders = rawHeaders.map((header) => normalizeHeader(header));

    const expected = SHEET_FIELD_ALIASES[sheetName] || {};
    const mappedFields = {};
    const matchedHeaderSet = new Set();

    Object.keys(expected).forEach((fieldKey) => {
        const aliases = getAliasesForField(sheetName, fieldKey, columnMappings);
        const matchedHeader = normalizedHeaders.find((header) => aliases.includes(header)) || null;
        mappedFields[fieldKey] = {
            aliases,
            matchedHeader,
            matched: Boolean(matchedHeader),
        };
        if (matchedHeader) matchedHeaderSet.add(matchedHeader);
    });

    const unknownColumns = normalizedHeaders
        .filter((header) => header && !matchedHeaderSet.has(header))
        .map((header, index) => ({
            originalHeader: rawHeaders[index],
            normalizedHeader: header,
        }));

    return {
        sheetName,
        totalRows: Math.max((rows || []).length - 1, 0),
        headers: rawHeaders,
        normalizedHeaders,
        mappedFields,
        unknownColumns,
    };
};

const pickField = (row, aliases) => {
    for (const alias of aliases) {
        const value = row[alias];
        if (value !== undefined && value !== null && cleanText(value) !== '') {
            return value;
        }
    }
    return '';
};

const toPlainObject = (value) => {
    if (!value) return {};
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return parsed;
            }
            return {};
        } catch (error) {
            return {};
        }
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }

    return {};
};

const getRecognizedHeadersForSheet = ({ sheetName, columnMappings = {} }) => {
    const expected = SHEET_FIELD_ALIASES[sheetName] || {};
    const recognized = new Set();

    Object.keys(expected).forEach((fieldKey) => {
        const aliases = getAliasesForField(sheetName, fieldKey, columnMappings);
        aliases.forEach((alias) => {
            if (alias) recognized.add(alias);
        });
    });

    return recognized;
};

const extractUnknownColumnsForRow = ({ row, sheetName, columnMappings = {} }) => {
    const recognizedHeaders = getRecognizedHeadersForSheet({ sheetName, columnMappings });
    const extras = {};

    Object.entries(row || {}).forEach(([key, value]) => {
        if (key === '__rowNumber') return;
        if (recognizedHeaders.has(key)) return;
        if (cleanText(value) === '') return;

        extras[key] = typeof value === 'string' ? value.trim() : value;
    });

    return Object.keys(extras).length ? extras : null;
};

const mergeExtraColumns = (currentValue, incomingValue) => {
    const current = toPlainObject(currentValue);
    const incoming = toPlainObject(incomingValue);
    const merged = { ...current, ...incoming };
    return Object.keys(merged).length ? merged : null;
};

const persistUnknownColumns = async ({
    transaction,
    dryRun,
    sheetName,
    entityType,
    entityId,
    row,
    source,
    columnMappings = {},
}) => {
    const columnasExtra = extractUnknownColumnsForRow({ row, sheetName, columnMappings });
    if (!columnasExtra) return false;

    if (dryRun || !entityId) return true;

    const existingExtra = await GoogleSheetsImportExtra.findOne({
        where: {
            hoja: sheetName,
            entidadTipo: entityType,
            entidadId: entityId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    const payload = {
        hoja: sheetName,
        entidadTipo: entityType,
        entidadId: entityId,
        rowNumber: row.__rowNumber || null,
        source,
        columnasExtra: mergeExtraColumns(existingExtra?.columnasExtra, columnasExtra) || columnasExtra,
    };

    if (existingExtra) {
        await existingExtra.update(payload, { transaction });
    } else {
        await GoogleSheetsImportExtra.create(payload, { transaction });
    }

    return true;
};

const hashText = (input) => {
    const text = String(input || '');
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
};

const buildImportTag = (scope, payload) => `[GS_IMPORT:${scope}-${hashText(JSON.stringify(payload))}]`;

const appendImportTag = (observaciones, importTag, source) => {
    const base = cleanText(observaciones);
    if (base.includes(importTag)) return base;

    const extra = `${importTag} ${source}`.trim();
    return [base, extra].filter(Boolean).join(' | ');
};

const buildGoogleSheetsClient = ({ clientEmail, privateKey }) => {
    const auth = new google.auth.JWT(
        clientEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
};

const getGoogleCredentials = () => {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
        ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
        : null;

    if (!clientEmail || !privateKey) {
        throw new Error('Credenciales Google no configuradas. Defina GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    }

    return { clientEmail, privateKey };
};

const fetchSheetRows = async ({ sheetsClient, spreadsheetId, sheetName }) => {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
    });

    return response.data.values || [];
};

const importVentas = async ({ rows, transaction, dryRun, upsert, source, columnMappings = {} }) => {
    const summary = { created: 0, updated: 0, skipped: 0, extrasCapturados: 0, errors: [] };

    for (const row of rows) {
        try {
            const fecha = parseDateCell(getMappedValue(row, 'Ventas', 'fecha', columnMappings)) || getBoliviaDateString();
            const numeroVenta = cleanText(getMappedValue(row, 'Ventas', 'numeroVenta', columnMappings)) || null;
            const clienteNombre = cleanText(getMappedValue(row, 'Ventas', 'clienteNombre', columnMappings)) || 'Mostrador';
            const metodoPago = normalizePaymentMethod(getMappedValue(row, 'Ventas', 'metodoPago', columnMappings));
            const subtotal = parseDecimal(getMappedValue(row, 'Ventas', 'subtotal', columnMappings), 0);
            const descuento = parseDecimal(getMappedValue(row, 'Ventas', 'descuento', columnMappings), 0);
            const total = parseDecimal(getMappedValue(row, 'Ventas', 'total', columnMappings), Math.max(subtotal - descuento, 0));
            const observacionesRaw = cleanText(getMappedValue(row, 'Ventas', 'observaciones', columnMappings));

            if (subtotal <= 0 && total <= 0) {
                summary.skipped += 1;
                continue;
            }

            const tag = buildImportTag('VENTA', {
                fecha,
                numeroVenta: numeroVenta || '',
                clienteNombre,
                subtotal,
                descuento,
                total,
                row: row.__rowNumber,
            });

            let existing = null;
            if (numeroVenta) {
                existing = await VentaDiaria.findOne({
                    where: { fecha, numeroVenta },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
            }

            if (!existing) {
                existing = await VentaDiaria.findOne({
                    where: {
                        fecha,
                        observaciones: { [Op.like]: `%${tag}%` },
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
            }

            const payload = {
                fecha,
                numeroVenta,
                clienteNombre,
                metodoPago,
                subtotal,
                descuento,
                total,
                observaciones: appendImportTag(observacionesRaw, tag, source),
                estado: 1,
            };

            if (dryRun) {
                if (existing && upsert) summary.updated += 1;
                else if (existing) summary.skipped += 1;
                else summary.created += 1;

                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: true,
                    sheetName: 'Ventas',
                    entityType: 'VentaDiaria',
                    entityId: existing?.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.extrasCapturados += 1;
                continue;
            }

            if (existing) {
                if (!upsert) {
                    summary.skipped += 1;
                    continue;
                }

                await existing.update(payload, { transaction });
                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: false,
                    sheetName: 'Ventas',
                    entityType: 'VentaDiaria',
                    entityId: existing.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.extrasCapturados += 1;
                summary.updated += 1;
                continue;
            }

            const created = await VentaDiaria.create(payload, { transaction });
            const captured = await persistUnknownColumns({
                transaction,
                dryRun: false,
                sheetName: 'Ventas',
                entityType: 'VentaDiaria',
                entityId: created.id,
                row,
                source,
                columnMappings,
            });
            if (captured) summary.extrasCapturados += 1;
            summary.created += 1;
        } catch (error) {
            summary.errors.push(`Fila ${row.__rowNumber}: ${error.message}`);
        }
    }

    return summary;
};

const importGastosPlanillas = async ({ rows, transaction, dryRun, upsert, source, columnMappings = {} }) => {
    const summary = {
        gastos: { created: 0, updated: 0, skipped: 0, extrasCapturados: 0, errors: [] },
        planillas: { created: 0, updated: 0, skipped: 0, extrasCapturados: 0, errors: [] },
    };

    for (const row of rows) {
        const tipoRaw = cleanText(getMappedValue(row, 'GastosPlanillas', 'tipo', columnMappings)).toUpperCase();
        const fecha = parseDateCell(getMappedValue(row, 'GastosPlanillas', 'fecha', columnMappings)) || getBoliviaDateString();
        const categoria = cleanText(getMappedValue(row, 'GastosPlanillas', 'categoria', columnMappings)) || 'Sin categoria';
        const concepto = cleanText(getMappedValue(row, 'GastosPlanillas', 'concepto', columnMappings)) || 'Sin concepto';
        const metodoPago = normalizePaymentMethod(getMappedValue(row, 'GastosPlanillas', 'metodoPago', columnMappings));
        const monto = parseDecimal(getMappedValue(row, 'GastosPlanillas', 'monto', columnMappings), 0);
        const observacionesRaw = cleanText(getMappedValue(row, 'GastosPlanillas', 'observaciones', columnMappings));

        if (monto <= 0) {
            if (tipoRaw === 'GASTO') summary.gastos.skipped += 1;
            else summary.planillas.skipped += 1;
            continue;
        }

        if (tipoRaw === 'GASTO') {
            try {
                const tag = buildImportTag('GASTO', {
                    fecha,
                    categoria,
                    concepto,
                    metodoPago,
                    monto,
                    row: row.__rowNumber,
                });

                let existing = await GastoDiario.findOne({
                    where: {
                        fecha,
                        observaciones: { [Op.like]: `%${tag}%` },
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                const payload = {
                    fecha,
                    categoria,
                    descripcion: concepto,
                    metodoPago,
                    monto,
                    observaciones: appendImportTag(observacionesRaw, tag, source),
                    estado: 1,
                };

                if (dryRun) {
                    if (existing && upsert) summary.gastos.updated += 1;
                    else if (existing) summary.gastos.skipped += 1;
                    else summary.gastos.created += 1;

                    const captured = await persistUnknownColumns({
                        transaction,
                        dryRun: true,
                        sheetName: 'GastosPlanillas',
                        entityType: 'GastoDiario',
                        entityId: existing?.id,
                        row,
                        source,
                        columnMappings,
                    });
                    if (captured) summary.gastos.extrasCapturados += 1;
                    continue;
                }

                if (existing) {
                    if (!upsert) {
                        summary.gastos.skipped += 1;
                        continue;
                    }
                    await existing.update(payload, { transaction });
                    const captured = await persistUnknownColumns({
                        transaction,
                        dryRun: false,
                        sheetName: 'GastosPlanillas',
                        entityType: 'GastoDiario',
                        entityId: existing.id,
                        row,
                        source,
                        columnMappings,
                    });
                    if (captured) summary.gastos.extrasCapturados += 1;
                    summary.gastos.updated += 1;
                    continue;
                }

                const created = await GastoDiario.create(payload, { transaction });
                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: false,
                    sheetName: 'GastosPlanillas',
                    entityType: 'GastoDiario',
                    entityId: created.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.gastos.extrasCapturados += 1;
                summary.gastos.created += 1;
            } catch (error) {
                summary.gastos.errors.push(`Fila ${row.__rowNumber}: ${error.message}`);
            }

            continue;
        }

        const tipoPlanilla = normalizePlanType(tipoRaw);
        if (!tipoPlanilla) {
            summary.planillas.skipped += 1;
            continue;
        }

        try {
            const tag = buildImportTag('PLANILLA', {
                fecha,
                tipoPlanilla,
                categoria,
                concepto,
                metodoPago,
                monto,
                row: row.__rowNumber,
            });

            let existing = await PlanillaRegistro.findOne({
                where: {
                    fecha,
                    observaciones: { [Op.like]: `%${tag}%` },
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const payload = {
                fecha,
                tipoPlanilla,
                categoria,
                concepto,
                metodoPago,
                monto,
                observaciones: appendImportTag(observacionesRaw, tag, source),
                estado: 1,
            };

            if (dryRun) {
                if (existing && upsert) summary.planillas.updated += 1;
                else if (existing) summary.planillas.skipped += 1;
                else summary.planillas.created += 1;

                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: true,
                    sheetName: 'GastosPlanillas',
                    entityType: 'PlanillaRegistro',
                    entityId: existing?.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.planillas.extrasCapturados += 1;
                continue;
            }

            if (existing) {
                if (!upsert) {
                    summary.planillas.skipped += 1;
                    continue;
                }
                await existing.update(payload, { transaction });
                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: false,
                    sheetName: 'GastosPlanillas',
                    entityType: 'PlanillaRegistro',
                    entityId: existing.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.planillas.extrasCapturados += 1;
                summary.planillas.updated += 1;
                continue;
            }

            const created = await PlanillaRegistro.create(payload, { transaction });
            const captured = await persistUnknownColumns({
                transaction,
                dryRun: false,
                sheetName: 'GastosPlanillas',
                entityType: 'PlanillaRegistro',
                entityId: created.id,
                row,
                source,
                columnMappings,
            });
            if (captured) summary.planillas.extrasCapturados += 1;
            summary.planillas.created += 1;
        } catch (error) {
            summary.planillas.errors.push(`Fila ${row.__rowNumber}: ${error.message}`);
        }
    }

    return summary;
};

const importCajaTurnos = async ({ rows, transaction, dryRun, upsert, source, columnMappings = {} }) => {
    const summary = { created: 0, updated: 0, skipped: 0, extrasCapturados: 0, errors: [] };

    for (const row of rows) {
        try {
            const fecha = parseDateCell(getMappedValue(row, 'CajaTurnos', 'fecha', columnMappings)) || getBoliviaDateString();
            const turno = normalizeShift(getMappedValue(row, 'CajaTurnos', 'turno', columnMappings));
            const responsable = cleanText(getMappedValue(row, 'CajaTurnos', 'responsable', columnMappings)) || 'IMPORTADO';
            const estado = normalizeCajaState(getMappedValue(row, 'CajaTurnos', 'estado', columnMappings));
            const saldoInicial = parseDecimal(getMappedValue(row, 'CajaTurnos', 'saldoInicial', columnMappings), 0);
            const ventasEfectivo = parseDecimal(getMappedValue(row, 'CajaTurnos', 'ventasEfectivo', columnMappings), 0);
            const ingresosExtra = parseDecimal(getMappedValue(row, 'CajaTurnos', 'ingresosExtra', columnMappings), 0);
            const gastosEfectivo = parseDecimal(getMappedValue(row, 'CajaTurnos', 'gastosEfectivo', columnMappings), 0);
            const saldoTeorico = parseDecimal(
                getMappedValue(row, 'CajaTurnos', 'saldoTeorico', columnMappings),
                saldoInicial + ingresosExtra + ventasEfectivo - gastosEfectivo
            );
            const saldoArqueoRaw = getMappedValue(row, 'CajaTurnos', 'saldoArqueo', columnMappings);
            const saldoArqueo = cleanText(saldoArqueoRaw) === '' ? null : parseDecimal(saldoArqueoRaw, 0);
            const diferencia = parseDecimal(
                getMappedValue(row, 'CajaTurnos', 'diferencia', columnMappings),
                saldoArqueo === null ? 0 : saldoArqueo - saldoTeorico
            );
            const observacionesRaw = cleanText(getMappedValue(row, 'CajaTurnos', 'observaciones', columnMappings));

            const tag = buildImportTag('CAJA', {
                fecha,
                turno,
                responsable,
                saldoInicial,
                ventasEfectivo,
                gastosEfectivo,
                row: row.__rowNumber,
            });

            let existing = await CajaTurno.findOne({
                where: { fecha, turno },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const payload = {
                fecha,
                turno,
                responsable,
                saldoInicial,
                ventasEfectivo,
                ingresosExtra,
                gastosEfectivo,
                saldoTeorico,
                saldoArqueo,
                diferencia,
                estado,
                observaciones: appendImportTag(observacionesRaw, tag, source),
            };

            if (estado === 'CERRADO' && !payload.fechaCierre) {
                payload.fechaCierre = new Date();
            }

            if (dryRun) {
                if (existing && upsert) summary.updated += 1;
                else if (existing) summary.skipped += 1;
                else summary.created += 1;

                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: true,
                    sheetName: 'CajaTurnos',
                    entityType: 'CajaTurno',
                    entityId: existing?.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.extrasCapturados += 1;
                continue;
            }

            if (existing) {
                if (!upsert) {
                    summary.skipped += 1;
                    continue;
                }

                await existing.update(payload, { transaction });
                const captured = await persistUnknownColumns({
                    transaction,
                    dryRun: false,
                    sheetName: 'CajaTurnos',
                    entityType: 'CajaTurno',
                    entityId: existing.id,
                    row,
                    source,
                    columnMappings,
                });
                if (captured) summary.extrasCapturados += 1;
                summary.updated += 1;
                continue;
            }

            const created = await CajaTurno.create(payload, { transaction });
            const captured = await persistUnknownColumns({
                transaction,
                dryRun: false,
                sheetName: 'CajaTurnos',
                entityType: 'CajaTurno',
                entityId: created.id,
                row,
                source,
                columnMappings,
            });
            if (captured) summary.extrasCapturados += 1;
            summary.created += 1;
        } catch (error) {
            summary.errors.push(`Fila ${row.__rowNumber}: ${error.message}`);
        }
    }

    return summary;
};

const normalizeSheetsToImport = (sheetsToImport) => {
    if (!sheetsToImport) return [...DEFAULT_IMPORT_SHEETS];

    const list = Array.isArray(sheetsToImport)
        ? sheetsToImport
        : String(sheetsToImport)
            .split(',')
            .map((item) => cleanText(item));

    const valid = list.filter((sheet) => SUPPORTED_IMPORT_SHEETS.has(sheet));
    return valid.length ? valid : [...DEFAULT_IMPORT_SHEETS];
};

const runImportGoogleSheets = async ({
    spreadsheetId,
    sheetsToImport,
    columnMappings,
    dryRun = false,
    upsert = true,
    source = 'MANUAL',
} = {}) => {
    const targetSpreadsheetId = spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!targetSpreadsheetId) {
        throw new Error('Debe proporcionar spreadsheetId o configurar GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    const credentials = getGoogleCredentials();
    const sheetsClient = buildGoogleSheetsClient(credentials);
    const selectedSheets = normalizeSheetsToImport(sheetsToImport);

    const report = {
        spreadsheetId: targetSpreadsheetId,
        source,
        dryRun: toBoolean(dryRun, false),
        upsert: toBoolean(upsert, true),
        sheets: selectedSheets,
        startedAt: new Date().toISOString(),
        finishedAt: null,
        detalles: {},
    };

    const transaction = await sequelize.transaction();
    try {
        for (const sheetName of selectedSheets) {
            const values = await fetchSheetRows({
                sheetsClient,
                spreadsheetId: targetSpreadsheetId,
                sheetName,
            });

            const rows = toRowObjects(values);

            if (sheetName === 'Ventas') {
                report.detalles.Ventas = await importVentas({
                    rows,
                    transaction,
                    dryRun: report.dryRun,
                    upsert: report.upsert,
                    source,
                    columnMappings,
                });
            }

            if (sheetName === 'GastosPlanillas') {
                report.detalles.GastosPlanillas = await importGastosPlanillas({
                    rows,
                    transaction,
                    dryRun: report.dryRun,
                    upsert: report.upsert,
                    source,
                    columnMappings,
                });
            }

            if (sheetName === 'CajaTurnos') {
                report.detalles.CajaTurnos = await importCajaTurnos({
                    rows,
                    transaction,
                    dryRun: report.dryRun,
                    upsert: report.upsert,
                    source,
                    columnMappings,
                });
            }
        }

        if (report.dryRun) {
            await transaction.rollback();
        } else {
            await transaction.commit();
        }

        report.finishedAt = new Date().toISOString();
        return report;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const previewImportGoogleSheets = async ({
    spreadsheetId,
    sheetsToImport,
    columnMappings,
} = {}) => {
    const targetSpreadsheetId = spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!targetSpreadsheetId) {
        throw new Error('Debe proporcionar spreadsheetId o configurar GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    const credentials = getGoogleCredentials();
    const sheetsClient = buildGoogleSheetsClient(credentials);
    const selectedSheets = normalizeSheetsToImport(sheetsToImport);

    const result = {
        spreadsheetId: targetSpreadsheetId,
        sheets: {},
        expectedFields: getExpectedFieldsSpec(),
    };

    for (const sheetName of selectedSheets) {
        const rows = await fetchSheetRows({
            sheetsClient,
            spreadsheetId: targetSpreadsheetId,
            sheetName,
        });

        result.sheets[sheetName] = analyzeSheetStructure({
            rows,
            sheetName,
            columnMappings,
        });
    }

    return result;
};

module.exports = {
    DEFAULT_IMPORT_SHEETS,
    SUPPORTED_IMPORT_SHEETS,
    getExpectedFieldsSpec,
    normalizeSheetsToImport,
    previewImportGoogleSheets,
    runImportGoogleSheets,
};
