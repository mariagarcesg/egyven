const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Definimos la ruta POST para registro
// URL completa: http://localhost:5000/api/usuarios/registro
router.post('/registro', usuariosController.registrarUsuario);

// Definimos la ruta GET para listar
router.get('/', usuariosController.obtenerUsuarios);

module.exports = router;