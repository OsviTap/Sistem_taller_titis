const {
    DEFAULT_IMPORT_SHEETS,
    normalizeSheetsToImport,
    runImportGoogleSheets,
} = require('./googleSheetsImportService');

let schedulerRef = null;
let isRunning = false;
let lastRun = null;

const toBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') return fallback;
    const normalized = String(value).trim().toLowerCase();
    return !['0', 'false', 'no', 'off'].includes(normalized);
};

const getIntervalMinutes = () => {
    const raw = parseInt(process.env.GOOGLE_SHEETS_IMPORT_INTERVAL_MIN || '30', 10);
    if (Number.isNaN(raw) || raw <= 0) return 30;
    return Math.min(Math.max(raw, 5), 1440);
};

const getSheetsFromEnv = () => {
    const raw = process.env.GOOGLE_SHEETS_IMPORT_SHEETS;
    if (!raw) return [...DEFAULT_IMPORT_SHEETS];
    return normalizeSheetsToImport(raw);
};

const ejecutarImportSiCorresponde = async (source = 'AUTO_SCHEDULER') => {
    if (isRunning) {
        return {
            ejecutado: false,
            motivo: 'EN_EJECUCION',
            lastRun,
        };
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
        return {
            ejecutado: false,
            motivo: 'SIN_SPREADSHEET_ID',
            lastRun,
        };
    }

    isRunning = true;
    try {
        const report = await runImportGoogleSheets({
            spreadsheetId,
            sheetsToImport: getSheetsFromEnv(),
            dryRun: false,
            upsert: true,
            source,
        });

        lastRun = {
            ok: true,
            source,
            at: new Date().toISOString(),
            report,
        };

        return {
            ejecutado: true,
            motivo: 'OK',
            lastRun,
        };
    } catch (error) {
        lastRun = {
            ok: false,
            source,
            at: new Date().toISOString(),
            error: error.message,
        };

        return {
            ejecutado: false,
            motivo: 'ERROR',
            error: error.message,
            lastRun,
        };
    } finally {
        isRunning = false;
    }
};

const iniciarGoogleSheetsImportScheduler = () => {
    const enabled = toBoolean(process.env.ENABLE_GOOGLE_SHEETS_IMPORT_AUTO, false);
    if (!enabled) {
        console.log('[GoogleSheets] Scheduler de importacion automatica deshabilitado por configuracion.');
        return null;
    }

    const intervalMinutes = getIntervalMinutes();
    const intervalMs = intervalMinutes * 60 * 1000;

    if (schedulerRef) {
        clearInterval(schedulerRef);
        schedulerRef = null;
    }

    schedulerRef = setInterval(async () => {
        const result = await ejecutarImportSiCorresponde('AUTO_SCHEDULER');
        if (result.ejecutado) {
            console.log('[GoogleSheets] Importacion automatica completada correctamente.');
        } else if (result.motivo === 'ERROR') {
            console.error('[GoogleSheets] Error en importacion automatica:', result.error);
        }
    }, intervalMs);

    if (toBoolean(process.env.GOOGLE_SHEETS_IMPORT_RUN_ON_START, false)) {
        ejecutarImportSiCorresponde('AUTO_START')
            .then((result) => {
                if (result.ejecutado) {
                    console.log('[GoogleSheets] Importacion inicial ejecutada correctamente.');
                }
            })
            .catch((error) => {
                console.error('[GoogleSheets] Error en importacion inicial:', error.message);
            });
    }

    console.log(`[GoogleSheets] Scheduler import auto activo cada ${intervalMinutes} minutos.`);
    return schedulerRef;
};

const getGoogleSheetsImportSchedulerStatus = () => ({
    enabled: Boolean(schedulerRef),
    isRunning,
    intervalMinutes: getIntervalMinutes(),
    sheets: getSheetsFromEnv(),
    lastRun,
    hasSpreadsheetId: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
    hasCredentials: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
});

module.exports = {
    ejecutarImportSiCorresponde,
    getGoogleSheetsImportSchedulerStatus,
    iniciarGoogleSheetsImportScheduler,
};
