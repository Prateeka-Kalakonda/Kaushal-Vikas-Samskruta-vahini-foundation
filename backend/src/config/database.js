const { Pool } = require('pg');

// Pool means a collection of database connections
// Instead of opening and closing a new connection for every request,
// we keep a pool of connections ready to use -- much faster

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 20,                    // maximum 20 connections at once
  idleTimeoutMillis: 30000,   // close connection if unused for 30 seconds
  connectionTimeoutMillis: 2000, // fail if cant connect within 2 seconds
});

// This runs automatically when a new connection is made
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

// This runs if the database crashes or disconnects
pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
  process.exit(-1); // stop the server if database is lost
});

// We export a query function so every file can talk to the database
// Usage anywhere in the app: db.query('SELECT * FROM users', [])
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};