const express = require('express');
const router = express.Router();

const mentorController = require('../controllers/mentor.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Placed first to avoid conflict with /:id
// ─────────────────────────────────────────

// GET /api/v1/mentors/stats
router.get(
  '/stats',
  authenticate,
  requireRole('admin'),
  mentorController.getMentorStats
);

// GET /api/v1/mentors/performance
// Admin sees ALL mentors with performance metrics
router.get(
  '/performance',
  authenticate,
  requireRole('admin'),
  mentorController.getMentorPerformanceOverview
);

// GET /api/v1/mentors/performance/:mentorId
// Admin sees ONE mentor's detailed performance
router.get(
  '/performance/:mentorId',
  authenticate,
  requireRole('admin'),
  mentorController.getMentorPerformanceDetail
);

// PUT /api/v1/mentors/assign/:userId
router.put(
  '/assign/:userId',
  authenticate,
  requireRole('admin'),
  mentorController.assignMentorRole
);

// ─────────────────────────────────────────
// MENTOR ONLY ROUTES
// ─────────────────────────────────────────

// POST /api/v1/mentors/profile
router.post(
  '/profile',
  authenticate,
  requireRole('mentor'),
  mentorController.createMentorProfile
);

// GET /api/v1/mentors/my-students
// Mentor sees their own assigned students
router.get(
  '/my-students',
  authenticate,
  requireRole('mentor'),
  mentorController.getMyStudents
);

// GET /api/v1/mentors/my-students/:studentId/progress
// Mentor sees detailed progress of one assigned student
router.get(
  '/my-students/:studentId/progress',
  authenticate,
  requireRole('mentor'),
  mentorController.getStudentProgressForMentor
);

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// GET /api/v1/mentors
router.get('/', mentorController.getAllMentors);

// GET /api/v1/mentors/subject/:subject
router.get('/subject/:subject', mentorController.getMentorsBySubject);

// PUT /api/v1/mentors/:id/verify
router.put(
  '/:id/verify',
  authenticate,
  requireRole('admin'),
  mentorController.verifyMentor
);

// PUT /api/v1/mentors/:id/unverify
router.put(
  '/:id/unverify',
  authenticate,
  requireRole('admin'),
  mentorController.unverifyMentor
);

// GET /api/v1/mentors/:id
// Must be LAST — catches everything
router.get('/:id', mentorController.getMentorById);

module.exports = router;