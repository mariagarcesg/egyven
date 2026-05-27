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

// Función para inicio de sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
        const [rows] = await db.query(query, [username, password]);

        if (rows.length > 0) {
            // Verificar si el usuario está activo
            if (rows[0].status === 0 || rows[0].status === '0') {
                return res.status(403).json({ error: 'Usuario inactivo' });
            }

            // Usuario encontrado y activo
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                usuario: {
                    id: rows[0].id,
                    username: rows[0].username,
                    nombre: rows[0].nombre,
                    rol_id: rows[0].rol_id,
                    status: rows[0].status
                }
            });
        } else {
            // Credenciales incorrectas
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
    }
};

// Función para obtener todos los usuarios (para pruebas)
exports.obtenerUsuarios = async (req, res) => {
    try {
        // Incluir el campo `status` para que el frontend pueda mostrar Activo/Inactivo
        const [rows] = await db.query('SELECT id, username, nombre, apellido, status FROM usuarios');
        console.log("Datos recuperados de MySQL:", rows);
        res.json(rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: error.message });
    }
};

// Función para obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;
    try {
        // Incluir `status` en la consulta por ID
        const query = 'SELECT id, username, password, rol_id, cedula_rif, nombre, apellido, telefono, email, direccion, status FROM usuarios WHERE id = ?';
        const [rows] = await db.query(query, [id]);
        
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

// Función para actualizar el perfil de un usuario
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { username, password, cedula_rif, nombre, apellido, telefono, email, direccion, status } = req.body;
    
    try {
        let query;
        let params;
        
        // Si el password viene vacío, no lo actualizamos para mantener el anterior
        if (password && password.trim() !== '') {
            query = `
                UPDATE usuarios 
                SET username = ?, password = ?, cedula_rif = ?, nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, status = ?
                WHERE id = ?
            `;
            params = [username, password, cedula_rif, nombre, apellido, telefono, email, direccion, status, id];
        } else {
            query = `
                UPDATE usuarios 
                SET username = ?, cedula_rif = ?, nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, status = ?
                WHERE id = ?
            `;
            params = [username, cedula_rif, nombre, apellido, telefono, email, direccion, status, id];
        }
        
        console.log('Actualizar usuario payload:', params);
        const [result] = await db.query(query, params);
        
        if (result.affectedRows > 0) {
            // Devolver el usuario actualizado para confirmación
            const [updatedRows] = await db.query('SELECT id, username, nombre, apellido, telefono, email, direccion, status, rol_id FROM usuarios WHERE id = ?', [id]);
            res.status(200).json({ message: 'Perfil actualizado exitosamente', usuario: updatedRows[0] });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado o sin cambios' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario: ' + error.message });
    }
};