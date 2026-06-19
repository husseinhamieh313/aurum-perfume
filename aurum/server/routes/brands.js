const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM brands ORDER BY name');
    // Add product count to each brand
    const [counts] = await db.query('SELECT brand_id, COUNT(*) as count FROM products GROUP BY brand_id');
    const countMap = {};
    counts.forEach(c => (countMap[c.brand_id] = c.count));
    res.json(brands.map(b => ({ ...b, productCount: countMap[b.id] || 0 })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Brand not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, country, founded, logo, website, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO brands (name, country, founded, logo, website, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, country || '', founded || '', logo || '', website || '', description || '']
    );
    const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { name, country, founded, logo, website, description } = req.body;
    await db.query(
      'UPDATE brands SET name=?, country=?, founded=?, logo=?, website=?, description=? WHERE id=?',
      [name, country || '', founded || '', logo || '', website || '', description || '', req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
