
const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

// GET all approved site reviews (public — shown to all customers)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM site_reviews WHERE is_approved = 1 ORDER BY created DESC`
    );
    const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : null;
    res.json({ reviews: rows, avg: parseFloat(avg) || 0, count: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all site reviews including unapproved (admin)
router.get('/all', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM site_reviews ORDER BY created DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST submit a site review (public — any visitor/customer)
router.post('/', async (req, res) => {
  try {
    const { user_id, name, email, rating, title, body } = req.body;
    if (!name || !rating || !body) return res.status(400).json({ error: 'Name, rating and review text are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const [result] = await db.query(
      'INSERT INTO site_reviews (user_id, name, email, rating, title, body, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [user_id || null, name, email || '', rating, title || '', body]
    );
    const [rows] = await db.query('SELECT * FROM site_reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH toggle approval (admin) — hide/show a review from the public site
router.patch('/:id/approve', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE site_reviews SET is_approved = ? WHERE id = ?', [req.body.is_approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE a site review (admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM site_reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;