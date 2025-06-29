// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();
const types = require('pg').types;

types.setTypeParser(17, val => val);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.connect()
    .catch(err => console.error('Error al conectar a la base de datos', err.stack));

module.exports = pool;