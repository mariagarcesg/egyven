const db = require('../config/db');

exports.obtenerRoles = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre FROM rol ORDER BY id');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los roles' });
    }
};
