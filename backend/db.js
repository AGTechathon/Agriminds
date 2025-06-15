// backend/db.js
const { Pool } = require('pg');
require('dotenv').config(); // ← Must be here, at the top

// (Optional) DEBUG: Print out what env variable we see
console.log('▶︎ DATABASE_URL is:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
