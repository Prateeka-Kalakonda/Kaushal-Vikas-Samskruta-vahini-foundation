const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// GET /api/v1/topics/:id/lessons
// Get all lessons inside a topic
router.get('/:id/lessons', subjectController.getLessonsByTopic);

module.exports = router;