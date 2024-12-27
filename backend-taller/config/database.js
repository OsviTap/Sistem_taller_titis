const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

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


