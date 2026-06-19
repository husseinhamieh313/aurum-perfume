const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages ORDER BY created DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const created = new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      'INSERT INTO messages (name, email, subject, message, is_read, created) VALUES (?, ?, ?, ?, 0, ?)',
      [name, email, subject || '', message, created]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/read-all', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE messages SET is_read = 1');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
