const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, joined FROM users ORDER BY joined DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (rows[0]?.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
