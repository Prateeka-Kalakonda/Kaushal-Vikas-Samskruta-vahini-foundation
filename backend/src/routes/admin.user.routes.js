const express = require('express');
const router = express.Router();

const adminUserController = require('../controllers/admin.user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All routes here are admin only
const adminOnly = [authenticate, requireRole('admin')];

// ─────────────────────────────────────────
// GET ALL USERS BY ROLE
// ─────────────────────────────────────────

// GET /api/v1/admin/users/admins
// List all admins
router.get('/admins', ...adminOnly, adminUserController.getAllAdmins);

// GET /api/v1/admin/users/mentors
// List all mentors with profiles
router.get('/mentors', ...adminOnly, adminUserController.getAllMentors);

// GET /api/v1/admin/users/students
// List all students with profiles
router.get('/students', ...adminOnly, adminUserController.getAllStudents);

// ─────────────────────────────────────────
// MENTOR STUDENT ASSIGNMENTS
// ─────────────────────────────────────────

// GET /api/v1/admin/users/mentors/:mentorId/students
// Get all students assigned to a mentor
router.get(
  '/mentors/:mentorId/students',
  ...adminOnly,
  adminUserController.getMentorStudents
);

// GET /api/v1/admin/users/students/:studentId/mentor
// Get mentor assigned to a student
router.get(
  '/students/:studentId/mentor',
  ...adminOnly,
  adminUserController.getStudentMentor
);

// POST /api/v1/admin/users/assign-mentor
// Assign a mentor to a student
router.post(
  '/assign-mentor',
  ...adminOnly,
  adminUserController.assignMentorToStudent
);

// DELETE /api/v1/admin/users/unassign-mentor
// Remove mentor from student
router.delete(
  '/unassign-mentor',
  ...adminOnly,
  adminUserController.unassignMentorFromStudent
);

// ─────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────

// POST /api/v1/admin/users
// Create new user (admin/mentor/student)
router.post('/', ...adminOnly, adminUserController.createUser);

// PUT /api/v1/admin/users/:id
// Update any user
router.put('/:id', ...adminOnly, adminUserController.updateUser);

// PUT /api/v1/admin/users/:id/activate
// Reactivate a deactivated user
router.put(
  '/:id/activate',
  ...adminOnly,
  adminUserController.reactivateUser
);

// DELETE /api/v1/admin/users/:id
// Deactivate any user (soft delete)
router.delete('/:id', ...adminOnly, adminUserController.deactivateUser);

// PUT /api/v1/admin/users/:id/student-profile
router.put('/:id/student-profile', ...adminOnly, adminUserController.updateStudentProfileAsAdmin);

// PUT /api/v1/admin/users/:id/mentor-profile
router.put('/:id/mentor-profile', ...adminOnly, adminUserController.updateMentorProfileAsAdmin);

module.exports = router;