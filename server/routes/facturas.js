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

        // Determinar estatus y total_pagado según si viene de una orden (procesamiento)
        // Si se está creando factura a partir de una orden, la factura debe quedar en 'En Proceso' (estatus_id = 2)
        // y con total_pagado = 0 hasta que se registren pagos.
        let facturaEstatus = 3; // por defecto: 3 (Pagado) si se crea manualmente con pago
        let facturaTotalPagado = total_pagado;
        if (orden_id) {
            facturaEstatus = 2;
            facturaTotalPagado = 0;
        }

        // Insertar en factura (Usando la nueva columna id_usuario)
        const [facturaResult] = await db.query(
            'INSERT INTO factura (id_usuario, fecha_venta, total, estatus_id, total_pagado) VALUES (?, NOW(), ?, ?, ?)',
            [id_usuario, total, facturaEstatus, facturaTotalPagado]
        );

        const facturaId = facturaResult.insertId;

        // Insertar detalles
        for (const item of detalles) {
            await db.query(
                'INSERT INTO detalle_factura (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [facturaId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
            );
        }

        // Si la factura proviene de una orden, poner la orden en 'En Proceso' (estatus_id = 2)
        if (orden_id) {
            await db.query('UPDATE orden_compra SET estatus_id = 2 WHERE id = ?', [orden_id]);
        }

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

// Obtener pagos de una factura
router.get('/:id/pagos', async (req, res) => {
    const { id } = req.params;
    try {
        // Determinar columna de enlace en pagos
        const [cols] = await db.query("SHOW COLUMNS FROM pagos");
        const colNames = Array.isArray(cols) ? cols.map(c => c.Field) : [];
        let invoiceCol = null;
        if (colNames.includes('id_factura')) invoiceCol = 'id_factura';
        else if (colNames.includes('factura_id')) invoiceCol = 'factura_id';
        else return res.status(200).json([]);

        const [rows] = await db.query(`SELECT id, ${invoiceCol} as factura_id, id_metodo, monto, referencia, fecha FROM pagos WHERE ${invoiceCol} = ? ORDER BY fecha DESC`, [id]);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
        console.error('ERROR obteniendo pagos:', error);
        res.status(500).json({ message: 'Error al obtener pagos' });
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

// Obtener métodos de pago
router.get('/metodos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre FROM metodo_pago ORDER BY id');
        console.log('metodos_pago rows:', Array.isArray(rows) ? rows.length : typeof rows);
        res.json(Array.isArray(rows) ? rows : []);
    } catch (error) {
        console.error('ERROR get metodos:', error);
        res.status(500).json({ message: 'Error al obtener métodos de pago' });
    }
});

// Registrar un pago para una factura
router.post('/pagos', async (req, res) => {
    const { factura_id, numero_factura, id_metodo, monto, referencia, fecha_pago } = req.body;

    if (!factura_id || !id_metodo || typeof monto === 'undefined') {
        return res.status(400).json({ message: 'Faltan datos requeridos: factura_id, id_metodo, monto' });
    }

    try {
        await db.query('START TRANSACTION');

        // Determinar nombre de columna para la FK de factura en la tabla `pagos` (id_factura o factura_id)
        const [cols] = await db.query("SHOW COLUMNS FROM pagos");
        const colNames = Array.isArray(cols) ? cols.map(c => c.Field) : [];
        let invoiceCol = null;
        if (colNames.includes('id_factura')) invoiceCol = 'id_factura';
        else if (colNames.includes('factura_id')) invoiceCol = 'factura_id';
        else return res.status(500).json({ message: 'La tabla pagos no tiene columna id_factura ni factura_id' });

        // Determinar columna de fecha (fecha_pago preferida, sino fecha)
        let dateCol = null;
        if (colNames.includes('fecha_pago')) dateCol = 'fecha_pago';
        else if (colNames.includes('fecha')) dateCol = 'fecha';

        // Preparar INSERT dinámico
        const insertCols = [invoiceCol, 'id_metodo', 'monto', 'referencia'];
        const placeholders = ['?', '?', '?', '?'];
        const params = [factura_id, id_metodo, monto, referencia || null];

        if (dateCol) {
            if (fecha_pago) {
                insertCols.push(dateCol);
                placeholders.push('?');
                params.push(fecha_pago);
            } else {
                // si no se envía fecha_pago, usar NOW()
                insertCols.push(dateCol);
                placeholders.push('NOW()');
            }
        }

        const insertSql = `INSERT INTO pagos (${insertCols.join(',')}) VALUES (${placeholders.join(',')})`;
        await db.query(insertSql, params);

        // Actualizar total_pagado en factura
        await db.query('UPDATE factura SET total_pagado = COALESCE(total_pagado,0) + ? WHERE id = ?', [monto, factura_id]);

        // Verificar si ya está totalmente pagada
        const [rows] = await db.query('SELECT total, total_pagado FROM factura WHERE id = ?', [factura_id]);
        if (rows && rows.length) {
            const f = rows[0];
            if (Number(f.total_pagado) >= Number(f.total)) {
                await db.query('UPDATE factura SET estatus_id = 3 WHERE id = ?', [factura_id]);
            }
        }

        await db.query('COMMIT');
        res.status(201).json({ message: 'Pago registrado exitosamente' });
    } catch (error) {
        if (db.query) await db.query('ROLLBACK');
        console.error('ERROR registrando pago:', error);
        res.status(500).json({ message: 'Error al registrar pago' });
    }
});

// Actualizar estatus de una factura (solo estatus_id)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estatus_id } = req.body;

    if (typeof estatus_id === 'undefined') {
        return res.status(400).json({ message: 'Falta el campo estatus_id en el cuerpo.' });
    }

    try {
        const [result] = await db.query('UPDATE factura SET estatus_id = ? WHERE id = ?', [estatus_id, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Factura no encontrada.' });
        }
        res.json({ message: 'Estatus de factura actualizado.' });
    } catch (error) {
        console.error('ERROR actualizando estatus factura:', error);
        res.status(500).json({ message: 'Error al actualizar estatus de factura.' });
    }
});

module.exports = router;