const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// POST /api/v1/auth/login
// Supports: email or username + expected_role
router.post('/login', authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refreshToken);

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Register is no longer public
// Only admin can create new accounts
// ─────────────────────────────────────────

// POST /api/v1/auth/register
router.post(
  '/register',
  authenticate,
  requireRole('admin'),
  authController.register
);

// ─────────────────────────────────────────
// PROTECTED ROUTES (all roles)
// ─────────────────────────────────────────

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getProfile);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;