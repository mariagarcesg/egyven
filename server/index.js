// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión a la base de datos para asegurar que conecte al iniciar
const db = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON en las peticiones POST

// Importar Rutas

const usuariosRoutes = require('./routes/usuarios');

//Usuarios
app.use('/api/usuarios', usuariosRoutes);

// Ruta de prueba rápida para el navegador
app.get('/', (req, res) => {
    res.send('Servidor de EGYVEN API funcionando correctamente');
});

// Puerto para probar la conexion
/*const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`Servidor EGYVEN corriendo en puerto ${PORT}`);
    console.log(`API disponible en: http://localhost:${PORT}/api/usuarios`);
    console.log(`==========================================`);
});*/