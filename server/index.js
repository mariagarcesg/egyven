const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión a la base de datos
const db = require('./config/db');

const app = express();

// Middlewares principales
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS (IMÁGENES) ---
// Estas líneas permiten que el navegador acceda a las carpetas físicas
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));
app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));

// Importar Rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const carritoRoutes = require('./routes/carrito');

// Uso de Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);

// Ruta de prueba rápida
app.get('/', (req, res) => {
    res.send('Servidor de EGYVEN API funcionando correctamente');
});

// Puerto sincronizado
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`Servidor EGYVEN corriendo en puerto ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/productos`);
    console.log(`Imágenes: http://localhost:${PORT}/src/assets/images/ (Si usas src)`);
    console.log(`Imágenes: http://localhost:${PORT}/assets/images/ (Si no usas src)`);
    console.log(`==========================================`);
});