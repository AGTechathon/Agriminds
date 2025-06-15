const db = require('../db'); // adjust path as needed



exports.getAllCrops = async (req, res) => {
  try {
    console.log('🚀 Fetching all crops');
    const result = await db.query(
      'SELECT id, farmer_id, name, quantity, unit, price, harvest_date, images, description, status, category, created_at FROM crops WHERE status = $1',
      ['approved']
    );
    console.log(`✅ Fetched ${result.rows.length} crops`);
    const transformedCrops = result.rows.map(crop => ({
      ...crop,
      id: String(crop.id),
      images: Array.isArray(crop.images) ? crop.images : JSON.parse(crop.images || '[]'),
      harvest_date: crop.harvest_date ? new Date(crop.harvest_date).toISOString() : null,
      created_at: crop.created_at ? new Date(crop.created_at).toISOString() : null,
    }));
    res.json(transformedCrops);
  } catch (err) {
    console.error('❌ Error fetching crops:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get crop by ID
exports.getCropById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM crops WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Crop not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

// Add a new crop (farmer only)
exports.addCrop = async (req, res) => {
    try {
        const { name, type, quantity, price } = req.body;
        const farmer_id = req.user.userId;
        await db.query(
            'INSERT INTO crops (name, type, quantity, price, farmer_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, quantity, price, farmer_id, 'pending']
        );
        res.status(201).json({ message: 'Crop added and pending approval' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

// Get all pending crops (admin only)
exports.getPendingCrops = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM crops WHERE status='pending'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

// Approve a crop (admin only)
exports.approveCrop = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE crops SET status='approved' WHERE id = ?", [id]);
        res.json({ message: 'Crop approved' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

// Reject a crop (admin only)
exports.rejectCrop = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE crops SET status='rejected' WHERE id = ?", [id]);
        res.json({ message: 'Crop rejected' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};
