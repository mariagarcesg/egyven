const db = require('../config/db');

// Función para registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
    // Recibimos los campos definidos en tu diccionario de datos
    const { username, password, rol_id, cedula_rif, nombre, apellido, telefono, email, direccion } = req.body;

    try {
        const query = `
            INSERT INTO usuarios (username, password, rol_id, cedula_rif, nombre, apellido, telefono, email, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            username,
            password, // Nota: Luego deberías encriptarla con bcrypt
            rol_id,
            cedula_rif,
            nombre,
            apellido,
            telefono,
            email,
            direccion
        ]);

        res.status(201).json({
            message: 'Usuario registrado exitosamente en EGYVEN',
            usuarioId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario: ' + error.message });
    }
};

// Función para obtener todos los usuarios (para pruebas)

exports.obtenerUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, nombre, apellido FROM usuarios');

        // ESTO SE VERÁ EN TU TERMINAL (Node)
        console.log("Datos recuperados de MySQL:", rows);

        res.json(rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: error.message });
    }
};