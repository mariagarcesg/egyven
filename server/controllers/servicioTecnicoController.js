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
            o.fecha_entrega,
            o.diagnostico_interno,
            o.estado,
            o.mano_obra,
            o.costo_repuestos,
            o.total_pagar AS total
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
             e.estado,
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
  const { cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha, estado } = req.body;
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
    const query = `INSERT INTO equipos_reparacion (cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [cliente_id || null, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha, estado != null ? estado : 0]);
    const [rows] = await db.query('SELECT id, cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro, estado FROM equipos_reparacion WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error crearEquipo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar equipo por id
exports.actualizarEquipo = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, estado } = req.body;
  try {
    const query = `UPDATE equipos_reparacion SET cliente_id = ?, categoria = ?, marca = ?, modelo = ?, numero_serie = ?, detalles_ingreso = ?, estado = ? WHERE id = ?`;
    const [result] = await db.query(query, [cliente_id || null, categoria, marca, modelo, numero_serie, detalles_ingreso, estado != null ? estado : 0, id]);
    if (result.affectedRows > 0) {
      const [rows] = await db.query('SELECT id, cliente_id, categoria, marca, modelo, numero_serie, detalles_ingreso, fecha_registro, estado FROM equipos_reparacion WHERE id = ?', [id]);
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
    // set fecha_entrega now if estado is Entregado
    const fechaEntrega = (dbEstado === 'Entregado') ? new Date() : null;
    const query = `INSERT INTO ordenes_servicio (equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno, estado, mano_obra, costo_repuestos, total_pagar, fecha_entrega) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno || null, dbEstado, mano_obra || 0, costo_repuestos || 0, total || 0, fechaEntrega]);
    const [rows] = await db.query(`SELECT o.id, o.equipo_id, CONCAT(e.marca, ' ', e.modelo) AS equipo_nombre, o.tecnico_id, CONCAT(t.nombre, ' ', t.apellido) AS tecnico_nombre, o.fecha_ingreso, o.fecha_entrega, o.estado, o.mano_obra, o.costo_repuestos, o.total_pagar AS total FROM ordenes_servicio o LEFT JOIN equipos_reparacion e ON o.equipo_id = e.id LEFT JOIN usuarios t ON o.tecnico_id = t.id WHERE o.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error crearOrden:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar orden de servicio por id
exports.actualizarOrden = async (req, res) => {
  const { id } = req.params;
  const { equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno, estado, mano_obra, costo_repuestos, total } = req.body;
  // map common frontend estados to DB ENUM literals if necessary
  const estadoMap = {
    'Pendiente': 'Recibido',
    'En Proceso': 'En Revision',
    'Entregado': 'Entregado'
  };
  const dbEstado = (estado && estadoMap[estado]) ? estadoMap[estado] : estado;

  try {
    // Log incoming payload for easier debugging
    console.log('actualizarOrden payload:', { id, equipo_id, tecnico_id, fecha_ingreso, diagnostico_interno, estado, mano_obra, costo_repuestos, total });

    // Basic validation
    const orderId = Number(id);
    if (!orderId) return res.status(400).json({ error: 'ID de orden inválido' });

    // fetch existing order to preserve fields not provided
    const [existingRows] = await db.query('SELECT * FROM ordenes_servicio WHERE id = ?', [orderId]);
    if (!existingRows || existingRows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    const existing = existingRows[0];

    const eqId = equipo_id != null ? (Number(equipo_id) || null) : existing.equipo_id;
    const tecId = tecnico_id != null ? (Number(tecnico_id) || null) : existing.tecnico_id;
    const manoNum = mano_obra != null ? Number(mano_obra) : Number(existing.mano_obra || 0);
    const repuestosNum = costo_repuestos != null ? Number(costo_repuestos) : Number(existing.costo_repuestos || 0);
    const totalNum = total != null ? Number(total) : Number(existing.total_pagar || manoNum + repuestosNum);
    const diag = diagnostico_interno != null ? diagnostico_interno : existing.diagnostico_interno;

    // determine if we should set fecha_entrega now
    let result;
    if (dbEstado === 'Entregado' && (existing.estado || '').toString().trim() !== 'Entregado') {
      const fechaEntrega = new Date();
      const query = `UPDATE ordenes_servicio SET equipo_id = ?, tecnico_id = ?, diagnostico_interno = ?, estado = ?, mano_obra = ?, costo_repuestos = ?, total_pagar = ?, fecha_entrega = ? WHERE id = ?`;
      [result] = await db.query(query, [eqId, tecId, diag || null, dbEstado, manoNum, repuestosNum, totalNum, fechaEntrega, orderId]);
    } else {
      const query = `UPDATE ordenes_servicio SET equipo_id = ?, tecnico_id = ?, diagnostico_interno = ?, estado = ?, mano_obra = ?, costo_repuestos = ?, total_pagar = ? WHERE id = ?`;
      [result] = await db.query(query, [eqId, tecId, diag || null, dbEstado, manoNum, repuestosNum, totalNum, orderId]);
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    const [rows] = await db.query(`SELECT o.id, o.equipo_id, CONCAT(e.marca, ' ', e.modelo) AS equipo_nombre, o.tecnico_id, CONCAT(t.nombre, ' ', t.apellido) AS tecnico_nombre, o.fecha_ingreso, o.fecha_entrega, o.estado, o.mano_obra, o.costo_repuestos, o.total_pagar AS total FROM ordenes_servicio o LEFT JOIN equipos_reparacion e ON o.equipo_id = e.id LEFT JOIN usuarios t ON o.tecnico_id = t.id WHERE o.id = ?`, [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error actualizarOrden:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear repuesto utilizado
exports.crearRepuesto = async (req, res) => {
  const { orden_servicio_id, producto_id, cantidad, precio_venta_momento } = req.body;
  const missing = [];
  if (!orden_servicio_id) missing.push('orden_servicio_id');
  if (!producto_id) missing.push('producto_id');
  if (!cantidad) missing.push('cantidad');
  if (missing.length > 0) return res.status(400).json({ error: 'Campos faltantes', missing });

  try {
    // determine price: use provided price if given, otherwise read current product price
    let precio = precio_venta_momento;
    if (!precio || Number(precio) === 0) {
      const [prodRows] = await db.query('SELECT precio_venta FROM productos WHERE id = ?', [producto_id]);
      precio = (prodRows && prodRows[0] && prodRows[0].precio_venta) ? prodRows[0].precio_venta : 0;
    }

    const query = `INSERT INTO repuestos_utilizados (orden_servicio_id, producto_id, cantidad, precio_venta_momento) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [orden_servicio_id, producto_id, cantidad, precio]);

    const [rows] = await db.query(`
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
      WHERE r.id = ?
    `, [result.insertId]);

    const out = (rows && rows[0]) ? rows[0] : null;
    res.status(201).json(out);
  } catch (error) {
    console.error('Error crearRepuesto:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar repuesto utilizado (precio_venta_momento no se modifica para preservar el precio histórico)
exports.actualizarRepuesto = async (req, res) => {
  const { id } = req.params;
  const { orden_servicio_id, producto_id, cantidad } = req.body;
  try {
    const repId = Number(id);
    if (!repId) return res.status(400).json({ error: 'ID de repuesto inválido' });
    const query = `UPDATE repuestos_utilizados SET orden_servicio_id = ?, producto_id = ?, cantidad = ? WHERE id = ?`;
    const [result] = await db.query(query, [orden_servicio_id || null, producto_id || null, cantidad || 0, repId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Repuesto no encontrado' });

    const [rows] = await db.query(`
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
      WHERE r.id = ?
    `, [repId]);

    res.status(200).json(rows && rows[0] ? rows[0] : null);
  } catch (error) {
    console.error('Error actualizarRepuesto:', error);
    res.status(500).json({ error: error.message });
  }
};
