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
  origin: ['http://192.168.1.10:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] 
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // En producción debería ser true con HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta para archivos estáticos si los tienes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas protegidas o públicas según corresponda
app.use('/convocatorias', authenticateToken, require('./routes/convocatoriaRoutes'));

// Aquí las rutas de PDF que usan pdfController (para generar PDF con HTML)
app.use('/pdf', require('./routes/pdfRoutes'));

// Rutas para archivos adjuntos de convocatoria, que usan convocatoriaArchivosController
app.use('/convocatorias-archivos', require('./routes/convocatoriaArchivosRoutes'));

app.get('/test', (req, res) => {
  console.log("Ruta /test accedida"); 
  res.json({ message: "Conexión exitosa", timestamp: new Date() });
});

// Otras rutas del sistema
const routes = [
    { path: '/facultades', route: './routes/facultadRoutes' },
    { path: '/carreras', route: './routes/carreraRoutes' },
    { path: '/tipos-convocatorias', route: './routes/tipoConvocatoriaRoutes' },
    { path: '/convocatorias', route: './routes/convocatoriaRoutes' },
    { path: '/convocatoria-materias', route: './routes/convocatoriaMateriaRoutes' },
    // No montamos aquí convocatorias-archivos para evitar duplicados
    { path: '/api/auth', route: './routes/authRoutes' },
    { path: '/usuarios', route: './routes/usuarioRoutes' },
    { path: '/convocatorias-documentos', route: './routes/convocatoriasDocumentosRoutes' },
    { path: '/notificaciones', route: './routes/notificacionRoutes' }
];

// Montar todas las rutas
routes.forEach(r => app.use(r.path, require(path.join(__dirname, r.route))));

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para errores globales
app.use((err, req, res, next) => {
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
    console.log(`Servidor corriendo en http://192.168.1.10:${PORT}`);
});
