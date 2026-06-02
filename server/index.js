require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');


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
const ordenesRoutes = require('./routes/ordenes');
const facturasRoutes = require('./routes/facturas');
const servicioTecnicoRoutes = require('./routes/servicioTecnico');
const comparadorRoutes = require('./routes/comparador');
const tasasRoutes = require('./routes/tasas');

// Uso de Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/servicio-tecnico', servicioTecnicoRoutes);
app.use('/api/comparador', comparadorRoutes);
app.use('/api/tasas', tasasRoutes);

// DEBUG: listar rutas registradas (solo en entorno de desarrollo)
if (process.env.NODE_ENV !== 'production') {
    const routeList = [];
    const routerStack = app._router && app._router.stack ? app._router.stack : null;
    if (routerStack) {
        routerStack.forEach(mw => {
            if (mw.route && mw.route.path) {
                routeList.push({ path: mw.route.path, methods: mw.route.methods });
            } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
                mw.handle.stack.forEach(r => {
                    if (r.route) {
                        routeList.push({ path: r.route.path, methods: r.route.methods });
                    }
                });
            }
        });
    } else {
        console.warn('Warning: app._router is not initialized yet; no routes to list.');
    }
    console.log('Registered routes:', JSON.stringify(routeList, null, 2));
}

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