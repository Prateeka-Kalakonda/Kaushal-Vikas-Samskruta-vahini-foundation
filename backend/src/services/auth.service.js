const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// REGISTER
// Only called by admin internally
// ─────────────────────────────────────────
const register = async ({
  email,
  password,
  full_name,
  username,
  language = 'en',
  role = 'student',
  mobile_no,
}) => {

  // Check if email already exists
  const existingEmail = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingEmail.rows.length > 0) {
    throw new AppError('This email is already registered.', 409);
  }

  // Check if username already exists (if provided)
  if (username) {
    const existingUsername = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      throw new AppError('This username is already taken.', 409);
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS)
  );

  // Save new user
  const result = await db.query(
    `INSERT INTO users
      (email, password, full_name, username, language, role, mobile_no)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, username, full_name, role, language, mobile_no, created_at`,
    [email, hashedPassword, full_name, username || null, language, role, mobile_no || null]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// LOGIN
// Supports email or username
// Validates expected_role matches actual role
// ─────────────────────────────────────────
const login = async ({ identifier, password, expected_role }) => {

  // Determine if identifier is email or username
  const isEmail = identifier.includes('@');

  const query = isEmail
    ? `SELECT id, email, username, password, full_name, role, language, mobile_no
       FROM users
       WHERE email = $1 AND is_active = true`
    : `SELECT id, email, username, password, full_name, role, language, mobile_no
       FROM users
       WHERE username = $1 AND is_active = true`;

  const result = await db.query(query, [identifier]);

  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials. Please try again.', 401);
  }

  const user = result.rows[0];

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials. Please try again.', 401);
  }

  // Validate role if expected_role is provided
  // This handles the 3 portal buttons on the login page
  if (expected_role && user.role !== expected_role) {
    throw new AppError(
      `This account is not registered as a ${expected_role}. Please select the correct portal.`,
      403
    );
  }

  // Create JWT payload
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Access token
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  // Refresh token
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  // Never send password back
  delete user.password;

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────
const refreshToken = async (token) => {
  if (!token) {
    throw new AppError('Refresh token is required.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );

    return { accessToken: newAccessToken };
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }
};

module.exports = { register, login, refreshToken };