//backend/ db.js
const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Gestion_de_convocatorias',
    password: '12345',
    port: 5432,
});

module.exports = pool;

