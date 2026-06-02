const express = require('express');
const router = express.Router();
const { processAllCompetitors, processSingleCompetitor } = require('../services/competitorPriceUpdater');
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

// POST /api/comparador/competidores
router.post('/competidores', async (req, res) => {
  try {
    const { producto_id, plataforma, url } = req.body || {};
    if (!producto_id || !plataforma || !url) {
      return res.status(400).json({ ok: false, message: 'Falta producto_id, plataforma o url' });
    }

    const cleanUrl = String(url).split('?')[0];
    let competitor_product_id = null;

    // Try multiple patterns per platform to extract a stable product id
    if (/amazon/i.test(plataforma)) {
      // Common Amazon patterns: /dp/ASIN, /gp/product/ASIN, /product/ASIN, or standalone ASIN
      const patterns = [/\/dp\/([A-Z0-9]{10})/i, /\/gp\/product\/([A-Z0-9]{10})/i, /\/product\/([A-Z0-9]{10})/i, /(?:[\-/])([A-Z0-9]{10})(?:[\-/]|$)/i];
      for (const r of patterns) {
        const m = cleanUrl.match(r);
        if (m) { competitor_product_id = m[1]; break; }
      }
    } else if (/ebay/i.test(plataforma)) {
      // eBay patterns: /itm/<title>/<itemid> or /itm/<itemid>
      const patterns = [/\/itm\/(?:.*\/)?(\d{9,12})/i, /(\d{9,12})(?:$|\D)/];
      for (const r of patterns) {
        const m = cleanUrl.match(r);
        if (m) { competitor_product_id = m[1]; break; }
      }
    }

    // Fallback: use last path segment if it looks like an id, otherwise store the cleaned URL to avoid NULL DB error
    if (!competitor_product_id) {
      try {
        const parts = cleanUrl.split('/').filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : '';
        if (last && last.length >= 6 && last.length <= 40) {
          competitor_product_id = last;
        } else {
          competitor_product_id = cleanUrl; // last resort: store full URL
        }
      } catch (e) {
        competitor_product_id = cleanUrl;
      }
    }

    // Insert into DB
    const q = `INSERT INTO producto_competidores (producto_id, plataforma, competitor_product_id, url_competidor, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const params = [producto_id, plataforma, competitor_product_id, cleanUrl];
    await db.query(q, params);

    res.json({ ok: true, producto_id, plataforma, competitor_product_id, url_competidor: cleanUrl });
  } catch (err) {
    console.error('Error creating competidor:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

module.exports = router;

// PUT /api/comparador/competidores/:id  -> update existing competitor
router.put('/competidores/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { producto_id, plataforma, url } = req.body || {};
    if (!id || !producto_id || !plataforma || !url) {
      return res.status(400).json({ ok: false, message: 'Falta id, producto_id, plataforma o url' });
    }

    const cleanUrl = String(url).split('?')[0];
    let competitor_product_id = null;

    if (/amazon/i.test(plataforma)) {
      const patterns = [/\/dp\/([A-Z0-9]{10})/i, /\/gp\/product\/([A-Z0-9]{10})/i, /\/product\/([A-Z0-9]{10})/i, /(?:[\-/])([A-Z0-9]{10})(?:[\-/]|$)/i];
      for (const r of patterns) {
        const m = cleanUrl.match(r);
        if (m) { competitor_product_id = m[1]; break; }
      }
    } else if (/ebay/i.test(plataforma)) {
      const patterns = [/\/itm\/(?:.*\/)?(\d{9,12})/i, /(\d{9,12})(?:$|\D)/];
      for (const r of patterns) {
        const m = cleanUrl.match(r);
        if (m) { competitor_product_id = m[1]; break; }
      }
    }

    if (!competitor_product_id) {
      try {
        const parts = cleanUrl.split('/').filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : '';
        if (last && last.length >= 6 && last.length <= 40) {
          competitor_product_id = last;
        } else {
          competitor_product_id = cleanUrl;
        }
      } catch (e) {
        competitor_product_id = cleanUrl;
      }
    }

    const q = `UPDATE producto_competidores SET producto_id = ?, plataforma = ?, competitor_product_id = ?, url_competidor = ? WHERE id = ?`;
    const params = [producto_id, plataforma, competitor_product_id, cleanUrl, id];
    const [result] = await db.query(q, params);
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: 'Competidor no encontrado' });
    }
    res.json({ ok: true, id, producto_id, plataforma, competitor_product_id, url_competidor: cleanUrl });
  } catch (err) {
    console.error('Error updating competidor:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});

// POST /api/comparador/precios/refresh  body: { producto_id, plataforma, competitor_product_id?, url? }
router.post('/precios/refresh', async (req, res) => {
  try {
    const { producto_id, plataforma, competitor_product_id, url } = req.body || {};
    if (!producto_id || !plataforma) return res.status(400).json({ ok: false, message: 'Falta producto_id o plataforma' });

    let competitorId = competitor_product_id || null;

    if (!competitorId) {
      // Try to find from producto_competidores table
      const [rows] = await db.query('SELECT * FROM producto_competidores WHERE producto_id = ? AND plataforma = ? LIMIT 1', [producto_id, plataforma]);
      if (rows && rows[0]) {
        competitorId = rows[0].competitor_product_id || rows[0].url_competidor || null;
      }
    }

    // If still not found, try to use provided url as id
    if (!competitorId && url) competitorId = url;

    if (!competitorId) return res.status(400).json({ ok: false, message: 'No se encontró competitor id para actualizar' });

    const result = await processSingleCompetitor({ productoId: producto_id, plataforma, competitorId });
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Error refreshing precio:', err);
    res.status(500).json({ ok: false, message: err.message || String(err) });
  }
});
