const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_reviews (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT,
      name        VARCHAR(120) NOT NULL,
      email       VARCHAR(180),
      rating      TINYINT NOT NULL,
      title       VARCHAR(180),
      body        TEXT NOT NULL,
      is_approved TINYINT(1) DEFAULT 1,
      created     DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}
const tableReady = ensureTable().catch(err => console.error('[site_reviews] Table init error:', err.message));

router.use(async (req, res, next) => {
  try { await tableReady; next(); }
  catch (err) { res.status(500).json({ error: 'Site reviews unavailable: ' + err.message }); }
});

// GET approved (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_reviews WHERE is_approved = 1 ORDER BY created DESC');
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
    res.json({ reviews: rows, avg: parseFloat(avg.toFixed(1)), count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all (admin)
router.get('/all', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_reviews ORDER BY created DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST (public)
router.post('/', async (req, res) => {
  try {
    const { user_id, name, email, rating, title, body } = req.body;
    if (!name || !rating || !body) return res.status(400).json({ error: 'Name, rating and review are required' });
    const r = Number(rating);
    if (r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const [result] = await db.query(
      'INSERT INTO site_reviews (user_id, name, email, rating, title, body, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [user_id || null, name, email || '', r, title || '', body]
    );
    const [rows] = await db.query('SELECT * FROM site_reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH approve (admin)
router.patch('/:id/approve', adminMiddleware, async (req, res) => {
  try { await db.query('UPDATE site_reviews SET is_approved = ? WHERE id = ?', [req.body.is_approved ? 1 : 0, req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try { await db.query('DELETE FROM site_reviews WHERE id = ?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;