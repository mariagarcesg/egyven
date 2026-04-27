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
