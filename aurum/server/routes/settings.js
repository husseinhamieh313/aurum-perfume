const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => (settings[r.setting_key] = r.setting_value));
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', adminMiddleware, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await db.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
