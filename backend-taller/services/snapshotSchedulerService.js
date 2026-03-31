const { sequelize, InventarioStockDiario } = require('../models');
const { generarSnapshotDiario } = require('./inventarioService');

const toBoolean = (value, fallback = true) => {
    if (value === undefined || value === null || value === '') return fallback;
    const normalized = String(value).trim().toLowerCase();
    return !['0', 'false', 'no', 'off'].includes(normalized);
};

const getHoraProgramada = () => {
    const raw = process.env.INVENTARIO_SNAPSHOT_HORA || '23:55';
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return { hour: 23, minute: 55, label: '23:55' };

    const hour = Math.min(Math.max(parseInt(match[1], 10), 0), 23);
    const minute = Math.min(Math.max(parseInt(match[2], 10), 0), 59);
    return { hour, minute, label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` };
};

const ejecutarSnapshotSiCorresponde = async (fecha, motivo = 'AUTO') => {
    const transaccion = await sequelize.transaction();
    try {
        const existente = await InventarioStockDiario.count({
            where: { fecha },
            transaction: transaccion,
        });

        if (existente > 0 && motivo === 'AUTO') {
            await transaccion.rollback();
            return { ejecutado: false, motivo: 'YA_EXISTE', fecha, registros: existente };
        }

        const resultado = await generarSnapshotDiario({ fecha, transaction: transaccion });
        await transaccion.commit();

        return {
            ejecutado: true,
            motivo,
            fecha: resultado.fecha,
            registros: resultado.registros,
        };
    } catch (error) {
        await transaccion.rollback();
        throw error;
    }
};

const iniciarSchedulerSnapshotDiario = () => {
    const habilitado = toBoolean(process.env.ENABLE_INVENTARIO_SNAPSHOT_AUTO, true);
    if (!habilitado) {
        console.log('[Inventario] Scheduler snapshot automatico deshabilitado por configuracion.');
        return null;
    }

    const programacion = getHoraProgramada();
    let ultimaFechaEjecutada = null;

    const tick = async () => {
        try {
            const ahora = new Date();
            const fecha = ahora.toISOString().slice(0, 10);
            const hora = ahora.getHours();
            const minuto = ahora.getMinutes();

            if (hora === programacion.hour && minuto === programacion.minute && ultimaFechaEjecutada !== fecha) {
                const resultado = await ejecutarSnapshotSiCorresponde(fecha, 'AUTO');
                ultimaFechaEjecutada = fecha;
                if (resultado.ejecutado) {
                    console.log(`[Inventario] Snapshot automatico generado: ${resultado.fecha}, registros=${resultado.registros}`);
                } else {
                    console.log(`[Inventario] Snapshot automatico omitido (${resultado.motivo}) para ${resultado.fecha}`);
                }
            }
        } catch (error) {
            console.error('[Inventario] Error en scheduler de snapshot automatico:', error.message);
        }
    };

    const intervaloMs = 60 * 1000;
    const intervalRef = setInterval(() => {
        tick();
    }, intervaloMs);

    console.log(`[Inventario] Scheduler snapshot automatico activo a las ${programacion.label} (intervalo 1 min).`);
    return intervalRef;
};

module.exports = {
    iniciarSchedulerSnapshotDiario,
    ejecutarSnapshotSiCorresponde,
};
