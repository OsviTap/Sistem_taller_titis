require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const migrationPath = path.resolve(__dirname, '../../db/migration_visitas_historico_externo_compat.sql');

async function runMigration() {
    let connection;
    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: false,
            },
            connectTimeout: 60000,
            multipleStatements: true,
        });

        await connection.query(sql);
        console.log('Migracion visitas/historico/externo ejecutada correctamente.');
    } catch (error) {
        console.error('Error ejecutando migracion visitas/historico/externo:', error.message);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
