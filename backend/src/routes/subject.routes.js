const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// No token needed -- anyone can read content
// ─────────────────────────────────────────

// GET /api/v1/subjects
// Get all subjects (Physics, Maths, Chemistry)
router.get('/', subjectController.getAllSubjects);

// GET /api/v1/subjects/:slug
// Get single subject by slug e.g. /subjects/physics
router.get('/:slug', subjectController.getSubjectBySlug);

// GET /api/v1/subjects/:slug/topics
// Get all topics for a subject e.g. /subjects/physics/topics
router.get('/:slug/topics', subjectController.getTopicsBySubject);

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Must be logged in AND be an admin
// ─────────────────────────────────────────

// POST /api/v1/subjects
// Create a new subject
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  subjectController.createSubject
);

module.exports = router;