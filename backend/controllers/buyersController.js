const db = require('../db');

// Get buyer profile
exports.getProfile = async (req, res) => {
  try {
    console.log('👉 GET /buyer/profile called by:', req.user);
    const result = await db.query(
      `SELECT 
         buyers.*, 
         users.username, 
         users.email, 
         users.role
       FROM buyers
       JOIN users ON buyers.user_id = users.id
       WHERE buyers.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      // Create empty profile if not exists
      await db.query(
        `INSERT INTO buyers (user_id, contact_number, location, profile_pic, preferred_crops, purchase_frequency, delivery_preference, bio) 
         VALUES ($1, '', '', NULL, '', '', '', '')`,
        [req.user.userId]
      );
      
      const newResult = await db.query(
        `SELECT 
           buyers.*, 
           users.username, 
           users.email, 
           users.role
         FROM buyers
         JOIN users ON buyers.user_id = users.id
         WHERE buyers.user_id = $1`,
        [req.user.userId]
      );
      return res.json(newResult.rows[0]);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching buyer profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update buyer profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('🛠️ Received body:', req.body);
    console.log('🖼️ Uploaded file:', req.file);

    const { contact_number, location, preferred_crops, purchase_frequency, delivery_preference, bio } = req.body;
    const profile_pic = req.file ? req.file.filename : null;

    const existing = await db.query('SELECT * FROM buyers WHERE user_id = $1', [req.user.userId]);

    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO buyers 
         (user_id, contact_number, location, profile_pic, preferred_crops, purchase_frequency, delivery_preference, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.user.userId,
          contact_number || '',
          location || '',
          profile_pic,
          preferred_crops || '',
          purchase_frequency || '',
          delivery_preference || '',
          bio || ''
        ]
      );
    } else {
      await db.query(
        `UPDATE buyers
         SET contact_number = $1,
             location = $2,
             profile_pic = COALESCE($3, profile_pic),
             preferred_crops = $4,
             purchase_frequency = $5,
             delivery_preference = $6,
             bio = $7
         WHERE user_id = $8`,
        [
          contact_number || '',
          location || '',
          profile_pic,
          preferred_crops || '',
          purchase_frequency || '',
          delivery_preference || '',
          bio || '',
          req.user.userId
        ]
      );
    }

    const updatedProfile = await db.query(
      `SELECT 
         buyers.*, 
         users.username, 
         users.email, 
         users.role
       FROM buyers
       JOIN users ON buyers.user_id = users.id
       WHERE buyers.user_id = $1`,
      [req.user.userId]
    );
    
    console.log('✅ Sending updated buyer profile:', updatedProfile.rows[0]);
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('❌ Error updating buyer profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all listed crops for the marketplace
exports.getMarketplace = async (req, res) => {
  try {
    console.log('🚀 Fetching marketplace listings');
    
    // Get query parameters for filtering
    const { category, minPrice, maxPrice, searchTerm } = req.query;
    
    // Build the query with filters
    let query = `
      SELECT c.*, 
             u.name as farmer_name,
             f.location as farm_location
      FROM crops c
      JOIN users u ON c.farmer_id = u.id
      LEFT JOIN farmers f ON u.id = f.user_id
      WHERE c.status = 'listed'
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (category && category !== 'all') {
      queryParams.push(category);
      query += ` AND c.category = $${queryParams.length}`;
    }
    
    if (minPrice) {
      queryParams.push(minPrice);
      query += ` AND c.price >= $${queryParams.length}`;
    }
    
    if (maxPrice) {
      queryParams.push(maxPrice);
      query += ` AND c.price <= $${queryParams.length}`;
    }
    
    if (searchTerm) {
      queryParams.push(`%${searchTerm}%`);
      query += ` AND (c.name ILIKE $${queryParams.length} OR c.description ILIKE $${queryParams.length})`;
    }
    
    // Add sorting
    query += ` ORDER BY c.created_at DESC`;
    
    const result = await db.query(query, queryParams);
    
    // Process the images field if needed
    const crops = result.rows.map(crop => ({
      ...crop,
      images: crop.images ? JSON.parse(crop.images) : []
    }));
    
    console.log(`✅ Found ${crops.length} crops for marketplace`);
    res.json(crops);
  } catch (err) {
    console.error('❌ Error fetching marketplace:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    console.log('🚀 Placing order:', req.body);
    const { cropId, quantity, paymentMethod, deliveryAddress } = req.body;
    const buyerId = req.user.userId;
    
    // Validate inputs
    if (!cropId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid order details' });
    }
    
    // Get crop details to calculate total price
    const cropResult = await db.query(
      'SELECT * FROM crops WHERE id = $1 AND status = $2',
      [cropId, 'listed']
    );
    
    if (cropResult.rows.length === 0) {
      return res.status(404).json({ message: 'Crop not found or not available' });
    }
    
    const crop = cropResult.rows[0];
    const totalPrice = crop.price * quantity;
    
    // Calculate advance amount if applicable
    const advanceAmount = paymentMethod === 'advance' ? totalPrice * 0.3 : 0;
    
    // Create order
    const orderResult = await db.query(
      `INSERT INTO orders 
       (crop_id, buyer_id, quantity, total_price, status, payment_status, advance_amount, delivery_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        cropId, 
        buyerId, 
        quantity, 
        totalPrice, 
        'pending', 
        advanceAmount > 0 ? 'partially-paid' : 'unpaid',
        advanceAmount,
        deliveryAddress || ''
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Add crop details to response
    order.cropName = crop.name;
    order.cropDescription = crop.description;
    order.cropUnit = crop.unit;
    
    console.log('✅ Order placed successfully:', order);
    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get buyer's orders
exports.getBuyerOrders = async (req, res) => {
    const buyerId = parseInt(req.user.id); // Ensure integer
    try {
      console.log(`🚀 Fetching orders for buyer: ${buyerId}`);
      const result = await db.query(
        `SELECT o.*, c.name as crop_name, c.unit, c.price
         FROM orders o
         LEFT JOIN crops c ON o.crop_id = c.id
         WHERE o.buyer_id = $1
         ORDER BY o.created_at DESC`,
        [buyerId]
      );
      console.log(`✅ Found ${result.rows.length} orders`);
      res.json(result.rows.map(order => ({
        ...order,
        id: String(order.id),
        crop_id: order.crop_id ? String(order.crop_id) : null,
        buyer_id: String(order.buyer_id),
        created_at: order.created_at ? new Date(order.created_at).toISOString() : null,
      })));
    } catch (err) {
      console.error(`❌ Error fetching buyer orders:`, err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  exports.cancelOrder = async (req, res) => {
    const buyerId = parseInt(req.user.id);
    const orderId = parseInt(req.params.orderId);
    try {
      console.log(`🚀 Cancelling order ${orderId} for buyer: ${buyerId}`);
      const checkResult = await db.query(
        'SELECT status, buyer_id FROM orders WHERE id = $1',
        [orderId]
      );
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      const order = checkResult.rows[0];
      if (order.buyer_id !== buyerId) {
        return res.status(403).json({ message: 'Unauthorized to cancel this order' });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending orders can be cancelled' });
      }
      const result = await db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['cancelled', orderId]
      );
      console.log(`✅ Cancelled order ${orderId} for buyer ${buyerId}`);
      res.json({ message: 'Order cancelled successfully', order: result.rows[0] });
    } catch (err) {
      console.error(`❌ Error cancelling order:`, err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

// Get buyer dashboard (aggregate stats)
exports.getDashboard = async (req, res) => {
    try {
        // Total confirmed/delivered orders and total spent
        const confirmedResult = await db.query(
            `SELECT COUNT(*) AS "totalOrders", 
                    COALESCE(SUM(total_price), 0) AS "totalSpent"
             FROM orders 
             WHERE buyer_id = $1 AND status IN ('confirmed', 'delivered')`,
            [req.user.userId]
        );
        const { totalOrders, totalSpent } = confirmedResult.rows[0];

        // Pending orders count
        const pendingResult = await db.query(
            `SELECT COUNT(*) AS "pendingOrders"
             FROM orders 
             WHERE buyer_id = $1 AND status = 'pending'`,
            [req.user.userId]
        );
        const { pendingorders: pendingOrders } = pendingResult.rows[0];

        // Recent orders (limit 5, with crop name)
        const recentResult = await db.query(
            `SELECT o.id AS order_id, c.name AS crop_name, o.quantity, o.total_price, o.status
             FROM orders o
             JOIN crops c ON o.crop_id = c.id
             WHERE o.buyer_id = $1
             ORDER BY o.created_at DESC
             LIMIT 5`,
            [req.user.userId]
        );

        res.json({
            totalOrders: Number(totalOrders),
            totalSpent: Number(totalSpent),
            pendingOrders: Number(pendingOrders),
            recentOrders: recentResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};