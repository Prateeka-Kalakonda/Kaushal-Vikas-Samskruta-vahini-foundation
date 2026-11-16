const authService = require('../services/auth.service');
const { success, AppError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// REGISTER
// POST /api/v1/auth/register
// Now only called internally by admin APIs
// ─────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    full_name,
    username,
    language,
    role,
    mobile_no,
  } = req.body;

  const user = await authService.register({
    email,
    password,
    full_name,
    username,
    language,
    role,
    mobile_no,
  });

  return success(res, { user }, 'Account created successfully!', 201);
});

// ─────────────────────────────────────────
// LOGIN
// POST /api/v1/auth/login
// Supports email or username
// Supports expected_role for portal selection
// ─────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { identifier, email, password, expected_role } = req.body;

  // Support both old format (email) and new format (identifier)
  const loginIdentifier = identifier || email;

  if (!loginIdentifier) {
    throw new AppError('Please provide your email or username.', 400);
  }

  if (!password) {
    throw new AppError('Please provide your password.', 400);
  }

  const result = await authService.login({
    identifier: loginIdentifier,
    password,
    expected_role,
  });

  return success(res, result, 'Login successful!');
});

// ─────────────────────────────────────────
// REFRESH TOKEN
// POST /api/v1/auth/refresh
// ─────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  return success(res, result, 'Token refreshed successfully!');
});

// ─────────────────────────────────────────
// GET PROFILE
// GET /api/v1/auth/me
// ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  return success(res, { user: req.user }, 'Profile fetched successfully!');
});

// ─────────────────────────────────────────
// LOGOUT
// POST /api/v1/auth/logout
// ─────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  return success(res, null, 'Logged out successfully!');
});

module.exports = { register, login, refreshToken, getProfile, logout };