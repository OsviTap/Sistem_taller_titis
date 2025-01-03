const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '-04:00', // Zona horaria Bolivia (GMT-4)
        dialectOptions: {
            useUTC: false, // No usar UTC para guardar fechas
            dateStrings: true, // Devolver fechas como strings
            typeCast: true, // Forzar las fechas en la zona horaria configurada
        },
        logging: console.log // Para ver las consultas SQL en la consola
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

// Ejecutar prueba de conexión
testConnection();


module.exports = sequelize;
// const { Sequelize } = require('sequelize');

// Cargar variables de entorno
// require('dotenv').config();

// Crear conexión a Supabase
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'postgres', // Dialecto PostgreSQL
//     dialectOptions: {
//         ssl: {
//             require: true, // Requiere SSL
//             rejectUnauthorized: false // Desactiva verificación de certificados
//         }
//     },
//     pool: {
//         max: 10,         // Máximo número de conexiones
//         min: 0,          // Mínimo número de conexiones
//         acquire: 60000,  // Tiempo máximo de adquisición (60s)
//         idle: 10000      // Tiempo máximo inactivo (10s)
//     },
//     logging: false // Desactiva logs
// });

// Probar conexión
// sequelize.authenticate()
//     .then(() => console.log('Conexión exitosa a Supabase'))
//     .catch(err => console.error('Error al conectar a Supabase:', err));

// module.exports = sequelize;


