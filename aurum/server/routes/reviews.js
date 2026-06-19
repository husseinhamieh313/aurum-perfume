const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

// GET all reviews for a product (approved only for public)
router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, 
        u.name as user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created DESC`,
      [req.params.productId]
    );
    // compute avg rating
    const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : null;
    res.json({ reviews: rows, avg: parseFloat(avg) || 0, count: rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all reviews (admin)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, p.name as product_name
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.created DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST submit a review (public)
router.post('/', async (req, res) => {
  try {
    const { product_id, user_id, name, email, rating, title, body } = req.body;
    if (!product_id || !name || !rating) return res.status(400).json({ error: 'product_id, name and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    // prevent duplicate review from same email per product
    if (email) {
      const [existing] = await db.query(
        'SELECT id FROM reviews WHERE product_id = ? AND email = ?',
        [product_id, email]
      );
      if (existing.length) return res.status(409).json({ error: 'You have already reviewed this product.' });
    }

    const [result] = await db.query(
      'INSERT INTO reviews (product_id, user_id, name, email, rating, title, body, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [product_id, user_id || null, name, email || '', rating, title || '', body || '']
    );
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE review (admin)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH toggle approval (admin)
router.patch('/:id/approve', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [req.body.is_approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;