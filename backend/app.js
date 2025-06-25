// backend/app.js
require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { authenticateToken } = require('./middleware/authMiddleware');

const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Conexión a la base de datos exitosa'))
    .catch(err => console.error('Error conectando a la base de datos', err));

app.use(cookieParser()); 

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.116.207:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] 
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.get('/test', (req, res) => {
  console.log("Ruta /test accedida"); 
  res.json({ message: "Conexión exitosa", timestamp: new Date() });
});

const routes = [
    { path: '/facultades', route: './routes/facultadRoutes' },
    { path: '/carreras', route: './routes/carreraRoutes' },
    { path: '/tipos-convocatorias', route: './routes/tipoConvocatoriaRoutes' },
    { path: '/convocatorias', route: './routes/convocatoriaRoutes' },
    { path: '/convocatoria-materias', route: './routes/convocatoriaMateriaRoutes' },
    { path: '/pdf', route: './routes/pdfRoutes' },
    { path: '/api/auth', route: './routes/authRoutes' },
    { path: '/usuarios', route: './routes/usuarioRoutes' },
    { path: '/convocatorias-documentos', route: './routes/convocatoriasDocumentosRoutes' },
    { path: '/convocatorias-archivos', route: './routes/convocatoriaArchivosRoutes' },
    { path: '/notificaciones', route: './routes/notificacionRoutes' } 
];

// Montar las rutas
routes.forEach(r => app.use(r.path, require(path.join(__dirname, r.route))));

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.use((req, res, next) => {//404
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {// Errores globales
    console.error(err.stack);
    res.status(500).json({ error: 'Ha ocurrido un error interno en el servidor' });
});

const shutdown = () => {
    console.log('Cerrando el servidor de manera segura...');
    process.exit();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  
    console.log(`Servidor corriendo en http://192.168.116.207:${PORT}`);
});
