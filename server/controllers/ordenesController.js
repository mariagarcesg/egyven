const db = require('../config/db');

exports.crearOrden = async (req, res) => {
    const { usuario_id, total } = req.body;

    try {
        // 0. Validar Perfil del Usuario
        const [userInfo] = await db.query('SELECT nombre, apellido, telefono, direccion FROM usuarios WHERE id = ?', [usuario_id]);
        if (userInfo.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const u = userInfo[0];
        if (!u.nombre || !u.apellido || !u.telefono || !u.direccion) {
            return res.status(400).json({
                error: 'PERFIL_INCOMPLETO',
                message: 'Debes completar tus datos de usuario para crear una orden'
            });
        }

        // 1. Obtener carrito del usuario
        const [carritoItems] = await db.query('SELECT * FROM carrito WHERE id_usuario = ?', [usuario_id]);

        if (carritoItems.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        // 2. Crear la orden de compra
        const [ordenResult] = await db.query(
            'INSERT INTO orden_compra (id_usuario, fecha_orden, total, estatus_id) VALUES (?, NOW(), ?, 1)',
            [usuario_id, total]
        );

        const id_orden = ordenResult.insertId;

        // 3. Crear los detalles de la orden
        for (let item of carritoItems) {
            // Intentar insertar incluyendo el subtotal. 
            // Si subtotal es campo autogenerado fallará, pero el usuario especificó que se guardará el cálculo.
            // Si falla, el usuario deberá indicar si debe quitarse el subtotal de aquí también.
            const subtotalCalculado = item.cantidad * item.precio_unitario;

            try {
                await db.query(
                    'INSERT INTO detalle_orden (id_orden, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [id_orden, item.id_producto, item.cantidad, item.precio_unitario, subtotalCalculado]
                );
            } catch (err) {
                // Si arroja error por ser generated column, intentar sin el subtotal
                if (err.message && err.message.includes('generated column')) {
                    await db.query(
                        'INSERT INTO detalle_orden (id_orden, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                        [id_orden, item.id_producto, item.cantidad, item.precio_unitario]
                    );
                } else {
                    throw err; // Es otro tipo de error
                }
            }

            // Opcional: Podríamos restar el stock del producto aquí.
            // await db.query('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?', [item.cantidad, item.id_producto]);
        }

        // 4. Vaciar el carrito
        await db.query('DELETE FROM carrito WHERE id_usuario = ?', [usuario_id]);

        res.status(201).json({ message: 'Orden creada exitosamente', id_orden });

    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ error: 'Error interno al crear la orden: ' + error.message });
    }
};

// Obtener todas las órdenes (para el Admin)
exports.obtenerOrdenes = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id, 
                o.id_usuario,   -- <--- ESTO ES LO QUE FALTA
                o.fecha_orden, 
                o.total, 
                o.estatus_id, 
                u.nombre, 
                u.apellido
            FROM orden_compra o
            JOIN usuarios u ON o.id_usuario = u.id
            ORDER BY o.id DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener ordenes:', error);
        res.status(500).json({ error: 'Error interno al obtener ordenes' });
    }
};

// Obtener detalles de una orden específica
exports.obtenerDetalleOrden = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT d.id, d.id_orden, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal,
                   p.nombre, p.imagen
            FROM detalle_orden d
            JOIN productos p ON d.id_producto = p.id
            WHERE d.id_orden = ?
        `;
        const [rows] = await db.query(query, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener detalle de orden:', error);
        res.status(500).json({ error: 'Error interno al obtener detalle' });
    }
};

// Obtener todas las órdenes (para el Admin) 
// ordenesController.js
exports.obtenerOrdenesUsuario = async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.id_usuario, o.fecha_orden, o.total, o.estatus_id, 
                   u.nombre, u.apellido
            FROM orden_compra o
            JOIN usuarios u ON o.id_usuario = u.id
            ORDER BY o.id DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener ordenes:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};
/* Procesar orden: Cambia estado a En Proceso */
exports.procesarOrden = async (req, res) => {
    const { id } = req.params;
    try {
        // Verificar que la orden exista
        const [existing] = await db.query('SELECT estatus_id FROM orden_compra WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        // Actualizar a En Proceso (estatus_id = 2)
        await db.query('UPDATE orden_compra SET estatus_id = 2 WHERE id = ?', [id]);
        res.status(200).json({ message: 'Orden procesada' });
    } catch (error) {
        console.error('Error al procesar orden:', error);
        res.status(500).json({ error: 'Error interno al procesar la orden' });
    }
};

/* Modificar cantidad en detalle de orden */
exports.modificarDetalleOrden = async (req, res) => {
    const { id } = req.params; // id del detalle_orden
    const { cantidad } = req.body;
    if (typeof cantidad !== 'number' || cantidad < 1) {
        return res.status(400).json({ error: 'Cantidad inválida' });
    }
    try {
        // Obtener precio unitario para recalcular subtotal
        const [rows] = await db.query('SELECT precio_unitario FROM detalle_orden WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Detalle de orden no encontrado' });
        }
        const precio = rows[0].precio_unitario;
        const nuevoSubtotal = precio * cantidad;
        await db.query('UPDATE detalle_orden SET cantidad = ?, subtotal = ? WHERE id = ?', [cantidad, nuevoSubtotal, id]);
        res.status(200).json({ message: 'Detalle actualizado' });
    } catch (error) {
        console.error('Error al modificar detalle:', error);
        res.status(500).json({ error: 'Error interno al modificar detalle' });
    }
};
