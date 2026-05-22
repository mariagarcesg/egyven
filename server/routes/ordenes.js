const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');

// Ruta para crear una nueva orden desde el carrito
router.post('/crear', ordenesController.crearOrden);

// Rutas para listar órdenes y detalles
router.get('/', ordenesController.obtenerOrdenes);
router.get('/usuario/:id', ordenesController.obtenerOrdenesUsuario);
router.get('/:id/detalles', ordenesController.obtenerDetalleOrden);

// Ruta para procesar una orden (cambiar a En Proceso)
router.patch('/procesar/:id', ordenesController.procesarOrden);

// Ruta para modificar la cantidad de un detalle de orden
router.patch('/detalle/:id', ordenesController.modificarDetalleOrden);

module.exports = router;
