const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

// Self-healing: create table without FK constraint so it never fails on limited DB users
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      product_id  INT NOT NULL,
      user_id     INT,
      name        VARCHAR(120) NOT NULL,
      email       VARCHAR(180),
      rating      TINYINT NOT NULL,
      title       VARCHAR(180),
      body        TEXT,
      is_approved TINYINT(1) DEFAULT 1,
      created     DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

// Run immediately and cache the promise
const tableReady = ensureTable().catch(err => {
  console.error('[reviews] Table init error:', err.message);
});

// Wait for table before every request
router.use(async (req, res, next) => {
  try { await tableReady; next(); }
  catch (err) { res.status(500).json({ error: 'Reviews unavailable: ' + err.message }); }
});

// GET reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created DESC',
      [req.params.productId]
    );
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
    res.json({ reviews: rows, avg: parseFloat(avg.toFixed(1)), count });
  } catch (err) {
    console.error('[reviews GET product]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET all reviews (admin)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, p.name as product_name
       FROM reviews r LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST new review (public)
router.post('/', async (req, res) => {
  try {
    const { product_id, user_id, name, email, rating, title, body } = req.body;
    if (!product_id || !name || !rating) return res.status(400).json({ error: 'product_id, name and rating are required' });
    const r = Number(rating);
    if (r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    if (email) {
      const [existing] = await db.query('SELECT id FROM reviews WHERE product_id = ? AND email = ?', [product_id, email]);
      if (existing.length) return res.status(409).json({ error: 'You have already reviewed this product.' });
    }
    const [result] = await db.query(
      'INSERT INTO reviews (product_id, user_id, name, email, rating, title, body, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [product_id, user_id || null, name, email || '', r, title || '', body || '']
    );
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try { await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH approve/hide (admin)
router.patch('/:id/approve', adminMiddleware, async (req, res) => {
  try { await db.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [req.body.is_approved ? 1 : 0, req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;