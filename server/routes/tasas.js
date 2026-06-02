const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT moneda_origen, moneda_destino, tasa_cambio, fecha_registro
            FROM tasas_cambio
            ORDER BY fecha_registro DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('ERROR GET TASAS_CAMBIO:', error);
        res.status(500).json({ message: 'Error al obtener tasas de cambio' });
    }
});

router.post('/', async (req, res) => {
    const { moneda_origen, moneda_destino, tasa_cambio, fecha_registro } = req.body;
    if (!moneda_origen || !moneda_destino || !tasa_cambio || !fecha_registro) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        await db.query(
            'UPDATE tasas_cambio SET activo = 0 WHERE moneda_origen = ? AND moneda_destino = ?',
            [moneda_origen, moneda_destino]
        );
        await db.query(
            'INSERT INTO tasas_cambio (moneda_origen, moneda_destino, tasa_cambio, fecha_registro, activo) VALUES (?, ?, ?, ?, 1)',
            [moneda_origen, moneda_destino, tasa_cambio, fecha_registro]
        );
        res.status(201).json({ message: 'Tasa registrada correctamente' });
    } catch (error) {
        console.error('ERROR POST TASAS_CAMBIO:', error);
        res.status(500).json({ message: 'Error al registrar la tasa de cambio' });
    }
});

module.exports = router;
