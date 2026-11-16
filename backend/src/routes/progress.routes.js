const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progress.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ─────────────────────────────────────────
// ALL ROUTES PROTECTED
// ─────────────────────────────────────────

// GET /api/v1/progress/mastery
// Get curriculum mastery score
// Must be BEFORE /:chapterId to avoid conflict
router.get('/mastery', authenticate, progressController.getCurriculumMastery);

// GET /api/v1/progress/continue-reading
router.get('/continue-reading', authenticate, progressController.getContinueReading);

// GET /api/v1/progress/completed
router.get('/completed', authenticate, progressController.getCompletedChapters);

// GET /api/v1/progress/chapter/:chapterId
router.get('/chapter/:chapterId', authenticate, progressController.getChapterProgress);

// POST /api/v1/progress
router.post('/', authenticate, progressController.updateProgress);

module.exports = router;