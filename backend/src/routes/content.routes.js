const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject.controller');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// GET /api/v1/chapters/:id
// Get a chapter with all its content blocks
router.get('/:id', subjectController.getChapterWithContent);

module.exports = router;