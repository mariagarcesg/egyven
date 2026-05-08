const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. OBTENER TODAS LAS FACTURAS (Actualizado para usar id_usuario)
router.get('/', async (req, res) => {
    try {
        // Hacemos el JOIN directamente con la tabla usuarios
        const [rows] = await db.query(`
            SELECT 
                f.id, 
                f.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
                f.fecha_venta, 
                f.total, 
                f.total_pagado, 
                f.estatus_id
            FROM factura f
            JOIN usuarios u ON f.id_usuario = u.id
            ORDER BY f.fecha_venta DESC
        `);

        // Enviamos los datos limpios al frontend
        res.json(rows);
    } catch (error) {
        console.error("ERROR GET FACTURA:", error);
        res.status(500).json({ message: 'Error al obtener facturas' });
    }
});

// 2. CREAR FACTURA (Ya lo tienes bien, solo aseguramos consistencia)
router.post('/', async (req, res) => {
    const { id_usuario, total, total_pagado, orden_id, detalles } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ message: "La orden no tiene un ID de usuario válido." });
    }

    try {
        await db.query('START TRANSACTION');

        // Insertar en factura (Usando la nueva columna id_usuario)
        const [facturaResult] = await db.query(
            'INSERT INTO factura (id_usuario, fecha_venta, total, estatus_id, total_pagado) VALUES (?, NOW(), ?, 3, ?)',
            [id_usuario, total, total_pagado]
        );

        const facturaId = facturaResult.insertId;

        // Insertar detalles
        for (const item of detalles) {
            await db.query(
                'INSERT INTO detalle_factura (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [facturaId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
            );
        }

        // Actualizar estado de la orden a Finalizado
        await db.query('UPDATE orden_compra SET estatus_id = 5 WHERE id = ?', [orden_id]);

        await db.query('COMMIT');
        res.status(201).json({ message: 'Factura generada exitosamente' });

    } catch (error) {
        if (db.query) await db.query('ROLLBACK');
        console.error("ERROR SQL:", error);
        res.status(500).json({ message: error.message });
    }
});

// Obtener detalles de una factura específica
router.get('/:id/detalles', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT d.id, d.factura_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal,
                   p.nombre AS nombre_producto, p.imagen
            FROM detalle_factura d
            JOIN productos p ON d.producto_id = p.id
            WHERE d.factura_id = ?
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener detalles de factura:', error);
        res.status(500).json({ error: 'Error interno al obtener detalles de factura' });
    }
});

// Ruta de debug: devuelve el id recibido (no debe quedarse en producción)
router.get('/:id/raw', (req, res) => {
    res.json({ ok: true, id: req.params.id, note: 'debug raw' });
});

// Debug: test endpoint
router.get('/__test_routes__', (req, res) => {
    res.json({ ok: true, note: 'facturas router loaded' });
});

module.exports = router;