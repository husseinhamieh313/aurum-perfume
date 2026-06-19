const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

const DEFAULT_PROFILE = { projection: 5, summer: 5, winter: 5, fall: 5, spring: 5, day: 5, night: 5 };

function parseProfile(raw) {
  try {
    if (!raw) return DEFAULT_PROFILE;
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { ...DEFAULT_PROFILE, ...p };
  } catch { return DEFAULT_PROFILE; }
}

router.get('/', async (req, res) => {
  try {
    const { category, brand_id, search } = req.query;
    let q = 'SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE 1=1';
    const params = [];
    if (category) { q += ' AND p.category = ?'; params.push(category); }
    if (brand_id) { q += ' AND p.brand_id = ?'; params.push(brand_id); }
    if (search) { q += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.notes LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
    q += ' ORDER BY p.created DESC';
    const [rows] = await db.query(q, params);
    res.json(rows.map(p => ({ ...p, scent_profile: parseProfile(p.scent_profile) })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, b.name as brand_name, b.country as brand_country FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    const p = rows[0];
    res.json({ ...p, scent_profile: parseProfile(p.scent_profile) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { brand_id, name, category, price_tester, price_50, price_100, stock, description, notes, images, detail_blocks, scent_profile } = req.body;
    const created = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      'INSERT INTO products (brand_id, name, category, price_tester, price_50, price_100, stock, description, notes, images, detail_blocks, scent_profile, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand_id, name, category || 'men', price_tester || 0, price_50 || 0, price_100 || 0, stock || 0,
       description || '', notes || '',
       JSON.stringify(images || []), JSON.stringify(detail_blocks || []),
       JSON.stringify(scent_profile || DEFAULT_PROFILE), created]
    );
    const [rows] = await db.query('SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], scent_profile: parseProfile(rows[0].scent_profile) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { brand_id, name, category, price_tester, price_50, price_100, stock, description, notes, images, detail_blocks, scent_profile } = req.body;
    await db.query(
      'UPDATE products SET brand_id=?, name=?, category=?, price_tester=?, price_50=?, price_100=?, stock=?, description=?, notes=?, images=?, detail_blocks=?, scent_profile=? WHERE id=?',
      [brand_id, name, category, price_tester || 0, price_50 || 0, price_100 || 0, stock || 0,
       description || '', notes || '',
       JSON.stringify(images || []), JSON.stringify(detail_blocks || []),
       JSON.stringify(scent_profile || DEFAULT_PROFILE), req.params.id]
    );
    const [rows] = await db.query('SELECT p.*, b.name as brand_name FROM products p LEFT JOIN brands b ON p.brand_id = b.id WHERE p.id = ?', [req.params.id]);
    res.json({ ...rows[0], scent_profile: parseProfile(rows[0].scent_profile) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;