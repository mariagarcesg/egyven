// routes/producto.js (o productos.js)
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productosController');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir imágenes a server/src/assets/images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'src', 'assets', 'images'))
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext)
	}
});
const upload = multer({ storage: storage });

router.get('/', productoController.obtenerProductos);
router.get('/categorias', productoController.obtenerCategorias);
// Ruta para crear producto con imagen
router.post('/', upload.single('imagen'), productoController.crearProducto);
// Ruta para actualizar producto (opcionalmente con nueva imagen)
router.put('/:id', upload.single('imagen'), productoController.actualizarProducto);

module.exports = router;