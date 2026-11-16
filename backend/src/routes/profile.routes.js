const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// COMMON ROUTES (all roles)
// ─────────────────────────────────────────

// GET /api/v1/profile
router.get(
  '/',
  authenticate,
  profileController.getProfile
);

// PUT /api/v1/profile
router.put(
  '/',
  authenticate,
  profileController.updateProfile
);

// PUT /api/v1/profile/password
router.put(
  '/password',
  authenticate,
  profileController.changePassword
);

// ─────────────────────────────────────────
// STUDENT ONLY ROUTES
// ─────────────────────────────────────────

// PUT /api/v1/profile/student
router.put(
  '/student',
  authenticate,
  requireRole('student'),
  profileController.updateStudentProfile
);

// ─────────────────────────────────────────
// MENTOR ONLY ROUTES
// ─────────────────────────────────────────

// PUT /api/v1/profile/mentor
router.put(
  '/mentor',
  authenticate,
  requireRole('mentor'),
  profileController.updateMentorProfile
);

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// ─────────────────────────────────────────

// GET /api/v1/profile/users
router.get(
  '/users',
  authenticate,
  requireRole('admin'),
  profileController.getAllUsers
);

// GET /api/v1/profile/users/:id
router.get(
  '/users/:id',
  authenticate,
  requireRole('admin'),
  profileController.getUserById
);

module.exports = router;