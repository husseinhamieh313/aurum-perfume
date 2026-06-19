const router = require('express').Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { customer, email, items, total, payment, address } = req.body;
    if (!items || !items.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // ── Check stock & deduct for every item ──────────────────
    for (const item of items) {
      const [rows] = await conn.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [item.id]);
      if (!rows.length) {
        await conn.rollback();
        return res.status(404).json({ error: `Product #${item.id} not found` });
      }
      const currentStock = rows[0].stock;
      const needed = item.qty || 1;
      if (currentStock < needed) {
        await conn.rollback();
        return res.status(409).json({
          error: `Sorry, only ${currentStock} unit(s) of "${item.name}" are available.`
        });
      }
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [needed, item.id]
      );
    }

    // ── Insert order ─────────────────────────────────────────
    const id = 'AUR-' + Date.now().toString().slice(-8);
    const created = new Date().toISOString().split('T')[0];
    await conn.query(
      'INSERT INTO orders (id, customer, email, items, total, payment, status, address, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, customer, email, JSON.stringify(items), total, payment, 'Confirmed', address, created]
    );

    await conn.commit();
    res.status(201).json({ id, status: 'Confirmed' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id/status', adminMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;