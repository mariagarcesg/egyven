const db = require('../config/db');

// Obtener carrito por usuario_id
exports.obtenerCarrito = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const query = `
            SELECT c.id as carrito_id, c.id_usuario, c.id_producto, c.cantidad, c.subtotal, c.precio_unitario,
                   p.nombre, p.imagen, cat.nombre as categoria_nombre, p.stock_actual
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            LEFT JOIN categoria cat ON p.categoria_id = cat.id
            WHERE c.id_usuario = ?
        `;
        const [rows] = await db.query(query, [usuario_id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

// Agregar producto al carrito
exports.agregarAlCarrito = async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
    const cantAgregar = cantidad || 1;

    try {
        // 1. Obtener detalles del producto para validar stock y precio
        const [productoInfo] = await db.query('SELECT nombre, precio_venta, stock_actual FROM productos WHERE id = ?', [producto_id]);
        
        if (productoInfo.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const { nombre, precio_venta: precio_unitario, stock_actual } = productoInfo[0];

        // Verificar si ya existe el producto en el carrito del usuario
        const checkQuery = 'SELECT id, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?';
        const [existing] = await db.query(checkQuery, [usuario_id, producto_id]);

        let newCantidad = cantAgregar;

        if (existing.length > 0) {
            newCantidad = existing[0].cantidad + cantAgregar;
        }

        // 2. Validar Stock
        if (newCantidad > stock_actual) {
            return res.status(400).json({ error: `Stock insuficiente. Disponible: ${stock_actual}` });
        }

        if (existing.length > 0) {
            // Actualizar cantidad, MySQL calculará el subtotal automáticamente
            await db.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [newCantidad, existing[0].id]);
            res.status(200).json({ message: 'Cantidad actualizada en el carrito', action: 'updated' });
        } else {
            // Insertar nuevo producto, MySQL calculará el subtotal automáticamente
            const insertQuery = `
                INSERT INTO carrito (id_usuario, id_producto, nombre, cantidad, precio_unitario) 
                VALUES (?, ?, ?, ?, ?)
            `;
            await db.query(insertQuery, [usuario_id, producto_id, nombre, newCantidad, precio_unitario]);
            res.status(201).json({ message: 'Producto agregado al carrito', action: 'inserted' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar al carrito: ' + error.message });
    }
};

// Eliminar o reducir cantidad del carrito
exports.eliminarDelCarrito = async (req, res) => {
    const { id } = req.params; // ID de la fila en el carrito
    try {
        await db.query('DELETE FROM carrito WHERE id = ?', [id]);
        res.status(200).json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar del carrito' });
    }
};

// Actualizar cantidad exacta de un producto en el carrito
exports.actualizarCantidad = async (req, res) => {
    const { id } = req.params; // ID de la fila en el carrito
    const { cantidad } = req.body; // Nueva cantidad exacta

    try {
        if (cantidad <= 0) {
            await db.query('DELETE FROM carrito WHERE id = ?', [id]);
            return res.status(200).json({ message: 'Producto eliminado del carrito' });
        }

        // Obtener stock_actual para validar
        const [carritoItem] = await db.query('SELECT id_producto FROM carrito WHERE id = ?', [id]);
        if (carritoItem.length === 0) return res.status(404).json({ error: 'Item no encontrado' });

        const [productoInfo] = await db.query('SELECT stock_actual FROM productos WHERE id = ?', [carritoItem[0].id_producto]);
        
        if (cantidad > productoInfo[0].stock_actual) {
            return res.status(400).json({ error: `Stock insuficiente. Disponible: ${productoInfo[0].stock_actual}` });
        }

        await db.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, id]);
        res.status(200).json({ message: 'Cantidad actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
};
