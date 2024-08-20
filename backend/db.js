// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Código para verificar la conexión
pool.connect((err, client, done) => {
    if (err) {
        console.error('Error al conectar a la base de datos', err.stack);
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
    done(); // Liberar el cliente después de la prueba
});

module.exports = pool;
