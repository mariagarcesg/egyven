const db = require('../config/db');

exports.obtenerClientes = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nombre, documento_identidad, telefono, direccion, fecha_registro FROM clientes ORDER BY fecha_registro DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.crearCliente = async (req, res) => {
    const { nombre, documento_identidad, telefono, direccion } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, documento_identidad, telefono, direccion) VALUES (?, ?, ?, ?)',
            [nombre, documento_identidad, telefono, direccion]
        );
        const [rows] = await db.query('SELECT id, nombre, documento_identidad, telefono, direccion, fecha_registro FROM clientes WHERE id = ?', [result.insertId]);
        res.status(201).json({ message: 'Cliente creado', cliente: rows[0] });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, documento_identidad, telefono, direccion } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE clientes SET nombre = ?, documento_identidad = ?, telefono = ?, direccion = ? WHERE id = ?',
            [nombre, documento_identidad, telefono, direccion, id]
        );
        if (result.affectedRows > 0) {
            const [rows] = await db.query('SELECT id, nombre, documento_identidad, telefono, direccion, fecha_registro FROM clientes WHERE id = ?', [id]);
            res.json({ message: 'Cliente actualizado', cliente: rows[0] });
        } else {
            res.status(404).json({ error: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: error.message });
    }
};
