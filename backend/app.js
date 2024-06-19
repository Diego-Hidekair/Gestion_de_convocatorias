// src/app.js
const express = require('express');
const cors = require('cors'); // Importa cors
const app = express();
const categoriaRoutes = require('./routes/categoriaRoutes'); 

const port = process.env.PORT || 5000;


// Configura CORS
app.use(cors({
    origin: 'http://localhost:3000' // Permite solicitudes desde localhost:3000
}));


app.use(express.json());

app.use('/api', categoriaRoutes);

app.listen(port, () => {
    console.log(`Servidor en ejecución en el puerto ${port}`);
});


