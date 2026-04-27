// routes/producto.js (o productos.js)
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productosController');

router.get('/', productoController.obtenerProductos);
router.get('/categorias', productoController.obtenerCategorias);

module.exports = router;