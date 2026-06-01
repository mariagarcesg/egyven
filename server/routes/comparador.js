const express = require('express');
const router = express.Router();
const { processAllCompetitors } = require('../services/competitorPriceUpdater');
const db = require('../config/db');

// POST /api/comparador/run  body: { limit, delayMs }
router.post('/run', async (req, res) => {
  const { limit = 0, delayMs = 300 } = req.body || {};
  try {
    const summary = await processAllCompetitors({ limit: Number(limit) || 0, delayMs: Number(delayMs) || 300 });
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('Error running comparador:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

// GET /api/comparador/competidores
router.get('/competidores', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM producto_competidores');
    res.json({ ok: true, rows });
  } catch (err) {
    console.error('Error fetching competidores:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

// GET /api/comparador/precios
router.get('/precios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM precios_competencia');
    res.json({ ok: true, rows });
  } catch (err) {
    console.error('Error fetching precios:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

module.exports = router;
