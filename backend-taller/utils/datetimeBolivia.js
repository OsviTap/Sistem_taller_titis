const BOLIVIA_TZ = 'America/La_Paz';

const getBoliviaParts = (dateInput = new Date()) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: BOLIVIA_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = formatter.formatToParts(date).reduce((acc, part) => {
        if (part.type !== 'literal') {
            acc[part.type] = part.value;
        }
        return acc;
    }, {});

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second),
    };
};

const getBoliviaDateString = (dateInput = new Date()) => {
    const { year, month, day } = getBoliviaParts(dateInput);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getBoliviaTimeString = (dateInput = new Date()) => {
    const { hour, minute, second } = getBoliviaParts(dateInput);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
};

const getTurnoByHour = (hour) => {
    if (hour < 12) return 'Manana';
    if (hour < 18) return 'Tarde';
    return 'Noche';
};

const getBoliviaCurrentTurno = (dateInput = new Date()) => {
    const { hour } = getBoliviaParts(dateInput);
    return getTurnoByHour(hour);
};

module.exports = {
    BOLIVIA_TZ,
    getBoliviaDateString,
    getBoliviaTimeString,
    getBoliviaCurrentTurno,
    getTurnoByHour,
};
