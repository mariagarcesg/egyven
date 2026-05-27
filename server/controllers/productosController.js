const db = require('../config/db');

exports.obtenerProductos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p
            JOIN categoria c ON p.categoria_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categoria');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, sku, costo, precio_venta, stock_actual, categoria_id, status } = req.body;
        // Si se subió imagen, obtener path relativo
        let imagenPath = null;
        if (req.file) {
            // Guardamos la ruta relativa para servir desde /src/assets/images o /assets/images
            imagenPath = `src/assets/images/${req.file.filename}`;
        }

        const query = `INSERT INTO productos (nombre, sku, costo, precio_venta, stock_actual, categoria_id, imagen, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [nombre, sku, costo || 0, precio_venta || 0, stock_actual || 0, categoria_id || null, imagenPath, status != null ? status : 0];
        const [result] = await db.query(query, params);

        // Devolver el producto creado
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno al crear producto' });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, sku, costo, precio_venta, stock_actual, categoria_id, status } = req.body;

        let imagenPath = null;
        if (req.file) {
            imagenPath = `src/assets/images/${req.file.filename}`;
        }

        const fields = [];
        const params = [];
        if (nombre !== undefined) { fields.push('nombre = ?'); params.push(nombre); }
        if (sku !== undefined) { fields.push('sku = ?'); params.push(sku); }
        if (costo !== undefined) { fields.push('costo = ?'); params.push(costo); }
        if (precio_venta !== undefined) { fields.push('precio_venta = ?'); params.push(precio_venta); }
        if (stock_actual !== undefined) { fields.push('stock_actual = ?'); params.push(stock_actual); }
        if (categoria_id !== undefined) { fields.push('categoria_id = ?'); params.push(categoria_id); }
        if (status !== undefined) { fields.push('status = ?'); params.push(status); }
        if (imagenPath) { fields.push('imagen = ?'); params.push(imagenPath); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }

        params.push(id);
        const query = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(query, params);

        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno al actualizar producto' });
    }
};
