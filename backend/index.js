// backend/index.js
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();            // <— Load .env (for DATABASE_URL, JWT_SECRET, etc.)

const userRoutes = require('./routes/users');
// (Once you scaffold the other route files, you'll do the same for them)
 const farmerRoutes   = require('./routes/farmers');
 const buyerRoutes    = require('./routes/buyers');
 const qualityRoutes  = require('./routes/agents/quality');
 const deliveryRoutes = require('./routes/agents/delivery');
 const cropRoutes     = require('./routes/crops');
 const orderRoutes    = require('./routes/orders');
 const adminRoutes    = require('./routes/admin');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(bodyParser.json());

// ─── ROUTES ────────────────────────────────────────────────────────────────────

// Health‐check (optional, good for quickly verifying the server is alive)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Mount user routes:
app.use('/api/users', userRoutes);

// Once you create other route files, uncomment and mount them here:
 app.use('/api/farmer', farmerRoutes);
 app.use('/api/buyers', buyerRoutes);
 app.use('/api/agents/quality', qualityRoutes);
 app.use('/api/agents/delivery', deliveryRoutes);
 app.use('/api/crops', cropRoutes);
 app.use('/api/orders', orderRoutes);
 app.use('/api/admin', adminRoutes);

// ─── ROOT (optional) ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('API is running');
});

// ─── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

