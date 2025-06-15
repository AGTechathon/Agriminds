const pool = require('../db');               // our pg Pool instance
const bcrypt = require('bcrypt');            // for hashing passwords
const jwt = require('jsonwebtoken');         // for creating tokens

/**
 * POST /api/users/register
 *   Body: { username, password, role }
 */
const registerUser = async (req, res) => {
  try {
    const { username, password, role, name, phone, email } = req.body; // add email

    // 1️⃣ Check if the user already exists
    const checkUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2️⃣ Hash the incoming password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Insert the new user row in the `users` table
    const userResult = await pool.query(
      `INSERT INTO users (username, password, role, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [username, hashedPassword, role, email] // add email here
    );
    const userId = userResult.rows[0].id;

    // 4️⃣ If agent, create profile in the corresponding table
    if (role === 'agent_quality') {
      await pool.query(
        'INSERT INTO quality_agents (user_id, name, phone) VALUES ($1, $2, $3)',
        [userId, name || '', phone || '']
      );
    } else if (role === 'agent_delivery') {
      await pool.query(
        'INSERT INTO delivery_agents (user_id, name, phone) VALUES ($1, $2, $3)',
        [userId, name || '', phone || '']
      );
    }

    // 5️⃣ (Optional) Create profile for other roles...

    // 6️⃣ Respond with success (you can omit returning the password)
    return res
      .status(201)
      .json({ message: 'User registered successfully', userId });
  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/users/login
 *   Body: { username, password }
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Now find by email, not username
    const userResult = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.username,  // You used `name` in response, use `username` or change DB column
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
