const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ordenClienteController');

router.get('/', ctrl.obtenerOrdenesCliente);
router.get('/facturas', ctrl.obtenerFacturasCliente);
router.post('/facturas/reparar', ctrl.repararDetallesFacturasCliente);
router.get('/facturas/:id/detalles', ctrl.obtenerDetallesFacturaCliente);
router.post('/', ctrl.crearOrdenCliente);
router.get('/:id/detalles', ctrl.obtenerDetallesOrden);
router.put('/:id', ctrl.actualizarOrdenCliente);
router.post('/:id/procesar', ctrl.procesarOrdenCliente);

module.exports = router;
