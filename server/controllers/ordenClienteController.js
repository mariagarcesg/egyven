const db = require('../config/db');

exports.crearOrdenCliente = async (req, res) => {
    const { cliente_id, items } = req.body;

    if (!cliente_id) return res.status(400).json({ error: 'cliente_id es requerido' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });

    try {
        const total = items.reduce((acc, item) => acc + Number(item.precio_unitario) * Number(item.cantidad), 0);

        const [ordenResult] = await db.query(
            `INSERT INTO orden_cliente (cliente_id, tipo_venta, total, estatus, fecha_creacion)
             VALUES (?, 'Presencial', ?, 'Pendiente', NOW())`,
            [cliente_id, total]
        );

        const orden_id = ordenResult.insertId;

        for (const item of items) {
            await db.query(
                `INSERT INTO detalle_orden_cliente (orden_id, producto_id, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)`,
                [orden_id, item.producto_id, item.cantidad, item.precio_unitario]
            );
        }

        res.status(201).json({ message: 'Orden generada exitosamente', orden_id });
    } catch (error) {
        console.error('Error al crear orden cliente:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerDetallesOrden = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT d.id, d.orden_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal, p.nombre
             FROM detalle_orden_cliente d
             JOIN productos p ON d.producto_id = p.id
             WHERE d.orden_id = ?`,
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarOrdenCliente = async (req, res) => {
    const { id } = req.params;
    const { cliente_id, items } = req.body;

    if (!cliente_id) return res.status(400).json({ error: 'cliente_id es requerido' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });

    try {
        const total = items.reduce((acc, item) => acc + Number(item.precio_unitario) * Number(item.cantidad), 0);

        await db.query(
            `UPDATE orden_cliente SET cliente_id = ?, total = ? WHERE id = ?`,
            [cliente_id, total, id]
        );

        await db.query(`DELETE FROM detalle_orden_cliente WHERE orden_id = ?`, [id]);

        for (const item of items) {
            await db.query(
                `INSERT INTO detalle_orden_cliente (orden_id, producto_id, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)`,
                [id, item.producto_id, item.cantidad, item.precio_unitario]
            );
        }

        res.json({ message: 'Orden actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.procesarOrdenCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`SELECT id, total FROM orden_cliente WHERE id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });

        const orden = rows[0];

        const [existing] = await db.query(`SELECT id FROM factura_cliente WHERE orden_id = ?`, [id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Esta orden ya fue procesada' });

        const [[{ subtotalSum }]] = await db.query(
            `SELECT SUM(subtotal) AS subtotalSum FROM detalle_orden_cliente WHERE orden_id = ?`, [id]
        );

        const [facturaResult] = await db.query(
            `INSERT INTO factura_cliente (numero_factura, orden_id, fecha_emision, subtotal, impuesto, total, estatus_pago)
             VALUES (?, ?, NOW(), ?, 0.16, ?, NULL)`,
            [orden.id, orden.id, subtotalSum || 0, orden.total]
        );

        const factura_id = facturaResult.insertId;

        const [detalles] = await db.query(
            `SELECT producto_id, cantidad, precio_unitario, subtotal FROM detalle_orden_cliente WHERE orden_id = ?`, [id]
        );

        for (const d of detalles) {
            await db.query(
                `INSERT INTO detalle_factura_cliente (factura_id, producto_id, cantidad, precio_unitario, impuesto_aplicado, subtotal)
                 VALUES (?, ?, ?, ?, 0.16, ?)`,
                [factura_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal]
            );
        }

        await db.query(`UPDATE orden_cliente SET estatus = 'Procesada' WHERE id = ?`, [id]);

        res.json({ message: 'Orden procesada y factura generada' });
    } catch (error) {
        console.error('Error al procesar orden:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.repararDetallesFacturasCliente = async (req, res) => {
    try {
        // Eliminar entradas huérfanas cuyo factura_id no existe en factura_cliente.id
        await db.query(`
            DELETE dfc FROM detalle_factura_cliente dfc
            LEFT JOIN factura_cliente fc ON dfc.factura_id = fc.id
            WHERE fc.id IS NULL
        `);

        const [todasFacturas] = await db.query(
            `SELECT id, orden_id FROM factura_cliente`
        );

        if (todasFacturas.length === 0) {
            return res.json({ message: 'No hay facturas registradas', reparadas: 0 });
        }

        let reparadas = 0;
        for (const factura of todasFacturas) {
            const [[{ count }]] = await db.query(
                `SELECT COUNT(*) AS count FROM detalle_factura_cliente WHERE factura_id = ?`,
                [factura.id]
            );

            if (Number(count) === 0) {
                const [detalles] = await db.query(
                    `SELECT producto_id, cantidad, precio_unitario, subtotal FROM detalle_orden_cliente WHERE orden_id = ?`,
                    [factura.orden_id]
                );
                for (const d of detalles) {
                    await db.query(
                        `INSERT INTO detalle_factura_cliente (factura_id, producto_id, cantidad, precio_unitario, impuesto_aplicado, subtotal)
                         VALUES (?, ?, ?, ?, 0.16, ?)`,
                        [factura.id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal]
                    );
                }
                reparadas++;
            }
        }

        res.json({ message: `${reparadas} factura(s) reparada(s) correctamente`, reparadas });
    } catch (error) {
        console.error('Error al reparar detalles:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerDetallesFacturaCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT d.*, p.nombre AS nombre_producto
             FROM detalle_factura_cliente d
             LEFT JOIN productos p ON d.producto_id = p.id
             WHERE d.factura_id = ?`,
            [id]
        );
        console.log(`Detalles factura_cliente id=${id}:`, rows.length, 'filas');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener detalles de factura cliente:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerFacturasCliente = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT f.*, c.nombre AS nombre_cliente
             FROM factura_cliente f
             JOIN orden_cliente o ON f.orden_id = o.id
             JOIN clientes c ON o.cliente_id = c.id
             ORDER BY f.id DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener facturas cliente:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerOrdenesCliente = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT o.*, c.nombre AS nombre_cliente
             FROM orden_cliente o
             JOIN clientes c ON o.cliente_id = c.id
             ORDER BY o.id DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ordenes cliente:', error);
        res.status(500).json({ error: error.message });
    }
};
