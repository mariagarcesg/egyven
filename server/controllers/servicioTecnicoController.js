const db = require('../config/db');

// Obtener todos los clientes del servicio técnico
exports.obtenerClientes = async (req, res) => {
  try {
    const query = 'SELECT id, cedula, nombre, apellido, telefono, correo, fecha_registro FROM clientes_servicio';
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error obtenerClientes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un cliente por id
exports.actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { cedula, nombre, apellido, telefono, correo } = req.body;
  try {
    const query = `UPDATE clientes_servicio SET cedula = ?, nombre = ?, apellido = ?, telefono = ?, correo = ? WHERE id = ?`;
    const [result] = await db.query(query, [cedula, nombre, apellido, telefono, correo, id]);

    if (result.affectedRows > 0) {
      const [rows] = await db.query('SELECT id, cedula, nombre, apellido, telefono, correo, fecha_registro FROM clientes_servicio WHERE id = ?', [id]);
      return res.status(200).json(rows[0]);
    }

    res.status(404).json({ error: 'Cliente no encontrado' });
  } catch (error) {
    console.error('Error actualizarCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un cliente por id
exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM clientes_servicio WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Cliente eliminado' });
    }
    res.status(404).json({ error: 'Cliente no encontrado' });
  } catch (error) {
    console.error('Error eliminarCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear nuevo cliente
exports.crearCliente = async (req, res) => {
  const { cedula, nombre, apellido, telefono, correo, fecha } = req.body;
  try {
    const query = `INSERT INTO clientes_servicio (cedula, nombre, apellido, telefono, correo, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [cedula, nombre, apellido, telefono, correo, fecha]);
    const [rows] = await db.query('SELECT id, cedula, nombre, apellido, telefono, correo, fecha_registro FROM clientes_servicio WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error crearCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener órdenes de servicio
exports.obtenerOrdenesServicio = async (req, res) => {
  try {
    const query = `
                  SELECT o.id,
                    o.equipo_id,
                    CONCAT(e.marca, ' ', e.modelo) AS equipo_nombre,
                    o.tecnico_id,
                    CONCAT(t.nombre, ' ', t.apellido) AS tecnico_nombre,
                    o.fecha_ingreso,
                    o.estado
            FROM ordenes_servicio o
            LEFT JOIN equipos_reparacion e ON o.equipo_id = e.id
            LEFT JOIN usuarios t ON o.tecnico_id = t.id
            ORDER BY o.id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error obtenerOrdenesServicio:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener equipos de reparacion
exports.obtenerEquipos = async (req, res) => {
  try {
    const query = `
      SELECT e.id,
             e.cliente_id,
             CONCAT(c.nombre, ' ', c.apellido) AS cliente_nombre,
             e.categoria,
             e.marca,
             e.modelo,
             e.numero_serie,
             e.detalles_ingreso,
             e.fecha_registro
      FROM equipos_reparacion e
      LEFT JOIN clientes_servicio c ON e.cliente_id = c.id
      ORDER BY e.id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error obtenerEquipos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener repuestos utilizados
exports.obtenerRepuestos = async (req, res) => {
  try {
    const query = `
      SELECT r.id,
             r.orden_servicio_id,
             r.producto_id,
             p.nombre AS producto_nombre,
             r.cantidad,
             r.precio_venta_momento,
             o.equipo_id AS equipo_id,
             CONCAT(e.marca, ' ', e.modelo) AS equipo_nombre
      FROM repuestos_utilizados r
      LEFT JOIN productos p ON r.producto_id = p.id
      LEFT JOIN ordenes_servicio o ON r.orden_servicio_id = o.id
      LEFT JOIN equipos_reparacion e ON o.equipo_id = e.id
      ORDER BY r.id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows.map(row => ({
      ...row,
      producto_nombre: row.producto_nombre || `#${row.producto_id}`,
      equipo_nombre: row.equipo_nombre || (row.equipo_id ? `#${row.equipo_id}` : null)
    })));
  } catch (error) {
    console.error('Error obtenerRepuestos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear nuevo equipo
exports.crearEquipo = async (req, res) => {
  const { cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha } = req.body;
  console.log('crearEquipo body:', req.body);
  // Validación básica
  const missing = [];
  if (!cliente_id) missing.push('cliente_id');
  if (!categoria) missing.push('categoria');
  if (!marca) missing.push('marca');
  if (!modelo) missing.push('modelo');
  if (!numero_serie) missing.push('numero_serie');
  if (!detalles_ingreso) missing.push('detalles_ingreso');
  if (missing.length > 0) {
    return res.status(400).json({ error: 'Campos faltantes', missing });
  }
  try {
    const query = `INSERT INTO equipos_reparacion (cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [cliente_id || null, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha]);
    const [rows] = await db.query('SELECT id, cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro FROM equipos_reparacion WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error crearEquipo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar equipo por id
exports.actualizarEquipo = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso } = req.body;
  try {
    const query = `UPDATE equipos_reparacion SET cliente_id = ?, categoria = ?, marca = ?, modelo = ?, numero_serie = ?, detalles_ingreso = ? WHERE id = ?`;
    const [result] = await db.query(query, [cliente_id || null, categoria, marca, modelo, numero_serie, detalles_ingreso, id]);
    if (result.affectedRows > 0) {
      const [rows] = await db.query('SELECT id, cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro FROM equipos_reparacion WHERE id = ?', [id]);
      return res.status(200).json(rows[0]);
    }
    res.status(404).json({ error: 'Equipo no encontrado' });
  } catch (error) {
    console.error('Error actualizarEquipo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar equipo por id
exports.eliminarEquipo = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM equipos_reparacion WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Equipo eliminado' });
    }
    res.status(404).json({ error: 'Equipo no encontrado' });
  } catch (error) {
    console.error('Error eliminarEquipo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener técnicos (usuarios con rol_id = 2)
exports.obtenerTecnicos = async (req, res) => {
  try {
    const query = 'SELECT id, nombre, apellido FROM usuarios WHERE rol_id = ?';
    const [rows] = await db.query(query, [2]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error obtenerTecnicos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear nueva orden de servicio
exports.crearOrden = async (req, res) => {
  const { equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno, estado, mano_obra, costo_repuestos, total } = req.body;
  // map common frontend estados to DB ENUM literals
  const estadoMap = {
    'Pendiente': 'Recibido',
    'En Proceso': 'En Revision',
    'Entregado': 'Entregado'
  };
  const dbEstado = (estado && estadoMap[estado]) ? estadoMap[estado] : estado;
  const missing = [];
  if (!equipo_id) missing.push('equipo_id');
  if (!tecnico_id) missing.push('tecnico_id');
  if (!fecha_ingreso) missing.push('fecha_ingreso');
  if (!estado) missing.push('estado');
  if (missing.length > 0) return res.status(400).json({ error: 'Campos faltantes', missing });

  try {
    const query = `INSERT INTO ordenes_servicio (equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno, estado, mano_obra, costo_repuestos, total_pagar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno || null, dbEstado, mano_obra || 0, costo_repuestos || 0, total || 0]);
    const [rows] = await db.query(`SELECT o.id, o.equipo_id, CONCAT(e.marca, ' ', e.modelo) AS equipo_nombre, o.tecnico_id, CONCAT(t.nombre, ' ', t.apellido) AS tecnico_nombre, o.fecha_ingreso, o.estado, o.mano_obra, o.costo_repuestos, o.total_pagar AS total FROM ordenes_servicio o LEFT JOIN equipos_reparacion e ON o.equipo_id = e.id LEFT JOIN usuarios t ON o.tecnico_id = t.id WHERE o.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error crearOrden:', error);
    res.status(500).json({ error: error.message });
  }
};
