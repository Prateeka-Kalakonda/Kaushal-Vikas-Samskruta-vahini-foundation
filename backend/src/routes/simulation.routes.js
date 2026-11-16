const express = require('express');
const router = express.Router();

const simulationController = require('../controllers/simulation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// SPECIFIC ROUTES FIRST
// Must come before dynamic /:id routes
// ─────────────────────────────────────────

// GET /api/v1/simulations/categories
// Science/Tech/Engineering/Arts/Maths with subjects
router.get(
  '/categories',
  simulationController.getSubjectsWithCategories
);

// GET /api/v1/simulations/topics/counts
// GET /api/v1/simulations/topics/counts?subject=physics
// Topics with simulation counts for experiments page
router.get(
  '/topics/counts',
  simulationController.getTopicsWithSimulationCounts
);

// GET /api/v1/simulations/history
// Student simulation history (protected)
router.get(
  '/history',
  authenticate,
  simulationController.getSimulationHistory
);

// GET /api/v1/simulations/topic/:topicId
// Simulations for a specific topic (experiments page)
router.get(
  '/topic/:topicId',
  simulationController.getSimulationsByTopic
);

// GET /api/v1/simulations/chapter/:chapterId
// Simulations for a specific chapter
router.get(
  '/chapter/:chapterId',
  simulationController.getSimulationsByChapter
);

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// ─────────────────────────────────────────

// POST /api/v1/simulations
// Create new simulation
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  simulationController.createSimulation
);

// PUT /api/v1/simulations/pages/:pageId
// Update a page section
router.put(
  '/pages/:pageId',
  authenticate,
  requireRole('admin'),
  simulationController.updateSimulationPage
);

// DELETE /api/v1/simulations/pages/:pageId
// Delete a page section
router.delete(
  '/pages/:pageId',
  authenticate,
  requireRole('admin'),
  simulationController.deleteSimulationPage
);

// PUT /api/v1/simulations/notes/:noteId
// Update a simulation note
router.put(
  '/notes/:noteId',
  authenticate,
  requireRole('admin'),
  simulationController.updateSimulationNote
);

// DELETE /api/v1/simulations/notes/:noteId
// Delete a simulation note
router.delete(
  '/notes/:noteId',
  authenticate,
  requireRole('admin'),
  simulationController.deleteSimulationNote
);

// ─────────────────────────────────────────
// ROUTES WITH /:id PARAMETER
// Must come AFTER all specific routes
// ─────────────────────────────────────────

// GET /api/v1/simulations/:id/notes
// Get notes for a simulation
router.get(
  '/:id/notes',
  simulationController.getSimulationNotes
);

// GET /api/v1/simulations/:id/pages
// Get page sections for a simulation
router.get(
  '/:id/pages',
  simulationController.getSimulationNotes
);

// POST /api/v1/simulations/:id/notes (admin only)
// Add note to a simulation
router.post(
  '/:id/notes',
  authenticate,
  requireRole('admin'),
  simulationController.addSimulationNote
);

// POST /api/v1/simulations/:id/pages (admin only)
// Add page section to a simulation
router.post(
  '/:id/pages',
  authenticate,
  requireRole('admin'),
  simulationController.addSimulationPage
);

// POST /api/v1/simulations/:id/session
// Save student simulation session
router.post(
  '/:id/session',
  authenticate,
  simulationController.saveSimulationSession
);

// ─────────────────────────────────────────
// GET ALL + GET BY ID
// Must be absolute last
// ─────────────────────────────────────────

// GET /api/v1/simulations
// All simulations with total count (latest first)
router.get('/', simulationController.getAllSimulations);

// GET /api/v1/simulations/:id
// Single simulation with full page content
// MUST BE LAST - catches everything
router.get('/:id', simulationController.getSimulationById);

module.exports = router;