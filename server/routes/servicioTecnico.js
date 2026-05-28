const express = require('express');
const router = express.Router();
const controlador = require('../controllers/servicioTecnicoController');

// GET /api/servicio-tecnico/clientes
router.get('/clientes', controlador.obtenerClientes);

// POST /api/servicio-tecnico/clientes
router.post('/clientes', controlador.crearCliente);

// GET /api/servicio-tecnico/ordenes
router.get('/ordenes', controlador.obtenerOrdenesServicio);
// POST crear orden de servicio
router.post('/ordenes', controlador.crearOrden);
// GET tecnicos
router.get('/tecnicos', controlador.obtenerTecnicos);
// PUT actualizar orden
router.put('/ordenes/:id', controlador.actualizarOrden);

// GET repuestos utilizados
router.get('/repuestos', controlador.obtenerRepuestos);
// POST crear repuesto utilizado
router.post('/repuestos', controlador.crearRepuesto);
// PUT actualizar repuesto utilizado
router.put('/repuestos/:id', controlador.actualizarRepuesto);

// GET /api/servicio-tecnico/equipos
router.get('/equipos', controlador.obtenerEquipos);

// POST /api/servicio-tecnico/equipos
router.post('/equipos', controlador.crearEquipo);

// PUT /api/servicio-tecnico/equipos/:id
router.put('/equipos/:id', controlador.actualizarEquipo);

// DELETE /api/servicio-tecnico/equipos/:id
router.delete('/equipos/:id', controlador.eliminarEquipo);

// PUT /api/servicio-tecnico/clientes/:id
router.put('/clientes/:id', controlador.actualizarCliente);

// DELETE /api/servicio-tecnico/clientes/:id
router.delete('/clientes/:id', controlador.eliminarCliente);

module.exports = router;
