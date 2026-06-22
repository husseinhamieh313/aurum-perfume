const express = require('express');
const cors = require('cors');
const authRoutes     = require('./routes/auth');
const brandRoutes    = require('./routes/brands');
const productRoutes  = require('./routes/products');
const orderRoutes    = require('./routes/orders');
const messageRoutes  = require('./routes/messages');
const settingsRoutes = require('./routes/settings');
const userRoutes     = require('./routes/users');
const reviewRoutes   = require('./routes/reviews');
const siteReviewRoutes = require('./routes/site-reviews');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/auth',     authRoutes);
app.use('/api/brands',   brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/site-reviews', siteReviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'AURUM API' }));

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`🟡 AURUM Server running on http://localhost:${PORT}`));