const db = require('../db');

// Get farmer profile
exports.getProfile = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const result = await db.query(
      `SELECT 
         farmers.*, 
         users.username, 
         users.email, 
         users.role
       FROM farmers
       JOIN users ON farmers.user_id = users.id
       WHERE farmers.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      await db.query(
        `INSERT INTO farmers (user_id, phone, location, profile_pic, farm_size, crop_preference, bio, experience) 
         VALUES ($1, '', '', NULL, '', '', '', '')`,
        [req.user.userId]
      );

      const newResult = await db.query(
        `SELECT 
           farmers.*, 
           users.username, 
           users.email, 
           users.role
         FROM farmers
         JOIN users ON farmers.user_id = users.id
         WHERE farmers.user_id = $1`,
        [req.user.userId]
      );

      return res.json(newResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get farmer profile by ID
exports.getProfileById = async (req, res) => {
  try {
    console.log('👉 GET /farmer/profile called by:', req.user);
    const farmerId = req.params.id;
    const result = await db.query(
      `SELECT 
         farmers.*, 
         users.username, 
         users.email, 
         users.role
       FROM farmers
       JOIN users ON farmers.user_id = users.id
       WHERE farmers.user_id = $1`,
      [farmerId]
    );

    if (result.rows.length === 0) {
      await db.query(
        `INSERT INTO farmers (user_id, phone, location, profile_pic, farm_size, crop_preference, bio, experience) 
         VALUES ($1, '', '', NULL, '', '', '', '')`,
        [farmerId]
      );
      
      const newResult = await db.query(
        `SELECT 
           farmers.*, 
           users.username, 
           users.email, 
           users.role
         FROM farmers
         JOIN users ON farmers.user_id = users.id
         WHERE farmers.user_id = $1`,
        [farmerId]
      );
      return res.json(newResult.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update farmer profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('🛠️ Received body:', req.body);
    console.log('🖼️ Uploaded file:', req.file);

    const { phone, location, farm_size, crop_preference, bio, experience } = req.body;
    const profile_pic = req.file ? req.file.filename : null;

    const existing = await db.query('SELECT * FROM farmers WHERE user_id = $1', [req.user.userId]);

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO farmers 
         (user_id, phone, location, profile_pic, farm_size, crop_preference, bio, experience)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.user.userId,
          phone || '',
          location || '',
          profile_pic,
          farm_size || '',
          crop_preference || '',
          bio || '',
          experience || ''
        ]
      );
    } else {
      await db.query(
        `UPDATE farmers
         SET phone = $1,
             location = $2,
             profile_pic = COALESCE($3, profile_pic),
             farm_size = $4,
             crop_preference = $5,
             bio = $6,
             experience = $7
         WHERE user_id = $8`,
        [
          phone || '',
          location || '',
          profile_pic,
          farm_size || '',
          crop_preference || '',
          bio || '',
          experience || '',
          req.user.userId
        ]
      );
    }

    const updatedProfile = await db.query(
      `SELECT 
         farmers.*, 
         users.username, 
         users.email, 
         users.role
       FROM farmers
       JOIN users ON farmers.user_id = users.id
       WHERE farmers.user_id = $1`,
      [req.user.userId]
    );
    console.log('✅ Sending updated farmer profile:', updatedProfile.rows[0]);
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('❌ Error updating farmer profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update farmer profile by ID
exports.updateProfileById = async (req, res) => {
  try {
    const farmerId = req.params.id;
    const { phone, location, farm_size, crop_preference, bio, experience } = req.body;
    const profile_pic = req.file ? req.file.filename : null;

    const existingProfile = await db.query('SELECT * FROM farmers WHERE user_id = $1', [farmerId]);
    
    if (existingProfile.rows.length === 0) {
      await db.query(
        `INSERT INTO farmers (user_id, phone, location, profile_pic, farm_size, crop_preference, bio, experience) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [farmerId, phone || '', location || '', profile_pic || null, farm_size || '', crop_preference || '', bio || '', experience || '']
      );
    } else {
      await db.query(
        `UPDATE farmers 
         SET phone = $1, location = $2, profile_pic = COALESCE($3, profile_pic), farm_size = $4, crop_preference = $5, bio = $6, experience = $7
         WHERE user_id = $8`,
        [phone || '', location || '', profile_pic || null, farm_size || '', crop_preference || '', bio || '', experience || '', farmerId]
      );
    }

    const updatedProfile = await db.query(
      `SELECT 
         farmers.*, 
         users.username, 
         users.email, 
         users.role
       FROM farmers
       JOIN users ON farmers.user_id = users.id
       WHERE farmers.user_id = $1`,
      [farmerId]
    );
    console.log('📤 Sending updated farmer profile:', updatedProfile.rows[0]);
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get crops for farmer


exports.getCrops = async (req, res) => {
  console.log('🚀 [GET /api/farmer/crops] Request received at:', new Date().toISOString());
  const userId = parseInt(req.user?.userId, 10);
  console.log('🚀 Logged-in userId:', userId);
  if (!userId || isNaN(userId)) {
    console.log('❌ Invalid or missing userId');
    return res.status(401).json({ message: 'Unauthorized: Invalid user ID' });
  }
  try {
    console.log('🚀 Executing query for farmer_id:', userId);
    const result = await db.query('SELECT * FROM crops WHERE farmer_id = $1', [userId]);
    console.log('🚀 Query result:', result.rows);
    const crops = result.rows.map(row => ({
      ...row,
      images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
      farmerId: String(row.farmer_id),
      harvestDate: row.harvest_date
    }));
    console.log('🚀 Sending crops:', crops);
    res.json(crops);
  } catch (err) {
    console.error('❌ [GET /api/farmer/crops] Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add a crop
exports.addCrop = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      unit,
      harvest_date,
      price
    } = req.body;

    const images = req.files?.map(file => file.filename) || [];

    const result = await db.query(
      `INSERT INTO crops 
        (farmer_id, name, category, description, quantity, unit, harvest_date, price, images, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        req.user.userId,
        name,
        category,
        description,
        quantity,
        unit,
        harvest_date,
        price,
        JSON.stringify(images),
        'pending'
      ]
    );

    const newCrop = {
      ...result.rows[0],
      images: JSON.parse(result.rows[0].images || '[]'),
      farmerId: String(result.rows[0].farmer_id),
      harvestDate: result.rows[0].harvest_date
    };

    res.status(201).json({ message: 'Crop added successfully', crop: newCrop });
  } catch (err) {
    console.error('❌ Error adding crop:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a crop
exports.deleteCrop = async (req, res) => {
  try {
    const cropId = req.params.id;
    const result = await db.query('SELECT * FROM crops WHERE id = $1 AND farmer_id = $2', [cropId, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Crop not found or you do not have permission to delete it' });
    }

    await db.query('DELETE FROM crops WHERE id = $1', [cropId]);
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting crop:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get orders for farmer's crops
exports.getOrders = async (req, res) => {
  console.log('🚀 [GET /api/farmer/orders] Request received for userId:', req.user.userId);
  try {
    const userId = parseInt(req.user.userId, 10);
    console.log('🚀 Executing query for farmer_id:', userId);
    const result = await db.query(
      `SELECT orders.*, crops.name AS crop_name 
       FROM orders 
       JOIN crops ON orders.crop_id = crops.id 
       WHERE crops.farmer_id = $1`,
      [userId]
    );
    console.log('🚀 Query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ [GET /api/farmer/orders] Error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const cropStatsResult = await db.query(
      'SELECT COUNT(*) AS "cropCount", SUM(quantity) AS "totalQuantity" FROM crops WHERE farmer_id = $1',
      [req.user.userId]
    );
    const orderStatsResult = await db.query(
      `SELECT COUNT(*) AS "orderCount", SUM(orders.quantity) AS "totalOrdered" 
       FROM orders 
       JOIN crops ON orders.crop_id = crops.id 
       WHERE crops.farmer_id = $1`,
      [req.user.userId]
    );
    const cropStats = cropStatsResult.rows[0] || {};
    const orderStats = orderStatsResult.rows[0] || {};
    res.json({
      cropCount: parseInt(cropStats.cropCount) || 0,
      totalQuantity: parseInt(cropStats.totalQuantity) || 0,
      orderCount: parseInt(orderStats.orderCount) || 0,
      totalOrdered: parseInt(orderStats.totalOrdered) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};