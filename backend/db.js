// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gestion_de_convocatorias',
    password: '12345',  
  });


// Código para verificar la conexión
pool.connect()
    .catch(err => console.error('Error al conectar a la base de datos', err.stack));

module.exports = pool;