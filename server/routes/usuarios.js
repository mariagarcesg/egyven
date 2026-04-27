const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Definimos la ruta POST para registro
router.post('/registro', usuariosController.registrarUsuario);

// Definimos la ruta POST para login
router.post('/login', usuariosController.login);

// Definimos la ruta GET para listar
router.get('/', usuariosController.obtenerUsuarios);

module.exports = router;