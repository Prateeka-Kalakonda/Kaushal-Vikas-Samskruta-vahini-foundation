const express = require('express');
const router = express.Router();

const experimentController = require('../controllers/experiment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// IMPORTANT: specific routes must come
// BEFORE dynamic routes like /:id
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Placed first to avoid conflict with /:id
// ─────────────────────────────────────────

// POST /api/v1/experiments
// Create new experiment
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  experimentController.createExperiment
);

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// GET /api/v1/experiments
// Get all experiments
router.get('/', experimentController.getAllExperiments);

// GET /api/v1/experiments/subject/:subjectId
// Get experiments for a subject
// Must be BEFORE /:id
router.get(
  '/subject/:subjectId',
  experimentController.getExperimentsBySubject
);

// GET /api/v1/experiments/chapter/:chapterId
// Get experiments for a chapter
// Must be BEFORE /:id
router.get(
  '/chapter/:chapterId',
  experimentController.getExperimentsByChapter
);

// GET /api/v1/experiments/:id
// Get single experiment with full details
// Must be LAST because it catches everything
router.get('/:id', experimentController.getExperimentById);

// PUT /api/v1/experiments/:id
// Update experiment (admin only)
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  experimentController.updateExperiment
);

// DELETE /api/v1/experiments/:id
// Delete experiment (admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  experimentController.deleteExperiment
);

module.exports = router;