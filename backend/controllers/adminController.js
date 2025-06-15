const db = require('../db'); // Assume you have a db.js for database connection

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Get all pending crops
exports.getPendingCrops = async (req, res) => {
    try {
        const [crops] = await db.query("SELECT * FROM crops WHERE status = 'pending'");
        res.json(crops);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending crops' });
    }
};

// Approve a crop
exports.approveCrop = async (req, res) => {
    const { cropId } = req.params;
    try {
        const [result] = await db.query(
            "UPDATE crops SET status = 'approved' WHERE id = ?",
            [cropId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        res.json({ message: 'Crop approved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve crop' });
    }
};

// Reject a crop
exports.rejectCrop = async (req, res) => {
    const { cropId } = req.params;
    try {
        const [result] = await db.query(
            "UPDATE crops SET status = 'rejected' WHERE id = ?",
            [cropId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        res.json({ message: 'Crop rejected successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject crop' });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Get dashboard summary
exports.getDashboardSummary = async (req, res) => {
    try {
        const [[usersCount]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
        const [[cropsCount]] = await db.query('SELECT COUNT(*) as totalCrops FROM crops');
        const [[ordersCount]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
        res.json({
            totalUsers: usersCount.totalUsers,
            totalCrops: cropsCount.totalCrops,
            totalOrders: ordersCount.totalOrders
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
};

// Get all crop submissions for admin review
exports.getCropSubmissions = async (req, res) => {
  try {
    console.log('🚀 Fetching all crop submissions for admin');
    
    // Join with users table to get farmer details
    const result = await db.query(
      `SELECT c.*, u.name as farmer_name, f.location as farm_location
       FROM crops c
       JOIN users u ON c.farmer_id = u.id
       LEFT JOIN farmers f ON u.id = f.user_id
       ORDER BY c.created_at DESC`
    );
    
    // Process images field
    const crops = result.rows.map(crop => ({
      ...crop,
      images: crop.images ? JSON.parse(crop.images) : []
    }));
    
    console.log(`✅ Found ${crops.length} crop submissions`);
    res.json(crops);
  } catch (err) {
    console.error('❌ Error fetching crop submissions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update crop status (approve/reject)
exports.updateCropStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🚀 Updating crop ${id} status to: ${status}`);
    
    // Validate status
    if (!['pending', 'approved', 'rejected', 'listed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update crop status
    await db.query(
      'UPDATE crops SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    
    console.log('✅ Crop status updated successfully');
    res.json({ message: 'Crop status updated successfully' });
  } catch (err) {
    console.error('❌ Error updating crop status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



