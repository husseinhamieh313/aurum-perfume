const router = require('express').Router();
const db = require('../db');
const config = require('../config');
const { adminMiddleware } = require('../middleware/auth');

async function buildStoreContext() {
  try {
    const [[{ productCount }]] = await db.query('SELECT COUNT(*) as productCount FROM products');
    const [[{ brandCount }]]   = await db.query('SELECT COUNT(*) as brandCount FROM brands');
    const [[{ orderCount }]]   = await db.query('SELECT COUNT(*) as orderCount FROM orders');
    const [[{ revenue }]]      = await db.query('SELECT COALESCE(SUM(total),0) as revenue FROM orders');
    const [lowStock]    = await db.query('SELECT name, stock FROM products WHERE stock > 0 AND stock <= 10 ORDER BY stock ASC LIMIT 15');
    const [outOfStock]  = await db.query('SELECT name FROM products WHERE stock = 0');
    const [topProducts] = await db.query('SELECT p.name, b.name as brand_name, p.stock, p.price_50, p.price_100 FROM products p LEFT JOIN brands b ON p.brand_id = b.id ORDER BY p.created DESC LIMIT 10');
    const [recentOrders]= await db.query('SELECT id, customer, total, status, created FROM orders ORDER BY created DESC LIMIT 8');
    const [[{ unread }]]= await db.query('SELECT COUNT(*) as unread FROM messages WHERE is_read = 0');
    return `STORE DATA (${new Date().toLocaleDateString()}):
- Products: ${productCount} | Brands: ${brandCount} | Orders: ${orderCount}
- Revenue: $${Number(revenue).toFixed(2)} | Unread messages: ${unread}
- Out of stock: ${outOfStock.length ? outOfStock.map(p => p.name).join(', ') : 'None'}
- Low stock (<=10): ${lowStock.length ? lowStock.map(p => `${p.name}(${p.stock})`).join(', ') : 'None'}
- Recent products: ${topProducts.map(p => `${p.name}/${p.brand_name} 50ml:$${p.price_50} stock:${p.stock}`).join(' | ')}
- Recent orders: ${recentOrders.map(o => `${o.id} ${o.customer} $${Number(o.total).toFixed(0)} ${o.status}`).join(' | ')}`;
  } catch (err) {
    return `Store data unavailable: ${err.message}`;
  }
}

router.post('/ask', adminMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const apiKey = config.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'AI assistant not configured. Open server/config.js and set GROQ_API_KEY. Get a free key at https://console.groq.com'
      });
    }

    const storeContext = await buildStoreContext();

    const systemPrompt = `You are the AURUM Store Assistant — an internal AI helper for employees of the AURUM luxury perfume store.
You help with: inventory queries, order status, drafting customer emails, product descriptions, marketing copy, and store operations.
Be concise, professional, and practical. Use the live store data below when relevant.

${storeContext}`;

    // Clean history — Groq uses OpenAI-compatible format {role, content}
    const rawHistory = Array.isArray(history) ? history : [];
    const cleanHistory = rawHistory
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map(m => ({ role: m.role, content: m.content.trim() }))
      .slice(-10);

    // Ensure strict alternation — drop trailing user messages before adding new one
    while (cleanHistory.length && cleanHistory[cleanHistory.length - 1].role === 'user') {
      cleanHistory.pop();
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...cleanHistory,
      { role: 'user', content: message.trim() },
    ];

    // Groq API — OpenAI-compatible, key in Authorization header
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI/Groq] Error:', response.status, errText);
      let detail = errText;
      try { detail = JSON.parse(errText)?.error?.message || errText; } catch {}
      return res.status(502).json({ error: `AI error: ${detail}` });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || 'No response generated.';

    res.json({ reply });
  } catch (err) {
    console.error('[AI/Groq] Unexpected error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;