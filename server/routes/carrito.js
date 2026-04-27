const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

// Obtener carrito de un usuario
router.get('/:usuario_id', carritoController.obtenerCarrito);

// Agregar producto al carrito
router.post('/agregar', carritoController.agregarAlCarrito);

// Actualizar cantidad del carrito
router.put('/actualizar/:id', carritoController.actualizarCantidad);

// Eliminar fila del carrito
router.delete('/eliminar/:id', carritoController.eliminarDelCarrito);

module.exports = router;
