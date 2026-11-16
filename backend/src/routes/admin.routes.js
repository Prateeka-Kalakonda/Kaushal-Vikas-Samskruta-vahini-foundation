const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// All admin routes are protected
// Must be logged in AND have admin role
const adminOnly = [authenticate, requireRole('admin')];

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────

// GET /api/v1/admin/dashboard
// Get platform statistics
router.get('/dashboard', ...adminOnly, adminController.getDashboardStats);

// ─────────────────────────────────────────
// SUBJECT MANAGEMENT
// ─────────────────────────────────────────

// PUT /api/v1/admin/subjects/:id
router.put('/subjects/:id', ...adminOnly, adminController.updateSubject);

// DELETE /api/v1/admin/subjects/:id
router.delete('/subjects/:id', ...adminOnly, adminController.deleteSubject);

// ─────────────────────────────────────────
// TOPIC MANAGEMENT
// ─────────────────────────────────────────

// POST /api/v1/admin/topics
router.post('/topics', ...adminOnly, adminController.createTopic);

// PUT /api/v1/admin/topics/:id
router.put('/topics/:id', ...adminOnly, adminController.updateTopic);

// DELETE /api/v1/admin/topics/:id
router.delete('/topics/:id', ...adminOnly, adminController.deleteTopic);

// ─────────────────────────────────────────
// CHAPTER MANAGEMENT
// ─────────────────────────────────────────

// POST /api/v1/admin/chapters
router.post('/chapters', ...adminOnly, adminController.createChapter);

// PUT /api/v1/admin/chapters/:id
router.put('/chapters/:id', ...adminOnly, adminController.updateChapter);

// DELETE /api/v1/admin/chapters/:id
router.delete('/chapters/:id', ...adminOnly, adminController.deleteChapter);

// ─────────────────────────────────────────
// CONTENT BLOCK MANAGEMENT
// ─────────────────────────────────────────

// POST /api/v1/admin/content-blocks
router.post('/content-blocks', ...adminOnly, adminController.createContentBlock);

// PUT /api/v1/admin/content-blocks/:id
router.put('/content-blocks/:id', ...adminOnly, adminController.updateContentBlock);

// DELETE /api/v1/admin/content-blocks/:id
router.delete('/content-blocks/:id', ...adminOnly, adminController.deleteContentBlock);

module.exports = router;